# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(165 líneas)_
**Estado global:** ALARMS_SK:5 · ALARMS:6 · ALARM_TYPE_LABELS:99 · DN_SHORT:104

**Funciones:** saveAlarms:14 · addAlarm:20 · removeAlarm:27 · isAlarmPast:32 · nextAlarmTime:40 · openAlarms:45 · closeAlarms:90 · renderAlarmItem:106 · renderAlarms:128

### js/birthdays.js  _(1030 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:52 · BDAY_ALARM_SET:53 · BDAY_ALARM_COUNT_KEY:54 · BDAY_ALARM_COUNT:55 · BDAY_PALETTE:59 · BDAYS:63 · DN7:228

**Funciones:** _showBdayInlineCtrl:17 · tc:72 · bdName:73 · getBdayColor:75 · shortName:84 · getBdaysOn:89 · daysUntil:91 · hasUpcomingBday:98 · updateBdayBtn:104 · getBdayAlarmKey:114 · isBdayAlarmSet:115 · setBdayAlarmState:116 · syncVipBdaysToEvents:122 · renderBdayUpcoming:147 · getBdaysInRange:152 · bdayLabel:167 · renderGroup:176 · renderBdayCalMonth:226 · renderBdayList:267 · getEffVip:278 · renderBdayContent:320 · renderBdayDetail:379 · renderBdayAlarmPanel:400 · fmtDate:412 · openBdayAlarm:467 · _bdRefreshBoth:482 · closeBdayAlarm:487 · bindBdayAlarmEvents:496 · fmtD:612 · onOk:620 · onErr:621 · renderBdayForm:643 · openBdayDetail:676 · closeBdayDetail:694 · openBdayForm:701 · closeBdayForm:716 · bindBdayFormEvents:722 · openBday:763 · closeBday:772 · refreshBday:778 · applyBdaySearch:783 · bindBdayEvents:795 · _bdResetScroll:826

### js/bodas.js  _(828 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_SHORT:28 · BODA_PLACES:29 · BODA_SLOTS:36 · BODA_NO_TIME_COLOR:42 · BODA_NO_COUPLE_COLOR:43 · BODA_DEFAULT_TIME:44 · BODA_PALETTE:47 · BODA_SUBTAB:141 · BODA_CLASS_MODE:142 · BODA_FILTER_COUPLE:143 · BODA_HIDE_PAST:144 · BODA_PAREJAS_FILTER:145 · BODA_ASSIGN:357 · BODA_TIME_H:588

**Funciones:** saveBodas:18 · bodaPlaceOf:30 · bodaNextColor:49 · bodaCouple:57 · bodaSlotColor:61 · evBodaSvg:72 · bodaClasses:86 · bodaClassesOfCouple:89 · bodaFreeClasses:92 · bodaSortClasses:95 · bodaClassesOnDay:102 · bodaNewClass:105 · bodaPlaceForNewOn:116 · bodaDayFull:121 · bodaBulkCreate:125 · bodaProgress:135 · renderBodasBody:148 · _renderBodaParejas:160 · _bodaFmt:198 · _bodaFmtCorto:199 · _renderBodaClases:206 · openBodaCoupleDetail:294 · closeBodaCoupleDetail:346 · openBodaAssign:358 · closeBodaAssign:383 · renderBodaAssign:388 · bindBodaAssign:469 · openBodaCouplePicker:533 · row:543 · apply:566 · closeBodaCouplePicker:581 · openBodaTimePicker:591 · drum:596 · setDrum:625 · mark:630 · drumVal:634 · readManual:655 · closeBodaTimePicker:676 · renderBodaCoupleForm:683 · openBodaCoupleForm:707 · closeBodaCoupleForm:750 · bindBodasEvents:757 · findClass:784

### js/core.js  _(485 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:48 · THEME_STORAGE_KEY:51 · THEME:52 · THEME_LABELS:58 · THEME_META:59 · THEME_SEQUENCE:60 · ECON_YEAR_CONFIG:80 · MN_SHORT:82 · DN5:250

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · applyTheme:61 · cycleTheme:68 · updateThemeBtn:73 · load:87 · save:99 · loadEconYear:103 · saveEconYear:122 · fakeTrans:132 · shareOrDownload:142 · escHtml:162 · mkey:167 · getMonthH:168 · defH:174 · dayH:175 · dayT:176 · dk:177 · fd:178 · ad:179 · fh:180 · fhP:181 · isToday:182 · isPast:183 · wn:184 · weeks:187 · hasAnySentWeekInMonth:201 · getWD:208 · showToast:221 · sendEmail:239 · buildMailtoBody:249 · render:271 · fmtH:357 · openSheet:378 · closeSheet:397 · selectType:403 · togSent:431 · renderNavBar:434 · bindNavBar:457 · doNav:464

