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

### js/bodas.js  _(1340 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_SHORT:28 · BODA_PLACES:29 · BODA_WHITE:40 · BODA_SLOTS:41 · BODA_NO_TIME_COLOR:47 · BODA_NO_COUPLE_COLOR:48 · BODA_DEFAULT_TIME:49 · BODA_PALETTE:52 · BODA_CLOSED_SK:200 · BODA_CLOSED:201 · BODA_PENDING:216 · BODA_SUBTAB:257 · BODA_CLASS_MODE:258 · BODA_FILTER_COUPLE:259 · BODA_HIDE_PAST:260 · BODA_HIDE_CLOSED:261 · BODA_PAREJAS_FILTER:262 · BODA_CAL_HL:263 · BODA_CAL_YEAR:264 · BODA_CAL_MONTH:265 · MN2:280 · DN2:720 · BODA_ASSIGN:812 · BODA_TIME_H:1031

**Funciones:** saveBodas:18 · bodaPlaceOf:30 · bodaNextColor:54 · bodaCouple:62 · bodaSlot:66 · bodaSlotColors:76 · bodaSlotColor:80 · bodaMarkFor:82 · evBodaSvg:88 · bodaClasses:105 · bodaClassesOfCouple:108 · bodaFreeClasses:111 · bodaSortClasses:114 · bodaClassesOnDay:121 · bodaNewClass:124 · bodaNormalizeClasses:139 · bodaPlaceForNewOn:174 · bodaDayFull:179 · bodaBulkCreate:184 · bodaProgress:194 · saveBodaClosed:205 · bodaIsClosed:206 · bodaToggleClosed:207 · bodaPendingCount:217 · bodaEff:219 · bodaSetPending:227 · bodaPendingApply:231 · bodaPendingDiscard:254 · _bodaLegendHtml:268 · _renderBodaCalendario:279 (!85) · _bodaFirstWord:364 · renderBodasBody:367 · _renderBodaParejas:394 · _bodaFmt:434 · _bodaFmtCorto:435 · _renderBodaClases:442 (!97) · bodaOpenSheet:539 · bodaCloseSheet:555 · bodaCreatedAt:565 · bodaIssues:570 · _renderBodaIssueCards:584 · card:587 · openBodaIssue:600 · findEv:637 · closeBodaIssue:670 · _bodaWeekKey:673 · _renderBodaStats:680 · openBodaCoupleDetail:759 · closeBodaCoupleDetail:805 · openBodaAssign:813 · closeBodaAssign:833 · renderBodaAssign:837 (!81) · bindBodaAssign:918 · openBodaCouplePicker:987 · row:997 · apply:1014 · closeBodaCouplePicker:1028 · openBodaTimePicker:1034 · drum:1039 · setDrum:1062 · mark:1067 · drumVal:1071 · readManual:1092 · closeBodaTimePicker:1112 · renderBodaCoupleForm:1115 · openBodaCoupleForm:1139 · closeBodaCoupleForm:1182 · bodaRefreshRow:1190 · bindBodasEvents:1213 (!127) · _guardaPendientes:1215 · _bodaCalMove:1221 · findClass:1274

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

### js/events-picker-color.js  _(221 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_KINDS:42 · EV_TYPE_COLORS:47 · EV_FREE_COLOR:58 · EV_FREE_SHAPE:59 · EV_FREE_DATES:62 · EV_BAR_SIZES:65 · EV_FREE_BARSIZE:66 · EV_SHAPE_BW:93

