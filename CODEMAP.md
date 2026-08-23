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

### js/bodas.js  _(1620 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_NONE:30 · BODA_PLACE_SHORT:31 · BODA_PLACE_EMOJI:33 · BODA_WHITE:50 · BODA_SLOTS:51 · BODA_NO_TIME_COLOR:57 · BODA_NO_COUPLE_COLOR:58 · BODA_DEFAULT_TIME:59 · BODA_PALETTE:62 · BODA_CLOSED_SK:214 · BODA_CLOSED:215 · BODA_PENDING:230 · BODA_SUBTAB:271 · BODA_CLASS_MODE:272 · BODA_CLASES_SEARCH:273 · BODA_HIDE_PAST:274 · BODA_HIDE_CLOSED:275 · BODA_CARD_OPEN:276 · BODA_PAREJAS_SEARCH:277 · BODA_PAREJAS_SORT:280 · BODA_PAREJAS_FILTER:281 · BODA_CAL_HL:282 · BODA_CAL_YEAR:283 · BODA_CAL_MONTH:284 · MN2:299 · DN2:791 · BODA_ASSIGN:838 · BODA_FORM:1079 · BODA_TIME_H:1274

**Funciones:** saveBodas:18 · bodaPlaceEmoji:34 · bodaPlaceOf:38 · bodaPlaceLabel:43 · bodaNextColor:64 · bodaCouple:72 · bodaSlot:76 · bodaSlotColors:86 · bodaMarkFor:91 · evBodaSvg:97 · bodaClasses:114 · bodaPrimeraClase:118 · bodaClassesOfCouple:122 · bodaFreeClasses:125 · bodaSortClasses:128 · bodaClassesOnDay:135 · bodaNewClass:138 · bodaNormalizeClasses:153 · bodaPlaceForNewOn:188 · bodaDayFull:193 · bodaBulkCreate:198 · bodaProgress:208 · saveBodaClosed:219 · bodaIsClosed:220 · bodaToggleClosed:221 · bodaPendingCount:231 · bodaEff:233 · bodaSetPending:241 · bodaPendingApply:245 · bodaPendingDiscard:268 · _bodaLegendHtml:287 · _renderBodaCalendario:298 (!86) · renderBodasBody:384 · _bodaCmpFecha:413 · _renderBodaParejas:419 (!88) · _bodaFmt:507 · _bodaFmtCorto:508 · _renderBodaClases:515 (!91) · bodaOpenSheet:606 · bodaCloseSheet:609 · bodaCreatedAt:615 · bodaIssues:620 · _renderBodaIssueCards:636 · card:639 · openBodaIssue:660 (!81) · findEv:702 · closeBodaIssue:741 · _bodaWeekKey:744 · _renderBodaStats:751 (!88) · openBodaAssign:839 · closeBodaAssign:859 · renderBodaAssign:863 (!81) · bindBodaAssign:944 · openBodaPlacePicker:1013 · closeBodaPlacePicker:1042 · bodaAplicarCampo:1046 · bodaTrasElegir:1056 · _bodaMasUnaHora:1068 · openBodaClaseForm:1080 · _bodaFormRender:1094 (!130) · closeBodaClaseForm:1224 · openBodaCouplePicker:1230 · row:1240 · apply:1257 · closeBodaCouplePicker:1271 · openBodaTimePicker:1277 · drum:1282 · setDrum:1305 · mark:1310 · drumVal:1314 · readManual:1335 · closeBodaTimePicker:1355 · renderBodaCoupleForm:1358 · openBodaCoupleForm:1382 · closeBodaCoupleForm:1419 · bodaRefreshRow:1423 · bindBodasEvents:1450 (!170) · _guardaPendientes:1452 · _bodaCalMove:1468 · findClass:1556

