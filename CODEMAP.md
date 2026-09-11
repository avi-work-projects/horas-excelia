# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays-bind.js  _(323 líneas)_
**Funciones:** bindBdayFormEvents:1 · openBday:52 · closeBday:61 · refreshBday:67 · applyBdaySearch:73 · bindBdayEvents:85 (!192) · _bdResetScroll:116 · _bdScrollToMonth:118 · bindBdayUpcoming:277 · bdayPanelHost:319

### js/birthdays-panels.js  _(308 líneas)_
**Funciones:** renderBdayDetail:1 · renderBdayAlarmPanel:22 · fmtDate:34 · openBdayAlarm:89 · _bdRefreshBoth:96 · closeBdayAlarm:101 · bindBdayAlarmEvents:103 (!146) · fmtD:219 · onOk:226 · onErr:227 · renderBdayForm:249 · openBdayDetail:282 · closeBdayDetail:292 · openBdayForm:295 · closeBdayForm:305

### js/birthdays-render.js  _(248 líneas)_
**Estado global:** DN7:93

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:4 (!87) · getBdaysInRange:9 · bdayLabel:24 · renderGroup:33 · renderBdayCalMonth:91 · renderBdayList:132 · getEffVip:139 · renderBdayContent:181

### js/birthdays.js  _(160 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_UP_VIP:9 · BDAY_FILTER_VIP:10 · BDAY_EDIT_VIP:11 · BDAY_VIP_PENDING:12 · BDAY_ALARM_SET_KEY:66 · BDAY_ALARM_SET:67 · BDAY_ALARM_COUNT_KEY:68 · BDAY_ALARM_COUNT:69 · BDAY_PALETTE:73 · BDAYS:77

**Funciones:** _showBdayInlineCtrl:18 · tc:86 · bdName:87 · getBdayColor:89 · getBdaysOn:98 · daysUntil:100 · hasUpcomingBday:107 · updateBdayBtn:113 · getBdayAlarmKey:123 · isBdayAlarmSet:124 · setBdayAlarmState:128 · syncVipBdaysToEvents:135

### js/bodas-assign.js  _(470 líneas)_
**Estado global:** DN2:180 · BODA_ASSIGN:225

**Funciones:** bodaOpenSheet:1 · bodaCloseSheet:4 · bodaCreatedAt:10 · bodaIssues:15 · _renderBodaIssueCards:31 · card:34 · openBodaIssue:55 (!81) · findEv:97 · closeBodaIssue:136 · _bodaWeekKey:139 · _renderBodaStats:146 (!80) · openBodaAssign:226 · closeBodaAssign:246 · renderBodaAssign:250 (!81) · bindBodaAssign:331 · openBodaPlacePicker:400 · closeBodaPlacePicker:433 · bodaAplicarCampo:437 · bodaTrasElegir:447 · bodaEndAt:459

### js/bodas-bind.js  _(293 líneas)_
**Estado global:** BODA_RENDER_CLASSES:288

**Funciones:** renderBodaCoupleForm:1 · openBodaCoupleForm:29 · closeBodaCoupleForm:67 · bodaRefreshRow:71 · bindBodasEvents:100 (!179) · _guardaPendientes:103 · _bodaCalMove:114 · findClass:214 · bodaMatchesDate:279 · bodaMatchesClasses:283 · renderBodasBody:289

### js/bodas-class-form.js  _(328 líneas)_
**Estado global:** BODA_FORM:1 · BODA_TIME_H:211

**Funciones:** openBodaClaseForm:2 · _bodaFormRender:22 (!137) · closeBodaClaseForm:159 · openBodaCouplePicker:166 · row:177 · apply:194 · closeBodaCouplePicker:208 · openBodaTimePicker:214 · drum:219 · setDrum:242 · mark:247 · drumVal:251 · readManual:272 · closeBodaTimePicker:292 · openBodaDurationPicker:296 · close:301 · bodaTeachersLabel:306 · openBodaTeachersPicker:309 · close:315

### js/bodas-config.js  _(168 líneas)_
**Estado global:** BODA_CONFIG_SK:2 · BODA_CONFIG:3

**Funciones:** bodaLoadConfig:4 · bodaApplyConfig:15 · saveBodaConfig:24 · validateBodaConfig:25 · importBodaConfig:42 · bodaPackOf:58 · bodaDuration:59 · bodaDefaultDuration:60 · bodaDurationOf:61 · bodaConfigUsed:62 · bodaSetCatalogItem:66 · bodaDeleteCatalogItem:75 · bodaTaken:80 · bodaPackStats:85 · bodaTeacherName:97 · bodaTeacherCount:98 · bodaTeacherStats:99 · renderBodaPackStats:105 · renderBodaConfig:117 · openBodaConfig:136 · bindBodaConfig:137 · openBodaCatalogForm:146

