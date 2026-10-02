# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarm-panel.js  _(42 líneas)_
**Estado global:** ALARM_PANEL_ANCHOR:3 · ALARM_PANEL_BACK:4 · ALARM_PANEL_PREPARE:5

**Funciones:** closeAlarmPanel:7 · positionAlarmPanel:17 · toggleAlarmPanel:20 · initAlarmPanel:31

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays-bind.js  _(313 líneas)_
**Funciones:** bindBdayFormEvents:1 · openBday:52 · closeBday:56 · refreshBday:57 · applyBdaySearch:61 · bindBdayEvents:73 (!194) · _bdResetScroll:106 · _bdScrollToMonth:108 · bindBdayUpcoming:267 · bdayPanelHost:309

### js/birthdays-panels.js  _(307 líneas)_
**Funciones:** renderBdayDetail:1 · renderBdayAlarmPanel:22 · fmtDate:34 · openBdayAlarm:89 · _bdRefreshBoth:96 · closeBdayAlarm:100 · bindBdayAlarmEvents:102 (!146) · fmtD:218 · onOk:225 · onErr:226 · renderBdayForm:248 · openBdayDetail:281 · closeBdayDetail:291 · openBdayForm:294 · closeBdayForm:304

### js/birthdays-render.js  _(243 líneas)_
**Estado global:** DN7:95

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:5 (!88) · getBdaysInRange:10 · bdayLabel:25 · renderGroup:34 · renderBdayCalMonth:93 · renderBdayList:133 · getEffVip:140 · renderBdayAddButton:182 · renderBdayContent:185

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

### js/core.js  _(792 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:137 · MN_SHORT:139 · DN5:439 · FESTIVOS_ANIO:658 · NAV_SWITCH_TIMER:774

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:144 · save:156 · loadEconYear:161 · saveEconYear:180 · fakeTrans:190 · simpleBarChart:207 · hBarRows:231 · shareOrDownload:248 · download:250 · escHtml:279 · mkey:284 · getMonthH:285 · defH:291 · dayH:292 · dayT:293 · dk:294 · fd:295 · ad:296 · fh:297 · fhP:298 · isToday:299 · isPast:300 · wn:301 · weeks:304 · homeSubmissionStatus:318 · renderHomeSubmissionStatus:323 · getWD:332 · _toastReset:348 · _toastBindSwipe:358 · end:383 · showToast:401 · sendEmail:428 · buildMailtoBody:438 · render:460 (!99) · fmtH:536 · openSheet:559 · closeSheet:578 · selectType:584 · contarVacaciones:617 · confirmarCupoVacaciones:630 · contarFestivos:646 · confirmarCupoFestivos:659 · togSent:668 · _panelBorrarLuego:689 · _panelCancelarBorrado:700 · abrirPanel:702 · engancharFondo:722 · abrirUnaVez:740 · cerrarPanel:746 · renderNavBar:757 · bindNavBar:764 · navigateMain:775 · open:786

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

### js/economics-fiscal-bind.js  _(575 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:26 · reRenderFiscal:32 · bindFiscalEvents:43 · _switchTab:47 · _bindYearSelector:81 · _bindTabPersonal:119 · updateField:167 · _bindTabIrpf:182 · _bindTabGastosDesg:227 (!91) · _rebindComprasDel:276 · _bindTabIrpfDeduc:318 · _bindTabDesgrav:331 (!96) · _bindList:333 · _bindTabDespachoOnly:427 (!83) · _syncLiveD:438 · _updateFmt:476 · _saveFiscalAll:510 · _rv:539

### js/economics-fiscal-datos.js  _(346 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · HOUSEHOLD_TAB_KEY:30 · FISCAL_ENTRY:31 · FISCAL_HIP_SUB:33 · FISCAL_HIP_EDITING:35 · FISCAL_HIP_EDIT_SNAPSHOT:36 · FISCAL_HIP_DETAIL_TARGET:37 · PERSONAL_SK:43 · PERSONAL_DATA:44 · PERSONAL_SAVED:45 · DEFAULT_PERSONAL_GASTOS_REC:48 · DEFAULT_PERSONAL_INVERSIONES:54 · INGRESOS_SK:101 · INGRESOS_ITEMS:102 · GASTOS_SK:119 · GASTOS_DIFICIL_PCT:120 · DEFAULT_GASTOS:121 · GASTOS_ITEMS:139 · COMPRAS_SK:201 · COMPRAS_IVA_ENABLED:202 · DEFAULT_COMPRAS:203 · COMPRAS_ITEMS:209 · DESGRAV_SK:256 · DESGRAV_DEFAULT:258 · DESGRAV_ITEMS:278 · OBSOLETE_IDS:281

