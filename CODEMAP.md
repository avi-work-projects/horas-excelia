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

### css/styles.css  _(3042 líneas)_

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
- Cabe el nombre entero, hasta en tres lineas:1062
- VIP controls bar:1068
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1079
- VIP edit mode item states:1082
- Feat 1: Buscador en lista por meses:1092
- Upcoming birthdays:1118
- Weekend frame — gris lavanda suave:1135
- Hoy manda sobre el gris del fin de semana:1138
- Events in puentes (summary) — one per line:1158
- Events upcoming view:1162
- Minicabecera de día dentro de un panel de Próximos:1164
- Marcador de la tarjeta de Proximos: la forma real del evento:1174
- Horas del evento y transporte de ida/vuelta:1179
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1211
- Grid del mes: col fecha (48px) + col eventos (1fr):1213
- Columna fecha (col 1):1215
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1224
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1231
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1235
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1241
- Event color type picker:1245
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1256
- Color picker avanzado (paleta 6×8 + color libre):1260
- Detail color picker toggle:1278
- Annual events calendar:1284
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1314
- Selector de formas en el formulario de evento (Otros):1325
- Selector de grosor de barra (grande | Otros):1327
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1342
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1346
- Inicio/Fin bloqueados cuando hay Selección Multidía:1349
- Mini-overlay para elegir días específicos (Otros):1354
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1381
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1385
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1387
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1393
- Calendario 4 meses: 2 columnas × 2 filas:1395
- Botón ir al calendario mensual en puentes del resumen:1397
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1409
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1413
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1431
- Dropdown de vista anual:1438
- Linea que separa los chips de eventos grandes de los puntuales:1447
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1456
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1460
- Summary tabs — nivel 2:1463
- BRIDGE DAY CELLS in summary:1468
- VIP BIRTHDAYS:1477
- BIRTHDAY + EVENT ALARM PANEL:1480
- Campana de alarma en items de próximos (bday + eventos):1483
- 3-ZONE ALARM MARKER:1521
- ALARM MANAGEMENT OVERLAY:1534
- HOME POPUP (semanas pendientes / VIP sin alarma):1535
- MACRO URL EN MENÚ:1545
- Feat 4: Nav-bar emoji alignment:1551
- Birthday detail / form overlays:1561
- EVENTS:1571
- Zone A: upcoming/list views — subtle blue tint:1579
- Zone B: calendar grid views — subtle teal tint, active = green:1580
- Feat 2: Lista de Eventos subtabs:1583
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1600
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1602
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1614
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1618
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1624
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1639
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1649
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1681
- Perímetro puente: capa inferior a eventos:1683
- Bright past: bombilla override:1703
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1708
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1713
- Quad label 3 lines:1718
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1725
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1727
- Events list view:1729
- Event form overlay (inside eventsOverlay):1743
- Relleno, para que haga pareja con el naranja de "Editar evento":1773
- Event detail:1779
- LOGO POPUP:1787
- Gallery:1796
- BD ALARM VIP TOGGLE:1805
- RESPONSIVE (mobile header):1808
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1810
- ALARM PANEL:1863
- Drum picker (selector giratorio de hora/minuto):1868
- Confirmación alarma en el pasado:1894
- Botón flotante "Listo" en modo Editar VIPs:1900
- Controles inline long-press cumpleaños:1903
- Selector de clase en el formulario:1911
- Notas: general vs de un dia concreto:1917
- Pestana Bodas y pestana partida Vacaciones/Festivos:1921
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1922
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1933
- Filas del panel de un aviso:1947
- Estadisticas:1951
- Barras horizontales de reparto (componente generico: hBarRows):1959
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1969
- Dia cerrado: no admite mas clases:1986
- Una clase a la que le falta la hora o la sala se marca ella sola.:1997
- Fila con cambios sin guardar:2002
- Filtros de Parejas como chips pulsables:2014
- El color de la pareja va en un punto delante; el nombre, en color normal:2077
- Sala sin asignar: se marca en naranja para que cante en la lista:2082
- Nota propia del dia en la lista de Proximos:2085
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2087
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2089
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2097
- Editar siempre en naranja, como en el resto de la app:2103
- Los tres botones del detalle de pareja comparten aspecto:2120
- Subpestana Calendario de bodas:2160
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2174
- Dia resaltado al pulsar una pareja en la leyenda:2181
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:2187
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2209
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2211
- etiqueta al minimo: el nombre de la pareja necesita el resto:2220
- el color de la pareja va en un punto, no tinendo el nombre:2223
- Los tres botones de la pareja, en una sola linea:2230
- Buscador y boton de anadir en la misma fila:2233
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2239
- Horario distinto segun el dia:2243
- Selector de icono de rutina:2248
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2303
- Diálogo: modo de importación (añadir vs reemplazar):2318
- PRINT:2331
- Separacion de siluetas incluso entre grosores distintos.:2351
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2366
- Editar: tono comun, con geometria propia de cada pantalla.:2378
- Marca oficial con transparencia; conserva contraste en ambos temas.:2395
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2416
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2434
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2460
- Text edits retain the solid orange; only standalone pencils use a tint.:2469
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2476
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2543
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2558
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2568
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2580
- Titulo y estado separados para que "saltada" nunca quede tachado.:2605
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2615
- El titulo queda dentro del borde de 1.5px de su caja continua.:2620
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2626
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2642
- Una identidad de color por ventana para ambos juegos de iconos.:2646
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2677
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2684
- Borde discreto para identificar semanas enviadas en ambos temas.:2689
- Filtros junto al buscador sin ensanchar la ventana movil.:2693
- Configuracion de tarifa: controles verdes y valores neutros.:2706
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2724
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2741
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2745
- Selector de eventos para compartir por iCalendar:2770
- Selector de exportación: controles compactos y lista con espacio propio.:2771
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2808
- Compartir: cabecera centrada, categorías completas y lista compacta.:2826
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2859
- Estudio energético: controles compactos y separación entre apartados.:2869
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2872
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2888
- Solo energía reparte el espacio entre textos, con ancho de contenido.:2898
- Identidad propia de cada pestaña, sin alterar el sistema general.:2901
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2954
- Navegación: la misma geometría en Home y en las ventanas.:2998
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:3009
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:3024

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:483-485 · .ah-donut:493-495 · .ah-section:480-482 · .ah-total:490-492 · .ah-vs:486-489 · .alarm-cfg:1864-1864 · .alarm-colon:1867-1867 · .alarm-create:1881-1887 · .alarm-day:1891-1893 · .alarm-days:1888-1890 · .alarm-msg:1877-1878 · .alarm-panel:1865-1865 · .alarm-past:1895-1899 · .alarm-time:1866-1866 · .analisis-card:632-634 · .analisis-cards:621-621 · .analisis-hbar:635-640 · .analisis-input:650-653 · .analisis-ins:659-664 · .analisis-insurance:658-658 · .analisis-mortgage:641-657 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1481-1807 · .bd-detail:1562-1569 · .bd-export:266-266 · .bday-add:1133-1134 · .bday-badge:1063-1065 · .bday-buscar:1095-1097 · .bday-cancel:1080-1081 · .bday-cell:1056-1139 · .bday-hdr:1050-2462 · .bday-header:2456-2458 · .bday-ic:1905-1909 · .bday-inline:1904-1904 · .bday-io:1101-1117 · .bday-jump:2358-2399 · .bday-list:1067-1091 · .bday-listo:1901-1901 · .bday-month:1066-2474 · .bday-next:2408-2409 · .bday-num:1061-1061 · .bday-search:1098-1100 · .bday-sub:2585-2586 · .bday-upcoming:1119-2356 · .bday-vip:1069-1478 · .bday-week:1051-1053 · .boda-actions:2112-2112 · .boda-add:2114-2114 · .boda-asg:2137-2967 · .boda-buscar:2234-2236 · .boda-cal:2161-2186 · .boda-card:2020-2242 · .boda-catalog:2385-2393 · .boda-cfg:2435-2447 · .boda-chip:2016-2018 · .boda-chips:2015-2015 · .boda-cl:2074-2111 · .boda-class:1998-2073 · .boda-config:2381-2432 · .boda-controls:1976-1976 · .boda-count:2389-2389 · .boda-couple:2056-2058 · .boda-cpk:2128-2136 · .boda-date:2113-2467 · .boda-day:1992-2422 · .boda-det:2119-2961 · .boda-dia:2063-2065 · .boda-dot:2024-2024 · .boda-falta:2031-2031 · .boda-field:2423-2428 · .boda-filter:2361-2363 · .boda-filters:1979-1979 · .boda-fsel:1980-1983 · .boda-ftoggles:1984-1985 · .boda-future:2823-2823 · .boda-hd:2107-2109 · .boda-inp:2051-2051 · .boda-iss:1948-1950 · .boda-issue:1935-1946 · .boda-issues:1934-1934 · .boda-last:2873-2877 · .boda-legend:2115-2118 · .boda-mini:2101-2369 · .boda-mode:1966-1968 · .boda-multi:2066-2071 · .boda-name:2025-2025 · .boda-ok:2032-2032 · .boda-pack:2390-2391 · .boda-pfilters:2360-2364 · .boda-place:2059-2084 · .boda-prog:2027-2028 · .boda-ro:2075-2083 · .boda-save:2012-2013 · .boda-savebar:2008-2011 · .boda-search:2237-2237 · .boda-sec:1932-1932 · .boda-sobra:2033-2033 · .boda-sort:2238-2238 · .boda-stat:1953-1958 · .boda-stats:1952-1952 · .boda-sticky:1928-2445 · .boda-sum:1972-1975 · .boda-summary:1971-1971 · .boda-swap:2041-2048 · .boda-teachers:2410-2410 · .boda-time:2052-2052 · .boda-tp:2190-2193 · .boda-wed:2026-2026 · .bottom-sheet:170-171 · .btn-icon:103-1853 · .csv-export:76-77 · .data-actions:99-3000 · .data-btn:100-2655 · .data-menu:117-123 · .day-cell:138-244 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1377-1378 · .dp-counter:1364-1365 · .dp-day:1372-1376 · .dp-days:1371-1371 · .dp-grid:1366-1366 · .dp-handle:1359-1359 · .dp-hdr:1360-1360 · .dp-mhdr:1369-1370 · .dp-mname:1368-1368 · .dp-month:1367-1367 · .dp-overlay:1355-1358 · .dp-sheet:1357-1357 · .dp-title:1361-1361 · .dp-yearnav:1362-1363 · .drum-picker:1870-1873 · .drum-sel:1876-1876 · .drum-wrap:1869-1875 · .econ-add:567-568 · .econ-ahorro:788-795 · .econ-annual:385-385 · .econ-avg:386-715 · .econ-bracket:550-556 · .econ-calc:698-699 · .econ-casc:702-709 · .econ-cascade:701-701 · .econ-chart:580-581 · .econ-comp:558-582 · .econ-decl:545-719 · .econ-distrib:1025-1039 · .econ-donut:806-821 · .econ-equiv:1020-1023 · .econ-fiscal:799-804 · .econ-formula:405-408 · .econ-gastos:721-733 · .econ-gear:517-518 · .econ-hdr:427-519 · .econ-ingresado:393-393 · .econ-irpf:735-797 · .econ-legend:583-584 · .econ-line:578-579 · .econ-month:410-423 · .econ-mr:1017-1018 · .econ-multi:1009-1019 · .econ-opt:694-697 · .econ-qcard:375-382 · .econ-qcell:371-1814 · .econ-qm:380-380 · .econ-qmonth:378-379 · .econ-quarter:367-1811 · .econ-rate:521-529 · .econ-row:394-404 · .econ-sc:560-1046 · .econ-scenario:559-559 · .econ-section:424-424 · .econ-sim:586-596 · .econ-stats:533-538 · .econ-sub:430-448 · .econ-tab:428-2631 · .econ-tariff:2707-2712 · .econ-toggle:540-543 · .econ-val:409-409 · .energy-bar:2944-2944 · .energy-caption:2860-2860 · .energy-choice:2870-2870 · .energy-compare:2993-2993 · .energy-contract:2850-2863 · .energy-cost:2940-2995 · .energy-coverage:2931-2931 · .energy-extremes:2927-2927 · .energy-fee:2896-2897 · .energy-field:2853-2865 · .energy-fields:2867-2867 · .energy-history:2848-2849 · .energy-info:2916-2918 · .energy-inline:2937-2937 · .energy-legend:2945-2945 · .energy-metric:2985-2987 · .energy-metrics:2984-2984 · .energy-overview:2920-2922 · .energy-period:2923-2925 · .energy-price:2852-3039 · .energy-range:2946-2946 · .energy-reconciliation:2930-2930 · .energy-scenario:2994-2994 · .energy-section:2915-2915 · .energy-sheet:2847-2847 · .energy-supplier:2928-2988 · .energy-table:2861-2861 · .energy-tabs:2899-2910 · .energy-tariff:2933-3035 · .energy-tax:2855-2991 · .energy-vat:2989-2989 · .energy-window:2889-2983 · .energy-year:2864-2952 · .est-btn:453-457 · .est-card:463-465 · .est-detail:460-460 · .est-field:472-478 · .est-fields:471-471 · .est-group:451-455 · .est-modo:466-466 · .est-nav:450-2630 · .est-section:459-459 · .est-tariff:461-470 · .ev-alarm:1504-2096 · .ev-ann:1410-1646 · .ev-annual:1176-2957 · .ev-badge:1728-1728 · .ev-badges:1610-1610 · .ev-bar:1675-1675 · .ev-bars:1603-1603 · .ev-barsize:1328-1337 · .ev-bday:2587-2588 · .ev-bficha:2216-2216 · .ev-bfila:2217-2226 · .ev-bpunto:2224-2224 · .ev-bright:1704-2743 · .ev-btn:1766-3006 · .ev-bver:2229-2229 · .ev-cal:2774-2846 · .ev-car:1625-2213 · .ev-cell:1140-1724 · .ev-char:1755-1755 · .ev-checkbox:1760-1760 · .ev-chip:1453-2375 · .ev-color:1258-1277 · .ev-colors:1756-1756 · .ev-date:1757-1757 · .ev-dates:1350-1352 · .ev-day:1613-1666 · .ev-daynote:1919-1919 · .ev-del:2315-2316 · .ev-detail:1279-2210 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1401-1770 · .ev-field:1749-2822 · .ev-filter:1448-2980 · .ev-form:1744-1765 · .ev-hdr:1462-1575 · .ev-hora:1180-1180 · .ev-input:1751-1752 · .ev-io:1103-2996 · .ev-kind:1912-1916 · .ev-list:1584-2726 · .ev-main:1576-3022 · .ev-management:1250-1252 · .ev-month:1592-1653 · .ev-multi:1607-2376 · .ev-note:1918-1918 · .ev-num:1726-1726 · .ev-otros:1326-1671 · .ev-puente:1684-1684 · .ev-quad:1396-1720 · .ev-repeat:1761-1761 · .ev-rut:1662-2611 · .ev-search:2305-2309 · .ev-sep:1203-1203 · .ev-shape:1338-2261 · .ev-share:2772-2773 · .ev-sort:2310-2355 · .ev-stepped:1677-1679 · .ev-sub:437-439 · .ev-textarea:1753-1754 · .ev-toggle:1758-1759 · .ev-type:1246-2730 · .ev-types:1587-2727 · .ev-up:1165-2571 · .ev-upcoming:326-3029 · .ev-viaje:1181-1189 · .ev-view:1574-2368 · .ev-wd:1763-1764 · .ev-week:322-2824 · .ev-weekday:1762-1762 · .ev-wk:1190-3028 · .excl-item:352-531 · .excl-row:332-530 · .fiscal-add:687-850 · .fiscal-bracket:678-686 · .fiscal-compras:879-914 · .fiscal-copy:514-516 · .fiscal-custom:675-675 · .fiscal-ded:889-903 · .fiscal-desgrav:852-904 · .fiscal-despacho:916-937 · .fiscal-error:691-691 · .fiscal-gasto:823-885 · .fiscal-gastos:905-905 · .fiscal-hdr:835-835 · .fiscal-highlight:876-876 · .fiscal-hip:2704-2705 · .fiscal-onoff:918-919 · .fiscal-pct:676-685 · .fiscal-period:831-832 · .fiscal-radio:670-674 · .fiscal-save:689-690 · .fiscal-section:668-843 · .fiscal-sticky:840-840 · .fiscal-subsection:844-845 · .fiscal-tab:836-2628 · .fiscal-viaje:846-847 · .fiscal-vinc:929-930 · .fiscal-year:510-513 · .full-overlay:247-248 · .hbar-lbl:1962-1962 · .hbar-row:1961-1961 · .hbar-rows:1960-1960 · .hbar-track:1963-1964 · .hbar-val:1965-1965 · .header:57-2746 · .header-brand:60-60 · .hip-add:1007-1007 · .hip-auto:958-958 · .hip-bar:944-951 · .hip-cancel:994-994 · .hip-cf:963-968 · .hip-edit:990-992 · .hip-g2:962-962 · .hip-grid:956-956 · .hip-period:996-1005 · .hip-resumen:939-943 · .hip-ro:981-988 · .hip-save:993-993 · .hip-section:957-1006 · .hip-stat:953-955 · .hip-stats:952-952 · .hip-sub:960-960 · .hip-vinc:959-959 · .hip-vr:970-979 · .home-popup:1536-2886 · .home-reminder:2803-2805 · .home-submission:2748-2759 · .home-summary:2760-2768 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:267-267 · .imp-mode:2319-2969 · .imp-preview:2970-2974 · .io-peligro:1108-1116 · .io-primaria:1107-1114 · .logo-gallery:1797-1804 · .logo-popup:1788-1795 · .macro-section:1546-1547 · .macro-url:1548-2372 · .mg-budget:497-506 · .mg-cat:507-507 · .mg-desgrav:508-508 · .mg-sort:503-503 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2763 · .ms-breakdown:354-356 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:357-357 · .nav-bar:1458-3001 · .nav-btn:65-66 · .nav-icon:2663-2673 · .nav-pro:2637-2649 · .nav-style:2661-2661 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1457-1459 · .rate-input:364-2348 · .rate-label:363-363 · .rate-row:362-362 · .rate-suffix:365-365 · .rut-add:2287-2287 · .rut-addition:2506-2523 · .rut-agenda:2520-2521 · .rut-cancelled:2547-2606 · .rut-card:2277-3019 · .rut-day:2293-3013 · .rut-days:2292-3010 · .rut-dot:2280-2280 · .rut-dpick:3005-3005 · .rut-first:2258-2258 · .rut-flex:2255-2263 · .rut-hist:2299-2302 · .rut-history:2490-3041 · .rut-hora:3014-3016 · .rut-hpd:2244-2488 · .rut-icon:2249-2473 · .rut-marker:1658-1661 · .rut-name:2281-2281 · .rut-pct:2286-2286 · .rut-plan:2264-2276 · .rut-recovery:2515-3004 · .rut-routine:3020-3020 · .rut-sec:2254-2254 · .rut-session:2525-3003 · .rut-skipped:2607-2608 · .rut-stat:2296-2298 · .rut-sub:435-446 · .rut-sug:2288-2291 · .rut-susp:2295-2295 · .rut-tag:2282-2283 · .rut-time:3017-3017 · .rut-vacio:2284-2284 · .rut-week:2489-2489 · .rut-weekdays:3011-3011 · .rut-wpick:2203-2208 · .selected:2670-2670 · .sent-badge:134-134 · .settings-details:2411-2413 · .settings-edit:2373-2414 · .settings-menu:2739-2739 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:598-602 · .sim-field:587-588 · .sim-hr:597-597 · .sim-period:594-594 · .sim-target:589-593 · .sub-block:623-624 · .sub-row:625-631 · .sw-upd:204-204 · .sy-back:253-2339 · .sy-body:273-2337 · .sy-card:284-2343 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-2338 · .sy-lbl:293-2342 · .sy-list:306-359 · .sy-month:320-320 · .sy-nav:262-1717 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-period:2713-2720 · .sy-puente:312-1476 · .sy-section:274-275 · .sy-spain:278-283 · .sy-sublbl:384-384 · .sy-suelto:317-319 · .sy-tab:1464-1467 · .sy-table:294-2344 · .sy-td:299-299 · .sy-tr:300-2345 · .sy-val:289-2341 · .sy-year:255-2340 · .toast:190-209 · .toast-undo:206-206 · .today-btn:67-68 · .vac-config:328-330 · .vip-no:1075-1076 · .week-actions:159-159 · .week-card:128-2690 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2396-2551

