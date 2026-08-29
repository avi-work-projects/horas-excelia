# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays.js  _(1015 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:65 · BDAY_ALARM_SET:66 · BDAY_ALARM_COUNT_KEY:67 · BDAY_ALARM_COUNT:68 · BDAY_PALETTE:72 · BDAYS:76 · DN7:236

**Funciones:** _showBdayInlineCtrl:17 · tc:85 · bdName:86 · getBdayColor:88 · getBdaysOn:97 · daysUntil:99 · hasUpcomingBday:106 · updateBdayBtn:112 · getBdayAlarmKey:122 · isBdayAlarmSet:123 · setBdayAlarmState:124 · syncVipBdaysToEvents:130 · renderBdayUpcoming:155 · getBdaysInRange:160 · bdayLabel:175 · renderGroup:184 · renderBdayCalMonth:234 · renderBdayList:275 · getEffVip:282 · renderBdayContent:324 · renderBdayDetail:392 · renderBdayAlarmPanel:413 · fmtDate:425 · openBdayAlarm:480 · _bdRefreshBoth:487 · closeBdayAlarm:492 · bindBdayAlarmEvents:494 (!147) · fmtD:610 · onOk:618 · onErr:619 · renderBdayForm:641 · openBdayDetail:674 · closeBdayDetail:684 · openBdayForm:687 · closeBdayForm:697 · bindBdayFormEvents:701 · openBday:742 · closeBday:751 · refreshBday:757 · applyBdaySearch:762 · bindBdayEvents:774 (!241) · _bdResetScroll:805 · _bdScrollToMonth:807

### js/bodas.js  _(1665 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:25 · BODA_PLACE_DEFAULT:31 · BODA_PLACE_NONE:34 · BODA_PLACE_SHORT:35 · BODA_PLACE_DESC:36 · BODA_PLACE_EMOJI:38 · BODA_WHITE:55 · BODA_SLOTS:56 · BODA_NO_TIME_COLOR:62 · BODA_NO_COUPLE_COLOR:63 · BODA_DEFAULT_TIME:64 · BODA_PALETTE:67 · BODA_CLOSED_SK:223 · BODA_CLOSED:224 · BODA_PENDING:239 · BODA_SUBTAB:280 · BODA_CLASS_MODE:281 · BODA_CLASES_SEARCH:282 · BODA_HIDE_PAST:283 · BODA_HIDE_CLOSED:284 · BODA_CARD_OPEN:285 · BODA_PAREJAS_SEARCH:286 · BODA_PAREJAS_SORT:289 · BODA_PAREJAS_FILTER:290 · BODA_CAL_HL:291 · BODA_CAL_YEAR:292 · BODA_CAL_MONTH:293 · DN2:817 · BODA_ASSIGN:864 · BODA_FORM:1109 · BODA_TIME_H:1308

**Funciones:** saveBodas:18 · bodaPlaceEmoji:39 · bodaPlaceOf:43 · bodaPlaceLabel:48 · bodaNextColor:69 · bodaCouple:77 · bodaSlot:81 · bodaSlotColors:91 · bodaMarkFor:96 · evBodaSvg:102 · bodaClasses:119 · bodaPrimeraClase:123 · bodaClassesOfCouple:127 · bodaFreeClasses:130 · bodaClaseById:133 · bodaSortClasses:137 · bodaClassesOnDay:144 · bodaNewClass:147 · bodaNormalizeClasses:162 · bodaPlaceForNewOn:197 · bodaDayFull:202 · bodaBulkCreate:207 · bodaProgress:217 · saveBodaClosed:228 · bodaIsClosed:229 · bodaToggleClosed:230 · bodaPendingCount:240 · bodaEff:242 · bodaSetPending:250 · bodaPendingApply:254 · bodaPendingDiscard:277 · _bodaLegendHtml:296 · _renderBodaCalendario:307 (!85) · renderBodasBody:392 · _bodaCmpFecha:421 · _renderBodaParejas:427 (!89) · _bodaFmt:516 · _bodaFmtCorto:517 · _renderBodaClases:524 (!108) · bodaOpenSheet:632 · bodaCloseSheet:635 · bodaCreatedAt:641 · bodaIssues:646 · _renderBodaIssueCards:662 · card:665 · openBodaIssue:686 (!81) · findEv:728 · closeBodaIssue:767 · _bodaWeekKey:770 · _renderBodaStats:777 (!88) · openBodaAssign:865 · closeBodaAssign:885 · renderBodaAssign:889 (!81) · bindBodaAssign:970 · openBodaPlacePicker:1039 · closeBodaPlacePicker:1072 · bodaAplicarCampo:1076 · bodaTrasElegir:1086 · _bodaMasUnaHora:1098 · openBodaClaseForm:1110 · _bodaFormRender:1126 (!131) · closeBodaClaseForm:1257 · openBodaCouplePicker:1263 · row:1274 · apply:1291 · closeBodaCouplePicker:1305 · openBodaTimePicker:1311 · drum:1316 · setDrum:1339 · mark:1344 · drumVal:1348 · readManual:1369 · closeBodaTimePicker:1389 · renderBodaCoupleForm:1392 · openBodaCoupleForm:1416 · closeBodaCoupleForm:1453 · bodaRefreshRow:1457 · bindBodasEvents:1486 (!179) · _guardaPendientes:1488 · _bodaCalMove:1504 · findClass:1601

