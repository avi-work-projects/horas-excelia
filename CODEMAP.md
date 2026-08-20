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

**Funciones:** _showBdayInlineCtrl:17 · tc:72 · bdName:73 · getBdayColor:75 · shortName:84 · getBdaysOn:89 · daysUntil:91 · hasUpcomingBday:98 · updateBdayBtn:104 · getBdayAlarmKey:114 · isBdayAlarmSet:115 · setBdayAlarmState:116 · syncVipBdaysToEvents:122 · renderBdayUpcoming:147 · getBdaysInRange:152 · bdayLabel:167 · renderGroup:176 · renderBdayCalMonth:226 · renderBdayList:267 · getEffVip:278 · renderBdayContent:320 · renderBdayDetail:379 · renderBdayAlarmPanel:400 · fmtDate:412 · openBdayAlarm:467 · _bdRefreshBoth:482 · closeBdayAlarm:487 · bindBdayAlarmEvents:496 (!147) · fmtD:612 · onOk:620 · onErr:621 · renderBdayForm:643 · openBdayDetail:676 · closeBdayDetail:694 · openBdayForm:701 · closeBdayForm:716 · bindBdayFormEvents:722 · openBday:763 · closeBday:772 · refreshBday:778 · applyBdaySearch:783 · bindBdayEvents:795 (!235) · _bdResetScroll:826

### js/bodas.js  _(1399 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_NONE:30 · BODA_PLACE_SHORT:31 · BODA_PLACES:32 · BODA_WHITE:45 · BODA_SLOTS:46 · BODA_NO_TIME_COLOR:52 · BODA_NO_COUPLE_COLOR:53 · BODA_DEFAULT_TIME:54 · BODA_PALETTE:57 · BODA_CLOSED_SK:205 · BODA_CLOSED:206 · BODA_PENDING:221 · BODA_SUBTAB:262 · BODA_CLASS_MODE:263 · BODA_FILTER_COUPLE:264 · BODA_HIDE_PAST:265 · BODA_HIDE_CLOSED:266 · BODA_PAREJAS_FILTER:267 · BODA_CAL_HL:268 · BODA_CAL_YEAR:269 · BODA_CAL_MONTH:270 · MN2:285 · DN2:747 · BODA_ASSIGN:839 · BODA_TIME_H:1087

**Funciones:** saveBodas:18 · bodaPlaceOf:33 · bodaPlaceLabel:38 · bodaNextColor:59 · bodaCouple:67 · bodaSlot:71 · bodaSlotColors:81 · bodaSlotColor:85 · bodaMarkFor:87 · evBodaSvg:93 · bodaClasses:110 · bodaClassesOfCouple:113 · bodaFreeClasses:116 · bodaSortClasses:119 · bodaClassesOnDay:126 · bodaNewClass:129 · bodaNormalizeClasses:144 · bodaPlaceForNewOn:179 · bodaDayFull:184 · bodaBulkCreate:189 · bodaProgress:199 · saveBodaClosed:210 · bodaIsClosed:211 · bodaToggleClosed:212 · bodaPendingCount:222 · bodaEff:224 · bodaSetPending:232 · bodaPendingApply:236 · bodaPendingDiscard:259 · _bodaLegendHtml:273 · _renderBodaCalendario:284 (!85) · _bodaFirstWord:369 · renderBodasBody:372 · _renderBodaParejas:399 · _bodaFmt:439 · _bodaFmtCorto:440 · _renderBodaClases:447 (!98) · bodaOpenSheet:545 · bodaCloseSheet:561 · bodaCreatedAt:571 · bodaIssues:576 · _renderBodaIssueCards:592 · card:595 · openBodaIssue:616 (!81) · findEv:658 · closeBodaIssue:697 · _bodaWeekKey:700 · _renderBodaStats:707 · openBodaCoupleDetail:786 · closeBodaCoupleDetail:832 · openBodaAssign:840 · closeBodaAssign:860 · renderBodaAssign:864 (!81) · bindBodaAssign:945 · openBodaPlacePicker:1014 · closeBodaPlacePicker:1040 · openBodaCouplePicker:1043 · row:1053 · apply:1070 · closeBodaCouplePicker:1084 · openBodaTimePicker:1090 · drum:1095 · setDrum:1118 · mark:1123 · drumVal:1127 · readManual:1148 · closeBodaTimePicker:1168 · renderBodaCoupleForm:1171 · openBodaCoupleForm:1195 · closeBodaCoupleForm:1238 · bodaRefreshRow:1246 · bindBodasEvents:1272 (!127) · _guardaPendientes:1274 · _bodaCalMove:1280 · findClass:1333

