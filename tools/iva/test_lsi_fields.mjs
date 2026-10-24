import test from 'node:test';
import assert from 'node:assert/strict';
import {identity,receiptDate} from './lsi_fields.mjs';
test('Spanish VAT prefix is normalized without replacing supplier',()=>{
 assert.deepEqual(identity({tax_id:'ESB12345678',party:'Supplier'}),{type:null,country:null,id:'B12345678',name:'Supplier'});
});
test('foreign identity needs explicit type, country and source',()=>{
 assert.throws(()=>identity({number:'A',tax_id:'123456789',legacy_tax_id:'B12345678'}));
 const r={tax_id:'123456789',party:'Foreign',lsi_identity:{type:'04',country:'PT',id:'123456789',source:'invoice'}};
 assert.equal(identity(r).country,'PT');
});
test('receipt is never inferred from issue date or old registration field',()=>{
 assert.throws(()=>receiptDate({date:'2026-04-14',registration_date:'2026-04-14'}));
});
test('receipt rejects impossible and earlier dates',()=>{
 for(const receipt_date of ['2026-02-30','2026-04-13'])
  assert.throws(()=>receiptDate({date:'2026-04-14',receipt_date,receipt_date_source:'export'}));
 assert.equal(receiptDate({date:'2026-04-14',receipt_date:'2026-04-16',receipt_date_source:'export'}),'2026-04-16');
});
