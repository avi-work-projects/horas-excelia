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

### js/core.js  _(560 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:85 · THEME_STORAGE_KEY:88 · THEME:89 · THEME_LABELS:95 · THEME_META:96 · THEME_SEQUENCE:97 · ECON_YEAR_CONFIG:117 · MN_SHORT:119 · DN5:335

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · addLongPress:50 · start:54 · move:68 · end:71 · applyTheme:98 · cycleTheme:105 · updateThemeBtn:110 · load:124 · save:136 · loadEconYear:140 · saveEconYear:159 · fakeTrans:169 · simpleBarChart:186 · hBarRows:210 · shareOrDownload:227 · escHtml:247 · mkey:252 · getMonthH:253 · defH:259 · dayH:260 · dayT:261 · dk:262 · fd:263 · ad:264 · fh:265 · fhP:266 · isToday:267 · isPast:268 · wn:269 · weeks:272 · hasAnySentWeekInMonth:286 · getWD:293 · showToast:306 · sendEmail:324 · buildMailtoBody:334 · render:356 (!97) · fmtH:432 · openSheet:453 · closeSheet:472 · selectType:478 · togSent:506 · renderNavBar:509 · bindNavBar:532 · doNav:539

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

### js/events-picker-color.js  _(241 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:125 · evTravelColor:134 · getEvType:140 · isEvBarAlways:148 · getEvDisplayColor:150 · _renderColorPicker:170 · _bindColorPicker:193 · updatePreview:203

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!102) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events.js  _(3171 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:32 · EV_VIEW:33 · EV_EDIT:34 · EV_EDIT_DS:35 · EV_FORM_CONTAINER:36 · EV_EDIT_MODE:37 · EV_BRIGHT_PAST:38 · EV_ANNUAL_VIEW:39 · EV_ANNUAL_FILTER_HIDDEN:40 · EV_FILTER_GROUPS:48 · EV_FILTER_SHORT:52 · EV_FILTER_COLOR:54 · EV_FILTER_SEP_AFTER:57 · EV_PREV_VIEW:67 · EV_QUAD_YEAR:68 · EV_QUAD_MONTH:69 · EV_TO_SUBTAB:70 · EV_LIST_SUBTAB:71 · EV_TYPES_FILTER:72 · EV_TYPES_PAST:73 · EV_LIST_SORT:74 · EV_LIST_SEARCH:75 · EV_COLORS:76 · EVENTS:77 · EV_ALARM_SK:106 · EV_ALARMS_SET:107 · EV_NO_RUT:199 · EV_MARK_ORDER:342 · EV_MAX_DAY_EVENTS:380 · EV_CAL_BADGE_STACK:381 · EV_CAL_CORNER_STACK:384 · EV_CAL_VIP_MAX:386 · EV_UP_HIDE_RUT:388 · EV_UP_HIDE_BODA:389 · DN7:429 · EV_BAR_Z:910 · EV_MNS:932 · EV_CAR:1577 · EV_TRANSPORTES:1853 · EV_TRANS_LBL:1859 · EV_TRANS_EMOJI:1860

**Funciones:** _switchEvView:16 · evFilterGroup:58 · saveEvents:101 · loadEvAlarms:108 · saveEvAlarms:109 · _findBdayByEvId:110 · isEvAlarmSet:122 · setEvAlarmState:128 · evDk:135 · _evClampDate:144 · eventOccursOn:148 · getEventsOn:192 · evSignature:207 · evMergeIncoming:217 · evMergeMsg:241 · _fmtDayEs:253 · evDayLimitExceeded:254 · hasUpcomingEvent:284 · updateEventsBtn:293 · evUniqueColor:303 · evDefaultShape:314 · evMarkerHtml:320 · evMorePlusHtml:334 · evMarkPriority:343 · evBodaMinutes:350 · evSortMarks:361 · ev0:362 · evAnnualXsHtml:390 · vipStarSvgHtml:400 · evSoftFillColor:410 · renderEvCalMonth:418 (!143) · renderEvList:561 · renderEvByMonths:572 · renderEvListItem:591 · fd2:595 · openEvDeleteSheet:624 · closeEvDeleteSheet:659 · getNextOccurrence:666 · evIsoDate:708 · _isVipBdayTooFar:709 · evUpcomingMarkHtml:716 · renderEvUpcoming:726 (!185) · fd2:733 · renderEvItem:734 · renderEvPanel:784 · _evRowOcc:911 · _evAssignRow:912 · evBarZ:922 · _evAnnualCtx:935 · visible:936 · _evLoadPuentes:954 · _renderEvMonthCard:964 (!145) · renderEvAnnual:1109 · renderEvQuad:1118 · renderEvByTypes:1139 · coincide:1163 · renderEvMonthsView:1210 · renderEvWeek:1220 (!132) · hexA:1224 · renderEvContent:1352 (!153) · renderEvDetail:1505 · fd2:1508 · evDayCarItems:1578 · _evCarCard:1590 · _evCarRender:1623 · evCarGo:1637 · openEvDayCarousel:1643 · closeEvDayCarousel:1696 · _evScheduleRemove:1708 · _evCancelRemove:1715 · openEvDetail:1717 (!95) · closeEvDetail:1812 · evPuntualDays:1819 · _renderEvTypeSwatches:1827 · evStartTime:1862 · evEndTime:1868 · evTimeLabel:1875 · evTramos:1882 · evTramoTexto:1891 · evMinutosDe:1898 · renderEvForm:1907 (!188) · openEvForm:2095 · closeEvForm:2125 · bindEvFormEvents:2137 (!332) · _refreshShapePreviews:2153 · _refreshPickDatesLabel:2158 · _curKind:2177 · _applyTypeUI:2178 · _bindTypeSwatches:2197 · _viajeSync:2288 · renderEvAlarmPanel:2469 · fd2:2471 · openEvAlarm:2548 · closeEvAlarm:2563 · openBdayAlarmFromEvents:2572 · bindEvAlarmEvents:2584 (!111) · _syncPre:2622 · fmtD:2652 · openEvents:2695 · closeEvents:2705 · openEventsAt:2712 · refreshEvents:2719 · bindEvEvents:2735 (!422) · _scrollWeekToMonth:2743 · _scrollWeekToToday:2790 · doScroll:2800 · apply:3119 · _positionEvBright:3157

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(549 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:444 (!105)

### js/init.js  _(559 líneas)_
**Estado global:** DRUM_ITEM_H:147 · DN_ES:328

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:148 · updateDrumSelected:176 · getDrumValue:182 · checkDrumMinuteWrap:188 · buildAlarmDayBtns:219 · showAlarmPastConfirm:249 · proceed:303 · fmt:364 · _showUpdateBar:526

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(667 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:231 · RUT_WEEK_SEL:512

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:115 · rutById:122 · rutWeekKey:127 · rutWeekCfg:134 · rutSuspendedOn:142 · rutOccursOn:149 · rutIsSkipped:157 · rutToggleSkip:158 · rutFin:163 · rutEventsOn:171 · rutEventFromId:188 · rutSessions:197 · rutStats:211 · rutProximas:224 · renderRutinasBody:234 · _renderRutLista:245 · _rutFmt:299 · _rutFmtCorto:300 · _renderRutStats:306 · renderRutForm:367 · openRutForm:417 (!88) · _rutRepaintIcons:428 · closeRutForm:505 · openRutWeek:513 · _rutWeekRender:517 · closeRutWeek:585 · openRutSesion:592 · closeRutSesion:628 · bindRutinasEvents:635

### js/summary.js  _(616 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · openSummary:518 · closeSummary:527 · bindSummaryEvents:533 (!83)

## CSS

### css/styles.css  _(2208 líneas)_

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
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:322
- Vacaciones config:328
- Quitar festivos/vacaciones checkboxes:332
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
- Cabe el nombre entero, hasta en tres lineas:1049
- VIP controls bar:1055
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1066
- VIP edit mode item states:1069
- Feat 1: Buscador en lista por meses:1079
- Upcoming birthdays:1088
- Weekend frame — gris lavanda suave:1105
- Day types in events calendar — border-top + tinte de fondo:1110
- Events in puentes (summary) — one per line:1129
- Events upcoming view:1133
- Minicabecera de día dentro de un panel de Próximos:1135
- Marcador de la tarjeta de Proximos: la forma real del evento:1145
- Horas del evento y transporte de ida/vuelta:1150
- Vista semanal (Agenda):1175
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1183
- Grid del mes: col fecha (48px) + col eventos (1fr):1185
- Columna fecha (col 1):1187
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1196
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1202
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1206
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1212
- Event color type picker:1216
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1222
- Color picker avanzado (paleta 6×8 + color libre):1226
- Detail color picker toggle:1244
- Annual events calendar:1250
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1280
- Selector de formas en el formulario de evento (Otros):1291
- Selector de grosor de barra (grande | Otros):1293
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1308
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1312
- Inicio/Fin bloqueados cuando hay Selección Multidía:1315
- Mini-overlay para elegir días específicos (Otros):1320
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1347
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1351
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1353
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1355
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1357
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1363
- Calendario 4 meses: 2 columnas × 2 filas:1365
- Botón ir al calendario mensual en puentes del resumen:1367
- Pencil edit button in annual/quad controls:1379
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1380
- Feat 6: Puentes rallados en anual:1384
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1385
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1403
- Dropdown de vista anual:1410
- Linea que separa los chips de eventos grandes de los puntuales:1419
- Barras multi-día en vista mensual (fila propia encima de las celdas):1424
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1425
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1429
- Summary tabs — nivel 2:1432
- BRIDGE DAY CELLS in summary:1437
- VIP BIRTHDAYS:1446
- BIRTHDAY + EVENT ALARM PANEL:1449
- Campana de alarma en items de próximos (bday + eventos):1452
- 3-ZONE ALARM MARKER:1472
- ALARM MANAGEMENT OVERLAY:1485
- HOME POPUP (semanas pendientes / VIP sin alarma):1502
- MACRO URL EN MENÚ:1513
- Feat 4: Nav-bar emoji alignment:1519
- Birthday detail / form overlays:1535
- EVENTS:1545
- Zone A: upcoming/list views — subtle blue tint:1551
- Zone B: calendar grid views — subtle teal tint, active = green:1553
- Zone C: Puentes — pink; Vac/Festivos — orange+red gradient:1562
- Feat 2: Lista de Eventos subtabs:1567
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1584
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1586
- Contenedor de badges 1-día: centrado verticalmente en la celda:1609
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1616
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1620
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1626
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1638
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1643
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1656
- Perímetro puente: capa inferior a eventos:1658
- Bright past: bombilla override:1671
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1675
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1676
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1681
- Quad label 3 lines:1686
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1693
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1695
- Events list view:1697
- Event form overlay (inside eventsOverlay):1711
- Relleno, para que haga pareja con el naranja de "Editar evento":1741
- Event detail:1748
- LOGO POPUP:1756
- Gallery:1765
- BD ALARM VIP TOGGLE:1774
- RESPONSIVE (mobile header):1777
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1779
- ALARM PANEL:1832
- Drum picker (selector giratorio de hora/minuto):1837
- Confirmación alarma en el pasado:1857
- Botón flotante "Listo" en modo Editar VIPs:1869
- Controles inline long-press cumpleaños:1872
- Selector de clase en el formulario:1884
- Notas: general vs de un dia concreto:1890
- Pestana Bodas y pestana partida Vacaciones/Festivos:1894
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1899
- Pestana Bodas:1905
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1913
- Filas del panel de un aviso:1927
- Estadisticas:1931
- Barras horizontales de reparto (componente generico: hBarRows):1939
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1949
- Dia cerrado: no admite mas clases:1966
- Fila con cambios sin guardar:1971
- Barra de guardado, siempre visible al fondo de la lista:1974
- Filtros de Parejas como chips pulsables:1984
- Sala sin asignar: se marca en naranja para que cante en la lista:2019
- Nota propia del dia en la lista de Proximos:2022
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2024
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2026
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2034
- Los tres botones del detalle de pareja comparten aspecto:2048
- Subpestana Calendario de bodas:2084
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2098
- Dia resaltado al pulsar una pareja en la leyenda:2105
- Rutinas semanales:2114
- Selector de icono de rutina:2121
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2161
- Diálogo: modo de importación (añadir vs reemplazar):2176
- PRINT:2189

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:469-471 · .ah-donut:479-481 · .ah-section:466-468 · .ah-total:476-478 · .ah-vs:472-475 · .alarm-cfg:1833-1833 · .alarm-colon:1836-1836 · .alarm-create:1848-1849 · .alarm-day:1854-1856 · .alarm-days:1851-1853 · .alarm-delete:1498-1499 · .alarm-ics:1850-1850 · .alarm-item:1492-1497 · .alarm-macro:1863-1868 · .alarm-msg:1846-1847 · .alarm-panel:1834-1834 · .alarm-past:1858-1862 · .alarm-time:1835-1835 · .alarms-empty:1500-1501 · .alarms-mgmt:1486-1486 · .alarms-section:1487-1488 · .alarms-sub:1489-1491 · .analisis-card:618-620 · .analisis-cards:607-607 · .analisis-hbar:621-626 · .analisis-input:636-639 · .analisis-ins:645-650 · .analisis-insurance:644-644 · .analisis-mortgage:627-643 · .app-logo:58-58 · .app-version:126-126 · .bd-alarm:1450-1776 · .bd-detail:1536-1543 · .bday-add:1103-1104 · .bday-badge:1050-1052 · .bday-cancel:1067-1068 · .bday-cell:1043-1107 · .bday-hdr:1036-1430 · .bday-ic:1874-1878 · .bday-inline:1873-1873 · .bday-io:1083-1087 · .bday-list:1054-1078 · .bday-listo:1870-1870 · .bday-month:1053-1053 · .bday-num:1048-1048 · .bday-search:1080-1082 · .bday-upcoming:1089-1448 · .bday-view:1037-1039 · .bday-vip:1056-1447 · .bday-week:1040-1042 · .boda-actions:2040-2040 · .boda-add:2042-2042 · .boda-asg:2061-2083 · .boda-cal:2085-2108 · .boda-card:1990-2000 · .boda-chip:1986-1988 · .boda-chips:1985-1985 · .boda-class:1972-2014 · .boda-controls:1956-1956 · .boda-couple:2012-2012 · .boda-cpk:2055-2060 · .boda-date:2041-2041 · .boda-day:1967-2006 · .boda-det:2047-2054 · .boda-dot:1994-1994 · .boda-falta:2001-2001 · .boda-filters:1959-1959 · .boda-fsel:1960-1963 · .boda-ftoggles:1964-1965 · .boda-inp:2010-2010 · .boda-iss:1928-1930 · .boda-issue:1915-1926 · .boda-issues:1914-1914 · .boda-legend:2043-2046 · .boda-mini:2038-2039 · .boda-mode:1946-1948 · .boda-name:1995-1995 · .boda-ok:2002-2002 · .boda-place:2013-2021 · .boda-prog:1997-1998 · .boda-ro:2015-2020 · .boda-save:1982-1983 · .boda-savebar:1978-1981 · .boda-sec:1912-1912 · .boda-sobra:2003-2003 · .boda-stat:1933-1938 · .boda-stats:1932-1932 · .boda-sticky:1908-1910 · .boda-sum:1952-1955 · .boda-summary:1951-1951 · .boda-time:2011-2011 · .boda-tp:2109-2112 · .boda-wed:1996-1996 · .bottom-sheet:172-173 · .btn-icon:99-1822 · .build-badge:217-217 · .build-dot:218-218 · .csv-export:71-72 · .data-actions:95-1824 · .data-btn:96-1820 · .data-menu:120-125 · .day-cell:140-246 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:69-77 · .dp-actions:1343-1344 · .dp-counter:1330-1331 · .dp-day:1338-1342 · .dp-days:1337-1337 · .dp-grid:1332-1332 · .dp-handle:1325-1325 · .dp-hdr:1326-1326 · .dp-mhdr:1335-1336 · .dp-mname:1334-1334 · .dp-month:1333-1333 · .dp-overlay:1321-1324 · .dp-sheet:1323-1323 · .dp-title:1327-1327 · .dp-yearnav:1328-1329 · .drum-picker:1839-1842 · .drum-sel:1845-1845 · .drum-wrap:1838-1844 · .econ-add:553-554 · .econ-ahorro:774-781 · .econ-annual:383-383 · .econ-avg:384-701 · .econ-bracket:536-542 · .econ-calc:684-685 · .econ-casc:688-695 · .econ-cascade:687-687 · .econ-chart:566-567 · .econ-comp:544-568 · .econ-decl:531-705 · .econ-distrib:1011-1025 · .econ-donut:792-807 · .econ-equiv:1006-1009 · .econ-fiscal:785-790 · .econ-formula:403-406 · .econ-gastos:707-719 · .econ-gear:503-504 · .econ-hdr:425-505 · .econ-ingresado:391-391 · .econ-irpf:721-783 · .econ-legend:569-570 · .econ-line:564-565 · .econ-month:408-421 · .econ-mr:1003-1004 · .econ-multi:995-1005 · .econ-opt:680-683 · .econ-qcard:373-380 · .econ-qcell:369-1783 · .econ-qm:378-378 · .econ-qmonth:376-377 · .econ-quarter:365-1780 · .econ-rate:507-515 · .econ-row:392-402 · .econ-sc:546-1032 · .econ-scenario:545-545 · .econ-section:422-422 · .econ-sim:572-582 · .econ-stats:519-524 · .econ-sub:428-434 · .econ-tab:426-427 · .econ-toggle:526-529 · .econ-val:407-407 · .est-btn:439-443 · .est-card:449-451 · .est-detail:446-446 · .est-field:458-464 · .est-fields:457-457 · .est-group:437-441 · .est-modo:452-452 · .est-nav:436-436 · .est-section:445-445 · .est-tariff:447-456 · .ev-alarm:1461-2033 · .ev-ann:1381-1640 · .ev-annual:1147-1670 · .ev-badge:1696-1696 · .ev-badges:1612-1612 · .ev-bars:1587-1587 · .ev-barsize:1294-1303 · .ev-bright:1672-1683 · .ev-btn:1563-2118 · .ev-car:1627-1636 · .ev-cell:1108-1692 · .ev-char:1723-1723 · .ev-checkbox:1728-1728 · .ev-color:1224-1243 · .ev-colors:1724-1724 · .ev-date:1725-1725 · .ev-dates:1316-1318 · .ev-day:1615-1651 · .ev-daynote:1892-1892 · .ev-del:2173-2174 · .ev-detail:1245-1893 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1371-1738 · .ev-field:1717-1718 · .ev-filter:1420-1423 · .ev-form:1712-1733 · .ev-hdr:1431-1547 · .ev-hora:1151-1151 · .ev-input:1719-1720 · .ev-io:1378-1747 · .ev-kind:1885-1889 · .ev-list:1568-2172 · .ev-month:1576-1576 · .ev-multi:1601-1667 · .ev-note:1891-1891 · .ev-num:1694-1694 · .ev-otros:1292-1652 · .ev-puente:1659-1659 · .ev-quad:1366-1688 · .ev-repeat:1729-1729 · .ev-rut:1647-1650 · .ev-search:2163-2167 · .ev-sep:1174-1174 · .ev-shape:1304-1311 · .ev-sort:2168-2169 · .ev-textarea:1721-1722 · .ev-toggle:1726-1727 · .ev-type:1217-1225 · .ev-types:1571-1573 · .ev-up:1136-1149 · .ev-upcoming:327-2025 · .ev-viaje:1152-1160 · .ev-view:1548-1550 · .ev-wd:1731-1732 · .ev-week:323-1657 · .ev-weekday:1730-1730 · .ev-wk:1161-2037 · .ev-zone:1552-1559 · .excl-item:352-517 · .excl-row:333-516 · .fiscal-add:673-836 · .fiscal-bracket:664-672 · .fiscal-compras:865-900 · .fiscal-copy:500-502 · .fiscal-custom:661-661 · .fiscal-ded:875-889 · .fiscal-desgrav:838-890 · .fiscal-despacho:902-923 · .fiscal-error:677-677 · .fiscal-gasto:809-871 · .fiscal-gastos:891-891 · .fiscal-hdr:821-821 · .fiscal-highlight:862-862 · .fiscal-onoff:904-905 · .fiscal-pct:662-671 · .fiscal-period:817-818 · .fiscal-radio:656-660 · .fiscal-save:675-676 · .fiscal-section:654-829 · .fiscal-sticky:826-826 · .fiscal-subsection:830-831 · .fiscal-tab:822-824 · .fiscal-viaje:832-833 · .fiscal-vinc:915-916 · .fiscal-year:496-499 · .full-overlay:249-250 · .hbar-lbl:1942-1942 · .hbar-row:1941-1941 · .hbar-rows:1940-1940 · .hbar-track:1943-1944 · .hbar-val:1945-1945 · .header:54-1825 · .header-brand:57-57 · .hip-add:993-993 · .hip-auto:944-944 · .hip-bar:930-937 · .hip-cancel:980-980 · .hip-cf:949-954 · .hip-edit:976-978 · .hip-g2:948-948 · .hip-grid:942-942 · .hip-period:982-991 · .hip-resumen:925-929 · .hip-ro:967-974 · .hip-save:979-979 · .hip-section:943-992 · .hip-stat:939-941 · .hip-stats:938-938 · .hip-sub:946-946 · .hip-vinc:945-945 · .hip-vr:956-965 · .home-popup:1503-1512 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:2177-2187 · .logo-gallery:1766-1773 · .logo-popup:1757-1764 · .macro-section:1514-1515 · .macro-url:1516-1518 · .mg-budget:483-492 · .mg-cat:493-493 · .mg-desgrav:494-494 · .mg-sort:489-489 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:354-354 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:355-355 · .nav-bar:1427-1829 · .nav-btn:62-63 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1426-1428 · .pdf-export:73-74 · .rate-input:362-2206 · .rate-label:361-361 · .rate-row:360-360 · .rate-suffix:363-363 · .rut-add:2145-2145 · .rut-card:2128-2143 · .rut-day:2136-2152 · .rut-days:2135-2150 · .rut-dot:2131-2131 · .rut-hist:2157-2160 · .rut-hora:2138-2138 · .rut-icon:2122-2126 · .rut-name:2132-2132 · .rut-pct:2144-2144 · .rut-prox:2139-2141 · .rut-sec:2127-2127 · .rut-stat:2154-2156 · .rut-sug:2146-2149 · .rut-susp:2153-2153 · .rut-tag:2133-2134 · .rut-vacio:2142-2142 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:584-588 · .sim-field:573-574 · .sim-hr:583-583 · .sim-period:580-580 · .sim-target:575-579 · .sub-block:609-610 · .sub-row:611-617 · .sw-upd:203-203 · .sy-back:255-2197 · .sy-body:274-2195 · .sy-card:285-2201 · .sy-cards3:277-277 · .sy-cards4:278-278 · .sy-chart:303-303 · .sy-hdr:260-260 · .sy-header:254-2196 · .sy-lbl:294-2200 · .sy-list:307-357 · .sy-month:321-321 · .sy-nav:264-1685 · .sy-note:304-306 · .sy-pdf:266-267 · .sy-puente:313-1445 · .sy-section:275-276 · .sy-spain:279-284 · .sy-sublbl:382-382 · .sy-suelto:318-320 · .sy-tab:1433-1436 · .sy-table:295-2202 · .sy-td:300-300 · .sy-tr:301-2203 · .sy-val:290-2199 · .sy-year:257-2198 · .toast:192-197 · .toast-undo:205-205 · .today-btn:64-65 · .vac-config:329-331 · .vip-no:1062-1063 · .week-actions:161-161 · .week-card:130-228 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

