# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(165 líneas)_
**Estado global:** ALARMS_SK:5 · ALARMS:6 · ALARM_TYPE_LABELS:99 · DN_SHORT:104

**Funciones:** saveAlarms:14 · addAlarm:20 · removeAlarm:27 · isAlarmPast:32 · nextAlarmTime:40 · openAlarms:45 · closeAlarms:90 · renderAlarmItem:106 · renderAlarms:128

### js/birthdays.js  _(1046 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:65 · BDAY_ALARM_SET:66 · BDAY_ALARM_COUNT_KEY:67 · BDAY_ALARM_COUNT:68 · BDAY_PALETTE:72 · BDAYS:76 · DN7:236

**Funciones:** _showBdayInlineCtrl:17 · tc:85 · bdName:86 · getBdayColor:88 · getBdaysOn:97 · daysUntil:99 · hasUpcomingBday:106 · updateBdayBtn:112 · getBdayAlarmKey:122 · isBdayAlarmSet:123 · setBdayAlarmState:124 · syncVipBdaysToEvents:130 · renderBdayUpcoming:155 · getBdaysInRange:160 · bdayLabel:175 · renderGroup:184 · renderBdayCalMonth:234 · renderBdayList:275 · getEffVip:286 · renderBdayContent:328 · renderBdayDetail:387 · renderBdayAlarmPanel:408 · fmtDate:420 · openBdayAlarm:475 · _bdRefreshBoth:490 · closeBdayAlarm:495 · bindBdayAlarmEvents:504 (!147) · fmtD:620 · onOk:628 · onErr:629 · renderBdayForm:651 · openBdayDetail:684 · closeBdayDetail:702 · openBdayForm:709 · closeBdayForm:724 · bindBdayFormEvents:730 · openBday:771 · closeBday:780 · refreshBday:786 · applyBdaySearch:791 · bindBdayEvents:803 (!243) · _bdResetScroll:834 · _bdScrollToMonth:836

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

