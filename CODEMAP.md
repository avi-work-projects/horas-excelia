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

### js/core.js  _(727 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:137 · MN_SHORT:139 · DN5:361 · FESTIVOS_ANIO:577

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:144 · save:156 · loadEconYear:160 · saveEconYear:179 · fakeTrans:189 · simpleBarChart:206 · hBarRows:230 · shareOrDownload:247 · escHtml:267 · mkey:272 · getMonthH:273 · defH:279 · dayH:280 · dayT:281 · dk:282 · fd:283 · ad:284 · fh:285 · fhP:286 · isToday:287 · isPast:288 · wn:289 · weeks:292 · getWD:307 · showToast:323 · sendEmail:350 · buildMailtoBody:360 · render:382 (!97) · fmtH:458 · openSheet:479 · closeSheet:498 · selectType:504 · contarVacaciones:537 · confirmarCupoVacaciones:550 · contarFestivos:565 · confirmarCupoFestivos:578 · togSent:587 · _panelBorrarLuego:608 · _panelCancelarBorrado:619 · abrirPanel:621 · engancharFondo:641 · abrirUnaVez:659 · cerrarPanel:665 · renderNavBar:676 · bindNavBar:699 · doNav:706

### js/data-integrity.js  _(130 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:78

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 · visit:27 · hour:44 · days:45 · schedule:46 · validBirthday:70 · prepareImportRelations:71 · loadMailConfig:79 · saveMailConfig:82 · birthdayValidation:85 · rutLimitExceeded:90 · legacy:119

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

### js/events-bind.js  _(550 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:68 · _bindEvNav:77 (!193) · _scrollWeekToMonth:85 · _scrollWeekToToday:132 · doScroll:142 · _bindEvCal:270 (!93) · _bindEvWeekTitleBackground:363 · update:367 · schedule:390 · _bindEvListas:395 (!122) · apply:505 · _bindEvGestos:517 · _evSwipeUpcoming:530 · _evSwipeBodas:537 · _evSwipeRutinas:544

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

### js/events-render.js  _(619 líneas)_
**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!178) · fd2:50 · renderEvItem:51 · renderEvPanel:101 · renderEvByTypes:221 · coincide:247 · renderEvMonthsView:293 · _evWeekLanes:304 · assign:307 · evWeekTravelRow:322 · renderEvWeek:342 (!120) · hexA:346 · renderEvContent:462 (!157)

### js/events.js  _(789 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:54 · EV_QUAD_YEAR:55 · EV_QUAD_MONTH:56 · EV_TO_SUBTAB:57 · EV_TYPES_FILTER:58 · EV_TYPES_PAST:59 · EV_LIST_SORT:60 · EV_LIST_SEARCH:61 · EV_COLORS:62 · EVENTS:63 · EV_ALARM_SK:92 · EV_ALARMS_SET:93 · EV_NO_RUT:185 · EV_MAX_BAR_DIA:241 · EV_MARK_ORDER:346 · EV_MAX_PUNT_DIA:387 · EV_MAX_RUT_DIA:388 · EV_CAL_CORNER_STACK:391 · EV_MAX_VIP_DIA:393 · EV_CAL_VIP_MAX:394 · EV_UP_SHOW_RUT:396 · EV_UP_SHOW_BODA:397 · EV_BAR_Z:446 · EV_COMPARTE_DIA:450 · EV_MNS:642 · EV_CAR:685 · EV_TRANSPORTES:704 · EV_TRANS_EMOJI:710 · EV_DATE_INDEX:775

