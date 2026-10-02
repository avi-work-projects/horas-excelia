# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays-bind.js  _(313 líneas)_
**Funciones:** bindBdayFormEvents:1 · openBday:52 · closeBday:56 · refreshBday:57 · applyBdaySearch:61 · bindBdayEvents:73 (!194) · _bdResetScroll:106 · _bdScrollToMonth:108 · bindBdayUpcoming:267 · bdayPanelHost:309

### js/birthdays-panels.js  _(307 líneas)_
**Funciones:** renderBdayDetail:1 · renderBdayAlarmPanel:22 · fmtDate:34 · openBdayAlarm:89 · _bdRefreshBoth:96 · closeBdayAlarm:100 · bindBdayAlarmEvents:102 (!146) · fmtD:218 · onOk:225 · onErr:226 · renderBdayForm:248 · openBdayDetail:281 · closeBdayDetail:291 · openBdayForm:294 · closeBdayForm:304

### js/birthdays-render.js  _(246 líneas)_
**Estado global:** DN7:94

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:4 (!88) · getBdaysInRange:9 · bdayLabel:24 · renderGroup:33 · renderBdayCalMonth:92 · renderBdayList:132 · getEffVip:139 · renderBdayContent:181

### js/birthdays.js  _(161 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_CAL_VIP:7 · BDAY_EDIT:8 · BDAY_SEARCH:9 · BDAY_UP_VIP:10 · BDAY_FILTER_VIP:11 · BDAY_EDIT_VIP:12 · BDAY_VIP_PENDING:13 · BDAY_ALARM_SET_KEY:67 · BDAY_ALARM_SET:68 · BDAY_ALARM_COUNT_KEY:69 · BDAY_ALARM_COUNT:70 · BDAY_PALETTE:74 · BDAYS:78

**Funciones:** _showBdayInlineCtrl:19 · tc:87 · bdName:88 · getBdayColor:90 · getBdaysOn:99 · daysUntil:101 · hasUpcomingBday:108 · updateBdayBtn:114 · getBdayAlarmKey:124 · isBdayAlarmSet:125 · setBdayAlarmState:129 · syncVipBdaysToEvents:136

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

