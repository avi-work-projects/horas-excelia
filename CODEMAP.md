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

### js/bodas-class-form.js  _(335 líneas)_
**Estado global:** BODA_FORM:1 · BODA_TIME_H:212

**Funciones:** openBodaClaseForm:2 · _bodaFormRender:22 (!138) · closeBodaClaseForm:160 · openBodaCouplePicker:167 · row:178 · apply:195 · closeBodaCouplePicker:209 · openBodaTimePicker:215 (!84) · drum:224 · setDrum:247 · mark:255 · drumVal:259 · readManual:279 · closeBodaTimePicker:299 · openBodaDurationPicker:303 · close:308 · bodaTeachersLabel:313 · openBodaTeachersPicker:316 · close:322

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

### js/data-integrity.js  _(173 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:119

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 (!86) · visit:27 · hour:75 · days:76 · schedule:77 · validBirthday:111 · prepareImportRelations:112 · loadMailConfig:120 · saveMailConfig:123 · birthdayValidation:126 · rutLimitExceeded:131 · legacy:162

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

### js/economics-fiscal-elect.js  _(238 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:132

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:82 · _despField:97 · _despFieldMoney:106 · _renderIngresosDesgList:119 · _renderGastoItem:138 · renderGastosList:153 · _bindElectDetalle:175 · _bindSegurosNormales:222

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

### js/energy-analysis-bind.js  _(28 líneas)_
**Funciones:** bindEnergyAnalysis:2 · refresh:3 · year:6 · energyBindYearChart:21

### js/energy-analysis-view.js  _(89 líneas)_
**Estado global:** ENERGY_ANALYSIS_TAB:2 · ENERGY_ANALYSIS_YEAR:3 · ENERGY_ANALYSIS_KIND:4 · ENERGY_RETURN:5

**Funciones:** energyAnalysisHtml:6 · energyConsumptionHtml:21 · energyCostsHtml:29 · energyTariffsHtml:40 · energyScenarioOptions:61 · energyComparisonHtml:68 · energyArchiveHtml:76 · closeEnergyAnalysis:81 · openEnergyAnalysis:82 · energyRefreshAnalysis:88

### js/energy-analysis.js  _(85 líneas)_
**Estado global:** ENERGY_TAX_KEY:3

**Funciones:** energyWeightedPrice:4 · energyValidateTariff:8 · energyTariffDefaults:19 · energyTariffBase:22 · energyTariffNet:33 · energyTariffGross:34 · energyTaxes:38 · energyValidateTaxes:39 · energyMergeTaxes:43 · energySaveTaxes:44 · energyVatAt:45 · energyUtc:46 · energyDate:47 · energyBillEnd:50 · energyConsumptionMonths:55 · energySimulateMonth:74

### js/energy-bills-view.js  _(12 líneas)_
**Estado global:** ENERGY_BILLS_YEAR:1 · ENERGY_BILLS_COST:2

**Funciones:** energyNumber:3 · energyBillsChart:4 · openEnergyBills:11

### js/energy-bills.js  _(45 líneas)_
**Estado global:** ENERGY_BILLS_KEY:2

**Funciones:** energyBills:3 · validateEnergyBills:4 · energyBillSignature:24 · energyMergeBills:25 · energySaveBills:30 · energyMonthlyBills:31 · energyImportHistory:35 · energyRestoreHistory:44

### js/energy-costs.js  _(60 líneas)_
**Funciones:** energyContractOn:3 · energyContractTariff:8 · energySupplierColor:16 · energyCostMonths:21 · energyCostChart:51

### js/energy-history.js  _(51 líneas)_
**Estado global:** ENERGY_HISTORY_KEY:2

**Funciones:** energyContracts:3 · validateEnergyContracts:8 · energyContractSignature:31 · energyMergeContracts:32 · energySaveContracts:41 · energyHistoryButton:42 · energyContractStatus:44 · openEnergyHistory:49 · bindEnergyHistory:50

### js/energy-import-preview.js  _(25 líneas)_
**Funciones:** energyImportChanges:2 · stable:3 · energyImportPreview:8

### js/energy-reconciliation.js  _(49 líneas)_
**Funciones:** energyBillServices:3 · energyBillSupply:4 · energyBilledDays:5 · energyReconcile:14 · energyValidateCurrent:25 · energyCurrentConfig:31 · energyApplyCurrent:35 · energyCurrentPreview:48