### js/bodas.js  _(639 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:25 · BODA_PLACE_DEFAULT:31 · BODA_PLACE_NONE:34 · BODA_PLACE_SHORT:35 · BODA_PLACE_DESC:36 · BODA_PLACE_EMOJI:38 · BODA_WHITE:55 · BODA_SLOTS:56 · BODA_NO_TIME_COLOR:62 · BODA_NO_COUPLE_COLOR:63 · BODA_DEFAULT_TIME:64 · BODA_PALETTE:67 · BODA_CLOSED_SK:225 · BODA_CLOSED:226 · BODA_PENDING:241 · BODA_SUBTAB:283 · BODA_CLASS_MODE:284 · BODA_CLASES_SEARCH:285 · BODA_HIDE_PAST:286 · BODA_HIDE_CLOSED:287 · BODA_CARD_OPEN:288 · BODA_PAREJAS_SEARCH:289 · BODA_PAREJAS_SORT:292 · BODA_PAREJAS_CLASSES:293 · BODA_PAREJAS_FILTER:294 · BODA_CAL_HL:295 · BODA_CAL_YEAR:296 · BODA_CAL_MONTH:297

**Funciones:** saveBodas:18 · bodaPlaceEmoji:39 · bodaPlaceOf:43 · bodaPlaceLabel:48 · bodaNextColor:69 · bodaCouple:77 · bodaSlot:81 · bodaSlotColors:91 · bodaMarkFor:96 · evBodaSvg:102 · bodaClasses:119 · bodaPrimeraClase:123 · bodaClassesOfCouple:127 · bodaFreeClasses:130 · bodaClaseById:133 · bodaSortClasses:137 · bodaClassesOnDay:144 · bodaNewClass:147 · bodaNormalizeClasses:162 · bodaPlaceForNewOn:199 · bodaDayFull:204 · bodaBulkCreate:209 · bodaProgress:219 · saveBodaClosed:230 · bodaIsClosed:231 · bodaToggleClosed:232 · bodaPendingCount:242 · bodaEff:244 · bodaSetPending:253 · bodaPendingApply:257 · bodaPendingDiscard:280 · _bodaLegendHtml:300 · _renderBodaCalendario:311 (!85) · _renderBodasBody:396 · _bodaCmpFecha:426 · _renderBodaParejas:432 (!91) · _bodaFmt:523 · _bodaFmtCorto:524 · _renderBodaClases:531 (!108)

### js/core.js  _(741 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:137 · MN_SHORT:139 · DN5:374 · FESTIVOS_ANIO:591

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:144 · save:156 · loadEconYear:160 · saveEconYear:179 · fakeTrans:189 · simpleBarChart:206 · hBarRows:230 · shareOrDownload:247 · escHtml:267 · mkey:272 · getMonthH:273 · defH:279 · dayH:280 · dayT:281 · dk:282 · fd:283 · ad:284 · fh:285 · fhP:286 · isToday:287 · isPast:288 · wn:289 · weeks:292 · homeSubmissionStatus:306 · renderHomeSubmissionStatus:311 · getWD:320 · showToast:336 · sendEmail:363 · buildMailtoBody:373 · render:395 (!97) · fmtH:471 · openSheet:492 · closeSheet:511 · selectType:517 · contarVacaciones:550 · confirmarCupoVacaciones:563 · contarFestivos:579 · confirmarCupoFestivos:592 · togSent:601 · _panelBorrarLuego:622 · _panelCancelarBorrado:633 · abrirPanel:635 · engancharFondo:655 · abrirUnaVez:673 · cerrarPanel:679 · renderNavBar:690 · bindNavBar:713 · doNav:720

### js/data-integrity.js  _(134 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:82

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 · visit:27 · hour:48 · days:49 · schedule:50 · validBirthday:74 · prepareImportRelations:75 · loadMailConfig:83 · saveMailConfig:86 · birthdayValidation:89 · rutLimitExceeded:94 · legacy:123

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

### js/economics.js  _(689 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_RATE_PERIODS:10 · ECON_ESTUDIO_SUB:14 · ESTUDIO_YEAR:15