**Funciones:** householdTab:32 · setHouseholdTab:34 · _yearKey:40 · personalHasChanges:46 · _ensureDefaults:61 · loadPersonalYear:77 · savePersonalYear:94 · loadIngresos:103 · saveIngresos:106 · findIngreso:109 · ingresoAnual:113 · loadFiscal:141 · saveFiscal:149 · getIrpfPct:152 · getBrackets:153 · _loadGastosFromRaw:155 · loadGastosYear:173 · loadGastos:186 · saveGastosYear:187 · findGasto:190 · gastoAnual:194 · loadCompras:210 · saveCompras:227 · comprasTotal:231 · comprasIvaTotal:241 · loadDesgrav:280 · saveDesgrav:311 · desgravAnual:314 · computeTotalDesgrav:335

### js/economics-fiscal-elect.js  _(220 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:114

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:63 · _despField:79 · _despFieldMoney:88 · _renderIngresosDesgList:101 · _renderGastoItem:120 · renderGastosList:135 · _bindElectDetalle:157 · _bindSegurosNormales:204

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:71

### js/economics-fiscal-hip.js  _(854 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipROvinc:364 · _calcInsOvercost:374 · _renderInlineOvercost:385 · _renderHipResumen:404 · _renderHipDetalle:407 · _renderHipSectionContent:433 · _renderCompraSection:445 · _renderPrestamoSection:474 · _renderSubSection:521 · renderFiscalTabDespacho:592 · _bindTabDespacho:610 · _bindHipResumen:637 · _bindHipAnalysis:653 · _bindHipDetalle:663 · _rerenderSection:734 · _readSectionInputs:743 · _rv:744 · _rv_s:745 · _bindEditingSection:803

### js/economics-fiscal.js  _(430 líneas)_
**Estado global:** GROUP_CASA_DESP:293 · GROUP_UTIL_DESP:294

**Funciones:** renderFiscalContent:8 · _renderYearSelector:34 · _renderCopyYearBtn:43 · _personalListHtml:66 · _personalTripFilter:69 · _personalTotal:78 · _personalTotalWeekly:82 · renderFiscalTabPersonal:86 · renderFiscalTabIrpf:127 · renderFiscalTabGastosDesg:174 · renderComprasList:205 · renderFiscalTabIrpfDeduc:254 · renderFiscalTabDesgrav:267 · renderDesgravDespachoInfo:289 · _dedCard:330 · renderDesgravList:365

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

### js/events-appearance.js  _(48 líneas)_
**Estado global:** EV_APPEARANCE_KEY:3 · EV_APPEARANCE_FIELDS:4 · EV_APPEARANCE:23

**Funciones:** evAppearanceDefaults:10 · validateEventAppearance:13 · loadEventAppearance:19 · applyEventAppearance:24 · setEventAppearance:28 · evSymbolStroke:37

### js/events-bind.js  _(572 líneas)_
**Funciones:** _switchEvView:6 · openEvents:24 · closeEvents:34 · openEventsAt:41 · refreshEvents:48 · bindEvEvents:69 · _bindEvNav:78 (!198) · _scrollWeekToMonth:86 · _scrollWeekToToday:133 · doScroll:143 · _bindEvCal:276 (!93) · _bindEvWeekTitleBackground:369 · update:375 · schedule:398 · openEvTypeFilter:403 · close:411 · _bindEvListas:417 (!122) · apply:527 · _bindEvGestos:539 · _evSwipeUpcoming:552 · _evSwipeBodas:559 · _evSwipeRutinas:566

### js/events-cal.js  _(374 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · _renderEvAnnual:342 · _renderEvQuad:351 · renderEvCalMonth:371 · renderEvAnnual:372 · renderEvQuad:373

### js/events-calendar-export.js  _(230 líneas)_
**Estado global:** EV_CAL_EXPORT:3 · EV_ICS_KEY:4 · EV_ICS_UPPER_KEY:5 · EV_ICS_NOTES_KEY:6 · EV_ICS_AUTHOR_KEY:7

**Funciones:** evIcsAuthor:8 · evIcsDescription:9 · evIcsText:14 · evIcsFold:17 · evIcsNextDay:26 · evIcsCandidates:27 · evIcsFile:47 · evIcsRecords:74 · evIcsMergeRecords:77 · evIcsRoutineRows:83 · evIcsRoutineCurrent:93 · evIcsRememberedRows:97 · evIcsPrepare:114 · evIcsExportRows:131 · evIcsExportStatus:134 · evIcsFilterRows:140 · renderEvCalendarExport:145 · openEvCalendarExport:160 · close:163 · find:166 · count:167 · filters:176 · list:182 · dates:198

### js/events-detail.js  _(614 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · evDetailTitleColor:40 · renderEvDetail:49 (!119) · fd2:52 · _fila:133 · evDayCarItems:168 · evCarGo:181 · _evCarShow:189 · openEvDayCarousel:197 · closeEvDayCarousel:205 · openEvDetail:212 (!156) · repintar:252 · closeEvDetail:368 · renderEvAlarmPanel:371 (!96) · fd2:373 · openEvAlarm:467 · closeEvAlarm:473 · openBdayAlarmFromEvents:481 · bindEvAlarmEvents:489 (!125) · _syncPre:527 · fmtD:557

