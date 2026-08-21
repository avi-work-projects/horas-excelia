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

### js/bodas.js  _(1441 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_NONE:30 · BODA_PLACE_SHORT:31 · BODA_PLACES:32 · BODA_PLACE_EMOJI:34 · BODA_WHITE:51 · BODA_SLOTS:52 · BODA_NO_TIME_COLOR:58 · BODA_NO_COUPLE_COLOR:59 · BODA_DEFAULT_TIME:60 · BODA_PALETTE:63 · BODA_CLOSED_SK:211 · BODA_CLOSED:212 · BODA_PENDING:227 · BODA_SUBTAB:268 · BODA_CLASS_MODE:269 · BODA_FILTER_COUPLE:270 · BODA_HIDE_PAST:271 · BODA_HIDE_CLOSED:272 · BODA_CARD_OPEN:273 · BODA_PAREJAS_SEARCH:274 · BODA_PAREJAS_SORT:277 · BODA_PAREJAS_FILTER:278 · BODA_CAL_HL:279 · BODA_CAL_YEAR:280 · BODA_CAL_MONTH:281 · MN2:296 · DN2:795 · BODA_ASSIGN:842 · BODA_TIME_H:1090

**Funciones:** saveBodas:18 · bodaPlaceEmoji:35 · bodaPlaceOf:39 · bodaPlaceLabel:44 · bodaNextColor:65 · bodaCouple:73 · bodaSlot:77 · bodaSlotColors:87 · bodaSlotColor:91 · bodaMarkFor:93 · evBodaSvg:99 · bodaClasses:116 · bodaClassesOfCouple:119 · bodaFreeClasses:122 · bodaSortClasses:125 · bodaClassesOnDay:132 · bodaNewClass:135 · bodaNormalizeClasses:150 · bodaPlaceForNewOn:185 · bodaDayFull:190 · bodaBulkCreate:195 · bodaProgress:205 · saveBodaClosed:216 · bodaIsClosed:217 · bodaToggleClosed:218 · bodaPendingCount:228 · bodaEff:230 · bodaSetPending:238 · bodaPendingApply:242 · bodaPendingDiscard:265 · _bodaLegendHtml:284 · _renderBodaCalendario:295 (!85) · _bodaFirstWord:380 · renderBodasBody:383 · _renderBodaParejas:410 · _bodaFmt:487 · _bodaFmtCorto:488 · _renderBodaClases:495 (!98) · bodaOpenSheet:593 · bodaCloseSheet:609 · bodaCreatedAt:619 · bodaIssues:624 · _renderBodaIssueCards:640 · card:643 · openBodaIssue:664 (!81) · findEv:706 · closeBodaIssue:745 · _bodaWeekKey:748 · _renderBodaStats:755 (!88) · openBodaAssign:843 · closeBodaAssign:863 · renderBodaAssign:867 (!81) · bindBodaAssign:948 · openBodaPlacePicker:1017 · closeBodaPlacePicker:1043 · openBodaCouplePicker:1046 · row:1056 · apply:1073 · closeBodaCouplePicker:1087 · openBodaTimePicker:1093 · drum:1098 · setDrum:1121 · mark:1126 · drumVal:1130 · readManual:1151 · closeBodaTimePicker:1171 · renderBodaCoupleForm:1174 · openBodaCoupleForm:1198 · closeBodaCoupleForm:1241 · bodaRefreshRow:1249 · bindBodasEvents:1275 (!166) · _guardaPendientes:1277 · _bodaCalMove:1293 · findClass:1375

### js/core.js  _(605 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:133 · MN_SHORT:135 · DN5:351

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:140 · save:152 · loadEconYear:156 · saveEconYear:175 · fakeTrans:185 · simpleBarChart:202 · hBarRows:226 · shareOrDownload:243 · escHtml:263 · mkey:268 · getMonthH:269 · defH:275 · dayH:276 · dayT:277 · dk:278 · fd:279 · ad:280 · fh:281 · fhP:282 · isToday:283 · isPast:284 · wn:285 · weeks:288 · hasAnySentWeekInMonth:302 · getWD:309 · showToast:322 · sendEmail:340 · buildMailtoBody:350 · render:372 (!97) · fmtH:448 · openSheet:469 · closeSheet:488 · selectType:494 · contarVacaciones:526 · confirmarCupoVacaciones:539 · togSent:551 · renderNavBar:554 · bindNavBar:577 · doNav:584

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

