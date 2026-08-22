# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays.js  _(1046 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:65 · BDAY_ALARM_SET:66 · BDAY_ALARM_COUNT_KEY:67 · BDAY_ALARM_COUNT:68 · BDAY_PALETTE:72 · BDAYS:76 · DN7:236

**Funciones:** _showBdayInlineCtrl:17 · tc:85 · bdName:86 · getBdayColor:88 · getBdaysOn:97 · daysUntil:99 · hasUpcomingBday:106 · updateBdayBtn:112 · getBdayAlarmKey:122 · isBdayAlarmSet:123 · setBdayAlarmState:124 · syncVipBdaysToEvents:130 · renderBdayUpcoming:155 · getBdaysInRange:160 · bdayLabel:175 · renderGroup:184 · renderBdayCalMonth:234 · renderBdayList:275 · getEffVip:286 · renderBdayContent:328 · renderBdayDetail:387 · renderBdayAlarmPanel:408 · fmtDate:420 · openBdayAlarm:475 · _bdRefreshBoth:490 · closeBdayAlarm:495 · bindBdayAlarmEvents:504 (!147) · fmtD:620 · onOk:628 · onErr:629 · renderBdayForm:651 · openBdayDetail:684 · closeBdayDetail:702 · openBdayForm:709 · closeBdayForm:724 · bindBdayFormEvents:730 · openBday:771 · closeBday:780 · refreshBday:786 · applyBdaySearch:791 · bindBdayEvents:803 (!243) · _bdResetScroll:834 · _bdScrollToMonth:836

### js/bodas.js  _(1463 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_NONE:30 · BODA_PLACE_SHORT:31 · BODA_PLACE_EMOJI:33 · BODA_WHITE:50 · BODA_SLOTS:51 · BODA_NO_TIME_COLOR:57 · BODA_NO_COUPLE_COLOR:58 · BODA_DEFAULT_TIME:59 · BODA_PALETTE:62 · BODA_CLOSED_SK:209 · BODA_CLOSED:210 · BODA_PENDING:225 · BODA_SUBTAB:266 · BODA_CLASS_MODE:267 · BODA_FILTER_COUPLE:268 · BODA_HIDE_PAST:269 · BODA_HIDE_CLOSED:270 · BODA_CARD_OPEN:271 · BODA_PAREJAS_SEARCH:272 · BODA_PAREJAS_SORT:275 · BODA_PAREJAS_FILTER:276 · BODA_CAL_HL:277 · BODA_CAL_YEAR:278 · BODA_CAL_MONTH:279 · MN2:294 · DN2:791 · BODA_ASSIGN:838 · BODA_TIME_H:1112

**Funciones:** saveBodas:18 · bodaPlaceEmoji:34 · bodaPlaceOf:38 · bodaPlaceLabel:43 · bodaNextColor:64 · bodaCouple:72 · bodaSlot:76 · bodaSlotColors:86 · bodaMarkFor:91 · evBodaSvg:97 · bodaClasses:114 · bodaClassesOfCouple:117 · bodaFreeClasses:120 · bodaSortClasses:123 · bodaClassesOnDay:130 · bodaNewClass:133 · bodaNormalizeClasses:148 · bodaPlaceForNewOn:183 · bodaDayFull:188 · bodaBulkCreate:193 · bodaProgress:203 · saveBodaClosed:214 · bodaIsClosed:215 · bodaToggleClosed:216 · bodaPendingCount:226 · bodaEff:228 · bodaSetPending:236 · bodaPendingApply:240 · bodaPendingDiscard:263 · _bodaLegendHtml:282 · _renderBodaCalendario:293 (!86) · renderBodasBody:379 · _renderBodaParejas:406 · _bodaFmt:483 · _bodaFmtCorto:484 · _renderBodaClases:491 (!98) · bodaOpenSheet:589 · bodaCloseSheet:605 · bodaCreatedAt:615 · bodaIssues:620 · _renderBodaIssueCards:636 · card:639 · openBodaIssue:660 (!81) · findEv:702 · closeBodaIssue:741 · _bodaWeekKey:744 · _renderBodaStats:751 (!88) · openBodaAssign:839 · closeBodaAssign:859 · renderBodaAssign:863 (!81) · bindBodaAssign:944 · openBodaPlacePicker:1013 · closeBodaPlacePicker:1042 · bodaAplicarCampo:1046 · bodaTrasElegir:1056 · openBodaCouplePicker:1068 · row:1078 · apply:1095 · closeBodaCouplePicker:1109 · openBodaTimePicker:1115 · drum:1120 · setDrum:1143 · mark:1148 · drumVal:1152 · readManual:1173 · closeBodaTimePicker:1193 · renderBodaCoupleForm:1196 · openBodaCoupleForm:1220 · closeBodaCoupleForm:1263 · bodaRefreshRow:1271 · bindBodasEvents:1297 (!166) · _guardaPendientes:1299 · _bodaCalMove:1315 · findClass:1397

