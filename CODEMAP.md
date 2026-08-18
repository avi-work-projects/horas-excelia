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

### js/bodas.js  _(923 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_SHORT:28 · BODA_PLACES:29 · BODA_WHITE:40 · BODA_SLOTS:41 · BODA_NO_TIME_COLOR:47 · BODA_NO_COUPLE_COLOR:48 · BODA_DEFAULT_TIME:49 · BODA_PALETTE:52 · BODA_SUBTAB:155 · BODA_CLASS_MODE:156 · BODA_FILTER_COUPLE:157 · BODA_HIDE_PAST:158 · BODA_PAREJAS_FILTER:159 · BODA_CAL_YEAR:160 · BODA_CAL_MONTH:161 · MN2:176 · BODA_ASSIGN:443 · BODA_TIME_H:674

**Funciones:** saveBodas:18 · bodaPlaceOf:30 · bodaNextColor:54 · bodaCouple:62 · bodaSlot:66 · bodaSlotColors:76 · bodaSlotColor:80 · evBodaSvg:83 · bodaClasses:100 · bodaClassesOfCouple:103 · bodaFreeClasses:106 · bodaSortClasses:109 · bodaClassesOnDay:116 · bodaNewClass:119 · bodaPlaceForNewOn:130 · bodaDayFull:135 · bodaBulkCreate:139 · bodaProgress:149 · _bodaLegendHtml:164 · _renderBodaCalendario:175 · _bodaFirstWord:232 · renderBodasBody:235 · _renderBodaParejas:249 · _bodaFmt:289 · _bodaFmtCorto:290 · _renderBodaClases:297 · openBodaCoupleDetail:380 · closeBodaCoupleDetail:432 · openBodaAssign:444 · closeBodaAssign:469 · renderBodaAssign:474 · bindBodaAssign:555 · openBodaCouplePicker:619 · row:629 · apply:652 · closeBodaCouplePicker:667 · openBodaTimePicker:677 · drum:682 · setDrum:711 · mark:716 · drumVal:720 · readManual:741 · closeBodaTimePicker:762 · renderBodaCoupleForm:769 · openBodaCoupleForm:793 · closeBodaCoupleForm:836 · bindBodasEvents:843 · findClass:879

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

### js/events.js  _(2382 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_VIEW:31 · EV_EDIT:32 · EV_EDIT_DS:33 · EV_FORM_CONTAINER:34 · EV_EDIT_MODE:35 · EV_BRIGHT_PAST:36 · EV_ANNUAL_VIEW:37 · EV_ANNUAL_FILTER_HIDDEN:38 · EV_PREV_VIEW:39 · EV_QUAD_YEAR:40 · EV_QUAD_MONTH:41 · EV_TO_SUBTAB:42 · EV_LIST_SUBTAB:43 · EV_TYPES_FILTER:44 · EV_TYPES_PAST:45 · EV_COLORS:46 · EVENTS:47 · EV_ALARM_SK:74 · EV_ALARMS_SET:75 · EV_MAX_DAY_EVENTS:251 · EV_CAL_BADGE_STACK:252 · EV_CAL_CORNER_STACK:253 · DN7:293 · MNS:665 · MNS:842

**Funciones:** _switchEvView:16 · saveEvents:69 · loadEvAlarms:76 · saveEvAlarms:77 · _findBdayByEvId:78 · isEvAlarmSet:90 · setEvAlarmState:96 · evDk:103 · _evClampDate:112 · eventOccursOn:116 · getEventsOn:157 · _fmtDayEs:165 · evDayLimitExceeded:166 · hasUpcomingEvent:195 · updateEventsBtn:204 · evUniqueColor:214 · evDefaultShape:225 · evMarkerHtml:231 · evMorePlusHtml:245 · evAnnualXsHtml:254 · vipStarSvgHtml:264 · evSoftFillColor:274 · renderEvCalMonth:282 · _cornerHtml:360 · renderEvList:414 · renderEvByMonths:425 · renderEvListItem:444 · fd2:448 · getNextOccurrence:477 · evIsoDate:519 · _isVipBdayTooFar:520 · renderEvUpcoming:524 · fd2:531 · renderEvItem:532 · renderEvAnnual:649 · annEvVisible:659 · renderEvQuad:810 · _loadP:818 · annEvVisible:828 · renderEvByTypes:974 · renderEvMonthsView:1010 · renderEvWeek:1020 · hexA:1024 · renderEvContent:1124 · renderEvDetail:1259 · fd2:1262 · openEvDetail:1321 · closeEvDetail:1414 · evPuntualDays:1421 · _renderEvTypeSwatches:1429 · renderEvForm:1444 · openEvForm:1576 · closeEvForm:1606 · bindEvFormEvents:1618 · _refreshShapePreviews:1634 · _refreshPickDatesLabel:1639 · _curKind:1658 · _applyTypeUI:1659 · _bindTypeSwatches:1670 · renderEvAlarmPanel:1843 · fd2:1845 · openEvAlarm:1878 · closeEvAlarm:1889 · openBdayAlarmFromEvents:1899 · bindEvAlarmEvents:1910 · fmtD:1956 · openEvents:1973 · closeEvents:1983 · openEventsAt:1990 · refreshEvents:1997 · bindEvEvents:2002 · _scrollWeekToMonth:2010 · _scrollWeekToToday:2057 · doScroll:2067 · apply:2326 · _positionEvBright:2368

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

