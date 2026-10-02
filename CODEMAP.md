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

### js/electricity-comparator.js  _(85 líneas)_
**Funciones:** energyHistoricalTariffs:2 · electricComparisonTariff:9 · electricHistoricalCopy:16 · electricModesHtml:24 · electricTariffFieldsHtml:28 · electricComparisonCard:46 · electricConsumptionScenariosHtml:55 · electricUsageYearsHtml:63 · renderElectricityComparison:69 · _renderElectricityComparison:72

### js/energy-analysis-bind.js  _(48 líneas)_
**Funciones:** bindEnergyAnalysis:2 · refresh:5 · year:8 · tab:11 · energyBindSwipe:32

### js/energy-analysis-view.js  _(99 líneas)_
**Estado global:** ENERGY_ANALYSIS_TAB:2 · ENERGY_ANALYSIS_YEAR:3 · ENERGY_SUMMARY_TOTAL:4 · ENERGY_ANALYSIS_KIND:5 · ENERGY_RETURN:6 · ENERGY_ANALYSIS_TABS:7

**Funciones:** energyAnalysisHtml:8 · _energyAnalysisHtml:11 · energyConsumptionHtml:27 · energyCostsHtml:35 · energyTariffsHtml:49 · energyScenarioOptions:74 · energyComparisonHtml:78 · energyArchiveHtml:86 · closeEnergyAnalysis:91 · openEnergyAnalysis:92 · energyRefreshAnalysis:98

### js/energy-analysis.js  _(90 líneas)_
**Estado global:** ENERGY_TAX_KEY:3

**Funciones:** energyUnitPrice:5 · energyWeightedPrice:6 · energyValidateTariff:10 · energyTariffDefaults:21 · energyTariffBase:24 · energyTariffNet:35 · energyTariffGross:36 · energyTaxes:40 · energyValidateTaxes:41 · energyMergeTaxes:45 · energySaveTaxes:46 · energyVatAt:47 · energyUtc:48 · energyDate:49 · energyBillEnd:52 · energyConsumptionMonths:57 · _energyConsumptionMonths:60 · energySimulateMonth:79

### js/energy-bills-view.js  _(13 líneas)_
**Estado global:** ENERGY_BILLS_YEAR:1 · ENERGY_BILLS_COST:2

**Funciones:** energyNumber:3 · energyBillsChart:4 · openEnergyBills:12

### js/energy-bills.js  _(45 líneas)_
**Estado global:** ENERGY_BILLS_KEY:2

**Funciones:** energyBills:3 · validateEnergyBills:4 · energyBillSignature:24 · energyMergeBills:25 · energySaveBills:30 · energyMonthlyBills:31 · energyImportHistory:35 · energyRestoreHistory:44

### js/energy-costs.js  _(60 líneas)_
**Funciones:** energyContractOn:3 · energyContractTariff:8 · energySupplierColor:16 · energyCostMonths:21 · energyCostChart:51

### js/energy-data.js  _(22 líneas)_
**Estado global:** ENERGY_RENDER_CONTEXT:3

**Funciones:** withEnergyData:4 · energyReadData:9 · energyMemo:15

### js/energy-history.js  _(52 líneas)_
**Estado global:** ENERGY_HISTORY_KEY:2

**Funciones:** energyContracts:3 · validateEnergyContracts:9 · energyContractSignature:32 · energyMergeContracts:33 · energySaveContracts:42 · energyHistoryButton:43 · energyContractStatus:45 · openEnergyHistory:50 · bindEnergyHistory:51

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

### js/events-form-controls.js  _(106 líneas)_
**Funciones:** _evFormEl:2 · _evFormAll:3 · _evFormKind:4 · _evFormColor:5 · _evFormSuggestTitle:6 · _evFormTypeUI:10 · _bindEvFormTypes:24 · _bindEvFormCategories:38 · _evFormShapePreviews:53 · _bindEvFormAppearance:56 · _evFormDatesLabel:74 · _bindEvFormDates:82 · _evFormTravelUI:93 · _bindEvFormDetails:99

### js/events-form-save.js  _(108 líneas)_
**Funciones:** _evFormRead:2 · _evFormReadDetails:26 · _evFormSaveBodas:46 · _evFormCommit:74 · _evFormDelete:90 · _bindEvFormActions:101

### js/events-form.js  _(293 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · _renderEvTypeButton:26 · evAdmiteRepeticion:46 · renderEvForm:49 (!195) · openEvForm:244 · closeEvForm:270 · evSuggestedTitle:282 · bindEvFormEvents:285

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