**Funciones:** evBarSize:67 · evBarSizeCls:73 · evTypeKey:74 · evTypeColor:75 · getEvKind:78 · evShapeSvg:94 · evMorePlusSvg:115 · evTravelColor:124 · getEvType:130 · isEvBarAlways:138 · getEvDisplayColor:140 · _renderColorPicker:150 · _bindColorPicker:173 · updatePreview:183

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!102) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events.js  _(2413 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:32 · EV_VIEW:33 · EV_EDIT:34 · EV_EDIT_DS:35 · EV_FORM_CONTAINER:36 · EV_EDIT_MODE:37 · EV_BRIGHT_PAST:38 · EV_ANNUAL_VIEW:39 · EV_ANNUAL_FILTER_HIDDEN:40 · EV_FILTER_GROUPS:48 · EV_FILTER_SHORT:51 · EV_FILTER_COLOR:53 · EV_FILTER_SEP_AFTER:56 · EV_PREV_VIEW:66 · EV_QUAD_YEAR:67 · EV_QUAD_MONTH:68 · EV_TO_SUBTAB:69 · EV_LIST_SUBTAB:70 · EV_TYPES_FILTER:71 · EV_TYPES_PAST:72 · EV_COLORS:73 · EVENTS:74 · EV_ALARM_SK:103 · EV_ALARMS_SET:104 · EV_MAX_DAY_EVENTS:328 · EV_CAL_BADGE_STACK:329 · EV_CAL_CORNER_STACK:330 · DN7:370 · EV_BAR_Z:726 · EV_MNS:748

**Funciones:** _switchEvView:16 · evFilterGroup:57 · saveEvents:98 · loadEvAlarms:105 · saveEvAlarms:106 · _findBdayByEvId:107 · isEvAlarmSet:119 · setEvAlarmState:125 · evDk:132 · _evClampDate:141 · eventOccursOn:145 · getEventsOn:186 · evSignature:196 · evMergeIncoming:206 · evMergeMsg:230 · _fmtDayEs:242 · evDayLimitExceeded:243 · hasUpcomingEvent:272 · updateEventsBtn:281 · evUniqueColor:291 · evDefaultShape:302 · evMarkerHtml:308 · evMorePlusHtml:322 · evAnnualXsHtml:331 · vipStarSvgHtml:341 · evSoftFillColor:351 · renderEvCalMonth:359 (!126) · _cornerHtml:431 · renderEvList:485 · renderEvByMonths:496 · renderEvListItem:515 · fd2:519 · getNextOccurrence:548 · evIsoDate:590 · _isVipBdayTooFar:591 · renderEvUpcoming:595 (!132) · fd2:602 · renderEvItem:603 · _evRowOcc:727 · _evAssignRow:728 · evBarZ:738 · _evAnnualCtx:751 · visible:752 · _evLoadPuentes:770 · _renderEvMonthCard:780 (!135) · renderEvAnnual:915 · renderEvQuad:924 · renderEvByTypes:945 · renderEvMonthsView:981 · renderEvWeek:991 (!104) · hexA:995 · renderEvContent:1095 (!136) · renderEvDetail:1231 · fd2:1234 · openEvDetail:1293 (!93) · closeEvDetail:1386 · evPuntualDays:1393 · _renderEvTypeSwatches:1401 · renderEvForm:1416 (!145) · openEvForm:1561 · closeEvForm:1591 · bindEvFormEvents:1603 (!264) · _refreshShapePreviews:1619 · _refreshPickDatesLabel:1624 · _curKind:1643 · _applyTypeUI:1644 · _bindTypeSwatches:1657 · renderEvAlarmPanel:1867 · fd2:1869 · openEvAlarm:1902 · closeEvAlarm:1913 · openBdayAlarmFromEvents:1923 · bindEvAlarmEvents:1934 · fmtD:1980 · openEvents:1997 · closeEvents:2007 · openEventsAt:2014 · refreshEvents:2021 · bindEvEvents:2037 (!362) · _scrollWeekToMonth:2045 · _scrollWeekToToday:2092 · doScroll:2102 · apply:2361 · _positionEvBright:2399

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

### css/styles.css  _(2028 líneas)_

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
- Selector de grosor de barra (grande | Otros):1230
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1245
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1249
- Inicio/Fin bloqueados cuando hay Selección Multidía:1252
- Mini-overlay para elegir días específicos (Otros):1257
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1284
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1288
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1290
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1292
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1294
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1300
- Calendario 4 meses: 2 columnas × 2 filas:1302
- Botón ir al calendario mensual en puentes del resumen:1304
- Pencil edit button in annual/quad controls:1316
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1317
- Feat 6: Puentes rallados en anual:1321
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1322
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1340
- Dropdown de vista anual:1347
- Linea que separa los chips de eventos grandes de los puntuales:1356
- Barras multi-día en vista mensual (fila propia encima de las celdas):1361
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1362
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1366
- Summary tabs — nivel 2:1369
- BRIDGE DAY CELLS in summary:1374
- VIP BIRTHDAYS:1383
- BIRTHDAY + EVENT ALARM PANEL:1386
- Campana de alarma en items de próximos (bday + eventos):1389
- 3-ZONE ALARM MARKER:1409
- ALARM MANAGEMENT OVERLAY:1422
- HOME POPUP (semanas pendientes / VIP sin alarma):1439
- MACRO URL EN MENÚ:1450
- Feat 4: Nav-bar emoji alignment:1456
- Birthday detail / form overlays:1472
- EVENTS:1482
- Zone A: upcoming/list views — subtle blue tint:1488
- Zone B: calendar grid views — subtle teal tint, active = green:1490
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1493
- Feat 2: Lista de Eventos subtabs:1498
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1515
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1517
- Contenedor de badges 1-día: centrado verticalmente en la celda:1540
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1547
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1551
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1561
- Perímetro puente: capa inferior a eventos:1563
- Bright past: bombilla override:1576
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1580
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1581
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1586
- Quad label 3 lines:1591
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1598
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1600
- Events list view:1602
- Event form overlay (inside eventsOverlay):1616
- Event detail:1650
- LOGO POPUP:1658
- Gallery:1667
- BD ALARM VIP TOGGLE:1676
- RESPONSIVE (mobile header):1679
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1681
- ALARM PANEL:1734
- Drum picker (selector giratorio de hora/minuto):1739
- Confirmación alarma en el pasado:1759
- Botón flotante "Listo" en modo Editar VIPs:1771
- Controles inline long-press cumpleaños:1774
- Selector de clase en el formulario:1786
- Notas: general vs de un dia concreto:1792
- Pestana Bodas y pestana partida Vacaciones/Festivos:1796
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1801
- Pestana Bodas:1807
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1815
- Filas del panel de un aviso:1829
- Estadisticas:1833
- Barras horizontales de reparto (componente generico: hBarRows):1841
- Dia cerrado: no admite mas clases:1867
- Fila con cambios sin guardar:1872
- Barra de guardado, siempre visible al fondo de la lista:1875
- Filtros de Parejas como chips pulsables:1885
- Los tres botones del detalle de pareja comparten aspecto:1930
- Subpestana Calendario de bodas:1966
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:1980
- Dia resaltado al pulsar una pareja en la leyenda:1987
- Diálogo: modo de importación (añadir vs reemplazar):1996
- PRINT:2009

**Rangos por prefijo de clase:** 
.action-btn:156-160 · .ah-cuota:436-438 · .ah-donut:446-448 · .ah-section:433-435 · .ah-total:443-445 · .ah-vs:439-442 · .alarm-cfg:1735-1735 · .alarm-colon:1738-1738 · .alarm-create:1750-1751 · .alarm-day:1756-1758 · .alarm-days:1753-1755 · .alarm-delete:1435-1436 · .alarm-ics:1752-1752 · .alarm-item:1429-1434 · .alarm-macro:1765-1770 · .alarm-msg:1748-1749 · .alarm-panel:1736-1736 · .alarm-past:1760-1764 · .alarm-time:1737-1737 · .alarms-empty:1437-1438 · .alarms-mgmt:1423-1423 · .alarms-section:1424-1425 · .alarms-sub:1426-1428 · .analisis-card:585-587 · .analisis-cards:574-574 · .analisis-hbar:588-593 · .analisis-input:603-606 · .analisis-ins:612-617 · .analisis-insurance:611-611 · .analisis-mortgage:594-610 · .app-logo:58-58 · .app-version:120-120 · .bd-alarm:1387-1678 · .bd-detail:1473-1480 · .bday-add:1069-1070 · .bday-badge:1016-1018 · .bday-cancel:1033-1034 · .bday-cell:1010-1073 · .bday-hdr:1003-1367 · .bday-ic:1776-1780 · .bday-inline:1775-1775 · .bday-io:1049-1053 · .bday-list:1020-1044 · .bday-listo:1772-1772 · .bday-month:1019-1019 · .bday-num:1015-1015 · .bday-search:1046-1048 · .bday-upcoming:1055-1385 · .bday-view:1004-1006 · .bday-vip:1022-1384 · .bday-week:1007-1009 · .boda-actions:1922-1922 · .boda-add:1924-1924 · .boda-asg:1943-1965 · .boda-cal:1967-1990 · .boda-card:1891-1901 · .boda-chip:1887-1889 · .boda-chips:1886-1886 · .boda-class:1873-1915 · .boda-controls:1857-1857 · .boda-couple:1913-1913 · .boda-cpk:1937-1942 · .boda-date:1923-1923 · .boda-day:1868-1907 · .boda-det:1929-1936 · .boda-dot:1895-1895 · .boda-falta:1902-1902 · .boda-filters:1860-1860 · .boda-fsel:1861-1864 · .boda-ftoggles:1865-1866 · .boda-inp:1911-1911 · .boda-iss:1830-1832 · .boda-issue:1817-1828 · .boda-issues:1816-1816 · .boda-legend:1925-1928 · .boda-mini:1920-1921 · .boda-mode:1848-1850 · .boda-name:1896-1896 · .boda-ok:1903-1903 · .boda-place:1914-1914 · .boda-prog:1898-1899 · .boda-ro:1916-1919 · .boda-save:1883-1884 · .boda-savebar:1879-1882 · .boda-sec:1814-1814 · .boda-sobra:1904-1904 · .boda-stat:1835-1840 · .boda-stats:1834-1834 · .boda-sticky:1810-1812 · .boda-sum:1853-1856 · .boda-summary:1852-1852 · .boda-time:1912-1912 · .boda-tp:1991-1994 · .boda-wed:1897-1897 · .bottom-sheet:166-167 · .btn-icon:99-1724 · .build-badge:207-207 · .build-dot:208-208 · .csv-export:71-72 · .data-actions:95-1726 · .data-btn:96-1722 · .data-menu:114-119 · .day-cell:134-236 · .day-date:139-139 · .day-hours:140-140 · .day-name:138-138 · .day-status:147-147 · .days-grid:133-133 · .default-hours:69-77 · .dp-actions:1280-1281 · .dp-counter:1267-1268 · .dp-day:1275-1279 · .dp-days:1274-1274 · .dp-grid:1269-1269 · .dp-handle:1262-1262 · .dp-hdr:1263-1263 · .dp-mhdr:1272-1273 · .dp-mname:1271-1271 · .dp-month:1270-1270 · .dp-overlay:1258-1261 · .dp-sheet:1260-1260 · .dp-title:1264-1264 · .dp-yearnav:1265-1266 · .drum-picker:1741-1744 · .drum-sel:1747-1747 · .drum-wrap:1740-1746 · .econ-add:520-521 · .econ-ahorro:741-748 · .econ-annual:350-350 · .econ-avg:351-668 · .econ-bracket:503-509 · .econ-calc:651-652 · .econ-casc:655-662 · .econ-cascade:654-654 · .econ-chart:533-534 · .econ-comp:511-535 · .econ-decl:498-672 · .econ-distrib:978-992 · .econ-donut:759-774 · .econ-equiv:973-976 · .econ-fiscal:752-757 · .econ-formula:370-373 · .econ-gastos:674-686 · .econ-gear:470-471 · .econ-hdr:392-472 · .econ-ingresado:358-358 · .econ-irpf:688-750 · .econ-legend:536-537 · .econ-line:531-532 · .econ-month:375-388 · .econ-mr:970-971 · .econ-multi:962-972 · .econ-opt:647-650 · .econ-qcard:340-347 · .econ-qcell:336-1685 · .econ-qm:345-345 · .econ-qmonth:343-344 · .econ-quarter:332-1682 · .econ-rate:474-482 · .econ-row:359-369 · .econ-sc:513-999 · .econ-scenario:512-512 · .econ-section:389-389 · .econ-sim:539-549 · .econ-stats:486-491 · .econ-sub:395-401 · .econ-tab:393-394 · .econ-toggle:493-496 · .econ-val:374-374 · .est-btn:406-410 · .est-card:416-418 · .est-detail:413-413 · .est-field:425-431 · .est-fields:424-424 · .est-group:404-408 · .est-modo:419-419 · .est-nav:403-403 · .est-section:412-412 · .est-tariff:414-423 · .ev-alarm:1398-1398 · .ev-ann:1318-1355 · .ev-annual:1188-1575 · .ev-badge:1601-1601 · .ev-badges:1543-1543 · .ev-bars:1518-1518 · .ev-barsize:1231-1240 · .ev-bright:1577-1588 · .ev-btn:1494-1803 · .ev-cell:1074-1597 · .ev-char:1628-1628 · .ev-checkbox:1633-1633 · .ev-color:1161-1180 · .ev-colors:1629-1629 · .ev-date:1630-1630 · .ev-dates:1253-1255 · .ev-day:1546-1553 · .ev-daynote:1794-1794 · .ev-detail:1182-1795 · .ev-dot:152-152 · .ev-dots:151-151 · .ev-edit:1308-1643 · .ev-field:1622-1623 · .ev-filter:1357-1360 · .ev-form:1617-1638 · .ev-hdr:1368-1484 · .ev-input:1624-1625 · .ev-io:1315-1649 · .ev-kind:1787-1791 · .ev-list:1499-1615 · .ev-month:1507-1507 · .ev-multi:1532-1572 · .ev-note:1793-1793 · .ev-num:1599-1599 · .ev-otros:1229-1557 · .ev-puente:1564-1564 · .ev-quad:1303-1593 · .ev-repeat:1634-1634 · .ev-sep:1116-1116 · .ev-shape:1241-1248 · .ev-textarea:1626-1627 · .ev-toggle:1631-1632 · .ev-type:1154-1162 · .ev-types:1502-1504 · .ev-upcoming:1100-1392 · .ev-view:1485-1487 · .ev-wd:1636-1637 · .ev-week:1513-1562 · .ev-weekday:1635-1635 · .ev-wk:1119-1152 · .ev-zone:1489-1492 · .excl-item:318-484 · .excl-row:317-483 · .fiscal-add:640-803 · .fiscal-bracket:631-639 · .fiscal-compras:832-867 · .fiscal-copy:467-469 · .fiscal-custom:628-628 · .fiscal-ded:842-856 · .fiscal-desgrav:805-857 · .fiscal-despacho:869-890 · .fiscal-error:644-644 · .fiscal-gasto:776-838 · .fiscal-gastos:858-858 · .fiscal-hdr:788-788 · .fiscal-highlight:829-829 · .fiscal-onoff:871-872 · .fiscal-pct:629-638 · .fiscal-period:784-785 · .fiscal-radio:623-627 · .fiscal-save:642-643 · .fiscal-section:621-796 · .fiscal-sticky:793-793 · .fiscal-subsection:797-798 · .fiscal-tab:789-791 · .fiscal-viaje:799-800 · .fiscal-vinc:882-883 · .fiscal-year:463-466 · .full-overlay:239-240 · .hbar-lbl:1844-1844 · .hbar-row:1843-1843 · .hbar-rows:1842-1842 · .hbar-track:1845-1846 · .hbar-val:1847-1847 · .header:54-1727 · .header-brand:57-57 · .hip-add:960-960 · .hip-auto:911-911 · .hip-bar:897-904 · .hip-cancel:947-947 · .hip-cf:916-921 · .hip-edit:943-945 · .hip-g2:915-915 · .hip-grid:909-909 · .hip-period:949-958 · .hip-resumen:892-896 · .hip-ro:934-941 · .hip-save:946-946 · .hip-section:910-959 · .hip-stat:906-908 · .hip-stats:905-905 · .hip-sub:913-913 · .hip-vinc:912-912 · .hip-vr:923-932 · .home-popup:1440-1449 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:1997-2007 · .logo-gallery:1668-1675 · .logo-popup:1659-1666 · .macro-section:1451-1452 · .macro-url:1453-1455 · .mg-budget:450-459 · .mg-cat:460-460 · .mg-desgrav:461-461 · .mg-sort:456-456 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:321-321 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:322-322 · .nav-bar:1364-1731 · .nav-btn:62-63 · .option-desc:182-182 · .option-dot:175-179 · .option-hours:183-183 · .option-info:180-180 · .option-label:181-181 · .overlay:164-165 · .overlay-nav:1363-1365 · .pdf-export:73-74 · .rate-input:329-2026 · .rate-label:328-328 · .rate-row:327-327 · .rate-suffix:330-330 · .sent-badge:130-130 · .sheet-handle:168-168 · .sheet-option:172-174 · .sheet-options:171-171 · .sheet-subtitle:170-170 · .sheet-title:169-169 · .sim-combo:551-555 · .sim-field:540-541 · .sim-hr:550-550 · .sim-period:547-547 · .sim-target:542-546 · .sub-block:576-577 · .sub-row:578-584 · .sw-upd:193-193 · .sy-back:245-2017 · .sy-body:264-2015 · .sy-card:275-2021 · .sy-cards3:267-267 · .sy-cards4:268-268 · .sy-chart:293-293 · .sy-hdr:250-250 · .sy-header:244-2016 · .sy-lbl:284-2020 · .sy-list:297-324 · .sy-month:311-311 · .sy-nav:254-1590 · .sy-note:294-296 · .sy-pdf:256-257 · .sy-puente:303-1382 · .sy-section:265-266 · .sy-spain:269-274 · .sy-sublbl:349-349 · .sy-suelto:308-310 · .sy-tab:1370-1373 · .sy-table:285-2022 · .sy-td:290-290 · .sy-tr:291-2023 · .sy-val:280-2019 · .sy-year:247-2018 · .toast:186-191 · .toast-undo:195-195 · .today-btn:64-65 · .vac-config:313-315 · .vip-no:1028-1029 · .week-actions:155-155 · .week-card:124-218 · .week-header:127-127 · .week-info:128-129 · .week-total:131-131 · .weeks-container:123-123

