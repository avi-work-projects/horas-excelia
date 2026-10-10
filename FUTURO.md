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


## 2. Detalle seguros en Gastos del hogar

Añadir una sección «Detalle seguros» que permita ver de un vistazo los seguros
vigentes y consultar el histórico de los que se han tenido contratados.

Cada seguro incluiría: medio o canal de contratación, precio, resumen de
coberturas en texto, vigencia, comentarios, persona de contacto (por ejemplo,
Ana de Rastreator), teléfono del seguro y enlace a su web o aplicación.

## 3. Categorías múltiples y filtros de cumpleaños — implementado en v425

Disponible en Cumpleaños → Lista → Clasificar personas. Permite marcar personas por categoría, buscar y trabajar solo con quienes aún no están clasificados.
Cada persona podrá pertenecer a varias categorías y se podrán crear categorías
adicionales a las predeterminadas.

Categorías iniciales: Amigos Oviedo, Amigos baile, Amigos Moco, Amigos master,
Familia cercana, Familia, Familia Celia, Amigas Celia, Amigos Carrera,
Amigos en Madrid, Amigos Guadalupe, Mejores amigos, Amigos Villa, Amigos,
Amigos extranjeros y Otros.

La lista de cumpleaños permitirá filtrar por una o varias categorías con
criterio inclusivo: categoría A **o** B, no exigir pertenecer a A **y** B.