### js/economics-analisis.js  _(911 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_ALT_RATE:7 · ANALISIS_SWITCH_COST:8 · ANALISIS_SORT:9 · ANALISIS_FILTER_TEXT:10 · ANALISIS_FILTER_CAT:11 · ANALISIS_CAT_MODE:12 · ANALISIS_DET_MODE:13 · ANALISIS_RES_MODE:14 · ANALISIS_CALC_HIP:15 · ANALISIS_DESGRAV_IDS:17 · ANALISIS_DESGRAV_DISCOUNT:18 · ANALISIS_SEG_NORMAL:20

**Funciones:** renderEconAnalisis:22 · _renderAnalisisGastos:37 · _triDonut:287 · _monthName:310 · _hipTipoEfectivo:315 · _analisisMortgageBox:321 · _renderAnalisisHipoteca:343 · _ahRow:462 · _donutChart:467 · _balanceEvolutionChart:483 · xPos:516 · yPos:517 · _renderSubrogacionAnalysis:551 · _analisisCard:703 · _analisisHBar:711 · _renderInsuranceOvercost:730 · _mortgageDiffChart:806 · xPos:826 · yPos:827 · bindEconAnalisisEvents:876 · _reRenderKeepScroll:883

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 · bindEconCompEvents:196 · _selectZone:217

### js/economics-estudio.js  _(704 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:334 · ESTUDIO_ELECT_CALC:335 · ESTUDIO_ELECT_IVA:336

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:238 · _renderEstudioGasComp:246 · _renderGasCompCard:306 · _calcElectCost:338 · _currentElectTariff:347 · _renderEstudioElectComp:352 · _renderElectCompCard:413 · _renderMultiScenarioResult:442 · _bindEstudioGas:510 · _bindEstudioElect:540 · _bindScenarios:570 · _readScenarios:589 · _bindCompFields:598 · _saveCompFields:631 · renderEstudioContent:646 · openEstudio:660 · closeEstudio:670 · reRenderEstudio:675 · bindEstudioEvents:683

### js/economics-fiscal-elect.js  _(261 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:157

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:75 · _vincRow:90 · _despFieldDate:113 · _despField:122 · _despFieldMoney:131 · _renderIngresosDesgList:144 · _renderGastoItem:163 · renderGastosList:178 · _bindElectDetalle:200 · _bindSegurosNormales:245

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:72

### js/economics-fiscal-hip.js  _(1033 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipPeriodCard:365 · _hipROvinc:452 · _calcInsOvercost:462 · _renderInlineOvercost:473 · _renderHipResumen:492 · _renderHipDetalle:591 · _renderHipSectionContent:617 · _renderCompraSection:629 · _renderPrestamoSection:658 · _renderSubSection:705 · renderFiscalTabDespacho:776 · _bindTabDespacho:793 · _bindHipResumen:817 · _bindHipDetalle:842 · _rerenderSection:913 · _readSectionInputs:922 · _rv:923 · _rv_s:924 · _bindEditingSection:982

### js/economics-fiscal.js  _(1360 líneas)_
**Estado global:** FISCAL_SK:5 · DEFAULT_BRACKETS:11 · FISCAL:18 · FISCAL_TAB:21 · FISCAL_IRPF_SUB:22 · FISCAL_YEAR:23 · FISCAL_HIP_SUB:25 · FISCAL_HIP_EDITING:26 · FISCAL_HIP_EDIT_SNAPSHOT:27 · FISCAL_HIP_DETAIL_TARGET:28 · PERSONAL_SK:34 · PERSONAL_DATA:35 · DEFAULT_PERSONAL_GASTOS_REC:37 · DEFAULT_PERSONAL_INVERSIONES:43 · INGRESOS_SK:87 · INGRESOS_ITEMS:88 · GASTOS_SK:122 · GASTOS_DIFICIL_PCT:123 · DEFAULT_GASTOS:124 · GASTOS_ITEMS:142 · COMPRAS_SK:205 · COMPRAS_IVA_ENABLED:206 · DEFAULT_COMPRAS:207 · COMPRAS_ITEMS:213 · DESGRAV_SK:260 · DESGRAV_DEFAULT:262 · DESGRAV_ITEMS:282 · OBSOLETE_IDS:285 · GROUP_CASA_DESP:677 · GROUP_UTIL_DESP:678