### css/styles.css  _(1921 líneas)_

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
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:232
- OVERLAY BASE (summary, econ, bday, events):238
- SHARED OVERLAY HEADER:243
- SHARED BODY:263
- Vacaciones config:312
- Quitar festivos/vacaciones checkboxes:316
- Month summary breakdown:320
- Ausencia list tag:323
- ECONOMICS:326
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:331
- Summary sublabel (hours breakdown):348
- Ingresado box (formerly cobrado) — neutral:357
- ECONOMICS v2: tabs + nuevas secciones:391
- Estudio Cambio — grouped nav:402
- Estudio — tariff comparison cards:411
- Análisis hipoteca — secciones organizadas:432
- Mis gastos — budget table:449
- Year selector for per-year fiscal tabs:462
- §1.1 Tarifa dual:473
- §1.3 Stats por hora/día:485
- §1.4 Toggles:492
- §1.5 Declaración IRPF:497
- Tab 2: Comparador:510
- Calcular Tarifa (sim):538
- Scenario zones (Comparar Escenarios):556
- Análisis Ec. Personal:573
- Bloques de la Subrogación:575
- Fiscal config modal — purple theme override:618
- Fiscal config modal:620
- ECONOMICS v3: opt-buttons, cascade, gastos:646
- Cascade ingresos/gastos:653
- Media mensual: cards:663
- Tab 4: Análisis:673
- IRPF Breakdown visual:687
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:714
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):716
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):740
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:749
- Resumen fiscal al final de Ingresos y Gastos:751
- Donut chart:758
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):768
- Fiscal config: gastos items:775
- Fiscal: tab bar:787
- Fiscal: sticky save:792
- Fiscal: section title income/expense colors:794
- Fiscal: desgravaciones:804
- Fiscal: compras profesionales:831
- Desgravaciones: notas + tabla despacho info:839
- Nota IVA compras:859
- IVA por item en compras:861
- Fiscal: despacho en casa:868
- Hipoteca — resumen visual:891
- Hipoteca — compact 2-col grid:914
- Hipoteca — compact vinculaciones:922
- Hipoteca — read-only fields:933
- Hipoteca — edit/detail buttons:942
- Hipoteca — period summary card:948
- Multi-rate period cards:961
- Distribución de ingresos:977
- Comparador: reorder buttons:993
- Rate input styled:997
- BIRTHDAYS:1001
- VIP controls bar:1021
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1032
- VIP edit mode item states:1035
- Feat 1: Buscador en lista por meses:1045
- Upcoming birthdays:1054
- Weekend frame — gris lavanda suave:1071
- Day types in events calendar — border-top + tinte de fondo:1076
- Events in puentes (summary) — one per line:1095
- Events upcoming view:1099
- Vista semanal (Agenda):1117
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1120
- Grid del mes: col fecha (48px) + col eventos (1fr):1122
- Columna fecha (col 1):1124
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1133
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1139
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1143
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1149
- Event color type picker:1153
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1159
- Color picker avanzado (paleta 6×8 + color libre):1163
- Detail color picker toggle:1181
- Annual events calendar:1187
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1217
- Selector de formas en el formulario de evento (Otros):1228
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1234
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1238
- Inicio/Fin bloqueados cuando hay Selección Multidía:1241
- Mini-overlay para elegir días específicos (Otros):1246
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1273
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1277
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1279
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1281
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1283
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1289
- Calendario 4 meses: 2 columnas × 2 filas:1291
- Botón ir al calendario mensual en puentes del resumen:1293
- Pencil edit button in annual/quad controls:1305
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1306
- Feat 6: Puentes rallados en anual:1310
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1311
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1328
- Dropdown de vista anual:1335
- Barras multi-día en vista mensual (fila propia encima de las celdas):1347
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1348
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1352
- Summary tabs — nivel 2:1355
- BRIDGE DAY CELLS in summary:1360
- VIP BIRTHDAYS:1369
- BIRTHDAY + EVENT ALARM PANEL:1372
- Campana de alarma en items de próximos (bday + eventos):1375
- 3-ZONE ALARM MARKER:1395
- ALARM MANAGEMENT OVERLAY:1408
- HOME POPUP (semanas pendientes / VIP sin alarma):1425
- MACRO URL EN MENÚ:1436
- Feat 4: Nav-bar emoji alignment:1442
- Birthday detail / form overlays:1458
- EVENTS:1468
- Zone A: upcoming/list views — subtle blue tint:1474
- Zone B: calendar grid views — subtle teal tint, active = green:1476
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1479
- Feat 2: Lista de Eventos subtabs:1484
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1501
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1503
- Contenedor de badges 1-día: centrado verticalmente en la celda:1506
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1513
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1517
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1527
- Perímetro puente: capa inferior a eventos:1529
- Bright past: bombilla override:1542
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1546
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1547
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1552
- Quad label 3 lines:1557
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1564
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1566
- Events list view:1568
- Event form overlay (inside eventsOverlay):1582
- Event detail:1616
- LOGO POPUP:1624
- Gallery:1633
- BD ALARM VIP TOGGLE:1642
- RESPONSIVE (mobile header):1645
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1647
- ALARM PANEL:1700
- Drum picker (selector giratorio de hora/minuto):1705
- Confirmación alarma en el pasado:1725
- Botón flotante "Listo" en modo Editar VIPs:1737
- Controles inline long-press cumpleaños:1740
- Selector de clase en el formulario:1752
- Notas: general vs de un dia concreto:1758
- Pestana Bodas y pestana partida Vacaciones/Festivos:1762
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1767
- Pestana Bodas:1773
- Filtros de Parejas como chips pulsables:1785
- Los tres botones del detalle de pareja comparten aspecto:1830
- Subpestana Calendario de bodas:1866
- Diálogo: modo de importación (añadir vs reemplazar):1889
- PRINT:1902