> `css/styles.css` se genera: editar las fuentes listadas a continuación.

### css/source/base.css  _(360 líneas)_

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

**Rangos por prefijo de clase:**
.action-btn:160-164 · .app-logo:61-61 · .app-version:124-124 · .bd-export:266-266 · .bottom-sheet:170-171 · .btn-icon:103-103 · .csv-export:76-77 · .data-actions:99-99 · .data-btn:100-115 · .data-menu:117-123 · .day-cell:138-244 · .day-date:143-143 · .day-hours:144-144 · .day-name:142-142 · .day-status:151-151 · .days-grid:137-137 · .default-hours:72-81 · .ev-dot:156-156 · .ev-dots:155-155 · .ev-upcoming:326-326 · .ev-week:322-323 · .excl-item:352-352 · .excl-row:332-332 · .full-overlay:247-248 · .header:57-59 · .header-brand:60-60 · .hour-chip:90-91 · .hour-chips:89-89 · .hour-picker:87-88 · .hours-chip:84-85 · .hours-chips:83-83 · .hours-control:71-71 · .hours-label:82-82 · .hours-panel:86-86 · .ico-doc:78-78 · .ico-exportar:267-267 · .month-nav:62-64 · .month-stat:93-96 · .month-summary:92-92 · .ms-breakdown:354-356 · .ms-hrs:98-98 · .ms-label:97-97 · .ms-num:94-94 · .ms-sep:357-357 · .nav-btn:65-66 · .option-desc:186-186 · .option-dot:179-183 · .option-hours:187-187 · .option-info:184-184 · .option-label:185-185 · .overlay:168-169 · .sent-badge:134-134 · .sheet-handle:172-172 · .sheet-option:176-178 · .sheet-options:175-175 · .sheet-subtitle:174-174 · .sheet-title:173-173 · .sw-upd:204-204 · .sy-back:253-254 · .sy-body:273-273 · .sy-card:284-291 · .sy-cards3:276-276 · .sy-cards4:277-277 · .sy-chart:302-302 · .sy-hdr:258-258 · .sy-header:252-257 · .sy-lbl:293-293 · .sy-list:306-359 · .sy-month:320-320 · .sy-nav:262-270 · .sy-note:303-305 · .sy-pdf:264-265 · .sy-puente:312-316 · .sy-section:274-275 · .sy-spain:278-283 · .sy-suelto:317-319 · .sy-table:294-298 · .sy-td:299-299 · .sy-tr:300-301 · .sy-val:289-292 · .sy-year:255-261 · .toast:190-209 · .toast-undo:206-206 · .today-btn:67-68 · .vac-config:328-330 · .week-actions:159-159 · .week-card:128-226 · .week-header:131-131 · .week-info:132-133 · .week-total:135-135 · .weeks-container:127-127

### css/source/economics.css  _(686 líneas)_

**Secciones:**

- ECONOMICS:1
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:6
- Summary sublabel (hours breakdown):23
- Ingresado box (formerly cobrado) — neutral:32
- ECONOMICS v2: tabs + nuevas secciones:66
- Estudio Cambio — grouped nav:88
- Estudio — tariff comparison cards:97
- Análisis hipoteca — secciones organizadas:118
- Mis gastos — budget table:135
- Year selector for per-year fiscal tabs:148
- §1.1 Tarifa dual:159
- §1.3 Stats por hora/día:171
- §1.4 Toggles:178
- §1.5 Declaración IRPF:183
- Tab 2: Comparador:196
- Calcular Tarifa (sim):224
- Scenario zones (Comparar Escenarios):242
- Análisis Ec. Personal:259
- Bloques de la Subrogación:261
- Fiscal config modal — purple theme override:304
- Fiscal config modal:306
- ECONOMICS v3: opt-buttons, cascade, gastos:332
- Cascade ingresos/gastos:339
- Media mensual: cards:349
- Tab 4: Análisis:359
- IRPF Breakdown visual:373
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:400
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):402
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):426
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:435
- Resumen fiscal al final de Ingresos y Gastos:437
- Donut chart:444
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):454
- Fiscal config: gastos items:461
- Fiscal: tab bar:473
- Fiscal: sticky save:478
- Fiscal: section title income/expense colors:480
- Fiscal: desgravaciones:490
- Fiscal: compras profesionales:517
- Desgravaciones: notas + tabla despacho info:525
- Nota IVA compras:545
- IVA por item en compras:547
- Fiscal: despacho en casa:554
- Hipoteca — resumen visual:577
- Hipoteca — compact 2-col grid:600
- Hipoteca — compact vinculaciones:608
- Hipoteca — read-only fields:619
- Hipoteca — edit/detail buttons:628
- Hipoteca — period summary card:634
- Multi-rate period cards:647
- Distribución de ingresos:663
- Comparador: reorder buttons:679
- Rate input styled:683