### js/energy-study.js  _(62 líneas)_
**Estado global:** ENERGY_COST_VAT:2 · ENERGY_COMPARE_TARIFF:3

**Funciones:** energyYearIndicators:4 · tax:8 · energyMetric:11 · energyContractPeriods:12 · energyCommercialPeriods:14 · signature:16 · energyPriceExtremes:22 · energySummaryHtml:27 · energyVatStrip:42 · energyCompareChart:54 · energyCompareTable:58

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

### js/events-detail.js  _(603 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!118) · fd2:43 · _fila:123 · evDayCarItems:158 · evCarGo:171 · _evCarShow:179 · openEvDayCarousel:187 · closeEvDayCarousel:195 · openEvDetail:202 (!155) · repintar:242 · closeEvDetail:357 · renderEvAlarmPanel:360 (!96) · fd2:362 · openEvAlarm:456 · closeEvAlarm:462 · openBdayAlarmFromEvents:470 · bindEvAlarmEvents:478 (!125) · _syncPre:516 · fmtD:546

### js/events-form.js  _(621 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · evAdmiteRepeticion:37 · renderEvForm:40 (!195) · openEvForm:235 · closeEvForm:261 · bindEvFormEvents:273 (!348) · _refreshShapePreviews:289 · _refreshPickDatesLabel:294 · _curKind:313 · _applyTypeUI:314 · _bindTypeSwatches:343 · _viajeSync:438

### js/events-picker-color.js  _(258 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:61 · EV_FREE_SHAPE:62 · EV_FREE_DATES:65 · EV_BAR_SIZES:68 · EV_FREE_BARSIZE:69 · EV_DOT_SOLID:73 · EV_SHAPE_BW:100

**Funciones:** evBarSize:74 · evBarSizeCls:80 · evTypeKey:81 · evTypeColor:82 · getEvKind:85 · evShapeSvg:101 · evMorePlusSvg:142 · evTravelColor:151 · getEvType:157 · isEvBarAlways:165 · getEvDisplayColor:167 · _renderColorPicker:187 · _bindColorPicker:210 · updatePreview:220

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(633 líneas)_
**Estado global:** EV_LIST_TYPES:223

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!181) · fd2:50 · renderEvItem:51 · renderEvPanel:103 · renderEvByTypes:224 · coincide:245 · renderEvMonthsView:291 · _evWeekLanes:302 · assign:305 · evWeekTravelRow:320 · renderEvWeek:340 (!133) · hexA:344 · renderEvContent:473 (!160)

### js/events.js  _(799 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_FILTER_CYCLE:44 · EV_PREV_VIEW:61 · EV_QUAD_YEAR:62 · EV_QUAD_MONTH:63 · EV_TO_SUBTAB:64 · EV_TYPES_FILTER:65 · EV_TYPES_PAST:66 · EV_LIST_SORT:67 · EV_LIST_SEARCH:68 · EV_COLORS:69 · EVENTS:70 · EV_ALARM_SK:99 · EV_ALARMS_SET:100 · EV_NO_RUT:192 · EV_MAX_BAR_DIA:248 · EV_MARK_ORDER:355 · EV_MAX_PUNT_DIA:396 · EV_MAX_RUT_DIA:397 · EV_CAL_CORNER_STACK:400 · EV_MAX_VIP_DIA:402 · EV_CAL_VIP_MAX:403 · EV_UP_SHOW_RUT:405 · EV_UP_SHOW_BODA:406 · EV_BAR_Z:455 · EV_COMPARTE_DIA:459 · EV_MNS:651 · EV_CAR:694 · EV_TRANSPORTES:713 · EV_TRANS_EMOJI:719 · EV_DATE_INDEX:785