**Funciones:** evFilterGroup:44 · saveEvents:87 · loadEvAlarms:94 · saveEvAlarms:95 · _findBdayByEvId:96 · isEvAlarmSet:108 · setEvAlarmState:114 · evDk:121 · _evClampDate:130 · eventOccursOn:134 · getEventsOn:178 · evSignature:193 · evMergeIncoming:203 · evMergeMsg:228 · _fmtDayEs:240 · evBarLimitExceeded:242 · evDayLimitExceeded:252 · rutDayCount:288 · hasUpcomingEvent:295 · updateEventsBtn:304 · evDefaultShape:318 · evMarkerHtml:324 · evMorePlusHtml:338 · evMarkPriority:347 · evBodaMinutes:354 · evSortMarks:365 · ev0:366 · evAnnualXsHtml:398 · vipStarSvgHtml:408 · evIsoDate:420 · _isVipBdayTooFar:421 · evUpcomingMarkHtml:428 · _evRowOcc:447 · evComparteDia:451 · _evSoloSeRozan:456 · _evTrozosSeRozan:467 · _evAssignRow:475 · _evMarcarMitades:489 · _evMitadesStyle:504 · evBarZ:511 · _evBarSegments:515 · _evBarBand:539 · _evBarSegmentStyle:545 · _evBarExtent:550 · _evRoundedOutline:561 · near:570 · _evBarMutedColor:589 · _evSteppedBar:592 · _evAnnualCtx:645 · visible:646 · _evLoadPuentes:664 · _evScheduleRemove:692 · _evCancelRemove:693 · evStartTime:712 · evEndTime:718 · evTimeLabel:725 · evTramos:732 · evTramoTexto:743 · evMinutosDe:750 · _positionEvBright:760 · withEventDateIndex:776

### js/home-popup.js  _(84 líneas)_
**Funciones:** dismissPopup:75

### js/import-export.js  _(528 líneas)_
**Funciones:** _lsJson:259 · askImportMode:266 · close:278 · _mergeMap:292 · _mergeList:303 · _sigEvent:313 · _sigCouple:315 · _sigAlarm:316 · _sigGasto:317 · _keyId:319 · _keyBday:320 · _keyGasto:321 · _exportPerYearKeys:327 (!82) · _applyFullImport:409 (!119)

### js/init.js  _(490 líneas)_
**Estado global:** DRUM_ITEM_H:140 · DN_ES:297

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:141 · updateDrumSelected:169 · getDrumValue:175 · checkDrumMinuteWrap:181 · buildAlarmDayBtns:212 · showAlarmPastConfirm:242 · proceed:283 · setConnectionsEditing:359 · aplicarActualizacion:420 · reload:426 · _showUpdateBar:447 · _buscar:477

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/nav-icons.js  _(46 líneas)_
**Estado global:** NAV_ICON_STYLE:2 · NAV_ICON_PATHS:3

**Funciones:** navIconHtml:11 · applyNavIconStyle:16 · openNavIconPicker:23 · closeNavIconPicker:40 · bindNavIconStyle:41

### js/rutinas-history.js  _(114 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · renderRutHistory:41 · openRutHistory:71 · closeRutHistory:86 · rutEditSession:87 · openRutHistoryEdit:96 · close:102