**Funciones:** _yearKey:31 · _ensureDefaults:50 · loadPersonalYear:66 · savePersonalYear:82 · loadIngresos:89 · saveIngresos:92 · findIngreso:95 · ingresoAnual:99 · renderIngresosList:104 · loadFiscal:144 · saveFiscal:152 · getIrpfPct:155 · getBrackets:156 · _loadGastosFromRaw:158 · loadGastosYear:176 · loadGastos:189 · saveGastosYear:190 · saveGastos:193 · findGasto:194 · gastoAnual:198 · loadCompras:214 · saveCompras:231 · comprasTotal:235 · comprasIvaTotal:245 · loadDesgrav:284 · saveDesgrav:315 · desgravAnual:318 · computeTotalDesgrav:339 · renderFiscalContent:351 · _renderYearSelector:377 · _renderCopyYearBtn:385 · _personalListHtml:408 · _personalTotal:451 · _personalTotalWeekly:461 · renderFiscalTabPersonal:470 · renderFiscalTabIrpf:511 · renderFiscalTabGastosDesg:558 · renderComprasList:589 · renderFiscalTabIrpfDeduc:638 · renderFiscalTabDesgrav:651 · renderDesgravDespachoInfo:673 · _dedCard:714 · renderDesgravList:749 · openFiscal:815 · closeFiscal:828 · reRenderFiscal:834 · bindFiscalEvents:844 · _switchTab:848 · _bindYearSelector:881 · _bindTabPersonal:918 · _bindTabIrpf:967 · _bindTabGastosDesg:1012 · _rebindComprasDel:1061 · _bindTabIrpfDeduc:1103 · _bindTabDesgrav:1116 · _bindList:1118 · _bindTabDespachoOnly:1212 · _syncLiveD:1223 · _updateFmt:1261 · _saveFiscalAll:1295 · _rv:1324

### js/economics-gastos.js  _(701 líneas)_
**Estado global:** GASTOS_TOGGLES_SK:5 · GASTOS_TOGGLES:6 · GROUP_SEMIOBL:96 · GROUP_CASA:97 · GROUP_OTROS_IMP:98 · GROUP_S:472 · GROUP_C:473 · GROUP_S2:571 · GROUP_C2:572

**Funciones:** loadGastosToggles:8 · saveGastosToggles:14 · isTglOn:17 · computeDisponible:22 · renderEconGastos:45 · _gastosGroup:100 · renderResultadoDeclaracion:200 · _renderDesgloseAhorroPartida:313 · renderIrpfBreakdown:384 · _renderIrpfTramos:431 · renderIncomeDistrib:457 · pctOf:460 · distRow:461 · grpLbl:497 · _sectorPath:529 · _donutSummaryHtml:537 · renderIncomeDonut:566 · _bindDonutClick:637 · gastosCascRow:658 · gastosResultRow:675 · bindEconGastosEvents:682

### js/economics-helpers.js  _(68 líneas)_
**Funciones:** _fmtMiles:8 · _hipMoney:14 · _hipNum:19 · _hipDate:24 · _hipText:28 · _hipVinc:32 · _hipVincSum:46 · _hipRO:62 · _hipROmoney:65

### js/economics-sim.js  _(203 líneas)_
**Estado global:** SIM_TARGET:5 · SIM_PERIOD:6 · SIM_NET_MODE:7 · SIM_RESULT:8 · SIM_RESULT_SAL:9

**Funciones:** _simComputeAll:12 · _inverseSalary:50 · renderEconSim:64 · bindEconSimEvents:166

### js/economics.js  _(707 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_RATE_PERIODS:10 · ECON_ESTUDIO_SUB:14 · ESTUDIO_YEAR:15

**Funciones:** computeSalaryNet:23 · fc:41 · fcPlain:46 · _rateForDate:56 · _buildDatePeriods:71 · computeEconEx:85 · computeEcon:143 · econBarChart:146 · _fmtDateEs:173 · _prevDate:178 · _ensureDatePeriods:185 · _renderRateInputs:202 · renderOptRow:219 · cascRow:226 · _econCard:236 · _econCards7:242 · f:244 · _getMultiRateOpts:259 · renderEconResumen:263 · renderEconContent:460 · openEcon:485 · closeEcon:501 · reRenderEcon:506 · bindEconEvents:518 · bindEconResumenEvents:556