**Funciones:** computeSalaryNet:23 · fc:41 · fcPlain:46 · _rateForDate:56 · _buildDatePeriods:71 · computeEconEx:85 · econBarChart:144 · _fmtDateEs:172 · _prevDate:177 · _ensureDatePeriods:184 · _renderRateInputs:201 · _econCard:218 · _econCards7:224 · f:226 · _getMultiRateOpts:241 · renderEconResumen:245 (!197) · renderEconContent:442 · openEcon:467 · closeEcon:483 · reRenderEcon:488 · bindEconEvents:500 · bindEconResumenEvents:538 (!151)

### js/events-bind.js  _(564 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:68 · _bindEvNav:77 (!193) · _scrollWeekToMonth:85 · _scrollWeekToToday:132 · doScroll:142 · _bindEvCal:270 (!93) · _bindEvWeekTitleBackground:363 · update:367 · schedule:390 · openEvTypeFilter:395 · close:403 · _bindEvListas:409 (!122) · apply:519 · _bindEvGestos:531 · _evSwipeUpcoming:544 · _evSwipeBodas:551 · _evSwipeRutinas:558

### js/events-cal.js  _(374 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · _renderEvAnnual:342 · _renderEvQuad:351 · renderEvCalMonth:371 · renderEvAnnual:372 · renderEvQuad:373

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

### js/events-render.js  _(615 líneas)_
**Estado global:** EV_LIST_TYPES:221

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!179) · fd2:50 · renderEvItem:51 · renderEvPanel:101 · renderEvByTypes:222 · coincide:243 · renderEvMonthsView:289 · _evWeekLanes:300 · assign:303 · evWeekTravelRow:318 · renderEvWeek:338 (!120) · hexA:342 · renderEvContent:458 (!157)

### js/events.js  _(789 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:54 · EV_QUAD_YEAR:55 · EV_QUAD_MONTH:56 · EV_TO_SUBTAB:57 · EV_TYPES_FILTER:58 · EV_TYPES_PAST:59 · EV_LIST_SORT:60 · EV_LIST_SEARCH:61 · EV_COLORS:62 · EVENTS:63 · EV_ALARM_SK:92 · EV_ALARMS_SET:93 · EV_NO_RUT:185 · EV_MAX_BAR_DIA:241 · EV_MARK_ORDER:346 · EV_MAX_PUNT_DIA:387 · EV_MAX_RUT_DIA:388 · EV_CAL_CORNER_STACK:391 · EV_MAX_VIP_DIA:393 · EV_CAL_VIP_MAX:394 · EV_UP_SHOW_RUT:396 · EV_UP_SHOW_BODA:397 · EV_BAR_Z:446 · EV_COMPARTE_DIA:450 · EV_MNS:642 · EV_CAR:685 · EV_TRANSPORTES:704 · EV_TRANS_EMOJI:710 · EV_DATE_INDEX:775

**Funciones:** evFilterGroup:44 · saveEvents:87 · loadEvAlarms:94 · saveEvAlarms:95 · _findBdayByEvId:96 · isEvAlarmSet:108 · setEvAlarmState:114 · evDk:121 · _evClampDate:130 · eventOccursOn:134 · getEventsOn:178 · evSignature:193 · evMergeIncoming:203 · evMergeMsg:228 · _fmtDayEs:240 · evBarLimitExceeded:242 · evDayLimitExceeded:252 · rutDayCount:288 · hasUpcomingEvent:295 · updateEventsBtn:304 · evDefaultShape:318 · evMarkerHtml:324 · evMorePlusHtml:338 · evMarkPriority:347 · evBodaMinutes:354 · evSortMarks:365 · ev0:366 · evAnnualXsHtml:398 · vipStarSvgHtml:408 · evIsoDate:420 · _isVipBdayTooFar:421 · evUpcomingMarkHtml:428 · _evRowOcc:447 · evComparteDia:451 · _evSoloSeRozan:456 · _evTrozosSeRozan:467 · _evAssignRow:475 · _evMarcarMitades:489 · _evMitadesStyle:504 · evBarZ:511 · _evBarSegments:515 · _evBarBand:539 · _evBarSegmentStyle:545 · _evBarExtent:550 · _evRoundedOutline:561 · near:570 · _evBarMutedColor:589 · _evSteppedBar:592 · _evAnnualCtx:645 · visible:646 · _evLoadPuentes:664 · _evScheduleRemove:692 · _evCancelRemove:693 · evStartTime:712 · evEndTime:718 · evTimeLabel:725 · evTramos:732 · evTramoTexto:743 · evMinutosDe:750 · _positionEvBright:760 · withEventDateIndex:776

### js/home-popup.js  _(84 líneas)_
**Funciones:** dismissPopup:75