### js/core.js  _(717 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:133 · MN_SHORT:135 · DN5:356 · FESTIVOS_ANIO:572

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:140 · save:152 · loadEconYear:156 · saveEconYear:175 · fakeTrans:185 · simpleBarChart:202 · hBarRows:226 · shareOrDownload:243 · escHtml:263 · mkey:268 · getMonthH:269 · defH:275 · dayH:276 · dayT:277 · dk:278 · fd:279 · ad:280 · fh:281 · fhP:282 · isToday:283 · isPast:284 · wn:285 · weeks:288 · getWD:303 · showToast:319 · sendEmail:345 · buildMailtoBody:355 · render:377 (!97) · fmtH:453 · openSheet:474 · closeSheet:493 · selectType:499 · contarVacaciones:532 · confirmarCupoVacaciones:545 · contarFestivos:560 · confirmarCupoFestivos:573 · togSent:582 · _panelBorrarLuego:603 · _panelCancelarBorrado:614 · abrirPanel:616 · engancharFondo:631 · abrirUnaVez:649 · cerrarPanel:655 · renderNavBar:666 · bindNavBar:689 · doNav:696

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

### js/events-bind.js  _(486 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:63 (!423) · _scrollWeekToMonth:71 · _scrollWeekToToday:118 · doScroll:128 · apply:449

### js/events-cal.js  _(333 líneas)_
**Estado global:** DN7:25

**Funciones:** renderEvCalMonth:14 (!145) · _renderEvMonthCard:159 (!146) · renderEvAnnual:305 · renderEvQuad:314

### js/events-detail.js  _(581 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!117) · fd2:43 · _fila:122 · evDayCarItems:157 · evCarGo:170 · _evCarShow:178 · openEvDayCarousel:186 · closeEvDayCarousel:194 · openEvDetail:201 (!155) · repintar:241 · closeEvDetail:356 · renderEvAlarmPanel:359 (!80) · fd2:361 · openEvAlarm:439 · closeEvAlarm:445 · openBdayAlarmFromEvents:453 · bindEvAlarmEvents:461 (!120) · _syncPre:499 · fmtD:529

### js/events-form.js  _(606 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · evAdmiteRepeticion:35 · renderEvForm:38 (!188) · openEvForm:226 · closeEvForm:252 · bindEvFormEvents:264 (!342) · _refreshShapePreviews:280 · _refreshPickDatesLabel:285 · _curKind:304 · _applyTypeUI:305 · _bindTypeSwatches:334 · _viajeSync:428

### js/events-picker-color.js  _(241 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:125 · evTravelColor:134 · getEvType:140 · isEvBarAlways:148 · getEvDisplayColor:150 · _renderColorPicker:170 · _bindColorPicker:193 · updatePreview:203

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(594 líneas)_
**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!185) · fd2:50 · renderEvItem:51 · renderEvPanel:108 · renderEvByTypes:228 · coincide:254 · renderEvMonthsView:300 · renderEvWeek:309 (!132) · hexA:313 · renderEvContent:441 (!153)

### js/events.js  _(621 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:53 · EV_QUAD_YEAR:54 · EV_QUAD_MONTH:55 · EV_TO_SUBTAB:56 · EV_TYPES_FILTER:57 · EV_TYPES_PAST:58 · EV_LIST_SORT:59 · EV_LIST_SEARCH:60 · EV_COLORS:61 · EVENTS:62 · EV_ALARM_SK:91 · EV_ALARMS_SET:92 · EV_NO_RUT:184 · EV_MARK_ORDER:332 · EV_MAX_PUNT_DIA:373 · EV_MAX_RUT_DIA:374 · EV_CAL_CORNER_STACK:377 · EV_MAX_VIP_DIA:379 · EV_CAL_VIP_MAX:380 · EV_UP_SHOW_RUT:382 · EV_UP_SHOW_BODA:383 · EV_BAR_Z:432 · EV_MNS:491 · EV_CAR:534 · EV_TRANSPORTES:553 · EV_TRANS_EMOJI:559