**Funciones:** evCycleFilters:45 · evFilterGroup:51 · saveEvents:94 · loadEvAlarms:101 · saveEvAlarms:102 · _findBdayByEvId:103 · isEvAlarmSet:115 · setEvAlarmState:121 · evDk:128 · _evClampDate:137 · eventOccursOn:141 · getEventsOn:185 · evSignature:200 · evMergeIncoming:210 · evMergeMsg:235 · _fmtDayEs:247 · evBarLimitExceeded:249 · evDayLimitExceeded:259 · rutDayCount:295 · hasUpcomingEvent:302 · updateEventsBtn:311 · evDefaultShape:325 · evMarkerHtml:333 · evMorePlusHtml:347 · evMarkPriority:356 · evBodaMinutes:363 · evSortMarks:374 · ev0:375 · evAnnualXsHtml:407 · vipStarSvgHtml:417 · evIsoDate:429 · _isVipBdayTooFar:430 · evUpcomingMarkHtml:437 · _evRowOcc:456 · evComparteDia:460 · _evSoloSeRozan:465 · _evTrozosSeRozan:476 · _evAssignRow:484 · _evMarcarMitades:498 · _evMitadesStyle:513 · evBarZ:520 · _evBarSegments:524 · _evBarBand:548 · _evBarSegmentStyle:554 · _evBarExtent:559 · _evRoundedOutline:570 · near:579 · _evBarMutedColor:598 · _evSteppedBar:601 · _evAnnualCtx:654 · visible:655 · _evLoadPuentes:673 · _evScheduleRemove:701 · _evCancelRemove:702 · evStartTime:721 · evCompareTime:727 · evEndTime:728 · evTimeLabel:735 · evTramos:742 · evTramoTexto:753 · evMinutosDe:760 · _positionEvBright:770 · withEventDateIndex:786

### js/home-popup.js  _(114 líneas)_
**Funciones:** homeReminderColor:1 · homeReminderEventText:7 · openHomePopup:10 (!104) · dismissPopup:100

### js/import-export.js  _(529 líneas)_
**Funciones:** _lsJson:247 · askImportMode:254 · close:268 · _mergeMap:282 · _mergeList:293 · _sigEvent:303 · _sigCouple:305 · _sigAlarm:306 · _sigGasto:307 · _keyId:309 · _keyBday:310 · _keyGasto:311 · _exportPerYearKeys:317 (!82) · _applyFullImport:399 (!130)

### js/import-preview.js  _(18 líneas)_
**Funciones:** renderImportPreview:2 · add:4

### js/init.js  _(496 líneas)_
**Estado global:** DRUM_ITEM_H:146 · DN_ES:303

**Funciones:** _updateHeaderActive:29 · buildDrumPicker:147 · updateDrumSelected:175 · getDrumValue:181 · checkDrumMinuteWrap:187 · buildAlarmDayBtns:218 · showAlarmPastConfirm:248 · proceed:289 · setConnectionsEditing:365 · aplicarActualizacion:426 · reload:432 · _showUpdateBar:453 · _buscar:483

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/nav-icons.js  _(51 líneas)_
**Estado global:** NAV_ICON_STYLE:2 · NAV_ICON_PATHS:3

**Funciones:** navIconHtml:11 · applyNavIconStyle:16 · openNavIconPicker:23 · closeNavIconPicker:45 · bindNavIconStyle:46

### js/rutinas-addition.js  _(48 líneas)_
**Funciones:** closeRutAddition:3 · rutAdditionPanel:4 · openRutAddition:10 · rutAdditionPickWeek:20 · rutAdditionPickSession:25 · rutAdditionForm:34

### js/rutinas-flex.js  _(141 líneas)_
**Estado global:** RUT_PLAN:2

**Funciones:** rutFlexible:3 · rutFlexEarliest:4 · rutFlexTarget:5 · rutFlexRange:9 · rutFlexCount:15 · rutFlexStatus:18 · rutFlexWarnings:25 · rutFlexSummary:31 · rutFlexOptionsHtml:37 · bindRutFlexOptions:51 · paint:52 · rutFlexRead:70 · rutFlexSetSession:87 · renderRutPlan:104 · openRutPlan:127 · closeRutPlan:128 · refreshRutPlan:129 · mutate:136

### js/rutinas-history.js  _(128 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · renderRutHistory:41 · openRutHistory:75 · closeRutHistory:91 · rutEditSession:92 · openRutHistoryEdit:107 · close:115

### js/rutinas-sessions.js  _(74 líneas)_
**Funciones:** rutSessionsOn:3 · rutSessionByKey:9 · rutRecoveryFor:14 · rutSessionTag:15 · rutRecoveryNote:20 · rutRecoveryHtml:24 · rutValidateAddition:29 · rutAddSession:34 · rutValidateExtraSessions:53 · rutSaveSessionChange:69

