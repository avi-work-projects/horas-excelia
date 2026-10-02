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

### js/birthdays-render.js  _(240 líneas)_
**Estado global:** DN7:95

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:5 (!88) · getBdaysInRange:10 · bdayLabel:25 · renderGroup:34 · renderBdayCalMonth:93 · renderBdayList:133 · getEffVip:140 · renderBdayContent:182

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

### js/data-integrity.js  _(184 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:130

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 (!97) · visit:27 · hour:81 · days:82 · schedule:83 · validBirthday:122 · prepareImportRelations:123 · loadMailConfig:131 · saveMailConfig:134 · birthdayValidation:137 · rutLimitExceeded:142 · legacy:173

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(570 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:33 · ESTUDIO_HIP_CALC:34 · ESTUDIO_GAS_SCENARIOS:228 · ESTUDIO_GAS_CALC:229 · ESTUDIO_GAS_IVA:230 · ESTUDIO_ELECT_SCENARIOS:318 · ESTUDIO_ELECT_CALC:319 · ESTUDIO_ELECT_IVA:320 · ESTUDIO_ELECT_TAX:321

**Funciones:** renderEconEstudio:6 · _defaultVinc:29 · _defaultHipAlt:30 · _renderEstudioHipotecaComp:36 (!95) · bindEconEstudioEvents:131 · _estudioReRender:144 · _bindEstudioHipoteca:149 · _readEstHipAltAt:199 · _readEstHipVincAt:210 · _calcGasCost:232 · _currentGasTariff:233 · _renderEstudioGasComp:241 · _renderGasCompCard:288 · _calcElectCost:323 · _currentElectTariff:324 · _renderEstudioElectComp:329 · _renderMultiScenarioResult:332 · _bindEstudioGas:400 · _bindEstudioElect:431 · _bindScenarios:433 · _readScenarios:452 · _bindCompFields:461 · _saveCompFields:496 · renderEstudioContent:512 · openEstudio:526 · closeEstudio:536 · reRenderEstudio:541 · bindEstudioEvents:549

### js/economics-fiscal-bind.js  _(563 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:26 · reRenderFiscal:32 · bindFiscalEvents:43 · _switchTab:47 · _bindYearSelector:81 · _bindTabPersonal:119 · _bindTabIrpf:170 · _bindTabGastosDesg:215 (!91) · _rebindComprasDel:264 · _bindTabIrpfDeduc:306 · _bindTabDesgrav:319 (!96) · _bindList:321 · _bindTabDespachoOnly:415 (!83) · _syncLiveD:426 · _updateFmt:464 · _saveFiscalAll:498 · _rv:527

### js/economics-fiscal-datos.js  _(341 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · HOUSEHOLD_TAB_KEY:30 · FISCAL_ENTRY:31 · FISCAL_HIP_SUB:33 · FISCAL_HIP_EDITING:35 · FISCAL_HIP_EDIT_SNAPSHOT:36 · FISCAL_HIP_DETAIL_TARGET:37 · PERSONAL_SK:43 · PERSONAL_DATA:44 · DEFAULT_PERSONAL_GASTOS_REC:46 · DEFAULT_PERSONAL_INVERSIONES:52 · INGRESOS_SK:96 · INGRESOS_ITEMS:97 · GASTOS_SK:114 · GASTOS_DIFICIL_PCT:115 · DEFAULT_GASTOS:116 · GASTOS_ITEMS:134 · COMPRAS_SK:196 · COMPRAS_IVA_ENABLED:197 · DEFAULT_COMPRAS:198 · COMPRAS_ITEMS:204 · DESGRAV_SK:251 · DESGRAV_DEFAULT:253 · DESGRAV_ITEMS:273 · OBSOLETE_IDS:276

**Funciones:** householdTab:32 · setHouseholdTab:34 · _yearKey:40 · _ensureDefaults:59 · loadPersonalYear:75 · savePersonalYear:91 · loadIngresos:98 · saveIngresos:101 · findIngreso:104 · ingresoAnual:108 · loadFiscal:136 · saveFiscal:144 · getIrpfPct:147 · getBrackets:148 · _loadGastosFromRaw:150 · loadGastosYear:168 · loadGastos:181 · saveGastosYear:182 · findGasto:185 · gastoAnual:189 · loadCompras:205 · saveCompras:222 · comprasTotal:226 · comprasIvaTotal:236 · loadDesgrav:275 · saveDesgrav:306 · desgravAnual:309 · computeTotalDesgrav:330

### js/economics-fiscal-elect.js  _(220 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:114

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:63 · _despField:79 · _despFieldMoney:88 · _renderIngresosDesgList:101 · _renderGastoItem:120 · renderGastosList:135 · _bindElectDetalle:157 · _bindSegurosNormales:204

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:71

### js/economics-fiscal-hip.js  _(854 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipROvinc:364 · _calcInsOvercost:374 · _renderInlineOvercost:385 · _renderHipResumen:404 · _renderHipDetalle:407 · _renderHipSectionContent:433 · _renderCompraSection:445 · _renderPrestamoSection:474 · _renderSubSection:521 · renderFiscalTabDespacho:592 · _bindTabDespacho:610 · _bindHipResumen:637 · _bindHipAnalysis:653 · _bindHipDetalle:663 · _rerenderSection:734 · _readSectionInputs:743 · _rv:744 · _rv_s:745 · _bindEditingSection:803

### js/economics-fiscal.js  _(461 líneas)_
**Estado global:** GROUP_CASA_DESP:324 · GROUP_UTIL_DESP:325

**Funciones:** renderFiscalContent:8 · _renderYearSelector:34 · _renderCopyYearBtn:42 · _personalListHtml:65 · _personalTripFilter:100 · _personalTotal:109 · _personalTotalWeekly:113 · renderFiscalTabPersonal:117 · renderFiscalTabIrpf:158 · renderFiscalTabGastosDesg:205 · renderComprasList:236 · renderFiscalTabIrpfDeduc:285 · renderFiscalTabDesgrav:298 · renderDesgravDespachoInfo:320 · _dedCard:361 · renderDesgravList:396

### js/economics-gastos.js  _(701 líneas)_
**Estado global:** GASTOS_TOGGLES_SK:5 · GASTOS_TOGGLES:6 · GROUP_SEMIOBL:96 · GROUP_CASA:97 · GROUP_OTROS_IMP:98 · GROUP_S:472 · GROUP_C:473 · GROUP_S2:571 · GROUP_C2:572

**Funciones:** loadGastosToggles:8 · saveGastosToggles:14 · isTglOn:17 · computeDisponible:22 · renderEconGastos:45 (!155) · _gastosGroup:100 · renderResultadoDeclaracion:200 (!113) · _renderDesgloseAhorroPartida:313 · renderIrpfBreakdown:384 · _renderIrpfTramos:431 · renderIncomeDistrib:457 · pctOf:460 · distRow:461 · grpLbl:497 · _sectorPath:529 · _donutSummaryHtml:537 · renderIncomeDonut:566 · _bindDonutClick:637 · gastosCascRow:658 · gastosResultRow:675 · bindEconGastosEvents:682

### js/economics-helpers.js  _(68 líneas)_
**Funciones:** _fmtMiles:8 · _hipMoney:14 · _hipNum:19 · _hipDate:24 · _hipText:28 · _hipVinc:32 · _hipVincSum:46 · _hipRO:62 · _hipROmoney:65

### js/economics-sim.js  _(181 líneas)_
**Estado global:** SIM_TARGET:5 · SIM_PERIOD:6 · SIM_NET_MODE:7

**Funciones:** _simComputeAll:10 · _inverseSalary:48 · renderEconSim:62 (!82) · bindEconSimEvents:144

### js/economics.js  _(688 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_RATE_PERIODS:10 · ECON_ESTUDIO_SUB:14 · ESTUDIO_YEAR:15

**Funciones:** computeSalaryNet:23 · fc:41 · fcPlain:46 · _rateForDate:56 · _buildDatePeriods:71 · computeEconEx:85 · econBarChart:144 · _fmtDateEs:172 · _prevDate:177 · _ensureDatePeriods:184 · _renderRateInputs:201 · _econCard:218 · _econCards7:224 · f:226 · _getMultiRateOpts:241 · renderEconResumen:245 (!196) · renderEconContent:441 · openEcon:466 · closeEcon:482 · reRenderEcon:487 · bindEconEvents:499 · bindEconResumenEvents:537 (!151)

### js/electricity-comparator-inputs.js  _(113 líneas)_
**Estado global:** ELECTRIC_COMPARISON_COLORS:2 · ELECTRIC_COMPARISON_COLLAPSED:3

**Funciones:** electricComparisonTaxes:4 · electricComparisonApplied:8 · electricInputValue:12 · electricFixedDay:18 · electricInputField:19 · electricUsageYear:23 · electricInitialScenarios:28 · electricWeightWarning:33 · electricFoldCard:39 · electricUsageYears:45 · bindElectricComparisonCard:50 · validate:52 · save:57 · bindElectricityComparison:89 · refresh:93

### js/electricity-comparator.js  _(82 líneas)_
**Funciones:** energyHistoricalTariffs:2 · electricComparisonTariff:9 · electricHistoricalCopy:16 · electricModesHtml:24 · electricTariffFieldsHtml:28 · electricComparisonCard:46 · electricConsumptionScenariosHtml:55 · electricUsageYearsHtml:63 · renderElectricityComparison:69

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

### js/energy-reference.js  _(67 líneas)_
**Funciones:** energyUsageProfile:3 · collect:6 · energyDisplayWeights:22 · energyPriceTotal:31 · energyPricePair:35 · value:36 · energyTaxPrice:39 · energyTariffReference:40 · energyTariffReferenceHtml:53 · metric:55 · number:56 · energyComparisonDefaults:63

### js/energy-study.js  _(97 líneas)_
**Estado global:** ENERGY_COST_VAT:2 · ENERGY_COMPARE_TARIFF:3

**Funciones:** energyDocumentedYears:4 · energyContractInYear:12 · energyYearIndicators:16 · tax:21 · energyMetric:24 · energyInfoHtml:25 · energySectionTitle:26 · energyPeriodsHtml:27 · energySuppliersHtml:38 · energyContractPeriods:48 · energyCommercialPeriods:50 · signature:52 · energyPriceExtremes:58 · energySummaryHtml:64 · energyVatStrip:77 · energyCompareChart:89 · energyCompareTable:93

### js/energy-tariff-editor.js  _(55 líneas)_
**Funciones:** energyNumericField:2 · energyTariffEditorHtml:3 · openEnergyTariff:21 · close:24 · read:25 · update:26 · energyEditLegacyTariff:38 · energySendToScenarios:48

### js/events-appearance.js  _(80 líneas)_
**Estado global:** EV_APPEARANCE_KEY:3 · EV_APPEARANCE_FIELDS:4 · EV_APPEARANCE_OPEN:10 · EV_APPEARANCE:24

**Funciones:** evAppearanceDefaults:11 · validateEventAppearance:14 · loadEventAppearance:20 · applyEventAppearance:25 · setEventAppearance:29 · evSymbolStroke:38 · renderEventAppearance:47 · evAppearanceNumber:60 · bindEventAppearance:61

### js/events-bind.js  _(573 líneas)_
**Funciones:** _switchEvView:6 · openEvents:24 · closeEvents:34 · openEventsAt:41 · refreshEvents:48 · bindEvEvents:69 · _bindEvNav:79 (!198) · _scrollWeekToMonth:87 · _scrollWeekToToday:134 · doScroll:144 · _bindEvCal:277 (!93) · _bindEvWeekTitleBackground:370 · update:376 · schedule:399 · openEvTypeFilter:404 · close:412 · _bindEvListas:418 (!122) · apply:528 · _bindEvGestos:540 · _evSwipeUpcoming:553 · _evSwipeBodas:560 · _evSwipeRutinas:567

### js/events-cal.js  _(374 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · _renderEvAnnual:342 · _renderEvQuad:351 · renderEvCalMonth:371 · renderEvAnnual:372 · renderEvQuad:373

### js/events-calendar-export.js  _(230 líneas)_
**Estado global:** EV_CAL_EXPORT:3 · EV_ICS_KEY:4 · EV_ICS_UPPER_KEY:5 · EV_ICS_NOTES_KEY:6 · EV_ICS_AUTHOR_KEY:7

**Funciones:** evIcsAuthor:8 · evIcsDescription:9 · evIcsText:14 · evIcsFold:17 · evIcsNextDay:26 · evIcsCandidates:27 · evIcsFile:47 · evIcsRecords:74 · evIcsMergeRecords:77 · evIcsRoutineRows:83 · evIcsRoutineCurrent:93 · evIcsRememberedRows:97 · evIcsPrepare:114 · evIcsExportRows:131 · evIcsExportStatus:134 · evIcsFilterRows:140 · renderEvCalendarExport:145 · openEvCalendarExport:160 · close:163 · find:166 · count:167 · filters:176 · list:182 · dates:198

### js/events-detail.js  _(603 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!118) · fd2:43 · _fila:123 · evDayCarItems:158 · evCarGo:171 · _evCarShow:179 · openEvDayCarousel:187 · closeEvDayCarousel:195 · openEvDetail:202 (!155) · repintar:242 · closeEvDetail:357 · renderEvAlarmPanel:360 (!96) · fd2:362 · openEvAlarm:456 · closeEvAlarm:462 · openBdayAlarmFromEvents:470 · bindEvAlarmEvents:478 (!125) · _syncPre:516 · fmtD:546

### js/events-form.js  _(635 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · _renderEvTypeButton:26 · evAdmiteRepeticion:46 · renderEvForm:49 (!195) · openEvForm:244 · closeEvForm:270 · evSuggestedTitle:282 · bindEvFormEvents:285 (!350) · suggestTitle:288 · _refreshShapePreviews:308 · _refreshPickDatesLabel:313 · _curKind:332 · _applyTypeUI:333 · _bindTypeSwatches:362 · _viajeSync:452

### js/events-picker-color.js  _(306 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_MANAGEMENT_SUBTYPES:42 · EV_PLAN_SUBTYPES:43 · EV_KINDS:46 · EV_TYPE_COLORS:51 · EV_FREE_COLOR:74 · EV_FREE_SHAPE:75 · EV_FREE_DATES:78 · EV_BAR_SIZES:81 · EV_FREE_BARSIZE:82 · EV_DOT_SOLID:86 · EV_SHAPE_BW:113

**Funciones:** evIsManagement:44 · evFixedSymbol:45 · evBarSize:87 · evBarSizeCls:93 · evTypeKey:94 · evTypeColor:95 · getEvKind:98 · evShapeSvg:114 · evMorePlusSvg:187 · evTravelColor:196 · getEvType:202 · isEvBarAlways:211 · getEvDisplayColor:213 · _renderColorPicker:235 · _bindColorPicker:258 · updatePreview:268

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(624 líneas)_
**Estado global:** EV_LIST_TYPES:223

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!181) · fd2:50 · renderEvItem:51 · renderEvPanel:103 · renderEvByTypes:224 · coincide:245 · renderEvMonthsView:291 · _evWeekLanes:302 · assign:305 · evWeekTravelRow:320 · renderEvWeek:340 (!133) · hexA:344 · renderEvContent:473 (!151)

