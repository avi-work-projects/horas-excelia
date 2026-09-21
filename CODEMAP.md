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

### js/birthdays-render.js  _(249 líneas)_
**Estado global:** DN7:94

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:4 (!88) · getBdaysInRange:9 · bdayLabel:24 · renderGroup:33 · renderBdayCalMonth:92 · renderBdayList:133 · getEffVip:140 · renderBdayContent:182

### js/birthdays.js  _(160 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_UP_VIP:9 · BDAY_FILTER_VIP:10 · BDAY_EDIT_VIP:11 · BDAY_VIP_PENDING:12 · BDAY_ALARM_SET_KEY:66 · BDAY_ALARM_SET:67 · BDAY_ALARM_COUNT_KEY:68 · BDAY_ALARM_COUNT:69 · BDAY_PALETTE:73 · BDAYS:77

**Funciones:** _showBdayInlineCtrl:18 · tc:86 · bdName:87 · getBdayColor:89 · getBdaysOn:98 · daysUntil:100 · hasUpcomingBday:107 · updateBdayBtn:113 · getBdayAlarmKey:123 · isBdayAlarmSet:124 · setBdayAlarmState:128 · syncVipBdaysToEvents:135

### js/bodas-assign.js  _(472 líneas)_
**Estado global:** DN2:180 · BODA_ASSIGN:225

**Funciones:** bodaOpenSheet:1 · bodaCloseSheet:4 · bodaCreatedAt:10 · bodaIssues:15 · _renderBodaIssueCards:31 · card:34 · openBodaIssue:55 (!81) · findEv:97 · closeBodaIssue:136 · _bodaWeekKey:139 · _renderBodaStats:146 (!80) · openBodaAssign:226 · closeBodaAssign:245 · renderBodaAssign:249 (!82) · bindBodaAssign:331 · openBodaPlacePicker:402 · closeBodaPlacePicker:435 · bodaAplicarCampo:439 · bodaTrasElegir:449 · bodaEndAt:461

### js/bodas-bind.js  _(302 líneas)_
**Estado global:** BODA_RENDER_CLASSES:297

**Funciones:** renderBodaCoupleForm:1 · openBodaCoupleForm:30 · closeBodaCoupleForm:69 · bodaRefreshRow:73 · bindBodasEvents:102 (!184) · _guardaPendientes:106 · _bodaCalMove:117 · selectDay:132 · findClass:221 · bodaMatchesDate:286 · bodaMatchesClasses:292 · renderBodasBody:298

### js/bodas-class-form.js  _(336 líneas)_
**Estado global:** BODA_FORM:1 · BODA_TIME_H:212

**Funciones:** openBodaClaseForm:2 · _bodaFormRender:22 (!138) · closeBodaClaseForm:160 · openBodaCouplePicker:167 · row:178 · apply:195 · closeBodaCouplePicker:209 · openBodaTimePicker:215 (!85) · drum:224 · setDrum:247 · mark:255 · drumVal:259 · readManual:280 · closeBodaTimePicker:300 · openBodaDurationPicker:304 · close:309 · bodaTeachersLabel:314 · openBodaTeachersPicker:317 · close:323

### js/bodas-config.js  _(168 líneas)_
**Estado global:** BODA_CONFIG_SK:2 · BODA_CONFIG:3

**Funciones:** bodaLoadConfig:4 · bodaApplyConfig:15 · saveBodaConfig:24 · validateBodaConfig:25 · importBodaConfig:42 · bodaPackOf:58 · bodaDuration:59 · bodaDefaultDuration:60 · bodaDurationOf:61 · bodaConfigUsed:62 · bodaSetCatalogItem:66 · bodaDeleteCatalogItem:75 · bodaTaken:80 · bodaPackStats:85 · bodaTeacherName:97 · bodaTeacherCount:98 · bodaTeacherStats:99 · renderBodaPackStats:105 · renderBodaConfig:117 · openBodaConfig:136 · bindBodaConfig:137 · openBodaCatalogForm:146

### js/bodas.js  _(657 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:25 · BODA_PLACE_DEFAULT:31 · BODA_PLACE_NONE:34 · BODA_PLACE_SHORT:35 · BODA_PLACE_DESC:36 · BODA_PLACE_EMOJI:38 · BODA_WHITE:55 · BODA_SLOTS:56 · BODA_NO_TIME_COLOR:62 · BODA_NO_COUPLE_COLOR:63 · BODA_DEFAULT_TIME:64 · BODA_PALETTE:67 · BODA_CLOSED_SK:235 · BODA_CLOSED:236 · BODA_PENDING:255 · BODA_SUBTAB:297 · BODA_CLASS_MODE:298 · BODA_CLASES_SEARCH:299 · BODA_HIDE_PAST:300 · BODA_HIDE_CLOSED:301 · BODA_CARD_OPEN:302 · BODA_PAREJAS_SEARCH:303 · BODA_PAREJAS_SORT:306 · BODA_PAREJAS_CLASSES:307 · BODA_PAREJAS_FILTER:308 · BODA_CAL_DAY:309 · BODA_CAL_HL:310 · BODA_CAL_YEAR:311 · BODA_CAL_MONTH:312