### js/events.js  _(3252 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:32 · EV_VIEW:33 · EV_EDIT:34 · EV_EDIT_DS:35 · EV_FORM_CONTAINER:36 · EV_EDIT_MODE:37 · EV_BRIGHT_PAST:38 · EV_ANNUAL_VIEW:39 · EV_ANNUAL_FILTER_HIDDEN:40 · EV_FILTER_GROUPS:48 · EV_FILTER_SHORT:54 · EV_FILTER_COLOR:56 · EV_FILTER_SEP_AFTER:59 · EV_PREV_VIEW:69 · EV_QUAD_YEAR:70 · EV_QUAD_MONTH:71 · EV_TO_SUBTAB:72 · EV_LIST_SUBTAB:73 · EV_TYPES_FILTER:74 · EV_TYPES_PAST:75 · EV_LIST_SORT:76 · EV_LIST_SEARCH:77 · EV_COLORS:78 · EVENTS:79 · EV_ALARM_SK:108 · EV_ALARMS_SET:109 · EV_NO_RUT:201 · EV_MARK_ORDER:344 · EV_MAX_DAY_EVENTS:382 · EV_CAL_BADGE_STACK:383 · EV_CAL_CORNER_STACK:386 · EV_CAL_VIP_MAX:388 · EV_UP_SHOW_RUT:390 · EV_UP_SHOW_BODA:391 · DN7:431 · EV_BAR_Z:915 · EV_MNS:974 · EV_CAR:1677 · EV_TRANSPORTES:1934 · EV_TRANS_LBL:1940 · EV_TRANS_EMOJI:1941

