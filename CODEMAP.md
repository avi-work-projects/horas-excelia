# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays.js  _(1026 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:65 · BDAY_ALARM_SET:66 · BDAY_ALARM_COUNT_KEY:67 · BDAY_ALARM_COUNT:68 · BDAY_PALETTE:72 · BDAYS:76 · DN7:236

**Funciones:** _showBdayInlineCtrl:17 · tc:85 · bdName:86 · getBdayColor:88 · getBdaysOn:97 · daysUntil:99 · hasUpcomingBday:106 · updateBdayBtn:112 · getBdayAlarmKey:122 · isBdayAlarmSet:123 · setBdayAlarmState:124 · syncVipBdaysToEvents:130 · renderBdayUpcoming:155 · getBdaysInRange:160 · bdayLabel:175 · renderGroup:184 · renderBdayCalMonth:234 · renderBdayList:275 · getEffVip:282 · renderBdayContent:324 · renderBdayDetail:392 · renderBdayAlarmPanel:413 · fmtDate:425 · openBdayAlarm:480 · _bdRefreshBoth:487 · closeBdayAlarm:492 · bindBdayAlarmEvents:494 (!147) · fmtD:610 · onOk:618 · onErr:619 · renderBdayForm:641 · openBdayDetail:674 · closeBdayDetail:684 · openBdayForm:687 · closeBdayForm:697 · bindBdayFormEvents:701 · openBday:742 · closeBday:751 · refreshBday:757 · applyBdaySearch:763 · bindBdayEvents:775 (!207) · _bdResetScroll:806 · _bdScrollToMonth:808 · bindBdayUpcoming:982 · bdayPanelHost:1022

### js/bodas.js  _(1665 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:25 · BODA_PLACE_DEFAULT:31 · BODA_PLACE_NONE:34 · BODA_PLACE_SHORT:35 · BODA_PLACE_DESC:36 · BODA_PLACE_EMOJI:38 · BODA_WHITE:55 · BODA_SLOTS:56 · BODA_NO_TIME_COLOR:62 · BODA_NO_COUPLE_COLOR:63 · BODA_DEFAULT_TIME:64 · BODA_PALETTE:67 · BODA_CLOSED_SK:223 · BODA_CLOSED:224 · BODA_PENDING:239 · BODA_SUBTAB:280 · BODA_CLASS_MODE:281 · BODA_CLASES_SEARCH:282 · BODA_HIDE_PAST:283 · BODA_HIDE_CLOSED:284 · BODA_CARD_OPEN:285 · BODA_PAREJAS_SEARCH:286 · BODA_PAREJAS_SORT:289 · BODA_PAREJAS_FILTER:290 · BODA_CAL_HL:291 · BODA_CAL_YEAR:292 · BODA_CAL_MONTH:293 · DN2:817 · BODA_ASSIGN:864 · BODA_FORM:1109 · BODA_TIME_H:1308