### js/events-picker-color.js  _(207 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_KINDS:42 · EV_TYPE_COLORS:47 · EV_FREE_COLOR:58 · EV_FREE_SHAPE:59 · EV_FREE_DATES:62 · EV_SHAPE_BW:82

**Funciones:** evTypeKey:63 · evTypeColor:64 · getEvKind:67 · evShapeSvg:83 · evMorePlusSvg:104 · evTravelColor:113 · getEvType:119 · isEvBarAlways:127 · getEvDisplayColor:129 · _renderColorPicker:139 · _bindColorPicker:162 · updatePreview:172

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events.js  _(2360 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_VIEW:31 · EV_EDIT:32 · EV_EDIT_DS:33 · EV_FORM_CONTAINER:34 · EV_EDIT_MODE:35 · EV_BRIGHT_PAST:36 · EV_ANNUAL_VIEW:37 · EV_ANNUAL_FILTER_HIDDEN:38 · EV_PREV_VIEW:39 · EV_QUAD_YEAR:40 · EV_QUAD_MONTH:41 · EV_TO_SUBTAB:42 · EV_LIST_SUBTAB:43 · EV_TYPES_FILTER:44 · EV_TYPES_PAST:45 · EV_COLORS:46 · EVENTS:47 · EV_ALARM_SK:74 · EV_ALARMS_SET:75 · EV_MAX_DAY_EVENTS:251 · EV_CAL_BADGE_STACK:252 · EV_CAL_CORNER_STACK:253 · DN7:293 · MNS:665 · MNS:842

**Funciones:** _switchEvView:16 · saveEvents:69 · loadEvAlarms:76 · saveEvAlarms:77 · _findBdayByEvId:78 · isEvAlarmSet:90 · setEvAlarmState:96 · evDk:103 · _evClampDate:112 · eventOccursOn:116 · getEventsOn:157 · _fmtDayEs:165 · evDayLimitExceeded:166 · hasUpcomingEvent:195 · updateEventsBtn:204 · evUniqueColor:214 · evDefaultShape:225 · evMarkerHtml:231 · evMorePlusHtml:245 · evAnnualXsHtml:254 · vipStarSvgHtml:264 · evSoftFillColor:274 · renderEvCalMonth:282 · _cornerHtml:360 · renderEvList:414 · renderEvByMonths:425 · renderEvListItem:444 · fd2:448 · getNextOccurrence:477 · evIsoDate:519 · _isVipBdayTooFar:520 · renderEvUpcoming:524 · fd2:531 · renderEvItem:532 · renderEvAnnual:649 · annEvVisible:659 · renderEvQuad:810 · _loadP:818 · annEvVisible:828 · renderEvByTypes:974 · renderEvMonthsView:1010 · renderEvWeek:1020 · hexA:1024 · renderEvContent:1124 · renderEvDetail:1259 · fd2:1262 · openEvDetail:1321 · closeEvDetail:1414 · evPuntualDays:1421 · _renderEvTypeSwatches:1429 · renderEvForm:1444 · openEvForm:1576 · closeEvForm:1606 · bindEvFormEvents:1618 · _refreshShapePreviews:1634 · _refreshPickDatesLabel:1639 · _curKind:1658 · _applyTypeUI:1659 · _bindTypeSwatches:1670 · renderEvAlarmPanel:1843 · fd2:1845 · openEvAlarm:1878 · closeEvAlarm:1889 · openBdayAlarmFromEvents:1899 · bindEvAlarmEvents:1910 · fmtD:1956 · openEvents:1973 · closeEvents:1983 · openEventsAt:1990 · refreshEvents:1997 · bindEvEvents:2002 · _scrollWeekToMonth:2010 · _scrollWeekToToday:2057 · doScroll:2067 · apply:2317 · _positionEvBright:2346

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(501 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:332 · _keyId:344 · _keyBday:345 · _keyGasto:346 · _exportPerYearKeys:352 · _applyFullImport:421

### js/init.js  _(553 líneas)_
**Estado global:** DRUM_ITEM_H:144 · DN_ES:325

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:145 · updateDrumSelected:173 · getDrumValue:179 · checkDrumMinuteWrap:185 · buildAlarmDayBtns:216 · showAlarmPastConfirm:246 · proceed:300 · fmt:361 · _showUpdateBar:520

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/summary.js  _(616 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 · fmtSigned:257 · renderSummaryPuentesBody:270 · fdd:277 · renderSummaryTimeOffBody:364 · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · openSummary:518 · closeSummary:527 · bindSummaryEvents:533

## CSS

### css/styles.css  _(1879 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:18
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):35
- HEADER:53
- JORNADA DEFECTO:67
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:103
- Punto verde notificación en botones bday/events cuando hay items próximos:112
- WEEK CARDS:122
- WEEK ACTIONS:154
- BOTTOM SHEET (day type selector):163
- TOAST:185
- SW UPDATE BUTTON (en menú ⋯):192
- ANIMATIONS:197
- BUILD BADGE:206
- DAY HOUR COLORS:210
- OVERLAY BASE (summary, econ, bday, events):227
- SHARED OVERLAY HEADER:232
- SHARED BODY:252
- Vacaciones config:301
- Quitar festivos/vacaciones checkboxes:305
- Month summary breakdown:309
- Ausencia list tag:312
- ECONOMICS:315
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:320
- Summary sublabel (hours breakdown):337
- Ingresado box (formerly cobrado) — neutral:346
- ECONOMICS v2: tabs + nuevas secciones:380
- Estudio Cambio — grouped nav:391
- Estudio — tariff comparison cards:400
- Análisis hipoteca — secciones organizadas:421
- Mis gastos — budget table:438
- Year selector for per-year fiscal tabs:451
- §1.1 Tarifa dual:462
- §1.3 Stats por hora/día:474
- §1.4 Toggles:481
- §1.5 Declaración IRPF:486
- Tab 2: Comparador:499
- Calcular Tarifa (sim):527
- Scenario zones (Comparar Escenarios):545
- Análisis Ec. Personal:562
- Bloques de la Subrogación:564
- Fiscal config modal — purple theme override:607
- Fiscal config modal:609
- ECONOMICS v3: opt-buttons, cascade, gastos:635
- Cascade ingresos/gastos:642
- Media mensual: cards:652
- Tab 4: Análisis:662
- IRPF Breakdown visual:676
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:703
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):705
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):729
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:738
- Resumen fiscal al final de Ingresos y Gastos:740
- Donut chart:747
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):757
- Fiscal config: gastos items:764
- Fiscal: tab bar:776
- Fiscal: sticky save:781
- Fiscal: section title income/expense colors:783
- Fiscal: desgravaciones:793
- Fiscal: compras profesionales:820
- Desgravaciones: notas + tabla despacho info:828
- Nota IVA compras:848
- IVA por item en compras:850
- Fiscal: despacho en casa:857
- Hipoteca — resumen visual:880
- Hipoteca — compact 2-col grid:903
- Hipoteca — compact vinculaciones:911
- Hipoteca — read-only fields:922
- Hipoteca — edit/detail buttons:931
- Hipoteca — period summary card:937
- Multi-rate period cards:950
- Distribución de ingresos:966
- Comparador: reorder buttons:982
- Rate input styled:986
- BIRTHDAYS:990
- VIP controls bar:1010
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1021
- VIP edit mode item states:1024
- Feat 1: Buscador en lista por meses:1034
- Upcoming birthdays:1043
- Weekend frame — gris lavanda suave:1060
- Day types in events calendar — border-top + tinte de fondo:1065
- Events in puentes (summary) — one per line:1084
- Events upcoming view:1088
- Vista semanal (Agenda):1106
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1109
- Grid del mes: col fecha (48px) + col eventos (1fr):1111
- Columna fecha (col 1):1113
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1122
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1128
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1132
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1138
- Event color type picker:1142
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1148
- Color picker avanzado (paleta 6×8 + color libre):1152
- Detail color picker toggle:1170
- Annual events calendar:1176
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1206
- Selector de formas en el formulario de evento (Otros):1217
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1223
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1227
- Inicio/Fin bloqueados cuando hay Selección Multidía:1230
- Mini-overlay para elegir días específicos (Otros):1235
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1262
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1266
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1268
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1270
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1272
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1278
- Calendario 4 meses: 2 columnas × 2 filas:1280
- Botón ir al calendario mensual en puentes del resumen:1282
- Pencil edit button in annual/quad controls:1294
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1295
- Feat 6: Puentes rallados en anual:1299
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1300
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1317
- Dropdown de vista anual:1324
- Barras multi-día en vista mensual (fila propia encima de las celdas):1336
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1337
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1341
- Summary tabs — nivel 2:1344
- BRIDGE DAY CELLS in summary:1349
- VIP BIRTHDAYS:1358
- BIRTHDAY + EVENT ALARM PANEL:1361
- Campana de alarma en items de próximos (bday + eventos):1364
- 3-ZONE ALARM MARKER:1384
- ALARM MANAGEMENT OVERLAY:1397
- HOME POPUP (semanas pendientes / VIP sin alarma):1414
- MACRO URL EN MENÚ:1425
- Feat 4: Nav-bar emoji alignment:1431
- Birthday detail / form overlays:1447
- EVENTS:1457
- Zone A: upcoming/list views — subtle blue tint:1463
- Zone B: calendar grid views — subtle teal tint, active = green:1465
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1468
- Feat 2: Lista de Eventos subtabs:1473
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1490
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1492
- Contenedor de badges 1-día: centrado verticalmente en la celda:1495
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1502
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1506
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1516
- Perímetro puente: capa inferior a eventos:1518
- Bright past: bombilla override:1531
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1535
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1536
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1541
- Quad label 3 lines:1546
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1553
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1555
- Events list view:1557
- Event form overlay (inside eventsOverlay):1571
- Event detail:1605
- LOGO POPUP:1613
- Gallery:1622
- BD ALARM VIP TOGGLE:1631
- RESPONSIVE (mobile header):1634
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1636
- ALARM PANEL:1689
- Drum picker (selector giratorio de hora/minuto):1694
- Confirmación alarma en el pasado:1714
- Botón flotante "Listo" en modo Editar VIPs:1726
- Controles inline long-press cumpleaños:1729
- Selector de clase en el formulario:1741
- Notas: general vs de un dia concreto:1747
- Pestana Bodas y pestana partida Vacaciones/Festivos:1751
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1754
- Pestana Bodas:1760
- Diálogo: modo de importación (añadir vs reemplazar):1847
- PRINT:1860

