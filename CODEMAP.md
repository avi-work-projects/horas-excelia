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

### js/birthdays-render.js  _(246 líneas)_
**Estado global:** DN7:94

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:4 (!88) · getBdaysInRange:9 · bdayLabel:24 · renderGroup:33 · renderBdayCalMonth:92 · renderBdayList:132 · getEffVip:139 · renderBdayContent:181

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

### js/economics-fiscal-elect.js  _(241 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:135

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:84 · _despField:100 · _despFieldMoney:109 · _renderIngresosDesgList:122 · _renderGastoItem:141 · renderGastosList:156 · _bindElectDetalle:178 · _bindSegurosNormales:225

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

### js/energy-reference.js  _(61 líneas)_
**Funciones:** energyUsageProfile:3 · collect:6 · energyDisplayWeights:22 · energyPriceTotal:31 · energyTariffReference:34 · energyTariffReferenceHtml:47 · metric:49 · number:50 · energyComparisonDefaults:57

### js/energy-study.js  _(84 líneas)_
**Estado global:** ENERGY_COST_VAT:2 · ENERGY_COMPARE_TARIFF:3

**Funciones:** energyYearIndicators:4 · tax:8 · energyMetric:11 · energyInfoHtml:12 · energySectionTitle:13 · energyPeriodsHtml:14 · energySuppliersHtml:25 · energyContractPeriods:35 · energyCommercialPeriods:37 · signature:39 · energyPriceExtremes:45 · energySummaryHtml:51 · energyVatStrip:64 · energyCompareChart:76 · energyCompareTable:80

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

### js/tasks-float.js  _(81 líneas)_
**Estado global:** TASKS_FAB_HIDDEN_KEY:3 · TASKS_FAB_HIDDEN:4 · TASKS_FLOAT:5

**Funciones:** tasksFloatPosition:6 · tasksDock:17 · tasksUpdateFab:20 · initTasks:27 · end:49 · resize:61 · tasksSetAccessHidden:72 · tasksRestoreAccess:73 · bindTasksRestoreGesture:74 · distance:76

### js/tasks-view.js  _(138 líneas)_
**Estado global:** TASKS_VIEW:2 · TASKS_ICON:3

**Funciones:** renderTasks:4 · tasksDateLabel:21 · renderTasksList:25 · renderTaskRow:39 · openTasks:55 · closeTasks:63 · tasksKeydown:69 · renderTasksPanel:79 · tasksPerform:96 · tasksRowAction:100 · tasksFocusRow:117 · bindTasksReorder:121 · clear:127 · end:133

### js/tasks.js  _(97 líneas)_
**Estado global:** TASKS_KEY:3

**Funciones:** tasksValidate:4 · tasksValidTimestamp:17 · tasksNormalize:18 · tasksData:29 · tasksSave:34 · tasksMigrate:35 · tasksMerge:40 · tasksItems:46 · tasksPendingRows:50 · tasksNeedsDateChoice:51 · tasksCreate:54 · tasksChange:59 · tasksMoveCompleted:75 · tasksUndoMove:80 · tasksMove:85 · tasksReminder:92 · tasksReminderSeen:96

## CSS

