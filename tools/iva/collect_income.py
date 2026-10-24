"""Collect supported invoice PDF layouts into a private ledger input, fail closed."""
import argparse
from datetime import datetime
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import re
from pypdf import PdfReader
from ledger import quarter, validate


def amount(text):
    return format(Decimal(text.replace('.', '').replace(',', '.')), '.2f')


def parse_income(text, profile):
    if profile['customer_tax_id'] not in text:
        raise ValueError('Customer identity requires review')
    def one(pattern):
        hits=re.findall(pattern,text,re.M)
        if len(hits)!=1:
            raise ValueError('Invoice field missing or ambiguous: '+pattern)
        return hits[0]
    number=one(r'N[ºo] factura\s+(\S+)')
    issue=datetime.strptime(one(r'^Fecha\s+(\d{2}-\d{2}-\d{4})'),'%d-%m-%Y').date().isoformat()
    bases=re.findall(r'(?:Total bases imponibles|Base imponible(?: 21%)?)\s+([\d.,]+)',text)
    if not bases or len({amount(v) for v in bases})!=1:
        raise ValueError('Multiple tax bases require review')
    # This adapter supports only the previously inspected single-rate layouts.
    if set(re.findall(r'(?<!\d)(\d+)%', text))-{'21','15'}:
        raise ValueError('Unsupported rate')
    return dict(kind='income',number=number,date=issue,period=quarter(issue),
        party=profile['customer'],tax_id=profile['customer_tax_id'],base=amount(bases[0]),
        vat=amount(one(r'(?:Total IVA|^IVA)\s+([\d.,]+)')),
        withholding=amount(one(r'IRPF 15%\s+-?([\d.,]+)')),
        total=amount(one(r'^(?:Total a cobrar|Total)\s+([\d.,]+)')),
        include=True,mapping='domestic21',rate='21.00',pages='1',
        note='PDF original; periodo por expedición conforme al criterio histórico, sin revisión fiscal nueva')


def collect(data,root,folder,profile):
    root=Path(root).resolve();folder=(root/folder).resolve()
    if not folder.is_relative_to(root):raise ValueError('Folder outside document root')
    rows=[]
    for p in sorted(folder.glob('*.pdf')):
        pages=PdfReader(p).pages
        if len(pages)!=1:raise ValueError('Review multi-page income invoice before importing')
        r=parse_income(pages[0].extract_text() or '',profile)
        r.update(source=p.relative_to(root).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest())
        rows.append(r)
    if not rows:raise ValueError('No income invoices found')
    data['records']=[r for r in data['records'] if r['kind']!='income']+rows
    data['records'].sort(key=lambda r:(r['date'],r['kind'],r['number']))
    validate(data['records'],data['year'])
    documents={r['source']:r for r in data.get('documents',[])}
    for r in rows:
        documents[r['source']]={k:r[k] for k in ('source','sha256')}
        documents[r['source']].update(pages=1,status='Con registro en libro')
    data['documents']=sorted(documents.values(),key=lambda r:r['source'])
    data.pop('calculations',None)
    return data


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    for name in ('input','root','folder','profile','output'):p.add_argument('--'+name,required=True)
    a=p.parse_args()
    data=collect(json.loads(Path(a.input).read_text(encoding='utf-8-sig')),a.root,a.folder,json.loads(Path(a.profile).read_text(encoding='utf-8-sig')))
    Path(a.output).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Income records:',sum(r['kind']=='income' for r in data['records']))