**Funciones:** saveBodas:18 · bodaPlaceEmoji:39 · bodaPlaceOf:43 · bodaPlaceLabel:48 · bodaNextColor:69 · bodaCouple:77 · bodaSlot:81 · bodaSlotColors:91 · bodaMarkFor:96 · evBodaSvg:102 · bodaClasses:119 · bodaPrimeraClase:123 · bodaClassesOfCouple:127 · bodaFreeClasses:130 · bodaClaseById:133 · bodaSortClasses:137 · bodaClassesOnDay:144 · bodaNewClass:147 · bodaNormalizeClasses:162 · bodaPlaceForNewOn:197 · bodaDayFull:202 · bodaBulkCreate:207 · bodaProgress:217 · saveBodaClosed:228 · bodaIsClosed:229 · bodaToggleClosed:230 · bodaPendingCount:240 · bodaEff:242 · bodaSetPending:250 · bodaPendingApply:254 · bodaPendingDiscard:277 · _bodaLegendHtml:296 · _renderBodaCalendario:307 (!85) · renderBodasBody:392 · _bodaCmpFecha:421 · _renderBodaParejas:427 (!89) · _bodaFmt:516 · _bodaFmtCorto:517 · _renderBodaClases:524 (!108) · bodaOpenSheet:632 · bodaCloseSheet:635 · bodaCreatedAt:641 · bodaIssues:646 · _renderBodaIssueCards:662 · card:665 · openBodaIssue:686 (!81) · findEv:728 · closeBodaIssue:767 · _bodaWeekKey:770 · _renderBodaStats:777 (!88) · openBodaAssign:865 · closeBodaAssign:885 · renderBodaAssign:889 (!81) · bindBodaAssign:970 · openBodaPlacePicker:1039 · closeBodaPlacePicker:1072 · bodaAplicarCampo:1076 · bodaTrasElegir:1086 · _bodaMasUnaHora:1098 · openBodaClaseForm:1110 · _bodaFormRender:1126 (!131) · closeBodaClaseForm:1257 · openBodaCouplePicker:1263 · row:1274 · apply:1291 · closeBodaCouplePicker:1305 · openBodaTimePicker:1311 · drum:1316 · setDrum:1339 · mark:1344 · drumVal:1348 · readManual:1369 · closeBodaTimePicker:1389 · renderBodaCoupleForm:1392 · openBodaCoupleForm:1416 · closeBodaCoupleForm:1453 · bodaRefreshRow:1457 · bindBodasEvents:1486 (!179) · _guardaPendientes:1488 · _bodaCalMove:1504 · findClass:1601

### js/core.js  _(726 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:137 · MN_SHORT:139 · DN5:360 · FESTIVOS_ANIO:576

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:144 · save:156 · loadEconYear:160 · saveEconYear:179 · fakeTrans:189 · simpleBarChart:206 · hBarRows:230 · shareOrDownload:247 · escHtml:267 · mkey:272 · getMonthH:273 · defH:279 · dayH:280 · dayT:281 · dk:282 · fd:283 · ad:284 · fh:285 · fhP:286 · isToday:287 · isPast:288 · wn:289 · weeks:292 · getWD:307 · showToast:323 · sendEmail:349 · buildMailtoBody:359 · render:381 (!97) · fmtH:457 · openSheet:478 · closeSheet:497 · selectType:503 · contarVacaciones:536 · confirmarCupoVacaciones:549 · contarFestivos:564 · confirmarCupoFestivos:577 · togSent:586 · _panelBorrarLuego:607 · _panelCancelarBorrado:618 · abrirPanel:620 · engancharFondo:640 · abrirUnaVez:658 · cerrarPanel:664 · renderNavBar:675 · bindNavBar:698 · doNav:705

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

### js/events-bind.js  _(521 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:68 · _bindEvNav:77 (!193) · _scrollWeekToMonth:85 · _scrollWeekToToday:132 · doScroll:142 · _bindEvCal:270 (!91) · _bindEvListas:361 (!141) · apply:470 · _bindEvGestos:502 · _evSwipeUpcoming:515

### js/events-cal.js  _(370 líneas)_
**Estado global:** DN7:25

**Funciones:** renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · renderEvAnnual:342 · renderEvQuad:351

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

### js/events-render.js  _(610 líneas)_
**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!178) · fd2:50 · renderEvItem:51 · renderEvPanel:101 · renderEvByTypes:221 · coincide:247 · renderEvMonthsView:293 · _evWeekLanes:304 · assign:307 · renderEvWeek:321 (!134) · hexA:325 · renderEvContent:455 (!155)