### js/events-form-controls.js  _(104 líneas)_
**Funciones:** _evFormEl:2 · _evFormAll:3 · _evFormKind:4 · _evFormColor:5 · _evFormSuggestTitle:6 · _evFormTypeUI:10 · _bindEvFormTypes:24 · _bindEvFormCategories:36 · _evFormShapePreviews:51 · _bindEvFormAppearance:54 · _evFormDatesLabel:72 · _bindEvFormDates:80 · _evFormTravelUI:91 · _bindEvFormDetails:97

### js/events-form-save.js  _(108 líneas)_
**Funciones:** _evFormRead:2 · _evFormReadDetails:26 · _evFormSaveBodas:46 · _evFormCommit:74 · _evFormDelete:90 · _bindEvFormActions:101

### js/events-form.js  _(289 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · _renderEvTypeButton:26 · evAdmiteRepeticion:46 · renderEvForm:49 (!195) · openEvForm:244 · closeEvForm:270 · evSuggestedTitle:278 · bindEvFormEvents:281

### js/events-picker-color.js  _(311 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_MANAGEMENT_SUBTYPES:42 · EV_PLAN_SUBTYPES:43 · EV_KINDS:47 · EV_TYPE_COLORS:52 · EV_FREE_COLOR:75 · EV_FREE_SHAPE:76 · EV_FREE_DATES:79 · EV_BAR_SIZES:82 · EV_FREE_BARSIZE:83 · EV_DOT_SOLID:87 · EV_SHAPE_BW:114

**Funciones:** evIsManagement:44 · evIsPlan:45 · evFixedSymbol:46 · evBarSize:88 · evBarSizeCls:94 · evTypeKey:95 · evTypeColor:96 · getEvKind:99 · evShapeSvg:115 · evMorePlusSvg:192 · evTravelColor:201 · getEvType:207 · isEvBarAlways:216 · getEvDisplayColor:218 · _renderColorPicker:240 · _bindColorPicker:263 · updatePreview:273

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(623 líneas)_
**Estado global:** EV_LIST_TYPES:220

**Funciones:** renderEvListItem:11 · fd2:15 · renderEvUpcoming:43 (!178) · fd2:50 · renderEvItem:51 · renderEvPanel:103 · occurrenceKey:130 · renderEvByTypes:221 · coincide:242 · renderEvMonthsView:288 · _evWeekLanes:299 · assign:302 · evWeekTravelRow:317 · renderEvWeek:337 (!133) · hexA:341 · renderEvContent:470 (!153)

### js/events.js  _(819 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:33 · EV_FILTER_SHORT:39 · EV_FILTER_COLOR:41 · EV_FILTER_SEP_AFTER:44 · EV_FILTER_CYCLE:45 · EV_PREV_VIEW:63 · EV_QUAD_YEAR:64 · EV_QUAD_MONTH:65 · EV_TO_SUBTAB:66 · EV_TYPES_FILTER:67 · EV_TYPES_PAST:68 · EV_LIST_SORT:69 · EV_LIST_SEARCH:70 · EV_COLORS:71 · EVENTS:72 · EV_ALARM_SK:101 · EV_ALARMS_SET:102 · EV_NO_RUT:194 · EV_MAX_BAR_DIA:250 · EV_MARK_ORDER:356 · EV_MAX_PUNT_DIA:398 · EV_MAX_RUT_DIA:399 · EV_CAL_CORNER_STACK:402 · EV_MAX_VIP_DIA:404 · EV_CAL_VIP_MAX:405 · EV_UP_SHOW_RUT:407 · EV_UP_SHOW_BODA:408 · EV_BAR_Z:460 · EV_COMPARTE_DIA:464 · EV_MNS:671 · EV_CAR:714 · EV_TRANSPORTES:733 · EV_TRANS_EMOJI:739 · EV_DATE_INDEX:805

**Funciones:** evCycleFilters:46 · evFilterGroup:52 · saveEvents:96 · loadEvAlarms:103 · saveEvAlarms:104 · _findBdayByEvId:105 · isEvAlarmSet:117 · setEvAlarmState:123 · evDk:130 · _evClampDate:139 · eventOccursOn:143 · getEventsOn:187 · evSignature:202 · evMergeIncoming:212 · evMergeMsg:237 · _fmtDayEs:249 · evBarLimitExceeded:251 · evDayLimitExceeded:261 · rutDayCount:297 · hasUpcomingEvent:304 · updateEventsBtn:313 · evDefaultShape:327 · evMarkerHtml:335 · evMorePlusHtml:350 · evMarkPriority:357 · evBodaMinutes:365 · evSortMarks:376 · ev0:377 · evAnnualXsHtml:409 · vipStarSvgHtml:419 · vipIconHtml:428 · evIsoDate:434 · _isVipBdayTooFar:435 · evUpcomingMarkHtml:442 · _evRowOcc:461 · evComparteDia:465 · _evSoloSeRozan:470 · _evTrozosSeRozan:481 · _evAssignRow:489 · _evMarcarMitades:503 · _evMitadesStyle:518 · evBarZ:525 · _evBarSegments:529 · _evBarBand:553 · _evBarSegmentStyle:559 · _evBarExtent:564 · _evRoundedOutline:575 · near:584 · _evBarMutedColor:603 · _evBarPast:608 · _evSteppedBar:620 · _evAnnualCtx:674 · visible:675 · _evLoadPuentes:693 · _evScheduleRemove:721 · _evCancelRemove:722 · evStartTime:741 · evCompareTime:747 · evEndTime:748 · evTimeLabel:755 · evTramos:762 · evTramoTexto:773 · evMinutosDe:780 · _positionEvBright:790 · withEventDateIndex:806

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

