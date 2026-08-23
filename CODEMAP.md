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

### js/core.js  _(706 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:133 · MN_SHORT:135 · DN5:345 · FESTIVOS_ANIO:561

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:140 · save:152 · loadEconYear:156 · saveEconYear:175 · fakeTrans:185 · simpleBarChart:202 · hBarRows:226 · shareOrDownload:243 · escHtml:263 · mkey:268 · getMonthH:269 · defH:275 · dayH:276 · dayT:277 · dk:278 · fd:279 · ad:280 · fh:281 · fhP:282 · isToday:283 · isPast:284 · wn:285 · weeks:288 · getWD:303 · showToast:316 · sendEmail:334 · buildMailtoBody:344 · render:366 (!97) · fmtH:442 · openSheet:463 · closeSheet:482 · selectType:488 · contarVacaciones:521 · confirmarCupoVacaciones:534 · contarFestivos:549 · confirmarCupoFestivos:562 · togSent:571 · _panelBorrarLuego:592 · _panelCancelarBorrado:603 · abrirPanel:605 · engancharFondo:620 · abrirUnaVez:638 · cerrarPanel:644 · renderNavBar:655 · bindNavBar:678 · doNav:685

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

### js/init.js  _(442 líneas)_
**Estado global:** DRUM_ITEM_H:140 · DN_ES:297

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:141 · updateDrumSelected:169 · getDrumValue:175 · checkDrumMinuteWrap:181 · buildAlarmDayBtns:212 · showAlarmPastConfirm:242 · proceed:283 · _showUpdateBar:409

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(792 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:262 · RUT_WEEK_SEL:596 · RUT_WEEK_CAL:597

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:115 · rutById:122 · rutWeekKey:127 · rutTimeOfDay:136 · rutTieneHorarios:141 · rutWeekCfg:148 · rutSuspendedOn:157 · rutDiaLleno:166 · rutOccursOn:180 · rutIsSkipped:188 · rutToggleSkip:189 · rutFin:194 · rutEventsOn:202 · rutEventFromId:219 · rutSessions:228 · rutStats:242 · rutProximas:255 · renderRutinasBody:265 · _renderRutLista:276 · _rutFmt:334 · _rutFmtCorto:335 · _renderRutStats:341 · renderRutForm:402 · openRutForm:462 (!129) · _rutRepaintIcons:468 · _rutPintaHoras:494 · closeRutForm:591 · openRutWeek:598 · _rutWeekPick:607 · _rutWeekRender:659 · closeRutWeek:720 · openRutSesion:723 · closeRutSesion:752 · bindRutinasEvents:755

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2278 líneas)_

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
- ANIMATIONS:208
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:237
- OVERLAY BASE (summary, econ, bday, events):243
- SHARED OVERLAY HEADER:248
- SHARED BODY:269
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:318
- Vacaciones config:324
- Quitar festivos/vacaciones checkboxes:328
- Month summary breakdown:350
- Ausencia list tag:353
- ECONOMICS:356
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:361
- Summary sublabel (hours breakdown):378
- Ingresado box (formerly cobrado) — neutral:387
- ECONOMICS v2: tabs + nuevas secciones:421
- Estudio Cambio — grouped nav:432
- Estudio — tariff comparison cards:441
- Análisis hipoteca — secciones organizadas:462
- Mis gastos — budget table:479
- Year selector for per-year fiscal tabs:492
- §1.1 Tarifa dual:503
- §1.3 Stats por hora/día:515
- §1.4 Toggles:522
- §1.5 Declaración IRPF:527
- Tab 2: Comparador:540
- Calcular Tarifa (sim):568
- Scenario zones (Comparar Escenarios):586
- Análisis Ec. Personal:603
- Bloques de la Subrogación:605
- Fiscal config modal — purple theme override:648
- Fiscal config modal:650
- ECONOMICS v3: opt-buttons, cascade, gastos:676
- Cascade ingresos/gastos:683
- Media mensual: cards:693
- Tab 4: Análisis:703
- IRPF Breakdown visual:717
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:744
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):746
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):770
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:779
- Resumen fiscal al final de Ingresos y Gastos:781
- Donut chart:788
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):798
- Fiscal config: gastos items:805
- Fiscal: tab bar:817
- Fiscal: sticky save:822
- Fiscal: section title income/expense colors:824
- Fiscal: desgravaciones:834
- Fiscal: compras profesionales:861
- Desgravaciones: notas + tabla despacho info:869
- Nota IVA compras:889
- IVA por item en compras:891
- Fiscal: despacho en casa:898
- Hipoteca — resumen visual:921
- Hipoteca — compact 2-col grid:944
- Hipoteca — compact vinculaciones:952
- Hipoteca — read-only fields:963
- Hipoteca — edit/detail buttons:972
- Hipoteca — period summary card:978
- Multi-rate period cards:991
- Distribución de ingresos:1007
- Comparador: reorder buttons:1023
- Rate input styled:1027
- BIRTHDAYS:1031
- Cabe el nombre entero, hasta en tres lineas:1048
- VIP controls bar:1054
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1065
- VIP edit mode item states:1068
- Feat 1: Buscador en lista por meses:1078
- Upcoming birthdays:1104
- Weekend frame — gris lavanda suave:1121
- Hoy manda sobre el gris del fin de semana:1124
- Events in puentes (summary) — one per line:1144
- Events upcoming view:1148
- Minicabecera de día dentro de un panel de Próximos:1150
- Marcador de la tarjeta de Proximos: la forma real del evento:1160
- Horas del evento y transporte de ida/vuelta:1165
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1197
- Grid del mes: col fecha (48px) + col eventos (1fr):1199
- Columna fecha (col 1):1201
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1210
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1216
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1220
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1226
- Event color type picker:1230
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1236
- Color picker avanzado (paleta 6×8 + color libre):1240
- Detail color picker toggle:1258
- Annual events calendar:1264
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1294
- Selector de formas en el formulario de evento (Otros):1305
- Selector de grosor de barra (grande | Otros):1307
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1322
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1326
- Inicio/Fin bloqueados cuando hay Selección Multidía:1329
- Mini-overlay para elegir días específicos (Otros):1334
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1361
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1365
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1367
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1369
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1371
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1377
- Calendario 4 meses: 2 columnas × 2 filas:1379
- Botón ir al calendario mensual en puentes del resumen:1381
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1393
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1397
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1415
- Dropdown de vista anual:1422
- Linea que separa los chips de eventos grandes de los puntuales:1431
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1440
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1444
- Summary tabs — nivel 2:1447
- BRIDGE DAY CELLS in summary:1452
- VIP BIRTHDAYS:1461
- BIRTHDAY + EVENT ALARM PANEL:1464
- Campana de alarma en items de próximos (bday + eventos):1467
- 3-ZONE ALARM MARKER:1494
- ALARM MANAGEMENT OVERLAY:1507
- HOME POPUP (semanas pendientes / VIP sin alarma):1508
- MACRO URL EN MENÚ:1519
- Feat 4: Nav-bar emoji alignment:1525
- Birthday detail / form overlays:1541
- EVENTS:1551
- Zone A: upcoming/list views — subtle blue tint:1557
- Zone B: calendar grid views — subtle teal tint, active = green:1559
- Feat 2: Lista de Eventos subtabs:1568
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1585
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1587
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1616
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1620
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1626
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1641
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1646
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1663
- Perímetro puente: capa inferior a eventos:1665
- Bright past: bombilla override:1678
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1682
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1687
- Quad label 3 lines:1692
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1699
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1701
- Events list view:1703
- Event form overlay (inside eventsOverlay):1717
- Relleno, para que haga pareja con el naranja de "Editar evento":1747
- Event detail:1753
- LOGO POPUP:1761
- Gallery:1770
- BD ALARM VIP TOGGLE:1779
- RESPONSIVE (mobile header):1782
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1784
- ALARM PANEL:1837
- Drum picker (selector giratorio de hora/minuto):1842
- Confirmación alarma en el pasado:1861
- Botón flotante "Listo" en modo Editar VIPs:1867
- Controles inline long-press cumpleaños:1870
- Selector de clase en el formulario:1878
- Notas: general vs de un dia concreto:1884
- Pestana Bodas y pestana partida Vacaciones/Festivos:1888
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1893
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1906
- Filas del panel de un aviso:1920
- Estadisticas:1924
- Barras horizontales de reparto (componente generico: hBarRows):1932
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1942
- Dia cerrado: no admite mas clases:1959
- Fila con cambios sin guardar:1964
- Filtros de Parejas como chips pulsables:1976
- El color de la pareja va en un punto delante; el nombre, en color normal:2028
- Sala sin asignar: se marca en naranja para que cante en la lista:2033
- Nota propia del dia en la lista de Proximos:2036
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2038
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2040
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2048
- Editar siempre en naranja, como en el resto de la app:2054
- Los tres botones del detalle de pareja comparten aspecto:2066
- Subpestana Calendario de bodas:2103
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2117
- Dia resaltado al pulsar una pareja en la leyenda:2124
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2151
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2153
- etiqueta al minimo: el nombre de la pareja necesita el resto:2162
- el color de la pareja va en un punto, no tinendo el nombre:2165
- Los tres botones de la pareja, en una sola linea:2172
- Buscador y boton de anadir en la misma fila:2175
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2181
- Horario distinto segun el dia:2185
- Selector de icono de rutina:2191
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2231
- Diálogo: modo de importación (añadir vs reemplazar):2246
- PRINT:2259

