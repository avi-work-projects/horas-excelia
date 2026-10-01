# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays-bind.js  _(311 líneas)_
**Funciones:** bindBdayFormEvents:1 · openBday:52 · closeBday:56 · refreshBday:57 · applyBdaySearch:61 · bindBdayEvents:73 (!192) · _bdResetScroll:104 · _bdScrollToMonth:106 · bindBdayUpcoming:265 · bdayPanelHost:307

### js/birthdays-panels.js  _(307 líneas)_
**Funciones:** renderBdayDetail:1 · renderBdayAlarmPanel:22 · fmtDate:34 · openBdayAlarm:89 · _bdRefreshBoth:96 · closeBdayAlarm:100 · bindBdayAlarmEvents:102 (!146) · fmtD:218 · onOk:225 · onErr:226 · renderBdayForm:248 · openBdayDetail:281 · closeBdayDetail:291 · openBdayForm:294 · closeBdayForm:304

### js/birthdays-render.js  _(247 líneas)_
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

### js/core.js  _(786 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:137 · MN_SHORT:139 · DN5:439 · FESTIVOS_ANIO:658 · NAV_SWITCH_TIMER:770

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:144 · save:156 · loadEconYear:161 · saveEconYear:180 · fakeTrans:190 · simpleBarChart:207 · hBarRows:231 · shareOrDownload:248 · download:250 · escHtml:279 · mkey:284 · getMonthH:285 · defH:291 · dayH:292 · dayT:293 · dk:294 · fd:295 · ad:296 · fh:297 · fhP:298 · isToday:299 · isPast:300 · wn:301 · weeks:304 · homeSubmissionStatus:318 · renderHomeSubmissionStatus:323 · getWD:332 · _toastReset:348 · _toastBindSwipe:358 · end:383 · showToast:401 · sendEmail:428 · buildMailtoBody:438 · render:460 (!99) · fmtH:536 · openSheet:559 · closeSheet:578 · selectType:584 · contarVacaciones:617 · confirmarCupoVacaciones:630 · contarFestivos:646 · confirmarCupoFestivos:659 · togSent:668 · _panelBorrarLuego:689 · _panelCancelarBorrado:700 · abrirPanel:702 · engancharFondo:722 · abrirUnaVez:740 · cerrarPanel:746 · renderNavBar:757 · bindNavBar:764 · navigateMain:771 · open:778

### js/csv-sync.js  _(40 líneas)_
**Estado global:** CSV_EXPORT_KEY:2 · CSV_WARNED:3

**Funciones:** csvYearContent:4 · csvExportRecords:15 · csvRecordExport:18 · csvPendingWarnings:23 · csvCheckChanges:32