### js/init.js  _(446 líneas)_
**Estado global:** DRUM_ITEM_H:132 · DN_ES:289

**Funciones:** _updateHeaderActive:31 · buildDrumPicker:133 · updateDrumSelected:161 · getDrumValue:167 · checkDrumMinuteWrap:173 · buildAlarmDayBtns:204 · showAlarmPastConfirm:234 · proceed:275 · aplicarActualizacion:371 · reload:377 · _showUpdateBar:399 · _buscar:433

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/nav-icons.js  _(66 líneas)_
**Estado global:** NAV_ICON_STYLE:2 · NAV_MAIN_ITEMS:4 · NAV_ICON_PATHS:11

**Funciones:** navIconHtml:20 · applyNavIconStyle:25 · openNavIconPicker:32 · closeNavIconPicker:54 · bindNavIconStyle:55 · initMainNavigation:61

### js/personal-cards.js  _(65 líneas)_
**Estado global:** PERSONAL_CARDS_KEY:3 · PERSONAL_CARDS_OPEN:4

**Funciones:** loadPersonalCards:5 · personalCardKey:8 · personalCardOpen:9 · setPersonalCardOpen:10 · savePersonalCards:14 · personalAdvancedCards:15 · personalCardsAllOpen:22 · togglePersonalCards:26 · renderPersonalCardsToggle:31 · renderPersonalPeriods:35 · renderPersonalCard:40 · syncPersonalSave:61

### js/personal-periods-editor.js  _(55 líneas)_
**Estado global:** PERSONAL_PERIOD_EDIT:2

**Funciones:** renderPersonalPeriodEditor:3 · openPersonalPeriodEditor:16 · closePersonalPeriodEditor:20 · paintPersonalPeriodEditor:23 · error:26 · readFields:27 · valid:33

### js/personal-periods.js  _(57 líneas)_
**Estado global:** PERSONAL_SECTIONS:2

**Funciones:** personalDay:3 · personalDate:4 · personalFactor:5 · personalPeriods:6 · personalAnnual:10 · personalValidatePeriods:18 · personalValidateData:28 · personalPauseFrom:38 · personalCopyYear:45 · personalPeriodLabel:56

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

### js/settings-menu.js  _(70 líneas)_
**Estado global:** SETTINGS_MENU_ANCHOR:3 · SETTINGS_MENU_BACK:4

**Funciones:** closeSettingsMenu:5 · positionSettingsMenu:14 · _positionHeaderMenu:18 · toggleSettingsMenu:26 · setConnectionsEditing:38 · initSettingsMenu:49

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

### css/source/base.css  _(362 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:20
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):39
- HEADER:58
- JORNADA DEFECTO:72
- Barra vertical que separa la campana del bloque de navegacion:109
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:115
- WEEK CARDS:128
- WEEK ACTIONS:160
- BOTTOM SHEET (day type selector):169
- TOAST:191
- Tema claro: el fondo oscuro con letra de color no se leia bien:201
- SW UPDATE BUTTON (en menú ⋯):205
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:209
- ANIMATIONS:213
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:242
- OVERLAY BASE (summary, econ, bday, events):248
- SHARED OVERLAY HEADER:253
- SHARED BODY:274
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:323
- Vacaciones config:329
- Quitar festivos/vacaciones checkboxes:333
- Month summary breakdown:355
- Ausencia list tag:360

