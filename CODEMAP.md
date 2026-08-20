# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(165 líneas)_
**Estado global:** ALARMS_SK:5 · ALARMS:6 · ALARM_TYPE_LABELS:99 · DN_SHORT:104

**Funciones:** saveAlarms:14 · addAlarm:20 · removeAlarm:27 · isAlarmPast:32 · nextAlarmTime:40 · openAlarms:45 · closeAlarms:90 · renderAlarmItem:106 · renderAlarms:128

### js/birthdays.js  _(1043 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:65 · BDAY_ALARM_SET:66 · BDAY_ALARM_COUNT_KEY:67 · BDAY_ALARM_COUNT:68 · BDAY_PALETTE:72 · BDAYS:76 · DN7:241

**Funciones:** _showBdayInlineCtrl:17 · tc:85 · bdName:86 · getBdayColor:88 · shortName:97 · getBdaysOn:102 · daysUntil:104 · hasUpcomingBday:111 · updateBdayBtn:117 · getBdayAlarmKey:127 · isBdayAlarmSet:128 · setBdayAlarmState:129 · syncVipBdaysToEvents:135 · renderBdayUpcoming:160 · getBdaysInRange:165 · bdayLabel:180 · renderGroup:189 · renderBdayCalMonth:239 · renderBdayList:280 · getEffVip:291 · renderBdayContent:333 · renderBdayDetail:392 · renderBdayAlarmPanel:413 · fmtDate:425 · openBdayAlarm:480 · _bdRefreshBoth:495 · closeBdayAlarm:500 · bindBdayAlarmEvents:509 (!147) · fmtD:625 · onOk:633 · onErr:634 · renderBdayForm:656 · openBdayDetail:689 · closeBdayDetail:707 · openBdayForm:714 · closeBdayForm:729 · bindBdayFormEvents:735 · openBday:776 · closeBday:785 · refreshBday:791 · applyBdaySearch:796 · bindBdayEvents:808 (!235) · _bdResetScroll:839

### js/bodas.js  _(1405 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_NONE:30 · BODA_PLACE_SHORT:31 · BODA_PLACES:32 · BODA_PLACE_EMOJI:34 · BODA_WHITE:51 · BODA_SLOTS:52 · BODA_NO_TIME_COLOR:58 · BODA_NO_COUPLE_COLOR:59 · BODA_DEFAULT_TIME:60 · BODA_PALETTE:63 · BODA_CLOSED_SK:211 · BODA_CLOSED:212 · BODA_PENDING:227 · BODA_SUBTAB:268 · BODA_CLASS_MODE:269 · BODA_FILTER_COUPLE:270 · BODA_HIDE_PAST:271 · BODA_HIDE_CLOSED:272 · BODA_PAREJAS_FILTER:273 · BODA_CAL_HL:274 · BODA_CAL_YEAR:275 · BODA_CAL_MONTH:276 · MN2:291 · DN2:753 · BODA_ASSIGN:845 · BODA_TIME_H:1093

