// Explicit documentary identities and receipt dates for the offline LSI adapter.
// Never substitute an old demo supplier or infer receipt from invoice issue date.
export function identity(record) {
 const id=(record.tax_id||'').trim().toUpperCase();
 const national=id.replace(/^ES/, '');
 if (/^(?:[0-9]{8}[A-Z]|[A-Z][0-9]{7}[A-Z0-9])$/.test(national))
  return {type:null,country:null,id:national,name:record.party};
 const foreign=record.lsi_identity;
 if(!foreign || !['02','03','04','05','06'].includes(foreign.type) ||
    !/^[A-Z]{2}$/.test(foreign.country||'') ||
    !/^[A-Z0-9]{1,20}$/.test(foreign.id||'') || !foreign.source)
  throw Error(`Explicit documented foreign identity required: ${record.number}`);
 return {...foreign,name:record.party};
}

export function receiptDate(record) {
 const value=record.receipt_date;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||'') ||
    !Number.isFinite(Date.parse(value+'T00:00:00Z')) ||
    new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value ||
    !record.receipt_date_source || value<record.date ||
    (record.operation_date && value<record.operation_date))
  throw Error(`Documented receipt date required: ${record.number}`);
 return value;
}