**Rangos por prefijo de clase:** 
.action-btn:163-167 · .ah-cuota:466-468 · .ah-donut:476-478 · .ah-section:463-465 · .ah-total:473-475 · .ah-vs:469-472 · .alarm-cfg:1838-1838 · .alarm-colon:1841-1841 · .alarm-create:1853-1854 · .alarm-day:1858-1860 · .alarm-days:1855-1857 · .alarm-msg:1851-1852 · .alarm-panel:1839-1839 · .alarm-past:1862-1866 · .alarm-time:1840-1840 · .analisis-card:615-617 · .analisis-cards:604-604 · .analisis-hbar:618-623 · .analisis-input:633-636 · .analisis-ins:642-647 · .analisis-insurance:641-641 · .analisis-mortgage:624-640 · .app-logo:58-58 · .app-version:127-127 · .bd-alarm:1465-1781 · .bd-detail:1542-1549 · .bd-export:263-263 · .bday-add:1119-1120 · .bday-badge:1049-1051 · .bday-buscar:1081-1083 · .bday-cancel:1066-1067 · .bday-cell:1042-1125 · .bday-hdr:1033-1445 · .bday-ic:1872-1876 · .bday-inline:1871-1871 · .bday-io:1087-1103 · .bday-list:1053-1077 · .bday-listo:1868-1868 · .bday-month:1052-1052 · .bday-num:1047-1047 · .bday-search:1084-1086 · .bday-upcoming:1105-1463 · .bday-view:1034-1036 · .bday-vip:1055-1462 · .bday-week:1037-1039 · .boda-actions:2058-2058 · .boda-add:2060-2060 · .boda-asg:2080-2102 · .boda-buscar:2176-2178 · .boda-cal:2104-2127 · .boda-card:1982-2184 · .boda-chip:1978-1980 · .boda-chips:1977-1977 · .boda-cl:2025-2057 · .boda-class:1965-2024 · .boda-controls:1949-1949 · .boda-couple:2007-2009 · .boda-cpk:2074-2079 · .boda-date:2059-2059 · .boda-day:1960-1998 · .boda-det:2065-2174 · .boda-dia:2014-2016 · .boda-dot:1986-1986 · .boda-falta:1993-1993 · .boda-filters:1952-1952 · .boda-fsel:1953-1956 · .boda-ftoggles:1957-1958 · .boda-inp:2002-2002 · .boda-iss:1921-1923 · .boda-issue:1908-1919 · .boda-issues:1907-1907 · .boda-legend:2061-2064 · .boda-mini:2052-2053 · .boda-mode:1939-1941 · .boda-multi:2017-2022 · .boda-name:1987-1987 · .boda-ok:1994-1994 · .boda-place:2010-2035 · .boda-prog:1989-1990 · .boda-ro:2026-2034 · .boda-save:1974-1975 · .boda-savebar:1970-1973 · .boda-search:2179-2179 · .boda-sec:1905-1905 · .boda-sobra:1995-1995 · .boda-sort:2180-2180 · .boda-stat:1926-1931 · .boda-stats:1925-1925 · .boda-sticky:1901-1903 · .boda-sum:1945-1948 · .boda-summary:1944-1944 · .boda-time:2003-2003 · .boda-tp:2128-2131 · .boda-wed:1988-1988 · .bottom-sheet:173-174 · .btn-icon:100-1827 · .csv-export:73-74 · .data-actions:96-1829 · .data-btn:97-1825 · .data-menu:121-126 · .day-cell:141-241 · .day-date:146-146 · .day-hours:147-147 · .day-name:145-145 · .day-status:154-154 · .days-grid:140-140 · .default-hours:69-78 · .dp-actions:1357-1358 · .dp-counter:1344-1345 · .dp-day:1352-1356 · .dp-days:1351-1351 · .dp-grid:1346-1346 · .dp-handle:1339-1339 · .dp-hdr:1340-1340 · .dp-mhdr:1349-1350 · .dp-mname:1348-1348 · .dp-month:1347-1347 · .dp-overlay:1335-1338 · .dp-sheet:1337-1337 · .dp-title:1341-1341 · .dp-yearnav:1342-1343 · .drum-picker:1844-1847 · .drum-sel:1850-1850 · .drum-wrap:1843-1849 · .econ-add:550-551 · .econ-ahorro:771-778 · .econ-annual:380-380 · .econ-avg:381-698 · .econ-bracket:533-539 · .econ-calc:681-682 · .econ-casc:685-692 · .econ-cascade:684-684 · .econ-chart:563-564 · .econ-comp:541-565 · .econ-decl:528-702 · .econ-distrib:1008-1022 · .econ-donut:789-804 · .econ-equiv:1003-1006 · .econ-fiscal:782-787 · .econ-formula:400-403 · .econ-gastos:704-716 · .econ-gear:500-501 · .econ-hdr:422-502 · .econ-ingresado:388-388 · .econ-irpf:718-780 · .econ-legend:566-567 · .econ-line:561-562 · .econ-month:405-418 · .econ-mr:1000-1001 · .econ-multi:992-1002 · .econ-opt:677-680 · .econ-qcard:370-377 · .econ-qcell:366-1788 · .econ-qm:375-375 · .econ-qmonth:373-374 · .econ-quarter:362-1785 · .econ-rate:504-512 · .econ-row:389-399 · .econ-sc:543-1029 · .econ-scenario:542-542 · .econ-section:419-419 · .econ-sim:569-579 · .econ-stats:516-521 · .econ-sub:425-431 · .econ-tab:423-424 · .econ-toggle:523-526 · .econ-val:404-404 · .est-btn:436-440 · .est-card:446-448 · .est-detail:443-443 · .est-field:455-461 · .est-fields:454-454 · .est-group:434-438 · .est-modo:449-449 · .est-nav:433-433 · .est-section:442-442 · .est-tariff:444-453 · .ev-alarm:1483-2047 · .ev-ann:1394-1643 · .ev-annual:1162-1677 · .ev-badge:1702-1702 · .ev-badges:1612-1612 · .ev-bars:1588-1588 · .ev-barsize:1308-1317 · .ev-bficha:2158-2158 · .ev-bfila:2159-2168 · .ev-bpunto:2166-2166 · .ev-bright:1679-1689 · .ev-btn:1740-1890 · .ev-bver:2171-2171 · .ev-car:1627-2155 · .ev-cell:1126-1698 · .ev-char:1729-1729 · .ev-checkbox:1734-1734 · .ev-chip:1437-1437 · .ev-color:1238-1257 · .ev-colors:1730-1730 · .ev-date:1731-1731 · .ev-dates:1330-1332 · .ev-day:1615-1654 · .ev-daynote:1886-1886 · .ev-del:2243-2244 · .ev-detail:1259-2152 · .ev-dot:159-159 · .ev-dots:158-158 · .ev-edit:1385-1744 · .ev-field:1723-1724 · .ev-filter:1432-1439 · .ev-form:1718-1739 · .ev-hdr:1446-1553 · .ev-hora:1166-1166 · .ev-input:1725-1726 · .ev-io:1089-1752 · .ev-kind:1879-1883 · .ev-list:1569-2242 · .ev-month:1577-1577 · .ev-multi:1602-1674 · .ev-note:1885-1885 · .ev-num:1700-1700 · .ev-otros:1306-1659 · .ev-puente:1666-1666 · .ev-quad:1380-1694 · .ev-repeat:1735-1735 · .ev-rut:1650-1653 · .ev-search:2233-2237 · .ev-sep:1189-1189 · .ev-shape:1318-1325 · .ev-sort:2238-2239 · .ev-textarea:1727-1728 · .ev-toggle:1732-1733 · .ev-type:1231-1239 · .ev-types:1572-1574 · .ev-up:1151-1475 · .ev-upcoming:323-2039 · .ev-viaje:1167-1175 · .ev-view:1554-1556 · .ev-wd:1737-1738 · .ev-week:319-1664 · .ev-weekday:1736-1736 · .ev-wk:1176-2051 · .ev-zone:1558-2139 · .excl-item:349-514 · .excl-row:329-513 · .fiscal-add:670-833 · .fiscal-bracket:661-669 · .fiscal-compras:862-897 · .fiscal-copy:497-499 · .fiscal-custom:658-658 · .fiscal-ded:872-886 · .fiscal-desgrav:835-887 · .fiscal-despacho:899-920 · .fiscal-error:674-674 · .fiscal-gasto:806-868 · .fiscal-gastos:888-888 · .fiscal-hdr:818-818 · .fiscal-highlight:859-859 · .fiscal-onoff:901-902 · .fiscal-pct:659-668 · .fiscal-period:814-815 · .fiscal-radio:653-657 · .fiscal-save:672-673 · .fiscal-section:651-826 · .fiscal-sticky:823-823 · .fiscal-subsection:827-828 · .fiscal-tab:819-821 · .fiscal-viaje:829-830 · .fiscal-vinc:912-913 · .fiscal-year:493-496 · .full-overlay:244-245 · .hbar-lbl:1935-1935 · .hbar-row:1934-1934 · .hbar-rows:1933-1933 · .hbar-track:1936-1937 · .hbar-val:1938-1938 · .header:54-1830 · .header-brand:57-57 · .hip-add:990-990 · .hip-auto:941-941 · .hip-bar:927-934 · .hip-cancel:977-977 · .hip-cf:946-951 · .hip-edit:973-975 · .hip-g2:945-945 · .hip-grid:939-939 · .hip-period:979-988 · .hip-resumen:922-926 · .hip-ro:964-971 · .hip-save:976-976 · .hip-section:940-989 · .hip-stat:936-938 · .hip-stats:935-935 · .hip-sub:943-943 · .hip-vinc:942-942 · .hip-vr:953-962 · .home-popup:1509-1518 · .hour-chip:87-88 · .hour-chips:86-86 · .hour-picker:84-85 · .hours-chip:81-82 · .hours-chips:80-80 · .hours-control:68-68 · .hours-label:79-79 · .hours-panel:83-83 · .ico-doc:75-75 · .ico-exportar:264-264 · .imp-mode:2247-2257 · .io-peligro:1094-1102 · .io-primaria:1093-1100 · .logo-gallery:1771-1778 · .logo-popup:1762-1769 · .macro-section:1520-1521 · .macro-url:1522-1524 · .mg-budget:480-489 · .mg-cat:490-490 · .mg-desgrav:491-491 · .mg-sort:486-486 · .month-nav:59-61 · .month-stat:90-93 · .month-summary:89-89 · .ms-breakdown:351-351 · .ms-hrs:95-95 · .ms-label:94-94 · .ms-num:91-91 · .ms-sep:352-352 · .nav-bar:1442-1834 · .nav-btn:62-63 · .option-desc:189-189 · .option-dot:182-186 · .option-hours:190-190 · .option-info:187-187 · .option-label:188-188 · .overlay:171-172 · .overlay-nav:1441-1443 · .rate-input:359-2276 · .rate-label:358-358 · .rate-row:357-357 · .rate-suffix:360-360 · .rut-add:2215-2215 · .rut-card:2198-2213 · .rut-day:2206-2222 · .rut-days:2205-2220 · .rut-dot:2201-2201 · .rut-hist:2227-2230 · .rut-hora:2190-2208 · .rut-hpd:2186-2189 · .rut-icon:2192-2196 · .rut-name:2202-2202 · .rut-pct:2214-2214 · .rut-prox:2209-2211 · .rut-sec:2197-2197 · .rut-stat:2224-2226 · .rut-sug:2216-2219 · .rut-susp:2223-2223 · .rut-tag:2203-2204 · .rut-vacio:2212-2212 · .rut-wpick:2145-2150 · .sent-badge:137-137 · .sheet-handle:175-175 · .sheet-option:179-181 · .sheet-options:178-178 · .sheet-subtitle:177-177 · .sheet-title:176-176 · .sim-combo:581-585 · .sim-field:570-571 · .sim-hr:580-580 · .sim-period:577-577 · .sim-target:572-576 · .sub-block:606-607 · .sub-row:608-614 · .sw-upd:204-204 · .sy-back:250-2267 · .sy-body:270-2265 · .sy-card:281-2271 · .sy-cards3:273-273 · .sy-cards4:274-274 · .sy-chart:299-299 · .sy-hdr:255-255 · .sy-header:249-2266 · .sy-lbl:290-2270 · .sy-list:303-354 · .sy-month:317-317 · .sy-nav:259-1691 · .sy-note:300-302 · .sy-pdf:261-262 · .sy-puente:309-1460 · .sy-section:271-272 · .sy-spain:275-280 · .sy-sublbl:379-379 · .sy-suelto:314-316 · .sy-tab:1448-1451 · .sy-table:291-2272 · .sy-td:296-296 · .sy-tr:297-2273 · .sy-val:286-2269 · .sy-year:252-2268 · .toast:193-198 · .toast-undo:206-206 · .today-btn:64-65 · .vac-config:325-327 · .vip-no:1061-1062 · .week-actions:162-162 · .week-card:131-223 · .week-header:134-134 · .week-info:135-136 · .week-total:138-138 · .weeks-container:130-130