**Funciones:** saveBodas:18 · bodaPlaceEmoji:39 · bodaPlaceOf:43 · bodaPlaceLabel:48 · bodaNextColor:69 · bodaCouple:77 · bodaSlot:81 · bodaSlotColors:91 · bodaMarkFor:96 · evBodaSvg:102 · bodaClasses:119 · bodaPrimeraClase:123 · bodaClassesOfCouple:127 · bodaEsUltimoEnsayo:131 · bodaUltimoEnsayoHtml:137 · bodaFreeClasses:140 · bodaClaseById:143 · bodaSortClasses:147 · bodaClassesOnDay:154 · bodaNewClass:157 · bodaNormalizeClasses:172 · bodaPlaceForNewOn:209 · bodaDayFull:214 · bodaBulkCreate:218 · bodaProgress:229 · saveBodaClosed:240 · bodaIsClosed:241 · bodaReopenDay:242 · bodaToggleClosed:246 · bodaPendingCount:256 · bodaEff:258 · bodaSetPending:267 · bodaPendingApply:271 · bodaPendingDiscard:294 · _bodaLegendHtml:315 · _renderBodaCalendario:326 (!88) · _renderBodasBody:414 · _bodaCmpFecha:444 · _renderBodaParejas:450 (!91) · _bodaFmt:541 · _bodaFmtCorto:542 · _renderBodaClases:549 (!108)

### js/core.js  _(755 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:137 · MN_SHORT:139 · DN5:386 · FESTIVOS_ANIO:605

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:144 · save:156 · loadEconYear:161 · saveEconYear:180 · fakeTrans:190 · simpleBarChart:207 · hBarRows:231 · shareOrDownload:248 · download:250 · escHtml:279 · mkey:284 · getMonthH:285 · defH:291 · dayH:292 · dayT:293 · dk:294 · fd:295 · ad:296 · fh:297 · fhP:298 · isToday:299 · isPast:300 · wn:301 · weeks:304 · homeSubmissionStatus:318 · renderHomeSubmissionStatus:323 · getWD:332 · showToast:348 · sendEmail:375 · buildMailtoBody:385 · render:407 (!99) · fmtH:483 · openSheet:506 · closeSheet:525 · selectType:531 · contarVacaciones:564 · confirmarCupoVacaciones:577 · contarFestivos:593 · confirmarCupoFestivos:606 · togSent:615 · _panelBorrarLuego:636 · _panelCancelarBorrado:647 · abrirPanel:649 · engancharFondo:669 · abrirUnaVez:687 · cerrarPanel:693 · renderNavBar:704 · bindNavBar:727 · doNav:734

### js/csv-sync.js  _(40 líneas)_
**Estado global:** CSV_EXPORT_KEY:2 · CSV_WARNED:3

**Funciones:** csvYearContent:4 · csvExportRecords:15 · csvRecordExport:18 · csvPendingWarnings:23 · csvCheckChanges:32

