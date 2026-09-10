## MacroDroid — creación de alarmas

> **Estado (2026-08-21):** funcionando. La macro ejecuta **Java**, no
> JavaScript (Rhino). El PWA no cambia: sigue llamando al webhook
> `…/generar_alarma1?alarmH=&alarmM=&alarmMsg=&alarmDays=` y registrando la
> alarma en `excelia-alarms-v1` antes del fetch.

### Crear alarma — script Java en producción (macro `generar_alarma1`)

```java
String hStr    = "{v=alarmH}";
String mStr    = "{v=alarmM}";
String msg     = "{v=alarmMsg}";
String daysStr = "{v=alarmDays}";

int h = 9;
int m = 0;
try { h = Integer.parseInt(hStr.trim()); } catch (Exception e) { h = 9; }
try { m = Integer.parseInt(mStr.trim()); } catch (Exception e) { m = 0; }
if (h < 0 || h > 23) h = 9;
if (m < 0 || m > 59) m = 0;
if (msg == null || msg.length() == 0 || msg.indexOf('{') >= 0) msg = "Alarma";

final android.content.Context ctx = android.app.ActivityThread.currentApplication();

android.content.Intent it = new android.content.Intent("android.intent.action.SET_ALARM");
it.putExtra("android.intent.extra.alarm.HOUR", h);
it.putExtra("android.intent.extra.alarm.MINUTES", m);
it.putExtra("android.intent.extra.alarm.MESSAGE", msg);
it.putExtra("android.intent.extra.alarm.SKIP_UI", true);
it.putExtra("android.intent.extra.alarm.VIBRATE", true);

if (daysStr != null && daysStr.length() > 0 && daysStr.indexOf('{') < 0) {
  java.util.ArrayList<Integer> dias = new java.util.ArrayList<Integer>();
  String[] partes = daysStr.split(",");
  for (int i = 0; i < partes.length; i++) {
    try {
      int dv = Integer.parseInt(partes[i].trim());
      if (dv >= 1 && dv <= 7) dias.add(Integer.valueOf(dv));
    } catch (Exception e) { }
  }
  if (dias.size() > 0) it.putIntegerArrayListExtra("android.intent.extra.alarm.DAYS", dias);
}

it.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

String res;
try {
  ctx.startActivity(it);
  res = "Alarma " + h + ":" + (m < 10 ? "0" + m : "" + m) + " (implicito)";
} catch (Exception e1) {
  res = "FALLO: ningun reloj acepto SET_ALARM (" + h + ":" + m + ")";
  String[] pkgs = { "com.android.BBKClock", "com.vivo.alarmclock",
                    "com.google.android.deskclock", "com.android.deskclock" };
  for (int i = 0; i < pkgs.length; i++) {
    try {
      it.setPackage(pkgs[i]);
      ctx.startActivity(it);
      res = "Alarma " + h + ":" + (m < 10 ? "0" + m : "" + m) + " -> " + pkgs[i];
      break;
    } catch (Exception e2) { }
  }
}

final String txt = res;
try {
  new android.os.Handler(android.os.Looper.getMainLooper()).post(new Runnable() {
    public void run() {
      android.widget.Toast.makeText(ctx, txt, android.widget.Toast.LENGTH_LONG).show();
    }
  });
} catch (Exception e) { }

System.out.println(res);
```

Tres cosas que hacen que funcione y que es fácil cargarse:

1. **`putExtra` con `int` de Java**, no con un número suelto: Vivo exige `int`.
   Este es el mismo problema que en Rhino obligaba a `new java.lang.Integer()`.
2. **`startActivity(it)`**: sin esa línea el intent se construye y no se lanza,
   y el log de MacroDroid parece correcto. Ya pasó una vez.
3. **Plan B por paquete**: si el intent implícito no lo coge nadie, prueba uno a
   uno con los relojes de Vivo y de Google. Y avisa con un Toast, que es lo que
   permite depurar sin cable.

Los días van con las constantes de `java.util.Calendar` (1=Domingo … 7=Sábado).
`androidDay=jsDay+1` en `js/init.js` ya manda ese valor: el script **no** debe
volver a convertirlo.

### Eliminar/desactivar alarma (DISMISS) — intent DISMISS_ALARM
El intent `DISMISS_ALARM` con `SEARCH_MODE=android.label` **SÍ funciona en Vivo** para borrar alarmas por nombre. Confirmado en pruebas reales.

```javascript
// MacroDroid — Macro: apagar_alarmas
// Parámetro recibido del PWA: {v=names} → label exacto de la alarma a borrar
var nombre = '{v=names}';

var intent = new android.content.Intent("android.intent.action.DISMISS_ALARM");
intent.putExtra("android.intent.extra.alarm.SEARCH_MODE", "android.label");
intent.putExtra("android.intent.extra.alarm.MESSAGE", nombre);
intent.putExtra("android.intent.extra.alarm.SKIP_UI", true);
intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
var ctx = android.app.ActivityThread.currentApplication();
ctx.startActivity(intent);
```

**⚠️ Requisito**: el `MESSAGE` debe coincidir exactamente (case-sensitive) con el label con el que se creó la alarma.
**Nota**: Esto solo descarta/apaga la alarma activa, no la elimina de la lista del reloj. Para eliminarla completamente puede requerirse interacción manual.

La "eliminación" desde el PWA sigue siendo:
1. Borra del registro `excelia-alarms-v1` (siempre, inmediato)
2. Llama al webhook MacroDroid `/apagar_alarmas?names=label` → ejecuta el script DISMISS_ALARM
