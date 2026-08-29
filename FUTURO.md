# Ideas pendientes — Horas Excelia

Este es **el sitio donde se apuntan las ideas**: cosas que se han pensado pero
no se han hecho todavía. No es una lista de tareas ni tiene prioridades; es
memoria, para que una idea no se pierda entre dos tandas de cambios.

**Cómo usarlo**
- Una idea, un apartado con `## `.
- Decir *qué* se quiere y, sobre todo, *por qué*. El cómo puede cambiar.
- Cuando algo se hace, se **borra de aquí** y se documenta en `CLAUDE.md`.
  Este fichero solo guarda lo que sigue vivo.

---

## 1. Envío automático de correos con N8N

Hoy el correo semanal se genera y se envía a mano desde Outlook. La idea es que
la app haga un `POST` a un webhook de N8N con el JSON de la semana, que N8N
componga el correo y lo mande a `TO` y `CC`, y que la semana quede marcada como
enviada sola.

**Por qué**: es el único paso del flujo semanal que sigue siendo manual.

**A tener en cuenta**: hoy `sendEmail()` marca la semana como enviada nada más
abrir Outlook, sin saber si el correo salió. Con N8N sí se podría saber, así que
el marcado debería pasar a depender de la respuesta del webhook.