**Rangos por prefijo de clase:**
.ah-cuota:122-124 · .ah-donut:132-134 · .ah-section:119-121 · .ah-total:129-131 · .ah-vs:125-128 · .analisis-card:271-273 · .analisis-cards:260-260 · .analisis-hbar:274-279 · .analisis-input:289-292 · .analisis-ins:298-303 · .analisis-insurance:297-297 · .analisis-mortgage:280-296 · .econ-add:206-207 · .econ-ahorro:427-434 · .econ-annual:25-25 · .econ-avg:26-354 · .econ-bracket:189-195 · .econ-calc:337-338 · .econ-casc:341-348 · .econ-cascade:340-340 · .econ-chart:219-220 · .econ-comp:197-221 · .econ-decl:184-358 · .econ-distrib:664-678 · .econ-donut:445-460 · .econ-equiv:659-662 · .econ-fiscal:438-443 · .econ-formula:45-48 · .econ-gastos:360-372 · .econ-gear:156-157 · .econ-hdr:67-158 · .econ-ingresado:33-33 · .econ-irpf:374-436 · .econ-legend:222-223 · .econ-line:217-218 · .econ-month:50-63 · .econ-mr:656-657 · .econ-multi:648-658 · .econ-opt:333-336 · .econ-qcard:15-22 · .econ-qcell:11-14 · .econ-qm:20-20 · .econ-qmonth:18-19 · .econ-quarter:7-10 · .econ-rate:160-168 · .econ-row:34-44 · .econ-sc:199-685 · .econ-scenario:198-198 · .econ-section:64-64 · .econ-sim:225-235 · .econ-stats:172-177 · .econ-sub:70-87 · .econ-tab:68-69 · .econ-toggle:179-182 · .econ-val:49-49 · .est-btn:92-96 · .est-card:102-104 · .est-detail:99-99 · .est-field:111-117 · .est-fields:110-110 · .est-group:90-94 · .est-modo:105-105 · .est-nav:89-89 · .est-section:98-98 · .est-tariff:100-109 · .ev-sub:76-78 · .excl-item:170-170 · .excl-row:169-169 · .fiscal-add:326-489 · .fiscal-bracket:317-325 · .fiscal-compras:518-553 · .fiscal-copy:153-155 · .fiscal-custom:314-314 · .fiscal-ded:528-542 · .fiscal-desgrav:491-543 · .fiscal-despacho:555-576 · .fiscal-error:330-330 · .fiscal-gasto:462-524 · .fiscal-gastos:544-544 · .fiscal-hdr:474-474 · .fiscal-highlight:515-515 · .fiscal-onoff:557-558 · .fiscal-pct:315-324 · .fiscal-period:470-471 · .fiscal-radio:309-313 · .fiscal-save:328-329 · .fiscal-section:307-482 · .fiscal-sticky:479-479 · .fiscal-subsection:483-484 · .fiscal-tab:475-477 · .fiscal-viaje:485-486 · .fiscal-vinc:568-569 · .fiscal-year:149-152 · .hip-add:646-646 · .hip-auto:597-597 · .hip-bar:583-590 · .hip-cancel:633-633 · .hip-cf:602-607 · .hip-edit:629-631 · .hip-g2:601-601 · .hip-grid:595-595 · .hip-period:635-644 · .hip-resumen:578-582 · .hip-ro:620-627 · .hip-save:632-632 · .hip-section:596-645 · .hip-stat:592-594 · .hip-stats:591-591 · .hip-sub:599-599 · .hip-vinc:598-598 · .hip-vr:609-618 · .mg-budget:136-145 · .mg-cat:146-146 · .mg-desgrav:147-147 · .mg-sort:142-142 · .rate-input:4-4 · .rate-label:3-3 · .rate-row:2-2 · .rate-suffix:5-5 · .rut-sub:74-85 · .sim-combo:237-241 · .sim-field:226-227 · .sim-hr:236-236 · .sim-period:233-233 · .sim-target:228-232 · .sub-block:262-263 · .sub-row:264-270 · .sy-sublbl:24-24

### css/source/birthdays.css  _(115 líneas)_

**Secciones:**