### js/events.js  _(802 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_FILTER_CYCLE:44 · EV_PREV_VIEW:61 · EV_QUAD_YEAR:62 · EV_QUAD_MONTH:63 · EV_TO_SUBTAB:64 · EV_TYPES_FILTER:65 · EV_TYPES_PAST:66 · EV_LIST_SORT:67 · EV_LIST_SEARCH:68 · EV_COLORS:69 · EVENTS:70 · EV_ALARM_SK:99 · EV_ALARMS_SET:100 · EV_NO_RUT:192 · EV_MAX_BAR_DIA:248 · EV_MARK_ORDER:354 · EV_MAX_PUNT_DIA:396 · EV_MAX_RUT_DIA:397 · EV_CAL_CORNER_STACK:400 · EV_MAX_VIP_DIA:402 · EV_CAL_VIP_MAX:403 · EV_UP_SHOW_RUT:405 · EV_UP_SHOW_BODA:406 · EV_BAR_Z:458 · EV_COMPARTE_DIA:462 · EV_MNS:654 · EV_CAR:697 · EV_TRANSPORTES:716 · EV_TRANS_EMOJI:722 · EV_DATE_INDEX:788

**Funciones:** evCycleFilters:45 · evFilterGroup:51 · saveEvents:94 · loadEvAlarms:101 · saveEvAlarms:102 · _findBdayByEvId:103 · isEvAlarmSet:115 · setEvAlarmState:121 · evDk:128 · _evClampDate:137 · eventOccursOn:141 · getEventsOn:185 · evSignature:200 · evMergeIncoming:210 · evMergeMsg:235 · _fmtDayEs:247 · evBarLimitExceeded:249 · evDayLimitExceeded:259 · rutDayCount:295 · hasUpcomingEvent:302 · updateEventsBtn:311 · evDefaultShape:325 · evMarkerHtml:333 · evMorePlusHtml:348 · evMarkPriority:355 · evBodaMinutes:363 · evSortMarks:374 · ev0:375 · evAnnualXsHtml:407 · vipStarSvgHtml:417 · vipIconHtml:426 · evIsoDate:432 · _isVipBdayTooFar:433 · evUpcomingMarkHtml:440 · _evRowOcc:459 · evComparteDia:463 · _evSoloSeRozan:468 · _evTrozosSeRozan:479 · _evAssignRow:487 · _evMarcarMitades:501 · _evMitadesStyle:516 · evBarZ:523 · _evBarSegments:527 · _evBarBand:551 · _evBarSegmentStyle:557 · _evBarExtent:562 · _evRoundedOutline:573 · near:582 · _evBarMutedColor:601 · _evSteppedBar:604 · _evAnnualCtx:657 · visible:658 · _evLoadPuentes:676 · _evScheduleRemove:704 · _evCancelRemove:705 · evStartTime:724 · evCompareTime:730 · evEndTime:731 · evTimeLabel:738 · evTramos:745 · evTramoTexto:756 · evMinutosDe:763 · _positionEvBright:773 · withEventDateIndex:789