**Rangos por prefijo de clase:**
.action-btn:162-166 · .app-logo:63-63 · .app-version:126-126 · .bd-export:268-268 · .bottom-sheet:172-173 · .btn-icon:105-105 · .csv-export:78-79 · .data-actions:101-101 · .data-btn:102-117 · .data-menu:119-125 · .day-cell:140-246 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:74-83 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-upcoming:328-328 · .ev-week:324-325 · .excl-item:354-354 · .excl-row:334-334 · .full-overlay:249-250 · .header:59-61 · .header-brand:62-62 · .hour-chip:92-93 · .hour-chips:91-91 · .hour-picker:89-90 · .hours-chip:86-87 · .hours-chips:85-85 · .hours-control:73-73 · .hours-label:84-84 · .hours-panel:88-88 · .ico-doc:80-80 · .ico-exportar:269-269 · .month-nav:64-66 · .month-stat:95-98 · .month-summary:94-94 · .ms-breakdown:356-358 · .ms-hrs:100-100 · .ms-label:99-99 · .ms-num:96-96 · .ms-sep:359-359 · .nav-btn:67-68 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sw-upd:206-206 · .sy-back:255-256 · .sy-body:275-275 · .sy-card:286-293 · .sy-cards3:278-278 · .sy-cards4:279-279 · .sy-chart:304-304 · .sy-hdr:260-260 · .sy-header:254-259 · .sy-lbl:295-295 · .sy-list:308-361 · .sy-month:322-322 · .sy-nav:264-272 · .sy-note:305-307 · .sy-pdf:266-267 · .sy-puente:314-318 · .sy-section:276-277 · .sy-spain:280-285 · .sy-suelto:319-321 · .sy-table:296-300 · .sy-td:301-301 · .sy-tr:302-303 · .sy-val:291-294 · .sy-year:257-263 · .toast:192-211 · .toast-undo:208-208 · .today-btn:69-70 · .vac-config:330-332 · .week-actions:161-161 · .week-card:130-228 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

### css/source/economics.css  _(681 líneas)_

**Secciones:**

- ECONOMICS:1
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:6
- Summary sublabel (hours breakdown):23
- Ingresado box (formerly cobrado) — neutral:32
- ECONOMICS v2: tabs + nuevas secciones:66
- Estudio Cambio — grouped nav:83
- Estudio — tariff comparison cards:92
- Análisis hipoteca — secciones organizadas:113
- Mis gastos — budget table:130
- Year selector for per-year fiscal tabs:143
- §1.1 Tarifa dual:154
- §1.3 Stats por hora/día:166
- §1.4 Toggles:173
- §1.5 Declaración IRPF:178
- Tab 2: Comparador:191
- Calcular Tarifa (sim):219
- Scenario zones (Comparar Escenarios):237
- Análisis Ec. Personal:254
- Bloques de la Subrogación:256
- Fiscal config modal — purple theme override:299
- Fiscal config modal:301
- ECONOMICS v3: opt-buttons, cascade, gastos:327
- Cascade ingresos/gastos:334
- Media mensual: cards:344
- Tab 4: Análisis:354
- IRPF Breakdown visual:368
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:395
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):397
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):421
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:430
- Resumen fiscal al final de Ingresos y Gastos:432
- Donut chart:439
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):449
- Fiscal config: gastos items:456
- Fiscal: tab bar:468
- Fiscal: sticky save:473
- Fiscal: section title income/expense colors:475
- Fiscal: desgravaciones:485
- Fiscal: compras profesionales:512
- Desgravaciones: notas + tabla despacho info:520
- Nota IVA compras:540
- IVA por item en compras:542
- Fiscal: despacho en casa:549
- Hipoteca — resumen visual:572
- Hipoteca — compact 2-col grid:595
- Hipoteca — compact vinculaciones:603
- Hipoteca — read-only fields:614
- Hipoteca — edit/detail buttons:623
- Hipoteca — period summary card:629
- Multi-rate period cards:642
- Distribución de ingresos:658
- Comparador: reorder buttons:674
- Rate input styled:678