### js/import-export.js  _(530 líneas)_
**Funciones:** _lsJson:259 · askImportMode:266 · close:278 · _mergeMap:292 · _mergeList:303 · _sigEvent:313 · _sigCouple:315 · _sigAlarm:316 · _sigGasto:317 · _keyId:319 · _keyBday:320 · _keyGasto:321 · _exportPerYearKeys:327 (!82) · _applyFullImport:409 (!121)

### js/init.js  _(496 líneas)_
**Estado global:** DRUM_ITEM_H:146 · DN_ES:303

**Funciones:** _updateHeaderActive:29 · buildDrumPicker:147 · updateDrumSelected:175 · getDrumValue:181 · checkDrumMinuteWrap:187 · buildAlarmDayBtns:218 · showAlarmPastConfirm:248 · proceed:289 · setConnectionsEditing:365 · aplicarActualizacion:426 · reload:432 · _showUpdateBar:453 · _buscar:483

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/nav-icons.js  _(51 líneas)_
**Estado global:** NAV_ICON_STYLE:2 · NAV_ICON_PATHS:3

**Funciones:** navIconHtml:11 · applyNavIconStyle:16 · openNavIconPicker:23 · closeNavIconPicker:45 · bindNavIconStyle:46

### js/rutinas-history.js  _(114 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · renderRutHistory:41 · openRutHistory:71 · closeRutHistory:86 · rutEditSession:87 · openRutHistoryEdit:96 · close:102

### js/rutinas.js  _(868 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:315 · RUT_WEEK_SEL:653 · RUT_WEEK_CAL:654

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:122 · rutById:129 · rutWeekKey:134 · rutTimeOfDay:143 · rutTieneHorarios:148 · rutScheduleOn:156 · rutScheduleCopy:161 · rutDurationOn:165 · rutChangeFrom:169 · rutChangeWeek:193 · update:197 · rutWeekCfg:209 · rutSuspendedOn:219 · rutDiaLleno:228 · rutOccursOn:232 · rutIsSkipped:241 · rutToggleSkip:242 · rutFin:247 · rutEventsOn:255 · rutEventFromId:272 · rutSessions:281 · rutStats:295 · rutProximas:308 · renderRutinasBody:318 · _renderRutLista:330 · _rutFmt:388 · _rutFmtCorto:389 · _renderRutStats:395 · renderRutForm:442 · openRutForm:504 (!144) · _rutRepaintIcons:510 · _rutPintaHoras:535 · closeRutForm:648 · openRutWeek:655 · _rutWeekPick:664 · _rutWeekRender:716 (!80) · closeRutWeek:796 · openRutSesion:799 · closeRutSesion:828 · bindRutinasEvents:831

### js/summary.js  _(613 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · VAC_YEAR_KEY:16 · VAC_BY_YEAR:17 · SPAIN_AVG:258 · DN7S:282

**Funciones:** vacEntitlementForYear:18 · saveVacEntitlement:21 · fhY:27 · fdY:28 · computeYearlySummary:30 · barChart3:104 · computePuentes:131 · isNWD:141 · typeOf:142 · renderSummaryWorkBody:175 (!101) · fmtSigned:263 · renderSummaryPuentesBody:276 (!94) · fdd:283 · renderSummaryTimeOffBody:370 (!92) · fdd:376 · bindSummaryWorkBodyEvents:462 · bindSummaryPuentesBodyEvents:472 · bindSummaryTimeOffBodyEvents:497 · renderSummaryContent:503 · closeSummary:524 · bindSummaryEvents:530 (!83)

## CSS