- BIRTHDAYS:1
- El nombre admite hasta cuatro líneas.:14
- VIP controls bar:28
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:39
- VIP edit mode item states:42
- Feat 1: Buscador en lista por meses:52
- Upcoming birthdays:78
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:95

**Rangos por prefijo de clase:**
.bday-add:93-94 · .bday-badge:15-18 · .bday-buscar:55-57 · .bday-calendar:4-20 · .bday-cancel:40-41 · .bday-cell:8-96 · .bday-hdr:3-3 · .bday-header:21-25 · .bday-io:61-77 · .bday-list:27-51 · .bday-month:26-26 · .bday-num:12-12 · .bday-search:58-60 · .bday-upcoming:79-92 · .bday-vip:23-38 · .bday-week:5-7 · .data-btn:2-2 · .ev-cell:97-114 · .ev-io:63-63 · .io-peligro:68-76 · .io-primaria:67-74 · .vip-no:35-36

### css/source/event-calendar.css  _(321 líneas)_

**Secciones:**

- Events in puentes (summary) — one per line:1
- Events upcoming view:5
- Minicabecera de día dentro de un panel de Próximos:7
- Marcador de la tarjeta de Proximos: la forma real del evento:17
- Horas del evento y transporte de ida/vuelta:22
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:54
- Grid del mes: col fecha (48px) + col eventos (1fr):56
- Columna fecha (col 1):58
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:67
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:74
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:78
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:84
- Event color type picker:88
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:120
- Color picker avanzado (paleta 6×8 + color libre):124
- Detail color picker toggle:142
- Annual events calendar:148
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):178
- Selector de formas en el formulario de evento (Otros):190
- Selector de grosor de barra (grande | Otros):192
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):207
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:211
- Inicio/Fin bloqueados cuando hay Selección Multidía:214
- Mini-overlay para elegir días específicos (Otros):219
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:246
- Marcador "+" (más de 4 eventos puntuales en el mismo día):250
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:252
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:258
- Calendario 4 meses: 2 columnas × 2 filas:260
- Botón ir al calendario mensual en puentes del resumen:262
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:274
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:278
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:296
- Dropdown de vista anual:303
- Linea que separa los chips de eventos grandes de los puntuales:312

**Rangos por prefijo de clase:**
.dp-actions:242-243 · .dp-counter:229-230 · .dp-day:237-241 · .dp-days:236-236 · .dp-grid:231-231 · .dp-handle:224-224 · .dp-hdr:225-225 · .dp-mhdr:234-235 · .dp-mname:233-233 · .dp-month:232-232 · .dp-overlay:220-223 · .dp-sheet:222-222 · .dp-title:226-226 · .dp-yearnav:227-228 · .ev-ann:275-311 · .ev-annual:19-314 · .ev-barsize:193-202 · .ev-category:109-115 · .ev-chip:318-318 · .ev-color:122-141 · .ev-dates:215-217 · .ev-detail:143-147 · .ev-edit:266-272 · .ev-filter:313-320 · .ev-hora:23-23 · .ev-io:273-273 · .ev-management:187-187 · .ev-otros:191-191 · .ev-quad:261-261 · .ev-sep:46-46 · .ev-shape:203-210 · .ev-symbol:89-102 · .ev-type:103-123 · .ev-up:8-21 · .ev-upcoming:6-45 · .ev-viaje:24-32 · .ev-wk:33-87 · .sy-body:51-51 · .sy-puente:2-264

### css/source/navigation-alarms.css  _(115 líneas)_

**Secciones:**

- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:5
- Summary tabs — nivel 2:8
- BRIDGE DAY CELLS in summary:13
- VIP BIRTHDAYS:22
- BIRTHDAY + EVENT ALARM PANEL:25
- Campana de alarma en items de próximos (bday + eventos):28
- 3-ZONE ALARM MARKER:66
- ALARM MANAGEMENT OVERLAY:79
- HOME POPUP (semanas pendientes / VIP sin alarma):80
- MACRO URL EN MENÚ:90
- Feat 4: Nav-bar emoji alignment:96
- Birthday detail / form overlays:106

**Rangos por prefijo de clase:**
.bd-alarm:26-78 · .bd-detail:107-114 · .bday-hdr:6-6 · .bday-upcoming:24-24 · .bday-vip:23-23 · .ev-alarm:49-55 · .ev-hdr:7-7 · .ev-upcoming:29-32 · .home-popup:81-89 · .macro-section:91-92 · .macro-url:93-95 · .nav-bar:3-105 · .overlay-nav:2-4 · .sy-puente:14-21 · .sy-tab:9-12