**Rangos por prefijo de clase:**
.ah-cuota:117-119 · .ah-donut:127-129 · .ah-section:114-116 · .ah-total:124-126 · .ah-vs:120-123 · .analisis-card:266-268 · .analisis-cards:255-255 · .analisis-hbar:269-274 · .analisis-input:284-287 · .analisis-ins:293-298 · .analisis-insurance:292-292 · .analisis-mortgage:275-291 · .econ-add:201-202 · .econ-ahorro:422-429 · .econ-annual:25-25 · .econ-avg:26-349 · .econ-bracket:184-190 · .econ-calc:332-333 · .econ-casc:336-343 · .econ-cascade:335-335 · .econ-chart:214-215 · .econ-comp:192-216 · .econ-decl:179-353 · .econ-distrib:659-673 · .econ-donut:440-455 · .econ-equiv:654-657 · .econ-fiscal:433-438 · .econ-formula:45-48 · .econ-gastos:355-367 · .econ-gear:151-152 · .econ-hdr:67-153 · .econ-ingresado:33-33 · .econ-irpf:369-431 · .econ-legend:217-218 · .econ-line:212-213 · .econ-month:50-63 · .econ-mr:651-652 · .econ-multi:643-653 · .econ-opt:328-331 · .econ-qcard:15-22 · .econ-qcell:11-14 · .econ-qm:20-20 · .econ-qmonth:18-19 · .econ-quarter:7-10 · .econ-rate:155-163 · .econ-row:34-44 · .econ-sc:194-680 · .econ-scenario:193-193 · .econ-section:64-64 · .econ-sim:220-230 · .econ-stats:167-172 · .econ-sub:70-82 · .econ-tab:68-69 · .econ-toggle:174-177 · .econ-val:49-49 · .est-btn:87-91 · .est-card:97-99 · .est-detail:94-94 · .est-field:106-112 · .est-fields:105-105 · .est-group:85-89 · .est-modo:100-100 · .est-nav:84-84 · .est-section:93-93 · .est-tariff:95-104 · .ev-sub:76-78 · .excl-item:165-165 · .excl-row:164-164 · .fiscal-add:321-484 · .fiscal-bracket:312-320 · .fiscal-compras:513-548 · .fiscal-copy:148-150 · .fiscal-custom:309-309 · .fiscal-ded:523-537 · .fiscal-desgrav:486-538 · .fiscal-despacho:550-571 · .fiscal-error:325-325 · .fiscal-gasto:457-519 · .fiscal-gastos:539-539 · .fiscal-hdr:469-469 · .fiscal-highlight:510-510 · .fiscal-onoff:552-553 · .fiscal-pct:310-319 · .fiscal-period:465-466 · .fiscal-radio:304-308 · .fiscal-save:323-324 · .fiscal-section:302-477 · .fiscal-sticky:474-474 · .fiscal-subsection:478-479 · .fiscal-tab:470-472 · .fiscal-viaje:480-481 · .fiscal-vinc:563-564 · .fiscal-year:144-147 · .hip-add:641-641 · .hip-auto:592-592 · .hip-bar:578-585 · .hip-cancel:628-628 · .hip-cf:597-602 · .hip-edit:624-626 · .hip-g2:596-596 · .hip-grid:590-590 · .hip-period:630-639 · .hip-resumen:573-577 · .hip-ro:615-622 · .hip-save:627-627 · .hip-section:591-640 · .hip-stat:587-589 · .hip-stats:586-586 · .hip-sub:594-594 · .hip-vinc:593-593 · .hip-vr:604-613 · .mg-budget:131-140 · .mg-cat:141-141 · .mg-desgrav:142-142 · .mg-sort:137-137 · .rate-input:4-4 · .rate-label:3-3 · .rate-row:2-2 · .rate-suffix:5-5 · .rut-sub:74-80 · .sim-combo:232-236 · .sim-field:221-222 · .sim-hr:231-231 · .sim-period:228-228 · .sim-target:223-227 · .sub-block:257-258 · .sub-row:259-265 · .sy-sublbl:24-24

### css/source/birthdays.css  _(121 líneas)_

**Secciones:**

- BIRTHDAYS:1
- El nombre admite hasta cuatro líneas.:14
- VIP controls bar:34
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:45
- VIP edit mode item states:48
- Feat 1: Buscador en lista por meses:58
- Upcoming birthdays:84
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:101

**Rangos por prefijo de clase:**
.bday-add:99-100 · .bday-badge:15-18 · .bday-buscar:61-63 · .bday-calendar:4-20 · .bday-cancel:46-47 · .bday-cell:8-102 · .bday-hdr:3-3 · .bday-header:21-30 · .bday-io:67-83 · .bday-list:33-57 · .bday-month:32-32 · .bday-num:12-12 · .bday-search:64-66 · .bday-upcoming:85-98 · .bday-vip:23-44 · .bday-week:5-7 · .data-btn:2-2 · .ev-cell:103-120 · .ev-io:69-69 · .io-peligro:74-82 · .io-primaria:73-80 · .sy-header:28-29 · .vip-no:41-42

### css/source/event-calendar.css  _(312 líneas)_

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
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:106
- Color picker avanzado (paleta 6×8 + color libre):115
- Detail color picker toggle:133
- Annual events calendar:139
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):169
- Selector de formas en el formulario de evento (Otros):181
- Selector de grosor de barra (grande | Otros):183
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):198
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:202
- Inicio/Fin bloqueados cuando hay Selección Multidía:205
- Mini-overlay para elegir días específicos (Otros):210
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:237
- Marcador "+" (más de 4 eventos puntuales en el mismo día):241
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:243
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:249
- Calendario 4 meses: 2 columnas × 2 filas:251
- Botón ir al calendario mensual en puentes del resumen:253
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:265
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:269
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:287
- Dropdown de vista anual:294
- Linea que separa los chips de eventos grandes de los puntuales:303

**Rangos por prefijo de clase:**
.dp-actions:233-234 · .dp-counter:220-221 · .dp-day:228-232 · .dp-days:227-227 · .dp-grid:222-222 · .dp-handle:215-215 · .dp-hdr:216-216 · .dp-mhdr:225-226 · .dp-mname:224-224 · .dp-month:223-223 · .dp-overlay:211-214 · .dp-sheet:213-213 · .dp-title:217-217 · .dp-yearnav:218-219 · .ev-ann:266-302 · .ev-annual:19-305 · .ev-barsize:184-193 · .ev-category:95-114 · .ev-chip:309-309 · .ev-color:108-132 · .ev-dates:206-208 · .ev-detail:134-138 · .ev-edit:257-263 · .ev-filter:304-311 · .ev-hora:23-23 · .ev-io:264-264 · .ev-management:178-178 · .ev-otros:182-182 · .ev-quad:252-252 · .ev-sep:46-46 · .ev-shape:194-201 · .ev-type:89-111 · .ev-up:8-21 · .ev-upcoming:6-45 · .ev-viaje:24-32 · .ev-wk:33-87 · .sy-body:51-51 · .sy-puente:2-255

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