### js/events-picker-color.js  _(237 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:121 · evTravelColor:130 · getEvType:136 · isEvBarAlways:144 · getEvDisplayColor:146 · _renderColorPicker:166 · _bindColorPicker:189 · updatePreview:199

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!102) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events.js  _(2913 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:32 · EV_VIEW:33 · EV_EDIT:34 · EV_EDIT_DS:35 · EV_FORM_CONTAINER:36 · EV_EDIT_MODE:37 · EV_BRIGHT_PAST:38 · EV_ANNUAL_VIEW:39 · EV_ANNUAL_FILTER_HIDDEN:40 · EV_FILTER_GROUPS:48 · EV_FILTER_SHORT:51 · EV_FILTER_COLOR:53 · EV_FILTER_SEP_AFTER:56 · EV_PREV_VIEW:66 · EV_QUAD_YEAR:67 · EV_QUAD_MONTH:68 · EV_TO_SUBTAB:69 · EV_LIST_SUBTAB:70 · EV_TYPES_FILTER:71 · EV_TYPES_PAST:72 · EV_LIST_SORT:73 · EV_LIST_SEARCH:74 · EV_COLORS:75 · EVENTS:76 · EV_ALARM_SK:105 · EV_ALARMS_SET:106 · EV_NO_RUT:198 · EV_MARK_ORDER:341 · EV_MAX_DAY_EVENTS:379 · EV_CAL_BADGE_STACK:380 · EV_CAL_CORNER_STACK:383 · EV_CAL_VIP_MAX:385 · EV_UP_HIDE_RUT:387 · EV_UP_HIDE_BODA:388 · DN7:428 · EV_BAR_Z:899 · EV_MNS:921 · EV_CAR:1544

**Funciones:** _switchEvView:16 · evFilterGroup:57 · saveEvents:100 · loadEvAlarms:107 · saveEvAlarms:108 · _findBdayByEvId:109 · isEvAlarmSet:121 · setEvAlarmState:127 · evDk:134 · _evClampDate:143 · eventOccursOn:147 · getEventsOn:191 · evSignature:206 · evMergeIncoming:216 · evMergeMsg:240 · _fmtDayEs:252 · evDayLimitExceeded:253 · hasUpcomingEvent:283 · updateEventsBtn:292 · evUniqueColor:302 · evDefaultShape:313 · evMarkerHtml:319 · evMorePlusHtml:333 · evMarkPriority:342 · evBodaMinutes:349 · evSortMarks:360 · ev0:361 · evAnnualXsHtml:389 · vipStarSvgHtml:399 · evSoftFillColor:409 · renderEvCalMonth:417 (!143) · renderEvList:560 · renderEvByMonths:571 · renderEvListItem:590 · fd2:594 · openEvDeleteSheet:623 · closeEvDeleteSheet:657 · getNextOccurrence:664 · evIsoDate:706 · _isVipBdayTooFar:707 · evUpcomingMarkHtml:714 · renderEvUpcoming:724 (!176) · fd2:731 · renderEvItem:732 · renderEvPanel:773 · _evRowOcc:900 · _evAssignRow:901 · evBarZ:911 · _evAnnualCtx:924 · visible:925 · _evLoadPuentes:943 · _renderEvMonthCard:953 (!135) · renderEvAnnual:1088 · renderEvQuad:1097 · renderEvByTypes:1118 · coincide:1142 · renderEvMonthsView:1189 · renderEvWeek:1199 (!125) · hexA:1203 · renderEvContent:1324 (!153) · renderEvDetail:1477 · fd2:1480 · evDayCarItems:1545 · _evCarCard:1557 · _evCarRender:1585 · evCarGo:1599 · openEvDayCarousel:1605 · closeEvDayCarousel:1657 · openEvDetail:1664 (!94) · closeEvDetail:1758 · evPuntualDays:1765 · _renderEvTypeSwatches:1773 · renderEvForm:1790 (!145) · openEvForm:1935 · closeEvForm:1965 · bindEvFormEvents:1977 (!264) · _refreshShapePreviews:1993 · _refreshPickDatesLabel:1998 · _curKind:2017 · _applyTypeUI:2018 · _bindTypeSwatches:2031 · renderEvAlarmPanel:2241 · fd2:2243 · openEvAlarm:2299 · closeEvAlarm:2313 · openBdayAlarmFromEvents:2323 · bindEvAlarmEvents:2335 (!104) · _syncPre:2373 · fmtD:2403 · openEvents:2439 · closeEvents:2449 · openEventsAt:2456 · refreshEvents:2463 · bindEvEvents:2479 (!420) · _scrollWeekToMonth:2487 · _scrollWeekToToday:2534 · doScroll:2544 · apply:2861 · _positionEvBright:2899

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(549 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:444 (!105)

### js/init.js  _(559 líneas)_
**Estado global:** DRUM_ITEM_H:147 · DN_ES:328

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:148 · updateDrumSelected:176 · getDrumValue:182 · checkDrumMinuteWrap:188 · buildAlarmDayBtns:219 · showAlarmPastConfirm:249 · proceed:303 · fmt:364 · _showUpdateBar:526

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(664 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:228 · RUT_WEEK_SEL:509

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:102 · rutMarkerHtml:112 · rutById:119 · rutWeekKey:124 · rutWeekCfg:131 · rutSuspendedOn:139 · rutOccursOn:146 · rutIsSkipped:154 · rutToggleSkip:155 · rutFin:160 · rutEventsOn:168 · rutEventFromId:185 · rutSessions:194 · rutStats:208 · rutProximas:221 · renderRutinasBody:231 · _renderRutLista:242 · _rutFmt:296 · _rutFmtCorto:297 · _renderRutStats:303 · renderRutForm:364 · openRutForm:414 (!88) · _rutRepaintIcons:425 · closeRutForm:502 · openRutWeek:510 · _rutWeekRender:514 · closeRutWeek:582 · openRutSesion:589 · closeRutSesion:625 · bindRutinasEvents:632

### js/summary.js  _(616 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · openSummary:518 · closeSummary:527 · bindSummaryEvents:533 (!83)

## CSS

### css/styles.css  _(2187 líneas)_

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
- Month summary breakdown:347
- Ausencia list tag:350
- ECONOMICS:353
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:358
- Summary sublabel (hours breakdown):375
- Ingresado box (formerly cobrado) — neutral:384
- ECONOMICS v2: tabs + nuevas secciones:418
- Estudio Cambio — grouped nav:429
- Estudio — tariff comparison cards:438
- Análisis hipoteca — secciones organizadas:459
- Mis gastos — budget table:476
- Year selector for per-year fiscal tabs:489
- §1.1 Tarifa dual:500
- §1.3 Stats por hora/día:512
- §1.4 Toggles:519
- §1.5 Declaración IRPF:524
- Tab 2: Comparador:537
- Calcular Tarifa (sim):565
- Scenario zones (Comparar Escenarios):583
- Análisis Ec. Personal:600
- Bloques de la Subrogación:602
- Fiscal config modal — purple theme override:645
- Fiscal config modal:647
- ECONOMICS v3: opt-buttons, cascade, gastos:673
- Cascade ingresos/gastos:680
- Media mensual: cards:690
- Tab 4: Análisis:700
- IRPF Breakdown visual:714
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:741
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):743
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):767
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:776
- Resumen fiscal al final de Ingresos y Gastos:778
- Donut chart:785
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):795
- Fiscal config: gastos items:802
- Fiscal: tab bar:814
- Fiscal: sticky save:819
- Fiscal: section title income/expense colors:821
- Fiscal: desgravaciones:831
- Fiscal: compras profesionales:858
- Desgravaciones: notas + tabla despacho info:866
- Nota IVA compras:886
- IVA por item en compras:888
- Fiscal: despacho en casa:895
- Hipoteca — resumen visual:918
- Hipoteca — compact 2-col grid:941
- Hipoteca — compact vinculaciones:949
- Hipoteca — read-only fields:960
- Hipoteca — edit/detail buttons:969
- Hipoteca — period summary card:975
- Multi-rate period cards:988
- Distribución de ingresos:1004
- Comparador: reorder buttons:1020
- Rate input styled:1024
- BIRTHDAYS:1028
- Cabe el nombre entero, hasta en tres lineas:1043
- VIP controls bar:1049
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1060
- VIP edit mode item states:1063
- Feat 1: Buscador en lista por meses:1073
- Upcoming birthdays:1082
- Weekend frame — gris lavanda suave:1099
- Day types in events calendar — border-top + tinte de fondo:1104
- Events in puentes (summary) — one per line:1123
- Events upcoming view:1127
- Minicabecera de día dentro de un panel de Próximos:1129
- Marcador de la tarjeta de Proximos: la forma real del evento:1139
- Vista semanal (Agenda):1157
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1165
- Grid del mes: col fecha (48px) + col eventos (1fr):1167
- Columna fecha (col 1):1169
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1178
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1184
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1188
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1194
- Event color type picker:1198
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1204
- Color picker avanzado (paleta 6×8 + color libre):1208
- Detail color picker toggle:1226
- Annual events calendar:1232
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1262
- Selector de formas en el formulario de evento (Otros):1273
- Selector de grosor de barra (grande | Otros):1275
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1290
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1294
- Inicio/Fin bloqueados cuando hay Selección Multidía:1297
- Mini-overlay para elegir días específicos (Otros):1302
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1329
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1333
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1335
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1337
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1339
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1345
- Calendario 4 meses: 2 columnas × 2 filas:1347
- Botón ir al calendario mensual en puentes del resumen:1349
- Pencil edit button in annual/quad controls:1361
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1362
- Feat 6: Puentes rallados en anual:1366
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1367
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1385
- Dropdown de vista anual:1392
- Linea que separa los chips de eventos grandes de los puntuales:1401
- Barras multi-día en vista mensual (fila propia encima de las celdas):1406
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1407
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1411
- Summary tabs — nivel 2:1414
- BRIDGE DAY CELLS in summary:1419
- VIP BIRTHDAYS:1428
- BIRTHDAY + EVENT ALARM PANEL:1431
- Campana de alarma en items de próximos (bday + eventos):1434
- 3-ZONE ALARM MARKER:1454
- ALARM MANAGEMENT OVERLAY:1467
- HOME POPUP (semanas pendientes / VIP sin alarma):1484
- MACRO URL EN MENÚ:1495
- Feat 4: Nav-bar emoji alignment:1501
- Birthday detail / form overlays:1517
- EVENTS:1527
- Zone A: upcoming/list views — subtle blue tint:1533
- Zone B: calendar grid views — subtle teal tint, active = green:1535
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1544
- Feat 2: Lista de Eventos subtabs:1549
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1566
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1568
- Contenedor de badges 1-día: centrado verticalmente en la celda:1591
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1598
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1602
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1608
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1622
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1635
- Perímetro puente: capa inferior a eventos:1637
- Bright past: bombilla override:1650
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1654
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1655
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1660
- Quad label 3 lines:1665
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1672
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1674
- Events list view:1676
- Event form overlay (inside eventsOverlay):1690
- Relleno, para que haga pareja con el naranja de "Editar evento":1720
- Event detail:1727
- LOGO POPUP:1735
- Gallery:1744
- BD ALARM VIP TOGGLE:1753
- RESPONSIVE (mobile header):1756
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1758
- ALARM PANEL:1811
- Drum picker (selector giratorio de hora/minuto):1816
- Confirmación alarma en el pasado:1836
- Botón flotante "Listo" en modo Editar VIPs:1848
- Controles inline long-press cumpleaños:1851
- Selector de clase en el formulario:1863
- Notas: general vs de un dia concreto:1869
- Pestana Bodas y pestana partida Vacaciones/Festivos:1873
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1878
- Pestana Bodas:1884
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1892
- Filas del panel de un aviso:1906
- Estadisticas:1910
- Barras horizontales de reparto (componente generico: hBarRows):1918
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1928
- Dia cerrado: no admite mas clases:1945
- Fila con cambios sin guardar:1950
- Barra de guardado, siempre visible al fondo de la lista:1953
- Filtros de Parejas como chips pulsables:1963
- Sala sin asignar: se marca en naranja para que cante en la lista:1998
- Nota propia del dia en la lista de Proximos:2001
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2003
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2005
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2013
- Los tres botones del detalle de pareja comparten aspecto:2027
- Subpestana Calendario de bodas:2063
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2077
- Dia resaltado al pulsar una pareja en la leyenda:2084
- Rutinas semanales:2093
- Selector de icono de rutina:2100
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2140
- Diálogo: modo de importación (añadir vs reemplazar):2155
- PRINT:2168

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:463-465 · .ah-donut:473-475 · .ah-section:460-462 · .ah-total:470-472 · .ah-vs:466-469 · .alarm-cfg:1812-1812 · .alarm-colon:1815-1815 · .alarm-create:1827-1828 · .alarm-day:1833-1835 · .alarm-days:1830-1832 · .alarm-delete:1480-1481 · .alarm-ics:1829-1829 · .alarm-item:1474-1479 · .alarm-macro:1842-1847 · .alarm-msg:1825-1826 · .alarm-panel:1813-1813 · .alarm-past:1837-1841 · .alarm-time:1814-1814 · .alarms-empty:1482-1483 · .alarms-mgmt:1468-1468 · .alarms-section:1469-1470 · .alarms-sub:1471-1473 · .analisis-card:612-614 · .analisis-cards:601-601 · .analisis-hbar:615-620 · .analisis-input:630-633 · .analisis-ins:639-644 · .analisis-insurance:638-638 · .analisis-mortgage:621-637 · .app-logo:58-58 · .app-version:126-126 · .bd-alarm:1432-1755 · .bd-detail:1518-1525 · .bday-add:1097-1098 · .bday-badge:1044-1046 · .bday-cancel:1061-1062 · .bday-cell:1037-1101 · .bday-hdr:1030-1412 · .bday-ic:1853-1857 · .bday-inline:1852-1852 · .bday-io:1077-1081 · .bday-list:1048-1072 · .bday-listo:1849-1849 · .bday-month:1047-1047 · .bday-num:1042-1042 · .bday-search:1074-1076 · .bday-upcoming:1083-1430 · .bday-view:1031-1033 · .bday-vip:1050-1429 · .bday-week:1034-1036 · .boda-actions:2019-2019 · .boda-add:2021-2021 · .boda-asg:2040-2062 · .boda-cal:2064-2087 · .boda-card:1969-1979 · .boda-chip:1965-1967 · .boda-chips:1964-1964 · .boda-class:1951-1993 · .boda-controls:1935-1935 · .boda-couple:1991-1991 · .boda-cpk:2034-2039 · .boda-date:2020-2020 · .boda-day:1946-1985 · .boda-det:2026-2033 · .boda-dot:1973-1973 · .boda-falta:1980-1980 · .boda-filters:1938-1938 · .boda-fsel:1939-1942 · .boda-ftoggles:1943-1944 · .boda-inp:1989-1989 · .boda-iss:1907-1909 · .boda-issue:1894-1905 · .boda-issues:1893-1893 · .boda-legend:2022-2025 · .boda-mini:2017-2018 · .boda-mode:1925-1927 · .boda-name:1974-1974 · .boda-ok:1981-1981 · .boda-place:1992-2000 · .boda-prog:1976-1977 · .boda-ro:1994-1999 · .boda-save:1961-1962 · .boda-savebar:1957-1960 · .boda-sec:1891-1891 · .boda-sobra:1982-1982 · .boda-stat:1912-1917 · .boda-stats:1911-1911 · .boda-sticky:1887-1889 · .boda-sum:1931-1934 · .boda-summary:1930-1930 · .boda-time:1990-1990 · .boda-tp:2088-2091 · .boda-wed:1975-1975 · .bottom-sheet:172-173 · .btn-icon:99-1801 · .build-badge:217-217 · .build-dot:218-218 · .csv-export:71-72 · .data-actions:95-1803 · .data-btn:96-1799 · .data-menu:120-125 · .day-cell:140-246 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:69-77 · .dp-actions:1325-1326 · .dp-counter:1312-1313 · .dp-day:1320-1324 · .dp-days:1319-1319 · .dp-grid:1314-1314 · .dp-handle:1307-1307 · .dp-hdr:1308-1308 · .dp-mhdr:1317-1318 · .dp-mname:1316-1316 · .dp-month:1315-1315 · .dp-overlay:1303-1306 · .dp-sheet:1305-1305 · .dp-title:1309-1309 · .dp-yearnav:1310-1311 · .drum-picker:1818-1821 · .drum-sel:1824-1824 · .drum-wrap:1817-1823 · .econ-add:547-548 · .econ-ahorro:768-775 · .econ-annual:377-377 · .econ-avg:378-695 · .econ-bracket:530-536 · .econ-calc:678-679 · .econ-casc:682-689 · .econ-cascade:681-681 · .econ-chart:560-561 · .econ-comp:538-562 · .econ-decl:525-699 · .econ-distrib:1005-1019 · .econ-donut:786-801 · .econ-equiv:1000-1003 · .econ-fiscal:779-784 · .econ-formula:397-400 · .econ-gastos:701-713 · .econ-gear:497-498 · .econ-hdr:419-499 · .econ-ingresado:385-385 · .econ-irpf:715-777 · .econ-legend:563-564 · .econ-line:558-559 · .econ-month:402-415 · .econ-mr:997-998 · .econ-multi:989-999 · .econ-opt:674-677 · .econ-qcard:367-374 · .econ-qcell:363-1762 · .econ-qm:372-372 · .econ-qmonth:370-371 · .econ-quarter:359-1759 · .econ-rate:501-509 · .econ-row:386-396 · .econ-sc:540-1026 · .econ-scenario:539-539 · .econ-section:416-416 · .econ-sim:566-576 · .econ-stats:513-518 · .econ-sub:422-428 · .econ-tab:420-421 · .econ-toggle:520-523 · .econ-val:401-401 · .est-btn:433-437 · .est-card:443-445 · .est-detail:440-440 · .est-field:452-458 · .est-fields:451-451 · .est-group:431-435 · .est-modo:446-446 · .est-nav:430-430 · .est-section:439-439 · .est-tariff:441-450 · .ev-alarm:1443-2012 · .ev-ann:1363-1400 · .ev-annual:1141-1649 · .ev-badge:1675-1675 · .ev-badges:1594-1594 · .ev-bars:1569-1569 · .ev-barsize:1276-1285 · .ev-bright:1651-1662 · .ev-btn:1545-2097 · .ev-car:1609-1618 · .ev-cell:1102-1671 · .ev-char:1702-1702 · .ev-checkbox:1707-1707 · .ev-color:1206-1225 · .ev-colors:1703-1703 · .ev-date:1704-1704 · .ev-dates:1298-1300 · .ev-day:1597-1630 · .ev-daynote:1871-1871 · .ev-del:2152-2153 · .ev-detail:1227-1872 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1353-1717 · .ev-field:1696-1697 · .ev-filter:1402-1405 · .ev-form:1691-1712 · .ev-hdr:1413-1529 · .ev-input:1698-1699 · .ev-io:1360-1726 · .ev-kind:1864-1868 · .ev-list:1550-2151 · .ev-month:1558-1558 · .ev-multi:1583-1646 · .ev-note:1870-1870 · .ev-num:1673-1673 · .ev-otros:1274-1631 · .ev-puente:1638-1638 · .ev-quad:1348-1667 · .ev-repeat:1708-1708 · .ev-rut:1626-1629 · .ev-search:2142-2146 · .ev-sep:1156-1156 · .ev-shape:1286-1293 · .ev-sort:2147-2148 · .ev-textarea:1700-1701 · .ev-toggle:1705-1706 · .ev-type:1199-1207 · .ev-types:1553-1555 · .ev-up:1130-1143 · .ev-upcoming:1128-2004 · .ev-view:1530-1532 · .ev-wd:1710-1711 · .ev-week:1564-1636 · .ev-weekday:1709-1709 · .ev-wk:1163-2016 · .ev-zone:1534-1541 · .excl-item:346-511 · .excl-row:327-510 · .fiscal-add:667-830 · .fiscal-bracket:658-666 · .fiscal-compras:859-894 · .fiscal-copy:494-496 · .fiscal-custom:655-655 · .fiscal-ded:869-883 · .fiscal-desgrav:832-884 · .fiscal-despacho:896-917 · .fiscal-error:671-671 · .fiscal-gasto:803-865 · .fiscal-gastos:885-885 · .fiscal-hdr:815-815 · .fiscal-highlight:856-856 · .fiscal-onoff:898-899 · .fiscal-pct:656-665 · .fiscal-period:811-812 · .fiscal-radio:650-654 · .fiscal-save:669-670 · .fiscal-section:648-823 · .fiscal-sticky:820-820 · .fiscal-subsection:824-825 · .fiscal-tab:816-818 · .fiscal-viaje:826-827 · .fiscal-vinc:909-910 · .fiscal-year:490-493 · .full-overlay:249-250 · .hbar-lbl:1921-1921 · .hbar-row:1920-1920 · .hbar-rows:1919-1919 · .hbar-track:1922-1923 · .hbar-val:1924-1924 · .header:54-1804 · .header-brand:57-57 · .hip-add:987-987 · .hip-auto:938-938 · .hip-bar:924-931 · .hip-cancel:974-974 · .hip-cf:943-948 · .hip-edit:970-972 · .hip-g2:942-942 · .hip-grid:936-936 · .hip-period:976-985 · .hip-resumen:919-923 · .hip-ro:961-968 · .hip-save:973-973 · .hip-section:937-986 · .hip-stat:933-935 · .hip-stats:932-932 · .hip-sub:940-940 · .hip-vinc:939-939 · .hip-vr:950-959 · .home-popup:1485-1494 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:2156-2166 · .logo-gallery:1745-1752 · .logo-popup:1736-1743 · .macro-section:1496-1497 · .macro-url:1498-1500 · .mg-budget:477-486 · .mg-cat:487-487 · .mg-desgrav:488-488 · .mg-sort:483-483 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:348-348 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:349-349 · .nav-bar:1409-1808 · .nav-btn:62-63 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1408-1410 · .pdf-export:73-74 · .rate-input:356-2185 · .rate-label:355-355 · .rate-row:354-354 · .rate-suffix:357-357 · .rut-add:2124-2124 · .rut-card:2107-2122 · .rut-day:2115-2131 · .rut-days:2114-2129 · .rut-dot:2110-2110 · .rut-hist:2136-2139 · .rut-hora:2117-2117 · .rut-icon:2101-2105 · .rut-name:2111-2111 · .rut-pct:2123-2123 · .rut-prox:2118-2120 · .rut-sec:2106-2106 · .rut-stat:2133-2135 · .rut-sug:2125-2128 · .rut-susp:2132-2132 · .rut-tag:2112-2113 · .rut-vacio:2121-2121 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:578-582 · .sim-field:567-568 · .sim-hr:577-577 · .sim-period:574-574 · .sim-target:569-573 · .sub-block:603-604 · .sub-row:605-611 · .sw-upd:203-203 · .sy-back:255-2176 · .sy-body:274-2174 · .sy-card:285-2180 · .sy-cards3:277-277 · .sy-cards4:278-278 · .sy-chart:303-303 · .sy-hdr:260-260 · .sy-header:254-2175 · .sy-lbl:294-2179 · .sy-list:307-351 · .sy-month:321-321 · .sy-nav:264-1664 · .sy-note:304-306 · .sy-pdf:266-267 · .sy-puente:313-1427 · .sy-section:275-276 · .sy-spain:279-284 · .sy-sublbl:376-376 · .sy-suelto:318-320 · .sy-tab:1415-1418 · .sy-table:295-2181 · .sy-td:300-300 · .sy-tr:301-2182 · .sy-val:290-2178 · .sy-year:257-2177 · .toast:192-197 · .toast-undo:205-205 · .today-btn:64-65 · .vac-config:323-325 · .vip-no:1056-1057 · .week-actions:161-161 · .week-card:130-228 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