### js/core.js  _(722 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:133 · MN_SHORT:135 · DN5:356 · FESTIVOS_ANIO:572

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:140 · save:152 · loadEconYear:156 · saveEconYear:175 · fakeTrans:185 · simpleBarChart:202 · hBarRows:226 · shareOrDownload:243 · escHtml:263 · mkey:268 · getMonthH:269 · defH:275 · dayH:276 · dayT:277 · dk:278 · fd:279 · ad:280 · fh:281 · fhP:282 · isToday:283 · isPast:284 · wn:285 · weeks:288 · getWD:303 · showToast:319 · sendEmail:345 · buildMailtoBody:355 · render:377 (!97) · fmtH:453 · openSheet:474 · closeSheet:493 · selectType:499 · contarVacaciones:532 · confirmarCupoVacaciones:545 · contarFestivos:560 · confirmarCupoFestivos:573 · togSent:582 · _panelBorrarLuego:603 · _panelCancelarBorrado:614 · abrirPanel:616 · engancharFondo:636 · abrirUnaVez:654 · cerrarPanel:660 · renderNavBar:671 · bindNavBar:694 · doNav:701

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(704 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:334 · ESTUDIO_ELECT_CALC:335 · ESTUDIO_ELECT_IVA:336

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:238 · _renderEstudioGasComp:246 · _renderGasCompCard:306 · _calcElectCost:338 · _currentElectTariff:347 · _renderEstudioElectComp:352 · _renderElectCompCard:413 · _renderMultiScenarioResult:442 · _bindEstudioGas:510 · _bindEstudioElect:540 · _bindScenarios:570 · _readScenarios:589 · _bindCompFields:598 · _saveCompFields:631 · renderEstudioContent:646 · openEstudio:660 · closeEstudio:670 · reRenderEstudio:675 · bindEstudioEvents:683

### js/economics-fiscal-bind.js  _(554 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:22 · reRenderFiscal:28 · bindFiscalEvents:38 · _switchTab:42 · _bindYearSelector:75 · _bindTabPersonal:112 · _bindTabIrpf:161 · _bindTabGastosDesg:206 (!91) · _rebindComprasDel:255 · _bindTabIrpfDeduc:297 · _bindTabDesgrav:310 (!96) · _bindList:312 · _bindTabDespachoOnly:406 (!83) · _syncLiveD:417 · _updateFmt:455 · _saveFiscalAll:489 · _rv:518

### js/economics-fiscal-datos.js  _(337 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · FISCAL_HIP_SUB:30 · FISCAL_HIP_EDITING:31 · FISCAL_HIP_EDIT_SNAPSHOT:32 · FISCAL_HIP_DETAIL_TARGET:33 · PERSONAL_SK:39 · PERSONAL_DATA:40 · DEFAULT_PERSONAL_GASTOS_REC:42 · DEFAULT_PERSONAL_INVERSIONES:48 · INGRESOS_SK:92 · INGRESOS_ITEMS:93 · GASTOS_SK:110 · GASTOS_DIFICIL_PCT:111 · DEFAULT_GASTOS:112 · GASTOS_ITEMS:130 · COMPRAS_SK:192 · COMPRAS_IVA_ENABLED:193 · DEFAULT_COMPRAS:194 · COMPRAS_ITEMS:200 · DESGRAV_SK:247 · DESGRAV_DEFAULT:249 · DESGRAV_ITEMS:269 · OBSOLETE_IDS:272

**Funciones:** _yearKey:36 · _ensureDefaults:55 · loadPersonalYear:71 · savePersonalYear:87 · loadIngresos:94 · saveIngresos:97 · findIngreso:100 · ingresoAnual:104 · loadFiscal:132 · saveFiscal:140 · getIrpfPct:143 · getBrackets:144 · _loadGastosFromRaw:146 · loadGastosYear:164 · loadGastos:177 · saveGastosYear:178 · findGasto:181 · gastoAnual:185 · loadCompras:201 · saveCompras:218 · comprasTotal:222 · comprasIvaTotal:232 · loadDesgrav:271 · saveDesgrav:302 · desgravAnual:305 · computeTotalDesgrav:326

### js/economics-fiscal-elect.js  _(229 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:125

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:75 · _despField:90 · _despFieldMoney:99 · _renderIngresosDesgList:112 · _renderGastoItem:131 · renderGastosList:146 · _bindElectDetalle:168 · _bindSegurosNormales:213

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:72

### js/economics-fiscal-hip.js  _(1033 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipPeriodCard:365 (!87) · _hipROvinc:452 · _calcInsOvercost:462 · _renderInlineOvercost:473 · _renderHipResumen:492 (!99) · _renderHipDetalle:591 · _renderHipSectionContent:617 · _renderCompraSection:629 · _renderPrestamoSection:658 · _renderSubSection:705 · renderFiscalTabDespacho:776 · _bindTabDespacho:793 · _bindHipResumen:817 · _bindHipDetalle:842 · _rerenderSection:913 · _readSectionInputs:922 · _rv:923 · _rv_s:924 · _bindEditingSection:982

### js/economics-fiscal.js  _(471 líneas)_
**Estado global:** GROUP_CASA_DESP:334 · GROUP_UTIL_DESP:335

**Funciones:** renderFiscalContent:8 · _renderYearSelector:34 · _renderCopyYearBtn:42 · _personalListHtml:65 · _personalTotal:108 · _personalTotalWeekly:118 · renderFiscalTabPersonal:127 · renderFiscalTabIrpf:168 · renderFiscalTabGastosDesg:215 · renderComprasList:246 · renderFiscalTabIrpfDeduc:295 · renderFiscalTabDesgrav:308 · renderDesgravDespachoInfo:330 · _dedCard:371 · renderDesgravList:406

### js/economics-gastos.js  _(701 líneas)_
**Estado global:** GASTOS_TOGGLES_SK:5 · GASTOS_TOGGLES:6 · GROUP_SEMIOBL:96 · GROUP_CASA:97 · GROUP_OTROS_IMP:98 · GROUP_S:472 · GROUP_C:473 · GROUP_S2:571 · GROUP_C2:572

**Funciones:** loadGastosToggles:8 · saveGastosToggles:14 · isTglOn:17 · computeDisponible:22 · renderEconGastos:45 (!155) · _gastosGroup:100 · renderResultadoDeclaracion:200 (!113) · _renderDesgloseAhorroPartida:313 · renderIrpfBreakdown:384 · _renderIrpfTramos:431 · renderIncomeDistrib:457 · pctOf:460 · distRow:461 · grpLbl:497 · _sectorPath:529 · _donutSummaryHtml:537 · renderIncomeDonut:566 · _bindDonutClick:637 · gastosCascRow:658 · gastosResultRow:675 · bindEconGastosEvents:682

### js/economics-helpers.js  _(68 líneas)_
**Funciones:** _fmtMiles:8 · _hipMoney:14 · _hipNum:19 · _hipDate:24 · _hipText:28 · _hipVinc:32 · _hipVincSum:46 · _hipRO:62 · _hipROmoney:65

### js/economics-sim.js  _(201 líneas)_
**Estado global:** SIM_TARGET:5 · SIM_PERIOD:6 · SIM_NET_MODE:7

**Funciones:** _simComputeAll:10 · _inverseSalary:48 · renderEconSim:62 (!102) · bindEconSimEvents:164

### js/economics.js  _(688 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_RATE_PERIODS:10 · ECON_ESTUDIO_SUB:14 · ESTUDIO_YEAR:15

**Funciones:** computeSalaryNet:23 · fc:41 · fcPlain:46 · _rateForDate:56 · _buildDatePeriods:71 · computeEconEx:85 · econBarChart:144 · _fmtDateEs:171 · _prevDate:176 · _ensureDatePeriods:183 · _renderRateInputs:200 · _econCard:217 · _econCards7:223 · f:225 · _getMultiRateOpts:240 · renderEconResumen:244 (!197) · renderEconContent:441 · openEcon:466 · closeEcon:482 · reRenderEcon:487 · bindEconEvents:499 · bindEconResumenEvents:537 (!151)

### js/events-bind.js  _(477 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:63 (!414) · _scrollWeekToMonth:71 · _scrollWeekToToday:118 · doScroll:128 · apply:440

### js/events-cal.js  _(360 líneas)_
**Estado global:** DN7:25

**Funciones:** renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!151) · renderEvAnnual:332 · renderEvQuad:341