**Funciones:** evFilterGroup:44 · saveEvents:86 · loadEvAlarms:93 · saveEvAlarms:94 · _findBdayByEvId:95 · isEvAlarmSet:107 · setEvAlarmState:113 · evDk:120 · _evClampDate:129 · eventOccursOn:133 · getEventsOn:177 · evSignature:192 · evMergeIncoming:202 · evMergeMsg:226 · _fmtDayEs:238 · evDayLimitExceeded:239 · rutDayCount:274 · hasUpcomingEvent:281 · updateEventsBtn:290 · evDefaultShape:304 · evMarkerHtml:310 · evMorePlusHtml:324 · evMarkPriority:333 · evBodaMinutes:340 · evSortMarks:351 · ev0:352 · evAnnualXsHtml:384 · vipStarSvgHtml:394 · evIsoDate:406 · _isVipBdayTooFar:407 · evUpcomingMarkHtml:414 · _evRowOcc:433 · _evSoloSeRozan:439 · _evAssignRow:445 · _evMarcarMitades:459 · _evMitadesStyle:474 · evBarZ:481 · _evAnnualCtx:494 · visible:495 · _evLoadPuentes:513 · _evScheduleRemove:541 · _evCancelRemove:542 · evStartTime:561 · evEndTime:567 · evTimeLabel:574 · evTramos:581 · evTramoTexto:590 · evMinutosDe:597 · _positionEvBright:607

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(528 líneas)_
**Funciones:** _lsJson:259 · askImportMode:266 · close:278 · _mergeMap:292 · _mergeList:303 · _sigEvent:324 · _sigCouple:326 · _sigAlarm:327 · _sigGasto:328 · _keyId:330 · _keyBday:331 · _keyGasto:332 · _exportPerYearKeys:338 (!80) · _applyFullImport:418 (!110)