### js/core.js  _(533 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:48 · THEME_STORAGE_KEY:51 · THEME:52 · THEME_LABELS:58 · THEME_META:59 · THEME_SEQUENCE:60 · ECON_YEAR_CONFIG:80 · MN_SHORT:82 · DN5:298

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · applyTheme:61 · cycleTheme:68 · updateThemeBtn:73 · load:87 · save:99 · loadEconYear:103 · saveEconYear:122 · fakeTrans:132 · simpleBarChart:149 · hBarRows:173 · shareOrDownload:190 · escHtml:210 · mkey:215 · getMonthH:216 · defH:222 · dayH:223 · dayT:224 · dk:225 · fd:226 · ad:227 · fh:228 · fhP:229 · isToday:230 · isPast:231 · wn:232 · weeks:235 · hasAnySentWeekInMonth:249 · getWD:256 · showToast:269 · sendEmail:287 · buildMailtoBody:297 · render:319 (!107) · fmtH:405 · openSheet:426 · closeSheet:445 · selectType:451 · togSent:479 · renderNavBar:482 · bindNavBar:505 · doNav:512

### js/economics-analisis.js  _(911 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_ALT_RATE:7 · ANALISIS_SWITCH_COST:8 · ANALISIS_SORT:9 · ANALISIS_FILTER_TEXT:10 · ANALISIS_FILTER_CAT:11 · ANALISIS_CAT_MODE:12 · ANALISIS_DET_MODE:13 · ANALISIS_RES_MODE:14 · ANALISIS_CALC_HIP:15 · ANALISIS_DESGRAV_IDS:17 · ANALISIS_DESGRAV_DISCOUNT:18 · ANALISIS_SEG_NORMAL:20