### js/home-popup.js  _(118 líneas)_
**Funciones:** homeReminderColor:1 · homeReminderEventText:7 · openHomePopup:10 (!108) · dismissPopup:104

### js/household-summary.js  _(93 líneas)_
**Funciones:** householdMortgagePayment:2 · householdMortgagePeriod:5 · householdValue:18 · householdMortgageCard:19 · date:20 · householdUtilityPrices:35 · householdUtilityCard:67 · householdMortgageAnalysisButton:79 · renderHouseholdSummary:80

### js/household.js  _(39 líneas)_
**Estado global:** HOUSEHOLD_RETURN:3

**Funciones:** householdHost:4 · renderHouseholdContent:5 · openHousehold:8 · closeHousehold:21 · reRenderHousehold:28 · bindHousehold:33 · move:36

### js/import-export.js  _(539 líneas)_
**Funciones:** _lsJson:247 · askImportMode:254 · close:268 · _mergeMap:282 · _mergeList:293 · _sigEvent:303 · _sigCouple:305 · _sigAlarm:306 · _sigGasto:307 · _keyId:309 · _keyBday:310 · _keyGasto:311 · _exportPerYearKeys:317 (!86) · _applyFullImport:403 (!136)

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

### js/tasks-view.js  _(136 líneas)_
**Estado global:** TASKS_VIEW:2 · TASKS_ICON:3