### js/rutinas.js  _(900 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:327 · RUT_WEEK_SEL:680 · RUT_WEEK_CAL:681

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:119 · rutById:126 · rutWeekKey:131 · rutTimeOfDay:140 · rutTieneHorarios:145 · rutScheduleOn:153 · rutScheduleCopy:158 · rutDurationOn:162 · rutChangeFrom:167 · rutChangeWeek:191 · update:195 · rutWeekCfg:207 · rutSuspendedOn:217 · rutDiaLleno:226 · rutOccursOn:230 · rutIsSkipped:240 · rutToggleSkip:241 · rutFin:259 · rutEventsOn:267 · rutEventFromId:284 · rutSessions:293 · rutStats:307 · rutProximas:320 · renderRutinasBody:330 · _renderRutLista:342 · _rutFmt:403 · _rutFmtCorto:404 · _renderRutStats:410 · renderRutForm:457 · openRutForm:523 (!152) · _rutRepaintIcons:532 · _rutPintaHoras:557 · closeRutForm:675 · openRutWeek:682 · _rutWeekPick:691 · back:715 · _rutWeekRender:744 (!80) · closeRutWeek:824 · openRutSesion:827 · closeRutSesion:859 · bindRutinasEvents:862

### js/summary.js  _(613 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · VAC_YEAR_KEY:16 · VAC_BY_YEAR:17 · SPAIN_AVG:258 · DN7S:282

**Funciones:** vacEntitlementForYear:18 · saveVacEntitlement:21 · fhY:27 · fdY:28 · computeYearlySummary:30 · barChart3:104 · computePuentes:131 · isNWD:141 · typeOf:142 · renderSummaryWorkBody:175 (!101) · fmtSigned:263 · renderSummaryPuentesBody:276 (!94) · fdd:283 · renderSummaryTimeOffBody:370 (!92) · fdd:376 · bindSummaryWorkBodyEvents:462 · bindSummaryPuentesBodyEvents:472 · bindSummaryTimeOffBodyEvents:497 · renderSummaryContent:503 · closeSummary:524 · bindSummaryEvents:530 (!83)

## CSS