### js/data-integrity.js  _(181 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:127

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 (!94) · visit:27 · hour:78 · days:79 · schedule:80 · validBirthday:119 · prepareImportRelations:120 · loadMailConfig:128 · saveMailConfig:131 · birthdayValidation:134 · rutLimitExceeded:139 · legacy:170

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(710 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:333 · ESTUDIO_ELECT_CALC:334 · ESTUDIO_ELECT_IVA:335

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:235 · _renderEstudioGasComp:243 · _renderGasCompCard:303 · _calcElectCost:337 · _currentElectTariff:338 · _renderEstudioElectComp:343 · _renderElectCompCard:406 · _renderMultiScenarioResult:443 · _bindEstudioGas:511 · _bindEstudioElect:542 · _bindScenarios:573 · _readScenarios:592 · _bindCompFields:601 · _saveCompFields:636 · renderEstudioContent:652 · openEstudio:666 · closeEstudio:676 · reRenderEstudio:681 · bindEstudioEvents:689

### js/economics-fiscal-bind.js  _(560 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:26 · reRenderFiscal:32 · bindFiscalEvents:43 · _switchTab:47 · _bindYearSelector:81 · _bindTabPersonal:118 · _bindTabIrpf:167 · _bindTabGastosDesg:212 (!91) · _rebindComprasDel:261 · _bindTabIrpfDeduc:303 · _bindTabDesgrav:316 (!96) · _bindList:318 · _bindTabDespachoOnly:412 (!83) · _syncLiveD:423 · _updateFmt:461 · _saveFiscalAll:495 · _rv:524

### js/economics-fiscal-datos.js  _(341 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · HOUSEHOLD_TAB_KEY:30 · FISCAL_ENTRY:31 · FISCAL_HIP_SUB:33 · FISCAL_HIP_EDITING:35 · FISCAL_HIP_EDIT_SNAPSHOT:36 · FISCAL_HIP_DETAIL_TARGET:37 · PERSONAL_SK:43 · PERSONAL_DATA:44 · DEFAULT_PERSONAL_GASTOS_REC:46 · DEFAULT_PERSONAL_INVERSIONES:52 · INGRESOS_SK:96 · INGRESOS_ITEMS:97 · GASTOS_SK:114 · GASTOS_DIFICIL_PCT:115 · DEFAULT_GASTOS:116 · GASTOS_ITEMS:134 · COMPRAS_SK:196 · COMPRAS_IVA_ENABLED:197 · DEFAULT_COMPRAS:198 · COMPRAS_ITEMS:204 · DESGRAV_SK:251 · DESGRAV_DEFAULT:253 · DESGRAV_ITEMS:273 · OBSOLETE_IDS:276

**Funciones:** householdTab:32 · setHouseholdTab:34 · _yearKey:40 · _ensureDefaults:59 · loadPersonalYear:75 · savePersonalYear:91 · loadIngresos:98 · saveIngresos:101 · findIngreso:104 · ingresoAnual:108 · loadFiscal:136 · saveFiscal:144 · getIrpfPct:147 · getBrackets:148 · _loadGastosFromRaw:150 · loadGastosYear:168 · loadGastos:181 · saveGastosYear:182 · findGasto:185 · gastoAnual:189 · loadCompras:205 · saveCompras:222 · comprasTotal:226 · comprasIvaTotal:236 · loadDesgrav:275 · saveDesgrav:306 · desgravAnual:309 · computeTotalDesgrav:330

### js/economics-fiscal-elect.js  _(240 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:134

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:83 · _despField:99 · _despFieldMoney:108 · _renderIngresosDesgList:121 · _renderGastoItem:140 · renderGastosList:155 · _bindElectDetalle:177 · _bindSegurosNormales:224

### js/economics-fiscal-gas.js  _(113 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:75

### js/economics-fiscal-hip.js  _(852 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipROvinc:364 · _calcInsOvercost:374 · _renderInlineOvercost:385 · _renderHipResumen:404 · _renderHipDetalle:407 · _renderHipSectionContent:434 · _renderCompraSection:446 · _renderPrestamoSection:475 · _renderSubSection:522 · renderFiscalTabDespacho:593 · _bindTabDespacho:610 · _bindHipResumen:636 · _bindHipDetalle:661 · _rerenderSection:732 · _readSectionInputs:741 · _rv:742 · _rv_s:743 · _bindEditingSection:801

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

### js/energy-analysis-bind.js  _(47 líneas)_
**Funciones:** bindEnergyAnalysis:2 · refresh:5 · year:8 · tab:10 · energyBindSwipe:31

### js/energy-analysis-view.js  _(98 líneas)_
**Estado global:** ENERGY_ANALYSIS_TAB:2 · ENERGY_ANALYSIS_YEAR:3 · ENERGY_ANALYSIS_KIND:4 · ENERGY_RETURN:5 · ENERGY_ANALYSIS_TABS:6

**Funciones:** energyAnalysisHtml:7 · energyConsumptionHtml:23 · energyCostsHtml:31 · energyTariffsHtml:45 · energyScenarioOptions:70 · energyComparisonHtml:77 · energyArchiveHtml:85 · closeEnergyAnalysis:90 · openEnergyAnalysis:91 · energyRefreshAnalysis:97

### js/energy-analysis.js  _(87 líneas)_
**Estado global:** ENERGY_TAX_KEY:3

**Funciones:** energyUnitPrice:5 · energyWeightedPrice:6 · energyValidateTariff:10 · energyTariffDefaults:21 · energyTariffBase:24 · energyTariffNet:35 · energyTariffGross:36 · energyTaxes:40 · energyValidateTaxes:41 · energyMergeTaxes:45 · energySaveTaxes:46 · energyVatAt:47 · energyUtc:48 · energyDate:49 · energyBillEnd:52 · energyConsumptionMonths:57 · energySimulateMonth:76

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

### js/energy-reference.js  _(40 líneas)_
**Funciones:** energyUsageProfile:3 · collect:6 · energyTariffReference:21 · energyTariffReferenceHtml:31 · number:33 · energyComparisonDefaults:36

### js/energy-study.js  _(84 líneas)_
**Estado global:** ENERGY_COST_VAT:2 · ENERGY_COMPARE_TARIFF:3

**Funciones:** energyYearIndicators:4 · tax:8 · energyMetric:11 · energyInfoHtml:12 · energySectionTitle:13 · energyPeriodsHtml:14 · energySuppliersHtml:25 · energyContractPeriods:35 · energyCommercialPeriods:37 · signature:39 · energyPriceExtremes:45 · energySummaryHtml:51 · energyVatStrip:64 · energyCompareChart:76 · energyCompareTable:80

### js/energy-tariff-editor.js  _(52 líneas)_
**Funciones:** energyNumericField:2 · energyTariffEditorHtml:3 · openEnergyTariff:20 · close:23 · read:24 · update:25 · energyEditLegacyTariff:35 · energySendToScenarios:45

### js/events-bind.js  _(572 líneas)_
**Funciones:** _switchEvView:6 · openEvents:24 · closeEvents:34 · openEventsAt:41 · refreshEvents:48 · bindEvEvents:69 · _bindEvNav:78 (!198) · _scrollWeekToMonth:86 · _scrollWeekToToday:133 · doScroll:143 · _bindEvCal:276 (!93) · _bindEvWeekTitleBackground:369 · update:375 · schedule:398 · openEvTypeFilter:403 · close:411 · _bindEvListas:417 (!122) · apply:527 · _bindEvGestos:539 · _evSwipeUpcoming:552 · _evSwipeBodas:559 · _evSwipeRutinas:566

### js/events-cal.js  _(374 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · _renderEvAnnual:342 · _renderEvQuad:351 · renderEvCalMonth:371 · renderEvAnnual:372 · renderEvQuad:373

### js/events-calendar-export.js  _(230 líneas)_
**Estado global:** EV_CAL_EXPORT:3 · EV_ICS_KEY:4 · EV_ICS_UPPER_KEY:5 · EV_ICS_NOTES_KEY:6 · EV_ICS_AUTHOR_KEY:7

**Funciones:** evIcsAuthor:8 · evIcsDescription:9 · evIcsText:14 · evIcsFold:17 · evIcsNextDay:26 · evIcsCandidates:27 · evIcsFile:47 · evIcsRecords:74 · evIcsMergeRecords:77 · evIcsRoutineRows:83 · evIcsRoutineCurrent:93 · evIcsRememberedRows:97 · evIcsPrepare:114 · evIcsExportRows:131 · evIcsExportStatus:134 · evIcsFilterRows:140 · renderEvCalendarExport:145 · openEvCalendarExport:160 · close:163 · find:166 · count:167 · filters:176 · list:182 · dates:198

### js/events-detail.js  _(603 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!118) · fd2:43 · _fila:123 · evDayCarItems:158 · evCarGo:171 · _evCarShow:179 · openEvDayCarousel:187 · closeEvDayCarousel:195 · openEvDetail:202 (!155) · repintar:242 · closeEvDetail:357 · renderEvAlarmPanel:360 (!96) · fd2:362 · openEvAlarm:456 · closeEvAlarm:462 · openBdayAlarmFromEvents:470 · bindEvAlarmEvents:478 (!125) · _syncPre:516 · fmtD:546

### js/events-form.js  _(626 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · evAdmiteRepeticion:39 · renderEvForm:42 (!198) · openEvForm:240 · closeEvForm:266 · bindEvFormEvents:278 (!348) · _refreshShapePreviews:294 · _refreshPickDatesLabel:299 · _curKind:318 · _applyTypeUI:319 · _bindTypeSwatches:348 · _viajeSync:443

### js/events-picker-color.js  _(276 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_MANAGEMENT_SUBTYPES:42 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:64 · EV_FREE_SHAPE:65 · EV_FREE_DATES:68 · EV_BAR_SIZES:71 · EV_FREE_BARSIZE:72 · EV_DOT_SOLID:76 · EV_SHAPE_BW:103

**Funciones:** evIsManagement:43 · evBarSize:77 · evBarSizeCls:83 · evTypeKey:84 · evTypeColor:85 · getEvKind:88 · evShapeSvg:104 · evMorePlusSvg:159 · evTravelColor:168 · getEvType:174 · isEvBarAlways:182 · getEvDisplayColor:184 · _renderColorPicker:205 · _bindColorPicker:228 · updatePreview:238

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(623 líneas)_
**Estado global:** EV_LIST_TYPES:223

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!181) · fd2:50 · renderEvItem:51 · renderEvPanel:103 · renderEvByTypes:224 · coincide:245 · renderEvMonthsView:291 · _evWeekLanes:302 · assign:305 · evWeekTravelRow:320 · renderEvWeek:340 (!133) · hexA:344 · renderEvContent:473 (!150)