### js/data-integrity.js  _(183 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:129

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 (!96) · visit:27 · hour:80 · days:81 · schedule:82 · validBirthday:121 · prepareImportRelations:122 · loadMailConfig:130 · saveMailConfig:133 · birthdayValidation:136 · rutLimitExceeded:141 · legacy:172

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(584 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:333 · ESTUDIO_ELECT_CALC:334 · ESTUDIO_ELECT_IVA:335

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:235 · _renderEstudioGasComp:243 · _renderGasCompCard:303 · _calcElectCost:337 · _currentElectTariff:338 · _renderEstudioElectComp:343 · _renderMultiScenarioResult:346 · _bindEstudioGas:414 · _bindEstudioElect:445 · _bindScenarios:447 · _readScenarios:466 · _bindCompFields:475 · _saveCompFields:510 · renderEstudioContent:526 · openEstudio:540 · closeEstudio:550 · reRenderEstudio:555 · bindEstudioEvents:563

### js/economics-fiscal-bind.js  _(563 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:26 · reRenderFiscal:32 · bindFiscalEvents:43 · _switchTab:47 · _bindYearSelector:81 · _bindTabPersonal:119 · _bindTabIrpf:170 · _bindTabGastosDesg:215 (!91) · _rebindComprasDel:264 · _bindTabIrpfDeduc:306 · _bindTabDesgrav:319 (!96) · _bindList:321 · _bindTabDespachoOnly:415 (!83) · _syncLiveD:426 · _updateFmt:464 · _saveFiscalAll:498 · _rv:527

### js/economics-fiscal-datos.js  _(341 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · HOUSEHOLD_TAB_KEY:30 · FISCAL_ENTRY:31 · FISCAL_HIP_SUB:33 · FISCAL_HIP_EDITING:35 · FISCAL_HIP_EDIT_SNAPSHOT:36 · FISCAL_HIP_DETAIL_TARGET:37 · PERSONAL_SK:43 · PERSONAL_DATA:44 · DEFAULT_PERSONAL_GASTOS_REC:46 · DEFAULT_PERSONAL_INVERSIONES:52 · INGRESOS_SK:96 · INGRESOS_ITEMS:97 · GASTOS_SK:114 · GASTOS_DIFICIL_PCT:115 · DEFAULT_GASTOS:116 · GASTOS_ITEMS:134 · COMPRAS_SK:196 · COMPRAS_IVA_ENABLED:197 · DEFAULT_COMPRAS:198 · COMPRAS_ITEMS:204 · DESGRAV_SK:251 · DESGRAV_DEFAULT:253 · DESGRAV_ITEMS:273 · OBSOLETE_IDS:276

**Funciones:** householdTab:32 · setHouseholdTab:34 · _yearKey:40 · _ensureDefaults:59 · loadPersonalYear:75 · savePersonalYear:91 · loadIngresos:98 · saveIngresos:101 · findIngreso:104 · ingresoAnual:108 · loadFiscal:136 · saveFiscal:144 · getIrpfPct:147 · getBrackets:148 · _loadGastosFromRaw:150 · loadGastosYear:168 · loadGastos:181 · saveGastosYear:182 · findGasto:185 · gastoAnual:189 · loadCompras:205 · saveCompras:222 · comprasTotal:226 · comprasIvaTotal:236 · loadDesgrav:275 · saveDesgrav:306 · desgravAnual:309 · computeTotalDesgrav:330

### js/economics-fiscal-elect.js  _(241 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:135

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:84 · _despField:100 · _despFieldMoney:109 · _renderIngresosDesgList:122 · _renderGastoItem:141 · renderGastosList:156 · _bindElectDetalle:178 · _bindSegurosNormales:225

### js/economics-fiscal-gas.js  _(113 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:75

### js/economics-fiscal-hip.js  _(851 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipROvinc:364 · _calcInsOvercost:374 · _renderInlineOvercost:385 · _renderHipResumen:404 · _renderHipDetalle:407 · _renderHipSectionContent:433 · _renderCompraSection:445 · _renderPrestamoSection:474 · _renderSubSection:521 · renderFiscalTabDespacho:592 · _bindTabDespacho:609 · _bindHipResumen:635 · _bindHipDetalle:660 · _rerenderSection:731 · _readSectionInputs:740 · _rv:741 · _rv_s:742 · _bindEditingSection:800

### js/economics-fiscal.js  _(461 líneas)_
**Estado global:** GROUP_CASA_DESP:324 · GROUP_UTIL_DESP:325

**Funciones:** renderFiscalContent:8 · _renderYearSelector:34 · _renderCopyYearBtn:42 · _personalListHtml:65 · _personalTripFilter:100 · _personalTotal:109 · _personalTotalWeekly:113 · renderFiscalTabPersonal:117 · renderFiscalTabIrpf:158 · renderFiscalTabGastosDesg:205 · renderComprasList:236 · renderFiscalTabIrpfDeduc:285 · renderFiscalTabDesgrav:298 · renderDesgravDespachoInfo:320 · _dedCard:361 · renderDesgravList:396

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

### js/electricity-comparator.js  _(112 líneas)_
**Funciones:** energyHistoricalTariffs:2 · electricComparisonTariff:9 · electricHistoricalCopy:16 · electricModesHtml:24 · electricTariffFieldsHtml:28 · electricComparisonCard:44 · electricConsumptionScenariosHtml:51 · renderElectricityComparison:57 · bindElectricComparisonCard:69 · validate:70 · save:74 · bindElectricityComparison:95 · refresh:98

### js/energy-analysis-bind.js  _(48 líneas)_
**Funciones:** bindEnergyAnalysis:2 · refresh:5 · year:8 · tab:11 · energyBindSwipe:32

### js/energy-analysis-view.js  _(96 líneas)_
**Estado global:** ENERGY_ANALYSIS_TAB:2 · ENERGY_ANALYSIS_YEAR:3 · ENERGY_SUMMARY_TOTAL:4 · ENERGY_ANALYSIS_KIND:5 · ENERGY_RETURN:6 · ENERGY_ANALYSIS_TABS:7

**Funciones:** energyAnalysisHtml:8 · energyConsumptionHtml:24 · energyCostsHtml:32 · energyTariffsHtml:46 · energyScenarioOptions:71 · energyComparisonHtml:75 · energyArchiveHtml:83 · closeEnergyAnalysis:88 · openEnergyAnalysis:89 · energyRefreshAnalysis:95

### js/energy-analysis.js  _(87 líneas)_
**Estado global:** ENERGY_TAX_KEY:3

**Funciones:** energyUnitPrice:5 · energyWeightedPrice:6 · energyValidateTariff:10 · energyTariffDefaults:21 · energyTariffBase:24 · energyTariffNet:35 · energyTariffGross:36 · energyTaxes:40 · energyValidateTaxes:41 · energyMergeTaxes:45 · energySaveTaxes:46 · energyVatAt:47 · energyUtc:48 · energyDate:49 · energyBillEnd:52 · energyConsumptionMonths:57 · energySimulateMonth:76

### js/energy-bills-view.js  _(13 líneas)_
**Estado global:** ENERGY_BILLS_YEAR:1 · ENERGY_BILLS_COST:2

**Funciones:** energyNumber:3 · energyBillsChart:4 · openEnergyBills:12

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

### js/energy-reference.js  _(61 líneas)_
**Funciones:** energyUsageProfile:3 · collect:6 · energyDisplayWeights:22 · energyPriceTotal:31 · energyTariffReference:34 · energyTariffReferenceHtml:47 · metric:49 · number:50 · energyComparisonDefaults:57

### js/energy-study.js  _(97 líneas)_
**Estado global:** ENERGY_COST_VAT:2 · ENERGY_COMPARE_TARIFF:3

**Funciones:** energyDocumentedYears:4 · energyContractInYear:12 · energyYearIndicators:16 · tax:21 · energyMetric:24 · energyInfoHtml:25 · energySectionTitle:26 · energyPeriodsHtml:27 · energySuppliersHtml:38 · energyContractPeriods:48 · energyCommercialPeriods:50 · signature:52 · energyPriceExtremes:58 · energySummaryHtml:64 · energyVatStrip:77 · energyCompareChart:89 · energyCompareTable:93

### js/energy-tariff-editor.js  _(55 líneas)_
**Funciones:** energyNumericField:2 · energyTariffEditorHtml:3 · openEnergyTariff:21 · close:24 · read:25 · update:26 · energyEditLegacyTariff:38 · energySendToScenarios:48

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

### js/events-form.js  _(634 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · _renderEvTypeButton:25 · evAdmiteRepeticion:45 · renderEvForm:48 (!195) · openEvForm:243 · closeEvForm:269 · evSuggestedTitle:281 · bindEvFormEvents:284 (!350) · suggestTitle:287 · _refreshShapePreviews:307 · _refreshPickDatesLabel:312 · _curKind:331 · _applyTypeUI:332 · _bindTypeSwatches:361 · _viajeSync:451

### js/events-picker-color.js  _(300 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_MANAGEMENT_SUBTYPES:42 · EV_PLAN_SUBTYPES:43 · EV_KINDS:46 · EV_TYPE_COLORS:51 · EV_FREE_COLOR:73 · EV_FREE_SHAPE:74 · EV_FREE_DATES:77 · EV_BAR_SIZES:80 · EV_FREE_BARSIZE:81 · EV_DOT_SOLID:85 · EV_SHAPE_BW:112

**Funciones:** evIsManagement:44 · evFixedSymbol:45 · evBarSize:86 · evBarSizeCls:92 · evTypeKey:93 · evTypeColor:94 · getEvKind:97 · evShapeSvg:113 · evMorePlusSvg:182 · evTravelColor:191 · getEvType:197 · isEvBarAlways:205 · getEvDisplayColor:207 · _renderColorPicker:229 · _bindColorPicker:252 · updatePreview:262

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(623 líneas)_
**Estado global:** EV_LIST_TYPES:223

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!181) · fd2:50 · renderEvItem:51 · renderEvPanel:103 · renderEvByTypes:224 · coincide:245 · renderEvMonthsView:291 · _evWeekLanes:302 · assign:305 · evWeekTravelRow:320 · renderEvWeek:340 (!133) · hexA:344 · renderEvContent:473 (!150)