### js/data-integrity.js  _(160 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:108

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 · visit:27 · hour:74 · days:75 · schedule:76 · validBirthday:100 · prepareImportRelations:101 · loadMailConfig:109 · saveMailConfig:112 · birthdayValidation:115 · rutLimitExceeded:120 · legacy:149

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(703 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:333 · ESTUDIO_ELECT_CALC:334 · ESTUDIO_ELECT_IVA:335

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:235 · _renderEstudioGasComp:243 · _renderGasCompCard:303 · _calcElectCost:337 · _currentElectTariff:338 · _renderEstudioElectComp:343 · _renderElectCompCard:406 · _renderMultiScenarioResult:438 · _bindEstudioGas:506 · _bindEstudioElect:537 · _bindScenarios:568 · _readScenarios:587 · _bindCompFields:596 · _saveCompFields:630 · renderEstudioContent:645 · openEstudio:659 · closeEstudio:669 · reRenderEstudio:674 · bindEstudioEvents:682

### js/economics-fiscal-bind.js  _(554 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:22 · reRenderFiscal:28 · bindFiscalEvents:38 · _switchTab:42 · _bindYearSelector:75 · _bindTabPersonal:112 · _bindTabIrpf:161 · _bindTabGastosDesg:206 (!91) · _rebindComprasDel:255 · _bindTabIrpfDeduc:297 · _bindTabDesgrav:310 (!96) · _bindList:312 · _bindTabDespachoOnly:406 (!83) · _syncLiveD:417 · _updateFmt:455 · _saveFiscalAll:489 · _rv:518

### js/economics-fiscal-datos.js  _(337 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · FISCAL_HIP_SUB:30 · FISCAL_HIP_EDITING:31 · FISCAL_HIP_EDIT_SNAPSHOT:32 · FISCAL_HIP_DETAIL_TARGET:33 · PERSONAL_SK:39 · PERSONAL_DATA:40 · DEFAULT_PERSONAL_GASTOS_REC:42 · DEFAULT_PERSONAL_INVERSIONES:48 · INGRESOS_SK:92 · INGRESOS_ITEMS:93 · GASTOS_SK:110 · GASTOS_DIFICIL_PCT:111 · DEFAULT_GASTOS:112 · GASTOS_ITEMS:130 · COMPRAS_SK:192 · COMPRAS_IVA_ENABLED:193 · DEFAULT_COMPRAS:194 · COMPRAS_ITEMS:200 · DESGRAV_SK:247 · DESGRAV_DEFAULT:249 · DESGRAV_ITEMS:269 · OBSOLETE_IDS:272

**Funciones:** _yearKey:36 · _ensureDefaults:55 · loadPersonalYear:71 · savePersonalYear:87 · loadIngresos:94 · saveIngresos:97 · findIngreso:100 · ingresoAnual:104 · loadFiscal:132 · saveFiscal:140 · getIrpfPct:143 · getBrackets:144 · _loadGastosFromRaw:146 · loadGastosYear:164 · loadGastos:177 · saveGastosYear:178 · findGasto:181 · gastoAnual:185 · loadCompras:201 · saveCompras:218 · comprasTotal:222 · comprasIvaTotal:232 · loadDesgrav:271 · saveDesgrav:302 · desgravAnual:305 · computeTotalDesgrav:326

### js/economics-fiscal-elect.js  _(235 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:129

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:79 · _despField:94 · _despFieldMoney:103 · _renderIngresosDesgList:116 · _renderGastoItem:135 · renderGastosList:150 · _bindElectDetalle:172 · _bindSegurosNormales:219

### js/economics-fiscal-gas.js  _(113 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:75

### js/economics-fiscal-hip.js  _(1034 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipPeriodCard:365 (!87) · _hipROvinc:452 · _calcInsOvercost:462 · _renderInlineOvercost:473 · _renderHipResumen:492 (!99) · _renderHipDetalle:591 · _renderHipSectionContent:617 · _renderCompraSection:629 · _renderPrestamoSection:658 · _renderSubSection:705 · renderFiscalTabDespacho:776 · _bindTabDespacho:793 · _bindHipResumen:818 · _bindHipDetalle:843 · _rerenderSection:914 · _readSectionInputs:923 · _rv:924 · _rv_s:925 · _bindEditingSection:983

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

### js/energy-analysis-bind.js  _(37 líneas)_
**Funciones:** bindEnergyAnalysis:2 · refresh:3 · year:6 · energyBindYearChart:30

### js/energy-analysis-view.js  _(83 líneas)_
**Estado global:** ENERGY_ANALYSIS_TAB:2 · ENERGY_ANALYSIS_YEAR:3 · ENERGY_ANALYSIS_KIND:4 · ENERGY_SCENARIO:5 · ENERGY_RETURN:6

**Funciones:** energyAnalysisHtml:7 · energyConsumptionHtml:20 · energyCostsHtml:26 · energyTariffsHtml:37 · energyScenarioOptions:51 · energyComparisonHtml:58 · energyArchiveHtml:70 · closeEnergyAnalysis:75 · openEnergyAnalysis:76 · energyRefreshAnalysis:82

### js/energy-analysis.js  _(75 líneas)_
**Estado global:** ENERGY_TAX_KEY:3

**Funciones:** energyWeightedPrice:4 · energyValidateTariff:8 · energyTariffDefaults:17 · energyTariffBase:20 · energyTariffNet:30 · energyTaxes:31 · energyValidateTaxes:32 · energyMergeTaxes:36 · energySaveTaxes:37 · energyVatAt:38 · energyUtc:39 · energyDate:40 · energyBillEnd:43 · energyConsumptionMonths:48 · energySimulateMonth:64

### js/energy-bills-view.js  _(12 líneas)_
**Estado global:** ENERGY_BILLS_YEAR:1 · ENERGY_BILLS_COST:2

**Funciones:** energyNumber:3 · energyBillsChart:4 · openEnergyBills:11

### js/energy-bills.js  _(40 líneas)_
**Estado global:** ENERGY_BILLS_KEY:2

**Funciones:** energyBills:3 · validateEnergyBills:4 · energyBillSignature:20 · energyMergeBills:21 · energySaveBills:26 · energyMonthlyBills:27 · energyImportHistory:31 · energyRestoreHistory:39

### js/energy-costs.js  _(53 líneas)_
**Funciones:** energyContractOn:3 · energyContractTariff:8 · energySupplierColor:16 · energyCostMonths:21 · energyCostChart:44

### js/energy-history.js  _(49 líneas)_
**Estado global:** ENERGY_HISTORY_KEY:2

**Funciones:** energyContracts:3 · validateEnergyContracts:8 · energyContractSignature:30 · energyMergeContracts:31 · energySaveContracts:40 · energyHistoryButton:41 · energyContractStatus:42 · openEnergyHistory:47 · bindEnergyHistory:48

### js/energy-tariff-editor.js  _(51 líneas)_
**Funciones:** energyNumericField:2 · energyTariffEditorHtml:3 · openEnergyTariff:20 · close:23 · read:24 · update:25 · energyEditLegacyTariff:34 · energySendToScenarios:44

### js/events-bind.js  _(567 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:68 · _bindEvNav:77 (!196) · _scrollWeekToMonth:85 · _scrollWeekToToday:132 · doScroll:142 · _bindEvCal:273 (!93) · _bindEvWeekTitleBackground:366 · update:370 · schedule:393 · openEvTypeFilter:398 · close:406 · _bindEvListas:412 (!122) · apply:522 · _bindEvGestos:534 · _evSwipeUpcoming:547 · _evSwipeBodas:554 · _evSwipeRutinas:561

### js/events-cal.js  _(374 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · _renderEvAnnual:342 · _renderEvQuad:351 · renderEvCalMonth:371 · renderEvAnnual:372 · renderEvQuad:373

### js/events-calendar-export.js  _(230 líneas)_
**Estado global:** EV_CAL_EXPORT:3 · EV_ICS_KEY:4 · EV_ICS_UPPER_KEY:5 · EV_ICS_NOTES_KEY:6 · EV_ICS_AUTHOR_KEY:7

**Funciones:** evIcsAuthor:8 · evIcsDescription:9 · evIcsText:14 · evIcsFold:17 · evIcsNextDay:26 · evIcsCandidates:27 · evIcsFile:47 · evIcsRecords:74 · evIcsMergeRecords:77 · evIcsRoutineRows:83 · evIcsRoutineCurrent:93 · evIcsRememberedRows:97 · evIcsPrepare:114 · evIcsExportRows:131 · evIcsExportStatus:134 · evIcsFilterRows:140 · renderEvCalendarExport:145 · openEvCalendarExport:160 · close:163 · find:166 · count:167 · filters:176 · list:182 · dates:198

### js/events-detail.js  _(602 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!117) · fd2:43 · _fila:122 · evDayCarItems:157 · evCarGo:170 · _evCarShow:178 · openEvDayCarousel:186 · closeEvDayCarousel:194 · openEvDetail:201 (!155) · repintar:241 · closeEvDetail:356 · renderEvAlarmPanel:359 (!96) · fd2:361 · openEvAlarm:455 · closeEvAlarm:461 · openBdayAlarmFromEvents:469 · bindEvAlarmEvents:477 (!125) · _syncPre:515 · fmtD:545

### js/events-form.js  _(611 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · evAdmiteRepeticion:35 · renderEvForm:38 (!188) · openEvForm:226 · closeEvForm:252 · bindEvFormEvents:264 (!347) · _refreshShapePreviews:280 · _refreshPickDatesLabel:285 · _curKind:304 · _applyTypeUI:305 · _bindTypeSwatches:334 · _viajeSync:428

### js/events-picker-color.js  _(241 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:125 · evTravelColor:134 · getEvType:140 · isEvBarAlways:148 · getEvDisplayColor:150 · _renderColorPicker:170 · _bindColorPicker:193 · updatePreview:203

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(632 líneas)_
**Estado global:** EV_LIST_TYPES:222

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!180) · fd2:50 · renderEvItem:51 · renderEvPanel:102 · renderEvByTypes:223 · coincide:244 · renderEvMonthsView:290 · _evWeekLanes:301 · assign:304 · evWeekTravelRow:319 · renderEvWeek:339 (!133) · hexA:343 · renderEvContent:472 (!160)