### js/events.js  _(805 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_FILTER_CYCLE:44 · EV_PREV_VIEW:61 · EV_QUAD_YEAR:62 · EV_QUAD_MONTH:63 · EV_TO_SUBTAB:64 · EV_TYPES_FILTER:65 · EV_TYPES_PAST:66 · EV_LIST_SORT:67 · EV_LIST_SEARCH:68 · EV_COLORS:69 · EVENTS:70 · EV_ALARM_SK:99 · EV_ALARMS_SET:100 · EV_NO_RUT:192 · EV_MAX_BAR_DIA:248 · EV_MARK_ORDER:356 · EV_MAX_PUNT_DIA:399 · EV_MAX_RUT_DIA:400 · EV_CAL_CORNER_STACK:403 · EV_MAX_VIP_DIA:405 · EV_CAL_VIP_MAX:406 · EV_UP_SHOW_RUT:408 · EV_UP_SHOW_BODA:409 · EV_BAR_Z:461 · EV_COMPARTE_DIA:465 · EV_MNS:657 · EV_CAR:700 · EV_TRANSPORTES:719 · EV_TRANS_EMOJI:725 · EV_DATE_INDEX:791

**Funciones:** evCycleFilters:45 · evFilterGroup:51 · saveEvents:94 · loadEvAlarms:101 · saveEvAlarms:102 · _findBdayByEvId:103 · isEvAlarmSet:115 · setEvAlarmState:121 · evDk:128 · _evClampDate:137 · eventOccursOn:141 · getEventsOn:185 · evSignature:200 · evMergeIncoming:210 · evMergeMsg:235 · _fmtDayEs:247 · evBarLimitExceeded:249 · evDayLimitExceeded:259 · rutDayCount:295 · hasUpcomingEvent:302 · updateEventsBtn:311 · evDefaultShape:325 · evMarkerHtml:333 · evMorePlusHtml:348 · evMarkPriority:357 · evBodaMinutes:366 · evSortMarks:377 · ev0:378 · evAnnualXsHtml:410 · vipStarSvgHtml:420 · vipIconHtml:429 · evIsoDate:435 · _isVipBdayTooFar:436 · evUpcomingMarkHtml:443 · _evRowOcc:462 · evComparteDia:466 · _evSoloSeRozan:471 · _evTrozosSeRozan:482 · _evAssignRow:490 · _evMarcarMitades:504 · _evMitadesStyle:519 · evBarZ:526 · _evBarSegments:530 · _evBarBand:554 · _evBarSegmentStyle:560 · _evBarExtent:565 · _evRoundedOutline:576 · near:585 · _evBarMutedColor:604 · _evSteppedBar:607 · _evAnnualCtx:660 · visible:661 · _evLoadPuentes:679 · _evScheduleRemove:707 · _evCancelRemove:708 · evStartTime:727 · evCompareTime:733 · evEndTime:734 · evTimeLabel:741 · evTramos:748 · evTramoTexto:759 · evMinutosDe:766 · _positionEvBright:776 · withEventDateIndex:792

### js/home-popup.js  _(118 líneas)_
**Funciones:** homeReminderColor:1 · homeReminderEventText:7 · openHomePopup:10 (!108) · dismissPopup:104

### js/household-summary.js  _(67 líneas)_
**Funciones:** householdMortgagePayment:2 · householdMortgagePeriod:5 · householdValue:18 · householdMortgageCard:19 · date:20 · householdUtilityCard:35 · renderHouseholdSummary:54

### js/household.js  _(39 líneas)_
**Estado global:** HOUSEHOLD_RETURN:3

**Funciones:** householdHost:4 · renderHouseholdContent:5 · openHousehold:8 · closeHousehold:21 · reRenderHousehold:28 · bindHousehold:33 · move:36

### js/import-export.js  _(537 líneas)_
**Funciones:** _lsJson:247 · askImportMode:254 · close:268 · _mergeMap:282 · _mergeList:293 · _sigEvent:303 · _sigCouple:305 · _sigAlarm:306 · _sigGasto:307 · _keyId:309 · _keyBday:310 · _keyGasto:311 · _exportPerYearKeys:317 (!85) · _applyFullImport:402 (!135)

### js/import-preview.js  _(19 líneas)_
**Funciones:** renderImportPreview:2 · add:4

### js/init.js  _(499 líneas)_
**Estado global:** DRUM_ITEM_H:144 · DN_ES:301

**Funciones:** _updateHeaderActive:31 · buildDrumPicker:145 · updateDrumSelected:173 · getDrumValue:179 · checkDrumMinuteWrap:185 · buildAlarmDayBtns:216 · showAlarmPastConfirm:246 · proceed:287 · setConnectionsEditing:363 · aplicarActualizacion:424 · reload:430 · _showUpdateBar:452 · _buscar:486

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/nav-icons.js  _(66 líneas)_
**Estado global:** NAV_ICON_STYLE:2 · NAV_MAIN_ITEMS:4 · NAV_ICON_PATHS:11