### css/styles.css  _(2901 líneas)_

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
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1237
- Color picker avanzado (paleta 6×8 + color libre):1241
- Detail color picker toggle:1259
- Annual events calendar:1265
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1295
- Selector de formas en el formulario de evento (Otros):1306
- Selector de grosor de barra (grande | Otros):1308
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1323
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1327
- Inicio/Fin bloqueados cuando hay Selección Multidía:1330
- Mini-overlay para elegir días específicos (Otros):1335
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1362
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1366
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1368
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1374
- Calendario 4 meses: 2 columnas × 2 filas:1376
- Botón ir al calendario mensual en puentes del resumen:1378
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1390
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1394
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1412
- Dropdown de vista anual:1419
- Linea que separa los chips de eventos grandes de los puntuales:1428
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1437
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1441
- Summary tabs — nivel 2:1444
- BRIDGE DAY CELLS in summary:1449
- VIP BIRTHDAYS:1458
- BIRTHDAY + EVENT ALARM PANEL:1461
- Campana de alarma en items de próximos (bday + eventos):1464
- 3-ZONE ALARM MARKER:1502
- ALARM MANAGEMENT OVERLAY:1515
- HOME POPUP (semanas pendientes / VIP sin alarma):1516
- MACRO URL EN MENÚ:1527
- Feat 4: Nav-bar emoji alignment:1533
- Birthday detail / form overlays:1543
- EVENTS:1553
- Zone A: upcoming/list views — subtle blue tint:1559
- Zone B: calendar grid views — subtle teal tint, active = green:1560
- Feat 2: Lista de Eventos subtabs:1563
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1580
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1582
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1594
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1598
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1604
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1619
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1629
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1652
- Perímetro puente: capa inferior a eventos:1654
- Bright past: bombilla override:1674
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1679
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1684
- Quad label 3 lines:1689
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1696
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1698
- Events list view:1700
- Event form overlay (inside eventsOverlay):1714
- Relleno, para que haga pareja con el naranja de "Editar evento":1744
- Event detail:1750
- LOGO POPUP:1758
- Gallery:1767
- BD ALARM VIP TOGGLE:1776
- RESPONSIVE (mobile header):1779
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1781
- ALARM PANEL:1834
- Drum picker (selector giratorio de hora/minuto):1839
- Confirmación alarma en el pasado:1865
- Botón flotante "Listo" en modo Editar VIPs:1871
- Controles inline long-press cumpleaños:1874
- Selector de clase en el formulario:1882
- Notas: general vs de un dia concreto:1888
- Pestana Bodas y pestana partida Vacaciones/Festivos:1892
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1893
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1904
- Filas del panel de un aviso:1918
- Estadisticas:1922
- Barras horizontales de reparto (componente generico: hBarRows):1930
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1940
- Dia cerrado: no admite mas clases:1957
- Una clase a la que le falta la hora o la sala se marca ella sola.:1968
- Fila con cambios sin guardar:1973
- Filtros de Parejas como chips pulsables:1985
- El color de la pareja va en un punto delante; el nombre, en color normal:2048
- Sala sin asignar: se marca en naranja para que cante en la lista:2053
- Nota propia del dia en la lista de Proximos:2056
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2058
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2060
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2068
- Editar siempre en naranja, como en el resto de la app:2074
- Los tres botones del detalle de pareja comparten aspecto:2091
- Subpestana Calendario de bodas:2131
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2145
- Dia resaltado al pulsar una pareja en la leyenda:2152
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:2158
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2180
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2182
- etiqueta al minimo: el nombre de la pareja necesita el resto:2191
- el color de la pareja va en un punto, no tinendo el nombre:2194
- Los tres botones de la pareja, en una sola linea:2201
- Buscador y boton de anadir en la misma fila:2204
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2210
- Horario distinto segun el dia:2214
- Selector de icono de rutina:2220
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2281
- Diálogo: modo de importación (añadir vs reemplazar):2296
- PRINT:2309
- Separacion de siluetas incluso entre grosores distintos.:2329
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2344
- Editar: tono comun, con geometria propia de cada pantalla.:2356
- Marca oficial con transparencia; conserva contraste en ambos temas.:2373
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2394
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2412
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2438
- Text edits retain the solid orange; only standalone pencils use a tint.:2447
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2454
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2500
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2515
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2525
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2537
- Titulo y estado separados para que "saltada" nunca quede tachado.:2557
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2567
- El titulo queda dentro del borde de 1.5px de su caja continua.:2572
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2578
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2594
- Una identidad de color por ventana para ambos juegos de iconos.:2598
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2627
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2634
- Borde discreto para identificar semanas enviadas en ambos temas.:2639
- Filtros junto al buscador sin ensanchar la ventana movil.:2643
- Configuracion de tarifa: controles verdes y valores neutros.:2651
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2669
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2686
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2690
- Selector de eventos para compartir por iCalendar:2715
- Selector de exportación: controles compactos y lista con espacio propio.:2716
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2753
- Compartir: cabecera centrada, categorías completas y lista compacta.:2771
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2804
- Estudio energético: controles compactos y separación entre apartados.:2814
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2817
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2833
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2858

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:468-470 · .ah-donut:478-480 · .ah-section:465-467 · .ah-total:475-477 · .ah-vs:471-474 · .alarm-cfg:1835-1835 · .alarm-colon:1838-1838 · .alarm-create:1852-1858 · .alarm-day:1862-1864 · .alarm-days:1859-1861 · .alarm-msg:1848-1849 · .alarm-panel:1836-1836 · .alarm-past:1866-1870 · .alarm-time:1837-1837 · .analisis-card:617-619 · .analisis-cards:606-606 · .analisis-hbar:620-625 · .analisis-input:635-638 · .analisis-ins:644-649 · .analisis-insurance:643-643 · .analisis-mortgage:626-642 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1462-1778 · .bd-detail:1544-1551 · .bd-export:263-263 · .bday-add:1118-1119 · .bday-badge:1048-1050 · .bday-buscar:1080-1082 · .bday-cancel:1065-1066 · .bday-cell:1041-1124 · .bday-hdr:1035-2440 · .bday-header:2434-2436 · .bday-ic:1876-1880 · .bday-inline:1875-1875 · .bday-io:1086-1102 · .bday-jump:2336-2377 · .bday-list:1052-1076 · .bday-listo:1872-1872 · .bday-month:1051-2452 · .bday-next:2386-2387 · .bday-num:1046-1046 · .bday-search:1083-1085 · .bday-upcoming:1104-2334 · .bday-vip:1054-1459 · .bday-week:1036-1038 · .boda-actions:2083-2083 · .boda-add:2085-2085 · .boda-asg:2108-2871 · .boda-buscar:2205-2207 · .boda-cal:2132-2157 · .boda-card:1991-2213 · .boda-catalog:2363-2371 · .boda-cfg:2413-2425 · .boda-chip:1987-1989 · .boda-chips:1986-1986 · .boda-cl:2045-2082 · .boda-class:1969-2044 · .boda-config:2359-2410 · .boda-controls:1947-1947 · .boda-count:2367-2367 · .boda-couple:2027-2029 · .boda-cpk:2099-2107 · .boda-date:2084-2445 · .boda-day:1963-2400 · .boda-det:2090-2865 · .boda-dia:2034-2036 · .boda-dot:1995-1995 · .boda-falta:2002-2002 · .boda-field:2401-2406 · .boda-filter:2339-2341 · .boda-filters:1950-1950 · .boda-fsel:1951-1954 · .boda-ftoggles:1955-1956 · .boda-future:2768-2768 · .boda-hd:2078-2080 · .boda-inp:2022-2022 · .boda-iss:1919-1921 · .boda-issue:1906-1917 · .boda-issues:1905-1905 · .boda-last:2818-2822 · .boda-legend:2086-2089 · .boda-mini:2072-2347 · .boda-mode:1937-1939 · .boda-multi:2037-2042 · .boda-name:1996-1996 · .boda-ok:2003-2003 · .boda-pack:2368-2369 · .boda-pfilters:2338-2342 · .boda-place:2030-2055 · .boda-prog:1998-1999 · .boda-ro:2046-2054 · .boda-save:1983-1984 · .boda-savebar:1979-1982 · .boda-search:2208-2208 · .boda-sec:1903-1903 · .boda-sobra:2004-2004 · .boda-sort:2209-2209 · .boda-stat:1924-1929 · .boda-stats:1923-1923 · .boda-sticky:1899-2423 · .boda-sum:1943-1946 · .boda-summary:1942-1942 · .boda-swap:2012-2019 · .boda-teachers:2388-2388 · .boda-time:2023-2023 · .boda-tp:2161-2164 · .boda-wed:1997-1997 · .bottom-sheet:170-171 · .btn-icon:103-1824 · .csv-export:76-77 · .data-actions:99-2595 · .data-btn:100-2605 · .data-menu:117-123 · .day-cell:138-241 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1358-1359 · .dp-counter:1345-1346 · .dp-day:1353-1357 · .dp-days:1352-1352 · .dp-grid:1347-1347 · .dp-handle:1340-1340 · .dp-hdr:1341-1341 · .dp-mhdr:1350-1351 · .dp-mname:1349-1349 · .dp-month:1348-1348 · .dp-overlay:1336-1339 · .dp-sheet:1338-1338 · .dp-title:1342-1342 · .dp-yearnav:1343-1344 · .drum-picker:1841-1844 · .drum-sel:1847-1847 · .drum-wrap:1840-1846 · .econ-add:552-553 · .econ-ahorro:773-780 · .econ-annual:382-382 · .econ-avg:383-700 · .econ-bracket:535-541 · .econ-calc:683-684 · .econ-casc:687-694 · .econ-cascade:686-686 · .econ-chart:565-566 · .econ-comp:543-567 · .econ-decl:530-704 · .econ-distrib:1010-1024 · .econ-donut:791-806 · .econ-equiv:1005-1008 · .econ-fiscal:784-789 · .econ-formula:402-405 · .econ-gastos:706-718 · .econ-gear:502-503 · .econ-hdr:424-504 · .econ-ingresado:390-390 · .econ-irpf:720-782 · .econ-legend:568-569 · .econ-line:563-564 · .econ-month:407-420 · .econ-mr:1002-1003 · .econ-multi:994-1004 · .econ-opt:679-682 · .econ-qcard:372-379 · .econ-qcell:368-1785 · .econ-qm:377-377 · .econ-qmonth:375-376 · .econ-quarter:364-1782 · .econ-rate:506-514 · .econ-row:391-401 · .econ-sc:545-1031 · .econ-scenario:544-544 · .econ-section:421-421 · .econ-sim:571-581 · .econ-stats:518-523 · .econ-sub:427-433 · .econ-tab:425-2583 · .econ-tariff:2652-2657 · .econ-toggle:525-528 · .econ-val:406-406 · .energy-bar:2848-2848 · .energy-caption:2805-2805 · .energy-choice:2815-2815 · .energy-compare:2897-2897 · .energy-contract:2795-2808 · .energy-cost:2844-2899 · .energy-fee:2840-2841 · .energy-field:2798-2810 · .energy-fields:2812-2812 · .energy-history:2793-2794 · .energy-legend:2849-2849 · .energy-metric:2889-2891 · .energy-metrics:2888-2888 · .energy-price:2797-2802 · .energy-range:2850-2850 · .energy-scenario:2898-2898 · .energy-sheet:2792-2792 · .energy-supplier:2892-2892 · .energy-table:2806-2806 · .energy-tabs:2842-2843 · .energy-tariff:2896-2896 · .energy-tax:2800-2895 · .energy-vat:2893-2893 · .energy-window:2834-2887 · .energy-year:2809-2856 · .est-btn:438-442 · .est-card:448-450 · .est-detail:445-445 · .est-field:457-463 · .est-fields:456-456 · .est-group:436-440 · .est-modo:451-451 · .est-nav:435-2582 · .est-section:444-444 · .est-tariff:446-455 · .ev-alarm:1485-2067 · .ev-ann:1391-1626 · .ev-annual:1161-2861 · .ev-badge:1699-1699 · .ev-badges:1590-1590 · .ev-bar:1646-1646 · .ev-bars:1583-1583 · .ev-barsize:1309-1318 · .ev-bficha:2187-2187 · .ev-bfila:2188-2197 · .ev-bpunto:2195-2195 · .ev-bright:1675-2688 · .ev-btn:1737-1746 · .ev-bver:2200-2200 · .ev-cal:2719-2791 · .ev-car:1605-2184 · .ev-cell:1125-1695 · .ev-char:1726-1726 · .ev-checkbox:1731-1731 · .ev-chip:1434-2353 · .ev-color:1239-1258 · .ev-colors:1727-1727 · .ev-date:1728-1728 · .ev-dates:1331-1333 · .ev-day:1593-1637 · .ev-daynote:1890-1890 · .ev-del:2293-2294 · .ev-detail:1260-2181 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1382-1741 · .ev-field:1720-2767 · .ev-filter:1429-2884 · .ev-form:1715-1736 · .ev-hdr:1443-1555 · .ev-hora:1165-1165 · .ev-input:1722-1723 · .ev-io:1088-2900 · .ev-kind:1883-1887 · .ev-list:1564-2671 · .ev-month:1572-1572 · .ev-multi:1587-2354 · .ev-note:1889-1889 · .ev-num:1697-1697 · .ev-otros:1307-1642 · .ev-puente:1655-1655 · .ev-quad:1377-1691 · .ev-repeat:1732-1732 · .ev-rut:1633-2563 · .ev-search:2283-2287 · .ev-sep:1188-1188 · .ev-shape:1319-2232 · .ev-share:2717-2718 · .ev-sort:2288-2333 · .ev-stepped:1648-1650 · .ev-textarea:1724-1725 · .ev-toggle:1729-1730 · .ev-type:1231-2675 · .ev-types:1567-2672 · .ev-up:1150-2528 · .ev-upcoming:323-2059 · .ev-viaje:1166-1174 · .ev-view:1556-2346 · .ev-wd:1734-1735 · .ev-week:319-2769 · .ev-weekday:1733-1733 · .ev-wk:1175-2828 · .excl-item:349-516 · .excl-row:329-515 · .fiscal-add:672-835 · .fiscal-bracket:663-671 · .fiscal-compras:864-899 · .fiscal-copy:499-501 · .fiscal-custom:660-660 · .fiscal-ded:874-888 · .fiscal-desgrav:837-889 · .fiscal-despacho:901-922 · .fiscal-error:676-676 · .fiscal-gasto:808-870 · .fiscal-gastos:890-890 · .fiscal-hdr:820-820 · .fiscal-highlight:861-861 · .fiscal-hip:2649-2650 · .fiscal-onoff:903-904 · .fiscal-pct:661-670 · .fiscal-period:816-817 · .fiscal-radio:655-659 · .fiscal-save:674-675 · .fiscal-section:653-828 · .fiscal-sticky:825-825 · .fiscal-subsection:829-830 · .fiscal-tab:821-2580 · .fiscal-viaje:831-832 · .fiscal-vinc:914-915 · .fiscal-year:495-498 · .full-overlay:244-245 · .hbar-lbl:1933-1933 · .hbar-row:1932-1932 · .hbar-rows:1931-1931 · .hbar-track:1934-1935 · .hbar-val:1936-1936 · .header:57-2691 · .header-brand:60-60 · .hip-add:992-992 · .hip-auto:943-943 · .hip-bar:929-936 · .hip-cancel:979-979 · .hip-cf:948-953 · .hip-edit:975-977 · .hip-g2:947-947 · .hip-grid:941-941 · .hip-period:981-990 · .hip-resumen:924-928 · .hip-ro:966-973 · .hip-save:978-978 · .hip-section:942-991 · .hip-stat:938-940 · .hip-stats:937-937 · .hip-sub:945-945 · .hip-vinc:944-944 · .hip-vr:955-964 · .home-popup:1517-2831 · .home-reminder:2748-2750 · .home-submission:2693-2704 · .home-summary:2705-2713 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:264-264 · .imp-mode:2297-2873 · .imp-preview:2874-2878 · .io-peligro:1093-1101 · .io-primaria:1092-1099 · .logo-gallery:1768-1775 · .logo-popup:1759-1766 · .macro-section:1528-1529 · .macro-url:1530-2350 · .mg-budget:482-491 · .mg-cat:492-492 · .mg-desgrav:493-493 · .mg-sort:488-488 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2708 · .ms-breakdown:351-353 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:354-354 · .nav-bar:1439-1831 · .nav-btn:65-66 · .nav-icon:2613-2623 · .nav-pro:2589-2590 · .nav-style:2611-2611 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1438-1440 · .rate-input:361-2326 · .rate-label:360-360 · .rate-row:359-359 · .rate-suffix:362-362 · .rut-add:2265-2265 · .rut-addition:2476-2480 · .rut-cancelled:2504-2558 · .rut-card:2248-2263 · .rut-day:2256-2272 · .rut-days:2255-2270 · .rut-dot:2251-2251 · .rut-first:2230-2230 · .rut-flex:2227-2234 · .rut-hist:2277-2280 · .rut-history:2468-2498 · .rut-hora:2219-2258 · .rut-hpd:2215-2466 · .rut-icon:2221-2451 · .rut-name:2252-2252 · .rut-pct:2264-2264 · .rut-plan:2235-2247 · .rut-prox:2259-2261 · .rut-recovery:2481-2481 · .rut-sec:2226-2226 · .rut-session:2482-2482 · .rut-skipped:2559-2560 · .rut-stat:2274-2276 · .rut-sug:2266-2269 · .rut-susp:2273-2273 · .rut-tag:2253-2254 · .rut-vacio:2262-2262 · .rut-week:2467-2467 · .rut-wpick:2174-2179 · .selected:2620-2620 · .sent-badge:134-134 · .settings-details:2389-2391 · .settings-edit:2351-2392 · .settings-menu:2684-2684 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:583-587 · .sim-field:572-573 · .sim-hr:582-582 · .sim-period:579-579 · .sim-target:574-578 · .sub-block:608-609 · .sub-row:610-616 · .sw-upd:201-201 · .sy-back:250-2317 · .sy-body:270-2315 · .sy-card:281-2321 · .sy-cards3:273-273 · .sy-cards4:274-274 · .sy-chart:299-299 · .sy-hdr:255-255 · .sy-header:249-2316 · .sy-lbl:290-2320 · .sy-list:303-356 · .sy-month:317-317 · .sy-nav:259-1688 · .sy-note:300-302 · .sy-pdf:261-262 · .sy-period:2658-2665 · .sy-puente:309-1457 · .sy-section:271-272 · .sy-spain:275-280 · .sy-sublbl:381-381 · .sy-suelto:314-316 · .sy-tab:1445-1448 · .sy-table:291-2322 · .sy-td:296-296 · .sy-tr:297-2323 · .sy-val:286-2319 · .sy-year:252-2318 · .toast:190-206 · .toast-undo:203-203 · .today-btn:67-68 · .vac-config:325-327 · .vip-no:1060-1061 · .week-actions:159-159 · .week-card:128-2640 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2374-2508