### css/source/event-panels.css  _(226 líneas)_

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
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:140
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":145
- Quad label 3 lines:150
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:157
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:159
- Events list view:161
- Event form overlay (inside eventsOverlay):175
- Relleno, para que haga pareja con el naranja de "Editar evento":205
- Event detail:211
- El color del título depende de la familia; el símbolo conserva su identidad.:219

**Rangos por prefijo de clase:**
.data-btn:2-2 · .ev-ann:74-76 · .ev-annual:86-132 · .ev-badge:160-160 · .ev-badges:40-40 · .ev-bar:105-105 · .ev-bars:33-33 · .ev-bright:134-147 · .ev-btn:198-207 · .ev-car:55-67 · .ev-cell:118-156 · .ev-char:187-187 · .ev-checkbox:192-192 · .ev-chip:85-85 · .ev-colors:188-188 · .ev-date:189-189 · .ev-day:43-96 · .ev-detail:212-225 · .ev-edit:201-202 · .ev-field:181-182 · .ev-form:176-197 · .ev-hdr:3-5 · .ev-input:183-184 · .ev-io:209-210 · .ev-list:14-174 · .ev-main:6-6 · .ev-month:22-83 · .ev-multi:37-126 · .ev-num:158-158 · .ev-otros:53-101 · .ev-part:135-135 · .ev-puente:114-114 · .ev-quad:151-152 · .ev-repeat:193-193 · .ev-rut:92-95 · .ev-stepped:107-109 · .ev-textarea:185-186 · .ev-toggle:190-191 · .ev-types:17-19 · .ev-view:4-8 · .ev-wd:195-196 · .ev-week:28-112 · .ev-weekday:194-194 · .rut-marker:88-91 · .sy-nav:148-149

### css/source/dialogs-responsive.css  _(136 líneas)_

**Secciones:**

- LOGO POPUP:1
- Gallery:10
- BD ALARM VIP TOGGLE:19
- RESPONSIVE (mobile header):22
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:24
- ALARM PANEL:77
- Drum picker (selector giratorio de hora/minuto):83
- Confirmación alarma en el pasado:109
- Botón flotante "Listo" en modo Editar VIPs:115
- Controles inline long-press cumpleaños:118
- Selector de clase en el formulario:126
- Notas: general vs de un dia concreto:132

**Rangos por prefijo de clase:**
.alarm-cfg:78-79 · .alarm-colon:82-82 · .alarm-create:96-102 · .alarm-day:106-108 · .alarm-days:103-105 · .alarm-msg:92-93 · .alarm-panel:80-80 · .alarm-past:110-114 · .alarm-time:81-81 · .bd-alarm:20-21 · .bday-ic:120-124 · .bday-inline:119-119 · .bday-listo:116-116 · .btn-icon:31-67 · .data-actions:33-69 · .data-btn:29-65 · .drum-picker:85-88 · .drum-sel:91-91 · .drum-wrap:84-90 · .econ-qcell:26-28 · .econ-quarter:25-25 · .ev-daynote:134-134 · .ev-detail:135-135 · .ev-kind:127-131 · .ev-note:133-133 · .header:57-70 · .logo-gallery:11-18 · .logo-popup:2-9 · .nav-bar:34-74

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

### css/source/shared-refinements.css  _(446 líneas)_

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
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:162
- Text edits retain the solid orange; only standalone pencils use a tint.:171
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:178
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:245
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:260
- Cancelaciones sutiles: el calendario mensual conserva el color original.:270
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:282
- Titulo y estado separados para que "saltada" nunca quede tachado.:307
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:317
- El titulo queda dentro del borde de 1.5px de su caja continua.:322
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:328
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:344
- Una identidad de color por ventana para ambos juegos de iconos.:348
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:379
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:386
- Borde discreto para identificar semanas enviadas en ambos temas.:391
- Filtros junto al buscador sin ensanchar la ventana movil.:395
- Configuracion de tarifa: controles verdes y valores neutros.:408
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:426
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:443