### js/events-detail.js  _(602 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!117) · fd2:43 · _fila:122 · evDayCarItems:157 · evCarGo:170 · _evCarShow:178 · openEvDayCarousel:186 · closeEvDayCarousel:194 · openEvDetail:201 (!155) · repintar:241 · closeEvDetail:356 · renderEvAlarmPanel:359 (!96) · fd2:361 · openEvAlarm:455 · closeEvAlarm:461 · openBdayAlarmFromEvents:469 · bindEvAlarmEvents:477 (!125) · _syncPre:515 · fmtD:545

### js/events-form.js  _(604 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · evAdmiteRepeticion:35 · renderEvForm:38 (!188) · openEvForm:226 · closeEvForm:252 · bindEvFormEvents:264 (!340) · _refreshShapePreviews:280 · _refreshPickDatesLabel:285 · _curKind:304 · _applyTypeUI:305 · _bindTypeSwatches:334 · _viajeSync:428

### js/events-picker-color.js  _(241 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:125 · evTravelColor:134 · getEvType:140 · isEvBarAlways:148 · getEvDisplayColor:150 · _renderColorPicker:170 · _bindColorPicker:193 · updatePreview:203

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(587 líneas)_
**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!178) · fd2:50 · renderEvItem:51 · renderEvPanel:101 · renderEvByTypes:221 · coincide:247 · renderEvMonthsView:293 · renderEvWeek:302 (!132) · hexA:306 · renderEvContent:434 (!153)