**Rangos por prefijo de clase:** 
.action-btn:156-160 · .ah-cuota:425-427 · .ah-donut:435-437 · .ah-section:422-424 · .ah-total:432-434 · .ah-vs:428-431 · .alarm-cfg:1690-1690 · .alarm-colon:1693-1693 · .alarm-create:1705-1706 · .alarm-day:1711-1713 · .alarm-days:1708-1710 · .alarm-delete:1410-1411 · .alarm-ics:1707-1707 · .alarm-item:1404-1409 · .alarm-macro:1720-1725 · .alarm-msg:1703-1704 · .alarm-panel:1691-1691 · .alarm-past:1715-1719 · .alarm-time:1692-1692 · .alarms-empty:1412-1413 · .alarms-mgmt:1398-1398 · .alarms-section:1399-1400 · .alarms-sub:1401-1403 · .analisis-card:574-576 · .analisis-cards:563-563 · .analisis-hbar:577-582 · .analisis-input:592-595 · .analisis-ins:601-606 · .analisis-insurance:600-600 · .analisis-mortgage:583-599 · .app-logo:58-58 · .app-version:120-120 · .bd-alarm:1362-1633 · .bd-detail:1448-1455 · .bday-add:1058-1059 · .bday-badge:1005-1007 · .bday-cancel:1022-1023 · .bday-cell:999-1062 · .bday-hdr:992-1342 · .bday-ic:1731-1735 · .bday-inline:1730-1730 · .bday-io:1038-1042 · .bday-list:1009-1033 · .bday-listo:1727-1727 · .bday-month:1008-1008 · .bday-num:1004-1004 · .bday-search:1035-1037 · .bday-upcoming:1044-1360 · .bday-view:993-995 · .bday-vip:1011-1359 · .bday-week:996-998 · .boda-actions:1802-1802 · .boda-add:1804-1804 · .boda-asg:1819-1841 · .boda-card:1771-1781 · .boda-class:1788-1795 · .boda-controls:1770-1770 · .boda-couple:1793-1793 · .boda-cpk:1813-1818 · .boda-date:1803-1803 · .boda-day:1785-1787 · .boda-det:1809-1812 · .boda-dot:1775-1775 · .boda-falta:1782-1782 · .boda-inp:1791-1791 · .boda-legend:1805-1808 · .boda-mini:1800-1801 · .boda-mode:1762-1764 · .boda-name:1776-1776 · .boda-ok:1783-1783 · .boda-place:1794-1794 · .boda-prog:1778-1779 · .boda-ro:1796-1799 · .boda-sec:1761-1761 · .boda-sobra:1784-1784 · .boda-sum:1766-1769 · .boda-summary:1765-1765 · .boda-time:1792-1792 · .boda-tp:1842-1845 · .boda-wed:1777-1777 · .bottom-sheet:166-167 · .btn-icon:99-1679 · .build-badge:207-207 · .build-dot:208-208 · .csv-export:71-72 · .data-actions:95-1681 · .data-btn:96-1677 · .data-menu:114-119 · .day-cell:134-214 · .day-date:139-139 · .day-hours:140-140 · .day-name:138-138 · .day-status:147-147 · .days-grid:133-133 · .default-hours:69-77 · .dp-actions:1258-1259 · .dp-counter:1245-1246 · .dp-day:1253-1257 · .dp-days:1252-1252 · .dp-grid:1247-1247 · .dp-handle:1240-1240 · .dp-hdr:1241-1241 · .dp-mhdr:1250-1251 · .dp-mname:1249-1249 · .dp-month:1248-1248 · .dp-overlay:1236-1239 · .dp-sheet:1238-1238 · .dp-title:1242-1242 · .dp-yearnav:1243-1244 · .drum-picker:1696-1699 · .drum-sel:1702-1702 · .drum-wrap:1695-1701 · .econ-add:509-510 · .econ-ahorro:730-737 · .econ-annual:339-339 · .econ-avg:340-657 · .econ-bracket:492-498 · .econ-calc:640-641 · .econ-casc:644-651 · .econ-cascade:643-643 · .econ-chart:522-523 · .econ-comp:500-524 · .econ-decl:487-661 · .econ-distrib:967-981 · .econ-donut:748-763 · .econ-equiv:962-965 · .econ-fiscal:741-746 · .econ-formula:359-362 · .econ-gastos:663-675 · .econ-gear:459-460 · .econ-hdr:381-461 · .econ-ingresado:347-347 · .econ-irpf:677-739 · .econ-legend:525-526 · .econ-line:520-521 · .econ-month:364-377 · .econ-mr:959-960 · .econ-multi:951-961 · .econ-opt:636-639 · .econ-qcard:329-336 · .econ-qcell:325-1640 · .econ-qm:334-334 · .econ-qmonth:332-333 · .econ-quarter:321-1637 · .econ-rate:463-471 · .econ-row:348-358 · .econ-sc:502-988 · .econ-scenario:501-501 · .econ-section:378-378 · .econ-sim:528-538 · .econ-stats:475-480 · .econ-sub:384-390 · .econ-tab:382-383 · .econ-toggle:482-485 · .econ-val:363-363 · .est-btn:395-399 · .est-card:405-407 · .est-detail:402-402 · .est-field:414-420 · .est-fields:413-413 · .est-group:393-397 · .est-modo:408-408 · .est-nav:392-392 · .est-section:401-401 · .est-tariff:403-412 · .ev-alarm:1373-1373 · .ev-ann:1296-1332 · .ev-annual:1177-1530 · .ev-badge:1556-1556 · .ev-badges:1498-1498 · .ev-bars:1493-1493 · .ev-bright:1532-1543 · .ev-btn:1469-1756 · .ev-cell:1063-1552 · .ev-char:1583-1583 · .ev-checkbox:1588-1588 · .ev-color:1150-1169 · .ev-colors:1584-1584 · .ev-date:1585-1585 · .ev-dates:1231-1233 · .ev-day:1501-1508 · .ev-daynote:1749-1749 · .ev-detail:1171-1750 · .ev-dot:152-152 · .ev-dots:151-151 · .ev-edit:1286-1598 · .ev-field:1577-1578 · .ev-filter:1334-1335 · .ev-form:1572-1593 · .ev-hdr:1343-1459 · .ev-input:1579-1580 · .ev-io:1293-1604 · .ev-kind:1742-1746 · .ev-list:1474-1570 · .ev-month:1482-1482 · .ev-multi:1494-1527 · .ev-note:1748-1748 · .ev-num:1554-1554 · .ev-otros:1218-1512 · .ev-puente:1519-1519 · .ev-quad:1281-1548 · .ev-repeat:1589-1589 · .ev-sep:1105-1105 · .ev-shape:1219-1226 · .ev-textarea:1581-1582 · .ev-toggle:1586-1587 · .ev-type:1143-1151 · .ev-types:1477-1479 · .ev-upcoming:1089-1367 · .ev-view:1460-1462 · .ev-wd:1591-1592 · .ev-week:1488-1517 · .ev-weekday:1590-1590 · .ev-wk:1108-1141 · .ev-zone:1464-1467 · .excl-item:307-473 · .excl-row:306-472 · .fiscal-add:629-792 · .fiscal-bracket:620-628 · .fiscal-compras:821-856 · .fiscal-copy:456-458 · .fiscal-custom:617-617 · .fiscal-ded:831-845 · .fiscal-desgrav:794-846 · .fiscal-despacho:858-879 · .fiscal-error:633-633 · .fiscal-gasto:765-827 · .fiscal-gastos:847-847 · .fiscal-hdr:777-777 · .fiscal-highlight:818-818 · .fiscal-onoff:860-861 · .fiscal-pct:618-627 · .fiscal-period:773-774 · .fiscal-radio:612-616 · .fiscal-save:631-632 · .fiscal-section:610-785 · .fiscal-sticky:782-782 · .fiscal-subsection:786-787 · .fiscal-tab:778-780 · .fiscal-viaje:788-789 · .fiscal-vinc:871-872 · .fiscal-year:452-455 · .full-overlay:228-229 · .header:54-1682 · .header-brand:57-57 · .hip-add:949-949 · .hip-auto:900-900 · .hip-bar:886-893 · .hip-cancel:936-936 · .hip-cf:905-910 · .hip-edit:932-934 · .hip-g2:904-904 · .hip-grid:898-898 · .hip-period:938-947 · .hip-resumen:881-885 · .hip-ro:923-930 · .hip-save:935-935 · .hip-section:899-948 · .hip-stat:895-897 · .hip-stats:894-894 · .hip-sub:902-902 · .hip-vinc:901-901 · .hip-vr:912-921 · .home-popup:1415-1424 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:1848-1858 · .logo-gallery:1623-1630 · .logo-popup:1614-1621 · .macro-section:1426-1427 · .macro-url:1428-1430 · .mg-budget:439-448 · .mg-cat:449-449 · .mg-desgrav:450-450 · .mg-sort:445-445 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:310-310 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:311-311 · .nav-bar:1339-1686 · .nav-btn:62-63 · .option-desc:182-182 · .option-dot:175-179 · .option-hours:183-183 · .option-info:180-180 · .option-label:181-181 · .overlay:164-165 · .overlay-nav:1338-1340 · .pdf-export:73-74 · .rate-input:318-1877 · .rate-label:317-317 · .rate-row:316-316 · .rate-suffix:319-319 · .sent-badge:130-130 · .sheet-handle:168-168 · .sheet-option:172-174 · .sheet-options:171-171 · .sheet-subtitle:170-170 · .sheet-title:169-169 · .sim-combo:540-544 · .sim-field:529-530 · .sim-hr:539-539 · .sim-period:536-536 · .sim-target:531-535 · .sub-block:565-566 · .sub-row:567-573 · .sw-upd:193-193 · .sy-back:234-1868 · .sy-body:253-1866 · .sy-card:264-1872 · .sy-cards3:256-256 · .sy-cards4:257-257 · .sy-chart:282-282 · .sy-hdr:239-239 · .sy-header:233-1867 · .sy-lbl:273-1871 · .sy-list:286-313 · .sy-month:300-300 · .sy-nav:243-1545 · .sy-note:283-285 · .sy-pdf:245-246 · .sy-puente:292-1357 · .sy-section:254-255 · .sy-spain:258-263 · .sy-sublbl:338-338 · .sy-suelto:297-299 · .sy-tab:1345-1348 · .sy-table:274-1873 · .sy-td:279-279 · .sy-tr:280-1874 · .sy-val:269-1870 · .sy-year:236-1869 · .toast:186-191 · .toast-undo:195-195 · .today-btn:64-65 · .vac-config:302-304 · .vip-no:1017-1018 · .week-actions:155-155 · .week-card:124-204 · .week-header:127-127 · .week-info:128-129 · .week-total:131-131 · .weeks-container:123-123