**Funciones:** navIconHtml:20 · applyNavIconStyle:25 · openNavIconPicker:32 · closeNavIconPicker:54 · bindNavIconStyle:55 · initMainNavigation:61

### js/rutinas-addition.js  _(54 líneas)_
**Funciones:** closeRutAddition:3 · rutAdditionPanel:4 · openRutAddition:10 · rutAdditionPickWeek:21 · rutAdditionPickSession:26 · rutAdditionForm:38

### js/rutinas-bulk.js  _(60 líneas)_
**Funciones:** rutBulkChange:3 · rutOffsetDate:11 · rutPauseAfter:12 · rutHistorySelectionHtml:19 · bindRutHistorySelection:24 · openRutBulkConfirm:36 · close:48

### js/rutinas-flex.js  _(142 líneas)_
**Estado global:** RUT_PLAN:2

**Funciones:** rutFlexible:3 · rutFlexEarliest:4 · rutFlexTarget:5 · rutFlexRange:9 · rutFlexCount:15 · rutFlexStatus:18 · rutFlexWarnings:25 · rutFlexSummary:31 · rutFlexOptionsHtml:37 · bindRutFlexOptions:51 · paint:52 · rutFlexRead:70 · rutFlexSetSession:87 · renderRutPlan:105 · openRutPlan:128 · closeRutPlan:129 · refreshRutPlan:130 · mutate:137

### js/rutinas-history.js  _(158 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · rutHistoryMonthGroups:41 · renderRutHistorySession:47 · renderRutHistory:57 · rutHistoryScrollToday:80 · openRutHistory:85 · closeRutHistory:111 · rutEditSession:112 · openRutHistoryEdit:127 · close:140

### js/rutinas-icons.js  _(88 líneas)_
**Estado global:** RUT_ICONS:7 · RUT_APPEARANCE_KEY:8 · RUT_GYM_COLOR:9 · RUT_FIXED_COLOR:10 · RUT_ICON_LABEL:13

**Funciones:** rutDisplayColor:11 · rutColorOf:12 · _rutIconShapes:14 · _rutIconDetails:37 · rutIconOf:56 · rutIconSvg:66 · setRutGymColor:83

### js/rutinas-recovery.js  _(57 líneas)_
**Estado global:** RUT_RECOVERY_PICK:3

**Funciones:** rutUnrecoveredSessions:4 · openRutRecoveryList:9 · openRutRecoveryDay:26 · render:29 · select:38 · move:41 · rutReadOnlyDayHtml:47

### js/rutinas-sessions.js  _(104 líneas)_
**Funciones:** rutSessionsOn:3 · rutSessionByKey:9 · rutRecoveryFor:14 · rutSessionTag:15 · rutRecoveryNote:20 · rutRecoveryHtml:24 · rutValidateAddition:29 · rutAddSession:34 · rutValidateExtraSessions:53 · rutSaveSessionChange:69 · rutDeleteSession:76 · openRutSessionDelete:90 · close:97

### js/rutinas.js  _(826 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_SUBTAB:262 · RUT_WEEK_SEL:606 · RUT_WEEK_CAL:607

**Funciones:** saveRutinas:25 · rutMarkerHtml:39 · rutMarkerGroups:47 · rutDayMarkersHtml:54 · rutById:59 · rutWeekKey:64 · rutTimeOfDay:73 · rutTieneHorarios:78 · rutScheduleOn:86 · rutScheduleCopy:91 · rutDurationOn:95 · rutChangeFrom:100 · rutChangeWeek:124 · update:128 · rutWeekCfg:140 · rutSuspendedOn:150 · rutDiaLleno:160 · rutOccursOn:164 · rutIsSkipped:175 · rutToggleSkip:176 · rutFin:194 · rutEventsOn:202 · rutEventFromId:219 · rutSessions:228 · rutStats:242 · rutProximas:255 · renderRutinasBody:265 · _rutTimeRange:278 · _renderRutSchedule:282 · _renderRutLista:296 · _rutFmt:331 · _rutFmtCorto:332 · _renderRutStats:338 · renderRutForm:385 · openRutForm:449 (!152) · _rutRepaintIcons:458 · _rutPintaHoras:483 · closeRutForm:601 · openRutWeek:608 · _rutWeekPick:617 · back:641 · _rutWeekRender:670 (!80) · closeRutWeek:750 · openRutSesion:753 · closeRutSesion:785 · bindRutinasEvents:788

### js/summary.js  _(613 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · VAC_YEAR_KEY:16 · VAC_BY_YEAR:17 · SPAIN_AVG:258 · DN7S:282

**Funciones:** vacEntitlementForYear:18 · saveVacEntitlement:21 · fhY:27 · fdY:28 · computeYearlySummary:30 · barChart3:104 · computePuentes:131 · isNWD:141 · typeOf:142 · renderSummaryWorkBody:175 (!101) · fmtSigned:263 · renderSummaryPuentesBody:276 (!94) · fdd:283 · renderSummaryTimeOffBody:370 (!92) · fdd:376 · bindSummaryWorkBodyEvents:462 · bindSummaryPuentesBodyEvents:472 · bindSummaryTimeOffBodyEvents:497 · renderSummaryContent:503 · closeSummary:524 · bindSummaryEvents:530 (!83)

### js/tasks-float.js  _(81 líneas)_
**Estado global:** TASKS_FAB_HIDDEN_KEY:3 · TASKS_FAB_HIDDEN:4 · TASKS_FLOAT:5

**Funciones:** tasksFloatPosition:6 · tasksDock:17 · tasksUpdateFab:20 · initTasks:27 · end:49 · resize:61 · tasksSetAccessHidden:72 · tasksRestoreAccess:73 · bindTasksRestoreGesture:74 · distance:76