### js/events.js  _(637 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:53 · EV_QUAD_YEAR:54 · EV_QUAD_MONTH:55 · EV_TO_SUBTAB:56 · EV_TYPES_FILTER:57 · EV_TYPES_PAST:58 · EV_LIST_SORT:59 · EV_LIST_SEARCH:60 · EV_COLORS:61 · EVENTS:62 · EV_ALARM_SK:91 · EV_ALARMS_SET:92 · EV_NO_RUT:184 · EV_MARK_ORDER:332 · EV_MAX_PUNT_DIA:373 · EV_MAX_RUT_DIA:374 · EV_CAL_CORNER_STACK:377 · EV_MAX_VIP_DIA:379 · EV_CAL_VIP_MAX:380 · EV_UP_SHOW_RUT:382 · EV_UP_SHOW_BODA:383 · EV_BAR_Z:432 · EV_COMPARTE_DIA:437 · EV_MNS:505 · EV_CAR:548 · EV_TRANSPORTES:567 · EV_TRANS_EMOJI:573

**Funciones:** evFilterGroup:44 · saveEvents:86 · loadEvAlarms:93 · saveEvAlarms:94 · _findBdayByEvId:95 · isEvAlarmSet:107 · setEvAlarmState:113 · evDk:120 · _evClampDate:129 · eventOccursOn:133 · getEventsOn:177 · evSignature:192 · evMergeIncoming:202 · evMergeMsg:226 · _fmtDayEs:238 · evDayLimitExceeded:239 · rutDayCount:274 · hasUpcomingEvent:281 · updateEventsBtn:290 · evDefaultShape:304 · evMarkerHtml:310 · evMorePlusHtml:324 · evMarkPriority:333 · evBodaMinutes:340 · evSortMarks:351 · ev0:352 · evAnnualXsHtml:384 · vipStarSvgHtml:394 · evIsoDate:406 · _isVipBdayTooFar:407 · evUpcomingMarkHtml:414 · _evRowOcc:433 · evComparteDia:438 · _evSoloSeRozan:443 · _evTrozosSeRozan:454 · _evAssignRow:459 · _evMarcarMitades:473 · _evMitadesStyle:488 · evBarZ:495 · _evAnnualCtx:508 · visible:509 · _evLoadPuentes:527 · _evScheduleRemove:555 · _evCancelRemove:556 · evStartTime:575 · evEndTime:581 · evTimeLabel:588 · evTramos:595 · evTramoTexto:606 · evMinutosDe:613 · _positionEvBright:623

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(528 líneas)_
**Funciones:** _lsJson:259 · askImportMode:266 · close:278 · _mergeMap:292 · _mergeList:303 · _sigEvent:324 · _sigCouple:326 · _sigAlarm:327 · _sigGasto:328 · _keyId:330 · _keyBday:331 · _keyGasto:332 · _exportPerYearKeys:338 (!80) · _applyFullImport:418 (!110)

