// Fuente editorial compartida; cada resolución conserva su versión y sus evidencias.
window.VISUAL_REVIEW={
  "date": "2026-10-25",
  "reference": "9532bfb",
  "findings": [
    {
      "id": "A01",
      "priority": "P1",
      "kind": "Visual",
      "title": "Tareas se superpone a controles de otros paneles",
      "problem": "El botón flotante de Tareas queda por encima de Guardar, Eliminar, Confirmar y opciones de selección. En Editar clase ocupa 46 × 38 px del área de Guardar; una pulsación ahí llega a tasksFab.",
      "proposal": "Resolver el comportamiento del botón global al abrir paneles: ocultarlo temporalmente o darle un lugar propio que no compita con sus acciones. Restaurarlo al cerrar. Corregir la política compartida, sin parches por pantalla.",
      "validation": "Abrir y cerrar los paneles afectados; comprobar Guardar, Cancelar, foco y restauración de Tareas a 320/400/440 px.",
      "scenes": [
        "workday",
        "event-delete",
        "calendar-export",
        "wedding-edit",
        "wedding-class",
        "wedding-time",
        "wedding-place",
        "wedding-couple",
        "wedding-duration",
        "wedding-teachers",
        "wedding-new",
        "wedding-assign",
        "wedding-issues",
        "wedding-pack",
        "wedding-length",
        "wedding-room",
        "routine-form",
        "routine-bulk-confirm",
        "personal-periods",
        "fiscal-expenses",
        "fiscal-irpf",
        "fiscal-home",
        "energy-tariff"
      ],
      "evidence": [
        [
          "evidence/before-wedding-class.png",
          "Antes · Tareas sobre Guardar"
        ],
        [
          "evidence/before-workday.png",
          "Antes · Tareas sobre la elección de horas"
        ],
        [
          "evidence/wedding-class-after.png",
          "Después · Tareas deja libre Guardar"
        ]
      ],
      "sources": [
        "css/tasks.css",
        "js/tasks-view.js",
        "js/core.js"
      ],
      "status": "resolved",
      "result": "Tareas se oculta mientras hay un panel secundario abierto y recupera su estado al cerrarlo. Guardar y Eliminar quedan libres, conservando la posición y la preferencia del botón.",
      "resolvedVersion": "v498"
    },
    {
      "id": "A02",
      "priority": "P1",
      "kind": "Comportamiento",
      "title": "Se ofrece alarma para una ocurrencia de hoy ya iniciada",
      "problem": "Con el reloj ficticio a las 10:00, un evento de 08:00–09:00 sigue mostrando Configurar alarma. La comprobación de acceso mira el día, pero no la hora de inicio. Se ha comprobado la oferta del control; no se ha enviado ninguna alarma.",
      "proposal": "Aplicar la regla confirmada por Ángel: no permitir alarmas de una ocurrencia ya iniciada. Comprobar tanto el acceso como la confirmación. En repeticiones conservar las ocurrencias futuras; en viajes evaluar cada trayecto por separado. Sin hora, mantener el criterio por fecha.",
      "validation": "Casos antes, exactamente a la hora y después; cambio de día, recurrencias, rutinas, ensayos y vuelta futura de un viaje. Bloquear también avisos cuyo instante ya haya pasado.",
      "scenes": [],
      "evidence": [
        [
          "evidence/alarm-started-current.png",
          "Antes · reproducción · hoy 08:00–09:00, reloj 10:00"
        ],
        [
          "evidence/alarm-started-after.png",
          "Después · Evento iniciado sin acceso a alarma"
        ]
      ],
      "sources": [
        "js/events-detail.js",
        "js/alarms.js",
        "js/events-alarm-policy.js"
      ],
      "status": "resolved",
      "result": "La ficha, Próximos y la confirmación comparten la comprobación de fecha y hora. Se bloquea al llegar el inicio y se conserva una vuelta futura. Los avisos necesitan al menos cinco minutos de margen.",
      "resolvedVersion": "v498"
    },
    {
      "id": "A03",
      "priority": "P1",
      "kind": "Comportamiento",
      "title": "La recuperación anterior a la clase original está bloqueada",
      "problem": "Una clase cancelada del 05/08 no puede recuperarse el 04/08: aparece «La recuperación debe ser posterior a la sesión original». La misma restricción está en la validación de vínculos al importar.",
      "proposal": "Permitir recuperar antes o después, como pide Ángel. Conservar el vínculo con la original cancelada, la fecha de inicio de la rutina, la unicidad de recuperación activa, los límites diarios y la prevención de duplicados.",
      "validation": "Recuperación anterior y posterior, mismo día a otra hora, guardar/reabrir, deshacer y exportar/importar. Quitar la restricción en alta y validación de backup de forma coherente.",
      "scenes": [],
      "evidence": [
        [
          "evidence/recovery-earlier-current.png",
          "Antes · reproducción · original 05/08, destino 04/08"
        ],
        [
          "evidence/recovery-earlier-after.png",
          "Después · Recuperación el día anterior guardada"
        ]
      ],
      "sources": [
        "js/rutinas-sessions.js",
        "js/rutinas-addition.js"
      ],
      "status": "resolved",
      "result": "Se puede guardar una recuperación antes o después de la original y volver a importarla sin perder el vínculo. Permanecen los límites diarios y la protección frente a duplicados.",
      "resolvedVersion": "v498"
    },
    {
      "id": "A04",
      "priority": "P2",
      "kind": "Diseño",
      "title": "El acceso a la alarma resulta pequeño y poco explícito",
      "problem": "En la ficha del calendario, una campana de 34 × 34 px comparte cabecera con el contador. No muestra texto ni estado. El panel posterior mezcla crear una alarma con marcar manualmente que está configurada; son acciones diferentes y tienen jerarquías similares.",
      "proposal": "Sustituir la campana aislada por una fila con emoji 🔔, «Alarma», estado y «Configurar». Mantener el estado manual claramente separado de la creación real. La maqueta muestra una distribución posible; su altura es orientativa y deberá mantenerse estable entre estados.",
      "validation": "Comprobar con/sin alarma, evento iniciado, títulos largos, notas y carrusel. Conservar las notas accesibles y un único alto exterior entre estados de la nueva ficha.",
      "scenes": [
        "day",
        "routine-session",
        "event-alarm",
        "birthday-alarm"
      ],
      "evidence": [
        [
          "evidence/before-day.png",
          "Antes · acceso solo con campana"
        ],
        [
          "evidence/alarm-after.png",
          "Después · Acceso con emoji, texto y estado"
        ]
      ],
      "sources": [
        "js/events-detail.js",
        "css/source/event-panels.css"
      ],
      "status": "resolved",
      "result": "La ficha utiliza una fila con el emoji 🔔, Alarma, estado y Configurar. El panel distingue el estado manual de la creación real; el carrusel conserva su tamaño exterior con scroll interior.",
      "resolvedVersion": "v498"
    },
    {
      "id": "A05",
      "priority": "P2",
      "kind": "Diseño",
      "title": "La ficha de un evento grande no organiza bien sus datos",
      "problem": "El rango de fechas queda en una única línea y los trayectos aparecen como texto secundario pequeño. Ida y vuelta no repiten sus fechas, y su jerarquía queda por debajo de un horario genérico.",
      "proposal": "Separar fechas, inicio del evento e ida/vuelta en bloques legibles. Dar a cada trayecto su día, hora, transporte y conductor. Distinguir hora del evento de salida del transporte; no presentar una vuelta como una hora de llegada.",
      "validation": "Grandes de un día y varios, con/sin trayectos, con/sin hora, título largo y notas. Reutilizar la ficha compartida y conservar Editar/Eliminar y navegación.",
      "scenes": [],
      "evidence": [
        [
          "evidence/large-detail-current.png",
          "Antes · ejemplo ficticio con ida y vuelta"
        ],
        [
          "evidence/large-detail-after.png",
          "Después · Fechas y trayectos agrupados"
        ]
      ],
      "sources": [
        "js/events-detail.js",
        "js/events.js"
      ],
      "status": "resolved",
      "result": "La ficha agrupa Desde/Hasta, inicio del evento y tarjetas de ida/vuelta, cada una con fecha, hora de salida, transporte y conductor cuando existe.",
      "resolvedVersion": "v498"
    },
    {
      "id": "A06",
      "priority": "P2",
      "kind": "Comportamiento",
      "title": "La barra de un evento grande ignora su hora de inicio",
      "problem": "Un evento con inicio a las 15:00 ocupa el primer día desde su borde izquierdo. Actualmente las medias casillas resuelven relevos entre barras, sin utilizar esa hora.",
      "proposal": "Según los ejemplos de Ángel: antes de las 13:00, borde de la casilla; desde las 13:00, mitad de la primera casilla. Usar Hora del evento; sin hora, conservar el inicio completo. No cambiar automáticamente el último día ni confundir la salida del transporte con esa hora.",
      "validation": "12:59, 13:00 y 15:00; un solo día; inicio en domingo; cambio de semana/mes; relevos, barras finas y solapamientos. Combinar el desplazamiento con las mitades existentes sin descontarlas dos veces.",
      "scenes": [],
      "diagram": true,
      "evidence": [
        [
          "evidence/large-calendar-current.png",
          "Antes · Viaje de ejemplo empieza a las 15:00"
        ],
        [
          "evidence/large-calendar-after.png",
          "Después · Inicio a las 15:00 desde media casilla"
        ]
      ],
      "sources": [
        "js/events.js",
        "js/events-cal.js"
      ],
      "status": "resolved",
      "result": "Los tres calendarios comienzan la barra en el borde antes de las 13:00 y en media casilla desde las 13:00. Se conserva el final y se combina con los relevos y solapamientos existentes.",
      "resolvedVersion": "v498"
    },
    {
      "id": "A07",
      "priority": "P2",
      "kind": "Visual",
      "title": "Los nombres se rompen en el calendario de cumpleaños",
      "problem": "A 400 px, nombres normales como «Elsa Pruebas» se parten en varias líneas y llegan a dejar una letra sola. Tres personas el mismo día crean una columna de etiquetas muy estrechas y altas.",
      "proposal": "Mostrar un nombre corto o una sola línea con elipsis y un contador cuando no quepan; abrir el listado completo del día al pulsar. Mantener VIP y evitar que el texto fuerce la geometría del mes.",
      "validation": "Nombres cortos/largos y una, tres y más personas en un día; legibilidad, VIP, pulsación y acceso a la ficha.",
      "scenes": [
        "birthday-calendar",
        "birthday-day-list"
      ],
      "evidence": [
        [
          "evidence/before-birthday-calendar.png",
          "Antes · nombres fragmentados en las casillas"
        ],
        [
          "evidence/birthday-after.png",
          "Después · Calendario con nombres compactos"
        ],
        [
          "evidence/birthday-day-list-after.png",
          "Después · Listado completo del día"
        ]
      ],
      "sources": [
        "js/birthdays-render.js",
        "css/source/birthdays.css"
      ],
      "status": "resolved",
      "resolvedVersion": "v499",
      "result": "El calendario ocupa el ancho disponible y muestra dos nombres cortos en una línea, con elipsis y contador. El contador o el día abren el listado completo con nombres y VIP; cada persona conserva su ficha."
    },
    {
      "id": "A08",
      "priority": "P2",
      "kind": "Visual",
      "title": "Guardar desaparece bajo formularios y paletas largas",
      "problem": "Al entrar en Editar pareja, Guardar empieza en y=950; en Nueva rutina, en y=1109, fuera de una pantalla de 880 px. Hay que atravesar la paleta para encontrarlo. Otros formularios, como Cumpleaños y Eventos, sí mantienen el pie accesible.",
      "proposal": "Dar a esos formularios cabecera y pie fijos, con scroll interior en los campos. Conservar las paletas y el tamaño exterior estable; no quitar opciones para hacer hueco.",
      "validation": "Guardar y Cancelar visibles, último campo accesible, teclado, scroll, selector de color, títulos y reapertura sin pérdida de borrador.",
      "scenes": [
        "couple-form",
        "couple-new",
        "routine-new"
      ],
      "evidence": [
        [
          "evidence/before-couple-form.png",
          "Antes · la acción queda debajo de la paleta"
        ],
        [
          "evidence/couple-after.png",
          "Después · Pareja con acciones fijas"
        ],
        [
          "evidence/before-routine-new.png",
          "Antes · Guardar está fuera de la vista inicial"
        ],
        [
          "evidence/routine-after.png",
          "Después · Rutina con acciones fijas"
        ]
      ],
      "sources": [
        "js/bodas-bind.js",
        "js/rutinas-form.js"
      ],
      "status": "resolved",
      "resolvedVersion": "v499",
      "result": "Los formularios de pareja y rutina reutilizan el marco fijo: cabecera, cuerpo con scroll y pie con Cancelar y Guardar. La paleta y los campos siguen disponibles sin desplazar las acciones."
    },
    {
      "id": "A09",
      "priority": "P2",
      "kind": "Visual",
      "title": "Multidía presenta objetivos de pulsación diminutos",
      "problem": "Las casillas de día miden aproximadamente 15 × 17 px. Los doce meses permiten una visión anual, pero elegir días con el dedo tiene poco margen de error.",
      "proposal": "Conservar la vista anual como resumen y ofrecer un mes ampliado para seleccionar con comodidad. Mantener la selección múltiple y el contador; reservar seis filas al navegar entre meses.",
      "validation": "Restauración del código y CSS previos a A09; seleccionar entre años, aceptar, vaciar y cancelar; consumidores Otros y Ensayos Boda.",
      "scenes": [
        "dates"
      ],
      "evidence": [
        [
          "evidence/before-dates.png",
          "Antes · doce meses en 400 px"
        ],
        [
          "evidence/dates-after.png",
          "v499 · propuesta mensual retirada"
        ],
        [
          "evidence/dates-overview-after.png",
          "v499 · resumen de la propuesta retirada"
        ],
        [
          "evidence/dates-restored-v500.png",
          "v500 · selector anual restaurado a petición de Ángel"
        ]
      ],
      "sources": [
        "js/events-picker-date.js"
      ],
      "status": "reverted",
      "resolvedVersion": "v499",
      "result": "Por petición expresa de Ángel, v500 restaura el selector anual anterior, con los doce meses y selección directa de días. Se retira la propuesta mensual de v499; no queda pendiente de reaplicación. Aceptar, Vaciar, selección entre años y Cancelar conservan su comportamiento original.",
      "revertedVersion": "v500"
    },
    {
      "id": "A10",
      "priority": "P2",
      "kind": "Visual",
      "title": "Sin lecturas por tramos se dibuja un reparto uniforme",
      "problem": "El resumen de electricidad indica «0 días desglosados» y «Sin dato», pero pinta tres segmentos iguales. Visualmente sugiere un reparto medido de un tercio por tramo.",
      "proposal": "Usar un estado neutro sin proporciones cuando falten datos. Pintar segmentos proporcionales solo con lecturas conocidas. Esto afecta a la representación; no se ha detectado aquí un error de cálculo.",
      "validation": "Ningún desglose, desglose parcial y completo; no convertir datos ausentes en ceros ni mostrar una proporción inventada.",
      "scenes": [
        "energy-luz"
      ],
      "evidence": [
        [
          "evidence/before-energy-luz.png",
          "Antes · tres segmentos iguales sin desglose"
        ],
        [
          "evidence/energy-after.png",
          "Después · Estado neutro sin reparto inventado"
        ]
      ],
      "sources": [
        "js/energy-study.js"
      ],
      "status": "resolved",
      "resolvedVersion": "v499",
      "result": "Sin lecturas se muestra una explicación neutra, sin segmentos ni porcentajes ficticios. Con lecturas se mantiene el reparto medido; la cobertura parcial queda indicada y el cero real se distingue de un dato ausente."
    },
    {
      "id": "A11",
      "priority": "P2",
      "kind": "Diseño",
      "title": "Ajustes promete editar y abre primero una consulta",
      "problem": "«Editar Correo Horas», «Editar MacroDroid» y «Editar Facturas y Correo» llevan a un panel de consulta que exige pulsar Editar otra vez. La protección contra cambios es útil; el texto de entrada no describe el resultado.",
      "proposal": "Nombrar los accesos «Correo de horas», «MacroDroid» y «Facturas y correo». Mantener el paso explícito Editar dentro del panel, junto a Cancelar/Guardar al entrar en edición.",
      "validation": "Texto y destino coherentes, consulta sin escrituras y conservación del flujo protegido de edición.",
      "scenes": [
        "settings"
      ],
      "evidence": [
        [
          "evidence/before-settings.png",
          "Antes · entradas que ya dicen Editar"
        ],
        [
          "evidence/before-macro.png",
          "Antes · se vuelve a pedir Editar"
        ],
        [
          "evidence/settings-after.png",
          "Después · Accesos que describen la consulta"
        ],
        [
          "evidence/settings-v499.png",
          "v499 · Recordatorios de 58 px"
        ],
        [
          "evidence/settings-v500.png",
          "v500 · Recordatorios de 44 px"
        ],
        [
          "evidence/settings-v501.png",
          "v501 · Altura natural de Tema y Recordatorios, 33 px"
        ]
      ],
      "sources": [
        "js/settings-menu.js"
      ],
      "status": "resolved",
      "resolvedVersion": "v499",
      "result": "Los accesos se llaman Correo de horas, MacroDroid y Facturas y correo. Abren la consulta protegida; la edición y el guardado siguen siendo explícitos dentro del panel. En v500, Recordatorios reduce su altura de 58 a 44 px a petición de Ángel. La aclaración posterior de Ángel en v501 elimina la altura forzada: Tema recupera su tamaño natural (33 px en la referencia) y Recordatorios se ajusta a esa misma altura."
    },
    {
      "id": "A12",
      "priority": "P3",
      "kind": "Diseño",
      "title": "Herramientas y Configuración fiscal conservan un aspecto más antiguo",
      "problem": "Herramientas abre con el año y cinco botones pequeños antes de explicar la pantalla. Economía/Fiscal concentra pestañas abreviadas, microcontroles y cajas con poco contraste de jerarquía. Se nota la diferencia frente a Hogar, Facturas y los ajustes recientes.",
      "proposal": "Primero aclarar títulos y nombres de navegación; después reutilizar las cabeceras, campos y botones compartidos. Preservar los colores de cada módulo y los cálculos. Hacerlo por zona, sin rediseño global.",
      "validation": "Mismos cálculos y persistencia; legibilidad móvil y separación entre consulta, simulación y configuración.",
      "scenes": [
        "study",
        "study-rate",
        "study-mortgage",
        "study-gas",
        "study-electric",
        "economics",
        "econ-days",
        "econ-tax",
        "econ-personal",
        "fiscal",
        "fiscal-expenses",
        "fiscal-irpf"
      ],
      "evidence": [
        [
          "evidence/before-study.png",
          "Antes · Herramientas de comparación"
        ],
        [
          "evidence/before-fiscal-expenses.png",
          "Antes · Configuración fiscal"
        ],
        [
          "evidence/study-v500.png",
          "Después · Herramientas y grupos de comparación"
        ],
        [
          "evidence/fiscal-expenses-v500.png",
          "Después · Configuración fiscal y campos"
        ]
      ],
      "sources": [
        "js/economics-estudio.js",
        "js/economics-fiscal.js",
        "js/economics.js",
        "css/source/economics.css",
        "js/economics-fiscal-hip.js"
      ],
      "status": "resolved",
      "resolvedVersion": "v500",
      "result": "Herramientas explica su propósito antes de las opciones y agrupa Trabajo e ingresos / Hogar y contratos con botones más legibles. Economía usa nombres completos. Fiscal organiza las cuatro entradas en una rejilla de dos columnas, introduce cada sección y presenta gastos en tarjetas con campos y períodos mayores. Se conservan colores, cálculos y guardado."
    },
    {
      "id": "A13",
      "priority": "P3",
      "kind": "Diseño",
      "title": "El estado sin datos ocupa un gráfico vacío completo",
      "problem": "En Coste de energía, la falta de IVA documentado deja un gráfico alto de guiones y varios «Sin dato». Es un estado válido del fixture, no evidencia de que falten facturas reales del usuario; la explicación se encuentra más abajo.",
      "proposal": "Sustituir el gráfico vacío por una explicación compacta y visible de qué falta para calcularlo. Mantener diferenciados datos ausentes, cero y estimaciones.",
      "validation": "Estado sin IVA, datos parciales y datos completos; no atribuir a los datos reales los huecos del fixture.",
      "scenes": [
        "energy-gas-costes",
        "energy-luz-costes",
        "energy-gas-costes-neto",
        "energy-gas-costes-constante",
        "energy-luz-costes-neto",
        "energy-luz-costes-constante"
      ],
      "evidence": [
        [
          "evidence/before-energy-gas-costes.png",
          "Antes · ejemplo ficticio sin IVA documentado"
        ],
        [
          "evidence/energy-gas-costes-v500.png",
          "Después · Sin IVA documentado (datos ficticios)"
        ],
        [
          "evidence/energy-luz-costes-v500.png",
          "Después · Electricidad sin cobertura calculable"
        ],
        [
          "evidence/energy-gas-costes-neto-v500.png",
          "Después · Estimación explícita sin IVA y ocho meses de cobertura"
        ]
      ],
      "sources": [
        "js/energy-analysis-view.js"
      ],
      "status": "resolved",
      "resolvedVersion": "v500",
      "result": "Cuando ningún mes es calculable, una explicación compacta sustituye al gráfico vacío e indica las causas documentadas. El selector de IVA sigue disponible para explorar estimaciones explícitas. Con meses parciales se conserva el gráfico y se explica la cobertura; el cero calculado sigue siendo un dato válido. La comparación histórica sin cobertura muestra una sola explicación."
    }
  ],
  "implementedVersion": "v501"
};