**Rangos por prefijo de clase:** 
.action-btn:156-160 · .ah-cuota:436-438 · .ah-donut:446-448 · .ah-section:433-435 · .ah-total:443-445 · .ah-vs:439-442 · .alarm-cfg:1701-1701 · .alarm-colon:1704-1704 · .alarm-create:1716-1717 · .alarm-day:1722-1724 · .alarm-days:1719-1721 · .alarm-delete:1421-1422 · .alarm-ics:1718-1718 · .alarm-item:1415-1420 · .alarm-macro:1731-1736 · .alarm-msg:1714-1715 · .alarm-panel:1702-1702 · .alarm-past:1726-1730 · .alarm-time:1703-1703 · .alarms-empty:1423-1424 · .alarms-mgmt:1409-1409 · .alarms-section:1410-1411 · .alarms-sub:1412-1414 · .analisis-card:585-587 · .analisis-cards:574-574 · .analisis-hbar:588-593 · .analisis-input:603-606 · .analisis-ins:612-617 · .analisis-insurance:611-611 · .analisis-mortgage:594-610 · .app-logo:58-58 · .app-version:120-120 · .bd-alarm:1373-1644 · .bd-detail:1459-1466 · .bday-add:1069-1070 · .bday-badge:1016-1018 · .bday-cancel:1033-1034 · .bday-cell:1010-1073 · .bday-hdr:1003-1353 · .bday-ic:1742-1746 · .bday-inline:1741-1741 · .bday-io:1049-1053 · .bday-list:1020-1044 · .bday-listo:1738-1738 · .bday-month:1019-1019 · .bday-num:1015-1015 · .bday-search:1046-1048 · .bday-upcoming:1055-1371 · .bday-view:1004-1006 · .bday-vip:1022-1370 · .bday-week:1007-1009 · .boda-actions:1822-1822 · .boda-add:1824-1824 · .boda-asg:1843-1865 · .boda-cal:1867-1883 · .boda-card:1791-1801 · .boda-chip:1787-1789 · .boda-chips:1786-1786 · .boda-class:1808-1815 · .boda-controls:1784-1784 · .boda-couple:1813-1813 · .boda-cpk:1837-1842 · .boda-date:1823-1823 · .boda-day:1805-1807 · .boda-det:1829-1836 · .boda-dot:1795-1795 · .boda-falta:1802-1802 · .boda-inp:1811-1811 · .boda-legend:1825-1828 · .boda-mini:1820-1821 · .boda-mode:1775-1777 · .boda-name:1796-1796 · .boda-ok:1803-1803 · .boda-place:1814-1814 · .boda-prog:1798-1799 · .boda-ro:1816-1819 · .boda-sec:1774-1774 · .boda-sobra:1804-1804 · .boda-sum:1780-1783 · .boda-summary:1779-1779 · .boda-time:1812-1812 · .boda-tp:1884-1887 · .boda-wed:1797-1797 · .bottom-sheet:166-167 · .btn-icon:99-1690 · .build-badge:207-207 · .build-dot:208-208 · .csv-export:71-72 · .data-actions:95-1692 · .data-btn:96-1688 · .data-menu:114-119 · .day-cell:134-236 · .day-date:139-139 · .day-hours:140-140 · .day-name:138-138 · .day-status:147-147 · .days-grid:133-133 · .default-hours:69-77 · .dp-actions:1269-1270 · .dp-counter:1256-1257 · .dp-day:1264-1268 · .dp-days:1263-1263 · .dp-grid:1258-1258 · .dp-handle:1251-1251 · .dp-hdr:1252-1252 · .dp-mhdr:1261-1262 · .dp-mname:1260-1260 · .dp-month:1259-1259 · .dp-overlay:1247-1250 · .dp-sheet:1249-1249 · .dp-title:1253-1253 · .dp-yearnav:1254-1255 · .drum-picker:1707-1710 · .drum-sel:1713-1713 · .drum-wrap:1706-1712 · .econ-add:520-521 · .econ-ahorro:741-748 · .econ-annual:350-350 · .econ-avg:351-668 · .econ-bracket:503-509 · .econ-calc:651-652 · .econ-casc:655-662 · .econ-cascade:654-654 · .econ-chart:533-534 · .econ-comp:511-535 · .econ-decl:498-672 · .econ-distrib:978-992 · .econ-donut:759-774 · .econ-equiv:973-976 · .econ-fiscal:752-757 · .econ-formula:370-373 · .econ-gastos:674-686 · .econ-gear:470-471 · .econ-hdr:392-472 · .econ-ingresado:358-358 · .econ-irpf:688-750 · .econ-legend:536-537 · .econ-line:531-532 · .econ-month:375-388 · .econ-mr:970-971 · .econ-multi:962-972 · .econ-opt:647-650 · .econ-qcard:340-347 · .econ-qcell:336-1651 · .econ-qm:345-345 · .econ-qmonth:343-344 · .econ-quarter:332-1648 · .econ-rate:474-482 · .econ-row:359-369 · .econ-sc:513-999 · .econ-scenario:512-512 · .econ-section:389-389 · .econ-sim:539-549 · .econ-stats:486-491 · .econ-sub:395-401 · .econ-tab:393-394 · .econ-toggle:493-496 · .econ-val:374-374 · .est-btn:406-410 · .est-card:416-418 · .est-detail:413-413 · .est-field:425-431 · .est-fields:424-424 · .est-group:404-408 · .est-modo:419-419 · .est-nav:403-403 · .est-section:412-412 · .est-tariff:414-423 · .ev-alarm:1384-1384 · .ev-ann:1307-1343 · .ev-annual:1188-1541 · .ev-badge:1567-1567 · .ev-badges:1509-1509 · .ev-bars:1504-1504 · .ev-bright:1543-1554 · .ev-btn:1480-1769 · .ev-cell:1074-1563 · .ev-char:1594-1594 · .ev-checkbox:1599-1599 · .ev-color:1161-1180 · .ev-colors:1595-1595 · .ev-date:1596-1596 · .ev-dates:1242-1244 · .ev-day:1512-1519 · .ev-daynote:1760-1760 · .ev-detail:1182-1761 · .ev-dot:152-152 · .ev-dots:151-151 · .ev-edit:1297-1609 · .ev-field:1588-1589 · .ev-filter:1345-1346 · .ev-form:1583-1604 · .ev-hdr:1354-1470 · .ev-input:1590-1591 · .ev-io:1304-1615 · .ev-kind:1753-1757 · .ev-list:1485-1581 · .ev-month:1493-1493 · .ev-multi:1505-1538 · .ev-note:1759-1759 · .ev-num:1565-1565 · .ev-otros:1229-1523 · .ev-puente:1530-1530 · .ev-quad:1292-1559 · .ev-repeat:1600-1600 · .ev-sep:1116-1116 · .ev-shape:1230-1237 · .ev-textarea:1592-1593 · .ev-toggle:1597-1598 · .ev-type:1154-1162 · .ev-types:1488-1490 · .ev-upcoming:1100-1378 · .ev-view:1471-1473 · .ev-wd:1602-1603 · .ev-week:1499-1528 · .ev-weekday:1601-1601 · .ev-wk:1119-1152 · .ev-zone:1475-1478 · .excl-item:318-484 · .excl-row:317-483 · .fiscal-add:640-803 · .fiscal-bracket:631-639 · .fiscal-compras:832-867 · .fiscal-copy:467-469 · .fiscal-custom:628-628 · .fiscal-ded:842-856 · .fiscal-desgrav:805-857 · .fiscal-despacho:869-890 · .fiscal-error:644-644 · .fiscal-gasto:776-838 · .fiscal-gastos:858-858 · .fiscal-hdr:788-788 · .fiscal-highlight:829-829 · .fiscal-onoff:871-872 · .fiscal-pct:629-638 · .fiscal-period:784-785 · .fiscal-radio:623-627 · .fiscal-save:642-643 · .fiscal-section:621-796 · .fiscal-sticky:793-793 · .fiscal-subsection:797-798 · .fiscal-tab:789-791 · .fiscal-viaje:799-800 · .fiscal-vinc:882-883 · .fiscal-year:463-466 · .full-overlay:239-240 · .header:54-1693 · .header-brand:57-57 · .hip-add:960-960 · .hip-auto:911-911 · .hip-bar:897-904 · .hip-cancel:947-947 · .hip-cf:916-921 · .hip-edit:943-945 · .hip-g2:915-915 · .hip-grid:909-909 · .hip-period:949-958 · .hip-resumen:892-896 · .hip-ro:934-941 · .hip-save:946-946 · .hip-section:910-959 · .hip-stat:906-908 · .hip-stats:905-905 · .hip-sub:913-913 · .hip-vinc:912-912 · .hip-vr:923-932 · .home-popup:1426-1435 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:1890-1900 · .logo-gallery:1634-1641 · .logo-popup:1625-1632 · .macro-section:1437-1438 · .macro-url:1439-1441 · .mg-budget:450-459 · .mg-cat:460-460 · .mg-desgrav:461-461 · .mg-sort:456-456 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:321-321 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:322-322 · .nav-bar:1350-1697 · .nav-btn:62-63 · .option-desc:182-182 · .option-dot:175-179 · .option-hours:183-183 · .option-info:180-180 · .option-label:181-181 · .overlay:164-165 · .overlay-nav:1349-1351 · .pdf-export:73-74 · .rate-input:329-1919 · .rate-label:328-328 · .rate-row:327-327 · .rate-suffix:330-330 · .sent-badge:130-130 · .sheet-handle:168-168 · .sheet-option:172-174 · .sheet-options:171-171 · .sheet-subtitle:170-170 · .sheet-title:169-169 · .sim-combo:551-555 · .sim-field:540-541 · .sim-hr:550-550 · .sim-period:547-547 · .sim-target:542-546 · .sub-block:576-577 · .sub-row:578-584 · .sw-upd:193-193 · .sy-back:245-1910 · .sy-body:264-1908 · .sy-card:275-1914 · .sy-cards3:267-267 · .sy-cards4:268-268 · .sy-chart:293-293 · .sy-hdr:250-250 · .sy-header:244-1909 · .sy-lbl:284-1913 · .sy-list:297-324 · .sy-month:311-311 · .sy-nav:254-1556 · .sy-note:294-296 · .sy-pdf:256-257 · .sy-puente:303-1368 · .sy-section:265-266 · .sy-spain:269-274 · .sy-sublbl:349-349 · .sy-suelto:308-310 · .sy-tab:1356-1359 · .sy-table:285-1915 · .sy-td:290-290 · .sy-tr:291-1916 · .sy-val:280-1912 · .sy-year:247-1911 · .toast:186-191 · .toast-undo:195-195 · .today-btn:64-65 · .vac-config:313-315 · .vip-no:1028-1029 · .week-actions:155-155 · .week-card:124-218 · .week-header:127-127 · .week-info:128-129 · .week-total:131-131 · .weeks-container:123-123