**Funciones:** _switchEvView:16 · evFilterGroup:60 · saveEvents:103 · loadEvAlarms:110 · saveEvAlarms:111 · _findBdayByEvId:112 · isEvAlarmSet:124 · setEvAlarmState:130 · evDk:137 · _evClampDate:146 · eventOccursOn:150 · getEventsOn:194 · evSignature:209 · evMergeIncoming:219 · evMergeMsg:243 · _fmtDayEs:255 · evDayLimitExceeded:256 · hasUpcomingEvent:286 · updateEventsBtn:295 · evUniqueColor:305 · evDefaultShape:316 · evMarkerHtml:322 · evMorePlusHtml:336 · evMarkPriority:345 · evBodaMinutes:352 · evSortMarks:363 · ev0:364 · evAnnualXsHtml:392 · vipStarSvgHtml:402 · evSoftFillColor:412 · renderEvCalMonth:420 (!146) · renderEvList:566 · renderEvByMonths:577 · renderEvListItem:596 · fd2:600 · openEvDeleteSheet:629 · closeEvDeleteSheet:664 · getNextOccurrence:671 · evIsoDate:713 · _isVipBdayTooFar:714 · evUpcomingMarkHtml:721 · renderEvUpcoming:731 (!185) · fd2:738 · renderEvItem:739 · renderEvPanel:789 · _evRowOcc:916 · _evSoloSeRozan:922 · _evAssignRow:928 · _evMarcarMitades:942 · _evMitadesStyle:957 · evBarZ:964 · _evAnnualCtx:977 · visible:978 · _evLoadPuentes:996 · _renderEvMonthCard:1006 (!146) · renderEvAnnual:1152 · renderEvQuad:1161 · renderEvByTypes:1182 · coincide:1208 · renderEvMonthsView:1254 · renderEvWeek:1264 (!132) · hexA:1268 · renderEvContent:1396 (!158) · _bodaMasUnaHora:1554 · renderEvDetail:1559 (!119) · fd2:1562 · _fila:1638 · evDayCarItems:1678 · evCarGo:1690 · _evCarShow:1697 · openEvDayCarousel:1704 · closeEvDayCarousel:1711 · _evScheduleRemove:1722 · _evCancelRemove:1729 · openEvDetail:1731 (!162) · closeEvDetail:1893 · evPuntualDays:1900 · _renderEvTypeSwatches:1908 · evStartTime:1943 · evEndTime:1949 · evTimeLabel:1956 · evTramos:1963 · evTramoTexto:1972 · evMinutosDe:1979 · renderEvForm:1988 (!188) · openEvForm:2176 · closeEvForm:2206 · bindEvFormEvents:2218 (!332) · _refreshShapePreviews:2234 · _refreshPickDatesLabel:2239 · _curKind:2258 · _applyTypeUI:2259 · _bindTypeSwatches:2278 · _viajeSync:2369 · renderEvAlarmPanel:2550 · fd2:2552 · openEvAlarm:2629 · closeEvAlarm:2644 · openBdayAlarmFromEvents:2653 · bindEvAlarmEvents:2665 (!111) · _syncPre:2703 · fmtD:2733 · openEvents:2776 · closeEvents:2786 · openEventsAt:2793 · refreshEvents:2800 · bindEvEvents:2816 (!422) · _scrollWeekToMonth:2824 · _scrollWeekToToday:2871 · doScroll:2881 · apply:3200 · _positionEvBright:3238

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(549 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:444 (!105)

### js/init.js  _(559 líneas)_
**Estado global:** DRUM_ITEM_H:147 · DN_ES:328

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:148 · updateDrumSelected:176 · getDrumValue:182 · checkDrumMinuteWrap:188 · buildAlarmDayBtns:219 · showAlarmPastConfirm:249 · proceed:303 · fmt:364 · _showUpdateBar:526

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(805 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:246 · RUT_WEEK_SEL:585 · RUT_WEEK_CAL:586

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:115 · rutById:122 · rutWeekKey:127 · rutTimeOfDay:136 · rutTieneHorarios:141 · rutWeekCfg:148 · rutSuspendedOn:157 · rutOccursOn:164 · rutIsSkipped:172 · rutToggleSkip:173 · rutFin:178 · rutEventsOn:186 · rutEventFromId:203 · rutSessions:212 · rutStats:226 · rutProximas:239 · renderRutinasBody:249 · _renderRutLista:260 · _rutFmt:318 · _rutFmtCorto:319 · _renderRutStats:325 · renderRutForm:386 · openRutForm:446 (!130) · _rutRepaintIcons:458 · _rutPintaHoras:484 · closeRutForm:576 · openRutWeek:587 · _rutWeekPick:596 · _rutWeekRender:655 · closeRutWeek:723 · openRutSesion:730 · closeRutSesion:766 · bindRutinasEvents:773

### js/summary.js  _(616 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · openSummary:518 · closeSummary:527 · bindSummaryEvents:533 (!83)

## CSS

### css/styles.css  _(2256 líneas)_

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
- Month summary breakdown:354
- Ausencia list tag:357
- ECONOMICS:360
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:365
- Summary sublabel (hours breakdown):382
- Ingresado box (formerly cobrado) — neutral:391
- ECONOMICS v2: tabs + nuevas secciones:425
- Estudio Cambio — grouped nav:436
- Estudio — tariff comparison cards:445
- Análisis hipoteca — secciones organizadas:466
- Mis gastos — budget table:483
- Year selector for per-year fiscal tabs:496
- §1.1 Tarifa dual:507
- §1.3 Stats por hora/día:519
- §1.4 Toggles:526
- §1.5 Declaración IRPF:531
- Tab 2: Comparador:544
- Calcular Tarifa (sim):572
- Scenario zones (Comparar Escenarios):590
- Análisis Ec. Personal:607
- Bloques de la Subrogación:609
- Fiscal config modal — purple theme override:652
- Fiscal config modal:654
- ECONOMICS v3: opt-buttons, cascade, gastos:680
- Cascade ingresos/gastos:687
- Media mensual: cards:697
- Tab 4: Análisis:707
- IRPF Breakdown visual:721
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:748
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):750
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):774
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:783
- Resumen fiscal al final de Ingresos y Gastos:785
- Donut chart:792
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):802
- Fiscal config: gastos items:809
- Fiscal: tab bar:821
- Fiscal: sticky save:826
- Fiscal: section title income/expense colors:828
- Fiscal: desgravaciones:838
- Fiscal: compras profesionales:865
- Desgravaciones: notas + tabla despacho info:873
- Nota IVA compras:893
- IVA por item en compras:895
- Fiscal: despacho en casa:902
- Hipoteca — resumen visual:925
- Hipoteca — compact 2-col grid:948
- Hipoteca — compact vinculaciones:956
- Hipoteca — read-only fields:967
- Hipoteca — edit/detail buttons:976
- Hipoteca — period summary card:982
- Multi-rate period cards:995
- Distribución de ingresos:1011
- Comparador: reorder buttons:1027
- Rate input styled:1031
- BIRTHDAYS:1035
- Cabe el nombre entero, hasta en tres lineas:1052
- VIP controls bar:1058
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1069
- VIP edit mode item states:1072
- Feat 1: Buscador en lista por meses:1082
- Upcoming birthdays:1091
- Weekend frame — gris lavanda suave:1108
- Day types in events calendar — border-top + tinte de fondo:1113
- Events in puentes (summary) — one per line:1132
- Events upcoming view:1136
- Minicabecera de día dentro de un panel de Próximos:1138
- Marcador de la tarjeta de Proximos: la forma real del evento:1148
- Horas del evento y transporte de ida/vuelta:1153
- Vista semanal (Agenda):1178
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1186
- Grid del mes: col fecha (48px) + col eventos (1fr):1188
- Columna fecha (col 1):1190
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1199
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1205
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1209
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1215
- Event color type picker:1219
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1225
- Color picker avanzado (paleta 6×8 + color libre):1229
- Detail color picker toggle:1247
- Annual events calendar:1253
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1283
- Selector de formas en el formulario de evento (Otros):1294
- Selector de grosor de barra (grande | Otros):1296
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1311
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1315
- Inicio/Fin bloqueados cuando hay Selección Multidía:1318
- Mini-overlay para elegir días específicos (Otros):1323
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1350
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1354
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1356
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1358
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1360
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1366
- Calendario 4 meses: 2 columnas × 2 filas:1368
- Botón ir al calendario mensual en puentes del resumen:1370
- Pencil edit button in annual/quad controls:1382
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1383
- Feat 6: Puentes rallados en anual:1387
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1388
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1406
- Dropdown de vista anual:1413
- Linea que separa los chips de eventos grandes de los puntuales:1422
- Barras multi-día en vista mensual (fila propia encima de las celdas):1431
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1432
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1436
- Summary tabs — nivel 2:1439
- BRIDGE DAY CELLS in summary:1444
- VIP BIRTHDAYS:1453
- BIRTHDAY + EVENT ALARM PANEL:1456
- Campana de alarma en items de próximos (bday + eventos):1459
- 3-ZONE ALARM MARKER:1479
- ALARM MANAGEMENT OVERLAY:1492
- HOME POPUP (semanas pendientes / VIP sin alarma):1509
- MACRO URL EN MENÚ:1520
- Feat 4: Nav-bar emoji alignment:1526
- Birthday detail / form overlays:1542
- EVENTS:1552
- Zone A: upcoming/list views — subtle blue tint:1558
- Zone B: calendar grid views — subtle teal tint, active = green:1560
- Feat 2: Lista de Eventos subtabs:1569
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1586
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1588
- Contenedor de badges 1-día: centrado verticalmente en la celda:1611
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1618
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1622
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1628
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1640
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1645
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1662
- Perímetro puente: capa inferior a eventos:1664
- Bright past: bombilla override:1677
- Bombilla redonda (simétrica al lápiz) en la fila de la vista anual/cuad:1681
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1682
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1687
- Quad label 3 lines:1692
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1699
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1701
- Events list view:1703
- Event form overlay (inside eventsOverlay):1717
- Relleno, para que haga pareja con el naranja de "Editar evento":1747
- Event detail:1754
- LOGO POPUP:1762
- Gallery:1771
- BD ALARM VIP TOGGLE:1780
- RESPONSIVE (mobile header):1783
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1785
- ALARM PANEL:1838
- Drum picker (selector giratorio de hora/minuto):1843
- Confirmación alarma en el pasado:1863
- Botón flotante "Listo" en modo Editar VIPs:1875
- Controles inline long-press cumpleaños:1878
- Selector de clase en el formulario:1890
- Notas: general vs de un dia concreto:1896
- Pestana Bodas y pestana partida Vacaciones/Festivos:1900
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1905
- Pestana Bodas:1911
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1919
- Filas del panel de un aviso:1933
- Estadisticas:1937
- Barras horizontales de reparto (componente generico: hBarRows):1945
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1955
- Dia cerrado: no admite mas clases:1972
- Fila con cambios sin guardar:1977
- Barra de guardado, siempre visible al fondo de la lista:1980
- Filtros de Parejas como chips pulsables:1990
- Sala sin asignar: se marca en naranja para que cante en la lista:2025
- Nota propia del dia en la lista de Proximos:2028
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2030
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2032
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2040
- Los tres botones del detalle de pareja comparten aspecto:2054
- Subpestana Calendario de bodas:2091
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2105
- Dia resaltado al pulsar una pareja en la leyenda:2112
- Rutinas semanales:2121
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2140
- Ficha de una clase: tres filas fijas (hora, sala y pareja):2143
- Los tres botones de la pareja, en una sola linea:2154
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2159
- Horario distinto segun el dia:2163
- Selector de icono de rutina:2169
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2209
- Diálogo: modo de importación (añadir vs reemplazar):2224
- PRINT:2237

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:470-472 · .ah-donut:480-482 · .ah-section:467-469 · .ah-total:477-479 · .ah-vs:473-476 · .alarm-cfg:1839-1839 · .alarm-colon:1842-1842 · .alarm-create:1854-1855 · .alarm-day:1860-1862 · .alarm-days:1857-1859 · .alarm-delete:1505-1506 · .alarm-ics:1856-1856 · .alarm-item:1499-1504 · .alarm-macro:1869-1874 · .alarm-msg:1852-1853 · .alarm-panel:1840-1840 · .alarm-past:1864-1868 · .alarm-time:1841-1841 · .alarms-empty:1507-1508 · .alarms-mgmt:1493-1493 · .alarms-section:1494-1495 · .alarms-sub:1496-1498 · .analisis-card:619-621 · .analisis-cards:608-608 · .analisis-hbar:622-627 · .analisis-input:637-640 · .analisis-ins:646-651 · .analisis-insurance:645-645 · .analisis-mortgage:628-644 · .app-logo:58-58 · .app-version:126-126 · .bd-alarm:1457-1782 · .bd-detail:1543-1550 · .bday-add:1106-1107 · .bday-badge:1053-1055 · .bday-cancel:1070-1071 · .bday-cell:1046-1110 · .bday-hdr:1037-1437 · .bday-ic:1880-1884 · .bday-inline:1879-1879 · .bday-io:1086-1090 · .bday-list:1057-1081 · .bday-listo:1876-1876 · .bday-month:1056-1056 · .bday-num:1051-1051 · .bday-search:1083-1085 · .bday-upcoming:1092-1455 · .bday-view:1038-1040 · .bday-vip:1059-1454 · .bday-week:1041-1043 · .boda-actions:2046-2046 · .boda-add:2048-2048 · .boda-asg:2068-2090 · .boda-cal:2092-2115 · .boda-card:1996-2162 · .boda-chip:1992-1994 · .boda-chips:1991-1991 · .boda-class:1978-2020 · .boda-controls:1962-1962 · .boda-couple:2018-2018 · .boda-cpk:2062-2067 · .boda-date:2047-2047 · .boda-day:1973-2012 · .boda-det:2053-2156 · .boda-dot:2000-2000 · .boda-falta:2007-2007 · .boda-filters:1965-1965 · .boda-fsel:1966-1969 · .boda-ftoggles:1970-1971 · .boda-inp:2016-2016 · .boda-iss:1934-1936 · .boda-issue:1921-1932 · .boda-issues:1920-1920 · .boda-legend:2049-2052 · .boda-mini:2044-2045 · .boda-mode:1952-1954 · .boda-name:2001-2001 · .boda-ok:2008-2008 · .boda-place:2019-2027 · .boda-prog:2003-2004 · .boda-ro:2021-2026 · .boda-save:1988-1989 · .boda-savebar:1984-1987 · .boda-search:2157-2157 · .boda-sec:1918-1918 · .boda-sobra:2009-2009 · .boda-sort:2158-2158 · .boda-stat:1939-1944 · .boda-stats:1938-1938 · .boda-sticky:1914-1916 · .boda-sum:1958-1961 · .boda-summary:1957-1957 · .boda-time:2017-2017 · .boda-tp:2116-2119 · .boda-wed:2002-2002 · .bottom-sheet:172-173 · .btn-icon:99-1828 · .build-badge:217-217 · .build-dot:218-218 · .csv-export:71-72 · .data-actions:95-1830 · .data-btn:96-1826 · .data-menu:120-125 · .day-cell:140-246 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:69-77 · .dp-actions:1346-1347 · .dp-counter:1333-1334 · .dp-day:1341-1345 · .dp-days:1340-1340 · .dp-grid:1335-1335 · .dp-handle:1328-1328 · .dp-hdr:1329-1329 · .dp-mhdr:1338-1339 · .dp-mname:1337-1337 · .dp-month:1336-1336 · .dp-overlay:1324-1327 · .dp-sheet:1326-1326 · .dp-title:1330-1330 · .dp-yearnav:1331-1332 · .drum-picker:1845-1848 · .drum-sel:1851-1851 · .drum-wrap:1844-1850 · .econ-add:554-555 · .econ-ahorro:775-782 · .econ-annual:384-384 · .econ-avg:385-702 · .econ-bracket:537-543 · .econ-calc:685-686 · .econ-casc:689-696 · .econ-cascade:688-688 · .econ-chart:567-568 · .econ-comp:545-569 · .econ-decl:532-706 · .econ-distrib:1012-1026 · .econ-donut:793-808 · .econ-equiv:1007-1010 · .econ-fiscal:786-791 · .econ-formula:404-407 · .econ-gastos:708-720 · .econ-gear:504-505 · .econ-hdr:426-506 · .econ-ingresado:392-392 · .econ-irpf:722-784 · .econ-legend:570-571 · .econ-line:565-566 · .econ-month:409-422 · .econ-mr:1004-1005 · .econ-multi:996-1006 · .econ-opt:681-684 · .econ-qcard:374-381 · .econ-qcell:370-1789 · .econ-qm:379-379 · .econ-qmonth:377-378 · .econ-quarter:366-1786 · .econ-rate:508-516 · .econ-row:393-403 · .econ-sc:547-1033 · .econ-scenario:546-546 · .econ-section:423-423 · .econ-sim:573-583 · .econ-stats:520-525 · .econ-sub:429-435 · .econ-tab:427-428 · .econ-toggle:527-530 · .econ-val:408-408 · .est-btn:440-444 · .est-card:450-452 · .est-detail:447-447 · .est-field:459-465 · .est-fields:458-458 · .est-group:438-442 · .est-modo:453-453 · .est-nav:437-437 · .est-section:446-446 · .est-tariff:448-457 · .ev-alarm:1468-2039 · .ev-ann:1384-1642 · .ev-annual:1150-1676 · .ev-badge:1702-1702 · .ev-badges:1614-1614 · .ev-bars:1589-1589 · .ev-barsize:1297-1306 · .ev-bficha:2144-2144 · .ev-bfila:2145-2150 · .ev-bright:1678-1689 · .ev-btn:1740-1902 · .ev-bver:2153-2153 · .ev-car:1629-2142 · .ev-cell:1111-1698 · .ev-char:1729-1729 · .ev-checkbox:1734-1734 · .ev-chip:1428-1428 · .ev-color:1227-1246 · .ev-colors:1730-1730 · .ev-date:1731-1731 · .ev-dates:1319-1321 · .ev-day:1617-1653 · .ev-daynote:1898-1898 · .ev-del:2221-2222 · .ev-detail:1248-2141 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1374-1744 · .ev-field:1723-1724 · .ev-filter:1423-1430 · .ev-form:1718-1739 · .ev-hdr:1438-1554 · .ev-hora:1154-1154 · .ev-input:1725-1726 · .ev-io:1381-1753 · .ev-kind:1891-1895 · .ev-list:1570-2220 · .ev-month:1578-1578 · .ev-multi:1603-1673 · .ev-note:1897-1897 · .ev-num:1700-1700 · .ev-otros:1295-1658 · .ev-puente:1665-1665 · .ev-quad:1369-1694 · .ev-repeat:1735-1735 · .ev-rut:1649-1652 · .ev-search:2211-2215 · .ev-sep:1177-1177 · .ev-shape:1307-1314 · .ev-sort:2216-2217 · .ev-textarea:1727-1728 · .ev-toggle:1732-1733 · .ev-type:1220-1228 · .ev-types:1573-1575 · .ev-up:1139-1152 · .ev-upcoming:327-2031 · .ev-viaje:1155-1163 · .ev-view:1555-1557 · .ev-wd:1737-1738 · .ev-week:323-1663 · .ev-weekday:1736-1736 · .ev-wk:1164-2043 · .ev-zone:1559-2128 · .excl-item:353-518 · .excl-row:333-517 · .fiscal-add:674-837 · .fiscal-bracket:665-673 · .fiscal-compras:866-901 · .fiscal-copy:501-503 · .fiscal-custom:662-662 · .fiscal-ded:876-890 · .fiscal-desgrav:839-891 · .fiscal-despacho:903-924 · .fiscal-error:678-678 · .fiscal-gasto:810-872 · .fiscal-gastos:892-892 · .fiscal-hdr:822-822 · .fiscal-highlight:863-863 · .fiscal-onoff:905-906 · .fiscal-pct:663-672 · .fiscal-period:818-819 · .fiscal-radio:657-661 · .fiscal-save:676-677 · .fiscal-section:655-830 · .fiscal-sticky:827-827 · .fiscal-subsection:831-832 · .fiscal-tab:823-825 · .fiscal-viaje:833-834 · .fiscal-vinc:916-917 · .fiscal-year:497-500 · .full-overlay:249-250 · .hbar-lbl:1948-1948 · .hbar-row:1947-1947 · .hbar-rows:1946-1946 · .hbar-track:1949-1950 · .hbar-val:1951-1951 · .header:54-1831 · .header-brand:57-57 · .hip-add:994-994 · .hip-auto:945-945 · .hip-bar:931-938 · .hip-cancel:981-981 · .hip-cf:950-955 · .hip-edit:977-979 · .hip-g2:949-949 · .hip-grid:943-943 · .hip-period:983-992 · .hip-resumen:926-930 · .hip-ro:968-975 · .hip-save:980-980 · .hip-section:944-993 · .hip-stat:940-942 · .hip-stats:939-939 · .hip-sub:947-947 · .hip-vinc:946-946 · .hip-vr:957-966 · .home-popup:1510-1519 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:2225-2235 · .logo-gallery:1772-1779 · .logo-popup:1763-1770 · .macro-section:1521-1522 · .macro-url:1523-1525 · .mg-budget:484-493 · .mg-cat:494-494 · .mg-desgrav:495-495 · .mg-sort:490-490 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:355-355 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:356-356 · .nav-bar:1434-1835 · .nav-btn:62-63 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1433-1435 · .pdf-export:73-74 · .rate-input:363-2254 · .rate-label:362-362 · .rate-row:361-361 · .rate-suffix:364-364 · .rut-add:2193-2193 · .rut-card:2176-2191 · .rut-day:2184-2200 · .rut-days:2183-2198 · .rut-dot:2179-2179 · .rut-hist:2205-2208 · .rut-hora:2168-2186 · .rut-hpd:2164-2167 · .rut-icon:2170-2174 · .rut-name:2180-2180 · .rut-pct:2192-2192 · .rut-prox:2187-2189 · .rut-sec:2175-2175 · .rut-stat:2202-2204 · .rut-sug:2194-2197 · .rut-susp:2201-2201 · .rut-tag:2181-2182 · .rut-vacio:2190-2190 · .rut-wpick:2134-2139 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:585-589 · .sim-field:574-575 · .sim-hr:584-584 · .sim-period:581-581 · .sim-target:576-580 · .sub-block:610-611 · .sub-row:612-618 · .sw-upd:203-203 · .sy-back:255-2245 · .sy-body:274-2243 · .sy-card:285-2249 · .sy-cards3:277-277 · .sy-cards4:278-278 · .sy-chart:303-303 · .sy-hdr:260-260 · .sy-header:254-2244 · .sy-lbl:294-2248 · .sy-list:307-358 · .sy-month:321-321 · .sy-nav:264-1691 · .sy-note:304-306 · .sy-pdf:266-267 · .sy-puente:313-1452 · .sy-section:275-276 · .sy-spain:279-284 · .sy-sublbl:383-383 · .sy-suelto:318-320 · .sy-tab:1440-1443 · .sy-table:295-2250 · .sy-td:300-300 · .sy-tr:301-2251 · .sy-val:290-2247 · .sy-year:257-2246 · .toast:192-197 · .toast-undo:205-205 · .today-btn:64-65 · .vac-config:329-331 · .vip-no:1065-1066 · .week-actions:161-161 · .week-card:130-228 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