### js/events.js  _(802 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_FILTER_CYCLE:44 · EV_PREV_VIEW:61 · EV_QUAD_YEAR:62 · EV_QUAD_MONTH:63 · EV_TO_SUBTAB:64 · EV_TYPES_FILTER:65 · EV_TYPES_PAST:66 · EV_LIST_SORT:67 · EV_LIST_SEARCH:68 · EV_COLORS:69 · EVENTS:70 · EV_ALARM_SK:99 · EV_ALARMS_SET:100 · EV_NO_RUT:192 · EV_MAX_BAR_DIA:248 · EV_MARK_ORDER:354 · EV_MAX_PUNT_DIA:396 · EV_MAX_RUT_DIA:397 · EV_CAL_CORNER_STACK:400 · EV_MAX_VIP_DIA:402 · EV_CAL_VIP_MAX:403 · EV_UP_SHOW_RUT:405 · EV_UP_SHOW_BODA:406 · EV_BAR_Z:458 · EV_COMPARTE_DIA:462 · EV_MNS:654 · EV_CAR:697 · EV_TRANSPORTES:716 · EV_TRANS_EMOJI:722 · EV_DATE_INDEX:788

**Funciones:** evCycleFilters:45 · evFilterGroup:51 · saveEvents:94 · loadEvAlarms:101 · saveEvAlarms:102 · _findBdayByEvId:103 · isEvAlarmSet:115 · setEvAlarmState:121 · evDk:128 · _evClampDate:137 · eventOccursOn:141 · getEventsOn:185 · evSignature:200 · evMergeIncoming:210 · evMergeMsg:235 · _fmtDayEs:247 · evBarLimitExceeded:249 · evDayLimitExceeded:259 · rutDayCount:295 · hasUpcomingEvent:302 · updateEventsBtn:311 · evDefaultShape:325 · evMarkerHtml:333 · evMorePlusHtml:348 · evMarkPriority:355 · evBodaMinutes:363 · evSortMarks:374 · ev0:375 · evAnnualXsHtml:407 · vipStarSvgHtml:417 · vipIconHtml:426 · evIsoDate:432 · _isVipBdayTooFar:433 · evUpcomingMarkHtml:440 · _evRowOcc:459 · evComparteDia:463 · _evSoloSeRozan:468 · _evTrozosSeRozan:479 · _evAssignRow:487 · _evMarcarMitades:501 · _evMitadesStyle:516 · evBarZ:523 · _evBarSegments:527 · _evBarBand:551 · _evBarSegmentStyle:557 · _evBarExtent:562 · _evRoundedOutline:573 · near:582 · _evBarMutedColor:601 · _evSteppedBar:604 · _evAnnualCtx:657 · visible:658 · _evLoadPuentes:676 · _evScheduleRemove:704 · _evCancelRemove:705 · evStartTime:724 · evCompareTime:730 · evEndTime:731 · evTimeLabel:738 · evTramos:745 · evTramoTexto:756 · evMinutosDe:763 · _positionEvBright:773 · withEventDateIndex:789

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

### js/personal-periods-editor.js  _(55 líneas)_
**Estado global:** PERSONAL_PERIOD_EDIT:2

**Funciones:** renderPersonalPeriodEditor:3 · openPersonalPeriodEditor:16 · closePersonalPeriodEditor:20 · paintPersonalPeriodEditor:23 · error:26 · readFields:27 · valid:33

### js/personal-periods.js  _(64 líneas)_
**Estado global:** PERSONAL_SECTIONS:2

**Funciones:** personalDay:3 · personalDate:4 · personalFactor:5 · personalPeriods:6 · personalAnnual:10 · personalValidatePeriods:18 · personalValidateData:28 · personalPauseFrom:38 · personalCopyYear:45 · personalPeriodLabel:56 · personalPeriodsSummary:57