### css/styles.css  _(2656 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:19
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):37
- HEADER:56
- JORNADA DEFECTO:70
- Barra vertical que separa la campana del bloque de navegacion:107
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:113
- WEEK CARDS:126
- WEEK ACTIONS:158
- BOTTOM SHEET (day type selector):167
- TOAST:189
- Tema claro: el fondo oscuro con letra de color no se leia bien:196
- SW UPDATE BUTTON (en menú ⋯):200
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:204
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
- Cabe el nombre entero, hasta en tres lineas:1045
- VIP controls bar:1051
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1062
- VIP edit mode item states:1065
- Feat 1: Buscador en lista por meses:1075
- Upcoming birthdays:1101
- Weekend frame — gris lavanda suave:1118
- Hoy manda sobre el gris del fin de semana:1121
- Events in puentes (summary) — one per line:1141
- Events upcoming view:1145
- Minicabecera de día dentro de un panel de Próximos:1147
- Marcador de la tarjeta de Proximos: la forma real del evento:1157
- Horas del evento y transporte de ida/vuelta:1162
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1194
- Grid del mes: col fecha (48px) + col eventos (1fr):1196
- Columna fecha (col 1):1198
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1207
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1214
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1218
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1224
- Event color type picker:1228
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1234
- Color picker avanzado (paleta 6×8 + color libre):1238
- Detail color picker toggle:1256
- Annual events calendar:1262
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1292
- Selector de formas en el formulario de evento (Otros):1303
- Selector de grosor de barra (grande | Otros):1305
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1320
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1324
- Inicio/Fin bloqueados cuando hay Selección Multidía:1327
- Mini-overlay para elegir días específicos (Otros):1332
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1359
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1363
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1365
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1371
- Calendario 4 meses: 2 columnas × 2 filas:1373
- Botón ir al calendario mensual en puentes del resumen:1375
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1387
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1391
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1409
- Dropdown de vista anual:1416
- Linea que separa los chips de eventos grandes de los puntuales:1425
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1434
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1438
- Summary tabs — nivel 2:1441
- BRIDGE DAY CELLS in summary:1446
- VIP BIRTHDAYS:1455
- BIRTHDAY + EVENT ALARM PANEL:1458
- Campana de alarma en items de próximos (bday + eventos):1461
- 3-ZONE ALARM MARKER:1499
- ALARM MANAGEMENT OVERLAY:1512
- HOME POPUP (semanas pendientes / VIP sin alarma):1513
- MACRO URL EN MENÚ:1524
- Feat 4: Nav-bar emoji alignment:1530
- Birthday detail / form overlays:1540
- EVENTS:1550
- Zone A: upcoming/list views — subtle blue tint:1556
- Zone B: calendar grid views — subtle teal tint, active = green:1557
- Feat 2: Lista de Eventos subtabs:1560
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1577
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1579
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1591
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1595
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1601
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1616
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1626
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1649
- Perímetro puente: capa inferior a eventos:1651
- Bright past: bombilla override:1665
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1669
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1674
- Quad label 3 lines:1679
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1686
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1688
- Events list view:1690
- Event form overlay (inside eventsOverlay):1704
- Relleno, para que haga pareja con el naranja de "Editar evento":1734
- Event detail:1740
- LOGO POPUP:1748
- Gallery:1757
- BD ALARM VIP TOGGLE:1766
- RESPONSIVE (mobile header):1769
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1771
- ALARM PANEL:1824
- Drum picker (selector giratorio de hora/minuto):1829
- Confirmación alarma en el pasado:1855
- Botón flotante "Listo" en modo Editar VIPs:1861
- Controles inline long-press cumpleaños:1864
- Selector de clase en el formulario:1872
- Notas: general vs de un dia concreto:1878
- Pestana Bodas y pestana partida Vacaciones/Festivos:1882
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1883
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1894
- Filas del panel de un aviso:1908
- Estadisticas:1912
- Barras horizontales de reparto (componente generico: hBarRows):1920
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1930
- Dia cerrado: no admite mas clases:1947
- Una clase a la que le falta la hora o la sala se marca ella sola.:1958
- Fila con cambios sin guardar:1963
- Filtros de Parejas como chips pulsables:1975
- El color de la pareja va en un punto delante; el nombre, en color normal:2038
- Sala sin asignar: se marca en naranja para que cante en la lista:2043
- Nota propia del dia en la lista de Proximos:2046
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2048
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2050
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2058
- Editar siempre en naranja, como en el resto de la app:2064
- Los tres botones del detalle de pareja comparten aspecto:2081
- Subpestana Calendario de bodas:2121
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2135
- Dia resaltado al pulsar una pareja en la leyenda:2142
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2165
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2167
- etiqueta al minimo: el nombre de la pareja necesita el resto:2176
- el color de la pareja va en un punto, no tinendo el nombre:2179
- Los tres botones de la pareja, en una sola linea:2186
- Buscador y boton de anadir en la misma fila:2189
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2195
- Horario distinto segun el dia:2199
- Selector de icono de rutina:2205
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2245
- Diálogo: modo de importación (añadir vs reemplazar):2260
- PRINT:2273
- Separacion de siluetas incluso entre grosores distintos.:2293
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2308
- Editar: tono comun, con geometria propia de cada pantalla.:2320
- Marca oficial con transparencia; conserva contraste en ambos temas.:2337
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2358
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2376
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2402
- Text edits retain the solid orange; only standalone pencils use a tint.:2411
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2418
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2454
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2469
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2479
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2491
- Titulo y estado separados para que "saltada" nunca quede tachado.:2511
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2521
- El titulo queda dentro del borde de 1.5px de su caja continua.:2526
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2532
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2548
- Una identidad de color por ventana para ambos juegos de iconos.:2552
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2581
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2588
- Borde discreto para identificar semanas enviadas en ambos temas.:2593
- Filtros junto al buscador sin ensanchar la ventana movil.:2597
- Configuracion de tarifa: controles verdes y valores neutros.:2605
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2623
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2640
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2644

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:466-468 · .ah-donut:476-478 · .ah-section:463-465 · .ah-total:473-475 · .ah-vs:469-472 · .alarm-cfg:1825-1825 · .alarm-colon:1828-1828 · .alarm-create:1842-1848 · .alarm-day:1852-1854 · .alarm-days:1849-1851 · .alarm-msg:1838-1839 · .alarm-panel:1826-1826 · .alarm-past:1856-1860 · .alarm-time:1827-1827 · .analisis-card:615-617 · .analisis-cards:604-604 · .analisis-hbar:618-623 · .analisis-input:633-636 · .analisis-ins:642-647 · .analisis-insurance:641-641 · .analisis-mortgage:624-640 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1459-1768 · .bd-detail:1541-1548 · .bd-export:263-263 · .bday-add:1116-1117 · .bday-badge:1046-1048 · .bday-buscar:1078-1080 · .bday-cancel:1063-1064 · .bday-cell:1039-1122 · .bday-hdr:1033-2404 · .bday-header:2398-2400 · .bday-ic:1866-1870 · .bday-inline:1865-1865 · .bday-io:1084-1100 · .bday-jump:2300-2341 · .bday-list:1050-1074 · .bday-listo:1862-1862 · .bday-month:1049-2416 · .bday-next:2350-2351 · .bday-num:1044-1044 · .bday-search:1081-1083 · .bday-upcoming:1102-2298 · .bday-vip:1052-1456 · .bday-week:1034-1036 · .boda-actions:2073-2073 · .boda-add:2075-2075 · .boda-asg:2098-2120 · .boda-buscar:2190-2192 · .boda-cal:2122-2145 · .boda-card:1981-2198 · .boda-catalog:2327-2335 · .boda-cfg:2377-2389 · .boda-chip:1977-1979 · .boda-chips:1976-1976 · .boda-cl:2035-2072 · .boda-class:1959-2034 · .boda-config:2323-2374 · .boda-controls:1937-1937 · .boda-count:2331-2331 · .boda-couple:2017-2019 · .boda-cpk:2089-2097 · .boda-date:2074-2409 · .boda-day:1953-2364 · .boda-det:2080-2188 · .boda-dia:2024-2026 · .boda-dot:1985-1985 · .boda-falta:1992-1992 · .boda-field:2365-2370 · .boda-filter:2303-2305 · .boda-filters:1940-1940 · .boda-fsel:1941-1944 · .boda-ftoggles:1945-1946 · .boda-hd:2068-2070 · .boda-inp:2012-2012 · .boda-iss:1909-1911 · .boda-issue:1896-1907 · .boda-issues:1895-1895 · .boda-legend:2076-2079 · .boda-mini:2062-2311 · .boda-mode:1927-1929 · .boda-multi:2027-2032 · .boda-name:1986-1986 · .boda-ok:1993-1993 · .boda-pack:2332-2333 · .boda-pfilters:2302-2306 · .boda-place:2020-2045 · .boda-prog:1988-1989 · .boda-ro:2036-2044 · .boda-save:1973-1974 · .boda-savebar:1969-1972 · .boda-search:2193-2193 · .boda-sec:1893-1893 · .boda-sobra:1994-1994 · .boda-sort:2194-2194 · .boda-stat:1914-1919 · .boda-stats:1913-1913 · .boda-sticky:1889-2387 · .boda-sum:1933-1936 · .boda-summary:1932-1932 · .boda-swap:2002-2009 · .boda-teachers:2352-2352 · .boda-time:2013-2013 · .boda-tp:2146-2149 · .boda-wed:1987-1987 · .bottom-sheet:170-171 · .btn-icon:103-1814 · .csv-export:76-77 · .data-actions:99-2549 · .data-btn:100-2559 · .data-menu:117-123 · .day-cell:138-241 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1355-1356 · .dp-counter:1342-1343 · .dp-day:1350-1354 · .dp-days:1349-1349 · .dp-grid:1344-1344 · .dp-handle:1337-1337 · .dp-hdr:1338-1338 · .dp-mhdr:1347-1348 · .dp-mname:1346-1346 · .dp-month:1345-1345 · .dp-overlay:1333-1336 · .dp-sheet:1335-1335 · .dp-title:1339-1339 · .dp-yearnav:1340-1341 · .drum-picker:1831-1834 · .drum-sel:1837-1837 · .drum-wrap:1830-1836 · .econ-add:550-551 · .econ-ahorro:771-778 · .econ-annual:380-380 · .econ-avg:381-698 · .econ-bracket:533-539 · .econ-calc:681-682 · .econ-casc:685-692 · .econ-cascade:684-684 · .econ-chart:563-564 · .econ-comp:541-565 · .econ-decl:528-702 · .econ-distrib:1008-1022 · .econ-donut:789-804 · .econ-equiv:1003-1006 · .econ-fiscal:782-787 · .econ-formula:400-403 · .econ-gastos:704-716 · .econ-gear:500-501 · .econ-hdr:422-502 · .econ-ingresado:388-388 · .econ-irpf:718-780 · .econ-legend:566-567 · .econ-line:561-562 · .econ-month:405-418 · .econ-mr:1000-1001 · .econ-multi:992-1002 · .econ-opt:677-680 · .econ-qcard:370-377 · .econ-qcell:366-1775 · .econ-qm:375-375 · .econ-qmonth:373-374 · .econ-quarter:362-1772 · .econ-rate:504-512 · .econ-row:389-399 · .econ-sc:543-1029 · .econ-scenario:542-542 · .econ-section:419-419 · .econ-sim:569-579 · .econ-stats:516-521 · .econ-sub:425-431 · .econ-tab:423-2537 · .econ-tariff:2606-2611 · .econ-toggle:523-526 · .econ-val:404-404 · .est-btn:436-440 · .est-card:446-448 · .est-detail:443-443 · .est-field:455-461 · .est-fields:454-454 · .est-group:434-438 · .est-modo:449-449 · .est-nav:433-2536 · .est-section:442-442 · .est-tariff:444-453 · .ev-alarm:1482-2057 · .ev-ann:1388-1623 · .ev-annual:1159-1664 · .ev-badge:1689-1689 · .ev-badges:1587-1587 · .ev-bar:1643-1643 · .ev-bars:1580-1580 · .ev-barsize:1306-1315 · .ev-bficha:2172-2172 · .ev-bfila:2173-2182 · .ev-bpunto:2180-2180 · .ev-bright:1666-2642 · .ev-btn:1727-1736 · .ev-bver:2185-2185 · .ev-car:1602-2169 · .ev-cell:1123-1685 · .ev-char:1716-1716 · .ev-checkbox:1721-1721 · .ev-chip:1431-2317 · .ev-color:1236-1255 · .ev-colors:1717-1717 · .ev-date:1718-1718 · .ev-dates:1328-1330 · .ev-day:1590-1634 · .ev-daynote:1880-1880 · .ev-del:2257-2258 · .ev-detail:1257-2166 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1379-1731 · .ev-field:1710-1711 · .ev-filter:1426-2316 · .ev-form:1705-1726 · .ev-hdr:1440-1552 · .ev-hora:1163-1163 · .ev-input:1712-1713 · .ev-io:1086-1739 · .ev-kind:1873-1877 · .ev-list:1561-2625 · .ev-month:1569-1569 · .ev-multi:1584-2318 · .ev-note:1879-1879 · .ev-num:1687-1687 · .ev-otros:1304-1639 · .ev-puente:1652-1652 · .ev-quad:1374-1681 · .ev-repeat:1722-1722 · .ev-rut:1630-2517 · .ev-search:2247-2251 · .ev-sep:1186-1186 · .ev-shape:1316-1323 · .ev-sort:2252-2297 · .ev-stepped:1645-1647 · .ev-textarea:1714-1715 · .ev-toggle:1719-1720 · .ev-type:1229-2629 · .ev-types:1564-2626 · .ev-up:1148-2482 · .ev-upcoming:323-2049 · .ev-viaje:1164-1172 · .ev-view:1553-2310 · .ev-wd:1724-1725 · .ev-week:319-1650 · .ev-weekday:1723-1723 · .ev-wk:1173-2646 · .excl-item:349-514 · .excl-row:329-513 · .fiscal-add:670-833 · .fiscal-bracket:661-669 · .fiscal-compras:862-897 · .fiscal-copy:497-499 · .fiscal-custom:658-658 · .fiscal-ded:872-886 · .fiscal-desgrav:835-887 · .fiscal-despacho:899-920 · .fiscal-error:674-674 · .fiscal-gasto:806-868 · .fiscal-gastos:888-888 · .fiscal-hdr:818-818 · .fiscal-highlight:859-859 · .fiscal-hip:2603-2604 · .fiscal-onoff:901-902 · .fiscal-pct:659-668 · .fiscal-period:814-815 · .fiscal-radio:653-657 · .fiscal-save:672-673 · .fiscal-section:651-826 · .fiscal-sticky:823-823 · .fiscal-subsection:827-828 · .fiscal-tab:819-2534 · .fiscal-viaje:829-830 · .fiscal-vinc:912-913 · .fiscal-year:493-496 · .full-overlay:244-245 · .hbar-lbl:1923-1923 · .hbar-row:1922-1922 · .hbar-rows:1921-1921 · .hbar-track:1924-1925 · .hbar-val:1926-1926 · .header:57-2645 · .header-brand:60-60 · .hip-add:990-990 · .hip-auto:941-941 · .hip-bar:927-934 · .hip-cancel:977-977 · .hip-cf:946-951 · .hip-edit:973-975 · .hip-g2:945-945 · .hip-grid:939-939 · .hip-period:979-988 · .hip-resumen:922-926 · .hip-ro:964-971 · .hip-save:976-976 · .hip-section:940-989 · .hip-stat:936-938 · .hip-stats:935-935 · .hip-sub:943-943 · .hip-vinc:942-942 · .hip-vr:953-962 · .home-popup:1514-1523 · .home-submission:2647-2653 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:264-264 · .imp-mode:2261-2271 · .io-peligro:1091-1099 · .io-primaria:1090-1097 · .logo-gallery:1758-1765 · .logo-popup:1749-1756 · .macro-section:1525-1526 · .macro-url:1527-2314 · .mg-budget:480-489 · .mg-cat:490-490 · .mg-desgrav:491-491 · .mg-sort:486-486 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-92 · .ms-breakdown:351-351 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:352-352 · .nav-bar:1436-1821 · .nav-btn:65-66 · .nav-icon:2567-2577 · .nav-pro:2543-2544 · .nav-style:2565-2565 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1435-1437 · .rate-input:359-2290 · .rate-label:358-358 · .rate-row:357-357 · .rate-suffix:360-360 · .rut-add:2229-2229 · .rut-cancelled:2458-2512 · .rut-card:2212-2227 · .rut-day:2220-2236 · .rut-days:2219-2234 · .rut-dot:2215-2215 · .rut-hist:2241-2244 · .rut-history:2432-2452 · .rut-hora:2204-2222 · .rut-hpd:2200-2430 · .rut-icon:2206-2415 · .rut-name:2216-2216 · .rut-pct:2228-2228 · .rut-prox:2223-2225 · .rut-sec:2211-2211 · .rut-skipped:2513-2514 · .rut-stat:2238-2240 · .rut-sug:2230-2233 · .rut-susp:2237-2237 · .rut-tag:2217-2218 · .rut-vacio:2226-2226 · .rut-week:2431-2431 · .rut-wpick:2159-2164 · .selected:2574-2574 · .sent-badge:134-134 · .settings-details:2353-2355 · .settings-edit:2315-2356 · .settings-menu:2638-2638 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:581-585 · .sim-field:570-571 · .sim-hr:580-580 · .sim-period:577-577 · .sim-target:572-576 · .sub-block:606-607 · .sub-row:608-614 · .sw-upd:201-201 · .sy-back:250-2281 · .sy-body:270-2279 · .sy-card:281-2285 · .sy-cards3:273-273 · .sy-cards4:274-274 · .sy-chart:299-299 · .sy-hdr:255-255 · .sy-header:249-2280 · .sy-lbl:290-2284 · .sy-list:303-354 · .sy-month:317-317 · .sy-nav:259-1678 · .sy-note:300-302 · .sy-pdf:261-262 · .sy-period:2612-2619 · .sy-puente:309-1454 · .sy-section:271-272 · .sy-spain:275-280 · .sy-sublbl:379-379 · .sy-suelto:314-316 · .sy-tab:1442-1445 · .sy-table:291-2286 · .sy-td:296-296 · .sy-tr:297-2287 · .sy-val:286-2283 · .sy-year:252-2282 · .toast:190-206 · .toast-undo:203-203 · .today-btn:67-68 · .vac-config:325-327 · .vip-no:1058-1059 · .week-actions:159-159 · .week-card:128-2594 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2338-2462

