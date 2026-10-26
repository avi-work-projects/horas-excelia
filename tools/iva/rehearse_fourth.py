"""Create a separate fictional 4T case for OPEN, never the real annual book."""
import argparse
import hashlib
import json
from pathlib import Path
from export_303_test import load_design, serialize
from prepare_open import prepare


def build_case(root):
    root.mkdir(parents=True, exist_ok=True)
    source=root/'SUPUESTO_FICTICIO.txt'
    source.write_text('ENSAYO FICTICIO: ingreso base1000 IVA210; gasto base100 IVA21. No son operaciones reales. Perfil sin ajustes y obligado a390 solo como supuesto de prueba.',encoding='utf-8')
    sha=hashlib.sha256(source.read_bytes()).hexdigest()
    def row(kind,number,base,vat,total):
        return dict(kind=kind,number=number,party='SUPUESTO FICTICIO',date='2026-12-01',period='4T',
                    base=base,vat=vat,withholding='0.00',total=total,include=True,mapping='domestic21',
                    rate='21.00',source=source.name,sha256=sha)
    data=dict(year=2026,as_of='2026-12-31',records=[row('income','ENSAYO-I','1000.00','210.00','1210.00'),
              row('expense','ENSAYO-G','100.00','21.00','121.00')],
              coverage={q:'SUPUESTO FICTICIO, no libro real' for q in ('1T','2T','3T','4T')},
              profiles={'4T':{'remaining_boxes_confirmed_zero':True}})
    profile=dict(year=2026,period='4T',preparation_kind='new_period',period_complete=True,
                 source=source.name,source_sha256=sha,general_regime=True,simplified_regime=False,
                 joint_return=False,cash_accounting=False,recipient_cash_accounting=False,
                 insolvency=False,voluntary_sii=False,state_percentage='100.00',
                 annual_closing=dict(reviewed=True,exempt_390=False,special_prorata_option=False,
                 special_prorata_revocation=False,annual_deduction_adjustment=False,
                 investment_goods_adjustment=False,foral_annual_adjustment=False))
    for name,obj in [('libro_ficticio.json',data),('perfil_ficticio.json',profile)]:
        (root/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
    return data,profile


def main():
    p=argparse.ArgumentParser(description=__doc__)
    for name in ('output-dir','identity','design','payment'):
        p.add_argument('--'+name,type=Path,required=True)
    a=p.parse_args()
    if a.output_dir.exists() and any(a.output_dir.iterdir()):
        p.error('Use a new empty rehearsal directory; never overwrite real data')
    data,profile=build_case(a.output_dir)
    checked=prepare(data,profile,a.output_dir)
    read=lambda path:json.loads(path.read_text(encoding='utf-8-sig'))
    design=load_design(a.design)
    for mode,payment in [('I',None),('U',read(a.payment))]:
        raw=serialize(design,checked['expected_boxes'],read(a.identity),2026,'4T',payment,profile['annual_closing'])
        (a.output_dir/f'303_2026_4T_{mode}_FICTICIO_ENSAYO.txt').write_bytes(raw)
    (a.output_dir/'resultado_esperado.json').write_text(json.dumps(checked,indent=2),encoding='utf-8')
    print('Fictional 4T files generated; expected result189.00; not validated in OPEN or filed.')


if __name__=='__main__':main()