### js/rutinas-addition.js  _(54 líneas)_
**Funciones:** closeRutAddition:3 · rutAdditionPanel:4 · openRutAddition:10 · rutAdditionPickWeek:21 · rutAdditionPickSession:26 · rutAdditionForm:38

### js/rutinas-bulk.js  _(60 líneas)_
**Funciones:** rutBulkChange:3 · rutOffsetDate:11 · rutPauseAfter:12 · rutHistorySelectionHtml:19 · bindRutHistorySelection:24 · openRutBulkConfirm:36 · close:48

### js/rutinas-flex.js  _(145 líneas)_
**Estado global:** RUT_PLAN:2

**Funciones:** rutFlexible:3 · rutFlexEarliest:4 · rutFlexTarget:5 · rutFlexRange:9 · rutFlexCount:15 · rutFlexStatus:18 · rutFlexWarnings:25 · rutFlexSummary:31 · rutFlexOptionsHtml:36 · bindRutFlexOptions:51 · paint:53 · rutFlexRead:71 · rutFlexSetSession:90 · renderRutPlan:108 · openRutPlan:131 · closeRutPlan:132 · refreshRutPlan:133 · mutate:140

### js/rutinas-form.js  _(241 líneas)_
**Funciones:** rutSetupLocked:3 · rutFormCandidate:11 · rutReadForm:41 · renderRutForm:75 · openRutForm:142 (!98) · _rutRepaintIcons:149 · _rutPintaHoras:174 · closeRutForm:240

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

### js/rutinas.js  _(618 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_SUBTAB:263 · RUT_WEEK_SEL:393 · RUT_WEEK_CAL:394

**Funciones:** saveRutinas:25 · rutMarkerHtml:39 · rutMarkerGroups:47 · rutDayMarkersHtml:54 · rutById:59 · rutWeekKey:64 · rutTimeOfDay:73 · rutTieneHorarios:78 · rutScheduleOn:86 · rutScheduleCopy:91 · rutDurationOn:95 · rutChangeFrom:100 · rutChangeWeek:124 · update:128 · rutWeekCfg:140 · rutSuspendedOn:151 · rutDiaLleno:161 · rutOccursOn:165 · rutIsSkipped:176 · rutToggleSkip:177 · rutFin:195 · rutEventsOn:203 · rutEventFromId:220 · rutSessions:229 · rutStats:243 · rutProximas:256 · renderRutinasBody:266 · _rutTimeRange:279 · _renderRutSchedule:283 · _renderRutLista:297 · _rutFmt:335 · _rutFmtCorto:336 · _renderRutStats:342 · openRutWeek:395 · _rutWeekPick:404 · back:428 · _rutWeekRender:457 (!83) · closeRutWeek:540 · openRutSesion:543 · closeRutSesion:575 · bindRutinasEvents:578

### js/summary.js  _(613 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · VAC_YEAR_KEY:16 · VAC_BY_YEAR:17 · SPAIN_AVG:258 · DN7S:282

**Funciones:** vacEntitlementForYear:18 · saveVacEntitlement:21 · fhY:27 · fdY:28 · computeYearlySummary:30 · barChart3:104 · computePuentes:131 · isNWD:141 · typeOf:142 · renderSummaryWorkBody:175 (!101) · fmtSigned:263 · renderSummaryPuentesBody:276 (!94) · fdd:283 · renderSummaryTimeOffBody:370 (!92) · fdd:376 · bindSummaryWorkBodyEvents:462 · bindSummaryPuentesBodyEvents:472 · bindSummaryTimeOffBodyEvents:497 · renderSummaryContent:503 · closeSummary:524 · bindSummaryEvents:530 (!83)

### js/tasks-float.js  _(80 líneas)_
**Estado global:** TASKS_FAB_HIDDEN_KEY:3 · TASKS_FAB_HIDDEN:4 · TASKS_FLOAT:5

**Funciones:** tasksFloatPosition:6 · tasksDock:17 · tasksUpdateFab:20 · initTasks:27 · end:49 · resize:61 · tasksSetAccessHidden:71 · tasksRestoreAccess:72 · bindTasksRestoreGesture:73 · distance:75

### js/tasks-view.js  _(138 líneas)_
**Estado global:** TASKS_VIEW:2 · TASKS_ICON:3

**Funciones:** renderTasks:4 · tasksDateLabel:21 · renderTasksList:25 · renderTaskRow:39 · openTasks:55 · closeTasks:63 · tasksKeydown:69 · renderTasksPanel:79 · tasksPerform:96 · tasksRowAction:100 · tasksFocusRow:117 · bindTasksReorder:121 · clear:127 · end:133

### js/tasks.js  _(97 líneas)_
**Estado global:** TASKS_KEY:3

**Funciones:** tasksValidate:4 · tasksValidTimestamp:17 · tasksNormalize:18 · tasksData:29 · tasksSave:34 · tasksMigrate:35 · tasksMerge:40 · tasksItems:46 · tasksPendingRows:50 · tasksNeedsDateChoice:51 · tasksCreate:54 · tasksChange:59 · tasksMoveCompleted:75 · tasksUndoMove:80 · tasksMove:85 · tasksReminder:92 · tasksReminderSeen:96

## CSS