### js/rutinas.js  _(868 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:315 · RUT_WEEK_SEL:653 · RUT_WEEK_CAL:654

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:122 · rutById:129 · rutWeekKey:134 · rutTimeOfDay:143 · rutTieneHorarios:148 · rutScheduleOn:156 · rutScheduleCopy:161 · rutDurationOn:165 · rutChangeFrom:169 · rutChangeWeek:193 · update:197 · rutWeekCfg:209 · rutSuspendedOn:219 · rutDiaLleno:228 · rutOccursOn:232 · rutIsSkipped:241 · rutToggleSkip:242 · rutFin:247 · rutEventsOn:255 · rutEventFromId:272 · rutSessions:281 · rutStats:295 · rutProximas:308 · renderRutinasBody:318 · _renderRutLista:330 · _rutFmt:388 · _rutFmtCorto:389 · _renderRutStats:395 · renderRutForm:442 · openRutForm:504 (!144) · _rutRepaintIcons:510 · _rutPintaHoras:535 · closeRutForm:648 · openRutWeek:655 · _rutWeekPick:664 · _rutWeekRender:716 (!80) · closeRutWeek:796 · openRutSesion:799 · closeRutSesion:828 · bindRutinasEvents:831

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2582 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:19
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):37
- HEADER:56
- JORNADA DEFECTO:70
- Barra vertical que separa la campana del bloque de navegacion:107
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:113
- Punto verde notificación en botones bday/events cuando hay items próximos:117
- WEEK CARDS:128
- WEEK ACTIONS:160
- BOTTOM SHEET (day type selector):169
- TOAST:191
- Tema claro: el fondo oscuro con letra de color no se leia bien:198
- SW UPDATE BUTTON (en menú ⋯):202
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:206
- ANIMATIONS:210
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:239
- OVERLAY BASE (summary, econ, bday, events):245
- SHARED OVERLAY HEADER:250
- SHARED BODY:271
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:320
- Vacaciones config:326
- Quitar festivos/vacaciones checkboxes:330
- Month summary breakdown:352
- Ausencia list tag:355
- ECONOMICS:358
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:363
- Summary sublabel (hours breakdown):380
- Ingresado box (formerly cobrado) — neutral:389
- ECONOMICS v2: tabs + nuevas secciones:423
- Estudio Cambio — grouped nav:434
- Estudio — tariff comparison cards:443
- Análisis hipoteca — secciones organizadas:464
- Mis gastos — budget table:481
- Year selector for per-year fiscal tabs:494
- §1.1 Tarifa dual:505
- §1.3 Stats por hora/día:517
- §1.4 Toggles:524
- §1.5 Declaración IRPF:529
- Tab 2: Comparador:542
- Calcular Tarifa (sim):570
- Scenario zones (Comparar Escenarios):588
- Análisis Ec. Personal:605
- Bloques de la Subrogación:607
- Fiscal config modal — purple theme override:650
- Fiscal config modal:652
- ECONOMICS v3: opt-buttons, cascade, gastos:678
- Cascade ingresos/gastos:685
- Media mensual: cards:695
- Tab 4: Análisis:705
- IRPF Breakdown visual:719
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:746
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):748
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):772
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:781
- Resumen fiscal al final de Ingresos y Gastos:783
- Donut chart:790
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):800
- Fiscal config: gastos items:807
- Fiscal: tab bar:819
- Fiscal: sticky save:824
- Fiscal: section title income/expense colors:826
- Fiscal: desgravaciones:836
- Fiscal: compras profesionales:863
- Desgravaciones: notas + tabla despacho info:871
- Nota IVA compras:891
- IVA por item en compras:893
- Fiscal: despacho en casa:900
- Hipoteca — resumen visual:923
- Hipoteca — compact 2-col grid:946
- Hipoteca — compact vinculaciones:954
- Hipoteca — read-only fields:965
- Hipoteca — edit/detail buttons:974
- Hipoteca — period summary card:980
- Multi-rate period cards:993
- Distribución de ingresos:1009
- Comparador: reorder buttons:1025
- Rate input styled:1029
- BIRTHDAYS:1033
- Cabe el nombre entero, hasta en tres lineas:1047
- VIP controls bar:1053
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1064
- VIP edit mode item states:1067
- Feat 1: Buscador en lista por meses:1077
- Upcoming birthdays:1103
- Weekend frame — gris lavanda suave:1120
- Hoy manda sobre el gris del fin de semana:1123
- Events in puentes (summary) — one per line:1143
- Events upcoming view:1147
- Minicabecera de día dentro de un panel de Próximos:1149
- Marcador de la tarjeta de Proximos: la forma real del evento:1159
- Horas del evento y transporte de ida/vuelta:1164
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1196
- Grid del mes: col fecha (48px) + col eventos (1fr):1198
- Columna fecha (col 1):1200
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1209
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
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1373
- Calendario 4 meses: 2 columnas × 2 filas:1375
- Botón ir al calendario mensual en puentes del resumen:1377
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1389
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1393
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1411
- Dropdown de vista anual:1418
- Linea que separa los chips de eventos grandes de los puntuales:1427
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1436
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1440
- Summary tabs — nivel 2:1443
- BRIDGE DAY CELLS in summary:1448
- VIP BIRTHDAYS:1457
- BIRTHDAY + EVENT ALARM PANEL:1460
- Campana de alarma en items de próximos (bday + eventos):1463
- 3-ZONE ALARM MARKER:1501
- ALARM MANAGEMENT OVERLAY:1514
- HOME POPUP (semanas pendientes / VIP sin alarma):1515
- MACRO URL EN MENÚ:1526
- Feat 4: Nav-bar emoji alignment:1532
- Birthday detail / form overlays:1542
- EVENTS:1552
- Zone A: upcoming/list views — subtle blue tint:1558
- Zone B: calendar grid views — subtle teal tint, active = green:1559
- Feat 2: Lista de Eventos subtabs:1562
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1579
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1581
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1593
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1597
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1603
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1618
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1628
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1651
- Perímetro puente: capa inferior a eventos:1653
- Bright past: bombilla override:1667
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1671
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1676
- Quad label 3 lines:1681
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1688
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1690
- Events list view:1692
- Event form overlay (inside eventsOverlay):1706
- Relleno, para que haga pareja con el naranja de "Editar evento":1736
- Event detail:1742
- LOGO POPUP:1750
- Gallery:1759
- BD ALARM VIP TOGGLE:1768
- RESPONSIVE (mobile header):1771
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1773
- ALARM PANEL:1826
- Drum picker (selector giratorio de hora/minuto):1831
- Confirmación alarma en el pasado:1857
- Botón flotante "Listo" en modo Editar VIPs:1863
- Controles inline long-press cumpleaños:1866
- Selector de clase en el formulario:1874
- Notas: general vs de un dia concreto:1880
- Pestana Bodas y pestana partida Vacaciones/Festivos:1884
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1885
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1896
- Filas del panel de un aviso:1910
- Estadisticas:1914
- Barras horizontales de reparto (componente generico: hBarRows):1922
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1932
- Dia cerrado: no admite mas clases:1949
- Una clase a la que le falta la hora o la sala se marca ella sola.:1960
- Fila con cambios sin guardar:1965
- Filtros de Parejas como chips pulsables:1977
- El color de la pareja va en un punto delante; el nombre, en color normal:2040
- Sala sin asignar: se marca en naranja para que cante en la lista:2045
- Nota propia del dia en la lista de Proximos:2048
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2050
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2052
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2060
- Editar siempre en naranja, como en el resto de la app:2066
- Los tres botones del detalle de pareja comparten aspecto:2083
- Subpestana Calendario de bodas:2123
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2137
- Dia resaltado al pulsar una pareja en la leyenda:2144
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2167
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2169
- etiqueta al minimo: el nombre de la pareja necesita el resto:2178
- el color de la pareja va en un punto, no tinendo el nombre:2181
- Los tres botones de la pareja, en una sola linea:2188
- Buscador y boton de anadir en la misma fila:2191
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2197
- Horario distinto segun el dia:2201
- Selector de icono de rutina:2207
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2247
- Diálogo: modo de importación (añadir vs reemplazar):2262
- PRINT:2275
- Separacion de siluetas incluso entre grosores distintos.:2295
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2310
- Editar: tono comun, con geometria propia de cada pantalla.:2322
- Marca oficial con transparencia; conserva contraste en ambos temas.:2339
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2360
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2378
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2404
- Text edits retain the solid orange; only standalone pencils use a tint.:2413
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2420
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2456
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2471
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2481
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2493
- Titulo y estado separados para que "saltada" nunca quede tachado.:2513
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2523
- El titulo queda dentro del borde de 1.5px de su caja continua.:2528
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2534
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2550
- Una identidad de color por ventana para ambos juegos de iconos.:2554

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:468-470 · .ah-donut:478-480 · .ah-section:465-467 · .ah-total:475-477 · .ah-vs:471-474 · .alarm-cfg:1827-1827 · .alarm-colon:1830-1830 · .alarm-create:1844-1850 · .alarm-day:1854-1856 · .alarm-days:1851-1853 · .alarm-msg:1840-1841 · .alarm-panel:1828-1828 · .alarm-past:1858-1862 · .alarm-time:1829-1829 · .analisis-card:617-619 · .analisis-cards:606-606 · .analisis-hbar:620-625 · .analisis-input:635-638 · .analisis-ins:644-649 · .analisis-insurance:643-643 · .analisis-mortgage:626-642 · .app-logo:61-61 · .app-version:126-126 · .bd-alarm:1461-1770 · .bd-detail:1543-1550 · .bd-export:265-265 · .bday-add:1118-1119 · .bday-badge:1048-1050 · .bday-buscar:1080-1082 · .bday-cancel:1065-1066 · .bday-cell:1041-1124 · .bday-hdr:1035-2406 · .bday-header:2400-2402 · .bday-ic:1868-1872 · .bday-inline:1867-1867 · .bday-io:1086-1102 · .bday-jump:2302-2343 · .bday-list:1052-1076 · .bday-listo:1864-1864 · .bday-month:1051-2418 · .bday-next:2352-2353 · .bday-num:1046-1046 · .bday-search:1083-1085 · .bday-upcoming:1104-2300 · .bday-vip:1054-1458 · .bday-week:1036-1038 · .boda-actions:2075-2075 · .boda-add:2077-2077 · .boda-asg:2100-2122 · .boda-buscar:2192-2194 · .boda-cal:2124-2147 · .boda-card:1983-2200 · .boda-catalog:2329-2337 · .boda-cfg:2379-2391 · .boda-chip:1979-1981 · .boda-chips:1978-1978 · .boda-cl:2037-2074 · .boda-class:1961-2036 · .boda-config:2325-2376 · .boda-controls:1939-1939 · .boda-count:2333-2333 · .boda-couple:2019-2021 · .boda-cpk:2091-2099 · .boda-date:2076-2411 · .boda-day:1955-2366 · .boda-det:2082-2190 · .boda-dia:2026-2028 · .boda-dot:1987-1987 · .boda-falta:1994-1994 · .boda-field:2367-2372 · .boda-filter:2305-2307 · .boda-filters:1942-1942 · .boda-fsel:1943-1946 · .boda-ftoggles:1947-1948 · .boda-hd:2070-2072 · .boda-inp:2014-2014 · .boda-iss:1911-1913 · .boda-issue:1898-1909 · .boda-issues:1897-1897 · .boda-legend:2078-2081 · .boda-mini:2064-2313 · .boda-mode:1929-1931 · .boda-multi:2029-2034 · .boda-name:1988-1988 · .boda-ok:1995-1995 · .boda-pack:2334-2335 · .boda-pfilters:2304-2308 · .boda-place:2022-2047 · .boda-prog:1990-1991 · .boda-ro:2038-2046 · .boda-save:1975-1976 · .boda-savebar:1971-1974 · .boda-search:2195-2195 · .boda-sec:1895-1895 · .boda-sobra:1996-1996 · .boda-sort:2196-2196 · .boda-stat:1916-1921 · .boda-stats:1915-1915 · .boda-sticky:1891-2389 · .boda-sum:1935-1938 · .boda-summary:1934-1934 · .boda-swap:2004-2011 · .boda-teachers:2354-2354 · .boda-time:2015-2015 · .boda-tp:2148-2151 · .boda-wed:1989-1989 · .bottom-sheet:172-173 · .btn-icon:103-1816 · .csv-export:76-77 · .data-actions:99-2551 · .data-btn:100-2561 · .data-menu:119-125 · .day-cell:140-243 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:72-81 · .dp-actions:1357-1358 · .dp-counter:1344-1345 · .dp-day:1352-1356 · .dp-days:1351-1351 · .dp-grid:1346-1346 · .dp-handle:1339-1339 · .dp-hdr:1340-1340 · .dp-mhdr:1349-1350 · .dp-mname:1348-1348 · .dp-month:1347-1347 · .dp-overlay:1335-1338 · .dp-sheet:1337-1337 · .dp-title:1341-1341 · .dp-yearnav:1342-1343 · .drum-picker:1833-1836 · .drum-sel:1839-1839 · .drum-wrap:1832-1838 · .econ-add:552-553 · .econ-ahorro:773-780 · .econ-annual:382-382 · .econ-avg:383-700 · .econ-bracket:535-541 · .econ-calc:683-684 · .econ-casc:687-694 · .econ-cascade:686-686 · .econ-chart:565-566 · .econ-comp:543-567 · .econ-decl:530-704 · .econ-distrib:1010-1024 · .econ-donut:791-806 · .econ-equiv:1005-1008 · .econ-fiscal:784-789 · .econ-formula:402-405 · .econ-gastos:706-718 · .econ-gear:502-503 · .econ-hdr:424-504 · .econ-ingresado:390-390 · .econ-irpf:720-782 · .econ-legend:568-569 · .econ-line:563-564 · .econ-month:407-420 · .econ-mr:1002-1003 · .econ-multi:994-1004 · .econ-opt:679-682 · .econ-qcard:372-379 · .econ-qcell:368-1777 · .econ-qm:377-377 · .econ-qmonth:375-376 · .econ-quarter:364-1774 · .econ-rate:506-514 · .econ-row:391-401 · .econ-sc:545-1031 · .econ-scenario:544-544 · .econ-section:421-421 · .econ-sim:571-581 · .econ-stats:518-523 · .econ-sub:427-433 · .econ-tab:425-2539 · .econ-toggle:525-528 · .econ-val:406-406 · .est-btn:438-442 · .est-card:448-450 · .est-detail:445-445 · .est-field:457-463 · .est-fields:456-456 · .est-group:436-440 · .est-modo:451-451 · .est-nav:435-2538 · .est-section:444-444 · .est-tariff:446-455 · .ev-alarm:1484-2059 · .ev-ann:1390-1625 · .ev-annual:1161-1666 · .ev-badge:1691-1691 · .ev-badges:1589-1589 · .ev-bar:1645-1645 · .ev-bars:1582-1582 · .ev-barsize:1308-1317 · .ev-bficha:2174-2174 · .ev-bfila:2175-2184 · .ev-bpunto:2182-2182 · .ev-bright:1668-1678 · .ev-btn:1729-1738 · .ev-bver:2187-2187 · .ev-car:1604-2171 · .ev-cell:1125-1687 · .ev-char:1718-1718 · .ev-checkbox:1723-1723 · .ev-chip:1433-2319 · .ev-color:1238-1257 · .ev-colors:1719-1719 · .ev-date:1720-1720 · .ev-dates:1330-1332 · .ev-day:1592-1636 · .ev-daynote:1882-1882 · .ev-del:2259-2260 · .ev-detail:1259-2168 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1381-1733 · .ev-field:1712-1713 · .ev-filter:1428-2318 · .ev-form:1707-1728 · .ev-hdr:1442-1554 · .ev-hora:1165-1165 · .ev-input:1714-1715 · .ev-io:1088-1741 · .ev-kind:1875-1879 · .ev-list:1563-2258 · .ev-month:1571-1571 · .ev-multi:1586-2320 · .ev-note:1881-1881 · .ev-num:1689-1689 · .ev-otros:1306-1641 · .ev-puente:1654-1654 · .ev-quad:1376-1683 · .ev-repeat:1724-1724 · .ev-rut:1632-2519 · .ev-search:2249-2253 · .ev-sep:1188-1188 · .ev-shape:1318-1325 · .ev-sort:2254-2299 · .ev-stepped:1647-1649 · .ev-textarea:1716-1717 · .ev-toggle:1721-1722 · .ev-type:1231-1239 · .ev-types:1566-1568 · .ev-up:1150-2484 · .ev-upcoming:325-2051 · .ev-viaje:1166-1174 · .ev-view:1555-2312 · .ev-wd:1726-1727 · .ev-week:321-1652 · .ev-weekday:1725-1725 · .ev-wk:1175-2532 · .excl-item:351-516 · .excl-row:331-515 · .fiscal-add:672-835 · .fiscal-bracket:663-671 · .fiscal-compras:864-899 · .fiscal-copy:499-501 · .fiscal-custom:660-660 · .fiscal-ded:874-888 · .fiscal-desgrav:837-889 · .fiscal-despacho:901-922 · .fiscal-error:676-676 · .fiscal-gasto:808-870 · .fiscal-gastos:890-890 · .fiscal-hdr:820-820 · .fiscal-highlight:861-861 · .fiscal-onoff:903-904 · .fiscal-pct:661-670 · .fiscal-period:816-817 · .fiscal-radio:655-659 · .fiscal-save:674-675 · .fiscal-section:653-828 · .fiscal-sticky:825-825 · .fiscal-subsection:829-830 · .fiscal-tab:821-2536 · .fiscal-viaje:831-832 · .fiscal-vinc:914-915 · .fiscal-year:495-498 · .full-overlay:246-247 · .hbar-lbl:1925-1925 · .hbar-row:1924-1924 · .hbar-rows:1923-1923 · .hbar-track:1926-1927 · .hbar-val:1928-1928 · .header:57-1819 · .header-brand:60-60 · .hip-add:992-992 · .hip-auto:943-943 · .hip-bar:929-936 · .hip-cancel:979-979 · .hip-cf:948-953 · .hip-edit:975-977 · .hip-g2:947-947 · .hip-grid:941-941 · .hip-period:981-990 · .hip-resumen:924-928 · .hip-ro:966-973 · .hip-save:978-978 · .hip-section:942-991 · .hip-stat:938-940 · .hip-stats:937-937 · .hip-sub:945-945 · .hip-vinc:944-944 · .hip-vr:955-964 · .home-popup:1516-1525 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:266-266 · .imp-mode:2263-2273 · .io-peligro:1093-1101 · .io-primaria:1092-1099 · .logo-gallery:1760-1767 · .logo-popup:1751-1758 · .macro-section:1527-1528 · .macro-url:1529-2316 · .mg-budget:482-491 · .mg-cat:492-492 · .mg-desgrav:493-493 · .mg-sort:488-488 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-92 · .ms-breakdown:353-353 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:354-354 · .nav-bar:1438-1823 · .nav-btn:65-66 · .nav-icon:2569-2579 · .nav-pro:2545-2546 · .nav-style:2567-2567 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1437-1439 · .rate-input:361-2292 · .rate-label:360-360 · .rate-row:359-359 · .rate-suffix:362-362 · .rut-add:2231-2231 · .rut-cancelled:2460-2514 · .rut-card:2214-2229 · .rut-day:2222-2238 · .rut-days:2221-2236 · .rut-dot:2217-2217 · .rut-hist:2243-2246 · .rut-history:2434-2454 · .rut-hora:2206-2224 · .rut-hpd:2202-2432 · .rut-icon:2208-2417 · .rut-name:2218-2218 · .rut-pct:2230-2230 · .rut-prox:2225-2227 · .rut-sec:2213-2213 · .rut-skipped:2515-2516 · .rut-stat:2240-2242 · .rut-sug:2232-2235 · .rut-susp:2239-2239 · .rut-tag:2219-2220 · .rut-vacio:2228-2228 · .rut-week:2433-2433 · .rut-wpick:2161-2166 · .selected:2576-2576 · .sent-badge:136-136 · .settings-details:2355-2357 · .settings-edit:2317-2358 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:583-587 · .sim-field:572-573 · .sim-hr:582-582 · .sim-period:579-579 · .sim-target:574-578 · .sub-block:608-609 · .sub-row:610-616 · .sw-upd:203-203 · .sy-back:252-2283 · .sy-body:272-2281 · .sy-card:283-2287 · .sy-cards3:275-275 · .sy-cards4:276-276 · .sy-chart:301-301 · .sy-hdr:257-257 · .sy-header:251-2282 · .sy-lbl:292-2286 · .sy-list:305-356 · .sy-month:319-319 · .sy-nav:261-1680 · .sy-note:302-304 · .sy-pdf:263-264 · .sy-puente:311-1456 · .sy-section:273-274 · .sy-spain:277-282 · .sy-sublbl:381-381 · .sy-suelto:316-318 · .sy-tab:1444-1447 · .sy-table:293-2288 · .sy-td:298-298 · .sy-tr:299-2289 · .sy-val:288-2285 · .sy-year:254-2284 · .toast:192-208 · .toast-undo:205-205 · .today-btn:67-68 · .vac-config:327-329 · .vip-no:1060-1061 · .week-actions:161-161 · .week-card:130-225 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129 · .wm-logo:2340-2464