**Funciones:** saveBodas:18 · bodaPlaceEmoji:35 · bodaPlaceOf:39 · bodaPlaceLabel:44 · bodaNextColor:65 · bodaCouple:73 · bodaSlot:77 · bodaSlotColors:87 · bodaSlotColor:91 · bodaMarkFor:93 · evBodaSvg:99 · bodaClasses:116 · bodaClassesOfCouple:119 · bodaFreeClasses:122 · bodaSortClasses:125 · bodaClassesOnDay:132 · bodaNewClass:135 · bodaNormalizeClasses:150 · bodaPlaceForNewOn:185 · bodaDayFull:190 · bodaBulkCreate:195 · bodaProgress:205 · saveBodaClosed:216 · bodaIsClosed:217 · bodaToggleClosed:218 · bodaPendingCount:228 · bodaEff:230 · bodaSetPending:238 · bodaPendingApply:242 · bodaPendingDiscard:265 · _bodaLegendHtml:279 · _renderBodaCalendario:290 (!85) · _bodaFirstWord:375 · renderBodasBody:378 · _renderBodaParejas:405 · _bodaFmt:445 · _bodaFmtCorto:446 · _renderBodaClases:453 (!98) · bodaOpenSheet:551 · bodaCloseSheet:567 · bodaCreatedAt:577 · bodaIssues:582 · _renderBodaIssueCards:598 · card:601 · openBodaIssue:622 (!81) · findEv:664 · closeBodaIssue:703 · _bodaWeekKey:706 · _renderBodaStats:713 · openBodaCoupleDetail:792 · closeBodaCoupleDetail:838 · openBodaAssign:846 · closeBodaAssign:866 · renderBodaAssign:870 (!81) · bindBodaAssign:951 · openBodaPlacePicker:1020 · closeBodaPlacePicker:1046 · openBodaCouplePicker:1049 · row:1059 · apply:1076 · closeBodaCouplePicker:1090 · openBodaTimePicker:1096 · drum:1101 · setDrum:1124 · mark:1129 · drumVal:1133 · readManual:1154 · closeBodaTimePicker:1174 · renderBodaCoupleForm:1177 · openBodaCoupleForm:1201 · closeBodaCoupleForm:1244 · bodaRefreshRow:1252 · bindBodasEvents:1278 (!127) · _guardaPendientes:1280 · _bodaCalMove:1286 · findClass:1339

### js/core.js  _(570 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:85 · THEME_STORAGE_KEY:88 · THEME:89 · THEME_LABELS:95 · THEME_META:96 · THEME_SEQUENCE:97 · ECON_YEAR_CONFIG:117 · MN_SHORT:119 · DN5:335

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · addLongPress:50 · start:54 · move:68 · end:71 · applyTheme:98 · cycleTheme:105 · updateThemeBtn:110 · load:124 · save:136 · loadEconYear:140 · saveEconYear:159 · fakeTrans:169 · simpleBarChart:186 · hBarRows:210 · shareOrDownload:227 · escHtml:247 · mkey:252 · getMonthH:253 · defH:259 · dayH:260 · dayT:261 · dk:262 · fd:263 · ad:264 · fh:265 · fhP:266 · isToday:267 · isPast:268 · wn:269 · weeks:272 · hasAnySentWeekInMonth:286 · getWD:293 · showToast:306 · sendEmail:324 · buildMailtoBody:334 · render:356 (!107) · fmtH:442 · openSheet:463 · closeSheet:482 · selectType:488 · togSent:516 · renderNavBar:519 · bindNavBar:542 · doNav:549

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