### css/source/event-panels.css  _(216 líneas)_

**Secciones:**

- EVENTS:1
- Zone A: upcoming/list views — subtle blue tint:9
- Zone B: calendar grid views — subtle teal tint, active = green:10
- Feat 2: Lista de Eventos subtabs:13
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:30
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:32
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:44
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:48
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):54
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:69
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):79
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):111
- Perímetro puente: capa inferior a eventos:113
- Bright past: bombilla override:133
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:138
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":143
- Quad label 3 lines:148
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:155
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:157
- Events list view:159
- Event form overlay (inside eventsOverlay):173
- Relleno, para que haga pareja con el naranja de "Editar evento":203
- Event detail:209

**Rangos por prefijo de clase:**
.data-btn:2-2 · .ev-ann:74-76 · .ev-annual:86-132 · .ev-badge:158-158 · .ev-badges:40-40 · .ev-bar:105-105 · .ev-bars:33-33 · .ev-bright:134-145 · .ev-btn:196-205 · .ev-car:55-67 · .ev-cell:118-154 · .ev-char:185-185 · .ev-checkbox:190-190 · .ev-chip:85-85 · .ev-colors:186-186 · .ev-date:187-187 · .ev-day:43-96 · .ev-detail:210-215 · .ev-edit:199-200 · .ev-field:179-180 · .ev-form:174-195 · .ev-hdr:3-5 · .ev-input:181-182 · .ev-io:207-208 · .ev-list:14-172 · .ev-main:6-6 · .ev-month:22-83 · .ev-multi:37-126 · .ev-num:156-156 · .ev-otros:53-101 · .ev-puente:114-114 · .ev-quad:149-150 · .ev-repeat:191-191 · .ev-rut:92-95 · .ev-stepped:107-109 · .ev-textarea:183-184 · .ev-toggle:188-189 · .ev-types:17-19 · .ev-view:4-8 · .ev-wd:193-194 · .ev-week:28-112 · .ev-weekday:192-192 · .rut-marker:88-91 · .sy-nav:146-147

### css/source/dialogs-responsive.css  _(135 líneas)_

**Secciones:**

- LOGO POPUP:1
- Gallery:10
- BD ALARM VIP TOGGLE:19
- RESPONSIVE (mobile header):22
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:24
- ALARM PANEL:77
- Drum picker (selector giratorio de hora/minuto):82
- Confirmación alarma en el pasado:108
- Botón flotante "Listo" en modo Editar VIPs:114
- Controles inline long-press cumpleaños:117
- Selector de clase en el formulario:125
- Notas: general vs de un dia concreto:131

**Rangos por prefijo de clase:**
.alarm-cfg:78-78 · .alarm-colon:81-81 · .alarm-create:95-101 · .alarm-day:105-107 · .alarm-days:102-104 · .alarm-msg:91-92 · .alarm-panel:79-79 · .alarm-past:109-113 · .alarm-time:80-80 · .bd-alarm:20-21 · .bday-ic:119-123 · .bday-inline:118-118 · .bday-listo:115-115 · .btn-icon:31-67 · .data-actions:33-69 · .data-btn:29-65 · .drum-picker:84-87 · .drum-sel:90-90 · .drum-wrap:83-89 · .econ-qcell:26-28 · .econ-quarter:25-25 · .ev-daynote:133-133 · .ev-detail:134-134 · .ev-kind:126-130 · .ev-note:132-132 · .header:57-70 · .logo-gallery:11-18 · .logo-popup:2-9 · .nav-bar:34-74

### css/source/wedding-moves.css  _(323 líneas)_

**Secciones:**

- Pestana Bodas y pestana partida Vacaciones/Festivos:1
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:2
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):13
- Filas del panel de un aviso:27
- Estadisticas:31
- Barras horizontales de reparto (componente generico: hBarRows):39
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:49
- Dia cerrado: no admite mas clases:66
- Una clase a la que le falta la hora o la sala se marca ella sola.:77
- Fila con cambios sin guardar:82
- Filtros de Parejas como chips pulsables:94
- El color de la pareja va en un punto delante; el nombre, en color normal:157
- Sala sin asignar: se marca en naranja para que cante en la lista:162
- Nota propia del dia en la lista de Proximos:165
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:167
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):169
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:177
- Editar siempre en naranja, como en el resto de la app:183
- Los tres botones del detalle de pareja comparten aspecto:200
- Subpestana Calendario de bodas:240
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:254
- Dia resaltado al pulsar una pareja en la leyenda:261
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:267
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:289
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:291
- etiqueta al minimo: el nombre de la pareja necesita el resto:300
- el color de la pareja va en un punto, no tinendo el nombre:303
- Los tres botones de la pareja, en una sola linea:310
- Buscador y boton de anadir en la misma fila:313
- Tarjeta de pareja desplegada en su sitio (antes era un modal):319