**Funciones:** renderEconAnalisis:22 · _renderAnalisisGastos:37 (!250) · _triDonut:287 · _monthName:310 · _hipTipoEfectivo:315 · _analisisMortgageBox:321 · _renderAnalisisHipoteca:343 (!119) · _ahRow:462 · _donutChart:467 · _balanceEvolutionChart:483 · xPos:516 · yPos:517 · _renderSubrogacionAnalysis:551 (!152) · _analisisCard:703 · _analisisHBar:711 · _renderInsuranceOvercost:730 · _mortgageDiffChart:806 · xPos:826 · yPos:827 · bindEconAnalisisEvents:876 · _reRenderKeepScroll:883

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(704 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:334 · ESTUDIO_ELECT_CALC:335 · ESTUDIO_ELECT_IVA:336

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:238 · _renderEstudioGasComp:246 · _renderGasCompCard:306 · _calcElectCost:338 · _currentElectTariff:347 · _renderEstudioElectComp:352 · _renderElectCompCard:413 · _renderMultiScenarioResult:442 · _bindEstudioGas:510 · _bindEstudioElect:540 · _bindScenarios:570 · _readScenarios:589 · _bindCompFields:598 · _saveCompFields:631 · renderEstudioContent:646 · openEstudio:660 · closeEstudio:670 · reRenderEstudio:675 · bindEstudioEvents:683

### js/economics-fiscal-elect.js  _(261 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:157

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:75 · _vincRow:90 · _despFieldDate:113 · _despField:122 · _despFieldMoney:131 · _renderIngresosDesgList:144 · _renderGastoItem:163 · renderGastosList:178 · _bindElectDetalle:200 · _bindSegurosNormales:245

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:72

### js/economics-fiscal-hip.js  _(1033 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipPeriodCard:365 (!87) · _hipROvinc:452 · _calcInsOvercost:462 · _renderInlineOvercost:473 · _renderHipResumen:492 (!99) · _renderHipDetalle:591 · _renderHipSectionContent:617 · _renderCompraSection:629 · _renderPrestamoSection:658 · _renderSubSection:705 · renderFiscalTabDespacho:776 · _bindTabDespacho:793 · _bindHipResumen:817 · _bindHipDetalle:842 · _rerenderSection:913 · _readSectionInputs:922 · _rv:923 · _rv_s:924 · _bindEditingSection:982

### js/economics-fiscal.js  _(1360 líneas)_
**Estado global:** FISCAL_SK:5 · DEFAULT_BRACKETS:11 · FISCAL:18 · FISCAL_TAB:21 · FISCAL_IRPF_SUB:22 · FISCAL_YEAR:23 · FISCAL_HIP_SUB:25 · FISCAL_HIP_EDITING:26 · FISCAL_HIP_EDIT_SNAPSHOT:27 · FISCAL_HIP_DETAIL_TARGET:28 · PERSONAL_SK:34 · PERSONAL_DATA:35 · DEFAULT_PERSONAL_GASTOS_REC:37 · DEFAULT_PERSONAL_INVERSIONES:43 · INGRESOS_SK:87 · INGRESOS_ITEMS:88 · GASTOS_SK:122 · GASTOS_DIFICIL_PCT:123 · DEFAULT_GASTOS:124 · GASTOS_ITEMS:142 · COMPRAS_SK:205 · COMPRAS_IVA_ENABLED:206 · DEFAULT_COMPRAS:207 · COMPRAS_ITEMS:213 · DESGRAV_SK:260 · DESGRAV_DEFAULT:262 · DESGRAV_ITEMS:282 · OBSOLETE_IDS:285 · GROUP_CASA_DESP:677 · GROUP_UTIL_DESP:678

**Funciones:** _yearKey:31 · _ensureDefaults:50 · loadPersonalYear:66 · savePersonalYear:82 · loadIngresos:89 · saveIngresos:92 · findIngreso:95 · ingresoAnual:99 · renderIngresosList:104 · loadFiscal:144 · saveFiscal:152 · getIrpfPct:155 · getBrackets:156 · _loadGastosFromRaw:158 · loadGastosYear:176 · loadGastos:189 · saveGastosYear:190 · saveGastos:193 · findGasto:194 · gastoAnual:198 · loadCompras:214 · saveCompras:231 · comprasTotal:235 · comprasIvaTotal:245 · loadDesgrav:284 · saveDesgrav:315 · desgravAnual:318 · computeTotalDesgrav:339 · renderFiscalContent:351 · _renderYearSelector:377 · _renderCopyYearBtn:385 · _personalListHtml:408 · _personalTotal:451 · _personalTotalWeekly:461 · renderFiscalTabPersonal:470 · renderFiscalTabIrpf:511 · renderFiscalTabGastosDesg:558 · renderComprasList:589 · renderFiscalTabIrpfDeduc:638 · renderFiscalTabDesgrav:651 · renderDesgravDespachoInfo:673 · _dedCard:714 · renderDesgravList:749 · openFiscal:815 · closeFiscal:828 · reRenderFiscal:834 · bindFiscalEvents:844 · _switchTab:848 · _bindYearSelector:881 · _bindTabPersonal:918 · _bindTabIrpf:967 · _bindTabGastosDesg:1012 (!91) · _rebindComprasDel:1061 · _bindTabIrpfDeduc:1103 · _bindTabDesgrav:1116 (!96) · _bindList:1118 · _bindTabDespachoOnly:1212 (!83) · _syncLiveD:1223 · _updateFmt:1261 · _saveFiscalAll:1295 · _rv:1324

### js/economics-gastos.js  _(701 líneas)_
**Estado global:** GASTOS_TOGGLES_SK:5 · GASTOS_TOGGLES:6 · GROUP_SEMIOBL:96 · GROUP_CASA:97 · GROUP_OTROS_IMP:98 · GROUP_S:472 · GROUP_C:473 · GROUP_S2:571 · GROUP_C2:572

**Funciones:** loadGastosToggles:8 · saveGastosToggles:14 · isTglOn:17 · computeDisponible:22 · renderEconGastos:45 (!155) · _gastosGroup:100 · renderResultadoDeclaracion:200 (!113) · _renderDesgloseAhorroPartida:313 · renderIrpfBreakdown:384 · _renderIrpfTramos:431 · renderIncomeDistrib:457 · pctOf:460 · distRow:461 · grpLbl:497 · _sectorPath:529 · _donutSummaryHtml:537 · renderIncomeDonut:566 · _bindDonutClick:637 · gastosCascRow:658 · gastosResultRow:675 · bindEconGastosEvents:682

### js/economics-helpers.js  _(68 líneas)_
**Funciones:** _fmtMiles:8 · _hipMoney:14 · _hipNum:19 · _hipDate:24 · _hipText:28 · _hipVinc:32 · _hipVincSum:46 · _hipRO:62 · _hipROmoney:65

### js/economics-sim.js  _(203 líneas)_
**Estado global:** SIM_TARGET:5 · SIM_PERIOD:6 · SIM_NET_MODE:7 · SIM_RESULT:8 · SIM_RESULT_SAL:9

**Funciones:** _simComputeAll:12 · _inverseSalary:50 · renderEconSim:64 (!102) · bindEconSimEvents:166

### js/economics.js  _(707 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_RATE_PERIODS:10 · ECON_ESTUDIO_SUB:14 · ESTUDIO_YEAR:15

**Funciones:** computeSalaryNet:23 · fc:41 · fcPlain:46 · _rateForDate:56 · _buildDatePeriods:71 · computeEconEx:85 · computeEcon:143 · econBarChart:146 · _fmtDateEs:173 · _prevDate:178 · _ensureDatePeriods:185 · _renderRateInputs:202 · renderOptRow:219 · cascRow:226 · _econCard:236 · _econCards7:242 · f:244 · _getMultiRateOpts:259 · renderEconResumen:263 (!197) · renderEconContent:460 · openEcon:485 · closeEcon:501 · reRenderEcon:506 · bindEconEvents:518 · bindEconResumenEvents:556 (!151)

### js/events-picker-color.js  _(225 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_KINDS:42 · EV_TYPE_COLORS:47 · EV_FREE_COLOR:58 · EV_FREE_SHAPE:59 · EV_FREE_DATES:62 · EV_BAR_SIZES:65 · EV_FREE_BARSIZE:66 · EV_DOT_SOLID:70 · EV_SHAPE_BW:97

**Funciones:** evBarSize:71 · evBarSizeCls:77 · evTypeKey:78 · evTypeColor:79 · getEvKind:82 · evShapeSvg:98 · evMorePlusSvg:119 · evTravelColor:128 · getEvType:134 · isEvBarAlways:142 · getEvDisplayColor:144 · _renderColorPicker:154 · _bindColorPicker:177 · updatePreview:187

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!102) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events.js  _(2557 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:32 · EV_VIEW:33 · EV_EDIT:34 · EV_EDIT_DS:35 · EV_FORM_CONTAINER:36 · EV_EDIT_MODE:37 · EV_BRIGHT_PAST:38 · EV_ANNUAL_VIEW:39 · EV_ANNUAL_FILTER_HIDDEN:40 · EV_FILTER_GROUPS:48 · EV_FILTER_SHORT:51 · EV_FILTER_COLOR:53 · EV_FILTER_SEP_AFTER:56 · EV_PREV_VIEW:66 · EV_QUAD_YEAR:67 · EV_QUAD_MONTH:68 · EV_TO_SUBTAB:69 · EV_LIST_SUBTAB:70 · EV_TYPES_FILTER:71 · EV_TYPES_PAST:72 · EV_COLORS:73 · EVENTS:74 · EV_ALARM_SK:103 · EV_ALARMS_SET:104 · EV_MARK_ORDER:330 · EV_MAX_DAY_EVENTS:368 · EV_CAL_BADGE_STACK:369 · EV_CAL_CORNER_STACK:370 · DN7:410 · EV_BAR_Z:785 · EV_MNS:807

**Funciones:** _switchEvView:16 · evFilterGroup:57 · saveEvents:98 · loadEvAlarms:105 · saveEvAlarms:106 · _findBdayByEvId:107 · isEvAlarmSet:119 · setEvAlarmState:125 · evDk:132 · _evClampDate:141 · eventOccursOn:145 · getEventsOn:186 · evSignature:196 · evMergeIncoming:206 · evMergeMsg:230 · _fmtDayEs:242 · evDayLimitExceeded:243 · hasUpcomingEvent:272 · updateEventsBtn:281 · evUniqueColor:291 · evDefaultShape:302 · evMarkerHtml:308 · evMorePlusHtml:322 · evMarkPriority:331 · evBodaMinutes:338 · evSortMarks:349 · ev0:350 · evAnnualXsHtml:371 · vipStarSvgHtml:381 · evSoftFillColor:391 · renderEvCalMonth:399 (!127) · _cornerHtml:472 · renderEvList:526 · renderEvByMonths:537 · renderEvListItem:556 · fd2:560 · getNextOccurrence:589 · evIsoDate:631 · _isVipBdayTooFar:632 · renderEvUpcoming:636 (!150) · fd2:643 · renderEvItem:644 · _evRowOcc:786 · _evAssignRow:787 · evBarZ:797 · _evAnnualCtx:810 · visible:811 · _evLoadPuentes:829 · _renderEvMonthCard:839 (!135) · renderEvAnnual:974 · renderEvQuad:983 · renderEvByTypes:1004 · renderEvMonthsView:1040 · renderEvWeek:1050 (!119) · hexA:1054 · renderEvContent:1169 (!136) · renderEvDetail:1305 · fd2:1308 · openEvDetail:1367 (!94) · closeEvDetail:1461 · evPuntualDays:1468 · _renderEvTypeSwatches:1476 · renderEvForm:1493 (!145) · openEvForm:1638 · closeEvForm:1668 · bindEvFormEvents:1680 (!264) · _refreshShapePreviews:1696 · _refreshPickDatesLabel:1701 · _curKind:1720 · _applyTypeUI:1721 · _bindTypeSwatches:1734 · renderEvAlarmPanel:1944 · fd2:1946 · openEvAlarm:2001 · closeEvAlarm:2015 · openBdayAlarmFromEvents:2025 · bindEvAlarmEvents:2037 (!104) · _syncPre:2075 · fmtD:2105 · openEvents:2141 · closeEvents:2151 · openEventsAt:2158 · refreshEvents:2165 · bindEvEvents:2181 (!362) · _scrollWeekToMonth:2189 · _scrollWeekToToday:2236 · doScroll:2246 · apply:2505 · _positionEvBright:2543

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(532 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:441 (!91)

### js/init.js  _(553 líneas)_
**Estado global:** DRUM_ITEM_H:144 · DN_ES:325

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:145 · updateDrumSelected:173 · getDrumValue:179 · checkDrumMinuteWrap:185 · buildAlarmDayBtns:216 · showAlarmPastConfirm:246 · proceed:300 · fmt:361 · _showUpdateBar:520

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/summary.js  _(616 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · openSummary:518 · closeSummary:527 · bindSummaryEvents:533 (!83)

## CSS

### css/styles.css  _(2058 líneas)_

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
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1125
- Grid del mes: col fecha (48px) + col eventos (1fr):1127
- Columna fecha (col 1):1129
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1138
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1144
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1148
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1154
- Event color type picker:1158
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1164
- Color picker avanzado (paleta 6×8 + color libre):1168
- Detail color picker toggle:1186
- Annual events calendar:1192
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1222
- Selector de formas en el formulario de evento (Otros):1233
- Selector de grosor de barra (grande | Otros):1235
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1250
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1254
- Inicio/Fin bloqueados cuando hay Selección Multidía:1257
- Mini-overlay para elegir días específicos (Otros):1262
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1289
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1293
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1295
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1297
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1299
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1305
- Calendario 4 meses: 2 columnas × 2 filas:1307
- Botón ir al calendario mensual en puentes del resumen:1309
- Pencil edit button in annual/quad controls:1321
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1322
- Feat 6: Puentes rallados en anual:1326
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1327
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1345
- Dropdown de vista anual:1352
- Linea que separa los chips de eventos grandes de los puntuales:1361
- Barras multi-día en vista mensual (fila propia encima de las celdas):1366
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1367
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1371
- Summary tabs — nivel 2:1374
- BRIDGE DAY CELLS in summary:1379
- VIP BIRTHDAYS:1388
- BIRTHDAY + EVENT ALARM PANEL:1391
- Campana de alarma en items de próximos (bday + eventos):1394
- 3-ZONE ALARM MARKER:1414
- ALARM MANAGEMENT OVERLAY:1427
- HOME POPUP (semanas pendientes / VIP sin alarma):1444
- MACRO URL EN MENÚ:1455
- Feat 4: Nav-bar emoji alignment:1461
- Birthday detail / form overlays:1477
- EVENTS:1487
- Zone A: upcoming/list views — subtle blue tint:1493
- Zone B: calendar grid views — subtle teal tint, active = green:1495
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1504
- Feat 2: Lista de Eventos subtabs:1509
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1526
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1528
- Contenedor de badges 1-día: centrado verticalmente en la celda:1551
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1558
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1562
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1572
- Perímetro puente: capa inferior a eventos:1574
- Bright past: bombilla override:1587
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1591
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1592
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1597
- Quad label 3 lines:1602
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1609
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1611
- Events list view:1613
- Event form overlay (inside eventsOverlay):1627
- Event detail:1661
- LOGO POPUP:1669
- Gallery:1678
- BD ALARM VIP TOGGLE:1687
- RESPONSIVE (mobile header):1690
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1692
- ALARM PANEL:1745
- Drum picker (selector giratorio de hora/minuto):1750
- Confirmación alarma en el pasado:1770
- Botón flotante "Listo" en modo Editar VIPs:1782
- Controles inline long-press cumpleaños:1785
- Selector de clase en el formulario:1797
- Notas: general vs de un dia concreto:1803
- Pestana Bodas y pestana partida Vacaciones/Festivos:1807
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1812
- Pestana Bodas:1818
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1826
- Filas del panel de un aviso:1840
- Estadisticas:1844
- Barras horizontales de reparto (componente generico: hBarRows):1852
- Dia cerrado: no admite mas clases:1878
- Fila con cambios sin guardar:1883
- Barra de guardado, siempre visible al fondo de la lista:1886
- Filtros de Parejas como chips pulsables:1896
- Sala sin asignar: se marca en naranja para que cante en la lista:1931
- Nota propia del dia en la lista de Proximos:1934
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:1936
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):1938
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:1946
- Los tres botones del detalle de pareja comparten aspecto:1960
- Subpestana Calendario de bodas:1996
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2010
- Dia resaltado al pulsar una pareja en la leyenda:2017
- Diálogo: modo de importación (añadir vs reemplazar):2026
- PRINT:2039

**Rangos por prefijo de clase:** 
.action-btn:156-160 · .ah-cuota:436-438 · .ah-donut:446-448 · .ah-section:433-435 · .ah-total:443-445 · .ah-vs:439-442 · .alarm-cfg:1746-1746 · .alarm-colon:1749-1749 · .alarm-create:1761-1762 · .alarm-day:1767-1769 · .alarm-days:1764-1766 · .alarm-delete:1440-1441 · .alarm-ics:1763-1763 · .alarm-item:1434-1439 · .alarm-macro:1776-1781 · .alarm-msg:1759-1760 · .alarm-panel:1747-1747 · .alarm-past:1771-1775 · .alarm-time:1748-1748 · .alarms-empty:1442-1443 · .alarms-mgmt:1428-1428 · .alarms-section:1429-1430 · .alarms-sub:1431-1433 · .analisis-card:585-587 · .analisis-cards:574-574 · .analisis-hbar:588-593 · .analisis-input:603-606 · .analisis-ins:612-617 · .analisis-insurance:611-611 · .analisis-mortgage:594-610 · .app-logo:58-58 · .app-version:120-120 · .bd-alarm:1392-1689 · .bd-detail:1478-1485 · .bday-add:1069-1070 · .bday-badge:1016-1018 · .bday-cancel:1033-1034 · .bday-cell:1010-1073 · .bday-hdr:1003-1372 · .bday-ic:1787-1791 · .bday-inline:1786-1786 · .bday-io:1049-1053 · .bday-list:1020-1044 · .bday-listo:1783-1783 · .bday-month:1019-1019 · .bday-num:1015-1015 · .bday-search:1046-1048 · .bday-upcoming:1055-1390 · .bday-view:1004-1006 · .bday-vip:1022-1389 · .bday-week:1007-1009 · .boda-actions:1952-1952 · .boda-add:1954-1954 · .boda-asg:1973-1995 · .boda-cal:1997-2020 · .boda-card:1902-1912 · .boda-chip:1898-1900 · .boda-chips:1897-1897 · .boda-class:1884-1926 · .boda-controls:1868-1868 · .boda-couple:1924-1924 · .boda-cpk:1967-1972 · .boda-date:1953-1953 · .boda-day:1879-1918 · .boda-det:1959-1966 · .boda-dot:1906-1906 · .boda-falta:1913-1913 · .boda-filters:1871-1871 · .boda-fsel:1872-1875 · .boda-ftoggles:1876-1877 · .boda-inp:1922-1922 · .boda-iss:1841-1843 · .boda-issue:1828-1839 · .boda-issues:1827-1827 · .boda-legend:1955-1958 · .boda-mini:1950-1951 · .boda-mode:1859-1861 · .boda-name:1907-1907 · .boda-ok:1914-1914 · .boda-place:1925-1933 · .boda-prog:1909-1910 · .boda-ro:1927-1932 · .boda-save:1894-1895 · .boda-savebar:1890-1893 · .boda-sec:1825-1825 · .boda-sobra:1915-1915 · .boda-stat:1846-1851 · .boda-stats:1845-1845 · .boda-sticky:1821-1823 · .boda-sum:1864-1867 · .boda-summary:1863-1863 · .boda-time:1923-1923 · .boda-tp:2021-2024 · .boda-wed:1908-1908 · .bottom-sheet:166-167 · .btn-icon:99-1735 · .build-badge:207-207 · .build-dot:208-208 · .csv-export:71-72 · .data-actions:95-1737 · .data-btn:96-1733 · .data-menu:114-119 · .day-cell:134-236 · .day-date:139-139 · .day-hours:140-140 · .day-name:138-138 · .day-status:147-147 · .days-grid:133-133 · .default-hours:69-77 · .dp-actions:1285-1286 · .dp-counter:1272-1273 · .dp-day:1280-1284 · .dp-days:1279-1279 · .dp-grid:1274-1274 · .dp-handle:1267-1267 · .dp-hdr:1268-1268 · .dp-mhdr:1277-1278 · .dp-mname:1276-1276 · .dp-month:1275-1275 · .dp-overlay:1263-1266 · .dp-sheet:1265-1265 · .dp-title:1269-1269 · .dp-yearnav:1270-1271 · .drum-picker:1752-1755 · .drum-sel:1758-1758 · .drum-wrap:1751-1757 · .econ-add:520-521 · .econ-ahorro:741-748 · .econ-annual:350-350 · .econ-avg:351-668 · .econ-bracket:503-509 · .econ-calc:651-652 · .econ-casc:655-662 · .econ-cascade:654-654 · .econ-chart:533-534 · .econ-comp:511-535 · .econ-decl:498-672 · .econ-distrib:978-992 · .econ-donut:759-774 · .econ-equiv:973-976 · .econ-fiscal:752-757 · .econ-formula:370-373 · .econ-gastos:674-686 · .econ-gear:470-471 · .econ-hdr:392-472 · .econ-ingresado:358-358 · .econ-irpf:688-750 · .econ-legend:536-537 · .econ-line:531-532 · .econ-month:375-388 · .econ-mr:970-971 · .econ-multi:962-972 · .econ-opt:647-650 · .econ-qcard:340-347 · .econ-qcell:336-1696 · .econ-qm:345-345 · .econ-qmonth:343-344 · .econ-quarter:332-1693 · .econ-rate:474-482 · .econ-row:359-369 · .econ-sc:513-999 · .econ-scenario:512-512 · .econ-section:389-389 · .econ-sim:539-549 · .econ-stats:486-491 · .econ-sub:395-401 · .econ-tab:393-394 · .econ-toggle:493-496 · .econ-val:374-374 · .est-btn:406-410 · .est-card:416-418 · .est-detail:413-413 · .est-field:425-431 · .est-fields:424-424 · .est-group:404-408 · .est-modo:419-419 · .est-nav:403-403 · .est-section:412-412 · .est-tariff:414-423 · .ev-alarm:1403-1945 · .ev-ann:1323-1360 · .ev-annual:1193-1586 · .ev-badge:1612-1612 · .ev-badges:1554-1554 · .ev-bars:1529-1529 · .ev-barsize:1236-1245 · .ev-bright:1588-1599 · .ev-btn:1505-1814 · .ev-cell:1074-1608 · .ev-char:1639-1639 · .ev-checkbox:1644-1644 · .ev-color:1166-1185 · .ev-colors:1640-1640 · .ev-date:1641-1641 · .ev-dates:1258-1260 · .ev-day:1557-1564 · .ev-daynote:1805-1805 · .ev-detail:1187-1806 · .ev-dot:152-152 · .ev-dots:151-151 · .ev-edit:1313-1654 · .ev-field:1633-1634 · .ev-filter:1362-1365 · .ev-form:1628-1649 · .ev-hdr:1373-1489 · .ev-input:1635-1636 · .ev-io:1320-1660 · .ev-kind:1798-1802 · .ev-list:1510-1626 · .ev-month:1518-1518 · .ev-multi:1543-1583 · .ev-note:1804-1804 · .ev-num:1610-1610 · .ev-otros:1234-1568 · .ev-puente:1575-1575 · .ev-quad:1308-1604 · .ev-repeat:1645-1645 · .ev-sep:1116-1116 · .ev-shape:1246-1253 · .ev-textarea:1637-1638 · .ev-toggle:1642-1643 · .ev-type:1159-1167 · .ev-types:1513-1515 · .ev-upcoming:1100-1937 · .ev-view:1490-1492 · .ev-wd:1647-1648 · .ev-week:1524-1573 · .ev-weekday:1646-1646 · .ev-wk:1123-1949 · .ev-zone:1494-1501 · .excl-item:318-484 · .excl-row:317-483 · .fiscal-add:640-803 · .fiscal-bracket:631-639 · .fiscal-compras:832-867 · .fiscal-copy:467-469 · .fiscal-custom:628-628 · .fiscal-ded:842-856 · .fiscal-desgrav:805-857 · .fiscal-despacho:869-890 · .fiscal-error:644-644 · .fiscal-gasto:776-838 · .fiscal-gastos:858-858 · .fiscal-hdr:788-788 · .fiscal-highlight:829-829 · .fiscal-onoff:871-872 · .fiscal-pct:629-638 · .fiscal-period:784-785 · .fiscal-radio:623-627 · .fiscal-save:642-643 · .fiscal-section:621-796 · .fiscal-sticky:793-793 · .fiscal-subsection:797-798 · .fiscal-tab:789-791 · .fiscal-viaje:799-800 · .fiscal-vinc:882-883 · .fiscal-year:463-466 · .full-overlay:239-240 · .hbar-lbl:1855-1855 · .hbar-row:1854-1854 · .hbar-rows:1853-1853 · .hbar-track:1856-1857 · .hbar-val:1858-1858 · .header:54-1738 · .header-brand:57-57 · .hip-add:960-960 · .hip-auto:911-911 · .hip-bar:897-904 · .hip-cancel:947-947 · .hip-cf:916-921 · .hip-edit:943-945 · .hip-g2:915-915 · .hip-grid:909-909 · .hip-period:949-958 · .hip-resumen:892-896 · .hip-ro:934-941 · .hip-save:946-946 · .hip-section:910-959 · .hip-stat:906-908 · .hip-stats:905-905 · .hip-sub:913-913 · .hip-vinc:912-912 · .hip-vr:923-932 · .home-popup:1445-1454 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:2027-2037 · .logo-gallery:1679-1686 · .logo-popup:1670-1677 · .macro-section:1456-1457 · .macro-url:1458-1460 · .mg-budget:450-459 · .mg-cat:460-460 · .mg-desgrav:461-461 · .mg-sort:456-456 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:321-321 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:322-322 · .nav-bar:1369-1742 · .nav-btn:62-63 · .option-desc:182-182 · .option-dot:175-179 · .option-hours:183-183 · .option-info:180-180 · .option-label:181-181 · .overlay:164-165 · .overlay-nav:1368-1370 · .pdf-export:73-74 · .rate-input:329-2056 · .rate-label:328-328 · .rate-row:327-327 · .rate-suffix:330-330 · .sent-badge:130-130 · .sheet-handle:168-168 · .sheet-option:172-174 · .sheet-options:171-171 · .sheet-subtitle:170-170 · .sheet-title:169-169 · .sim-combo:551-555 · .sim-field:540-541 · .sim-hr:550-550 · .sim-period:547-547 · .sim-target:542-546 · .sub-block:576-577 · .sub-row:578-584 · .sw-upd:193-193 · .sy-back:245-2047 · .sy-body:264-2045 · .sy-card:275-2051 · .sy-cards3:267-267 · .sy-cards4:268-268 · .sy-chart:293-293 · .sy-hdr:250-250 · .sy-header:244-2046 · .sy-lbl:284-2050 · .sy-list:297-324 · .sy-month:311-311 · .sy-nav:254-1601 · .sy-note:294-296 · .sy-pdf:256-257 · .sy-puente:303-1387 · .sy-section:265-266 · .sy-spain:269-274 · .sy-sublbl:349-349 · .sy-suelto:308-310 · .sy-tab:1375-1378 · .sy-table:285-2052 · .sy-td:290-290 · .sy-tr:291-2053 · .sy-val:280-2049 · .sy-year:247-2048 · .toast:186-191 · .toast-undo:195-195 · .today-btn:64-65 · .vac-config:313-315 · .vip-no:1028-1029 · .week-actions:155-155 · .week-card:124-218 · .week-header:127-127 · .week-info:128-129 · .week-total:131-131 · .weeks-container:123-123