### js/events.js  _(766 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:53 · EV_QUAD_YEAR:54 · EV_QUAD_MONTH:55 · EV_TO_SUBTAB:56 · EV_TYPES_FILTER:57 · EV_TYPES_PAST:58 · EV_LIST_SORT:59 · EV_LIST_SEARCH:60 · EV_COLORS:61 · EVENTS:62 · EV_ALARM_SK:91 · EV_ALARMS_SET:92 · EV_NO_RUT:184 · EV_MAX_BAR_DIA:239 · EV_MARK_ORDER:344 · EV_MAX_PUNT_DIA:385 · EV_MAX_RUT_DIA:386 · EV_CAL_CORNER_STACK:389 · EV_MAX_VIP_DIA:391 · EV_CAL_VIP_MAX:392 · EV_UP_SHOW_RUT:394 · EV_UP_SHOW_BODA:395 · EV_BAR_Z:444 · EV_COMPARTE_DIA:448 · EV_MNS:634 · EV_CAR:677 · EV_TRANSPORTES:696 · EV_TRANS_EMOJI:702

**Funciones:** evFilterGroup:44 · saveEvents:86 · loadEvAlarms:93 · saveEvAlarms:94 · _findBdayByEvId:95 · isEvAlarmSet:107 · setEvAlarmState:113 · evDk:120 · _evClampDate:129 · eventOccursOn:133 · getEventsOn:177 · evSignature:192 · evMergeIncoming:202 · evMergeMsg:226 · _fmtDayEs:238 · evBarLimitExceeded:240 · evDayLimitExceeded:250 · rutDayCount:286 · hasUpcomingEvent:293 · updateEventsBtn:302 · evDefaultShape:316 · evMarkerHtml:322 · evMorePlusHtml:336 · evMarkPriority:345 · evBodaMinutes:352 · evSortMarks:363 · ev0:364 · evAnnualXsHtml:396 · vipStarSvgHtml:406 · evIsoDate:418 · _isVipBdayTooFar:419 · evUpcomingMarkHtml:426 · _evRowOcc:445 · evComparteDia:449 · _evSoloSeRozan:454 · _evTrozosSeRozan:465 · _evAssignRow:473 · _evMarcarMitades:487 · _evMitadesStyle:502 · evBarZ:509 · _evBarSegments:513 · _evBarBand:536 · _evBarSegmentStyle:542 · _evBarExtent:547 · _evRoundedOutline:558 · near:567 · _evBarMutedColor:586 · _evSteppedBar:589 · _evAnnualCtx:637 · visible:638 · _evLoadPuentes:656 · _evScheduleRemove:684 · _evCancelRemove:685 · evStartTime:704 · evEndTime:710 · evTimeLabel:717 · evTramos:724 · evTramoTexto:735 · evMinutosDe:742 · _positionEvBright:752

### js/home-popup.js  _(84 líneas)_
**Funciones:** dismissPopup:75

### js/import-export.js  _(529 líneas)_
**Funciones:** _lsJson:259 · askImportMode:266 · close:278 · _mergeMap:292 · _mergeList:303 · _sigEvent:324 · _sigCouple:326 · _sigAlarm:327 · _sigGasto:328 · _keyId:330 · _keyBday:331 · _keyGasto:332 · _exportPerYearKeys:338 (!81) · _applyFullImport:419 (!110)

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