**Rangos por prefijo de clase:**
.boda-actions:192-192 · .boda-add:194-194 · .boda-asg:217-239 · .boda-buscar:314-316 · .boda-cal:241-266 · .boda-card:100-322 · .boda-chip:96-98 · .boda-chips:95-95 · .boda-cl:154-191 · .boda-class:78-153 · .boda-controls:56-56 · .boda-couple:136-138 · .boda-cpk:208-216 · .boda-date:193-193 · .boda-day:72-116 · .boda-det:199-312 · .boda-dia:143-145 · .boda-dot:104-104 · .boda-falta:111-111 · .boda-filters:59-59 · .boda-fsel:60-63 · .boda-ftoggles:64-65 · .boda-hd:187-189 · .boda-inp:131-131 · .boda-iss:28-30 · .boda-issue:15-26 · .boda-issues:14-14 · .boda-legend:195-198 · .boda-mini:181-182 · .boda-mode:46-48 · .boda-multi:146-151 · .boda-name:105-105 · .boda-ok:112-112 · .boda-place:139-164 · .boda-prog:107-108 · .boda-ro:155-163 · .boda-save:92-93 · .boda-savebar:88-91 · .boda-search:317-317 · .boda-sec:12-12 · .boda-sobra:113-113 · .boda-sort:318-318 · .boda-stat:33-38 · .boda-stats:32-32 · .boda-sticky:8-10 · .boda-sum:52-55 · .boda-summary:51-51 · .boda-swap:121-128 · .boda-time:132-132 · .boda-tp:270-273 · .boda-wed:106-106 · .ev-alarm:170-176 · .ev-bficha:296-296 · .ev-bfila:297-306 · .ev-bpunto:304-304 · .ev-bver:309-309 · .ev-car:292-293 · .ev-detail:290-290 · .ev-upcoming:166-168 · .ev-wk:178-180 · .hbar-lbl:42-42 · .hbar-row:41-41 · .hbar-rows:40-40 · .hbar-track:43-44 · .hbar-val:45-45 · .rut-wpick:283-288 · .sy-body:5-11

### css/source/routines.css  _(61 líneas)_

**Secciones:**

- Horario distinto segun el dia:1
- Selector de icono de rutina:6

**Rangos por prefijo de clase:**
.ev-shape:19-19 · .rut-add:45-45 · .rut-card:35-43 · .rut-day:51-52 · .rut-days:50-50 · .rut-dot:38-38 · .rut-first:16-16 · .rut-flex:13-21 · .rut-hist:57-60 · .rut-hpd:2-5 · .rut-icon:7-11 · .rut-name:39-39 · .rut-pct:44-44 · .rut-plan:22-34 · .rut-sec:12-12 · .rut-stat:54-56 · .rut-sug:46-49 · .rut-susp:53-53 · .rut-tag:40-41 · .rut-vacio:42-42

### css/source/shared-refinements.css  _(442 líneas)_

**Secciones:**

- Lista "Todos": buscador, orden y borrado con pulsacion larga:1
- Diálogo: modo de importación (añadir vs reemplazar):16
- PRINT:29
- Separacion de siluetas incluso entre grosores distintos.:49
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:64
- Editar: tono comun, con geometria propia de cada pantalla.:76
- Marca oficial con transparencia; conserva contraste en ambos temas.:93
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:114
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:132
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:158
- Text edits retain the solid orange; only standalone pencils use a tint.:167
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:174
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:241
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:256
- Cancelaciones sutiles: el calendario mensual conserva el color original.:266
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:278
- Titulo y estado separados para que "saltada" nunca quede tachado.:303
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:313
- El titulo queda dentro del borde de 1.5px de su caja continua.:318
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:324
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:340
- Una identidad de color por ventana para ambos juegos de iconos.:344
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:375
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:382
- Borde discreto para identificar semanas enviadas en ambos temas.:387
- Filtros junto al buscador sin ensanchar la ventana movil.:391
- Configuracion de tarifa: controles verdes y valores neutros.:404
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:422
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:439

