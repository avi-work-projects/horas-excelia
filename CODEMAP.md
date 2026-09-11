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

### js/data-integrity.js  _(129 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:77

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 · visit:27 · hour:43 · days:44 · schedule:45 · validBirthday:69 · prepareImportRelations:70 · loadMailConfig:78 · saveMailConfig:81 · birthdayValidation:84 · rutLimitExceeded:89 · legacy:118

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

### js/events-bind.js  _(515 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:68 · _bindEvNav:77 (!193) · _scrollWeekToMonth:85 · _scrollWeekToToday:132 · doScroll:142 · _bindEvCal:270 (!91) · _bindEvListas:361 (!121) · apply:470 · _bindEvGestos:482 · _evSwipeUpcoming:495 · _evSwipeBodas:502 · _evSwipeRutinas:509

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

### js/events-render.js  _(614 líneas)_
**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!178) · fd2:50 · renderEvItem:51 · renderEvPanel:101 · renderEvByTypes:221 · coincide:247 · renderEvMonthsView:293 · _evWeekLanes:304 · assign:307 · renderEvWeek:321 (!136) · hexA:325 · renderEvContent:457 (!157)

### js/events.js  _(789 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:54 · EV_QUAD_YEAR:55 · EV_QUAD_MONTH:56 · EV_TO_SUBTAB:57 · EV_TYPES_FILTER:58 · EV_TYPES_PAST:59 · EV_LIST_SORT:60 · EV_LIST_SEARCH:61 · EV_COLORS:62 · EVENTS:63 · EV_ALARM_SK:92 · EV_ALARMS_SET:93 · EV_NO_RUT:185 · EV_MAX_BAR_DIA:241 · EV_MARK_ORDER:346 · EV_MAX_PUNT_DIA:387 · EV_MAX_RUT_DIA:388 · EV_CAL_CORNER_STACK:391 · EV_MAX_VIP_DIA:393 · EV_CAL_VIP_MAX:394 · EV_UP_SHOW_RUT:396 · EV_UP_SHOW_BODA:397 · EV_BAR_Z:446 · EV_COMPARTE_DIA:450 · EV_MNS:642 · EV_CAR:685 · EV_TRANSPORTES:704 · EV_TRANS_EMOJI:710 · EV_DATE_INDEX:775

**Funciones:** evFilterGroup:44 · saveEvents:87 · loadEvAlarms:94 · saveEvAlarms:95 · _findBdayByEvId:96 · isEvAlarmSet:108 · setEvAlarmState:114 · evDk:121 · _evClampDate:130 · eventOccursOn:134 · getEventsOn:178 · evSignature:193 · evMergeIncoming:203 · evMergeMsg:228 · _fmtDayEs:240 · evBarLimitExceeded:242 · evDayLimitExceeded:252 · rutDayCount:288 · hasUpcomingEvent:295 · updateEventsBtn:304 · evDefaultShape:318 · evMarkerHtml:324 · evMorePlusHtml:338 · evMarkPriority:347 · evBodaMinutes:354 · evSortMarks:365 · ev0:366 · evAnnualXsHtml:398 · vipStarSvgHtml:408 · evIsoDate:420 · _isVipBdayTooFar:421 · evUpcomingMarkHtml:428 · _evRowOcc:447 · evComparteDia:451 · _evSoloSeRozan:456 · _evTrozosSeRozan:467 · _evAssignRow:475 · _evMarcarMitades:489 · _evMitadesStyle:504 · evBarZ:511 · _evBarSegments:515 · _evBarBand:539 · _evBarSegmentStyle:545 · _evBarExtent:550 · _evRoundedOutline:561 · near:570 · _evBarMutedColor:589 · _evSteppedBar:592 · _evAnnualCtx:645 · visible:646 · _evLoadPuentes:664 · _evScheduleRemove:692 · _evCancelRemove:693 · evStartTime:712 · evEndTime:718 · evTimeLabel:725 · evTramos:732 · evTramoTexto:743 · evMinutosDe:750 · _positionEvBright:760 · withEventDateIndex:776