**Rangos por prefijo de clase:**
.bday-hdr:163-164 · .bday-header:158-160 · .bday-jump:56-97 · .bday-month:176-176 · .bday-next:106-107 · .bday-sub:287-288 · .bday-upcoming:54-54 · .boda-catalog:83-91 · .boda-cfg:133-149 · .boda-config:79-130 · .boda-count:87-87 · .boda-date:151-169 · .boda-day:120-120 · .boda-field:121-126 · .boda-filter:59-61 · .boda-mini:67-67 · .boda-pack:88-89 · .boda-pfilters:58-62 · .boda-sticky:80-146 · .boda-teachers:108-108 · .data-actions:345-345 · .data-btn:346-357 · .econ-tab:329-333 · .econ-tariff:409-414 · .est-nav:331-332 · .ev-bday:289-290 · .ev-bright:445-445 · .ev-chip:73-73 · .ev-del:13-14 · .ev-filter:72-72 · .ev-list:2-428 · .ev-multi:50-74 · .ev-rut:246-313 · .ev-search:3-7 · .ev-sort:8-53 · .ev-type:430-432 · .ev-types:429-429 · .ev-up:273-273 · .ev-view:66-66 · .ev-wk:228-444 · .fiscal-hip:406-407 · .fiscal-tab:330-330 · .imp-mode:17-27 · .macro-url:70-70 · .nav-icon:365-375 · .nav-pro:339-351 · .nav-style:363-363 · .rate-input:46-46 · .rut-addition:208-225 · .rut-agenda:222-223 · .rut-cancelled:249-308 · .rut-history:192-243 · .rut-hpd:190-190 · .rut-icon:174-175 · .rut-recovery:217-226 · .rut-session:227-227 · .rut-skipped:309-310 · .rut-week:191-191 · .selected:372-372 · .settings-details:109-111 · .settings-edit:71-112 · .settings-menu:441-441 · .sy-back:37-37 · .sy-body:35-35 · .sy-card:41-41 · .sy-header:36-36 · .sy-lbl:40-40 · .sy-period:415-422 · .sy-table:42-42 · .sy-tr:43-43 · .sy-val:39-39 · .sy-year:38-38 · .week-card:392-392 · .wm-logo:94-253

### css/source/home-sharing.css  _(114 líneas)_

**Secciones:**

- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:1
- Selector de eventos para compartir por iCalendar:26
- Selector de exportación: controles compactos y lista con espacio propio.:27
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:64
- Compartir: cabecera centrada, categorías completas y lista compacta.:82

**Rangos por prefijo de clase:**
.boda-future:79-79 · .energy-contract:106-107 · .energy-field:109-110 · .energy-history:104-105 · .energy-price:108-113 · .energy-sheet:103-103 · .energy-tax:111-111 · .ev-cal:30-102 · .ev-field:78-78 · .ev-share:28-29 · .ev-week:65-80 · .ev-wk:3-3 · .header:2-2 · .home-reminder:59-61 · .home-submission:4-15 · .home-summary:16-24 · .month-summary:18-19

### css/source/energy-refinements.css  _(211 líneas)_

**Secciones:**

- Facturas: mismos componentes que los contratos, cifras sin desbordar.:1
- Estudio energético: controles compactos y separación entre apartados.:11
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:14
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:30
- Solo energía reparte el espacio entre textos, con ancho de contenido.:42
- Identidad propia de cada pestaña, sin alterar el sistema general.:45
- Filtros y filas de parejas: controles compactos, columnas alineadas.:98
- Navegación: la misma geometría en Home y en las ventanas.:151
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:162
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:180

**Rangos por prefijo de clase:**
.boda-asg:106-111 · .boda-det:102-105 · .boda-last:15-19 · .data-actions:152-153 · .energy-bar:88-88 · .energy-caption:2-2 · .energy-choice:12-12 · .energy-compare:146-146 · .energy-contract:4-5 · .energy-cost:84-148 · .energy-coverage:75-75 · .energy-extremes:71-71 · .energy-fee:40-41 · .energy-field:7-7 · .energy-fields:9-9 · .energy-info:60-62 · .energy-inline:81-81 · .energy-legend:89-89 · .energy-metric:138-140 · .energy-metrics:137-137 · .energy-overview:64-66 · .energy-period:67-69 · .energy-price:194-199 · .energy-range:90-90 · .energy-reconciliation:74-74 · .energy-scenario:147-147 · .energy-section:59-59 · .energy-supplier:72-141 · .energy-table:3-3 · .energy-tabs:43-54 · .energy-tariff:77-195 · .energy-tax:70-144 · .energy-vat:142-142 · .energy-window:31-136 · .energy-year:6-96 · .ev-annual:100-132 · .ev-btn:159-159 · .ev-filter:99-124 · .ev-io:149-149 · .ev-main:177-178 · .ev-upcoming:186-188 · .ev-wk:16-25 · .home-popup:18-28 · .imp-mode:113-113 · .imp-preview:114-118 · .nav-bar:154-154 · .rut-bulk:205-210 · .rut-card:171-176 · .rut-day:160-166 · .rut-days:163-163 · .rut-dpick:158-158 · .rut-history:201-204 · .rut-hora:167-169 · .rut-month:209-209 · .rut-recovery:157-157 · .rut-routine:173-173 · .rut-session:156-156 · .rut-time:170-170 · .rut-weekdays:164-164 · .sy-body:184-184

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

### css/personal-periods.css  _(31 líneas)_

**Secciones:**

- Partidas simples y por tramos: misma fila y misma jerarquía visual.:1

**Rangos por prefijo de clase:**
.fiscal-year:20-20 · .personal-amount:8-11 · .personal-average:15-15 · .personal-fold:21-22 · .personal-frequency:29-29 · .personal-gear:5-5 · .personal-item:3-19 · .personal-period:14-30