### css/styles.css  _(2328 líneas)_

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
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1220
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1224
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1230
- Event color type picker:1234
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1240
- Color picker avanzado (paleta 6×8 + color libre):1244
- Detail color picker toggle:1262
- Annual events calendar:1268
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1298
- Selector de formas en el formulario de evento (Otros):1309
- Selector de grosor de barra (grande | Otros):1311
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1326
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1330
- Inicio/Fin bloqueados cuando hay Selección Multidía:1333
- Mini-overlay para elegir días específicos (Otros):1338
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1365
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1369
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1371
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
- 3-ZONE ALARM MARKER:1505
- ALARM MANAGEMENT OVERLAY:1518
- HOME POPUP (semanas pendientes / VIP sin alarma):1519
- MACRO URL EN MENÚ:1530
- Feat 4: Nav-bar emoji alignment:1536
- Birthday detail / form overlays:1552
- EVENTS:1562
- Zone A: upcoming/list views — subtle blue tint:1568
- Zone B: calendar grid views — subtle teal tint, active = green:1570
- Feat 2: Lista de Eventos subtabs:1579
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1596
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1598
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1610
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1614
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1620
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1635
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1645
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1668
- Perímetro puente: capa inferior a eventos:1670
- Bright past: bombilla override:1683
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1687
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1692
- Quad label 3 lines:1697
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1704
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1706
- Events list view:1708
- Event form overlay (inside eventsOverlay):1722
- Relleno, para que haga pareja con el naranja de "Editar evento":1752
- Event detail:1758
- LOGO POPUP:1766
- Gallery:1775
- BD ALARM VIP TOGGLE:1784
- RESPONSIVE (mobile header):1787
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1789
- ALARM PANEL:1842
- Drum picker (selector giratorio de hora/minuto):1847
- Confirmación alarma en el pasado:1873
- Botón flotante "Listo" en modo Editar VIPs:1879
- Controles inline long-press cumpleaños:1882
- Selector de clase en el formulario:1890
- Notas: general vs de un dia concreto:1896
- Pestana Bodas y pestana partida Vacaciones/Festivos:1900
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1905
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1918
- Filas del panel de un aviso:1932
- Estadisticas:1936
- Barras horizontales de reparto (componente generico: hBarRows):1944
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1954
- Dia cerrado: no admite mas clases:1971
- Una clase a la que le falta la hora o la sala se marca ella sola.:1983
- Fila con cambios sin guardar:1988
- Filtros de Parejas como chips pulsables:2000
- El color de la pareja va en un punto delante; el nombre, en color normal:2063
- Sala sin asignar: se marca en naranja para que cante en la lista:2068
- Nota propia del dia en la lista de Proximos:2071
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2073
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2075
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2083
- Editar siempre en naranja, como en el resto de la app:2089
- Los tres botones del detalle de pareja comparten aspecto:2106
- Subpestana Calendario de bodas:2146
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2160
- Dia resaltado al pulsar una pareja en la leyenda:2167
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2194
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2196
- etiqueta al minimo: el nombre de la pareja necesita el resto:2205
- el color de la pareja va en un punto, no tinendo el nombre:2208
- Los tres botones de la pareja, en una sola linea:2215
- Buscador y boton de anadir en la misma fila:2218
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2224
- Horario distinto segun el dia:2228
- Selector de icono de rutina:2234
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2274
- Diálogo: modo de importación (añadir vs reemplazar):2289
- PRINT:2302
- Separacion de siluetas incluso entre grosores distintos.:2322