### js/home-popup.js  _(84 líneas)_
**Funciones:** dismissPopup:75

### js/import-export.js  _(525 líneas)_
**Funciones:** _lsJson:259 · askImportMode:266 · close:278 · _mergeMap:292 · _mergeList:303 · _sigEvent:313 · _sigCouple:315 · _sigAlarm:316 · _sigGasto:317 · _keyId:319 · _keyBday:320 · _keyGasto:321 · _exportPerYearKeys:327 (!81) · _applyFullImport:408 (!117)

### js/init.js  _(489 líneas)_
**Estado global:** DRUM_ITEM_H:140 · DN_ES:297

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:141 · updateDrumSelected:169 · getDrumValue:175 · checkDrumMinuteWrap:181 · buildAlarmDayBtns:212 · showAlarmPastConfirm:242 · proceed:283 · setConnectionsEditing:359 · aplicarActualizacion:419 · reload:425 · _showUpdateBar:446 · _buscar:476

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas-history.js  _(114 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · renderRutHistory:41 · openRutHistory:71 · closeRutHistory:86 · rutEditSession:87 · openRutHistoryEdit:96 · close:102

### js/rutinas.js  _(867 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:315 · RUT_WEEK_SEL:652 · RUT_WEEK_CAL:653

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:122 · rutById:129 · rutWeekKey:134 · rutTimeOfDay:143 · rutTieneHorarios:148 · rutScheduleOn:156 · rutScheduleCopy:161 · rutDurationOn:165 · rutChangeFrom:169 · rutChangeWeek:193 · update:197 · rutWeekCfg:209 · rutSuspendedOn:219 · rutDiaLleno:228 · rutOccursOn:232 · rutIsSkipped:241 · rutToggleSkip:242 · rutFin:247 · rutEventsOn:255 · rutEventFromId:272 · rutSessions:281 · rutStats:295 · rutProximas:308 · renderRutinasBody:318 · _renderRutLista:329 · _rutFmt:387 · _rutFmtCorto:388 · _renderRutStats:394 · renderRutForm:441 · openRutForm:503 (!144) · _rutRepaintIcons:509 · _rutPintaHoras:534 · closeRutForm:647 · openRutWeek:654 · _rutWeekPick:663 · _rutWeekRender:715 (!80) · closeRutWeek:795 · openRutSesion:798 · closeRutSesion:827 · bindRutinasEvents:830

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2512 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:19
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):37
- HEADER:56
- JORNADA DEFECTO:70
- Barra vertical que separa la campana del bloque de navegacion:107
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:113
- Punto verde notificación en botones bday/events cuando hay items próximos:122
- WEEK CARDS:133
- WEEK ACTIONS:165
- BOTTOM SHEET (day type selector):174
- TOAST:196
- Tema claro: el fondo oscuro con letra de color no se leia bien:203
- SW UPDATE BUTTON (en menú ⋯):207
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:211
- ANIMATIONS:215
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:244
- OVERLAY BASE (summary, econ, bday, events):250
- SHARED OVERLAY HEADER:255
- SHARED BODY:276
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:325
- Vacaciones config:331
- Quitar festivos/vacaciones checkboxes:335
- Month summary breakdown:357
- Ausencia list tag:360
- ECONOMICS:363
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:368
- Summary sublabel (hours breakdown):385
- Ingresado box (formerly cobrado) — neutral:394
- ECONOMICS v2: tabs + nuevas secciones:428
- Estudio Cambio — grouped nav:439
- Estudio — tariff comparison cards:448
- Análisis hipoteca — secciones organizadas:469
- Mis gastos — budget table:486
- Year selector for per-year fiscal tabs:499
- §1.1 Tarifa dual:510
- §1.3 Stats por hora/día:522
- §1.4 Toggles:529
- §1.5 Declaración IRPF:534
- Tab 2: Comparador:547
- Calcular Tarifa (sim):575
- Scenario zones (Comparar Escenarios):593
- Análisis Ec. Personal:610
- Bloques de la Subrogación:612
- Fiscal config modal — purple theme override:655
- Fiscal config modal:657
- ECONOMICS v3: opt-buttons, cascade, gastos:683
- Cascade ingresos/gastos:690
- Media mensual: cards:700
- Tab 4: Análisis:710
- IRPF Breakdown visual:724
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:751
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):753
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):777
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:786
- Resumen fiscal al final de Ingresos y Gastos:788
- Donut chart:795
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):805
- Fiscal config: gastos items:812
- Fiscal: tab bar:824
- Fiscal: sticky save:829
- Fiscal: section title income/expense colors:831
- Fiscal: desgravaciones:841
- Fiscal: compras profesionales:868
- Desgravaciones: notas + tabla despacho info:876
- Nota IVA compras:896
- IVA por item en compras:898
- Fiscal: despacho en casa:905
- Hipoteca — resumen visual:928
- Hipoteca — compact 2-col grid:951
- Hipoteca — compact vinculaciones:959
- Hipoteca — read-only fields:970
- Hipoteca — edit/detail buttons:979
- Hipoteca — period summary card:985
- Multi-rate period cards:998
- Distribución de ingresos:1014
- Comparador: reorder buttons:1030
- Rate input styled:1034
- BIRTHDAYS:1038
- Cabe el nombre entero, hasta en tres lineas:1052
- VIP controls bar:1058
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1069
- VIP edit mode item states:1072
- Feat 1: Buscador en lista por meses:1082
- Upcoming birthdays:1108
- Weekend frame — gris lavanda suave:1125
- Hoy manda sobre el gris del fin de semana:1128
- Events in puentes (summary) — one per line:1148
- Events upcoming view:1152
- Minicabecera de día dentro de un panel de Próximos:1154
- Marcador de la tarjeta de Proximos: la forma real del evento:1164
- Horas del evento y transporte de ida/vuelta:1169
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1201
- Grid del mes: col fecha (48px) + col eventos (1fr):1203
- Columna fecha (col 1):1205
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1214
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1221
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1225
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1231
- Event color type picker:1235
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1241
- Color picker avanzado (paleta 6×8 + color libre):1245
- Detail color picker toggle:1263
- Annual events calendar:1269
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1299
- Selector de formas en el formulario de evento (Otros):1310
- Selector de grosor de barra (grande | Otros):1312
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1327
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1331
- Inicio/Fin bloqueados cuando hay Selección Multidía:1334
- Mini-overlay para elegir días específicos (Otros):1339
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1366
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1370
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1372
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1378
- Calendario 4 meses: 2 columnas × 2 filas:1380
- Botón ir al calendario mensual en puentes del resumen:1382
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1394
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1398
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1416
- Dropdown de vista anual:1423
- Linea que separa los chips de eventos grandes de los puntuales:1432
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1441
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1445
- Summary tabs — nivel 2:1448
- BRIDGE DAY CELLS in summary:1453
- VIP BIRTHDAYS:1462
- BIRTHDAY + EVENT ALARM PANEL:1465
- Campana de alarma en items de próximos (bday + eventos):1468
- 3-ZONE ALARM MARKER:1506
- ALARM MANAGEMENT OVERLAY:1519
- HOME POPUP (semanas pendientes / VIP sin alarma):1520
- MACRO URL EN MENÚ:1531
- Feat 4: Nav-bar emoji alignment:1537
- Birthday detail / form overlays:1553
- EVENTS:1563
- Zone A: upcoming/list views — subtle blue tint:1569
- Zone B: calendar grid views — subtle teal tint, active = green:1571
- Feat 2: Lista de Eventos subtabs:1580
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1597
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1599
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1611
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1615
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1621
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1636
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1646
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1669
- Perímetro puente: capa inferior a eventos:1671
- Bright past: bombilla override:1685
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1689
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1694
- Quad label 3 lines:1699
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1706
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1708
- Events list view:1710
- Event form overlay (inside eventsOverlay):1724
- Relleno, para que haga pareja con el naranja de "Editar evento":1754
- Event detail:1760
- LOGO POPUP:1768
- Gallery:1777
- BD ALARM VIP TOGGLE:1786
- RESPONSIVE (mobile header):1789
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1791
- ALARM PANEL:1844
- Drum picker (selector giratorio de hora/minuto):1849
- Confirmación alarma en el pasado:1875
- Botón flotante "Listo" en modo Editar VIPs:1881
- Controles inline long-press cumpleaños:1884
- Selector de clase en el formulario:1892
- Notas: general vs de un dia concreto:1898
- Pestana Bodas y pestana partida Vacaciones/Festivos:1902
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1907
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1920
- Filas del panel de un aviso:1934
- Estadisticas:1938
- Barras horizontales de reparto (componente generico: hBarRows):1946
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1956
- Dia cerrado: no admite mas clases:1973
- Una clase a la que le falta la hora o la sala se marca ella sola.:1984
- Fila con cambios sin guardar:1989
- Filtros de Parejas como chips pulsables:2001
- El color de la pareja va en un punto delante; el nombre, en color normal:2064
- Sala sin asignar: se marca en naranja para que cante en la lista:2069
- Nota propia del dia en la lista de Proximos:2072
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2074
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2076
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2084
- Editar siempre en naranja, como en el resto de la app:2090
- Los tres botones del detalle de pareja comparten aspecto:2107
- Subpestana Calendario de bodas:2147
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2161
- Dia resaltado al pulsar una pareja en la leyenda:2168
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2195
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2197
- etiqueta al minimo: el nombre de la pareja necesita el resto:2206
- el color de la pareja va en un punto, no tinendo el nombre:2209
- Los tres botones de la pareja, en una sola linea:2216
- Buscador y boton de anadir en la misma fila:2219
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2225
- Horario distinto segun el dia:2229
- Selector de icono de rutina:2235
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2275
- Diálogo: modo de importación (añadir vs reemplazar):2290
- PRINT:2303
- Separacion de siluetas incluso entre grosores distintos.:2323
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2338
- Editar: tono comun, con geometria propia de cada pantalla.:2350
- Marca oficial con transparencia; conserva contraste en ambos temas.:2367
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2388
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2406
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2432
- Text edits retain the solid orange; only standalone pencils use a tint.:2441
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2448
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2484
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2503