### js/core.js  _(625 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:133 · MN_SHORT:135 · DN5:345 · FESTIVOS_ANIO:561

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:140 · save:152 · loadEconYear:156 · saveEconYear:175 · fakeTrans:185 · simpleBarChart:202 · hBarRows:226 · shareOrDownload:243 · escHtml:263 · mkey:268 · getMonthH:269 · defH:275 · dayH:276 · dayT:277 · dk:278 · fd:279 · ad:280 · fh:281 · fhP:282 · isToday:283 · isPast:284 · wn:285 · weeks:288 · getWD:303 · showToast:316 · sendEmail:334 · buildMailtoBody:344 · render:366 (!97) · fmtH:442 · openSheet:463 · closeSheet:482 · selectType:488 · contarVacaciones:521 · confirmarCupoVacaciones:534 · contarFestivos:549 · confirmarCupoFestivos:562 · togSent:571 · renderNavBar:574 · bindNavBar:597 · doNav:604

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(704 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:334 · ESTUDIO_ELECT_CALC:335 · ESTUDIO_ELECT_IVA:336

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:238 · _renderEstudioGasComp:246 · _renderGasCompCard:306 · _calcElectCost:338 · _currentElectTariff:347 · _renderEstudioElectComp:352 · _renderElectCompCard:413 · _renderMultiScenarioResult:442 · _bindEstudioGas:510 · _bindEstudioElect:540 · _bindScenarios:570 · _readScenarios:589 · _bindCompFields:598 · _saveCompFields:631 · renderEstudioContent:646 · openEstudio:660 · closeEstudio:670 · reRenderEstudio:675 · bindEstudioEvents:683

### js/economics-fiscal-elect.js  _(229 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:125

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:75 · _despField:90 · _despFieldMoney:99 · _renderIngresosDesgList:112 · _renderGastoItem:131 · renderGastosList:146 · _bindElectDetalle:168 · _bindSegurosNormales:213

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:72

### js/economics-fiscal-hip.js  _(1033 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipPeriodCard:365 (!87) · _hipROvinc:452 · _calcInsOvercost:462 · _renderInlineOvercost:473 · _renderHipResumen:492 (!99) · _renderHipDetalle:591 · _renderHipSectionContent:617 · _renderCompraSection:629 · _renderPrestamoSection:658 · _renderSubSection:705 · renderFiscalTabDespacho:776 · _bindTabDespacho:793 · _bindHipResumen:817 · _bindHipDetalle:842 · _rerenderSection:913 · _readSectionInputs:922 · _rv:923 · _rv_s:924 · _bindEditingSection:982

### js/economics-fiscal.js  _(1342 líneas)_
**Estado global:** FISCAL_SK:5 · DEFAULT_BRACKETS:11 · FISCAL:18 · FISCAL_TAB:21 · FISCAL_IRPF_SUB:22 · FISCAL_YEAR:23 · FISCAL_HIP_SUB:25 · FISCAL_HIP_EDITING:26 · FISCAL_HIP_EDIT_SNAPSHOT:27 · FISCAL_HIP_DETAIL_TARGET:28 · PERSONAL_SK:34 · PERSONAL_DATA:35 · DEFAULT_PERSONAL_GASTOS_REC:37 · DEFAULT_PERSONAL_INVERSIONES:43 · INGRESOS_SK:87 · INGRESOS_ITEMS:88 · GASTOS_SK:105 · GASTOS_DIFICIL_PCT:106 · DEFAULT_GASTOS:107 · GASTOS_ITEMS:125 · COMPRAS_SK:187 · COMPRAS_IVA_ENABLED:188 · DEFAULT_COMPRAS:189 · COMPRAS_ITEMS:195 · DESGRAV_SK:242 · DESGRAV_DEFAULT:244 · DESGRAV_ITEMS:264 · OBSOLETE_IDS:267 · GROUP_CASA_DESP:659 · GROUP_UTIL_DESP:660

**Funciones:** _yearKey:31 · _ensureDefaults:50 · loadPersonalYear:66 · savePersonalYear:82 · loadIngresos:89 · saveIngresos:92 · findIngreso:95 · ingresoAnual:99 · loadFiscal:127 · saveFiscal:135 · getIrpfPct:138 · getBrackets:139 · _loadGastosFromRaw:141 · loadGastosYear:159 · loadGastos:172 · saveGastosYear:173 · findGasto:176 · gastoAnual:180 · loadCompras:196 · saveCompras:213 · comprasTotal:217 · comprasIvaTotal:227 · loadDesgrav:266 · saveDesgrav:297 · desgravAnual:300 · computeTotalDesgrav:321 · renderFiscalContent:333 · _renderYearSelector:359 · _renderCopyYearBtn:367 · _personalListHtml:390 · _personalTotal:433 · _personalTotalWeekly:443 · renderFiscalTabPersonal:452 · renderFiscalTabIrpf:493 · renderFiscalTabGastosDesg:540 · renderComprasList:571 · renderFiscalTabIrpfDeduc:620 · renderFiscalTabDesgrav:633 · renderDesgravDespachoInfo:655 · _dedCard:696 · renderDesgravList:731 · openFiscal:797 · closeFiscal:810 · reRenderFiscal:816 · bindFiscalEvents:826 · _switchTab:830 · _bindYearSelector:863 · _bindTabPersonal:900 · _bindTabIrpf:949 · _bindTabGastosDesg:994 (!91) · _rebindComprasDel:1043 · _bindTabIrpfDeduc:1085 · _bindTabDesgrav:1098 (!96) · _bindList:1100 · _bindTabDespachoOnly:1194 (!83) · _syncLiveD:1205 · _updateFmt:1243 · _saveFiscalAll:1277 · _rv:1306

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

### js/events-bind.js  _(484 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:63 (!421) · _scrollWeekToMonth:71 · _scrollWeekToToday:118 · doScroll:128 · apply:447

### js/events-detail.js  _(629 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:43 · _bodaMasUnaHora:50 · renderEvDetail:56 (!117) · fd2:59 · _fila:138 · evDayCarItems:173 · evCarGo:186 · _evCarShow:194 · openEvDayCarousel:202 · closeEvDayCarousel:210 · openEvDetail:217 (!176) · repintar:278 · closeEvDetail:393 · renderEvAlarmPanel:400 (!80) · fd2:402 · openEvAlarm:480 · closeEvAlarm:496 · openBdayAlarmFromEvents:506 · bindEvAlarmEvents:519 (!110) · _syncPre:557 · fmtD:587

### js/events-form.js  _(591 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · renderEvForm:32 (!188) · openEvForm:220 · closeEvForm:250 · bindEvFormEvents:262 (!329) · _refreshShapePreviews:278 · _refreshPickDatesLabel:283 · _curKind:302 · _applyTypeUI:303 · _bindTypeSwatches:322 · _viajeSync:413

### js/events-picker-color.js  _(241 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:125 · evTravelColor:134 · getEvType:140 · isEvBarAlways:148 · getEvDisplayColor:150 · _renderColorPicker:170 · _bindColorPicker:193 · updatePreview:203

### js/events-picker-date.js  _(109 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!102) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(904 líneas)_
**Estado global:** DN7:20

**Funciones:** renderEvCalMonth:9 (!145) · renderEvListItem:154 · fd2:158 · renderEvUpcoming:186 (!177) · fd2:193 · renderEvItem:194 · renderEvPanel:244 · _renderEvMonthCard:363 (!146) · renderEvAnnual:509 · renderEvQuad:518 · renderEvByTypes:539 · coincide:565 · renderEvMonthsView:611 · renderEvWeek:620 (!132) · hexA:624 · renderEvContent:752 (!152)

### js/events.js  _(627 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:53 · EV_QUAD_YEAR:54 · EV_QUAD_MONTH:55 · EV_TO_SUBTAB:56 · EV_TYPES_FILTER:57 · EV_TYPES_PAST:58 · EV_LIST_SORT:59 · EV_LIST_SEARCH:60 · EV_COLORS:61 · EVENTS:62 · EV_ALARM_SK:91 · EV_ALARMS_SET:92 · EV_NO_RUT:184 · EV_MARK_ORDER:332 · EV_MAX_PUNT_DIA:373 · EV_MAX_RUT_DIA:374 · EV_CAL_CORNER_STACK:377 · EV_MAX_VIP_DIA:379 · EV_CAL_VIP_MAX:380 · EV_UP_SHOW_RUT:382 · EV_UP_SHOW_BODA:383 · EV_BAR_Z:432 · EV_MNS:491 · EV_CAR:534 · EV_TRANSPORTES:559 · EV_TRANS_EMOJI:565

**Funciones:** evFilterGroup:44 · saveEvents:86 · loadEvAlarms:93 · saveEvAlarms:94 · _findBdayByEvId:95 · isEvAlarmSet:107 · setEvAlarmState:113 · evDk:120 · _evClampDate:129 · eventOccursOn:133 · getEventsOn:177 · evSignature:192 · evMergeIncoming:202 · evMergeMsg:226 · _fmtDayEs:238 · evDayLimitExceeded:239 · rutDayCount:274 · hasUpcomingEvent:281 · updateEventsBtn:290 · evDefaultShape:304 · evMarkerHtml:310 · evMorePlusHtml:324 · evMarkPriority:333 · evBodaMinutes:340 · evSortMarks:351 · ev0:352 · evAnnualXsHtml:384 · vipStarSvgHtml:394 · evIsoDate:406 · _isVipBdayTooFar:407 · evUpcomingMarkHtml:414 · _evRowOcc:433 · _evSoloSeRozan:439 · _evAssignRow:445 · _evMarcarMitades:459 · _evMitadesStyle:474 · evBarZ:481 · _evAnnualCtx:494 · visible:495 · _evLoadPuentes:513 · _evScheduleRemove:541 · _evCancelRemove:548 · evStartTime:567 · evEndTime:573 · evTimeLabel:580 · evTramos:587 · evTramoTexto:596 · evMinutosDe:603 · _positionEvBright:613

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(549 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:444 (!105)

### js/init.js  _(507 líneas)_
**Estado global:** DRUM_ITEM_H:147 · DN_ES:328

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:148 · updateDrumSelected:176 · getDrumValue:182 · checkDrumMinuteWrap:188 · buildAlarmDayBtns:219 · showAlarmPastConfirm:249 · proceed:303 · fmt:364 · _showUpdateBar:474

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(831 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:262 · RUT_WEEK_SEL:606 · RUT_WEEK_CAL:607

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:115 · rutById:122 · rutWeekKey:127 · rutTimeOfDay:136 · rutTieneHorarios:141 · rutWeekCfg:148 · rutSuspendedOn:157 · rutDiaLleno:166 · rutOccursOn:180 · rutIsSkipped:188 · rutToggleSkip:189 · rutFin:194 · rutEventsOn:202 · rutEventFromId:219 · rutSessions:228 · rutStats:242 · rutProximas:255 · renderRutinasBody:265 · _renderRutLista:276 · _rutFmt:334 · _rutFmtCorto:335 · _renderRutStats:341 · renderRutForm:402 · openRutForm:462 (!135) · _rutRepaintIcons:474 · _rutPintaHoras:500 · closeRutForm:597 · openRutWeek:608 · _rutWeekPick:617 · _rutWeekRender:676 · closeRutWeek:744 · openRutSesion:751 · closeRutSesion:787 · bindRutinasEvents:794

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2227 líneas)_

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
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:236
- OVERLAY BASE (summary, econ, bday, events):242
- SHARED OVERLAY HEADER:247
- SHARED BODY:266
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:315
- Vacaciones config:321
- Quitar festivos/vacaciones checkboxes:325
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
- Cabe el nombre entero, hasta en tres lineas:1045
- VIP controls bar:1051
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1062
- VIP edit mode item states:1065
- Feat 1: Buscador en lista por meses:1075
- Upcoming birthdays:1084
- Weekend frame — gris lavanda suave:1101
- Events in puentes (summary) — one per line:1122
- Events upcoming view:1126
- Minicabecera de día dentro de un panel de Próximos:1128
- Marcador de la tarjeta de Proximos: la forma real del evento:1138
- Horas del evento y transporte de ida/vuelta:1143
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1175
- Grid del mes: col fecha (48px) + col eventos (1fr):1177
- Columna fecha (col 1):1179
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1188
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1194
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1198
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1204
- Event color type picker:1208
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1214
- Color picker avanzado (paleta 6×8 + color libre):1218
- Detail color picker toggle:1236
- Annual events calendar:1242
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1272
- Selector de formas en el formulario de evento (Otros):1283
- Selector de grosor de barra (grande | Otros):1285
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1300
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1304
- Inicio/Fin bloqueados cuando hay Selección Multidía:1307
- Mini-overlay para elegir días específicos (Otros):1312
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1339
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1343
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1345
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1347
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1349
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1355
- Calendario 4 meses: 2 columnas × 2 filas:1357
- Botón ir al calendario mensual en puentes del resumen:1359
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1371
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1375
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1393
- Dropdown de vista anual:1400
- Linea que separa los chips de eventos grandes de los puntuales:1409
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1418
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1422
- Summary tabs — nivel 2:1425
- BRIDGE DAY CELLS in summary:1430
- VIP BIRTHDAYS:1439
- BIRTHDAY + EVENT ALARM PANEL:1442
- Campana de alarma en items de próximos (bday + eventos):1445
- 3-ZONE ALARM MARKER:1465
- ALARM MANAGEMENT OVERLAY:1478
- HOME POPUP (semanas pendientes / VIP sin alarma):1479
- MACRO URL EN MENÚ:1490
- Feat 4: Nav-bar emoji alignment:1496
- Birthday detail / form overlays:1512
- EVENTS:1522
- Zone A: upcoming/list views — subtle blue tint:1528
- Zone B: calendar grid views — subtle teal tint, active = green:1530
- Feat 2: Lista de Eventos subtabs:1539
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1556
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1558
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1587
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1591
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1597
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1612
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1617
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1634
- Perímetro puente: capa inferior a eventos:1636
- Bright past: bombilla override:1649
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1653
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1658
- Quad label 3 lines:1663
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1670
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1672
- Events list view:1674
- Event form overlay (inside eventsOverlay):1688
- Relleno, para que haga pareja con el naranja de "Editar evento":1718
- Event detail:1725
- LOGO POPUP:1733
- Gallery:1742
- BD ALARM VIP TOGGLE:1751
- RESPONSIVE (mobile header):1754
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1756
- ALARM PANEL:1809
- Drum picker (selector giratorio de hora/minuto):1814
- Confirmación alarma en el pasado:1834
- Botón flotante "Listo" en modo Editar VIPs:1846
- Controles inline long-press cumpleaños:1849
- Selector de clase en el formulario:1857
- Notas: general vs de un dia concreto:1863
- Pestana Bodas y pestana partida Vacaciones/Festivos:1867
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1872
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1885
- Filas del panel de un aviso:1899
- Estadisticas:1903
- Barras horizontales de reparto (componente generico: hBarRows):1911
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1921
- Dia cerrado: no admite mas clases:1938
- Fila con cambios sin guardar:1943
- Filtros de Parejas como chips pulsables:1955
- Sala sin asignar: se marca en naranja para que cante en la lista:1990
- Nota propia del dia en la lista de Proximos:1993
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:1995
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):1997
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2005
- Los tres botones del detalle de pareja comparten aspecto:2019
- Subpestana Calendario de bodas:2056
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2070
- Dia resaltado al pulsar una pareja en la leyenda:2077
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2104
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2106
- etiqueta al minimo: el nombre de la pareja necesita el resto:2115
- el color de la pareja va en un punto, no tinendo el nombre:2118
- Los tres botones de la pareja, en una sola linea:2125
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2130
- Horario distinto segun el dia:2134
- Selector de icono de rutina:2140
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2180
- Diálogo: modo de importación (añadir vs reemplazar):2195
- PRINT:2208

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:463-465 · .ah-donut:473-475 · .ah-section:460-462 · .ah-total:470-472 · .ah-vs:466-469 · .alarm-cfg:1810-1810 · .alarm-colon:1813-1813 · .alarm-create:1825-1826 · .alarm-day:1831-1833 · .alarm-days:1828-1830 · .alarm-ics:1827-1827 · .alarm-macro:1840-1845 · .alarm-msg:1823-1824 · .alarm-panel:1811-1811 · .alarm-past:1835-1839 · .alarm-time:1812-1812 · .analisis-card:612-614 · .analisis-cards:601-601 · .analisis-hbar:615-620 · .analisis-input:630-633 · .analisis-ins:639-644 · .analisis-insurance:638-638 · .analisis-mortgage:621-637 · .app-logo:58-58 · .app-version:126-126 · .bd-alarm:1443-1753 · .bd-detail:1513-1520 · .bday-add:1099-1100 · .bday-badge:1046-1048 · .bday-cancel:1063-1064 · .bday-cell:1039-1103 · .bday-hdr:1030-1423 · .bday-ic:1851-1855 · .bday-inline:1850-1850 · .bday-io:1079-1083 · .bday-list:1050-1074 · .bday-listo:1847-1847 · .bday-month:1049-1049 · .bday-num:1044-1044 · .bday-search:1076-1078 · .bday-upcoming:1085-1441 · .bday-view:1031-1033 · .bday-vip:1052-1440 · .bday-week:1034-1036 · .boda-actions:2011-2011 · .boda-add:2013-2013 · .boda-asg:2033-2055 · .boda-cal:2057-2080 · .boda-card:1961-2133 · .boda-chip:1957-1959 · .boda-chips:1956-1956 · .boda-class:1944-1985 · .boda-controls:1928-1928 · .boda-couple:1983-1983 · .boda-cpk:2027-2032 · .boda-date:2012-2012 · .boda-day:1939-1977 · .boda-det:2018-2127 · .boda-dot:1965-1965 · .boda-falta:1972-1972 · .boda-filters:1931-1931 · .boda-fsel:1932-1935 · .boda-ftoggles:1936-1937 · .boda-inp:1981-1981 · .boda-iss:1900-1902 · .boda-issue:1887-1898 · .boda-issues:1886-1886 · .boda-legend:2014-2017 · .boda-mini:2009-2010 · .boda-mode:1918-1920 · .boda-name:1966-1966 · .boda-ok:1973-1973 · .boda-place:1984-1992 · .boda-prog:1968-1969 · .boda-ro:1986-1991 · .boda-save:1953-1954 · .boda-savebar:1949-1952 · .boda-search:2128-2128 · .boda-sec:1884-1884 · .boda-sobra:1974-1974 · .boda-sort:2129-2129 · .boda-stat:1905-1910 · .boda-stats:1904-1904 · .boda-sticky:1880-1882 · .boda-sum:1924-1927 · .boda-summary:1923-1923 · .boda-time:1982-1982 · .boda-tp:2081-2084 · .boda-wed:1967-1967 · .bottom-sheet:172-173 · .btn-icon:99-1799 · .csv-export:71-72 · .data-actions:95-1801 · .data-btn:96-1797 · .data-menu:120-125 · .day-cell:140-240 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:69-77 · .dp-actions:1335-1336 · .dp-counter:1322-1323 · .dp-day:1330-1334 · .dp-days:1329-1329 · .dp-grid:1324-1324 · .dp-handle:1317-1317 · .dp-hdr:1318-1318 · .dp-mhdr:1327-1328 · .dp-mname:1326-1326 · .dp-month:1325-1325 · .dp-overlay:1313-1316 · .dp-sheet:1315-1315 · .dp-title:1319-1319 · .dp-yearnav:1320-1321 · .drum-picker:1816-1819 · .drum-sel:1822-1822 · .drum-wrap:1815-1821 · .econ-add:547-548 · .econ-ahorro:768-775 · .econ-annual:377-377 · .econ-avg:378-695 · .econ-bracket:530-536 · .econ-calc:678-679 · .econ-casc:682-689 · .econ-cascade:681-681 · .econ-chart:560-561 · .econ-comp:538-562 · .econ-decl:525-699 · .econ-distrib:1005-1019 · .econ-donut:786-801 · .econ-equiv:1000-1003 · .econ-fiscal:779-784 · .econ-formula:397-400 · .econ-gastos:701-713 · .econ-gear:497-498 · .econ-hdr:419-499 · .econ-ingresado:385-385 · .econ-irpf:715-777 · .econ-legend:563-564 · .econ-line:558-559 · .econ-month:402-415 · .econ-mr:997-998 · .econ-multi:989-999 · .econ-opt:674-677 · .econ-qcard:367-374 · .econ-qcell:363-1760 · .econ-qm:372-372 · .econ-qmonth:370-371 · .econ-quarter:359-1757 · .econ-rate:501-509 · .econ-row:386-396 · .econ-sc:540-1026 · .econ-scenario:539-539 · .econ-section:416-416 · .econ-sim:566-576 · .econ-stats:513-518 · .econ-sub:422-428 · .econ-tab:420-421 · .econ-toggle:520-523 · .econ-val:401-401 · .est-btn:433-437 · .est-card:443-445 · .est-detail:440-440 · .est-field:452-458 · .est-fields:451-451 · .est-group:431-435 · .est-modo:446-446 · .est-nav:430-430 · .est-section:439-439 · .est-tariff:441-450 · .ev-alarm:1454-2004 · .ev-ann:1372-1614 · .ev-annual:1140-1648 · .ev-badge:1673-1673 · .ev-badges:1583-1583 · .ev-bars:1559-1559 · .ev-barsize:1286-1295 · .ev-bficha:2111-2111 · .ev-bfila:2112-2121 · .ev-bpunto:2119-2119 · .ev-bright:1650-1660 · .ev-btn:1711-1869 · .ev-bver:2124-2124 · .ev-car:1598-2108 · .ev-cell:1104-1669 · .ev-char:1700-1700 · .ev-checkbox:1705-1705 · .ev-chip:1415-1415 · .ev-color:1216-1235 · .ev-colors:1701-1701 · .ev-date:1702-1702 · .ev-dates:1308-1310 · .ev-day:1586-1625 · .ev-daynote:1865-1865 · .ev-del:2192-2193 · .ev-detail:1237-2105 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1363-1715 · .ev-field:1694-1695 · .ev-filter:1410-1417 · .ev-form:1689-1710 · .ev-hdr:1424-1524 · .ev-hora:1144-1144 · .ev-input:1696-1697 · .ev-io:1370-1724 · .ev-kind:1858-1862 · .ev-list:1540-2191 · .ev-month:1548-1548 · .ev-multi:1573-1645 · .ev-note:1864-1864 · .ev-num:1671-1671 · .ev-otros:1284-1630 · .ev-puente:1637-1637 · .ev-quad:1358-1665 · .ev-repeat:1706-1706 · .ev-rut:1621-1624 · .ev-search:2182-2186 · .ev-sep:1167-1167 · .ev-shape:1296-1303 · .ev-sort:2187-2188 · .ev-textarea:1698-1699 · .ev-toggle:1703-1704 · .ev-type:1209-1217 · .ev-types:1543-1545 · .ev-up:1129-1142 · .ev-upcoming:320-1996 · .ev-viaje:1145-1153 · .ev-view:1525-1527 · .ev-wd:1708-1709 · .ev-week:316-1635 · .ev-weekday:1707-1707 · .ev-wk:1154-2008 · .ev-zone:1529-2092 · .excl-item:346-511 · .excl-row:326-510 · .fiscal-add:667-830 · .fiscal-bracket:658-666 · .fiscal-compras:859-894 · .fiscal-copy:494-496 · .fiscal-custom:655-655 · .fiscal-ded:869-883 · .fiscal-desgrav:832-884 · .fiscal-despacho:896-917 · .fiscal-error:671-671 · .fiscal-gasto:803-865 · .fiscal-gastos:885-885 · .fiscal-hdr:815-815 · .fiscal-highlight:856-856 · .fiscal-onoff:898-899 · .fiscal-pct:656-665 · .fiscal-period:811-812 · .fiscal-radio:650-654 · .fiscal-save:669-670 · .fiscal-section:648-823 · .fiscal-sticky:820-820 · .fiscal-subsection:824-825 · .fiscal-tab:816-818 · .fiscal-viaje:826-827 · .fiscal-vinc:909-910 · .fiscal-year:490-493 · .full-overlay:243-244 · .hbar-lbl:1914-1914 · .hbar-row:1913-1913 · .hbar-rows:1912-1912 · .hbar-track:1915-1916 · .hbar-val:1917-1917 · .header:54-1802 · .header-brand:57-57 · .hip-add:987-987 · .hip-auto:938-938 · .hip-bar:924-931 · .hip-cancel:974-974 · .hip-cf:943-948 · .hip-edit:970-972 · .hip-g2:942-942 · .hip-grid:936-936 · .hip-period:976-985 · .hip-resumen:919-923 · .hip-ro:961-968 · .hip-save:973-973 · .hip-section:937-986 · .hip-stat:933-935 · .hip-stats:932-932 · .hip-sub:940-940 · .hip-vinc:939-939 · .hip-vr:950-959 · .home-popup:1480-1489 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .imp-mode:2196-2206 · .logo-gallery:1743-1750 · .logo-popup:1734-1741 · .macro-section:1491-1492 · .macro-url:1493-1495 · .mg-budget:477-486 · .mg-cat:487-487 · .mg-desgrav:488-488 · .mg-sort:483-483 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:348-348 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:349-349 · .nav-bar:1420-1806 · .nav-btn:62-63 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1419-1421 · .pdf-export:73-74 · .rate-input:356-2225 · .rate-label:355-355 · .rate-row:354-354 · .rate-suffix:357-357 · .rut-add:2164-2164 · .rut-card:2147-2162 · .rut-day:2155-2171 · .rut-days:2154-2169 · .rut-dot:2150-2150 · .rut-hist:2176-2179 · .rut-hora:2139-2157 · .rut-hpd:2135-2138 · .rut-icon:2141-2145 · .rut-name:2151-2151 · .rut-pct:2163-2163 · .rut-prox:2158-2160 · .rut-sec:2146-2146 · .rut-stat:2173-2175 · .rut-sug:2165-2168 · .rut-susp:2172-2172 · .rut-tag:2152-2153 · .rut-vacio:2161-2161 · .rut-wpick:2098-2103 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:578-582 · .sim-field:567-568 · .sim-hr:577-577 · .sim-period:574-574 · .sim-target:569-573 · .sub-block:603-604 · .sub-row:605-611 · .sw-upd:203-203 · .sy-back:249-2216 · .sy-body:267-2214 · .sy-card:278-2220 · .sy-cards3:270-270 · .sy-cards4:271-271 · .sy-chart:296-296 · .sy-hdr:254-254 · .sy-header:248-2215 · .sy-lbl:287-2219 · .sy-list:300-351 · .sy-month:314-314 · .sy-nav:258-1662 · .sy-note:297-299 · .sy-pdf:260-261 · .sy-puente:306-1438 · .sy-section:268-269 · .sy-spain:272-277 · .sy-sublbl:376-376 · .sy-suelto:311-313 · .sy-tab:1426-1429 · .sy-table:288-2221 · .sy-td:293-293 · .sy-tr:294-2222 · .sy-val:283-2218 · .sy-year:251-2217 · .toast:192-197 · .toast-undo:205-205 · .today-btn:64-65 · .vac-config:322-324 · .vip-no:1058-1059 · .week-actions:161-161 · .week-card:130-222 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