### js/tasks-view.js  _(103 líneas)_
**Estado global:** TASKS_VIEW:2 · TASKS_ICON:3

**Funciones:** renderTasks:4 · renderTaskRow:20 · openTasks:32 · closeTasks:40 · tasksKeydown:46 · renderTasksPanel:56 · tasksPerform:69 · tasksRowAction:73 · bindTasksReorder:86 · clear:92 · end:98

### js/tasks.js  _(68 líneas)_
**Estado global:** TASKS_KEY:3 · TASKS_RETENTION:4

**Funciones:** tasksValidate:5 · tasksPrune:16 · tasksData:21 · tasksSave:26 · tasksPurge:27 · tasksMerge:32 · tasksItems:38 · tasksCreate:41 · tasksChange:46 · tasksMove:56 · tasksReminder:63 · tasksReminderSeen:67

## CSS

### css/styles.css  _(3033 líneas)_

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
- Tema claro: el fondo oscuro con letra de color no se leia bien:199
- SW UPDATE BUTTON (en menú ⋯):203
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:207
- ANIMATIONS:211
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:240
- OVERLAY BASE (summary, econ, bday, events):246
- SHARED OVERLAY HEADER:251
- SHARED BODY:272
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:321
- Vacaciones config:327
- Quitar festivos/vacaciones checkboxes:331
- Month summary breakdown:353
- Ausencia list tag:358
- ECONOMICS:361
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:366
- Summary sublabel (hours breakdown):383
- Ingresado box (formerly cobrado) — neutral:392
- ECONOMICS v2: tabs + nuevas secciones:426
- Estudio Cambio — grouped nav:448
- Estudio — tariff comparison cards:457
- Análisis hipoteca — secciones organizadas:478
- Mis gastos — budget table:495
- Year selector for per-year fiscal tabs:508
- §1.1 Tarifa dual:519
- §1.3 Stats por hora/día:531
- §1.4 Toggles:538
- §1.5 Declaración IRPF:543
- Tab 2: Comparador:556
- Calcular Tarifa (sim):584
- Scenario zones (Comparar Escenarios):602
- Análisis Ec. Personal:619
- Bloques de la Subrogación:621
- Fiscal config modal — purple theme override:664
- Fiscal config modal:666
- ECONOMICS v3: opt-buttons, cascade, gastos:692
- Cascade ingresos/gastos:699
- Media mensual: cards:709
- Tab 4: Análisis:719
- IRPF Breakdown visual:733
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:760
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):762
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):786
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:795
- Resumen fiscal al final de Ingresos y Gastos:797
- Donut chart:804
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):814
- Fiscal config: gastos items:821
- Fiscal: tab bar:833
- Fiscal: sticky save:838
- Fiscal: section title income/expense colors:840
- Fiscal: desgravaciones:850
- Fiscal: compras profesionales:877
- Desgravaciones: notas + tabla despacho info:885
- Nota IVA compras:905
- IVA por item en compras:907
- Fiscal: despacho en casa:914
- Hipoteca — resumen visual:937
- Hipoteca — compact 2-col grid:960
- Hipoteca — compact vinculaciones:968
- Hipoteca — read-only fields:979
- Hipoteca — edit/detail buttons:988
- Hipoteca — period summary card:994
- Multi-rate period cards:1007
- Distribución de ingresos:1023
- Comparador: reorder buttons:1039
- Rate input styled:1043
- BIRTHDAYS:1047
- Cabe el nombre entero, hasta en tres lineas:1061
- VIP controls bar:1067
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1078
- VIP edit mode item states:1081
- Feat 1: Buscador en lista por meses:1091
- Upcoming birthdays:1117
- Weekend frame — gris lavanda suave:1134
- Hoy manda sobre el gris del fin de semana:1137
- Events in puentes (summary) — one per line:1157
- Events upcoming view:1161
- Minicabecera de día dentro de un panel de Próximos:1163
- Marcador de la tarjeta de Proximos: la forma real del evento:1173
- Horas del evento y transporte de ida/vuelta:1178
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1210
- Grid del mes: col fecha (48px) + col eventos (1fr):1212
- Columna fecha (col 1):1214
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1223
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1230
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1234
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1240
- Event color type picker:1244
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1255
- Color picker avanzado (paleta 6×8 + color libre):1259
- Detail color picker toggle:1277
- Annual events calendar:1283
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1313
- Selector de formas en el formulario de evento (Otros):1324
- Selector de grosor de barra (grande | Otros):1326
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1341
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1345
- Inicio/Fin bloqueados cuando hay Selección Multidía:1348
- Mini-overlay para elegir días específicos (Otros):1353
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1380
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1384
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1386
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1392
- Calendario 4 meses: 2 columnas × 2 filas:1394
- Botón ir al calendario mensual en puentes del resumen:1396
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1408
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1412
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1430
- Dropdown de vista anual:1437
- Linea que separa los chips de eventos grandes de los puntuales:1446
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1455
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1459
- Summary tabs — nivel 2:1462
- BRIDGE DAY CELLS in summary:1467
- VIP BIRTHDAYS:1476
- BIRTHDAY + EVENT ALARM PANEL:1479
- Campana de alarma en items de próximos (bday + eventos):1482
- 3-ZONE ALARM MARKER:1520
- ALARM MANAGEMENT OVERLAY:1533
- HOME POPUP (semanas pendientes / VIP sin alarma):1534
- MACRO URL EN MENÚ:1544
- Feat 4: Nav-bar emoji alignment:1550
- Birthday detail / form overlays:1560
- EVENTS:1570
- Zone A: upcoming/list views — subtle blue tint:1578
- Zone B: calendar grid views — subtle teal tint, active = green:1579
- Feat 2: Lista de Eventos subtabs:1582
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1599
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1601
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1613
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1617
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1623
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1638
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1648
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1680
- Perímetro puente: capa inferior a eventos:1682
- Bright past: bombilla override:1702
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1707
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1712
- Quad label 3 lines:1717
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1724
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1726
- Events list view:1728
- Event form overlay (inside eventsOverlay):1742
- Relleno, para que haga pareja con el naranja de "Editar evento":1772
- Event detail:1778
- LOGO POPUP:1786
- Gallery:1795
- BD ALARM VIP TOGGLE:1804
- RESPONSIVE (mobile header):1807
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1809
- ALARM PANEL:1862
- Drum picker (selector giratorio de hora/minuto):1867
- Confirmación alarma en el pasado:1893
- Botón flotante "Listo" en modo Editar VIPs:1899
- Controles inline long-press cumpleaños:1902
- Selector de clase en el formulario:1910
- Notas: general vs de un dia concreto:1916
- Pestana Bodas y pestana partida Vacaciones/Festivos:1920
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1921
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1932
- Filas del panel de un aviso:1946
- Estadisticas:1950
- Barras horizontales de reparto (componente generico: hBarRows):1958
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1968
- Dia cerrado: no admite mas clases:1985
- Una clase a la que le falta la hora o la sala se marca ella sola.:1996
- Fila con cambios sin guardar:2001
- Filtros de Parejas como chips pulsables:2013
- El color de la pareja va en un punto delante; el nombre, en color normal:2076
- Sala sin asignar: se marca en naranja para que cante en la lista:2081
- Nota propia del dia en la lista de Proximos:2084
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2086
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2088
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2096
- Editar siempre en naranja, como en el resto de la app:2102
- Los tres botones del detalle de pareja comparten aspecto:2119
- Subpestana Calendario de bodas:2159
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2173
- Dia resaltado al pulsar una pareja en la leyenda:2180
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:2186
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2208
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2210
- etiqueta al minimo: el nombre de la pareja necesita el resto:2219
- el color de la pareja va en un punto, no tinendo el nombre:2222
- Los tres botones de la pareja, en una sola linea:2229
- Buscador y boton de anadir en la misma fila:2232
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2238
- Horario distinto segun el dia:2242
- Selector de icono de rutina:2247
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2302
- Diálogo: modo de importación (añadir vs reemplazar):2317
- PRINT:2330
- Separacion de siluetas incluso entre grosores distintos.:2350
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2365
- Editar: tono comun, con geometria propia de cada pantalla.:2377
- Marca oficial con transparencia; conserva contraste en ambos temas.:2394
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2415
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2433
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2459
- Text edits retain the solid orange; only standalone pencils use a tint.:2468
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2475
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2542
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2557
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2567
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2579
- Titulo y estado separados para que "saltada" nunca quede tachado.:2604
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2614
- El titulo queda dentro del borde de 1.5px de su caja continua.:2619
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2625
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2641
- Una identidad de color por ventana para ambos juegos de iconos.:2645
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2676
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2683
- Borde discreto para identificar semanas enviadas en ambos temas.:2688
- Filtros junto al buscador sin ensanchar la ventana movil.:2692
- Configuracion de tarifa: controles verdes y valores neutros.:2705
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2723
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2740
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2744
- Selector de eventos para compartir por iCalendar:2769
- Selector de exportación: controles compactos y lista con espacio propio.:2770
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2807
- Compartir: cabecera centrada, categorías completas y lista compacta.:2825
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2858
- Estudio energético: controles compactos y separación entre apartados.:2868
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2871
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2887
- Solo energía reparte el espacio entre textos, con ancho de contenido.:2897
- Identidad propia de cada pestaña, sin alterar el sistema general.:2900
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2953
- Navegación: la misma geometría en Home y en las ventanas.:2997
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:3008
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:3023

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:482-484 · .ah-donut:492-494 · .ah-section:479-481 · .ah-total:489-491 · .ah-vs:485-488 · .alarm-cfg:1863-1863 · .alarm-colon:1866-1866 · .alarm-create:1880-1886 · .alarm-day:1890-1892 · .alarm-days:1887-1889 · .alarm-msg:1876-1877 · .alarm-panel:1864-1864 · .alarm-past:1894-1898 · .alarm-time:1865-1865 · .analisis-card:631-633 · .analisis-cards:620-620 · .analisis-hbar:634-639 · .analisis-input:649-652 · .analisis-ins:658-663 · .analisis-insurance:657-657 · .analisis-mortgage:640-656 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1480-1806 · .bd-detail:1561-1568 · .bd-export:266-266 · .bday-add:1132-1133 · .bday-badge:1062-1064 · .bday-buscar:1094-1096 · .bday-cancel:1079-1080 · .bday-cell:1055-1138 · .bday-hdr:1049-2461 · .bday-header:2455-2457 · .bday-ic:1904-1908 · .bday-inline:1903-1903 · .bday-io:1100-1116 · .bday-jump:2357-2398 · .bday-list:1066-1090 · .bday-listo:1900-1900 · .bday-month:1065-2473 · .bday-next:2407-2408 · .bday-num:1060-1060 · .bday-search:1097-1099 · .bday-sub:2584-2585 · .bday-upcoming:1118-2355 · .bday-vip:1068-1477 · .bday-week:1050-1052 · .boda-actions:2111-2111 · .boda-add:2113-2113 · .boda-asg:2136-2966 · .boda-buscar:2233-2235 · .boda-cal:2160-2185 · .boda-card:2019-2241 · .boda-catalog:2384-2392 · .boda-cfg:2434-2446 · .boda-chip:2015-2017 · .boda-chips:2014-2014 · .boda-cl:2073-2110 · .boda-class:1997-2072 · .boda-config:2380-2431 · .boda-controls:1975-1975 · .boda-count:2388-2388 · .boda-couple:2055-2057 · .boda-cpk:2127-2135 · .boda-date:2112-2466 · .boda-day:1991-2421 · .boda-det:2118-2960 · .boda-dia:2062-2064 · .boda-dot:2023-2023 · .boda-falta:2030-2030 · .boda-field:2422-2427 · .boda-filter:2360-2362 · .boda-filters:1978-1978 · .boda-fsel:1979-1982 · .boda-ftoggles:1983-1984 · .boda-future:2822-2822 · .boda-hd:2106-2108 · .boda-inp:2050-2050 · .boda-iss:1947-1949 · .boda-issue:1934-1945 · .boda-issues:1933-1933 · .boda-last:2872-2876 · .boda-legend:2114-2117 · .boda-mini:2100-2368 · .boda-mode:1965-1967 · .boda-multi:2065-2070 · .boda-name:2024-2024 · .boda-ok:2031-2031 · .boda-pack:2389-2390 · .boda-pfilters:2359-2363 · .boda-place:2058-2083 · .boda-prog:2026-2027 · .boda-ro:2074-2082 · .boda-save:2011-2012 · .boda-savebar:2007-2010 · .boda-search:2236-2236 · .boda-sec:1931-1931 · .boda-sobra:2032-2032 · .boda-sort:2237-2237 · .boda-stat:1952-1957 · .boda-stats:1951-1951 · .boda-sticky:1927-2444 · .boda-sum:1971-1974 · .boda-summary:1970-1970 · .boda-swap:2040-2047 · .boda-teachers:2409-2409 · .boda-time:2051-2051 · .boda-tp:2189-2192 · .boda-wed:2025-2025 · .bottom-sheet:170-171 · .btn-icon:103-1852 · .csv-export:76-77 · .data-actions:99-2999 · .data-btn:100-2654 · .data-menu:117-123 · .day-cell:138-244 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1376-1377 · .dp-counter:1363-1364 · .dp-day:1371-1375 · .dp-days:1370-1370 · .dp-grid:1365-1365 · .dp-handle:1358-1358 · .dp-hdr:1359-1359 · .dp-mhdr:1368-1369 · .dp-mname:1367-1367 · .dp-month:1366-1366 · .dp-overlay:1354-1357 · .dp-sheet:1356-1356 · .dp-title:1360-1360 · .dp-yearnav:1361-1362 · .drum-picker:1869-1872 · .drum-sel:1875-1875 · .drum-wrap:1868-1874 · .econ-add:566-567 · .econ-ahorro:787-794 · .econ-annual:385-385 · .econ-avg:386-714 · .econ-bracket:549-555 · .econ-calc:697-698 · .econ-casc:701-708 · .econ-cascade:700-700 · .econ-chart:579-580 · .econ-comp:557-581 · .econ-decl:544-718 · .econ-distrib:1024-1038 · .econ-donut:805-820 · .econ-equiv:1019-1022 · .econ-fiscal:798-803 · .econ-formula:405-408 · .econ-gastos:720-732 · .econ-gear:516-517 · .econ-hdr:427-518 · .econ-ingresado:393-393 · .econ-irpf:734-796 · .econ-legend:582-583 · .econ-line:577-578 · .econ-month:410-423 · .econ-mr:1016-1017 · .econ-multi:1008-1018 · .econ-opt:693-696 · .econ-qcard:375-382 · .econ-qcell:371-1813 · .econ-qm:380-380 · .econ-qmonth:378-379 · .econ-quarter:367-1810 · .econ-rate:520-528 · .econ-row:394-404 · .econ-sc:559-1045 · .econ-scenario:558-558 · .econ-section:424-424 · .econ-sim:585-595 · .econ-stats:532-537 · .econ-sub:430-447 · .econ-tab:428-2630 · .econ-tariff:2706-2711 · .econ-toggle:539-542 · .econ-val:409-409 · .energy-bar:2943-2943 · .energy-caption:2859-2859 · .energy-choice:2869-2869 · .energy-compare:2992-2992 · .energy-contract:2849-2862 · .energy-cost:2939-2994 · .energy-coverage:2930-2930 · .energy-extremes:2926-2926 · .energy-fee:2895-2896 · .energy-field:2852-2864 · .energy-fields:2866-2866 · .energy-history:2847-2848 · .energy-info:2915-2917 · .energy-inline:2936-2936 · .energy-legend:2944-2944 · .energy-metric:2984-2986 · .energy-metrics:2983-2983 · .energy-overview:2919-2921 · .energy-period:2922-2924 · .energy-price:2851-2856 · .energy-range:2945-2945 · .energy-reconciliation:2929-2929 · .energy-scenario:2993-2993 · .energy-section:2914-2914 · .energy-sheet:2846-2846 · .energy-supplier:2927-2987 · .energy-table:2860-2860 · .energy-tabs:2898-2909 · .energy-tariff:2932-3030 · .energy-tax:2854-2990 · .energy-vat:2988-2988 · .energy-window:2888-2982 · .energy-year:2863-2951 · .est-btn:452-456 · .est-card:462-464 · .est-detail:459-459 · .est-field:471-477 · .est-fields:470-470 · .est-group:450-454 · .est-modo:465-465 · .est-nav:449-2629 · .est-section:458-458 · .est-tariff:460-469 · .ev-alarm:1503-2095 · .ev-ann:1409-1645 · .ev-annual:1175-2956 · .ev-badge:1727-1727 · .ev-badges:1609-1609 · .ev-bar:1674-1674 · .ev-bars:1602-1602 · .ev-barsize:1327-1336 · .ev-bday:2586-2587 · .ev-bficha:2215-2215 · .ev-bfila:2216-2225 · .ev-bpunto:2223-2223 · .ev-bright:1703-2742 · .ev-btn:1765-3005 · .ev-bver:2228-2228 · .ev-cal:2773-2845 · .ev-car:1624-2212 · .ev-cell:1139-1723 · .ev-char:1754-1754 · .ev-checkbox:1759-1759 · .ev-chip:1452-2374 · .ev-color:1257-1276 · .ev-colors:1755-1755 · .ev-date:1756-1756 · .ev-dates:1349-1351 · .ev-day:1612-1665 · .ev-daynote:1918-1918 · .ev-del:2314-2315 · .ev-detail:1278-2209 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1400-1769 · .ev-field:1748-2821 · .ev-filter:1447-2979 · .ev-form:1743-1764 · .ev-hdr:1461-1574 · .ev-hora:1179-1179 · .ev-input:1750-1751 · .ev-io:1102-2995 · .ev-kind:1911-1915 · .ev-list:1583-2725 · .ev-main:1575-3021 · .ev-management:1249-1251 · .ev-month:1591-1652 · .ev-multi:1606-2375 · .ev-note:1917-1917 · .ev-num:1725-1725 · .ev-otros:1325-1670 · .ev-puente:1683-1683 · .ev-quad:1395-1719 · .ev-repeat:1760-1760 · .ev-rut:1661-2610 · .ev-search:2304-2308 · .ev-sep:1202-1202 · .ev-shape:1337-2260 · .ev-share:2771-2772 · .ev-sort:2309-2354 · .ev-stepped:1676-1678 · .ev-sub:437-439 · .ev-textarea:1752-1753 · .ev-toggle:1757-1758 · .ev-type:1245-2729 · .ev-types:1586-2726 · .ev-up:1164-2570 · .ev-upcoming:326-3028 · .ev-viaje:1180-1188 · .ev-view:1573-2367 · .ev-wd:1762-1763 · .ev-week:322-2823 · .ev-weekday:1761-1761 · .ev-wk:1189-3027 · .excl-item:352-530 · .excl-row:332-529 · .fiscal-add:686-849 · .fiscal-bracket:677-685 · .fiscal-compras:878-913 · .fiscal-copy:513-515 · .fiscal-custom:674-674 · .fiscal-ded:888-902 · .fiscal-desgrav:851-903 · .fiscal-despacho:915-936 · .fiscal-error:690-690 · .fiscal-gasto:822-884 · .fiscal-gastos:904-904 · .fiscal-hdr:834-834 · .fiscal-highlight:875-875 · .fiscal-hip:2703-2704 · .fiscal-onoff:917-918 · .fiscal-pct:675-684 · .fiscal-period:830-831 · .fiscal-radio:669-673 · .fiscal-save:688-689 · .fiscal-section:667-842 · .fiscal-sticky:839-839 · .fiscal-subsection:843-844 · .fiscal-tab:835-2627 · .fiscal-viaje:845-846 · .fiscal-vinc:928-929 · .fiscal-year:509-512 · .full-overlay:247-248 · .hbar-lbl:1961-1961 · .hbar-row:1960-1960 · .hbar-rows:1959-1959 · .hbar-track:1962-1963 · .hbar-val:1964-1964 · .header:57-2745 · .header-brand:60-60 · .hip-add:1006-1006 · .hip-auto:957-957 · .hip-bar:943-950 · .hip-cancel:993-993 · .hip-cf:962-967 · .hip-edit:989-991 · .hip-g2:961-961 · .hip-grid:955-955 · .hip-period:995-1004 · .hip-resumen:938-942 · .hip-ro:980-987 · .hip-save:992-992 · .hip-section:956-1005 · .hip-stat:952-954 · .hip-stats:951-951 · .hip-sub:959-959 · .hip-vinc:958-958 · .hip-vr:969-978 · .home-popup:1535-2885 · .home-reminder:2802-2804 · .home-submission:2747-2758 · .home-summary:2759-2767 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:267-267 · .imp-mode:2318-2968 · .imp-preview:2969-2973 · .io-peligro:1107-1115 · .io-primaria:1106-1113 · .logo-gallery:1796-1803 · .logo-popup:1787-1794 · .macro-section:1545-1546 · .macro-url:1547-2371 · .mg-budget:496-505 · .mg-cat:506-506 · .mg-desgrav:507-507 · .mg-sort:502-502 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2762 · .ms-breakdown:354-356 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:357-357 · .nav-bar:1457-3000 · .nav-btn:65-66 · .nav-icon:2662-2672 · .nav-pro:2636-2648 · .nav-style:2660-2660 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1456-1458 · .rate-input:364-2347 · .rate-label:363-363 · .rate-row:362-362 · .rate-suffix:365-365 · .rut-add:2286-2286 · .rut-addition:2505-2522 · .rut-agenda:2519-2520 · .rut-cancelled:2546-2605 · .rut-card:2276-3018 · .rut-day:2292-3012 · .rut-days:2291-3009 · .rut-dot:2279-2279 · .rut-dpick:3004-3004 · .rut-first:2257-2257 · .rut-flex:2254-2262 · .rut-hist:2298-2301 · .rut-history:2489-3032 · .rut-hora:3013-3015 · .rut-hpd:2243-2487 · .rut-icon:2248-2472 · .rut-marker:1657-1660 · .rut-name:2280-2280 · .rut-pct:2285-2285 · .rut-plan:2263-2275 · .rut-recovery:2514-3003 · .rut-routine:3019-3019 · .rut-sec:2253-2253 · .rut-session:2524-3002 · .rut-skipped:2606-2607 · .rut-stat:2295-2297 · .rut-sub:435-445 · .rut-sug:2287-2290 · .rut-susp:2294-2294 · .rut-tag:2281-2282 · .rut-time:3016-3016 · .rut-vacio:2283-2283 · .rut-week:2488-2488 · .rut-weekdays:3010-3010 · .rut-wpick:2202-2207 · .selected:2669-2669 · .sent-badge:134-134 · .settings-details:2410-2412 · .settings-edit:2372-2413 · .settings-menu:2738-2738 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:597-601 · .sim-field:586-587 · .sim-hr:596-596 · .sim-period:593-593 · .sim-target:588-592 · .sub-block:622-623 · .sub-row:624-630 · .sw-upd:204-204 · .sy-back:253-2338 · .sy-body:273-2336 · .sy-card:284-2342 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-2337 · .sy-lbl:293-2341 · .sy-list:306-359 · .sy-month:320-320 · .sy-nav:262-1716 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-period:2712-2719 · .sy-puente:312-1475 · .sy-section:274-275 · .sy-spain:278-283 · .sy-sublbl:384-384 · .sy-suelto:317-319 · .sy-tab:1463-1466 · .sy-table:294-2343 · .sy-td:299-299 · .sy-tr:300-2344 · .sy-val:289-2340 · .sy-year:255-2339 · .toast:190-209 · .toast-undo:206-206 · .today-btn:67-68 · .vac-config:328-330 · .vip-no:1074-1075 · .week-actions:159-159 · .week-card:128-2689 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2395-2550