**Rangos por prefijo de clase:** 
.action-btn:167-171 · .ah-cuota:473-475 · .ah-donut:483-485 · .ah-section:470-472 · .ah-total:480-482 · .ah-vs:476-479 · .alarm-cfg:1845-1845 · .alarm-colon:1848-1848 · .alarm-create:1862-1868 · .alarm-day:1872-1874 · .alarm-days:1869-1871 · .alarm-msg:1858-1859 · .alarm-panel:1846-1846 · .alarm-past:1876-1880 · .alarm-time:1847-1847 · .analisis-card:622-624 · .analisis-cards:611-611 · .analisis-hbar:625-630 · .analisis-input:640-643 · .analisis-ins:649-654 · .analisis-insurance:648-648 · .analisis-mortgage:631-647 · .app-logo:61-61 · .app-version:131-131 · .bd-alarm:1466-1788 · .bd-detail:1554-1561 · .bd-export:270-270 · .bday-add:1123-1124 · .bday-badge:1053-1055 · .bday-buscar:1085-1087 · .bday-cancel:1070-1071 · .bday-cell:1046-1129 · .bday-hdr:1040-2434 · .bday-header:2428-2430 · .bday-ic:1886-1890 · .bday-inline:1885-1885 · .bday-io:1091-1107 · .bday-jump:2330-2371 · .bday-list:1057-1081 · .bday-listo:1882-1882 · .bday-month:1056-2446 · .bday-next:2380-2381 · .bday-num:1051-1051 · .bday-search:1088-1090 · .bday-upcoming:1109-2328 · .bday-vip:1059-1463 · .bday-week:1041-1043 · .boda-actions:2099-2099 · .boda-add:2101-2101 · .boda-asg:2124-2146 · .boda-buscar:2220-2222 · .boda-cal:2148-2171 · .boda-card:2007-2228 · .boda-catalog:2357-2365 · .boda-cfg:2407-2419 · .boda-chip:2003-2005 · .boda-chips:2002-2002 · .boda-cl:2061-2098 · .boda-class:1985-2060 · .boda-config:2353-2404 · .boda-controls:1963-1963 · .boda-count:2361-2361 · .boda-couple:2043-2045 · .boda-cpk:2115-2123 · .boda-date:2100-2439 · .boda-day:1979-2394 · .boda-det:2106-2218 · .boda-dia:2050-2052 · .boda-dot:2011-2011 · .boda-falta:2018-2018 · .boda-field:2395-2400 · .boda-filter:2333-2335 · .boda-filters:1966-1966 · .boda-fsel:1967-1970 · .boda-ftoggles:1971-1972 · .boda-hd:2094-2096 · .boda-inp:2038-2038 · .boda-iss:1935-1937 · .boda-issue:1922-1933 · .boda-issues:1921-1921 · .boda-legend:2102-2105 · .boda-mini:2088-2341 · .boda-mode:1953-1955 · .boda-multi:2053-2058 · .boda-name:2012-2012 · .boda-ok:2019-2019 · .boda-pack:2362-2363 · .boda-pfilters:2332-2336 · .boda-place:2046-2071 · .boda-prog:2014-2015 · .boda-ro:2062-2070 · .boda-save:1999-2000 · .boda-savebar:1995-1998 · .boda-search:2223-2223 · .boda-sec:1919-1919 · .boda-sobra:2020-2020 · .boda-sort:2224-2224 · .boda-stat:1940-1945 · .boda-stats:1939-1939 · .boda-sticky:1915-2417 · .boda-sum:1959-1962 · .boda-summary:1958-1958 · .boda-swap:2028-2035 · .boda-teachers:2382-2382 · .boda-time:2039-2039 · .boda-tp:2172-2175 · .boda-wed:2013-2013 · .bottom-sheet:177-178 · .btn-icon:103-1834 · .csv-export:76-77 · .data-actions:99-1836 · .data-btn:100-1832 · .data-menu:124-130 · .day-cell:145-248 · .day-date:150-150 · .day-hours:151-151 · .day-name:149-149 · .day-status:158-158 · .days-grid:144-144 · .default-hours:72-81 · .dp-actions:1362-1363 · .dp-counter:1349-1350 · .dp-day:1357-1361 · .dp-days:1356-1356 · .dp-grid:1351-1351 · .dp-handle:1344-1344 · .dp-hdr:1345-1345 · .dp-mhdr:1354-1355 · .dp-mname:1353-1353 · .dp-month:1352-1352 · .dp-overlay:1340-1343 · .dp-sheet:1342-1342 · .dp-title:1346-1346 · .dp-yearnav:1347-1348 · .drum-picker:1851-1854 · .drum-sel:1857-1857 · .drum-wrap:1850-1856 · .econ-add:557-558 · .econ-ahorro:778-785 · .econ-annual:387-387 · .econ-avg:388-705 · .econ-bracket:540-546 · .econ-calc:688-689 · .econ-casc:692-699 · .econ-cascade:691-691 · .econ-chart:570-571 · .econ-comp:548-572 · .econ-decl:535-709 · .econ-distrib:1015-1029 · .econ-donut:796-811 · .econ-equiv:1010-1013 · .econ-fiscal:789-794 · .econ-formula:407-410 · .econ-gastos:711-723 · .econ-gear:507-508 · .econ-hdr:429-509 · .econ-ingresado:395-395 · .econ-irpf:725-787 · .econ-legend:573-574 · .econ-line:568-569 · .econ-month:412-425 · .econ-mr:1007-1008 · .econ-multi:999-1009 · .econ-opt:684-687 · .econ-qcard:377-384 · .econ-qcell:373-1795 · .econ-qm:382-382 · .econ-qmonth:380-381 · .econ-quarter:369-1792 · .econ-rate:511-519 · .econ-row:396-406 · .econ-sc:550-1036 · .econ-scenario:549-549 · .econ-section:426-426 · .econ-sim:576-586 · .econ-stats:523-528 · .econ-sub:432-438 · .econ-tab:430-431 · .econ-toggle:530-533 · .econ-val:411-411 · .est-btn:443-447 · .est-card:453-455 · .est-detail:450-450 · .est-field:462-468 · .est-fields:461-461 · .est-group:441-445 · .est-modo:456-456 · .est-nav:440-440 · .est-section:449-449 · .est-tariff:451-460 · .ev-alarm:1489-2083 · .ev-ann:1395-1643 · .ev-annual:1166-1684 · .ev-badge:1709-1709 · .ev-badges:1607-1607 · .ev-bar:1663-1663 · .ev-bars:1600-1600 · .ev-barsize:1313-1322 · .ev-bficha:2202-2202 · .ev-bfila:2203-2212 · .ev-bpunto:2210-2210 · .ev-bright:1686-1696 · .ev-btn:1747-1904 · .ev-bver:2215-2215 · .ev-car:1622-2199 · .ev-cell:1130-1705 · .ev-char:1736-1736 · .ev-checkbox:1741-1741 · .ev-chip:1438-2347 · .ev-color:1243-1262 · .ev-colors:1737-1737 · .ev-date:1738-1738 · .ev-dates:1335-1337 · .ev-day:1610-1654 · .ev-daynote:1900-1900 · .ev-del:2287-2288 · .ev-detail:1264-2196 · .ev-dot:163-163 · .ev-dots:162-162 · .ev-edit:1386-1751 · .ev-field:1730-1731 · .ev-filter:1433-2346 · .ev-form:1725-1746 · .ev-hdr:1447-1565 · .ev-hora:1170-1170 · .ev-input:1732-1733 · .ev-io:1093-1759 · .ev-kind:1893-1897 · .ev-list:1581-2286 · .ev-month:1589-1589 · .ev-multi:1604-2348 · .ev-note:1899-1899 · .ev-num:1707-1707 · .ev-otros:1311-1659 · .ev-puente:1672-1672 · .ev-quad:1381-1701 · .ev-repeat:1742-1742 · .ev-rut:1650-2491 · .ev-search:2277-2281 · .ev-sep:1193-1193 · .ev-shape:1323-1330 · .ev-sort:2282-2327 · .ev-stepped:1665-1667 · .ev-textarea:1734-1735 · .ev-toggle:1739-1740 · .ev-type:1236-1244 · .ev-types:1584-1586 · .ev-up:1155-1168 · .ev-upcoming:330-2075 · .ev-viaje:1171-1179 · .ev-view:1566-2340 · .ev-wd:1744-1745 · .ev-week:326-1670 · .ev-weekday:1743-1743 · .ev-wk:1180-2500 · .ev-zone:1570-2494 · .excl-item:356-521 · .excl-row:336-520 · .fiscal-add:677-840 · .fiscal-bracket:668-676 · .fiscal-compras:869-904 · .fiscal-copy:504-506 · .fiscal-custom:665-665 · .fiscal-ded:879-893 · .fiscal-desgrav:842-894 · .fiscal-despacho:906-927 · .fiscal-error:681-681 · .fiscal-gasto:813-875 · .fiscal-gastos:895-895 · .fiscal-hdr:825-825 · .fiscal-highlight:866-866 · .fiscal-onoff:908-909 · .fiscal-pct:666-675 · .fiscal-period:821-822 · .fiscal-radio:660-664 · .fiscal-save:679-680 · .fiscal-section:658-833 · .fiscal-sticky:830-830 · .fiscal-subsection:834-835 · .fiscal-tab:826-828 · .fiscal-viaje:836-837 · .fiscal-vinc:919-920 · .fiscal-year:500-503 · .full-overlay:251-252 · .hbar-lbl:1949-1949 · .hbar-row:1948-1948 · .hbar-rows:1947-1947 · .hbar-track:1950-1951 · .hbar-val:1952-1952 · .header:57-1837 · .header-brand:60-60 · .hip-add:997-997 · .hip-auto:948-948 · .hip-bar:934-941 · .hip-cancel:984-984 · .hip-cf:953-958 · .hip-edit:980-982 · .hip-g2:952-952 · .hip-grid:946-946 · .hip-period:986-995 · .hip-resumen:929-933 · .hip-ro:971-978 · .hip-save:983-983 · .hip-section:947-996 · .hip-stat:943-945 · .hip-stats:942-942 · .hip-sub:950-950 · .hip-vinc:949-949 · .hip-vr:960-969 · .home-popup:1521-1530 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:271-271 · .imp-mode:2291-2301 · .io-peligro:1098-1106 · .io-primaria:1097-1104 · .logo-gallery:1778-1785 · .logo-popup:1769-1776 · .macro-section:1532-1533 · .macro-url:1534-2344 · .mg-budget:487-496 · .mg-cat:497-497 · .mg-desgrav:498-498 · .mg-sort:493-493 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-92 · .ms-breakdown:358-358 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:359-359 · .nav-bar:1443-1841 · .nav-btn:65-66 · .option-desc:193-193 · .option-dot:186-190 · .option-hours:194-194 · .option-info:191-191 · .option-label:192-192 · .overlay:175-176 · .overlay-nav:1442-1444 · .rate-input:366-2320 · .rate-label:365-365 · .rate-row:364-364 · .rate-suffix:367-367 · .rut-add:2259-2259 · .rut-cancelled:2488-2490 · .rut-card:2242-2257 · .rut-day:2250-2266 · .rut-days:2249-2264 · .rut-dot:2245-2245 · .rut-hist:2271-2274 · .rut-history:2462-2482 · .rut-hora:2234-2252 · .rut-hpd:2230-2460 · .rut-icon:2236-2445 · .rut-name:2246-2246 · .rut-pct:2258-2258 · .rut-prox:2253-2255 · .rut-sec:2241-2241 · .rut-stat:2268-2270 · .rut-sug:2260-2263 · .rut-susp:2267-2267 · .rut-tag:2247-2248 · .rut-vacio:2256-2256 · .rut-week:2461-2461 · .rut-wpick:2189-2194 · .sent-badge:141-141 · .settings-details:2383-2385 · .settings-edit:2345-2386 · .sheet-handle:179-179 · .sheet-option:183-185 · .sheet-options:182-182 · .sheet-subtitle:181-181 · .sheet-title:180-180 · .sim-combo:588-592 · .sim-field:577-578 · .sim-hr:587-587 · .sim-period:584-584 · .sim-target:579-583 · .sub-block:613-614 · .sub-row:615-621 · .sw-upd:208-208 · .sy-back:257-2311 · .sy-body:277-2309 · .sy-card:288-2315 · .sy-cards3:280-280 · .sy-cards4:281-281 · .sy-chart:306-306 · .sy-hdr:262-262 · .sy-header:256-2310 · .sy-lbl:297-2314 · .sy-list:310-361 · .sy-month:324-324 · .sy-nav:266-1698 · .sy-note:307-309 · .sy-pdf:268-269 · .sy-puente:316-1461 · .sy-section:278-279 · .sy-spain:282-287 · .sy-sublbl:386-386 · .sy-suelto:321-323 · .sy-tab:1449-1452 · .sy-table:298-2316 · .sy-td:303-303 · .sy-tr:304-2317 · .sy-val:293-2313 · .sy-year:259-2312 · .toast:197-213 · .toast-undo:210-210 · .today-btn:67-68 · .vac-config:332-334 · .vip-no:1065-1066 · .week-actions:166-166 · .week-card:135-230 · .week-header:138-138 · .week-info:139-140 · .week-total:142-142 · .weeks-container:134-134 · .wm-logo:2368-2492