### js/init.js  _(456 líneas)_
**Estado global:** DRUM_ITEM_H:140 · DN_ES:297

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:141 · updateDrumSelected:169 · getDrumValue:175 · checkDrumMinuteWrap:181 · buildAlarmDayBtns:212 · showAlarmPastConfirm:242 · proceed:283 · aplicarActualizacion:402 · _showUpdateBar:413 · _buscar:443

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(792 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:262 · RUT_WEEK_SEL:596 · RUT_WEEK_CAL:597

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:115 · rutById:122 · rutWeekKey:127 · rutTimeOfDay:136 · rutTieneHorarios:141 · rutWeekCfg:148 · rutSuspendedOn:157 · rutDiaLleno:166 · rutOccursOn:180 · rutIsSkipped:188 · rutToggleSkip:189 · rutFin:194 · rutEventsOn:202 · rutEventFromId:219 · rutSessions:228 · rutStats:242 · rutProximas:255 · renderRutinasBody:265 · _renderRutLista:276 · _rutFmt:334 · _rutFmtCorto:335 · _renderRutStats:341 · renderRutForm:402 · openRutForm:462 (!129) · _rutRepaintIcons:468 · _rutPintaHoras:494 · closeRutForm:591 · openRutWeek:598 · _rutWeekPick:607 · _rutWeekRender:659 · closeRutWeek:720 · openRutSesion:723 · closeRutSesion:752 · bindRutinasEvents:755

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2281 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:18
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):35
- HEADER:53
- JORNADA DEFECTO:67
- Barra vertical que separa la campana del bloque de navegacion:104
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:110
- Punto verde notificación en botones bday/events cuando hay items próximos:119
- WEEK CARDS:129
- WEEK ACTIONS:161
- BOTTOM SHEET (day type selector):170
- TOAST:192
- Tema claro: el fondo oscuro con letra de color no se leia bien:199
- SW UPDATE BUTTON (en menú ⋯):203
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:207
- ANIMATIONS:211
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:240
- OVERLAY BASE (summary, econ, bday, events):246
- SHARED OVERLAY HEADER:251
- SHARED BODY:272
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:321
- Vacaciones config:327
- Quitar festivos/vacaciones checkboxes:331
- Month summary breakdown:353
- Ausencia list tag:356
- ECONOMICS:359
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:364
- Summary sublabel (hours breakdown):381
- Ingresado box (formerly cobrado) — neutral:390
- ECONOMICS v2: tabs + nuevas secciones:424
- Estudio Cambio — grouped nav:435
- Estudio — tariff comparison cards:444
- Análisis hipoteca — secciones organizadas:465
- Mis gastos — budget table:482
- Year selector for per-year fiscal tabs:495
- §1.1 Tarifa dual:506
- §1.3 Stats por hora/día:518
- §1.4 Toggles:525
- §1.5 Declaración IRPF:530
- Tab 2: Comparador:543
- Calcular Tarifa (sim):571
- Scenario zones (Comparar Escenarios):589
- Análisis Ec. Personal:606
- Bloques de la Subrogación:608
- Fiscal config modal — purple theme override:651
- Fiscal config modal:653
- ECONOMICS v3: opt-buttons, cascade, gastos:679
- Cascade ingresos/gastos:686
- Media mensual: cards:696
- Tab 4: Análisis:706
- IRPF Breakdown visual:720
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:747
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):749
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):773
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:782
- Resumen fiscal al final de Ingresos y Gastos:784
- Donut chart:791
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):801
- Fiscal config: gastos items:808
- Fiscal: tab bar:820
- Fiscal: sticky save:825
- Fiscal: section title income/expense colors:827
- Fiscal: desgravaciones:837
- Fiscal: compras profesionales:864
- Desgravaciones: notas + tabla despacho info:872
- Nota IVA compras:892
- IVA por item en compras:894
- Fiscal: despacho en casa:901
- Hipoteca — resumen visual:924
- Hipoteca — compact 2-col grid:947
- Hipoteca — compact vinculaciones:955
- Hipoteca — read-only fields:966
- Hipoteca — edit/detail buttons:975
- Hipoteca — period summary card:981
- Multi-rate period cards:994
- Distribución de ingresos:1010
- Comparador: reorder buttons:1026
- Rate input styled:1030
- BIRTHDAYS:1034
- Cabe el nombre entero, hasta en tres lineas:1051
- VIP controls bar:1057
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1068
- VIP edit mode item states:1071
- Feat 1: Buscador en lista por meses:1081
- Upcoming birthdays:1107
- Weekend frame — gris lavanda suave:1124
- Hoy manda sobre el gris del fin de semana:1127
- Events in puentes (summary) — one per line:1147
- Events upcoming view:1151
- Minicabecera de día dentro de un panel de Próximos:1153
- Marcador de la tarjeta de Proximos: la forma real del evento:1163
- Horas del evento y transporte de ida/vuelta:1168
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1200
- Grid del mes: col fecha (48px) + col eventos (1fr):1202
- Columna fecha (col 1):1204
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1213
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1219
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1223
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1229
- Event color type picker:1233
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1239
- Color picker avanzado (paleta 6×8 + color libre):1243
- Detail color picker toggle:1261
- Annual events calendar:1267
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1297
- Selector de formas en el formulario de evento (Otros):1308
- Selector de grosor de barra (grande | Otros):1310
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1325
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1329
- Inicio/Fin bloqueados cuando hay Selección Multidía:1332
- Mini-overlay para elegir días específicos (Otros):1337
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1364
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1368
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1370
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1372
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1374
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1380
- Calendario 4 meses: 2 columnas × 2 filas:1382
- Botón ir al calendario mensual en puentes del resumen:1384
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1396
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1400
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1418
- Dropdown de vista anual:1425
- Linea que separa los chips de eventos grandes de los puntuales:1434
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1443
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1447
- Summary tabs — nivel 2:1450
- BRIDGE DAY CELLS in summary:1455
- VIP BIRTHDAYS:1464
- BIRTHDAY + EVENT ALARM PANEL:1467
- Campana de alarma en items de próximos (bday + eventos):1470
- 3-ZONE ALARM MARKER:1497
- ALARM MANAGEMENT OVERLAY:1510
- HOME POPUP (semanas pendientes / VIP sin alarma):1511
- MACRO URL EN MENÚ:1522
- Feat 4: Nav-bar emoji alignment:1528
- Birthday detail / form overlays:1544
- EVENTS:1554
- Zone A: upcoming/list views — subtle blue tint:1560
- Zone B: calendar grid views — subtle teal tint, active = green:1562
- Feat 2: Lista de Eventos subtabs:1571
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1588
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1590
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1619
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1623
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1629
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1644
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1649
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1666
- Perímetro puente: capa inferior a eventos:1668
- Bright past: bombilla override:1681
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1685
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1690
- Quad label 3 lines:1695
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1702
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1704
- Events list view:1706
- Event form overlay (inside eventsOverlay):1720
- Relleno, para que haga pareja con el naranja de "Editar evento":1750
- Event detail:1756
- LOGO POPUP:1764
- Gallery:1773
- BD ALARM VIP TOGGLE:1782
- RESPONSIVE (mobile header):1785
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1787
- ALARM PANEL:1840
- Drum picker (selector giratorio de hora/minuto):1845
- Confirmación alarma en el pasado:1864
- Botón flotante "Listo" en modo Editar VIPs:1870
- Controles inline long-press cumpleaños:1873
- Selector de clase en el formulario:1881
- Notas: general vs de un dia concreto:1887
- Pestana Bodas y pestana partida Vacaciones/Festivos:1891
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1896
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1909
- Filas del panel de un aviso:1923
- Estadisticas:1927
- Barras horizontales de reparto (componente generico: hBarRows):1935
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1945
- Dia cerrado: no admite mas clases:1962
- Fila con cambios sin guardar:1967
- Filtros de Parejas como chips pulsables:1979
- El color de la pareja va en un punto delante; el nombre, en color normal:2031
- Sala sin asignar: se marca en naranja para que cante en la lista:2036
- Nota propia del dia en la lista de Proximos:2039
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2041
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2043
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2051
- Editar siempre en naranja, como en el resto de la app:2057
- Los tres botones del detalle de pareja comparten aspecto:2069
- Subpestana Calendario de bodas:2106
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2120
- Dia resaltado al pulsar una pareja en la leyenda:2127
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2154
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2156
- etiqueta al minimo: el nombre de la pareja necesita el resto:2165
- el color de la pareja va en un punto, no tinendo el nombre:2168
- Los tres botones de la pareja, en una sola linea:2175
- Buscador y boton de anadir en la misma fila:2178
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2184
- Horario distinto segun el dia:2188
- Selector de icono de rutina:2194
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2234
- Diálogo: modo de importación (añadir vs reemplazar):2249
- PRINT:2262

