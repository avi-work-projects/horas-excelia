<?php
// CLI only; draft update, never an emission/cron command.
umask(0077);
chdir('/var/www/html'); require 'vendor/autoload.php';
define('FS_FOLDER','/var/www/html'); require 'config.php';
FacturaScripts\Core\Kernel::init(); FacturaScripts\Core\Plugins::init();
use FacturaScripts\Core\Where;
use FacturaScripts\Core\Base\DataBase;
use FacturaScripts\Core\Lib\Calculator;
use FacturaScripts\Dinamic\Model\FacturaCliente;
use FacturaScripts\Dinamic\Model\ReciboCliente;
use FacturaScripts\Dinamic\Model\VerifactuRegistroFactura;
function need($ok,$message){if(!$ok)throw new RuntimeException($message);}
function same($obj,$expected){foreach($expected as $key=>$value)need(($obj->$key??null)==$value,'Document changed: '.$key);}
function money($value){return (int)round(((float)$value)*100);}
$db=new DataBase();$started=false;
try {
 $p=json_decode(stream_get_contents(STDIN),true,512,JSON_THROW_ON_ERROR);
 $id=(int)$p['docid'];need($id>0,'Invalid document');
 need(preg_match('/^[a-f0-9]{64}$/',$p['hash'])===1,'Invalid hash');
 $lock=fopen('/tmp/gestify-emission.lock','c');need(flock($lock,LOCK_EX|LOCK_NB),'Concurrent fiscal operation');
 need($db->connect(),'Cannot connect database');
 need($db->beginTransaction(),'Cannot start transaction');$started=true;
 $db->select('SELECT idfactura FROM facturascli WHERE idfactura='.$id.' FOR UPDATE');
 $doc=new FacturaCliente();need($doc->load($id),'Document absent');
 need((int)$doc->idestado===10 && $doc->editable && !$doc->vf_sent,'Only editable unissued drafts');
 need(count(VerifactuRegistroFactura::all([Where::eq('idfactura',$id)]))===0,'Fiscal record exists');
 same($doc,$p['expected']['raw_doc']);
 $old=$doc->getLines();need(count($old)===count($p['expected']['lines']),'Line count changed');
 foreach($old as $i=>$line)same($line,$p['expected']['lines'][$i]);
 $receipts=ReciboCliente::all([Where::eq('idfactura',$id)],['idrecibo'=>'ASC']);
 need(count($receipts)===1 && !$receipts[0]->pagado,'Receipt is not editable');
 same($receipts[0],$p['expected']['receipts'][0]);
 need(count($p['lines'])>0 && count($p['lines'])<=100,'Invalid lines');
 $lines=[];
 foreach($p['lines'] as $i=>$input){
  need((float)$input['cantidad']>0 && (float)$input['pvpunitario']>0,'Invalid amounts');
  need($input['codimpuesto']==='IVA21' && (float)$input['irpf']===15.0,'Unsupported tax');
  $line=$old[$i]??$doc->getNewLine();
  foreach(['descripcion','cantidad','pvpunitario','codimpuesto','irpf'] as $field)$line->$field=$input[$field];
  $line->iva=21;$lines[]=$line;
 }
 for($i=count($lines);$i<count($old);$i++)need($old[$i]->delete(),'Cannot remove obsolete draft line');
 $doc->observaciones=$p['observations'];
 need(Calculator::calculate($doc,$lines,true),'Calculation/save failed');
 foreach(['neto'=>'baseCents','totaliva'=>'vatCents','totalirpf'=>'withholdingCents','total'=>'totalCents'] as $field=>$key)
  need(money($doc->$field)===$p['totals'][$key],'Calculated total differs');
 $receipts=ReciboCliente::all([Where::eq('idfactura',$id)],['idrecibo'=>'ASC']);
 need(count($receipts)===1 && !$receipts[0]->pagado,'Receipt changed');
 $receipts[0]->importe=$doc->total;$receipts[0]->vencimiento=$p['due_date'];
 need($receipts[0]->save(),'Receipt save failed');
 need((int)$doc->idestado===10 && !$doc->vf_sent,'Unexpected issuance');
 need(count(VerifactuRegistroFactura::all([Where::eq('idfactura',$id)]))===0,'Unexpected fiscal record');
 need($db->commit(),'Commit failed');$started=false;
 echo json_encode(['ok'=>true,'docid'=>$id,'number'=>$doc->codigo]);
} catch(Throwable $e){
 if($started)$db->rollback();
 fwrite(STDERR,$e->getMessage());exit(1);
}