**Funciones:** renderTasks:4 · tasksDateLabel:20 · renderTasksList:24 · renderTaskRow:38 · openTasks:54 · closeTasks:62 · tasksKeydown:68 · renderTasksPanel:78 · tasksPerform:94 · tasksRowAction:98 · tasksFocusRow:115 · bindTasksReorder:119 · clear:125 · end:131

### js/tasks.js  _(98 líneas)_
**Estado global:** TASKS_KEY:3

**Funciones:** tasksValidate:4 · tasksValidTimestamp:17 · tasksNormalize:18 · tasksData:30 · tasksSave:35 · tasksMigrate:36 · tasksMerge:41 · tasksItems:47 · tasksPendingRows:51 · tasksNeedsDateChoice:52 · tasksCreate:55 · tasksChange:60 · tasksMoveCompleted:76 · tasksUndoMove:81 · tasksMove:86 · tasksReminder:93 · tasksReminderSeen:97

## CSS

### css/styles.css  _(3082 líneas)_

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
- El nombre admite hasta cuatro líneas.:1061
- VIP controls bar:1075
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1086
- VIP edit mode item states:1089
- Feat 1: Buscador en lista por meses:1099
- Upcoming birthdays:1125
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:1142
- Events in puentes (summary) — one per line:1162
- Events upcoming view:1166
- Minicabecera de día dentro de un panel de Próximos:1168
- Marcador de la tarjeta de Proximos: la forma real del evento:1178
- Horas del evento y transporte de ida/vuelta:1183
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1215
- Grid del mes: col fecha (48px) + col eventos (1fr):1217
- Columna fecha (col 1):1219
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1228
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1235
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1239
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1245
- Event color type picker:1249
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1281
- Color picker avanzado (paleta 6×8 + color libre):1285
- Detail color picker toggle:1303
- Annual events calendar:1309
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1339
- Selector de formas en el formulario de evento (Otros):1351
- Selector de grosor de barra (grande | Otros):1353
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1368
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1372
- Inicio/Fin bloqueados cuando hay Selección Multidía:1375
- Mini-overlay para elegir días específicos (Otros):1380
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1407
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1411
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1413
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1419
- Calendario 4 meses: 2 columnas × 2 filas:1421
- Botón ir al calendario mensual en puentes del resumen:1423
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1435
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1439
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1457
- Dropdown de vista anual:1464
- Linea que separa los chips de eventos grandes de los puntuales:1473
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1482
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1486
- Summary tabs — nivel 2:1489
- BRIDGE DAY CELLS in summary:1494
- VIP BIRTHDAYS:1503
- BIRTHDAY + EVENT ALARM PANEL:1506
- Campana de alarma en items de próximos (bday + eventos):1509
- 3-ZONE ALARM MARKER:1547
- ALARM MANAGEMENT OVERLAY:1560
- HOME POPUP (semanas pendientes / VIP sin alarma):1561
- MACRO URL EN MENÚ:1571
- Feat 4: Nav-bar emoji alignment:1577
- Birthday detail / form overlays:1587
- EVENTS:1597
- Zone A: upcoming/list views — subtle blue tint:1605
- Zone B: calendar grid views — subtle teal tint, active = green:1606
- Feat 2: Lista de Eventos subtabs:1609
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1626
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1628
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1640
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1644
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1650
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1665
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1675
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1707
- Perímetro puente: capa inferior a eventos:1709
- Bright past: bombilla override:1729
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1734
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1739
- Quad label 3 lines:1744
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1751
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1753
- Events list view:1755
- Event form overlay (inside eventsOverlay):1769
- Relleno, para que haga pareja con el naranja de "Editar evento":1799
- Event detail:1805
- LOGO POPUP:1813
- Gallery:1822
- BD ALARM VIP TOGGLE:1831
- RESPONSIVE (mobile header):1834
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1836
- ALARM PANEL:1889
- Drum picker (selector giratorio de hora/minuto):1894
- Confirmación alarma en el pasado:1920
- Botón flotante "Listo" en modo Editar VIPs:1926
- Controles inline long-press cumpleaños:1929
- Selector de clase en el formulario:1937
- Notas: general vs de un dia concreto:1943
- Pestana Bodas y pestana partida Vacaciones/Festivos:1947
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1948
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1959
- Filas del panel de un aviso:1973
- Estadisticas:1977
- Barras horizontales de reparto (componente generico: hBarRows):1985
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1995
- Dia cerrado: no admite mas clases:2012
- Una clase a la que le falta la hora o la sala se marca ella sola.:2023
- Fila con cambios sin guardar:2028
- Filtros de Parejas como chips pulsables:2040
- El color de la pareja va en un punto delante; el nombre, en color normal:2103
- Sala sin asignar: se marca en naranja para que cante en la lista:2108
- Nota propia del dia en la lista de Proximos:2111
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2113
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2115
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2123
- Editar siempre en naranja, como en el resto de la app:2129
- Los tres botones del detalle de pareja comparten aspecto:2146
- Subpestana Calendario de bodas:2186
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2200
- Dia resaltado al pulsar una pareja en la leyenda:2207
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:2213
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2235
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2237
- etiqueta al minimo: el nombre de la pareja necesita el resto:2246
- el color de la pareja va en un punto, no tinendo el nombre:2249
- Los tres botones de la pareja, en una sola linea:2256
- Buscador y boton de anadir en la misma fila:2259
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2265
- Horario distinto segun el dia:2269
- Selector de icono de rutina:2274
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2329
- Diálogo: modo de importación (añadir vs reemplazar):2344
- PRINT:2357
- Separacion de siluetas incluso entre grosores distintos.:2377
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:2392
- Editar: tono comun, con geometria propia de cada pantalla.:2404
- Marca oficial con transparencia; conserva contraste en ambos temas.:2421
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:2442
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:2460
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:2486
- Text edits retain the solid orange; only standalone pencils use a tint.:2495
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:2502
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:2569
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:2584
- Cancelaciones sutiles: el calendario mensual conserva el color original.:2594
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:2606
- Titulo y estado separados para que "saltada" nunca quede tachado.:2631
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:2641
- El titulo queda dentro del borde de 1.5px de su caja continua.:2646
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:2652
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:2668
- Una identidad de color por ventana para ambos juegos de iconos.:2672
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:2703
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:2710
- Borde discreto para identificar semanas enviadas en ambos temas.:2715
- Filtros junto al buscador sin ensanchar la ventana movil.:2719
- Configuracion de tarifa: controles verdes y valores neutros.:2732
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:2750
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:2767
- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:2771
- Selector de eventos para compartir por iCalendar:2796
- Selector de exportación: controles compactos y lista con espacio propio.:2797
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:2834
- Compartir: cabecera centrada, categorías completas y lista compacta.:2852
- Facturas: mismos componentes que los contratos, cifras sin desbordar.:2885
- Estudio energético: controles compactos y separación entre apartados.:2895
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:2898
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:2914
- Solo energía reparte el espacio entre textos, con ancho de contenido.:2926
- Identidad propia de cada pestaña, sin alterar el sistema general.:2929
- Filtros y filas de parejas: controles compactos, columnas alineadas.:2982
- Navegación: la misma geometría en Home y en las ventanas.:3026
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:3037
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:3055