**Rangos por prefijo de clase:** 
.action-btn:163-167 · .ah-cuota:469-471 · .ah-donut:479-481 · .ah-section:466-468 · .ah-total:476-478 · .ah-vs:472-475 · .alarm-cfg:1841-1841 · .alarm-colon:1844-1844 · .alarm-create:1856-1857 · .alarm-day:1861-1863 · .alarm-days:1858-1860 · .alarm-msg:1854-1855 · .alarm-panel:1842-1842 · .alarm-past:1865-1869 · .alarm-time:1843-1843 · .analisis-card:618-620 · .analisis-cards:607-607 · .analisis-hbar:621-626 · .analisis-input:636-639 · .analisis-ins:645-650 · .analisis-insurance:644-644 · .analisis-mortgage:627-643 · .app-logo:58-58 · .app-version:127-127 · .bd-alarm:1468-1784 · .bd-detail:1545-1552 · .bd-export:266-266 · .bday-add:1122-1123 · .bday-badge:1052-1054 · .bday-buscar:1084-1086 · .bday-cancel:1069-1070 · .bday-cell:1045-1128 · .bday-hdr:1036-1448 · .bday-ic:1875-1879 · .bday-inline:1874-1874 · .bday-io:1090-1106 · .bday-list:1056-1080 · .bday-listo:1871-1871 · .bday-month:1055-1055 · .bday-num:1050-1050 · .bday-search:1087-1089 · .bday-upcoming:1108-1466 · .bday-view:1037-1039 · .bday-vip:1058-1465 · .bday-week:1040-1042 · .boda-actions:2061-2061 · .boda-add:2063-2063 · .boda-asg:2083-2105 · .boda-buscar:2179-2181 · .boda-cal:2107-2130 · .boda-card:1985-2187 · .boda-chip:1981-1983 · .boda-chips:1980-1980 · .boda-cl:2028-2060 · .boda-class:1968-2027 · .boda-controls:1952-1952 · .boda-couple:2010-2012 · .boda-cpk:2077-2082 · .boda-date:2062-2062 · .boda-day:1963-2001 · .boda-det:2068-2177 · .boda-dia:2017-2019 · .boda-dot:1989-1989 · .boda-falta:1996-1996 · .boda-filters:1955-1955 · .boda-fsel:1956-1959 · .boda-ftoggles:1960-1961 · .boda-inp:2005-2005 · .boda-iss:1924-1926 · .boda-issue:1911-1922 · .boda-issues:1910-1910 · .boda-legend:2064-2067 · .boda-mini:2055-2056 · .boda-mode:1942-1944 · .boda-multi:2020-2025 · .boda-name:1990-1990 · .boda-ok:1997-1997 · .boda-place:2013-2038 · .boda-prog:1992-1993 · .boda-ro:2029-2037 · .boda-save:1977-1978 · .boda-savebar:1973-1976 · .boda-search:2182-2182 · .boda-sec:1908-1908 · .boda-sobra:1998-1998 · .boda-sort:2183-2183 · .boda-stat:1929-1934 · .boda-stats:1928-1928 · .boda-sticky:1904-1906 · .boda-sum:1948-1951 · .boda-summary:1947-1947 · .boda-time:2006-2006 · .boda-tp:2131-2134 · .boda-wed:1991-1991 · .bottom-sheet:173-174 · .btn-icon:100-1830 · .csv-export:73-74 · .data-actions:96-1832 · .data-btn:97-1828 · .data-menu:121-126 · .day-cell:141-244 · .day-date:146-146 · .day-hours:147-147 · .day-name:145-145 · .day-status:154-154 · .days-grid:140-140 · .default-hours:69-78 · .dp-actions:1360-1361 · .dp-counter:1347-1348 · .dp-day:1355-1359 · .dp-days:1354-1354 · .dp-grid:1349-1349 · .dp-handle:1342-1342 · .dp-hdr:1343-1343 · .dp-mhdr:1352-1353 · .dp-mname:1351-1351 · .dp-month:1350-1350 · .dp-overlay:1338-1341 · .dp-sheet:1340-1340 · .dp-title:1344-1344 · .dp-yearnav:1345-1346 · .drum-picker:1847-1850 · .drum-sel:1853-1853 · .drum-wrap:1846-1852 · .econ-add:553-554 · .econ-ahorro:774-781 · .econ-annual:383-383 · .econ-avg:384-701 · .econ-bracket:536-542 · .econ-calc:684-685 · .econ-casc:688-695 · .econ-cascade:687-687 · .econ-chart:566-567 · .econ-comp:544-568 · .econ-decl:531-705 · .econ-distrib:1011-1025 · .econ-donut:792-807 · .econ-equiv:1006-1009 · .econ-fiscal:785-790 · .econ-formula:403-406 · .econ-gastos:707-719 · .econ-gear:503-504 · .econ-hdr:425-505 · .econ-ingresado:391-391 · .econ-irpf:721-783 · .econ-legend:569-570 · .econ-line:564-565 · .econ-month:408-421 · .econ-mr:1003-1004 · .econ-multi:995-1005 · .econ-opt:680-683 · .econ-qcard:373-380 · .econ-qcell:369-1791 · .econ-qm:378-378 · .econ-qmonth:376-377 · .econ-quarter:365-1788 · .econ-rate:507-515 · .econ-row:392-402 · .econ-sc:546-1032 · .econ-scenario:545-545 · .econ-section:422-422 · .econ-sim:572-582 · .econ-stats:519-524 · .econ-sub:428-434 · .econ-tab:426-427 · .econ-toggle:526-529 · .econ-val:407-407 · .est-btn:439-443 · .est-card:449-451 · .est-detail:446-446 · .est-field:458-464 · .est-fields:457-457 · .est-group:437-441 · .est-modo:452-452 · .est-nav:436-436 · .est-section:445-445 · .est-tariff:447-456 · .ev-alarm:1486-2050 · .ev-ann:1397-1646 · .ev-annual:1165-1680 · .ev-badge:1705-1705 · .ev-badges:1615-1615 · .ev-bars:1591-1591 · .ev-barsize:1311-1320 · .ev-bficha:2161-2161 · .ev-bfila:2162-2171 · .ev-bpunto:2169-2169 · .ev-bright:1682-1692 · .ev-btn:1743-1893 · .ev-bver:2174-2174 · .ev-car:1630-2158 · .ev-cell:1129-1701 · .ev-char:1732-1732 · .ev-checkbox:1737-1737 · .ev-chip:1440-1440 · .ev-color:1241-1260 · .ev-colors:1733-1733 · .ev-date:1734-1734 · .ev-dates:1333-1335 · .ev-day:1618-1657 · .ev-daynote:1889-1889 · .ev-del:2246-2247 · .ev-detail:1262-2155 · .ev-dot:159-159 · .ev-dots:158-158 · .ev-edit:1388-1747 · .ev-field:1726-1727 · .ev-filter:1435-1442 · .ev-form:1721-1742 · .ev-hdr:1449-1556 · .ev-hora:1169-1169 · .ev-input:1728-1729 · .ev-io:1092-1755 · .ev-kind:1882-1886 · .ev-list:1572-2245 · .ev-month:1580-1580 · .ev-multi:1605-1677 · .ev-note:1888-1888 · .ev-num:1703-1703 · .ev-otros:1309-1662 · .ev-puente:1669-1669 · .ev-quad:1383-1697 · .ev-repeat:1738-1738 · .ev-rut:1653-1656 · .ev-search:2236-2240 · .ev-sep:1192-1192 · .ev-shape:1321-1328 · .ev-sort:2241-2242 · .ev-textarea:1730-1731 · .ev-toggle:1735-1736 · .ev-type:1234-1242 · .ev-types:1575-1577 · .ev-up:1154-1478 · .ev-upcoming:326-2042 · .ev-viaje:1170-1178 · .ev-view:1557-1559 · .ev-wd:1740-1741 · .ev-week:322-1667 · .ev-weekday:1739-1739 · .ev-wk:1179-2054 · .ev-zone:1561-2142 · .excl-item:352-517 · .excl-row:332-516 · .fiscal-add:673-836 · .fiscal-bracket:664-672 · .fiscal-compras:865-900 · .fiscal-copy:500-502 · .fiscal-custom:661-661 · .fiscal-ded:875-889 · .fiscal-desgrav:838-890 · .fiscal-despacho:902-923 · .fiscal-error:677-677 · .fiscal-gasto:809-871 · .fiscal-gastos:891-891 · .fiscal-hdr:821-821 · .fiscal-highlight:862-862 · .fiscal-onoff:904-905 · .fiscal-pct:662-671 · .fiscal-period:817-818 · .fiscal-radio:656-660 · .fiscal-save:675-676 · .fiscal-section:654-829 · .fiscal-sticky:826-826 · .fiscal-subsection:830-831 · .fiscal-tab:822-824 · .fiscal-viaje:832-833 · .fiscal-vinc:915-916 · .fiscal-year:496-499 · .full-overlay:247-248 · .hbar-lbl:1938-1938 · .hbar-row:1937-1937 · .hbar-rows:1936-1936 · .hbar-track:1939-1940 · .hbar-val:1941-1941 · .header:54-1833 · .header-brand:57-57 · .hip-add:993-993 · .hip-auto:944-944 · .hip-bar:930-937 · .hip-cancel:980-980 · .hip-cf:949-954 · .hip-edit:976-978 · .hip-g2:948-948 · .hip-grid:942-942 · .hip-period:982-991 · .hip-resumen:925-929 · .hip-ro:967-974 · .hip-save:979-979 · .hip-section:943-992 · .hip-stat:939-941 · .hip-stats:938-938 · .hip-sub:946-946 · .hip-vinc:945-945 · .hip-vr:956-965 · .home-popup:1512-1521 · .hour-chip:87-88 · .hour-chips:86-86 · .hour-picker:84-85 · .hours-chip:81-82 · .hours-chips:80-80 · .hours-control:68-68 · .hours-label:79-79 · .hours-panel:83-83 · .ico-doc:75-75 · .ico-exportar:267-267 · .imp-mode:2250-2260 · .io-peligro:1097-1105 · .io-primaria:1096-1103 · .logo-gallery:1774-1781 · .logo-popup:1765-1772 · .macro-section:1523-1524 · .macro-url:1525-1527 · .mg-budget:483-492 · .mg-cat:493-493 · .mg-desgrav:494-494 · .mg-sort:489-489 · .month-nav:59-61 · .month-stat:90-93 · .month-summary:89-89 · .ms-breakdown:354-354 · .ms-hrs:95-95 · .ms-label:94-94 · .ms-num:91-91 · .ms-sep:355-355 · .nav-bar:1445-1837 · .nav-btn:62-63 · .option-desc:189-189 · .option-dot:182-186 · .option-hours:190-190 · .option-info:187-187 · .option-label:188-188 · .overlay:171-172 · .overlay-nav:1444-1446 · .rate-input:362-2279 · .rate-label:361-361 · .rate-row:360-360 · .rate-suffix:363-363 · .rut-add:2218-2218 · .rut-card:2201-2216 · .rut-day:2209-2225 · .rut-days:2208-2223 · .rut-dot:2204-2204 · .rut-hist:2230-2233 · .rut-hora:2193-2211 · .rut-hpd:2189-2192 · .rut-icon:2195-2199 · .rut-name:2205-2205 · .rut-pct:2217-2217 · .rut-prox:2212-2214 · .rut-sec:2200-2200 · .rut-stat:2227-2229 · .rut-sug:2219-2222 · .rut-susp:2226-2226 · .rut-tag:2206-2207 · .rut-vacio:2215-2215 · .rut-wpick:2148-2153 · .sent-badge:137-137 · .sheet-handle:175-175 · .sheet-option:179-181 · .sheet-options:178-178 · .sheet-subtitle:177-177 · .sheet-title:176-176 · .sim-combo:584-588 · .sim-field:573-574 · .sim-hr:583-583 · .sim-period:580-580 · .sim-target:575-579 · .sub-block:609-610 · .sub-row:611-617 · .sw-upd:204-204 · .sy-back:253-2270 · .sy-body:273-2268 · .sy-card:284-2274 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-2269 · .sy-lbl:293-2273 · .sy-list:306-357 · .sy-month:320-320 · .sy-nav:262-1694 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-puente:312-1463 · .sy-section:274-275 · .sy-spain:278-283 · .sy-sublbl:382-382 · .sy-suelto:317-319 · .sy-tab:1451-1454 · .sy-table:294-2275 · .sy-td:299-299 · .sy-tr:300-2276 · .sy-val:289-2272 · .sy-year:255-2271 · .toast:193-209 · .toast-undo:206-206 · .today-btn:64-65 · .vac-config:328-330 · .vip-no:1064-1065 · .week-actions:162-162 · .week-card:131-226 · .week-header:134-134 · .week-info:135-136 · .week-total:138-138 · .weeks-container:130-130