### js/init.js  _(456 líneas)_
**Estado global:** DRUM_ITEM_H:140 · DN_ES:297

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:141 · updateDrumSelected:169 · getDrumValue:175 · checkDrumMinuteWrap:181 · buildAlarmDayBtns:212 · showAlarmPastConfirm:242 · proceed:283 · aplicarActualizacion:402 · _showUpdateBar:413 · _buscar:443

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(798 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:268 · RUT_WEEK_SEL:602 · RUT_WEEK_CAL:603

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:121 · rutById:128 · rutWeekKey:133 · rutTimeOfDay:142 · rutTieneHorarios:147 · rutWeekCfg:154 · rutSuspendedOn:163 · rutDiaLleno:172 · rutOccursOn:186 · rutIsSkipped:194 · rutToggleSkip:195 · rutFin:200 · rutEventsOn:208 · rutEventFromId:225 · rutSessions:234 · rutStats:248 · rutProximas:261 · renderRutinasBody:271 · _renderRutLista:282 · _rutFmt:340 · _rutFmtCorto:341 · _renderRutStats:347 · renderRutForm:408 · openRutForm:468 (!129) · _rutRepaintIcons:474 · _rutPintaHoras:500 · closeRutForm:597 · openRutWeek:604 · _rutWeekPick:613 · _rutWeekRender:665 · closeRutWeek:726 · openRutSesion:729 · closeRutSesion:758 · bindRutinasEvents:761

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2338 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:19
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):37
- HEADER:56
- JORNADA DEFECTO:70
- Barra vertical que separa la campana del bloque de navegacion:107
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:113
- Punto verde notificación en botones bday/events cuando hay items próximos:122
- WEEK CARDS:132
- WEEK ACTIONS:164
- BOTTOM SHEET (day type selector):173
- TOAST:195
- Tema claro: el fondo oscuro con letra de color no se leia bien:202
- SW UPDATE BUTTON (en menú ⋯):206
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:210
- ANIMATIONS:214
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:243
- OVERLAY BASE (summary, econ, bday, events):249
- SHARED OVERLAY HEADER:254
- SHARED BODY:275
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:324
- Vacaciones config:330
- Quitar festivos/vacaciones checkboxes:334
- Month summary breakdown:356
- Ausencia list tag:359
- ECONOMICS:362
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:367
- Summary sublabel (hours breakdown):384
- Ingresado box (formerly cobrado) — neutral:393
- ECONOMICS v2: tabs + nuevas secciones:427
- Estudio Cambio — grouped nav:438
- Estudio — tariff comparison cards:447
- Análisis hipoteca — secciones organizadas:468
- Mis gastos — budget table:485
- Year selector for per-year fiscal tabs:498
- §1.1 Tarifa dual:509
- §1.3 Stats por hora/día:521
- §1.4 Toggles:528
- §1.5 Declaración IRPF:533
- Tab 2: Comparador:546
- Calcular Tarifa (sim):574
- Scenario zones (Comparar Escenarios):592
- Análisis Ec. Personal:609
- Bloques de la Subrogación:611
- Fiscal config modal — purple theme override:654
- Fiscal config modal:656
- ECONOMICS v3: opt-buttons, cascade, gastos:682
- Cascade ingresos/gastos:689
- Media mensual: cards:699
- Tab 4: Análisis:709
- IRPF Breakdown visual:723
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:750
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):752
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):776
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:785
- Resumen fiscal al final de Ingresos y Gastos:787
- Donut chart:794
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):804
- Fiscal config: gastos items:811
- Fiscal: tab bar:823
- Fiscal: sticky save:828
- Fiscal: section title income/expense colors:830
- Fiscal: desgravaciones:840
- Fiscal: compras profesionales:867
- Desgravaciones: notas + tabla despacho info:875
- Nota IVA compras:895
- IVA por item en compras:897
- Fiscal: despacho en casa:904
- Hipoteca — resumen visual:927
- Hipoteca — compact 2-col grid:950
- Hipoteca — compact vinculaciones:958
- Hipoteca — read-only fields:969
- Hipoteca — edit/detail buttons:978
- Hipoteca — period summary card:984
- Multi-rate period cards:997
- Distribución de ingresos:1013
- Comparador: reorder buttons:1029
- Rate input styled:1033
- BIRTHDAYS:1037
- Cabe el nombre entero, hasta en tres lineas:1054
- VIP controls bar:1060
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1071
- VIP edit mode item states:1074
- Feat 1: Buscador en lista por meses:1084
- Upcoming birthdays:1110
- Weekend frame — gris lavanda suave:1127
- Hoy manda sobre el gris del fin de semana:1130
- Events in puentes (summary) — one per line:1150
- Events upcoming view:1154
- Minicabecera de día dentro de un panel de Próximos:1156
- Marcador de la tarjeta de Proximos: la forma real del evento:1166
- Horas del evento y transporte de ida/vuelta:1171
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1203
- Grid del mes: col fecha (48px) + col eventos (1fr):1205
- Columna fecha (col 1):1207
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1216
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1222
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1226
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1232
- Event color type picker:1236
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1242
- Color picker avanzado (paleta 6×8 + color libre):1246
- Detail color picker toggle:1264
- Annual events calendar:1270
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1300
- Selector de formas en el formulario de evento (Otros):1311
- Selector de grosor de barra (grande | Otros):1313
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1328
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1332
- Inicio/Fin bloqueados cuando hay Selección Multidía:1335
- Mini-overlay para elegir días específicos (Otros):1340
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1367
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1371
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1373
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1375
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1377
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1383
- Calendario 4 meses: 2 columnas × 2 filas:1385
- Botón ir al calendario mensual en puentes del resumen:1387
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1399
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1403
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1421
- Dropdown de vista anual:1428
- Linea que separa los chips de eventos grandes de los puntuales:1437
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1446
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1450
- Summary tabs — nivel 2:1453
- BRIDGE DAY CELLS in summary:1458
- VIP BIRTHDAYS:1467
- BIRTHDAY + EVENT ALARM PANEL:1470
- Campana de alarma en items de próximos (bday + eventos):1473
- 3-ZONE ALARM MARKER:1511
- ALARM MANAGEMENT OVERLAY:1524
- HOME POPUP (semanas pendientes / VIP sin alarma):1525
- MACRO URL EN MENÚ:1536
- Feat 4: Nav-bar emoji alignment:1542
- Birthday detail / form overlays:1558
- EVENTS:1568
- Zone A: upcoming/list views — subtle blue tint:1574
- Zone B: calendar grid views — subtle teal tint, active = green:1576
- Feat 2: Lista de Eventos subtabs:1585
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1602
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1604
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1633
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1637
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1643
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1658
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1668
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1685
- Perímetro puente: capa inferior a eventos:1687
- Bright past: bombilla override:1700
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1704
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1709
- Quad label 3 lines:1714
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1721
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1723
- Events list view:1725
- Event form overlay (inside eventsOverlay):1739
- Relleno, para que haga pareja con el naranja de "Editar evento":1769
- Event detail:1775
- LOGO POPUP:1783
- Gallery:1792
- BD ALARM VIP TOGGLE:1801
- RESPONSIVE (mobile header):1804
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1806
- ALARM PANEL:1859
- Drum picker (selector giratorio de hora/minuto):1864
- Confirmación alarma en el pasado:1890
- Botón flotante "Listo" en modo Editar VIPs:1896
- Controles inline long-press cumpleaños:1899
- Selector de clase en el formulario:1907
- Notas: general vs de un dia concreto:1913
- Pestana Bodas y pestana partida Vacaciones/Festivos:1917
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1922
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1935
- Filas del panel de un aviso:1949
- Estadisticas:1953
- Barras horizontales de reparto (componente generico: hBarRows):1961
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1971
- Dia cerrado: no admite mas clases:1988
- Una clase a la que le falta la hora o la sala se marca ella sola.:2000
- Fila con cambios sin guardar:2005
- Filtros de Parejas como chips pulsables:2017
- El color de la pareja va en un punto delante; el nombre, en color normal:2080
- Sala sin asignar: se marca en naranja para que cante en la lista:2085
- Nota propia del dia en la lista de Proximos:2088
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2090
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2092
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2100
- Editar siempre en naranja, como en el resto de la app:2106
- Los tres botones del detalle de pareja comparten aspecto:2123
- Subpestana Calendario de bodas:2163
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2177
- Dia resaltado al pulsar una pareja en la leyenda:2184
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2211
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2213
- etiqueta al minimo: el nombre de la pareja necesita el resto:2222
- el color de la pareja va en un punto, no tinendo el nombre:2225
- Los tres botones de la pareja, en una sola linea:2232
- Buscador y boton de anadir en la misma fila:2235
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2241
- Horario distinto segun el dia:2245
- Selector de icono de rutina:2251
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2291
- Diálogo: modo de importación (añadir vs reemplazar):2306
- PRINT:2319