### js/events-picker-color.js  _(231 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:121 · evTravelColor:130 · getEvType:136 · isEvBarAlways:144 · getEvDisplayColor:146 · _renderColorPicker:160 · _bindColorPicker:183 · updatePreview:193

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!102) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events.js  _(2884 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:32 · EV_VIEW:33 · EV_EDIT:34 · EV_EDIT_DS:35 · EV_FORM_CONTAINER:36 · EV_EDIT_MODE:37 · EV_BRIGHT_PAST:38 · EV_ANNUAL_VIEW:39 · EV_ANNUAL_FILTER_HIDDEN:40 · EV_FILTER_GROUPS:48 · EV_FILTER_SHORT:51 · EV_FILTER_COLOR:53 · EV_FILTER_SEP_AFTER:56 · EV_PREV_VIEW:66 · EV_QUAD_YEAR:67 · EV_QUAD_MONTH:68 · EV_TO_SUBTAB:69 · EV_LIST_SUBTAB:70 · EV_TYPES_FILTER:71 · EV_TYPES_PAST:72 · EV_LIST_SORT:73 · EV_LIST_SEARCH:74 · EV_COLORS:75 · EVENTS:76 · EV_ALARM_SK:105 · EV_ALARMS_SET:106 · EV_NO_RUT:198 · EV_MARK_ORDER:341 · EV_MAX_DAY_EVENTS:379 · EV_CAL_BADGE_STACK:380 · EV_CAL_CORNER_STACK:383 · EV_CAL_VIP_MAX:385 · DN7:425 · EV_BAR_Z:881 · EV_MNS:903 · EV_CAR:1520

**Funciones:** _switchEvView:16 · evFilterGroup:57 · saveEvents:100 · loadEvAlarms:107 · saveEvAlarms:108 · _findBdayByEvId:109 · isEvAlarmSet:121 · setEvAlarmState:127 · evDk:134 · _evClampDate:143 · eventOccursOn:147 · getEventsOn:191 · evSignature:206 · evMergeIncoming:216 · evMergeMsg:240 · _fmtDayEs:252 · evDayLimitExceeded:253 · hasUpcomingEvent:283 · updateEventsBtn:292 · evUniqueColor:302 · evDefaultShape:313 · evMarkerHtml:319 · evMorePlusHtml:333 · evMarkPriority:342 · evBodaMinutes:349 · evSortMarks:360 · ev0:361 · evAnnualXsHtml:386 · vipStarSvgHtml:396 · evSoftFillColor:406 · renderEvCalMonth:414 (!143) · renderEvList:557 · renderEvByMonths:568 · renderEvListItem:587 · fd2:591 · openEvDeleteSheet:620 · closeEvDeleteSheet:654 · getNextOccurrence:661 · evIsoDate:703 · _isVipBdayTooFar:704 · renderEvUpcoming:708 (!174) · fd2:715 · renderEvItem:716 · renderEvPanel:757 · _evRowOcc:882 · _evAssignRow:883 · evBarZ:893 · _evAnnualCtx:906 · visible:907 · _evLoadPuentes:925 · _renderEvMonthCard:935 (!135) · renderEvAnnual:1070 · renderEvQuad:1079 · renderEvByTypes:1100 · coincide:1124 · renderEvMonthsView:1171 · renderEvWeek:1181 (!125) · hexA:1185 · renderEvContent:1306 (!147) · renderEvDetail:1453 · fd2:1456 · evDayCarItems:1521 · _evCarCard:1533 · _evCarRender:1561 · evCarGo:1575 · openEvDayCarousel:1581 · closeEvDayCarousel:1633 · openEvDetail:1640 (!94) · closeEvDetail:1734 · evPuntualDays:1741 · _renderEvTypeSwatches:1749 · renderEvForm:1766 (!145) · openEvForm:1911 · closeEvForm:1941 · bindEvFormEvents:1953 (!264) · _refreshShapePreviews:1969 · _refreshPickDatesLabel:1974 · _curKind:1993 · _applyTypeUI:1994 · _bindTypeSwatches:2007 · renderEvAlarmPanel:2217 · fd2:2219 · openEvAlarm:2274 · closeEvAlarm:2288 · openBdayAlarmFromEvents:2298 · bindEvAlarmEvents:2310 (!104) · _syncPre:2348 · fmtD:2378 · openEvents:2414 · closeEvents:2424 · openEventsAt:2431 · refreshEvents:2438 · bindEvEvents:2454 (!416) · _scrollWeekToMonth:2462 · _scrollWeekToToday:2509 · doScroll:2519 · apply:2832 · _positionEvBright:2870

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(549 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:444 (!105)

### js/init.js  _(559 líneas)_
**Estado global:** DRUM_ITEM_H:147 · DN_ES:328

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:148 · updateDrumSelected:176 · getDrumValue:182 · checkDrumMinuteWrap:188 · buildAlarmDayBtns:219 · showAlarmPastConfirm:249 · proceed:303 · fmt:364 · _showUpdateBar:526

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(653 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_ICON_LABEL:45 · RUT_SUBTAB:224 · RUT_WEEK_SEL:498

**Funciones:** saveRutinas:25 · _rutIconShapes:46 · _rutIconDetails:71 · rutIconOf:90 · rutIconSvg:98 · rutMarkerHtml:108 · rutById:115 · rutWeekKey:120 · rutWeekCfg:127 · rutSuspendedOn:135 · rutOccursOn:142 · rutIsSkipped:150 · rutToggleSkip:151 · rutFin:156 · rutEventsOn:164 · rutEventFromId:181 · rutSessions:190 · rutStats:204 · rutProximas:217 · renderRutinasBody:227 · _renderRutLista:238 · _rutFmt:292 · _rutFmtCorto:293 · _renderRutStats:299 · renderRutForm:360 · openRutForm:409 (!82) · _rutRepaintIcons:420 · closeRutForm:491 · openRutWeek:499 · _rutWeekRender:503 · closeRutWeek:571 · openRutSesion:578 · closeRutSesion:614 · bindRutinasEvents:621

### js/summary.js  _(616 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · openSummary:518 · closeSummary:527 · bindSummaryEvents:533 (!83)

## CSS

### css/styles.css  _(2158 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:18
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):35
- HEADER:53
- JORNADA DEFECTO:67
- Barra vertical que separa la campana del bloque de navegacion:103
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:109
- Punto verde notificación en botones bday/events cuando hay items próximos:118
- WEEK CARDS:128
- WEEK ACTIONS:160
- BOTTOM SHEET (day type selector):169
- TOAST:191
- Tema claro: el fondo oscuro con letra de color no se leia bien:198
- SW UPDATE BUTTON (en menú ⋯):202
- ANIMATIONS:207
- BUILD BADGE:216
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:242
- OVERLAY BASE (summary, econ, bday, events):248
- SHARED OVERLAY HEADER:253
- SHARED BODY:273
- Vacaciones config:322
- Quitar festivos/vacaciones checkboxes:326
- Month summary breakdown:330
- Ausencia list tag:333
- ECONOMICS:336
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:341
- Summary sublabel (hours breakdown):358
- Ingresado box (formerly cobrado) — neutral:367
- ECONOMICS v2: tabs + nuevas secciones:401
- Estudio Cambio — grouped nav:412
- Estudio — tariff comparison cards:421
- Análisis hipoteca — secciones organizadas:442
- Mis gastos — budget table:459
- Year selector for per-year fiscal tabs:472
- §1.1 Tarifa dual:483
- §1.3 Stats por hora/día:495
- §1.4 Toggles:502
- §1.5 Declaración IRPF:507
- Tab 2: Comparador:520
- Calcular Tarifa (sim):548
- Scenario zones (Comparar Escenarios):566
- Análisis Ec. Personal:583
- Bloques de la Subrogación:585
- Fiscal config modal — purple theme override:628
- Fiscal config modal:630
- ECONOMICS v3: opt-buttons, cascade, gastos:656
- Cascade ingresos/gastos:663
- Media mensual: cards:673
- Tab 4: Análisis:683
- IRPF Breakdown visual:697
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:724
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):726
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):750
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:759
- Resumen fiscal al final de Ingresos y Gastos:761
- Donut chart:768
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):778
- Fiscal config: gastos items:785
- Fiscal: tab bar:797
- Fiscal: sticky save:802
- Fiscal: section title income/expense colors:804
- Fiscal: desgravaciones:814
- Fiscal: compras profesionales:841
- Desgravaciones: notas + tabla despacho info:849
- Nota IVA compras:869
- IVA por item en compras:871
- Fiscal: despacho en casa:878
- Hipoteca — resumen visual:901
- Hipoteca — compact 2-col grid:924
- Hipoteca — compact vinculaciones:932
- Hipoteca — read-only fields:943
- Hipoteca — edit/detail buttons:952
- Hipoteca — period summary card:958
- Multi-rate period cards:971
- Distribución de ingresos:987
- Comparador: reorder buttons:1003
- Rate input styled:1007
- BIRTHDAYS:1011
- VIP controls bar:1031
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1042
- VIP edit mode item states:1045
- Feat 1: Buscador en lista por meses:1055
- Upcoming birthdays:1064
- Weekend frame — gris lavanda suave:1081
- Day types in events calendar — border-top + tinte de fondo:1086
- Events in puentes (summary) — one per line:1105
- Events upcoming view:1109
- Minicabecera de día dentro de un panel de Próximos:1111
- Vista semanal (Agenda):1134
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1142
- Grid del mes: col fecha (48px) + col eventos (1fr):1144
- Columna fecha (col 1):1146
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1155
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1161
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1165
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1171
- Event color type picker:1175
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1181
- Color picker avanzado (paleta 6×8 + color libre):1185
- Detail color picker toggle:1203
- Annual events calendar:1209
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1239
- Selector de formas en el formulario de evento (Otros):1250
- Selector de grosor de barra (grande | Otros):1252
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1267
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1271
- Inicio/Fin bloqueados cuando hay Selección Multidía:1274
- Mini-overlay para elegir días específicos (Otros):1279
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1306
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1310
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1312
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1314
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1316
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1322
- Calendario 4 meses: 2 columnas × 2 filas:1324
- Botón ir al calendario mensual en puentes del resumen:1326
- Pencil edit button in annual/quad controls:1338
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1339
- Feat 6: Puentes rallados en anual:1343
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1344
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1362
- Dropdown de vista anual:1369
- Linea que separa los chips de eventos grandes de los puntuales:1378
- Barras multi-día en vista mensual (fila propia encima de las celdas):1383
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1384
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1388
- Summary tabs — nivel 2:1391
- BRIDGE DAY CELLS in summary:1396
- VIP BIRTHDAYS:1405
- BIRTHDAY + EVENT ALARM PANEL:1408
- Campana de alarma en items de próximos (bday + eventos):1411
- 3-ZONE ALARM MARKER:1431
- ALARM MANAGEMENT OVERLAY:1444
- HOME POPUP (semanas pendientes / VIP sin alarma):1461
- MACRO URL EN MENÚ:1472
- Feat 4: Nav-bar emoji alignment:1478
- Birthday detail / form overlays:1494
- EVENTS:1504
- Zone A: upcoming/list views — subtle blue tint:1510
- Zone B: calendar grid views — subtle teal tint, active = green:1512
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1521
- Feat 2: Lista de Eventos subtabs:1526
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1543
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1545
- Contenedor de badges 1-día: centrado verticalmente en la celda:1568
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1575
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1579
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1585
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1599
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1612
- Perímetro puente: capa inferior a eventos:1614
- Bright past: bombilla override:1627
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1631
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1632
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1637
- Quad label 3 lines:1642
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1649
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1651
- Events list view:1653
- Event form overlay (inside eventsOverlay):1667
- Event detail:1701
- LOGO POPUP:1709
- Gallery:1718
- BD ALARM VIP TOGGLE:1727
- RESPONSIVE (mobile header):1730
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1732
- ALARM PANEL:1785
- Drum picker (selector giratorio de hora/minuto):1790
- Confirmación alarma en el pasado:1810
- Botón flotante "Listo" en modo Editar VIPs:1822
- Controles inline long-press cumpleaños:1825
- Selector de clase en el formulario:1837
- Notas: general vs de un dia concreto:1843
- Pestana Bodas y pestana partida Vacaciones/Festivos:1847
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1852
- Pestana Bodas:1858
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1866
- Filas del panel de un aviso:1880
- Estadisticas:1884
- Barras horizontales de reparto (componente generico: hBarRows):1892
- Dia cerrado: no admite mas clases:1918
- Fila con cambios sin guardar:1923
- Barra de guardado, siempre visible al fondo de la lista:1926
- Filtros de Parejas como chips pulsables:1936
- Sala sin asignar: se marca en naranja para que cante en la lista:1971
- Nota propia del dia en la lista de Proximos:1974
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:1976
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):1978
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:1986
- Los tres botones del detalle de pareja comparten aspecto:2000
- Subpestana Calendario de bodas:2036
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2050
- Dia resaltado al pulsar una pareja en la leyenda:2057
- Rutinas semanales:2066
- Selector de icono de rutina:2071
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2111
- Diálogo: modo de importación (añadir vs reemplazar):2126
- PRINT:2139

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:446-448 · .ah-donut:456-458 · .ah-section:443-445 · .ah-total:453-455 · .ah-vs:449-452 · .alarm-cfg:1786-1786 · .alarm-colon:1789-1789 · .alarm-create:1801-1802 · .alarm-day:1807-1809 · .alarm-days:1804-1806 · .alarm-delete:1457-1458 · .alarm-ics:1803-1803 · .alarm-item:1451-1456 · .alarm-macro:1816-1821 · .alarm-msg:1799-1800 · .alarm-panel:1787-1787 · .alarm-past:1811-1815 · .alarm-time:1788-1788 · .alarms-empty:1459-1460 · .alarms-mgmt:1445-1445 · .alarms-section:1446-1447 · .alarms-sub:1448-1450 · .analisis-card:595-597 · .analisis-cards:584-584 · .analisis-hbar:598-603 · .analisis-input:613-616 · .analisis-ins:622-627 · .analisis-insurance:621-621 · .analisis-mortgage:604-620 · .app-logo:58-58 · .app-version:126-126 · .bd-alarm:1409-1729 · .bd-detail:1495-1502 · .bday-add:1079-1080 · .bday-badge:1026-1028 · .bday-cancel:1043-1044 · .bday-cell:1020-1083 · .bday-hdr:1013-1389 · .bday-ic:1827-1831 · .bday-inline:1826-1826 · .bday-io:1059-1063 · .bday-list:1030-1054 · .bday-listo:1823-1823 · .bday-month:1029-1029 · .bday-num:1025-1025 · .bday-search:1056-1058 · .bday-upcoming:1065-1407 · .bday-view:1014-1016 · .bday-vip:1032-1406 · .bday-week:1017-1019 · .boda-actions:1992-1992 · .boda-add:1994-1994 · .boda-asg:2013-2035 · .boda-cal:2037-2060 · .boda-card:1942-1952 · .boda-chip:1938-1940 · .boda-chips:1937-1937 · .boda-class:1924-1966 · .boda-controls:1908-1908 · .boda-couple:1964-1964 · .boda-cpk:2007-2012 · .boda-date:1993-1993 · .boda-day:1919-1958 · .boda-det:1999-2006 · .boda-dot:1946-1946 · .boda-falta:1953-1953 · .boda-filters:1911-1911 · .boda-fsel:1912-1915 · .boda-ftoggles:1916-1917 · .boda-inp:1962-1962 · .boda-iss:1881-1883 · .boda-issue:1868-1879 · .boda-issues:1867-1867 · .boda-legend:1995-1998 · .boda-mini:1990-1991 · .boda-mode:1899-1901 · .boda-name:1947-1947 · .boda-ok:1954-1954 · .boda-place:1965-1973 · .boda-prog:1949-1950 · .boda-ro:1967-1972 · .boda-save:1934-1935 · .boda-savebar:1930-1933 · .boda-sec:1865-1865 · .boda-sobra:1955-1955 · .boda-stat:1886-1891 · .boda-stats:1885-1885 · .boda-sticky:1861-1863 · .boda-sum:1904-1907 · .boda-summary:1903-1903 · .boda-time:1963-1963 · .boda-tp:2061-2064 · .boda-wed:1948-1948 · .bottom-sheet:172-173 · .btn-icon:99-1775 · .build-badge:217-217 · .build-dot:218-218 · .csv-export:71-72 · .data-actions:95-1777 · .data-btn:96-1773 · .data-menu:120-125 · .day-cell:140-246 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:69-77 · .dp-actions:1302-1303 · .dp-counter:1289-1290 · .dp-day:1297-1301 · .dp-days:1296-1296 · .dp-grid:1291-1291 · .dp-handle:1284-1284 · .dp-hdr:1285-1285 · .dp-mhdr:1294-1295 · .dp-mname:1293-1293 · .dp-month:1292-1292 · .dp-overlay:1280-1283 · .dp-sheet:1282-1282 · .dp-title:1286-1286 · .dp-yearnav:1287-1288 · .drum-picker:1792-1795 · .drum-sel:1798-1798 · .drum-wrap:1791-1797 · .econ-add:530-531 · .econ-ahorro:751-758 · .econ-annual:360-360 · .econ-avg:361-678 · .econ-bracket:513-519 · .econ-calc:661-662 · .econ-casc:665-672 · .econ-cascade:664-664 · .econ-chart:543-544 · .econ-comp:521-545 · .econ-decl:508-682 · .econ-distrib:988-1002 · .econ-donut:769-784 · .econ-equiv:983-986 · .econ-fiscal:762-767 · .econ-formula:380-383 · .econ-gastos:684-696 · .econ-gear:480-481 · .econ-hdr:402-482 · .econ-ingresado:368-368 · .econ-irpf:698-760 · .econ-legend:546-547 · .econ-line:541-542 · .econ-month:385-398 · .econ-mr:980-981 · .econ-multi:972-982 · .econ-opt:657-660 · .econ-qcard:350-357 · .econ-qcell:346-1736 · .econ-qm:355-355 · .econ-qmonth:353-354 · .econ-quarter:342-1733 · .econ-rate:484-492 · .econ-row:369-379 · .econ-sc:523-1009 · .econ-scenario:522-522 · .econ-section:399-399 · .econ-sim:549-559 · .econ-stats:496-501 · .econ-sub:405-411 · .econ-tab:403-404 · .econ-toggle:503-506 · .econ-val:384-384 · .est-btn:416-420 · .est-card:426-428 · .est-detail:423-423 · .est-field:435-441 · .est-fields:434-434 · .est-group:414-418 · .est-modo:429-429 · .est-nav:413-413 · .est-section:422-422 · .est-tariff:424-433 · .ev-alarm:1420-1985 · .ev-ann:1340-1377 · .ev-annual:1210-1626 · .ev-badge:1652-1652 · .ev-badges:1571-1571 · .ev-bars:1546-1546 · .ev-barsize:1253-1262 · .ev-bright:1628-1639 · .ev-btn:1522-2068 · .ev-car:1586-1595 · .ev-cell:1084-1648 · .ev-char:1679-1679 · .ev-checkbox:1684-1684 · .ev-color:1183-1202 · .ev-colors:1680-1680 · .ev-date:1681-1681 · .ev-dates:1275-1277 · .ev-day:1574-1607 · .ev-daynote:1845-1845 · .ev-del:2123-2124 · .ev-detail:1204-1846 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1330-1694 · .ev-field:1673-1674 · .ev-filter:1379-1382 · .ev-form:1668-1689 · .ev-hdr:1390-1506 · .ev-input:1675-1676 · .ev-io:1337-1700 · .ev-kind:1838-1842 · .ev-list:1527-2122 · .ev-month:1535-1535 · .ev-multi:1560-1623 · .ev-note:1844-1844 · .ev-num:1650-1650 · .ev-otros:1251-1608 · .ev-puente:1615-1615 · .ev-quad:1325-1644 · .ev-repeat:1685-1685 · .ev-rut:1603-1606 · .ev-search:2113-2117 · .ev-sep:1133-1133 · .ev-shape:1263-1270 · .ev-sort:2118-2119 · .ev-textarea:1677-1678 · .ev-toggle:1682-1683 · .ev-type:1176-1184 · .ev-types:1530-1532 · .ev-up:1112-1117 · .ev-upcoming:1110-1977 · .ev-view:1507-1509 · .ev-wd:1687-1688 · .ev-week:1541-1613 · .ev-weekday:1686-1686 · .ev-wk:1140-1989 · .ev-zone:1511-1518 · .excl-item:328-494 · .excl-row:327-493 · .fiscal-add:650-813 · .fiscal-bracket:641-649 · .fiscal-compras:842-877 · .fiscal-copy:477-479 · .fiscal-custom:638-638 · .fiscal-ded:852-866 · .fiscal-desgrav:815-867 · .fiscal-despacho:879-900 · .fiscal-error:654-654 · .fiscal-gasto:786-848 · .fiscal-gastos:868-868 · .fiscal-hdr:798-798 · .fiscal-highlight:839-839 · .fiscal-onoff:881-882 · .fiscal-pct:639-648 · .fiscal-period:794-795 · .fiscal-radio:633-637 · .fiscal-save:652-653 · .fiscal-section:631-806 · .fiscal-sticky:803-803 · .fiscal-subsection:807-808 · .fiscal-tab:799-801 · .fiscal-viaje:809-810 · .fiscal-vinc:892-893 · .fiscal-year:473-476 · .full-overlay:249-250 · .hbar-lbl:1895-1895 · .hbar-row:1894-1894 · .hbar-rows:1893-1893 · .hbar-track:1896-1897 · .hbar-val:1898-1898 · .header:54-1778 · .header-brand:57-57 · .hip-add:970-970 · .hip-auto:921-921 · .hip-bar:907-914 · .hip-cancel:957-957 · .hip-cf:926-931 · .hip-edit:953-955 · .hip-g2:925-925 · .hip-grid:919-919 · .hip-period:959-968 · .hip-resumen:902-906 · .hip-ro:944-951 · .hip-save:956-956 · .hip-section:920-969 · .hip-stat:916-918 · .hip-stats:915-915 · .hip-sub:923-923 · .hip-vinc:922-922 · .hip-vr:933-942 · .home-popup:1462-1471 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:2127-2137 · .logo-gallery:1719-1726 · .logo-popup:1710-1717 · .macro-section:1473-1474 · .macro-url:1475-1477 · .mg-budget:460-469 · .mg-cat:470-470 · .mg-desgrav:471-471 · .mg-sort:466-466 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:331-331 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:332-332 · .nav-bar:1386-1782 · .nav-btn:62-63 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1385-1387 · .pdf-export:73-74 · .rate-input:339-2156 · .rate-label:338-338 · .rate-row:337-337 · .rate-suffix:340-340 · .rut-add:2095-2095 · .rut-card:2078-2093 · .rut-day:2086-2102 · .rut-days:2085-2100 · .rut-dot:2081-2081 · .rut-hist:2107-2110 · .rut-hora:2088-2088 · .rut-icon:2072-2076 · .rut-name:2082-2082 · .rut-pct:2094-2094 · .rut-prox:2089-2091 · .rut-sec:2077-2077 · .rut-stat:2104-2106 · .rut-sug:2096-2099 · .rut-susp:2103-2103 · .rut-tag:2083-2084 · .rut-vacio:2092-2092 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:561-565 · .sim-field:550-551 · .sim-hr:560-560 · .sim-period:557-557 · .sim-target:552-556 · .sub-block:586-587 · .sub-row:588-594 · .sw-upd:203-203 · .sy-back:255-2147 · .sy-body:274-2145 · .sy-card:285-2151 · .sy-cards3:277-277 · .sy-cards4:278-278 · .sy-chart:303-303 · .sy-hdr:260-260 · .sy-header:254-2146 · .sy-lbl:294-2150 · .sy-list:307-334 · .sy-month:321-321 · .sy-nav:264-1641 · .sy-note:304-306 · .sy-pdf:266-267 · .sy-puente:313-1404 · .sy-section:275-276 · .sy-spain:279-284 · .sy-sublbl:359-359 · .sy-suelto:318-320 · .sy-tab:1392-1395 · .sy-table:295-2152 · .sy-td:300-300 · .sy-tr:301-2153 · .sy-val:290-2149 · .sy-year:257-2148 · .toast:192-197 · .toast-undo:205-205 · .today-btn:64-65 · .vac-config:323-325 · .vip-no:1038-1039 · .week-actions:161-161 · .week-card:130-228 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