### js/events.js  _(797 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_FILTER_CYCLE:44 · EV_PREV_VIEW:61 · EV_QUAD_YEAR:62 · EV_QUAD_MONTH:63 · EV_TO_SUBTAB:64 · EV_TYPES_FILTER:65 · EV_TYPES_PAST:66 · EV_LIST_SORT:67 · EV_LIST_SEARCH:68 · EV_COLORS:69 · EVENTS:70 · EV_ALARM_SK:99 · EV_ALARMS_SET:100 · EV_NO_RUT:192 · EV_MAX_BAR_DIA:248 · EV_MARK_ORDER:353 · EV_MAX_PUNT_DIA:394 · EV_MAX_RUT_DIA:395 · EV_CAL_CORNER_STACK:398 · EV_MAX_VIP_DIA:400 · EV_CAL_VIP_MAX:401 · EV_UP_SHOW_RUT:403 · EV_UP_SHOW_BODA:404 · EV_BAR_Z:453 · EV_COMPARTE_DIA:457 · EV_MNS:649 · EV_CAR:692 · EV_TRANSPORTES:711 · EV_TRANS_EMOJI:717 · EV_DATE_INDEX:783

**Funciones:** evCycleFilters:45 · evFilterGroup:51 · saveEvents:94 · loadEvAlarms:101 · saveEvAlarms:102 · _findBdayByEvId:103 · isEvAlarmSet:115 · setEvAlarmState:121 · evDk:128 · _evClampDate:137 · eventOccursOn:141 · getEventsOn:185 · evSignature:200 · evMergeIncoming:210 · evMergeMsg:235 · _fmtDayEs:247 · evBarLimitExceeded:249 · evDayLimitExceeded:259 · rutDayCount:295 · hasUpcomingEvent:302 · updateEventsBtn:311 · evDefaultShape:325 · evMarkerHtml:331 · evMorePlusHtml:345 · evMarkPriority:354 · evBodaMinutes:361 · evSortMarks:372 · ev0:373 · evAnnualXsHtml:405 · vipStarSvgHtml:415 · evIsoDate:427 · _isVipBdayTooFar:428 · evUpcomingMarkHtml:435 · _evRowOcc:454 · evComparteDia:458 · _evSoloSeRozan:463 · _evTrozosSeRozan:474 · _evAssignRow:482 · _evMarcarMitades:496 · _evMitadesStyle:511 · evBarZ:518 · _evBarSegments:522 · _evBarBand:546 · _evBarSegmentStyle:552 · _evBarExtent:557 · _evRoundedOutline:568 · near:577 · _evBarMutedColor:596 · _evSteppedBar:599 · _evAnnualCtx:652 · visible:653 · _evLoadPuentes:671 · _evScheduleRemove:699 · _evCancelRemove:700 · evStartTime:719 · evCompareTime:725 · evEndTime:726 · evTimeLabel:733 · evTramos:740 · evTramoTexto:751 · evMinutosDe:758 · _positionEvBright:768 · withEventDateIndex:784