**Rangos por prefijo de clase:**
.bday-hdr:159-160 · .bday-header:154-156 · .bday-jump:56-97 · .bday-month:172-172 · .bday-next:106-107 · .bday-sub:283-284 · .bday-upcoming:54-54 · .boda-catalog:83-91 · .boda-cfg:133-145 · .boda-config:79-130 · .boda-count:87-87 · .boda-date:147-165 · .boda-day:120-120 · .boda-field:121-126 · .boda-filter:59-61 · .boda-mini:67-67 · .boda-pack:88-89 · .boda-pfilters:58-62 · .boda-sticky:80-143 · .boda-teachers:108-108 · .data-actions:341-341 · .data-btn:342-353 · .econ-tab:325-329 · .econ-tariff:405-410 · .est-nav:327-328 · .ev-bday:285-286 · .ev-bright:441-441 · .ev-chip:73-73 · .ev-del:13-14 · .ev-filter:72-72 · .ev-list:2-424 · .ev-multi:50-74 · .ev-rut:242-309 · .ev-search:3-7 · .ev-sort:8-53 · .ev-type:426-428 · .ev-types:425-425 · .ev-up:269-269 · .ev-view:66-66 · .ev-wk:224-440 · .fiscal-hip:402-403 · .fiscal-tab:326-326 · .imp-mode:17-27 · .macro-url:70-70 · .nav-icon:361-371 · .nav-pro:335-347 · .nav-style:359-359 · .rate-input:46-46 · .rut-addition:204-221 · .rut-agenda:218-219 · .rut-cancelled:245-304 · .rut-history:188-239 · .rut-hpd:186-186 · .rut-icon:170-171 · .rut-recovery:213-222 · .rut-session:223-223 · .rut-skipped:305-306 · .rut-week:187-187 · .selected:368-368 · .settings-details:109-111 · .settings-edit:71-112 · .settings-menu:437-437 · .sy-back:37-37 · .sy-body:35-35 · .sy-card:41-41 · .sy-header:36-36 · .sy-lbl:40-40 · .sy-period:411-418 · .sy-table:42-42 · .sy-tr:43-43 · .sy-val:39-39 · .sy-year:38-38 · .week-card:388-388 · .wm-logo:94-249

### css/source/home-sharing.css  _(114 líneas)_

**Secciones:**

- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:1
- Selector de eventos para compartir por iCalendar:26
- Selector de exportación: controles compactos y lista con espacio propio.:27
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:64
- Compartir: cabecera centrada, categorías completas y lista compacta.:82

**Rangos por prefijo de clase:**
.boda-future:79-79 · .energy-contract:106-107 · .energy-field:109-110 · .energy-history:104-105 · .energy-price:108-113 · .energy-sheet:103-103 · .energy-tax:111-111 · .ev-cal:30-102 · .ev-field:78-78 · .ev-share:28-29 · .ev-week:65-80 · .ev-wk:3-3 · .header:2-2 · .home-reminder:59-61 · .home-submission:4-15 · .home-summary:16-24 · .month-summary:18-19

### css/source/energy-refinements.css  _(198 líneas)_

**Secciones:**

- Facturas: mismos componentes que los contratos, cifras sin desbordar.:1
- Estudio energético: controles compactos y separación entre apartados.:11
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:14
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:30
- Solo energía reparte el espacio entre textos, con ancho de contenido.:42
- Identidad propia de cada pestaña, sin alterar el sistema general.:45
- Filtros y filas de parejas: controles compactos, columnas alineadas.:98
- Navegación: la misma geometría en Home y en las ventanas.:142
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:153
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:171

**Rangos por prefijo de clase:**
.boda-asg:106-111 · .boda-det:102-105 · .boda-last:15-19 · .data-actions:143-144 · .energy-bar:88-88 · .energy-caption:2-2 · .energy-choice:12-12 · .energy-compare:137-137 · .energy-contract:4-5 · .energy-cost:84-139 · .energy-coverage:75-75 · .energy-extremes:71-71 · .energy-fee:40-41 · .energy-field:7-7 · .energy-fields:9-9 · .energy-info:60-62 · .energy-inline:81-81 · .energy-legend:89-89 · .energy-metric:129-131 · .energy-metrics:128-128 · .energy-overview:64-66 · .energy-period:67-69 · .energy-price:181-186 · .energy-range:90-90 · .energy-reconciliation:74-74 · .energy-scenario:138-138 · .energy-section:59-59 · .energy-supplier:72-132 · .energy-table:3-3 · .energy-tabs:43-54 · .energy-tariff:77-182 · .energy-tax:70-135 · .energy-vat:133-133 · .energy-window:31-127 · .energy-year:6-96 · .ev-annual:100-101 · .ev-btn:150-150 · .ev-filter:99-124 · .ev-io:140-140 · .ev-main:168-169 · .ev-upcoming:174-176 · .ev-wk:16-175 · .home-popup:18-28 · .imp-mode:113-113 · .imp-preview:114-118 · .nav-bar:145-145 · .rut-bulk:192-197 · .rut-card:162-167 · .rut-day:151-157 · .rut-days:154-154 · .rut-dpick:149-149 · .rut-history:188-191 · .rut-hora:158-160 · .rut-month:196-196 · .rut-recovery:148-148 · .rut-routine:164-164 · .rut-session:147-147 · .rut-time:161-161 · .rut-weekdays:155-155