**Rangos por prefijo de clase:** 
.action-btn:166-170 · .ah-cuota:472-474 · .ah-donut:482-484 · .ah-section:469-471 · .ah-total:479-481 · .ah-vs:475-478 · .alarm-cfg:1860-1860 · .alarm-colon:1863-1863 · .alarm-create:1877-1883 · .alarm-day:1887-1889 · .alarm-days:1884-1886 · .alarm-msg:1873-1874 · .alarm-panel:1861-1861 · .alarm-past:1891-1895 · .alarm-time:1862-1862 · .analisis-card:621-623 · .analisis-cards:610-610 · .analisis-hbar:624-629 · .analisis-input:639-642 · .analisis-ins:648-653 · .analisis-insurance:647-647 · .analisis-mortgage:630-646 · .app-logo:61-61 · .app-version:130-130 · .bd-alarm:1471-1803 · .bd-detail:1559-1566 · .bd-export:269-269 · .bday-add:1125-1126 · .bday-badge:1055-1057 · .bday-buscar:1087-1089 · .bday-cancel:1072-1073 · .bday-cell:1048-1131 · .bday-hdr:1039-1451 · .bday-ic:1901-1905 · .bday-inline:1900-1900 · .bday-io:1093-1109 · .bday-list:1059-1083 · .bday-listo:1897-1897 · .bday-month:1058-1058 · .bday-num:1053-1053 · .bday-search:1090-1092 · .bday-upcoming:1111-1469 · .bday-view:1040-1042 · .bday-vip:1061-1468 · .bday-week:1043-1045 · .boda-actions:2115-2115 · .boda-add:2117-2117 · .boda-asg:2140-2162 · .boda-buscar:2236-2238 · .boda-cal:2164-2187 · .boda-card:2023-2244 · .boda-chip:2019-2021 · .boda-chips:2018-2018 · .boda-cl:2077-2114 · .boda-class:2001-2076 · .boda-controls:1978-1978 · .boda-couple:2059-2061 · .boda-cpk:2131-2139 · .boda-date:2116-2116 · .boda-day:1995-2039 · .boda-det:2122-2234 · .boda-dia:2066-2068 · .boda-dot:2027-2027 · .boda-falta:2034-2034 · .boda-filters:1981-1981 · .boda-fsel:1982-1985 · .boda-ftoggles:1986-1987 · .boda-hd:2110-2112 · .boda-inp:2054-2054 · .boda-iss:1950-1952 · .boda-issue:1937-1948 · .boda-issues:1936-1936 · .boda-legend:2118-2121 · .boda-mini:2104-2105 · .boda-mode:1968-1970 · .boda-multi:2069-2074 · .boda-name:2028-2028 · .boda-ok:2035-2035 · .boda-place:2062-2087 · .boda-prog:2030-2031 · .boda-ro:2078-2086 · .boda-save:2015-2016 · .boda-savebar:2011-2014 · .boda-search:2239-2239 · .boda-sec:1934-1934 · .boda-sobra:2036-2036 · .boda-sort:2240-2240 · .boda-stat:1955-1960 · .boda-stats:1954-1954 · .boda-sticky:1930-1932 · .boda-sum:1974-1977 · .boda-summary:1973-1973 · .boda-swap:2044-2051 · .boda-time:2055-2055 · .boda-tp:2188-2191 · .boda-wed:2029-2029 · .bottom-sheet:176-177 · .btn-icon:103-1849 · .csv-export:76-77 · .data-actions:99-1851 · .data-btn:100-1847 · .data-menu:124-129 · .day-cell:144-247 · .day-date:149-149 · .day-hours:150-150 · .day-name:148-148 · .day-status:157-157 · .days-grid:143-143 · .default-hours:72-81 · .dp-actions:1363-1364 · .dp-counter:1350-1351 · .dp-day:1358-1362 · .dp-days:1357-1357 · .dp-grid:1352-1352 · .dp-handle:1345-1345 · .dp-hdr:1346-1346 · .dp-mhdr:1355-1356 · .dp-mname:1354-1354 · .dp-month:1353-1353 · .dp-overlay:1341-1344 · .dp-sheet:1343-1343 · .dp-title:1347-1347 · .dp-yearnav:1348-1349 · .drum-picker:1866-1869 · .drum-sel:1872-1872 · .drum-wrap:1865-1871 · .econ-add:556-557 · .econ-ahorro:777-784 · .econ-annual:386-386 · .econ-avg:387-704 · .econ-bracket:539-545 · .econ-calc:687-688 · .econ-casc:691-698 · .econ-cascade:690-690 · .econ-chart:569-570 · .econ-comp:547-571 · .econ-decl:534-708 · .econ-distrib:1014-1028 · .econ-donut:795-810 · .econ-equiv:1009-1012 · .econ-fiscal:788-793 · .econ-formula:406-409 · .econ-gastos:710-722 · .econ-gear:506-507 · .econ-hdr:428-508 · .econ-ingresado:394-394 · .econ-irpf:724-786 · .econ-legend:572-573 · .econ-line:567-568 · .econ-month:411-424 · .econ-mr:1006-1007 · .econ-multi:998-1008 · .econ-opt:683-686 · .econ-qcard:376-383 · .econ-qcell:372-1810 · .econ-qm:381-381 · .econ-qmonth:379-380 · .econ-quarter:368-1807 · .econ-rate:510-518 · .econ-row:395-405 · .econ-sc:549-1035 · .econ-scenario:548-548 · .econ-section:425-425 · .econ-sim:575-585 · .econ-stats:522-527 · .econ-sub:431-437 · .econ-tab:429-430 · .econ-toggle:529-532 · .econ-val:410-410 · .est-btn:442-446 · .est-card:452-454 · .est-detail:449-449 · .est-field:461-467 · .est-fields:460-460 · .est-group:440-444 · .est-modo:455-455 · .est-nav:439-439 · .est-section:448-448 · .est-tariff:450-459 · .ev-alarm:1494-2099 · .ev-ann:1400-1665 · .ev-annual:1168-1699 · .ev-badge:1724-1724 · .ev-badges:1629-1629 · .ev-bars:1605-1605 · .ev-barsize:1314-1323 · .ev-bficha:2218-2218 · .ev-bfila:2219-2228 · .ev-bpunto:2226-2226 · .ev-bright:1701-1711 · .ev-btn:1762-1919 · .ev-bver:2231-2231 · .ev-car:1644-2215 · .ev-cell:1132-1720 · .ev-char:1751-1751 · .ev-checkbox:1756-1756 · .ev-chip:1443-1443 · .ev-color:1244-1263 · .ev-colors:1752-1752 · .ev-date:1753-1753 · .ev-dates:1336-1338 · .ev-day:1632-1676 · .ev-daynote:1915-1915 · .ev-del:2303-2304 · .ev-detail:1265-2212 · .ev-dot:162-162 · .ev-dots:161-161 · .ev-edit:1391-1766 · .ev-field:1745-1746 · .ev-filter:1438-1445 · .ev-form:1740-1761 · .ev-hdr:1452-1570 · .ev-hora:1172-1172 · .ev-input:1747-1748 · .ev-io:1095-1774 · .ev-kind:1908-1912 · .ev-list:1586-2302 · .ev-month:1594-1594 · .ev-multi:1619-1696 · .ev-note:1914-1914 · .ev-num:1722-1722 · .ev-otros:1312-1681 · .ev-puente:1688-1688 · .ev-quad:1386-1716 · .ev-repeat:1757-1757 · .ev-rut:1672-1675 · .ev-search:2293-2297 · .ev-sep:1195-1195 · .ev-shape:1324-1331 · .ev-sort:2298-2299 · .ev-textarea:1749-1750 · .ev-toggle:1754-1755 · .ev-type:1237-1245 · .ev-types:1589-1591 · .ev-up:1157-1170 · .ev-upcoming:329-2091 · .ev-viaje:1173-1181 · .ev-view:1571-1573 · .ev-wd:1759-1760 · .ev-week:325-1686 · .ev-weekday:1758-1758 · .ev-wk:1182-2103 · .ev-zone:1575-2199 · .excl-item:355-520 · .excl-row:335-519 · .fiscal-add:676-839 · .fiscal-bracket:667-675 · .fiscal-compras:868-903 · .fiscal-copy:503-505 · .fiscal-custom:664-664 · .fiscal-ded:878-892 · .fiscal-desgrav:841-893 · .fiscal-despacho:905-926 · .fiscal-error:680-680 · .fiscal-gasto:812-874 · .fiscal-gastos:894-894 · .fiscal-hdr:824-824 · .fiscal-highlight:865-865 · .fiscal-onoff:907-908 · .fiscal-pct:665-674 · .fiscal-period:820-821 · .fiscal-radio:659-663 · .fiscal-save:678-679 · .fiscal-section:657-832 · .fiscal-sticky:829-829 · .fiscal-subsection:833-834 · .fiscal-tab:825-827 · .fiscal-viaje:835-836 · .fiscal-vinc:918-919 · .fiscal-year:499-502 · .full-overlay:250-251 · .hbar-lbl:1964-1964 · .hbar-row:1963-1963 · .hbar-rows:1962-1962 · .hbar-track:1965-1966 · .hbar-val:1967-1967 · .header:57-1852 · .header-brand:60-60 · .hip-add:996-996 · .hip-auto:947-947 · .hip-bar:933-940 · .hip-cancel:983-983 · .hip-cf:952-957 · .hip-edit:979-981 · .hip-g2:951-951 · .hip-grid:945-945 · .hip-period:985-994 · .hip-resumen:928-932 · .hip-ro:970-977 · .hip-save:982-982 · .hip-section:946-995 · .hip-stat:942-944 · .hip-stats:941-941 · .hip-sub:949-949 · .hip-vinc:948-948 · .hip-vr:959-968 · .home-popup:1526-1535 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:270-270 · .imp-mode:2307-2317 · .io-peligro:1100-1108 · .io-primaria:1099-1106 · .logo-gallery:1793-1800 · .logo-popup:1784-1791 · .macro-section:1537-1538 · .macro-url:1539-1541 · .mg-budget:486-495 · .mg-cat:496-496 · .mg-desgrav:497-497 · .mg-sort:492-492 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-92 · .ms-breakdown:357-357 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:358-358 · .nav-bar:1448-1856 · .nav-btn:65-66 · .option-desc:192-192 · .option-dot:185-189 · .option-hours:193-193 · .option-info:190-190 · .option-label:191-191 · .overlay:174-175 · .overlay-nav:1447-1449 · .rate-input:365-2336 · .rate-label:364-364 · .rate-row:363-363 · .rate-suffix:366-366 · .rut-add:2275-2275 · .rut-card:2258-2273 · .rut-day:2266-2282 · .rut-days:2265-2280 · .rut-dot:2261-2261 · .rut-hist:2287-2290 · .rut-hora:2250-2268 · .rut-hpd:2246-2249 · .rut-icon:2252-2256 · .rut-name:2262-2262 · .rut-pct:2274-2274 · .rut-prox:2269-2271 · .rut-sec:2257-2257 · .rut-stat:2284-2286 · .rut-sug:2276-2279 · .rut-susp:2283-2283 · .rut-tag:2263-2264 · .rut-vacio:2272-2272 · .rut-wpick:2205-2210 · .sent-badge:140-140 · .sheet-handle:178-178 · .sheet-option:182-184 · .sheet-options:181-181 · .sheet-subtitle:180-180 · .sheet-title:179-179 · .sim-combo:587-591 · .sim-field:576-577 · .sim-hr:586-586 · .sim-period:583-583 · .sim-target:578-582 · .sub-block:612-613 · .sub-row:614-620 · .sw-upd:207-207 · .sy-back:256-2327 · .sy-body:276-2325 · .sy-card:287-2331 · .sy-cards3:279-279 · .sy-cards4:280-280 · .sy-chart:305-305 · .sy-hdr:261-261 · .sy-header:255-2326 · .sy-lbl:296-2330 · .sy-list:309-360 · .sy-month:323-323 · .sy-nav:265-1713 · .sy-note:306-308 · .sy-pdf:267-268 · .sy-puente:315-1466 · .sy-section:277-278 · .sy-spain:281-286 · .sy-sublbl:385-385 · .sy-suelto:320-322 · .sy-tab:1454-1457 · .sy-table:297-2332 · .sy-td:302-302 · .sy-tr:303-2333 · .sy-val:292-2329 · .sy-year:258-2328 · .toast:196-212 · .toast-undo:209-209 · .today-btn:67-68 · .vac-config:331-333 · .vip-no:1067-1068 · .week-actions:165-165 · .week-card:134-229 · .week-header:137-137 · .week-info:138-139 · .week-total:141-141 · .weeks-container:133-133