### js/home-popup.js  _(112 líneas)_
**Funciones:** homeReminderColor:1 · homeReminderEventText:7 · openHomePopup:10 (!102) · dismissPopup:98

### js/import-export.js  _(527 líneas)_
**Funciones:** _lsJson:247 · askImportMode:254 · close:267 · _mergeMap:281 · _mergeList:292 · _sigEvent:302 · _sigCouple:304 · _sigAlarm:305 · _sigGasto:306 · _keyId:308 · _keyBday:309 · _keyGasto:310 · _exportPerYearKeys:316 (!82) · _applyFullImport:398 (!129)

### js/import-preview.js  _(16 líneas)_
**Funciones:** renderImportPreview:2 · add:4

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

### css/styles.css  _(2837 líneas)_

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
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2169
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2171
- etiqueta al minimo: el nombre de la pareja necesita el resto:2180
- el color de la pareja va en un punto, no tinendo el nombre:2183
- Los tres botones de la pareja, en una sola linea:2190
- Buscador y boton de anadir en la misma fila:2193
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2199
- Horario distinto segun el dia:2203
- Selector de icono de rutina:2209
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2249
- Diálogo: modo de importación (añadir vs reemplazar):2264
- PRINT:2277
- Separacion de siluetas incluso entre grosores distintos.:2297
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2312
- Editar: tono comun, con geometria propia de cada pantalla.:2324
- Marca oficial con transparencia; conserva contraste en ambos temas.:2341
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2362
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2380
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2406
- Text edits retain the solid orange; only standalone pencils use a tint.:2415
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2422
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2458
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2473
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2483
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2495
- Titulo y estado separados para que "saltada" nunca quede tachado.:2515
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2525
- El titulo queda dentro del borde de 1.5px de su caja continua.:2530
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2536
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2552
- Una identidad de color por ventana para ambos juegos de iconos.:2556
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2585
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2592
- Borde discreto para identificar semanas enviadas en ambos temas.:2597
- Filtros junto al buscador sin ensanchar la ventana movil.:2601
- Configuracion de tarifa: controles verdes y valores neutros.:2609
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2627
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2644
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2648
- Selector de eventos para compartir por iCalendar:2673
- Selector de exportación: controles compactos y lista con espacio propio.:2674
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2711
- Compartir: cabecera centrada, categorías completas y lista compacta.:2729
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2762
- Estudio energético: controles compactos y separación entre apartados.:2772
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2775
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2791
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2814

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:468-470 · .ah-donut:478-480 · .ah-section:465-467 · .ah-total:475-477 · .ah-vs:471-474 · .alarm-cfg:1827-1827 · .alarm-colon:1830-1830 · .alarm-create:1844-1850 · .alarm-day:1854-1856 · .alarm-days:1851-1853 · .alarm-msg:1840-1841 · .alarm-panel:1828-1828 · .alarm-past:1858-1862 · .alarm-time:1829-1829 · .analisis-card:617-619 · .analisis-cards:606-606 · .analisis-hbar:620-625 · .analisis-input:635-638 · .analisis-ins:644-649 · .analisis-insurance:643-643 · .analisis-mortgage:626-642 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1461-1770 · .bd-detail:1543-1550 · .bd-export:263-263 · .bday-add:1118-1119 · .bday-badge:1048-1050 · .bday-buscar:1080-1082 · .bday-cancel:1065-1066 · .bday-cell:1041-1124 · .bday-hdr:1035-2408 · .bday-header:2402-2404 · .bday-ic:1868-1872 · .bday-inline:1867-1867 · .bday-io:1086-1102 · .bday-jump:2304-2345 · .bday-list:1052-1076 · .bday-listo:1864-1864 · .bday-month:1051-2420 · .bday-next:2354-2355 · .bday-num:1046-1046 · .bday-search:1083-1085 · .bday-upcoming:1104-2302 · .bday-vip:1054-1458 · .bday-week:1036-1038 · .boda-actions:2075-2075 · .boda-add:2077-2077 · .boda-asg:2100-2827 · .boda-buscar:2194-2196 · .boda-cal:2124-2149 · .boda-card:1983-2202 · .boda-catalog:2331-2339 · .boda-cfg:2381-2393 · .boda-chip:1979-1981 · .boda-chips:1978-1978 · .boda-cl:2037-2074 · .boda-class:1961-2036 · .boda-config:2327-2378 · .boda-controls:1939-1939 · .boda-count:2335-2335 · .boda-couple:2019-2021 · .boda-cpk:2091-2099 · .boda-date:2076-2413 · .boda-day:1955-2368 · .boda-det:2082-2821 · .boda-dia:2026-2028 · .boda-dot:1987-1987 · .boda-falta:1994-1994 · .boda-field:2369-2374 · .boda-filter:2307-2309 · .boda-filters:1942-1942 · .boda-fsel:1943-1946 · .boda-ftoggles:1947-1948 · .boda-future:2726-2726 · .boda-hd:2070-2072 · .boda-inp:2014-2014 · .boda-iss:1911-1913 · .boda-issue:1898-1909 · .boda-issues:1897-1897 · .boda-last:2776-2780 · .boda-legend:2078-2081 · .boda-mini:2064-2315 · .boda-mode:1929-1931 · .boda-multi:2029-2034 · .boda-name:1988-1988 · .boda-ok:1995-1995 · .boda-pack:2336-2337 · .boda-pfilters:2306-2310 · .boda-place:2022-2047 · .boda-prog:1990-1991 · .boda-ro:2038-2046 · .boda-save:1975-1976 · .boda-savebar:1971-1974 · .boda-search:2197-2197 · .boda-sec:1895-1895 · .boda-sobra:1996-1996 · .boda-sort:2198-2198 · .boda-stat:1916-1921 · .boda-stats:1915-1915 · .boda-sticky:1891-2391 · .boda-sum:1935-1938 · .boda-summary:1934-1934 · .boda-swap:2004-2011 · .boda-teachers:2356-2356 · .boda-time:2015-2015 · .boda-tp:2150-2153 · .boda-wed:1989-1989 · .bottom-sheet:170-171 · .btn-icon:103-1816 · .csv-export:76-77 · .data-actions:99-2553 · .data-btn:100-2563 · .data-menu:117-123 · .day-cell:138-241 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1357-1358 · .dp-counter:1344-1345 · .dp-day:1352-1356 · .dp-days:1351-1351 · .dp-grid:1346-1346 · .dp-handle:1339-1339 · .dp-hdr:1340-1340 · .dp-mhdr:1349-1350 · .dp-mname:1348-1348 · .dp-month:1347-1347 · .dp-overlay:1335-1338 · .dp-sheet:1337-1337 · .dp-title:1341-1341 · .dp-yearnav:1342-1343 · .drum-picker:1833-1836 · .drum-sel:1839-1839 · .drum-wrap:1832-1838 · .econ-add:552-553 · .econ-ahorro:773-780 · .econ-annual:382-382 · .econ-avg:383-700 · .econ-bracket:535-541 · .econ-calc:683-684 · .econ-casc:687-694 · .econ-cascade:686-686 · .econ-chart:565-566 · .econ-comp:543-567 · .econ-decl:530-704 · .econ-distrib:1010-1024 · .econ-donut:791-806 · .econ-equiv:1005-1008 · .econ-fiscal:784-789 · .econ-formula:402-405 · .econ-gastos:706-718 · .econ-gear:502-503 · .econ-hdr:424-504 · .econ-ingresado:390-390 · .econ-irpf:720-782 · .econ-legend:568-569 · .econ-line:563-564 · .econ-month:407-420 · .econ-mr:1002-1003 · .econ-multi:994-1004 · .econ-opt:679-682 · .econ-qcard:372-379 · .econ-qcell:368-1777 · .econ-qm:377-377 · .econ-qmonth:375-376 · .econ-quarter:364-1774 · .econ-rate:506-514 · .econ-row:391-401 · .econ-sc:545-1031 · .econ-scenario:544-544 · .econ-section:421-421 · .econ-sim:571-581 · .econ-stats:518-523 · .econ-sub:427-433 · .econ-tab:425-2541 · .econ-tariff:2610-2615 · .econ-toggle:525-528 · .econ-val:406-406 · .energy-bar:2804-2804 · .energy-caption:2763-2763 · .energy-choice:2773-2773 · .energy-contract:2753-2766 · .energy-cost:2800-2803 · .energy-field:2756-2768 · .energy-fields:2770-2770 · .energy-history:2751-2752 · .energy-legend:2805-2805 · .energy-price:2755-2760 · .energy-range:2806-2806 · .energy-sheet:2750-2750 · .energy-table:2764-2764 · .energy-tabs:2798-2799 · .energy-tax:2758-2758 · .energy-window:2792-2808 · .energy-year:2767-2812 · .est-btn:438-442 · .est-card:448-450 · .est-detail:445-445 · .est-field:457-463 · .est-fields:456-456 · .est-group:436-440 · .est-modo:451-451 · .est-nav:435-2540 · .est-section:444-444 · .est-tariff:446-455 · .ev-alarm:1484-2059 · .ev-ann:1390-1625 · .ev-annual:1161-2817 · .ev-badge:1691-1691 · .ev-badges:1589-1589 · .ev-bar:1645-1645 · .ev-bars:1582-1582 · .ev-barsize:1308-1317 · .ev-bficha:2176-2176 · .ev-bfila:2177-2186 · .ev-bpunto:2184-2184 · .ev-bright:1668-2646 · .ev-btn:1729-1738 · .ev-bver:2189-2189 · .ev-cal:2677-2749 · .ev-car:1604-2173 · .ev-cell:1125-1687 · .ev-char:1718-1718 · .ev-checkbox:1723-1723 · .ev-chip:1433-2321 · .ev-color:1238-1257 · .ev-colors:1719-1719 · .ev-date:1720-1720 · .ev-dates:1330-1332 · .ev-day:1592-1636 · .ev-daynote:1882-1882 · .ev-del:2261-2262 · .ev-detail:1259-2170 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1381-1733 · .ev-field:1712-2725 · .ev-filter:1428-2815 · .ev-form:1707-1728 · .ev-hdr:1442-1554 · .ev-hora:1165-1165 · .ev-input:1714-1715 · .ev-io:1088-1741 · .ev-kind:1875-1879 · .ev-list:1563-2629 · .ev-month:1571-1571 · .ev-multi:1586-2322 · .ev-note:1881-1881 · .ev-num:1689-1689 · .ev-otros:1306-1641 · .ev-puente:1654-1654 · .ev-quad:1376-1683 · .ev-repeat:1724-1724 · .ev-rut:1632-2521 · .ev-search:2251-2255 · .ev-sep:1188-1188 · .ev-shape:1318-1325 · .ev-share:2675-2676 · .ev-sort:2256-2301 · .ev-stepped:1647-1649 · .ev-textarea:1716-1717 · .ev-toggle:1721-1722 · .ev-type:1231-2633 · .ev-types:1566-2630 · .ev-up:1150-2486 · .ev-upcoming:323-2051 · .ev-viaje:1166-1174 · .ev-view:1555-2314 · .ev-wd:1726-1727 · .ev-week:319-2727 · .ev-weekday:1725-1725 · .ev-wk:1175-2786 · .excl-item:349-516 · .excl-row:329-515 · .fiscal-add:672-835 · .fiscal-bracket:663-671 · .fiscal-compras:864-899 · .fiscal-copy:499-501 · .fiscal-custom:660-660 · .fiscal-ded:874-888 · .fiscal-desgrav:837-889 · .fiscal-despacho:901-922 · .fiscal-error:676-676 · .fiscal-gasto:808-870 · .fiscal-gastos:890-890 · .fiscal-hdr:820-820 · .fiscal-highlight:861-861 · .fiscal-hip:2607-2608 · .fiscal-onoff:903-904 · .fiscal-pct:661-670 · .fiscal-period:816-817 · .fiscal-radio:655-659 · .fiscal-save:674-675 · .fiscal-section:653-828 · .fiscal-sticky:825-825 · .fiscal-subsection:829-830 · .fiscal-tab:821-2538 · .fiscal-viaje:831-832 · .fiscal-vinc:914-915 · .fiscal-year:495-498 · .full-overlay:244-245 · .hbar-lbl:1925-1925 · .hbar-row:1924-1924 · .hbar-rows:1923-1923 · .hbar-track:1926-1927 · .hbar-val:1928-1928 · .header:57-2649 · .header-brand:60-60 · .hip-add:992-992 · .hip-auto:943-943 · .hip-bar:929-936 · .hip-cancel:979-979 · .hip-cf:948-953 · .hip-edit:975-977 · .hip-g2:947-947 · .hip-grid:941-941 · .hip-period:981-990 · .hip-resumen:924-928 · .hip-ro:966-973 · .hip-save:978-978 · .hip-section:942-991 · .hip-stat:938-940 · .hip-stats:937-937 · .hip-sub:945-945 · .hip-vinc:944-944 · .hip-vr:955-964 · .home-popup:1516-2789 · .home-reminder:2706-2708 · .home-submission:2651-2662 · .home-summary:2663-2671 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:264-264 · .imp-mode:2265-2829 · .imp-preview:2830-2834 · .io-peligro:1093-1101 · .io-primaria:1092-1099 · .logo-gallery:1760-1767 · .logo-popup:1751-1758 · .macro-section:1527-1528 · .macro-url:1529-2318 · .mg-budget:482-491 · .mg-cat:492-492 · .mg-desgrav:493-493 · .mg-sort:488-488 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2666 · .ms-breakdown:351-353 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:354-354 · .nav-bar:1438-1823 · .nav-btn:65-66 · .nav-icon:2571-2581 · .nav-pro:2547-2548 · .nav-style:2569-2569 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1437-1439 · .rate-input:361-2294 · .rate-label:360-360 · .rate-row:359-359 · .rate-suffix:362-362 · .rut-add:2233-2233 · .rut-cancelled:2462-2516 · .rut-card:2216-2231 · .rut-day:2224-2240 · .rut-days:2223-2238 · .rut-dot:2219-2219 · .rut-hist:2245-2248 · .rut-history:2436-2456 · .rut-hora:2208-2226 · .rut-hpd:2204-2434 · .rut-icon:2210-2419 · .rut-name:2220-2220 · .rut-pct:2232-2232 · .rut-prox:2227-2229 · .rut-sec:2215-2215 · .rut-skipped:2517-2518 · .rut-stat:2242-2244 · .rut-sug:2234-2237 · .rut-susp:2241-2241 · .rut-tag:2221-2222 · .rut-vacio:2230-2230 · .rut-week:2435-2435 · .rut-wpick:2163-2168 · .selected:2578-2578 · .sent-badge:134-134 · .settings-details:2357-2359 · .settings-edit:2319-2360 · .settings-menu:2642-2642 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:583-587 · .sim-field:572-573 · .sim-hr:582-582 · .sim-period:579-579 · .sim-target:574-578 · .sub-block:608-609 · .sub-row:610-616 · .sw-upd:201-201 · .sy-back:250-2285 · .sy-body:270-2283 · .sy-card:281-2289 · .sy-cards3:273-273 · .sy-cards4:274-274 · .sy-chart:299-299 · .sy-hdr:255-255 · .sy-header:249-2284 · .sy-lbl:290-2288 · .sy-list:303-356 · .sy-month:317-317 · .sy-nav:259-1680 · .sy-note:300-302 · .sy-pdf:261-262 · .sy-period:2616-2623 · .sy-puente:309-1456 · .sy-section:271-272 · .sy-spain:275-280 · .sy-sublbl:381-381 · .sy-suelto:314-316 · .sy-tab:1444-1447 · .sy-table:291-2290 · .sy-td:296-296 · .sy-tr:297-2291 · .sy-val:286-2287 · .sy-year:252-2286 · .toast:190-206 · .toast-undo:203-203 · .today-btn:67-68 · .vac-config:325-327 · .vip-no:1060-1061 · .week-actions:159-159 · .week-card:128-2598 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2342-2466