### css/styles.css  _(3040 líneas)_

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
- VIP controls bar:1067
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1078
- VIP edit mode item states:1081
- Feat 1: Buscador en lista por meses:1091
- Upcoming birthdays:1117
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:1134
- Events in puentes (summary) — one per line:1154
- Events upcoming view:1158
- Minicabecera de día dentro de un panel de Próximos:1160
- Marcador de la tarjeta de Proximos: la forma real del evento:1170
- Horas del evento y transporte de ida/vuelta:1175
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1207
- Grid del mes: col fecha (48px) + col eventos (1fr):1209
- Columna fecha (col 1):1211
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1220
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1227
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1231
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1237
- Event color type picker:1241
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1252
- Color picker avanzado (paleta 6×8 + color libre):1256
- Detail color picker toggle:1274
- Annual events calendar:1280
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1310
- Selector de formas en el formulario de evento (Otros):1321
- Selector de grosor de barra (grande | Otros):1323
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1338
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1342
- Inicio/Fin bloqueados cuando hay Selección Multidía:1345
- Mini-overlay para elegir días específicos (Otros):1350
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1377
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1381
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1383
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1389
- Calendario 4 meses: 2 columnas × 2 filas:1391
- Botón ir al calendario mensual en puentes del resumen:1393
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1405
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1409
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1427
- Dropdown de vista anual:1434
- Linea que separa los chips de eventos grandes de los puntuales:1443
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1452
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1456
- Summary tabs — nivel 2:1459
- BRIDGE DAY CELLS in summary:1464
- VIP BIRTHDAYS:1473
- BIRTHDAY + EVENT ALARM PANEL:1476
- Campana de alarma en items de próximos (bday + eventos):1479
- 3-ZONE ALARM MARKER:1517
- ALARM MANAGEMENT OVERLAY:1530
- HOME POPUP (semanas pendientes / VIP sin alarma):1531
- MACRO URL EN MENÚ:1541
- Feat 4: Nav-bar emoji alignment:1547
- Birthday detail / form overlays:1557
- EVENTS:1567
- Zone A: upcoming/list views — subtle blue tint:1575
- Zone B: calendar grid views — subtle teal tint, active = green:1576
- Feat 2: Lista de Eventos subtabs:1579
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1596
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1598
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1610
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1614
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1620
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1635
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1645
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1677
- Perímetro puente: capa inferior a eventos:1679
- Bright past: bombilla override:1699
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1704
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1709
- Quad label 3 lines:1714
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1721
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1723
- Events list view:1725
- Event form overlay (inside eventsOverlay):1739
- Relleno, para que haga pareja con el naranja de "Editar evento":1769
- Event detail:1775
- LOGO POPUP:1783
- Gallery:1792
- BD ALARM VIP TOGGLE:1801
- RESPONSIVE (mobile header):1804
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1806
- ALARM PANEL:1859
- Drum picker (selector giratorio de hora/minuto):1864
- Confirmación alarma en el pasado:1890
- Botón flotante "Listo" en modo Editar VIPs:1896
- Controles inline long-press cumpleaños:1899
- Selector de clase en el formulario:1907
- Notas: general vs de un dia concreto:1913
- Pestana Bodas y pestana partida Vacaciones/Festivos:1917
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1918
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1929
- Filas del panel de un aviso:1943
- Estadisticas:1947
- Barras horizontales de reparto (componente generico: hBarRows):1955
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1965
- Dia cerrado: no admite mas clases:1982
- Una clase a la que le falta la hora o la sala se marca ella sola.:1993
- Fila con cambios sin guardar:1998
- Filtros de Parejas como chips pulsables:2010
- El color de la pareja va en un punto delante; el nombre, en color normal:2073
- Sala sin asignar: se marca en naranja para que cante en la lista:2078
- Nota propia del dia en la lista de Proximos:2081
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2083
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2085
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2093
- Editar siempre en naranja, como en el resto de la app:2099
- Los tres botones del detalle de pareja comparten aspecto:2116
- Subpestana Calendario de bodas:2156
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2170
- Dia resaltado al pulsar una pareja en la leyenda:2177
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:2183
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2205
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2207
- etiqueta al minimo: el nombre de la pareja necesita el resto:2216
- el color de la pareja va en un punto, no tinendo el nombre:2219
- Los tres botones de la pareja, en una sola linea:2226
- Buscador y boton de anadir en la misma fila:2229
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2235
- Horario distinto segun el dia:2239
- Selector de icono de rutina:2244
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2299
- Diálogo: modo de importación (añadir vs reemplazar):2314
- PRINT:2327
- Separacion de siluetas incluso entre grosores distintos.:2347
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2362
- Editar: tono comun, con geometria propia de cada pantalla.:2374
- Marca oficial con transparencia; conserva contraste en ambos temas.:2391
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2412
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2430
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2456
- Text edits retain the solid orange; only standalone pencils use a tint.:2465
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2472
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2539
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2554
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2564
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2576
- Titulo y estado separados para que "saltada" nunca quede tachado.:2601
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2611
- El titulo queda dentro del borde de 1.5px de su caja continua.:2616
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2622
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2638
- Una identidad de color por ventana para ambos juegos de iconos.:2642
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2673
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2680
- Borde discreto para identificar semanas enviadas en ambos temas.:2685
- Filtros junto al buscador sin ensanchar la ventana movil.:2689
- Configuracion de tarifa: controles verdes y valores neutros.:2702
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2720
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2737
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2741
- Selector de eventos para compartir por iCalendar:2766
- Selector de exportación: controles compactos y lista con espacio propio.:2767
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2804
- Compartir: cabecera centrada, categorías completas y lista compacta.:2822
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2855
- Estudio energético: controles compactos y separación entre apartados.:2865
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2868
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2884
- Solo energía reparte el espacio entre textos, con ancho de contenido.:2894
- Identidad propia de cada pestaña, sin alterar el sistema general.:2897
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2950
- Navegación: la misma geometría en Home y en las ventanas.:2994
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:3005
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:3022

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:483-485 · .ah-donut:493-495 · .ah-section:480-482 · .ah-total:490-492 · .ah-vs:486-489 · .alarm-cfg:1860-1860 · .alarm-colon:1863-1863 · .alarm-create:1877-1883 · .alarm-day:1887-1889 · .alarm-days:1884-1886 · .alarm-msg:1873-1874 · .alarm-panel:1861-1861 · .alarm-past:1891-1895 · .alarm-time:1862-1862 · .analisis-card:632-634 · .analisis-cards:621-621 · .analisis-hbar:635-640 · .analisis-input:650-653 · .analisis-ins:659-664 · .analisis-insurance:658-658 · .analisis-mortgage:641-657 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1477-1803 · .bd-detail:1558-1565 · .bd-export:266-266 · .bday-add:1132-1133 · .bday-badge:1062-1064 · .bday-buscar:1094-1096 · .bday-calendar:1051-1060 · .bday-cancel:1079-1080 · .bday-cell:1055-1135 · .bday-hdr:1050-2458 · .bday-header:2452-2454 · .bday-ic:1901-1905 · .bday-inline:1900-1900 · .bday-io:1100-1116 · .bday-jump:2354-2395 · .bday-list:1066-1090 · .bday-listo:1897-1897 · .bday-month:1065-2470 · .bday-next:2404-2405 · .bday-num:1059-1059 · .bday-search:1097-1099 · .bday-sub:2581-2582 · .bday-upcoming:1118-2352 · .bday-vip:1068-1474 · .bday-week:1052-1054 · .boda-actions:2108-2108 · .boda-add:2110-2110 · .boda-asg:2133-2963 · .boda-buscar:2230-2232 · .boda-cal:2157-2182 · .boda-card:2016-2238 · .boda-catalog:2381-2389 · .boda-cfg:2431-2443 · .boda-chip:2012-2014 · .boda-chips:2011-2011 · .boda-cl:2070-2107 · .boda-class:1994-2069 · .boda-config:2377-2428 · .boda-controls:1972-1972 · .boda-count:2385-2385 · .boda-couple:2052-2054 · .boda-cpk:2124-2132 · .boda-date:2109-2463 · .boda-day:1988-2418 · .boda-det:2115-2957 · .boda-dia:2059-2061 · .boda-dot:2020-2020 · .boda-falta:2027-2027 · .boda-field:2419-2424 · .boda-filter:2357-2359 · .boda-filters:1975-1975 · .boda-fsel:1976-1979 · .boda-ftoggles:1980-1981 · .boda-future:2819-2819 · .boda-hd:2103-2105 · .boda-inp:2047-2047 · .boda-iss:1944-1946 · .boda-issue:1931-1942 · .boda-issues:1930-1930 · .boda-last:2869-2873 · .boda-legend:2111-2114 · .boda-mini:2097-2365 · .boda-mode:1962-1964 · .boda-multi:2062-2067 · .boda-name:2021-2021 · .boda-ok:2028-2028 · .boda-pack:2386-2387 · .boda-pfilters:2356-2360 · .boda-place:2055-2080 · .boda-prog:2023-2024 · .boda-ro:2071-2079 · .boda-save:2008-2009 · .boda-savebar:2004-2007 · .boda-search:2233-2233 · .boda-sec:1928-1928 · .boda-sobra:2029-2029 · .boda-sort:2234-2234 · .boda-stat:1949-1954 · .boda-stats:1948-1948 · .boda-sticky:1924-2441 · .boda-sum:1968-1971 · .boda-summary:1967-1967 · .boda-swap:2037-2044 · .boda-teachers:2406-2406 · .boda-time:2048-2048 · .boda-tp:2186-2189 · .boda-wed:2022-2022 · .bottom-sheet:170-171 · .btn-icon:103-1849 · .csv-export:76-77 · .data-actions:99-2996 · .data-btn:100-2651 · .data-menu:117-123 · .day-cell:138-244 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1373-1374 · .dp-counter:1360-1361 · .dp-day:1368-1372 · .dp-days:1367-1367 · .dp-grid:1362-1362 · .dp-handle:1355-1355 · .dp-hdr:1356-1356 · .dp-mhdr:1365-1366 · .dp-mname:1364-1364 · .dp-month:1363-1363 · .dp-overlay:1351-1354 · .dp-sheet:1353-1353 · .dp-title:1357-1357 · .dp-yearnav:1358-1359 · .drum-picker:1866-1869 · .drum-sel:1872-1872 · .drum-wrap:1865-1871 · .econ-add:567-568 · .econ-ahorro:788-795 · .econ-annual:385-385 · .econ-avg:386-715 · .econ-bracket:550-556 · .econ-calc:698-699 · .econ-casc:702-709 · .econ-cascade:701-701 · .econ-chart:580-581 · .econ-comp:558-582 · .econ-decl:545-719 · .econ-distrib:1025-1039 · .econ-donut:806-821 · .econ-equiv:1020-1023 · .econ-fiscal:799-804 · .econ-formula:405-408 · .econ-gastos:721-733 · .econ-gear:517-518 · .econ-hdr:427-519 · .econ-ingresado:393-393 · .econ-irpf:735-797 · .econ-legend:583-584 · .econ-line:578-579 · .econ-month:410-423 · .econ-mr:1017-1018 · .econ-multi:1009-1019 · .econ-opt:694-697 · .econ-qcard:375-382 · .econ-qcell:371-1810 · .econ-qm:380-380 · .econ-qmonth:378-379 · .econ-quarter:367-1807 · .econ-rate:521-529 · .econ-row:394-404 · .econ-sc:560-1046 · .econ-scenario:559-559 · .econ-section:424-424 · .econ-sim:586-596 · .econ-stats:533-538 · .econ-sub:430-448 · .econ-tab:428-2627 · .econ-tariff:2703-2708 · .econ-toggle:540-543 · .econ-val:409-409 · .energy-bar:2940-2940 · .energy-caption:2856-2856 · .energy-choice:2866-2866 · .energy-compare:2989-2989 · .energy-contract:2846-2859 · .energy-cost:2936-2991 · .energy-coverage:2927-2927 · .energy-extremes:2923-2923 · .energy-fee:2892-2893 · .energy-field:2849-2861 · .energy-fields:2863-2863 · .energy-history:2844-2845 · .energy-info:2912-2914 · .energy-inline:2933-2933 · .energy-legend:2941-2941 · .energy-metric:2981-2983 · .energy-metrics:2980-2980 · .energy-overview:2916-2918 · .energy-period:2919-2921 · .energy-price:2848-3037 · .energy-range:2942-2942 · .energy-reconciliation:2926-2926 · .energy-scenario:2990-2990 · .energy-section:2911-2911 · .energy-sheet:2843-2843 · .energy-supplier:2924-2984 · .energy-table:2857-2857 · .energy-tabs:2895-2906 · .energy-tariff:2929-3033 · .energy-tax:2851-2987 · .energy-vat:2985-2985 · .energy-window:2885-2979 · .energy-year:2860-2948 · .est-btn:453-457 · .est-card:463-465 · .est-detail:460-460 · .est-field:472-478 · .est-fields:471-471 · .est-group:451-455 · .est-modo:466-466 · .est-nav:450-2626 · .est-section:459-459 · .est-tariff:461-470 · .ev-alarm:1500-2092 · .ev-ann:1406-1642 · .ev-annual:1172-2953 · .ev-badge:1724-1724 · .ev-badges:1606-1606 · .ev-bar:1671-1671 · .ev-bars:1599-1599 · .ev-barsize:1324-1333 · .ev-bday:2583-2584 · .ev-bficha:2212-2212 · .ev-bfila:2213-2222 · .ev-bpunto:2220-2220 · .ev-bright:1700-2739 · .ev-btn:1762-3002 · .ev-bver:2225-2225 · .ev-cal:2770-2842 · .ev-car:1621-2209 · .ev-cell:1136-1720 · .ev-char:1751-1751 · .ev-checkbox:1756-1756 · .ev-chip:1449-2371 · .ev-color:1254-1273 · .ev-colors:1752-1752 · .ev-date:1753-1753 · .ev-dates:1346-1348 · .ev-day:1609-1662 · .ev-daynote:1915-1915 · .ev-del:2311-2312 · .ev-detail:1275-2206 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1397-1766 · .ev-field:1745-2818 · .ev-filter:1444-2976 · .ev-form:1740-1761 · .ev-hdr:1458-1571 · .ev-hora:1176-1176 · .ev-input:1747-1748 · .ev-io:1102-2992 · .ev-kind:1908-1912 · .ev-list:1580-2722 · .ev-main:1572-3020 · .ev-management:1246-1248 · .ev-month:1588-1649 · .ev-multi:1603-2372 · .ev-note:1914-1914 · .ev-num:1722-1722 · .ev-otros:1322-1667 · .ev-puente:1680-1680 · .ev-quad:1392-1716 · .ev-repeat:1757-1757 · .ev-rut:1658-2607 · .ev-search:2301-2305 · .ev-sep:1199-1199 · .ev-shape:1334-2257 · .ev-share:2768-2769 · .ev-sort:2306-2351 · .ev-stepped:1673-1675 · .ev-sub:437-439 · .ev-textarea:1749-1750 · .ev-toggle:1754-1755 · .ev-type:1242-2726 · .ev-types:1583-2723 · .ev-up:1161-2567 · .ev-upcoming:326-3027 · .ev-viaje:1177-1185 · .ev-view:1570-2364 · .ev-wd:1759-1760 · .ev-week:322-2820 · .ev-weekday:1758-1758 · .ev-wk:1186-3026 · .excl-item:352-531 · .excl-row:332-530 · .fiscal-add:687-850 · .fiscal-bracket:678-686 · .fiscal-compras:879-914 · .fiscal-copy:514-516 · .fiscal-custom:675-675 · .fiscal-ded:889-903 · .fiscal-desgrav:852-904 · .fiscal-despacho:916-937 · .fiscal-error:691-691 · .fiscal-gasto:823-885 · .fiscal-gastos:905-905 · .fiscal-hdr:835-835 · .fiscal-highlight:876-876 · .fiscal-hip:2700-2701 · .fiscal-onoff:918-919 · .fiscal-pct:676-685 · .fiscal-period:831-832 · .fiscal-radio:670-674 · .fiscal-save:689-690 · .fiscal-section:668-843 · .fiscal-sticky:840-840 · .fiscal-subsection:844-845 · .fiscal-tab:836-2624 · .fiscal-viaje:846-847 · .fiscal-vinc:929-930 · .fiscal-year:510-513 · .full-overlay:247-248 · .hbar-lbl:1958-1958 · .hbar-row:1957-1957 · .hbar-rows:1956-1956 · .hbar-track:1959-1960 · .hbar-val:1961-1961 · .header:57-2742 · .header-brand:60-60 · .hip-add:1007-1007 · .hip-auto:958-958 · .hip-bar:944-951 · .hip-cancel:994-994 · .hip-cf:963-968 · .hip-edit:990-992 · .hip-g2:962-962 · .hip-grid:956-956 · .hip-period:996-1005 · .hip-resumen:939-943 · .hip-ro:981-988 · .hip-save:993-993 · .hip-section:957-1006 · .hip-stat:953-955 · .hip-stats:952-952 · .hip-sub:960-960 · .hip-vinc:959-959 · .hip-vr:970-979 · .home-popup:1532-2882 · .home-reminder:2799-2801 · .home-submission:2744-2755 · .home-summary:2756-2764 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:267-267 · .imp-mode:2315-2965 · .imp-preview:2966-2970 · .io-peligro:1107-1115 · .io-primaria:1106-1113 · .logo-gallery:1793-1800 · .logo-popup:1784-1791 · .macro-section:1542-1543 · .macro-url:1544-2368 · .mg-budget:497-506 · .mg-cat:507-507 · .mg-desgrav:508-508 · .mg-sort:503-503 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2759 · .ms-breakdown:354-356 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:357-357 · .nav-bar:1454-2997 · .nav-btn:65-66 · .nav-icon:2659-2669 · .nav-pro:2633-2645 · .nav-style:2657-2657 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1453-1455 · .rate-input:364-2344 · .rate-label:363-363 · .rate-row:362-362 · .rate-suffix:365-365 · .rut-add:2283-2283 · .rut-addition:2502-2519 · .rut-agenda:2516-2517 · .rut-cancelled:2543-2602 · .rut-card:2273-3018 · .rut-day:2289-3009 · .rut-days:2288-3006 · .rut-dot:2276-2276 · .rut-dpick:3001-3001 · .rut-first:2254-2254 · .rut-flex:2251-2259 · .rut-hist:2295-2298 · .rut-history:2486-3039 · .rut-hora:3010-3012 · .rut-hpd:2240-2484 · .rut-icon:2245-2469 · .rut-marker:1654-1657 · .rut-name:2277-2277 · .rut-pct:2282-2282 · .rut-plan:2260-2272 · .rut-recovery:2511-3000 · .rut-routine:3016-3016 · .rut-sec:2250-2250 · .rut-session:2521-2999 · .rut-skipped:2603-2604 · .rut-stat:2292-2294 · .rut-sub:435-446 · .rut-sug:2284-2287 · .rut-susp:2291-2291 · .rut-tag:2278-2279 · .rut-time:3013-3013 · .rut-vacio:2280-2280 · .rut-week:2485-2485 · .rut-weekdays:3007-3007 · .rut-wpick:2199-2204 · .selected:2666-2666 · .sent-badge:134-134 · .settings-details:2407-2409 · .settings-edit:2369-2410 · .settings-menu:2735-2735 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:598-602 · .sim-field:587-588 · .sim-hr:597-597 · .sim-period:594-594 · .sim-target:589-593 · .sub-block:623-624 · .sub-row:625-631 · .sw-upd:204-204 · .sy-back:253-2335 · .sy-body:273-2333 · .sy-card:284-2339 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-2334 · .sy-lbl:293-2338 · .sy-list:306-359 · .sy-month:320-320 · .sy-nav:262-1713 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-period:2709-2716 · .sy-puente:312-1472 · .sy-section:274-275 · .sy-spain:278-283 · .sy-sublbl:384-384 · .sy-suelto:317-319 · .sy-tab:1460-1463 · .sy-table:294-2340 · .sy-td:299-299 · .sy-tr:300-2341 · .sy-val:289-2337 · .sy-year:255-2336 · .toast:190-209 · .toast-undo:206-206 · .today-btn:67-68 · .vac-config:328-330 · .vip-no:1074-1075 · .week-actions:159-159 · .week-card:128-2686 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2392-2547

