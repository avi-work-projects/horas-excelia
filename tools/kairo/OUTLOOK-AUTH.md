# Reingreso de Outlook con secreto privado

Preparado el 29/10/2026 para el Chromium privado existente de Kairo. Reutiliza
ese perfil y el bloqueo de las operaciones de horas. No abre otro perfil ni
crea, actualiza, programa o envía mensajes.

## Introducir o sustituir la contraseña

En PowerShell del mini, ejecutar el script de este repositorio:

```powershell
& 'C:\Users\Angel\.codex\worktrees\mapa-visual-piloto\horas-excelia\tools\kairo\set-outlook-secret.ps1'
```

El script conecta por SSH con la clave existente y abre un terminal en Kairo.
Pide la contraseña dos veces mediante `getpass`: no se muestran caracteres.
No pegarla en el chat ni añadirla al comando. No se transmite a Gestify.
`sudo` utiliza la configuración ya existente del propietario.

La utilidad instalada `/usr/local/libexec/gestify-outlook-secret` envía el valor
directamente por stdin a `systemd-creds encrypt --with-key=host`. Guarda solo
el cifrado, con modo 600, en
`/etc/credstore.encrypted/gestify-outlook-password`. El secreto no pasa por
argumentos, variables de entorno, código, logs ni archivos intermedios en claro.
La clave del host la administra systemd; una reinstalación sin ella requiere
volver a introducir la contraseña.

Guardar el secreto habilita y arranca `gestify-outlook-auth.service`. Se usa
`LoadCredentialEncrypted`, con el proceso ejecutándose como `angel`; systemd
entrega la credencial en su directorio privado de ejecución. El servicio y el
provisionador desactivan los volcados de memoria.

Una sesión ya autenticada no se cierra para validar la contraseña. El valor se
utiliza cuando haga falta volver a entrar. Por tanto, «guardada» acredita el
almacenamiento, no una comprobación de contraseña contra Microsoft.

## Qué hace el recuperador

- Observa cada 15 segundos el estado local del navegador mediante CDP en
  loopback. No navega por carpetas ni hace un barrido del correo.
- Identifica la pestaña dedicada de Outlook y conserva su identidad entre
  redirecciones; ignora otras pestañas antiguas de pruebas de acceso. Varias
  pestañas de buzón o una pantalla no reconocida requieren revisión.
- Solo introduce el secreto en formularios reconocidos de Microsoft, para la
  cuenta configurada. Conserva la sesión cuando Microsoft ofrece esa opción.
- Reserva el intento en `auth-status.json` antes de interactuar. Un reinicio,
  una interrupción o un estado corrupto no autorizan repetir la contraseña.
- Contraseña rechazada, MFA o pantalla desconocida dejan una pausa persistente.
  Cambiar explícitamente el secreto permite un intento nuevo. Un MFA pendiente
  se mantiene detenido; nunca se introducen códigos ni se aprueban solicitudes.
- Reconocer de nuevo el buzón de la cuenta correcta elimina la pausa. Los
  trabajos de correo que hayan fallado se vuelven a conciliar desde Gestify;
  no se repiten escrituras por recuperar el acceso.

El bloqueo se comparte con el lector y el escritor de horas. Si hay una
operación usando Chromium, el recuperador espera a otra observación.

## Aviso de MFA y límites

Home muestra «Microsoft pide MFA» y explica cómo completar la confirmación.
El estado se conserva en Kairo aunque Gestify esté cerrado. Se consulta al
entrar/volver a la app, al comprobar acceso y tras un trabajo fallido. Mientras
Gestify está en primer plano se lee ese estado ligero una vez por minuto para
mostrar el aviso y un toast si aparece MFA. Estas consultas leen un archivo;
no revisan las facturas, programaciones ni el buzón. En segundo plano se omiten.

El aviso es de la interfaz de Gestify, no una notificación push con la app
cerrada. Para completar MFA, utilizar Authenticator y, si hace falta, la sesión
de Outlook de Kairo mediante el visor ya existente. «Comprobar acceso» solo
actualiza el indicador: no omite MFA ni libera la pausa a ciegas.

Excelia/Microsoft pueden exigir MFA, cambiar el método de acceso o revocar la
sesión. El secreto facilita el primer factor; no garantiza acceso perpetuo.
Las pantallas nuevas se detienen para revisión.

## Desactivar y eliminar el secreto

```powershell
& 'C:\Users\Angel\.codex\worktrees\mapa-visual-piloto\horas-excelia\tools\kairo\set-outlook-secret.ps1' -Remove
```

Detiene y deshabilita el recuperador y elimina el cifrado. Conserva el perfil
de Chromium, los correos y las bases de Kairo.

## Validación de preparación

Pruebas de transiciones y privacidad; formularios reales de un Chromium
separado, con todas las peticiones interceptadas y datos ficticios; cifrado y
entrega de una credencial sintética mediante systemd en Kairo. No se ha usado
una contraseña real, cerrado la sesión actual ni modificado mensajes.

Fuentes: [credenciales systemd](https://www.freedesktop.org/software/systemd/man/257/systemd-creds.html),
[sesiones y MFA de Microsoft](https://learn.microsoft.com/en-us/entra/identity/authentication/concepts-azure-multi-factor-authentication-prompts-session-lifetime).