### css/styles.css  _(3052 líneas)_

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
- Estudio Cambio — grouped nav:449
- Estudio — tariff comparison cards:458
- Análisis hipoteca — secciones organizadas:479
- Mis gastos — budget table:496
- Year selector for per-year fiscal tabs:509
- §1.1 Tarifa dual:520
- §1.3 Stats por hora/día:532
- §1.4 Toggles:539
- §1.5 Declaración IRPF:544
- Tab 2: Comparador:557
- Calcular Tarifa (sim):585
- Scenario zones (Comparar Escenarios):603
- Análisis Ec. Personal:620
- Bloques de la Subrogación:622
- Fiscal config modal — purple theme override:665
- Fiscal config modal:667
- ECONOMICS v3: opt-buttons, cascade, gastos:693
- Cascade ingresos/gastos:700
- Media mensual: cards:710
- Tab 4: Análisis:720
- IRPF Breakdown visual:734
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:761
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):763
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):787
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:796
- Resumen fiscal al final de Ingresos y Gastos:798
- Donut chart:805
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):815
- Fiscal config: gastos items:822
- Fiscal: tab bar:834
- Fiscal: sticky save:839
- Fiscal: section title income/expense colors:841
- Fiscal: desgravaciones:851
- Fiscal: compras profesionales:878
- Desgravaciones: notas + tabla despacho info:886
- Nota IVA compras:906
- IVA por item en compras:908
- Fiscal: despacho en casa:915
- Hipoteca — resumen visual:938
- Hipoteca — compact 2-col grid:961
- Hipoteca — compact vinculaciones:969
- Hipoteca — read-only fields:980
- Hipoteca — edit/detail buttons:989
- Hipoteca — period summary card:995
- Multi-rate period cards:1008
- Distribución de ingresos:1024
- Comparador: reorder buttons:1040
- Rate input styled:1044
- BIRTHDAYS:1048
- Cabe el nombre entero, hasta en tres lineas:1061
- VIP controls bar:1070
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1081
- VIP edit mode item states:1084
- Feat 1: Buscador en lista por meses:1094
- Upcoming birthdays:1120
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:1137
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
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1260
- Color picker avanzado (paleta 6×8 + color libre):1264
- Detail color picker toggle:1282
- Annual events calendar:1288
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1318
- Selector de formas en el formulario de evento (Otros):1330
- Selector de grosor de barra (grande | Otros):1332
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1347
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1351
- Inicio/Fin bloqueados cuando hay Selección Multidía:1354
- Mini-overlay para elegir días específicos (Otros):1359
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1386
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1390
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1392
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1398
- Calendario 4 meses: 2 columnas × 2 filas:1400
- Botón ir al calendario mensual en puentes del resumen:1402
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1414
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1418
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1436
- Dropdown de vista anual:1443
- Linea que separa los chips de eventos grandes de los puntuales:1452
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1461
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1465
- Summary tabs — nivel 2:1468
- BRIDGE DAY CELLS in summary:1473
- VIP BIRTHDAYS:1482
- BIRTHDAY + EVENT ALARM PANEL:1485
- Campana de alarma en items de próximos (bday + eventos):1488
- 3-ZONE ALARM MARKER:1526
- ALARM MANAGEMENT OVERLAY:1539
- HOME POPUP (semanas pendientes / VIP sin alarma):1540
- MACRO URL EN MENÚ:1550
- Feat 4: Nav-bar emoji alignment:1556
- Birthday detail / form overlays:1566
- EVENTS:1576
- Zone A: upcoming/list views — subtle blue tint:1584
- Zone B: calendar grid views — subtle teal tint, active = green:1585
- Feat 2: Lista de Eventos subtabs:1588
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1605
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1607
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1619
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1623
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1629
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1644
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1654
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1686
- Perímetro puente: capa inferior a eventos:1688
- Bright past: bombilla override:1708
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1713
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1718
- Quad label 3 lines:1723
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1730
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1732
- Events list view:1734
- Event form overlay (inside eventsOverlay):1748
- Relleno, para que haga pareja con el naranja de "Editar evento":1778
- Event detail:1784
- LOGO POPUP:1792
- Gallery:1801
- BD ALARM VIP TOGGLE:1810
- RESPONSIVE (mobile header):1813
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1815
- ALARM PANEL:1868
- Drum picker (selector giratorio de hora/minuto):1873
- Confirmación alarma en el pasado:1899
- Botón flotante "Listo" en modo Editar VIPs:1905
- Controles inline long-press cumpleaños:1908
- Selector de clase en el formulario:1916
- Notas: general vs de un dia concreto:1922
- Pestana Bodas y pestana partida Vacaciones/Festivos:1926
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1927
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1938
- Filas del panel de un aviso:1952
- Estadisticas:1956
- Barras horizontales de reparto (componente generico: hBarRows):1964
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1974
- Dia cerrado: no admite mas clases:1991
- Una clase a la que le falta la hora o la sala se marca ella sola.:2002
- Fila con cambios sin guardar:2007
- Filtros de Parejas como chips pulsables:2019
- El color de la pareja va en un punto delante; el nombre, en color normal:2082
- Sala sin asignar: se marca en naranja para que cante en la lista:2087
- Nota propia del dia en la lista de Proximos:2090
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2092
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2094
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2102
- Editar siempre en naranja, como en el resto de la app:2108
- Los tres botones del detalle de pareja comparten aspecto:2125
- Subpestana Calendario de bodas:2165
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2179
- Dia resaltado al pulsar una pareja en la leyenda:2186
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:2192
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2214
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2216
- etiqueta al minimo: el nombre de la pareja necesita el resto:2225
- el color de la pareja va en un punto, no tinendo el nombre:2228
- Los tres botones de la pareja, en una sola linea:2235
- Buscador y boton de anadir en la misma fila:2238
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2244
- Horario distinto segun el dia:2248
- Selector de icono de rutina:2253
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2308
- Diálogo: modo de importación (añadir vs reemplazar):2323
- PRINT:2336
- Separacion de siluetas incluso entre grosores distintos.:2356
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2371
- Editar: tono comun, con geometria propia de cada pantalla.:2383
- Marca oficial con transparencia; conserva contraste en ambos temas.:2400
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2421
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2439
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2465
- Text edits retain the solid orange; only standalone pencils use a tint.:2474
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2481
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2548
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2563
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2573
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2585
- Titulo y estado separados para que "saltada" nunca quede tachado.:2610
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2620
- El titulo queda dentro del borde de 1.5px de su caja continua.:2625
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2631
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2647
- Una identidad de color por ventana para ambos juegos de iconos.:2651
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2682
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2689
- Borde discreto para identificar semanas enviadas en ambos temas.:2694
- Filtros junto al buscador sin ensanchar la ventana movil.:2698
- Configuracion de tarifa: controles verdes y valores neutros.:2711
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2729
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2746
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2750
- Selector de eventos para compartir por iCalendar:2775
- Selector de exportación: controles compactos y lista con espacio propio.:2776
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2813
- Compartir: cabecera centrada, categorías completas y lista compacta.:2831
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2864
- Estudio energético: controles compactos y separación entre apartados.:2874
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2877
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2893
- Solo energía reparte el espacio entre textos, con ancho de contenido.:2905
- Identidad propia de cada pestaña, sin alterar el sistema general.:2908
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2961
- Navegación: la misma geometría en Home y en las ventanas.:3005
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:3016
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:3034

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:483-485 · .ah-donut:493-495 · .ah-section:480-482 · .ah-total:490-492 · .ah-vs:486-489 · .alarm-cfg:1869-1869 · .alarm-colon:1872-1872 · .alarm-create:1886-1892 · .alarm-day:1896-1898 · .alarm-days:1893-1895 · .alarm-msg:1882-1883 · .alarm-panel:1870-1870 · .alarm-past:1900-1904 · .alarm-time:1871-1871 · .analisis-card:632-634 · .analisis-cards:621-621 · .analisis-hbar:635-640 · .analisis-input:650-653 · .analisis-ins:659-664 · .analisis-insurance:658-658 · .analisis-mortgage:641-657 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1486-1812 · .bd-detail:1567-1574 · .bd-export:266-266 · .bday-add:1135-1136 · .bday-badge:1062-1065 · .bday-buscar:1097-1099 · .bday-calendar:1051-1067 · .bday-cancel:1082-1083 · .bday-cell:1055-1138 · .bday-hdr:1050-2467 · .bday-header:2461-2463 · .bday-ic:1910-1914 · .bday-inline:1909-1909 · .bday-io:1103-1119 · .bday-jump:2363-2404 · .bday-list:1069-1093 · .bday-listo:1906-1906 · .bday-month:1068-2479 · .bday-next:2413-2414 · .bday-num:1059-1059 · .bday-search:1100-1102 · .bday-sub:2590-2591 · .bday-upcoming:1121-2361 · .bday-vip:1071-1483 · .bday-week:1052-1054 · .boda-actions:2117-2117 · .boda-add:2119-2119 · .boda-asg:2142-2974 · .boda-buscar:2239-2241 · .boda-cal:2166-2191 · .boda-card:2025-2247 · .boda-catalog:2390-2398 · .boda-cfg:2440-2452 · .boda-chip:2021-2023 · .boda-chips:2020-2020 · .boda-cl:2079-2116 · .boda-class:2003-2078 · .boda-config:2386-2437 · .boda-controls:1981-1981 · .boda-count:2394-2394 · .boda-couple:2061-2063 · .boda-cpk:2133-2141 · .boda-date:2118-2472 · .boda-day:1997-2427 · .boda-det:2124-2968 · .boda-dia:2068-2070 · .boda-dot:2029-2029 · .boda-falta:2036-2036 · .boda-field:2428-2433 · .boda-filter:2366-2368 · .boda-filters:1984-1984 · .boda-fsel:1985-1988 · .boda-ftoggles:1989-1990 · .boda-future:2828-2828 · .boda-hd:2112-2114 · .boda-inp:2056-2056 · .boda-iss:1953-1955 · .boda-issue:1940-1951 · .boda-issues:1939-1939 · .boda-last:2878-2882 · .boda-legend:2120-2123 · .boda-mini:2106-2374 · .boda-mode:1971-1973 · .boda-multi:2071-2076 · .boda-name:2030-2030 · .boda-ok:2037-2037 · .boda-pack:2395-2396 · .boda-pfilters:2365-2369 · .boda-place:2064-2089 · .boda-prog:2032-2033 · .boda-ro:2080-2088 · .boda-save:2017-2018 · .boda-savebar:2013-2016 · .boda-search:2242-2242 · .boda-sec:1937-1937 · .boda-sobra:2038-2038 · .boda-sort:2243-2243 · .boda-stat:1958-1963 · .boda-stats:1957-1957 · .boda-sticky:1933-2450 · .boda-sum:1977-1980 · .boda-summary:1976-1976 · .boda-swap:2046-2053 · .boda-teachers:2415-2415 · .boda-time:2057-2057 · .boda-tp:2195-2198 · .boda-wed:2031-2031 · .bottom-sheet:170-171 · .btn-icon:103-1858 · .csv-export:76-77 · .data-actions:99-3007 · .data-btn:100-2660 · .data-menu:117-123 · .day-cell:138-244 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1382-1383 · .dp-counter:1369-1370 · .dp-day:1377-1381 · .dp-days:1376-1376 · .dp-grid:1371-1371 · .dp-handle:1364-1364 · .dp-hdr:1365-1365 · .dp-mhdr:1374-1375 · .dp-mname:1373-1373 · .dp-month:1372-1372 · .dp-overlay:1360-1363 · .dp-sheet:1362-1362 · .dp-title:1366-1366 · .dp-yearnav:1367-1368 · .drum-picker:1875-1878 · .drum-sel:1881-1881 · .drum-wrap:1874-1880 · .econ-add:567-568 · .econ-ahorro:788-795 · .econ-annual:385-385 · .econ-avg:386-715 · .econ-bracket:550-556 · .econ-calc:698-699 · .econ-casc:702-709 · .econ-cascade:701-701 · .econ-chart:580-581 · .econ-comp:558-582 · .econ-decl:545-719 · .econ-distrib:1025-1039 · .econ-donut:806-821 · .econ-equiv:1020-1023 · .econ-fiscal:799-804 · .econ-formula:405-408 · .econ-gastos:721-733 · .econ-gear:517-518 · .econ-hdr:427-519 · .econ-ingresado:393-393 · .econ-irpf:735-797 · .econ-legend:583-584 · .econ-line:578-579 · .econ-month:410-423 · .econ-mr:1017-1018 · .econ-multi:1009-1019 · .econ-opt:694-697 · .econ-qcard:375-382 · .econ-qcell:371-1819 · .econ-qm:380-380 · .econ-qmonth:378-379 · .econ-quarter:367-1816 · .econ-rate:521-529 · .econ-row:394-404 · .econ-sc:560-1046 · .econ-scenario:559-559 · .econ-section:424-424 · .econ-sim:586-596 · .econ-stats:533-538 · .econ-sub:430-448 · .econ-tab:428-2636 · .econ-tariff:2712-2717 · .econ-toggle:540-543 · .econ-val:409-409 · .energy-bar:2951-2951 · .energy-caption:2865-2865 · .energy-choice:2875-2875 · .energy-compare:3000-3000 · .energy-contract:2855-2868 · .energy-cost:2947-3002 · .energy-coverage:2938-2938 · .energy-extremes:2934-2934 · .energy-fee:2903-2904 · .energy-field:2858-2870 · .energy-fields:2872-2872 · .energy-history:2853-2854 · .energy-info:2923-2925 · .energy-inline:2944-2944 · .energy-legend:2952-2952 · .energy-metric:2992-2994 · .energy-metrics:2991-2991 · .energy-overview:2927-2929 · .energy-period:2930-2932 · .energy-price:2857-3049 · .energy-range:2953-2953 · .energy-reconciliation:2937-2937 · .energy-scenario:3001-3001 · .energy-section:2922-2922 · .energy-sheet:2852-2852 · .energy-supplier:2935-2995 · .energy-table:2866-2866 · .energy-tabs:2906-2917 · .energy-tariff:2940-3045 · .energy-tax:2860-2998 · .energy-vat:2996-2996 · .energy-window:2894-2990 · .energy-year:2869-2959 · .est-btn:453-457 · .est-card:463-465 · .est-detail:460-460 · .est-field:472-478 · .est-fields:471-471 · .est-group:451-455 · .est-modo:466-466 · .est-nav:450-2635 · .est-section:459-459 · .est-tariff:461-470 · .ev-alarm:1509-2101 · .ev-ann:1415-1651 · .ev-annual:1175-2964 · .ev-badge:1733-1733 · .ev-badges:1615-1615 · .ev-bar:1680-1680 · .ev-bars:1608-1608 · .ev-barsize:1333-1342 · .ev-bday:2592-2593 · .ev-bficha:2221-2221 · .ev-bfila:2222-2231 · .ev-bpunto:2229-2229 · .ev-bright:1709-2748 · .ev-btn:1771-3013 · .ev-bver:2234-2234 · .ev-cal:2779-2851 · .ev-car:1630-2218 · .ev-category:1251-1256 · .ev-cell:1139-1729 · .ev-char:1760-1760 · .ev-checkbox:1765-1765 · .ev-chip:1458-2380 · .ev-color:1262-1281 · .ev-colors:1761-1761 · .ev-date:1762-1762 · .ev-dates:1355-1357 · .ev-day:1618-1671 · .ev-daynote:1924-1924 · .ev-del:2320-2321 · .ev-detail:1283-2215 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1406-1775 · .ev-field:1754-2827 · .ev-filter:1453-2987 · .ev-form:1749-1770 · .ev-hdr:1467-1580 · .ev-hora:1179-1179 · .ev-input:1756-1757 · .ev-io:1105-3003 · .ev-kind:1917-1921 · .ev-list:1589-2731 · .ev-main:1581-3032 · .ev-management:1327-1327 · .ev-month:1597-1658 · .ev-multi:1612-2381 · .ev-note:1923-1923 · .ev-num:1731-1731 · .ev-otros:1331-1676 · .ev-puente:1689-1689 · .ev-quad:1401-1725 · .ev-repeat:1766-1766 · .ev-rut:1667-2616 · .ev-search:2310-2314 · .ev-sep:1202-1202 · .ev-shape:1343-2266 · .ev-share:2777-2778 · .ev-sort:2315-2360 · .ev-stepped:1682-1684 · .ev-sub:437-439 · .ev-textarea:1758-1759 · .ev-toggle:1763-1764 · .ev-type:1245-2735 · .ev-types:1592-2732 · .ev-up:1164-2576 · .ev-upcoming:326-3039 · .ev-viaje:1180-1188 · .ev-view:1579-2373 · .ev-wd:1768-1769 · .ev-week:322-2829 · .ev-weekday:1767-1767 · .ev-wk:1189-3038 · .excl-item:352-531 · .excl-row:332-530 · .fiscal-add:687-850 · .fiscal-bracket:678-686 · .fiscal-compras:879-914 · .fiscal-copy:514-516 · .fiscal-custom:675-675 · .fiscal-ded:889-903 · .fiscal-desgrav:852-904 · .fiscal-despacho:916-937 · .fiscal-error:691-691 · .fiscal-gasto:823-885 · .fiscal-gastos:905-905 · .fiscal-hdr:835-835 · .fiscal-highlight:876-876 · .fiscal-hip:2709-2710 · .fiscal-onoff:918-919 · .fiscal-pct:676-685 · .fiscal-period:831-832 · .fiscal-radio:670-674 · .fiscal-save:689-690 · .fiscal-section:668-843 · .fiscal-sticky:840-840 · .fiscal-subsection:844-845 · .fiscal-tab:836-2633 · .fiscal-viaje:846-847 · .fiscal-vinc:929-930 · .fiscal-year:510-513 · .full-overlay:247-248 · .hbar-lbl:1967-1967 · .hbar-row:1966-1966 · .hbar-rows:1965-1965 · .hbar-track:1968-1969 · .hbar-val:1970-1970 · .header:57-2751 · .header-brand:60-60 · .hip-add:1007-1007 · .hip-auto:958-958 · .hip-bar:944-951 · .hip-cancel:994-994 · .hip-cf:963-968 · .hip-edit:990-992 · .hip-g2:962-962 · .hip-grid:956-956 · .hip-period:996-1005 · .hip-resumen:939-943 · .hip-ro:981-988 · .hip-save:993-993 · .hip-section:957-1006 · .hip-stat:953-955 · .hip-stats:952-952 · .hip-sub:960-960 · .hip-vinc:959-959 · .hip-vr:970-979 · .home-popup:1541-2891 · .home-reminder:2808-2810 · .home-submission:2753-2764 · .home-summary:2765-2773 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:267-267 · .imp-mode:2324-2976 · .imp-preview:2977-2981 · .io-peligro:1110-1118 · .io-primaria:1109-1116 · .logo-gallery:1802-1809 · .logo-popup:1793-1800 · .macro-section:1551-1552 · .macro-url:1553-2377 · .mg-budget:497-506 · .mg-cat:507-507 · .mg-desgrav:508-508 · .mg-sort:503-503 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2768 · .ms-breakdown:354-356 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:357-357 · .nav-bar:1463-3008 · .nav-btn:65-66 · .nav-icon:2668-2678 · .nav-pro:2642-2654 · .nav-style:2666-2666 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1462-1464 · .rate-input:364-2353 · .rate-label:363-363 · .rate-row:362-362 · .rate-suffix:365-365 · .rut-add:2292-2292 · .rut-addition:2511-2528 · .rut-agenda:2525-2526 · .rut-cancelled:2552-2611 · .rut-card:2282-3030 · .rut-day:2298-3020 · .rut-days:2297-3017 · .rut-dot:2285-2285 · .rut-dpick:3012-3012 · .rut-first:2263-2263 · .rut-flex:2260-2268 · .rut-hist:2304-2307 · .rut-history:2495-3051 · .rut-hora:3021-3023 · .rut-hpd:2249-2493 · .rut-icon:2254-2478 · .rut-marker:1663-1666 · .rut-name:2286-2286 · .rut-pct:2291-2291 · .rut-plan:2269-2281 · .rut-recovery:2520-3011 · .rut-routine:3027-3027 · .rut-sec:2259-2259 · .rut-session:2530-3010 · .rut-skipped:2612-2613 · .rut-stat:2301-2303 · .rut-sub:435-446 · .rut-sug:2293-2296 · .rut-susp:2300-2300 · .rut-tag:2287-2288 · .rut-time:3024-3024 · .rut-vacio:2289-2289 · .rut-week:2494-2494 · .rut-weekdays:3018-3018 · .rut-wpick:2208-2213 · .selected:2675-2675 · .sent-badge:134-134 · .settings-details:2416-2418 · .settings-edit:2378-2419 · .settings-menu:2744-2744 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:598-602 · .sim-field:587-588 · .sim-hr:597-597 · .sim-period:594-594 · .sim-target:589-593 · .sub-block:623-624 · .sub-row:625-631 · .sw-upd:204-204 · .sy-back:253-2344 · .sy-body:273-2342 · .sy-card:284-2348 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-2343 · .sy-lbl:293-2347 · .sy-list:306-359 · .sy-month:320-320 · .sy-nav:262-1722 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-period:2718-2725 · .sy-puente:312-1481 · .sy-section:274-275 · .sy-spain:278-283 · .sy-sublbl:384-384 · .sy-suelto:317-319 · .sy-tab:1469-1472 · .sy-table:294-2349 · .sy-td:299-299 · .sy-tr:300-2350 · .sy-val:289-2346 · .sy-year:255-2345 · .toast:190-209 · .toast-undo:206-206 · .today-btn:67-68 · .vac-config:328-330 · .vip-no:1077-1078 · .week-actions:159-159 · .week-card:128-2695 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2401-2556