**Rangos por prefijo de clase:** 
.action-btn:160-164 · .ah-cuota:483-485 · .ah-donut:493-495 · .ah-section:480-482 · .ah-total:490-492 · .ah-vs:486-489 · .alarm-cfg:1890-1890 · .alarm-colon:1893-1893 · .alarm-create:1907-1913 · .alarm-day:1917-1919 · .alarm-days:1914-1916 · .alarm-msg:1903-1904 · .alarm-panel:1891-1891 · .alarm-past:1921-1925 · .alarm-time:1892-1892 · .analisis-card:632-634 · .analisis-cards:621-621 · .analisis-hbar:635-640 · .analisis-input:650-653 · .analisis-ins:659-664 · .analisis-insurance:658-658 · .analisis-mortgage:641-657 · .app-logo:61-61 · .app-version:124-124 · .bd-alarm:1507-1833 · .bd-detail:1588-1595 · .bd-export:266-266 · .bday-add:1140-1141 · .bday-badge:1062-1065 · .bday-buscar:1102-1104 · .bday-calendar:1051-1067 · .bday-cancel:1087-1088 · .bday-cell:1055-1143 · .bday-hdr:1050-2488 · .bday-header:1068-2484 · .bday-ic:1931-1935 · .bday-inline:1930-1930 · .bday-io:1108-1124 · .bday-jump:2384-2425 · .bday-list:1074-1098 · .bday-listo:1927-1927 · .bday-month:1073-2500 · .bday-next:2434-2435 · .bday-num:1059-1059 · .bday-search:1105-1107 · .bday-sub:2611-2612 · .bday-upcoming:1126-2382 · .bday-vip:1070-1504 · .bday-week:1052-1054 · .boda-actions:2138-2138 · .boda-add:2140-2140 · .boda-asg:2163-2995 · .boda-buscar:2260-2262 · .boda-cal:2187-2212 · .boda-card:2046-2268 · .boda-catalog:2411-2419 · .boda-cfg:2461-2473 · .boda-chip:2042-2044 · .boda-chips:2041-2041 · .boda-cl:2100-2137 · .boda-class:2024-2099 · .boda-config:2407-2458 · .boda-controls:2002-2002 · .boda-count:2415-2415 · .boda-couple:2082-2084 · .boda-cpk:2154-2162 · .boda-date:2139-2493 · .boda-day:2018-2448 · .boda-det:2145-2989 · .boda-dia:2089-2091 · .boda-dot:2050-2050 · .boda-falta:2057-2057 · .boda-field:2449-2454 · .boda-filter:2387-2389 · .boda-filters:2005-2005 · .boda-fsel:2006-2009 · .boda-ftoggles:2010-2011 · .boda-future:2849-2849 · .boda-hd:2133-2135 · .boda-inp:2077-2077 · .boda-iss:1974-1976 · .boda-issue:1961-1972 · .boda-issues:1960-1960 · .boda-last:2899-2903 · .boda-legend:2141-2144 · .boda-mini:2127-2395 · .boda-mode:1992-1994 · .boda-multi:2092-2097 · .boda-name:2051-2051 · .boda-ok:2058-2058 · .boda-pack:2416-2417 · .boda-pfilters:2386-2390 · .boda-place:2085-2110 · .boda-prog:2053-2054 · .boda-ro:2101-2109 · .boda-save:2038-2039 · .boda-savebar:2034-2037 · .boda-search:2263-2263 · .boda-sec:1958-1958 · .boda-sobra:2059-2059 · .boda-sort:2264-2264 · .boda-stat:1979-1984 · .boda-stats:1978-1978 · .boda-sticky:1954-2471 · .boda-sum:1998-2001 · .boda-summary:1997-1997 · .boda-swap:2067-2074 · .boda-teachers:2436-2436 · .boda-time:2078-2078 · .boda-tp:2216-2219 · .boda-wed:2052-2052 · .bottom-sheet:170-171 · .btn-icon:103-1879 · .csv-export:76-77 · .data-actions:99-3028 · .data-btn:100-2681 · .data-menu:117-123 · .day-cell:138-244 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .dp-actions:1403-1404 · .dp-counter:1390-1391 · .dp-day:1398-1402 · .dp-days:1397-1397 · .dp-grid:1392-1392 · .dp-handle:1385-1385 · .dp-hdr:1386-1386 · .dp-mhdr:1395-1396 · .dp-mname:1394-1394 · .dp-month:1393-1393 · .dp-overlay:1381-1384 · .dp-sheet:1383-1383 · .dp-title:1387-1387 · .dp-yearnav:1388-1389 · .drum-picker:1896-1899 · .drum-sel:1902-1902 · .drum-wrap:1895-1901 · .econ-add:567-568 · .econ-ahorro:788-795 · .econ-annual:385-385 · .econ-avg:386-715 · .econ-bracket:550-556 · .econ-calc:698-699 · .econ-casc:702-709 · .econ-cascade:701-701 · .econ-chart:580-581 · .econ-comp:558-582 · .econ-decl:545-719 · .econ-distrib:1025-1039 · .econ-donut:806-821 · .econ-equiv:1020-1023 · .econ-fiscal:799-804 · .econ-formula:405-408 · .econ-gastos:721-733 · .econ-gear:517-518 · .econ-hdr:427-519 · .econ-ingresado:393-393 · .econ-irpf:735-797 · .econ-legend:583-584 · .econ-line:578-579 · .econ-month:410-423 · .econ-mr:1017-1018 · .econ-multi:1009-1019 · .econ-opt:694-697 · .econ-qcard:375-382 · .econ-qcell:371-1840 · .econ-qm:380-380 · .econ-qmonth:378-379 · .econ-quarter:367-1837 · .econ-rate:521-529 · .econ-row:394-404 · .econ-sc:560-1046 · .econ-scenario:559-559 · .econ-section:424-424 · .econ-sim:586-596 · .econ-stats:533-538 · .econ-sub:430-448 · .econ-tab:428-2657 · .econ-tariff:2733-2738 · .econ-toggle:540-543 · .econ-val:409-409 · .energy-bar:2972-2972 · .energy-caption:2886-2886 · .energy-choice:2896-2896 · .energy-compare:3021-3021 · .energy-contract:2876-2889 · .energy-cost:2968-3023 · .energy-coverage:2959-2959 · .energy-extremes:2955-2955 · .energy-fee:2924-2925 · .energy-field:2879-2891 · .energy-fields:2893-2893 · .energy-history:2874-2875 · .energy-info:2944-2946 · .energy-inline:2965-2965 · .energy-legend:2973-2973 · .energy-metric:3013-3015 · .energy-metrics:3012-3012 · .energy-overview:2948-2950 · .energy-period:2951-2953 · .energy-price:2878-3070 · .energy-range:2974-2974 · .energy-reconciliation:2958-2958 · .energy-scenario:3022-3022 · .energy-section:2943-2943 · .energy-sheet:2873-2873 · .energy-supplier:2956-3016 · .energy-table:2887-2887 · .energy-tabs:2927-2938 · .energy-tariff:2961-3066 · .energy-tax:2881-3019 · .energy-vat:3017-3017 · .energy-window:2915-3011 · .energy-year:2890-2980 · .est-btn:453-457 · .est-card:463-465 · .est-detail:460-460 · .est-field:472-478 · .est-fields:471-471 · .est-group:451-455 · .est-modo:466-466 · .est-nav:450-2656 · .est-section:459-459 · .est-tariff:461-470 · .ev-alarm:1530-2122 · .ev-ann:1436-1672 · .ev-annual:1180-2985 · .ev-badge:1754-1754 · .ev-badges:1636-1636 · .ev-bar:1701-1701 · .ev-bars:1629-1629 · .ev-barsize:1354-1363 · .ev-bday:2613-2614 · .ev-bficha:2242-2242 · .ev-bfila:2243-2252 · .ev-bpunto:2250-2250 · .ev-bright:1730-2769 · .ev-btn:1792-3034 · .ev-bver:2255-2255 · .ev-cal:2800-2872 · .ev-car:1651-2239 · .ev-category:1270-1276 · .ev-cell:1144-1750 · .ev-char:1781-1781 · .ev-checkbox:1786-1786 · .ev-chip:1479-2401 · .ev-color:1283-1302 · .ev-colors:1782-1782 · .ev-date:1783-1783 · .ev-dates:1376-1378 · .ev-day:1639-1692 · .ev-daynote:1945-1945 · .ev-del:2341-2342 · .ev-detail:1304-2236 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-edit:1427-1796 · .ev-field:1775-2848 · .ev-filter:1474-3008 · .ev-form:1770-1791 · .ev-hdr:1488-1601 · .ev-hora:1184-1184 · .ev-input:1777-1778 · .ev-io:1110-3024 · .ev-kind:1938-1942 · .ev-list:1610-2752 · .ev-main:1602-3053 · .ev-management:1348-1348 · .ev-month:1618-1679 · .ev-multi:1633-2402 · .ev-note:1944-1944 · .ev-num:1752-1752 · .ev-otros:1352-1697 · .ev-puente:1710-1710 · .ev-quad:1422-1746 · .ev-repeat:1787-1787 · .ev-rut:1688-2637 · .ev-search:2331-2335 · .ev-sep:1207-1207 · .ev-shape:1364-2287 · .ev-share:2798-2799 · .ev-sort:2336-2381 · .ev-stepped:1703-1705 · .ev-sub:437-439 · .ev-symbol:1250-1263 · .ev-textarea:1779-1780 · .ev-toggle:1784-1785 · .ev-type:1264-2756 · .ev-types:1613-2753 · .ev-up:1169-2597 · .ev-upcoming:326-3060 · .ev-viaje:1185-1193 · .ev-view:1600-2394 · .ev-wd:1789-1790 · .ev-week:322-2850 · .ev-weekday:1788-1788 · .ev-wk:1194-3059 · .excl-item:352-531 · .excl-row:332-530 · .fiscal-add:687-850 · .fiscal-bracket:678-686 · .fiscal-compras:879-914 · .fiscal-copy:514-516 · .fiscal-custom:675-675 · .fiscal-ded:889-903 · .fiscal-desgrav:852-904 · .fiscal-despacho:916-937 · .fiscal-error:691-691 · .fiscal-gasto:823-885 · .fiscal-gastos:905-905 · .fiscal-hdr:835-835 · .fiscal-highlight:876-876 · .fiscal-hip:2730-2731 · .fiscal-onoff:918-919 · .fiscal-pct:676-685 · .fiscal-period:831-832 · .fiscal-radio:670-674 · .fiscal-save:689-690 · .fiscal-section:668-843 · .fiscal-sticky:840-840 · .fiscal-subsection:844-845 · .fiscal-tab:836-2654 · .fiscal-viaje:846-847 · .fiscal-vinc:929-930 · .fiscal-year:510-513 · .full-overlay:247-248 · .hbar-lbl:1988-1988 · .hbar-row:1987-1987 · .hbar-rows:1986-1986 · .hbar-track:1989-1990 · .hbar-val:1991-1991 · .header:57-2772 · .header-brand:60-60 · .hip-add:1007-1007 · .hip-auto:958-958 · .hip-bar:944-951 · .hip-cancel:994-994 · .hip-cf:963-968 · .hip-edit:990-992 · .hip-g2:962-962 · .hip-grid:956-956 · .hip-period:996-1005 · .hip-resumen:939-943 · .hip-ro:981-988 · .hip-save:993-993 · .hip-section:957-1006 · .hip-stat:953-955 · .hip-stats:952-952 · .hip-sub:960-960 · .hip-vinc:959-959 · .hip-vr:970-979 · .home-popup:1562-2912 · .home-reminder:2829-2831 · .home-submission:2774-2785 · .home-summary:2786-2794 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:267-267 · .imp-mode:2345-2997 · .imp-preview:2998-3002 · .io-peligro:1115-1123 · .io-primaria:1114-1121 · .logo-gallery:1823-1830 · .logo-popup:1814-1821 · .macro-section:1572-1573 · .macro-url:1574-2398 · .mg-budget:497-506 · .mg-cat:507-507 · .mg-desgrav:508-508 · .mg-sort:503-503 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-2789 · .ms-breakdown:354-356 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:357-357 · .nav-bar:1484-3029 · .nav-btn:65-66 · .nav-icon:2689-2699 · .nav-pro:2663-2675 · .nav-style:2687-2687 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .overlay-nav:1483-1485 · .rate-input:364-2374 · .rate-label:363-363 · .rate-row:362-362 · .rate-suffix:365-365 · .rut-add:2313-2313 · .rut-addition:2532-2549 · .rut-agenda:2546-2547 · .rut-bulk:3076-3081 · .rut-cancelled:2573-2632 · .rut-card:2303-3051 · .rut-day:2319-3041 · .rut-days:2318-3038 · .rut-dot:2306-2306 · .rut-dpick:3033-3033 · .rut-first:2284-2284 · .rut-flex:2281-2289 · .rut-hist:2325-2328 · .rut-history:2516-3075 · .rut-hora:3042-3044 · .rut-hpd:2270-2514 · .rut-icon:2275-2499 · .rut-marker:1684-1687 · .rut-month:3080-3080 · .rut-name:2307-2307 · .rut-pct:2312-2312 · .rut-plan:2290-2302 · .rut-recovery:2541-3032 · .rut-routine:3048-3048 · .rut-sec:2280-2280 · .rut-session:2551-3031 · .rut-skipped:2633-2634 · .rut-stat:2322-2324 · .rut-sub:435-446 · .rut-sug:2314-2317 · .rut-susp:2321-2321 · .rut-tag:2308-2309 · .rut-time:3045-3045 · .rut-vacio:2310-2310 · .rut-week:2515-2515 · .rut-weekdays:3039-3039 · .rut-wpick:2229-2234 · .selected:2696-2696 · .sent-badge:134-134 · .settings-details:2437-2439 · .settings-edit:2399-2440 · .settings-menu:2765-2765 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sim-combo:598-602 · .sim-field:587-588 · .sim-hr:597-597 · .sim-period:594-594 · .sim-target:589-593 · .sub-block:623-624 · .sub-row:625-631 · .sw-upd:204-204 · .sy-back:253-2365 · .sy-body:273-2363 · .sy-card:284-2369 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-2364 · .sy-lbl:293-2368 · .sy-list:306-359 · .sy-month:320-320 · .sy-nav:262-1743 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-period:2739-2746 · .sy-puente:312-1502 · .sy-section:274-275 · .sy-spain:278-283 · .sy-sublbl:384-384 · .sy-suelto:317-319 · .sy-tab:1490-1493 · .sy-table:294-2370 · .sy-td:299-299 · .sy-tr:300-2371 · .sy-val:289-2367 · .sy-year:255-2366 · .toast:190-209 · .toast-undo:206-206 · .today-btn:67-68 · .vac-config:328-330 · .vip-no:1082-1083 · .week-actions:159-159 · .week-card:128-2716 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127 · .wm-logo:2422-2577