### css/tasks.css  _(78 líneas)_

**Secciones:**

- Tareas globales: estilos aislados de calendarios y pestañas existentes.:1

**Rangos por prefijo de clase:**
.home-popup:73-73 · .task-actions:55-58 · .task-content:40-42 · .task-date:47-48 · .task-done:43-44 · .task-drop:60-61 · .task-editor:52-54 · .task-grip:49-50 · .task-more:51-51 · .task-moving:59-59 · .task-row:38-39 · .task-title:41-41 · .tasks-add:33-35 · .tasks-count:14-14 · .tasks-day:45-46 · .tasks-docked:15-16 · .tasks-drop:8-12 · .tasks-empty:69-71 · .tasks-fab:4-13 · .tasks-footer:62-63 · .tasks-header:23-28 · .tasks-heading:24-25 · .tasks-list:37-37 · .tasks-move:64-68 · .tasks-open:2-3 · .tasks-overlay:17-21 · .tasks-reminder:74-75 · .tasks-sheet:20-22 · .tasks-status:72-72 · .tasks-tabs:29-32

### css/household.css  _(107 líneas)_

**Secciones:**

- Vivienda: lectura con contraste, cifras principales y detalle secundario.:1
- Pares de precios: cifra neta principal, importe con impuestos secundario.:59

**Rangos por prefijo de clase:**
.energy-pair:61-67 · .energy-price:60-68 · .household-active:98-98 · .household-analysis:56-56 · .household-balance:29-32 · .household-body:6-9 · .household-card:15-42 · .household-dates:24-24 · .household-detail:55-96 · .household-empty:54-54 · .household-equivalent:35-39 · .household-eyebrow:18-18 · .household-gas:50-105 · .household-header:5-5 · .household-history:43-46 · .household-investment:12-14 · .household-luz:49-49 · .household-metrics:25-25 · .household-mortgage:16-16 · .household-ok:40-40 · .household-payment:21-23 · .household-price:69-69 · .household-progress:33-34 · .household-rate:79-84 · .household-section:47-47 · .household-status:20-20 · .household-summary:10-10 · .household-tax:70-71 · .household-utilities:48-48 · .household-utility:53-53 · .household-value:26-28

### css/electricity-comparator.css  _(76 líneas)_

**Secciones:**

- Solo el comparador eléctrico: no altera pestañas ni formularios compartidos.:1

**Rangos por prefijo de clase:**
.electric-add:71-71 · .electric-card:20-70 · .electric-cards:19-19 · .electric-check:30-30 · .electric-company:33-33 · .electric-comparator:2-72 · .electric-current:6-8 · .electric-field:53-54 · .electric-fields:69-69 · .electric-identity:32-32 · .electric-input:55-57 · .electric-link:9-9 · .electric-modes:40-42 · .electric-period:45-47 · .electric-power:52-52 · .electric-reference:62-62 · .electric-remove:18-18 · .electric-results:73-75 · .electric-scenario:15-17 · .electric-scenarios:10-10 · .electric-section:11-13 · .electric-source:34-39 · .electric-tax:58-61 · .electric-usage:63-68 · .electric-weight:50-51 · .electric-weighted:48-49

### css/finance-views.css  _(82 líneas)_

**Secciones:**

- Contenido financiero. No modifica la navegación ni las subpestañas globales.:1

**Rangos por prefijo de clase:**
.econ-rate:10-14 · .econ-stats:7-7 · .econ-summary:3-76 · .study-company:20-20 · .study-mortgage:61-64 · .study-rate:51-60 · .study-workspace:15-80

### css/personal-periods.css  _(13 líneas)_

**Secciones:**


**Rangos por prefijo de clase:**
.personal-advanced:1-1 · .personal-frequency:11-11 · .personal-period:3-12