**Rangos por prefijo de clase:** 
.action-btn:166-170 · .ah-cuota:472-474 · .ah-donut:482-484 · .ah-section:469-471 · .ah-total:479-481 · .ah-vs:475-478 · .alarm-cfg:1843-1843 · .alarm-colon:1846-1846 · .alarm-create:1860-1866 · .alarm-day:1870-1872 · .alarm-days:1867-1869 · .alarm-msg:1856-1857 · .alarm-panel:1844-1844 · .alarm-past:1874-1878 · .alarm-time:1845-1845 · .analisis-card:621-623 · .analisis-cards:610-610 · .analisis-hbar:624-629 · .analisis-input:639-642 · .analisis-ins:648-653 · .analisis-insurance:647-647 · .analisis-mortgage:630-646 · .app-logo:61-61 · .app-version:130-130 · .bd-alarm:1465-1786 · .bd-detail:1553-1560 · .bd-export:269-269 · .bday-add:1122-1123 · .bday-badge:1052-1054 · .bday-buscar:1084-1086 · .bday-cancel:1069-1070 · .bday-cell:1045-1128 · .bday-hdr:1039-1445 · .bday-ic:1884-1888 · .bday-inline:1883-1883 · .bday-io:1090-1106 · .bday-list:1056-1080 · .bday-listo:1880-1880 · .bday-month:1055-1055 · .bday-num:1050-1050 · .bday-search:1087-1089 · .bday-upcoming:1108-2327 · .bday-vip:1058-1462 · .bday-week:1040-1042 · .boda-actions:2098-2098 · .boda-add:2100-2100 · .boda-asg:2123-2145 · .boda-buscar:2219-2221 · .boda-cal:2147-2170 · .boda-card:2006-2227 · .boda-chip:2002-2004 · .boda-chips:2001-2001 · .boda-cl:2060-2097 · .boda-class:1984-2059 · .boda-controls:1961-1961 · .boda-couple:2042-2044 · .boda-cpk:2114-2122 · .boda-date:2099-2099 · .boda-day:1978-2022 · .boda-det:2105-2217 · .boda-dia:2049-2051 · .boda-dot:2010-2010 · .boda-falta:2017-2017 · .boda-filters:1964-1964 · .boda-fsel:1965-1968 · .boda-ftoggles:1969-1970 · .boda-hd:2093-2095 · .boda-inp:2037-2037 · .boda-iss:1933-1935 · .boda-issue:1920-1931 · .boda-issues:1919-1919 · .boda-legend:2101-2104 · .boda-mini:2087-2088 · .boda-mode:1951-1953 · .boda-multi:2052-2057 · .boda-name:2011-2011 · .boda-ok:2018-2018 · .boda-place:2045-2070 · .boda-prog:2013-2014 · .boda-ro:2061-2069 · .boda-save:1998-1999 · .boda-savebar:1994-1997 · .boda-search:2222-2222 · .boda-sec:1917-1917 · .boda-sobra:2019-2019 · .boda-sort:2223-2223 · .boda-stat:1938-1943 · .boda-stats:1937-1937 · .boda-sticky:1913-1915 · .boda-sum:1957-1960 · .boda-summary:1956-1956 · .boda-swap:2027-2034 · .boda-time:2038-2038 · .boda-tp:2171-2174 · .boda-wed:2012-2012 · .bottom-sheet:176-177 · .btn-icon:103-1832 · .csv-export:76-77 · .data-actions:99-1834 · .data-btn:100-1830 · .data-menu:124-129 · .day-cell:144-247 · .day-date:149-149 · .day-hours:150-150 · .day-name:148-148 · .day-status:157-157 · .days-grid:143-143 · .default-hours:72-81 · .dp-actions:1361-1362 · .dp-counter:1348-1349 · .dp-day:1356-1360 · .dp-days:1355-1355 · .dp-grid:1350-1350 · .dp-handle:1343-1343 · .dp-hdr:1344-1344 · .dp-mhdr:1353-1354 · .dp-mname:1352-1352 · .dp-month:1351-1351 · .dp-overlay:1339-1342 · .dp-sheet:1341-1341 · .dp-title:1345-1345 · .dp-yearnav:1346-1347 · .drum-picker:1849-1852 · .drum-sel:1855-1855 · .drum-wrap:1848-1854 · .econ-add:556-557 · .econ-ahorro:777-784 · .econ-annual:386-386 · .econ-avg:387-704 · .econ-bracket:539-545 · .econ-calc:687-688 · .econ-casc:691-698 · .econ-cascade:690-690 · .econ-chart:569-570 · .econ-comp:547-571 · .econ-decl:534-708 · .econ-distrib:1014-1028 · .econ-donut:795-810 · .econ-equiv:1009-1012 · .econ-fiscal:788-793 · .econ-formula:406-409 · .econ-gastos:710-722 · .econ-gear:506-507 · .econ-hdr:428-508 · .econ-ingresado:394-394 · .econ-irpf:724-786 · .econ-legend:572-573 · .econ-line:567-568 · .econ-month:411-424 · .econ-mr:1006-1007 · .econ-multi:998-1008 · .econ-opt:683-686 · .econ-qcard:376-383 · .econ-qcell:372-1793 · .econ-qm:381-381 · .econ-qmonth:379-380 · .econ-quarter:368-1790 · .econ-rate:510-518 · .econ-row:395-405 · .econ-sc:549-1035 · .econ-scenario:548-548 · .econ-section:425-425 · .econ-sim:575-585 · .econ-stats:522-527 · .econ-sub:431-437 · .econ-tab:429-430 · .econ-toggle:529-532 · .econ-val:410-410 · .est-btn:442-446 · .est-card:452-454 · .est-detail:449-449 · .est-field:461-467 · .est-fields:460-460 · .est-group:440-444 · .est-modo:455-455 · .est-nav:439-439 · .est-section:448-448 · .est-tariff:450-459 · .ev-alarm:1488-2082 · .ev-ann:1394-1642 · .ev-annual:1165-1682 · .ev-badge:1707-1707 · .ev-badges:1606-1606 · .ev-bar:1662-1662 · .ev-bars:1599-1599 · .ev-barsize:1312-1321 · .ev-bficha:2201-2201 · .ev-bfila:2202-2211 · .ev-bpunto:2209-2209 · .ev-bright:1684-1694 · .ev-btn:1745-1902 · .ev-bver:2214-2214 · .ev-car:1621-2198 · .ev-cell:1129-1703 · .ev-char:1734-1734 · .ev-checkbox:1739-1739 · .ev-chip:1437-1437 · .ev-color:1242-1261 · .ev-colors:1735-1735 · .ev-date:1736-1736 · .ev-dates:1334-1336 · .ev-day:1609-1653 · .ev-daynote:1898-1898 · .ev-del:2286-2287 · .ev-detail:1263-2195 · .ev-dot:162-162 · .ev-dots:161-161 · .ev-edit:1385-1749 · .ev-field:1728-1729 · .ev-filter:1432-1439 · .ev-form:1723-1744 · .ev-hdr:1446-1564 · .ev-hora:1169-1169 · .ev-input:1730-1731 · .ev-io:1092-1757 · .ev-kind:1891-1895 · .ev-list:1580-2285 · .ev-month:1588-1588 · .ev-multi:1603-2324 · .ev-note:1897-1897 · .ev-num:1705-1705 · .ev-otros:1310-1658 · .ev-puente:1671-1671 · .ev-quad:1380-1699 · .ev-repeat:1740-1740 · .ev-rut:1649-1652 · .ev-search:2276-2280 · .ev-sep:1192-1192 · .ev-shape:1322-1329 · .ev-sort:2281-2326 · .ev-stepped:1664-1666 · .ev-textarea:1732-1733 · .ev-toggle:1737-1738 · .ev-type:1235-1243 · .ev-types:1583-1585 · .ev-up:1154-1167 · .ev-upcoming:329-2074 · .ev-viaje:1170-1178 · .ev-view:1565-1567 · .ev-wd:1742-1743 · .ev-week:325-1669 · .ev-weekday:1741-1741 · .ev-wk:1179-2086 · .ev-zone:1569-2182 · .excl-item:355-520 · .excl-row:335-519 · .fiscal-add:676-839 · .fiscal-bracket:667-675 · .fiscal-compras:868-903 · .fiscal-copy:503-505 · .fiscal-custom:664-664 · .fiscal-ded:878-892 · .fiscal-desgrav:841-893 · .fiscal-despacho:905-926 · .fiscal-error:680-680 · .fiscal-gasto:812-874 · .fiscal-gastos:894-894 · .fiscal-hdr:824-824 · .fiscal-highlight:865-865 · .fiscal-onoff:907-908 · .fiscal-pct:665-674 · .fiscal-period:820-821 · .fiscal-radio:659-663 · .fiscal-save:678-679 · .fiscal-section:657-832 · .fiscal-sticky:829-829 · .fiscal-subsection:833-834 · .fiscal-tab:825-827 · .fiscal-viaje:835-836 · .fiscal-vinc:918-919 · .fiscal-year:499-502 · .full-overlay:250-251 · .hbar-lbl:1947-1947 · .hbar-row:1946-1946 · .hbar-rows:1945-1945 · .hbar-track:1948-1949 · .hbar-val:1950-1950 · .header:57-1835 · .header-brand:60-60 · .hip-add:996-996 · .hip-auto:947-947 · .hip-bar:933-940 · .hip-cancel:983-983 · .hip-cf:952-957 · .hip-edit:979-981 · .hip-g2:951-951 · .hip-grid:945-945 · .hip-period:985-994 · .hip-resumen:928-932 · .hip-ro:970-977 · .hip-save:982-982 · .hip-section:946-995 · .hip-stat:942-944 · .hip-stats:941-941 · .hip-sub:949-949 · .hip-vinc:948-948 · .hip-vr:959-968 · .home-popup:1520-1529 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:270-270 · .imp-mode:2290-2300 · .io-peligro:1097-1105 · .io-primaria:1096-1103 · .logo-gallery:1776-1783 · .logo-popup:1767-1774 · .macro-section:1531-1532 · .macro-url:1533-1535 · .mg-budget:486-495 · .mg-cat:496-496 · .mg-desgrav:497-497 · .mg-sort:492-492 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-92 · .ms-breakdown:357-357 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:358-358 · .nav-bar:1442-1839 · .nav-btn:65-66 · .option-desc:192-192 · .option-dot:185-189 · .option-hours:193-193 · .option-info:190-190 · .option-label:191-191 · .overlay:174-175 · .overlay-nav:1441-1443 · .rate-input:365-2319 · .rate-label:364-364 · .rate-row:363-363 · .rate-suffix:366-366 · .rut-add:2258-2258 · .rut-card:2241-2256 · .rut-day:2249-2265 · .rut-days:2248-2263 · .rut-dot:2244-2244 · .rut-hist:2270-2273 · .rut-hora:2233-2251 · .rut-hpd:2229-2232 · .rut-icon:2235-2239 · .rut-name:2245-2245 · .rut-pct:2257-2257 · .rut-prox:2252-2254 · .rut-sec:2240-2240 · .rut-stat:2267-2269 · .rut-sug:2259-2262 · .rut-susp:2266-2266 · .rut-tag:2246-2247 · .rut-vacio:2255-2255 · .rut-wpick:2188-2193 · .sent-badge:140-140 · .sheet-handle:178-178 · .sheet-option:182-184 · .sheet-options:181-181 · .sheet-subtitle:180-180 · .sheet-title:179-179 · .sim-combo:587-591 · .sim-field:576-577 · .sim-hr:586-586 · .sim-period:583-583 · .sim-target:578-582 · .sub-block:612-613 · .sub-row:614-620 · .sw-upd:207-207 · .sy-back:256-2310 · .sy-body:276-2308 · .sy-card:287-2314 · .sy-cards3:279-279 · .sy-cards4:280-280 · .sy-chart:305-305 · .sy-hdr:261-261 · .sy-header:255-2309 · .sy-lbl:296-2313 · .sy-list:309-360 · .sy-month:323-323 · .sy-nav:265-1696 · .sy-note:306-308 · .sy-pdf:267-268 · .sy-puente:315-1460 · .sy-section:277-278 · .sy-spain:281-286 · .sy-sublbl:385-385 · .sy-suelto:320-322 · .sy-tab:1448-1451 · .sy-table:297-2315 · .sy-td:302-302 · .sy-tr:303-2316 · .sy-val:292-2312 · .sy-year:258-2311 · .toast:196-212 · .toast-undo:209-209 · .today-btn:67-68 · .vac-config:331-333 · .vip-no:1064-1065 · .week-actions:165-165 · .week-card:134-229 · .week-header:137-137 · .week-info:138-139 · .week-total:141-141 · .weeks-container:133-133

