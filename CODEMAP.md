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

### js/birthdays-bind.js  _(342 líneas)_
**Funciones:** bindBdayFormEvents:1 · openBday:49 · closeBday:53 · refreshBday:54 · applyBdaySearch:58 · bindBdayEvents:93 (!205) · updateListOffset:99 · _bdResetScroll:139 · _bdScrollToToday:141 · bindBdayUpcoming:298 · bdayPanelHost:338

### js/birthdays-groups.js  _(95 líneas)_
**Estado global:** BDAY_GROUP_DEFAULTS:2 · BDAY_GROUP_FILTER:3 · BDAY_EDIT_GROUP:4 · BDAY_GROUP_PENDING:5 · BDAY_SHOW_GROUPS:6

**Funciones:** bdayNormalizeGroup:7 · bdayGroups:14 · bdayGroupCatalog:15 · bdayGroupHue:17 · bdayGroupTags:18 · bdayGroupMatch:19 · bdayGroupChips:20 · renderBdayGroupTools:21 · bdayGroupFilterLabel:29 · renderBdayGroupPickerFields:30 · renderBdayGroupFields:31 · renderBdayPersonGroups:32 · bindBdayCategoryButton:33 · openBdayCategoryPicker:37 · close:38 · bdayReadGroupFields:45 · updateBdayGroupStatus:46 · bindBdayGroupTools:57 · bdaySaveGroupDraft:64 · cancelBdayGroupEdit:70 · openBdayGroupEdit:71 · close:72 · bindBdayGroupEdit:81 · toggleBdayGroupPerson:89

### js/birthdays-panels.js  _(370 líneas)_
**Funciones:** bdaySwitchPanel:1 · renderBdayNameVip:6 · updateBdayNameVip:7 · renderBdayVipToggle:8 · renderBdayDetail:9 · renderBdayAlarmPanel:27 · fmtDate:39 · openBdayAlarm:94 · back:99 · _bdRefreshBoth:103 · closeBdayAlarm:107 · bindBdayAlarmEvents:109 (!149) · fmtD:228 · onOk:235 · onErr:236 · renderBdayForm:258 · openBdayDetail:285 · savePerson:289 · closeBdayDetail:305 · openBdayForm:308 · back:309 · closeBdayForm:318 · deleteBdayPerson:322 · persist:325 · bindBdayDateFields:328 · update:330 · openBdayDatePicker:342 · close:343 · index:359 · mark:360 · select:361

### js/birthdays-render.js  _(247 líneas)_
**Estado global:** DN7:95

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:5 (!88) · getBdaysInRange:10 · bdayLabel:25 · renderGroup:34 · renderBdayCalMonth:93 · renderBdayList:133 · getEffVip:141 · renderBdayAddButton:189 · renderBdayContent:192

### js/birthdays.js  _(169 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_CAL_VIP:7 · BDAY_EDIT:8 · BDAY_SEARCH:9 · BDAY_LIST_TOP:10 · BDAY_UP_VIP:11 · BDAY_FILTER_VIP:12 · BDAY_EDIT_VIP:13 · BDAY_VIP_PENDING:14 · BDAY_ALARM_SET_KEY:68 · BDAY_ALARM_SET:69 · BDAY_ALARM_COUNT_KEY:70 · BDAY_ALARM_COUNT:71 · BDAY_PALETTE:75 · BDAYS:79

**Funciones:** _showBdayInlineCtrl:20 · tc:88 · bdName:89 · getBdayColor:91 · getBdaysOn:100 · daysUntil:102 · bdayCanSetAlarm:110 · hasUpcomingBday:116 · updateBdayBtn:122 · getBdayAlarmKey:132 · isBdayAlarmSet:133 · setBdayAlarmState:137 · syncVipBdaysToEvents:144

### js/bodas-assign.js  _(475 líneas)_
**Estado global:** DN2:180 · BODA_ASSIGN:225

**Funciones:** bodaOpenSheet:1 · bodaCloseSheet:4 · bodaCreatedAt:10 · bodaIssues:15 · _renderBodaIssueCards:31 · card:34 · openBodaIssue:55 (!81) · findEv:97 · closeBodaIssue:136 · _bodaWeekKey:139 · _renderBodaStats:146 (!80) · openBodaAssign:226 · closeBodaAssign:245 · renderBodaAssign:249 · renderBodaAssignHtml:253 (!81) · bindBodaAssign:334 · openBodaPlacePicker:405 · closeBodaPlacePicker:438 · bodaAplicarCampo:442 · bodaTrasElegir:452 · bodaEndAt:464

### js/bodas-bind.js  _(303 líneas)_
**Estado global:** BODA_RENDER_CLASSES:298

**Funciones:** renderBodaCoupleForm:1 · openBodaCoupleForm:30 · closeBodaCoupleForm:69 · bodaRefreshRow:73 · bindBodasEvents:102 (!185) · _guardaPendientes:107 · _bodaCalMove:118 · selectDay:133 · findClass:222 · bodaMatchesDate:287 · bodaMatchesClasses:293 · renderBodasBody:299

### js/bodas-class-form.js  _(335 líneas)_
**Estado global:** BODA_FORM:1 · BODA_TIME_H:212

**Funciones:** openBodaClaseForm:2 · _bodaFormRender:22 (!138) · closeBodaClaseForm:160 · openBodaCouplePicker:167 · row:178 · apply:195 · closeBodaCouplePicker:209 · openBodaTimePicker:215 (!84) · drum:224 · setDrum:247 · mark:255 · drumVal:259 · readManual:279 · closeBodaTimePicker:299 · openBodaDurationPicker:303 · close:308 · bodaTeachersLabel:313 · openBodaTeachersPicker:316 · close:322

### js/bodas-config.js  _(168 líneas)_
**Estado global:** BODA_CONFIG_SK:2 · BODA_CONFIG:3

**Funciones:** bodaLoadConfig:4 · bodaApplyConfig:15 · saveBodaConfig:24 · validateBodaConfig:25 · importBodaConfig:42 · bodaPackOf:58 · bodaDuration:59 · bodaDefaultDuration:60 · bodaDurationOf:61 · bodaConfigUsed:62 · bodaSetCatalogItem:66 · bodaDeleteCatalogItem:75 · bodaTaken:80 · bodaPackStats:85 · bodaTeacherName:97 · bodaTeacherCount:98 · bodaTeacherStats:99 · renderBodaPackStats:105 · renderBodaConfig:117 · openBodaConfig:136 · bindBodaConfig:137 · openBodaCatalogForm:146

### js/bodas.js  _(657 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:25 · BODA_PLACE_DEFAULT:31 · BODA_PLACE_NONE:34 · BODA_PLACE_SHORT:35 · BODA_PLACE_DESC:36 · BODA_PLACE_EMOJI:38 · BODA_WHITE:55 · BODA_SLOTS:56 · BODA_NO_TIME_COLOR:62 · BODA_NO_COUPLE_COLOR:63 · BODA_DEFAULT_TIME:64 · BODA_PALETTE:67 · BODA_CLOSED_SK:235 · BODA_CLOSED:236 · BODA_PENDING:255 · BODA_SUBTAB:297 · BODA_CLASS_MODE:298 · BODA_CLASES_SEARCH:299 · BODA_HIDE_PAST:300 · BODA_HIDE_CLOSED:301 · BODA_CARD_OPEN:302 · BODA_PAREJAS_SEARCH:303 · BODA_PAREJAS_SORT:306 · BODA_PAREJAS_CLASSES:307 · BODA_PAREJAS_FILTER:308 · BODA_CAL_DAY:309 · BODA_CAL_HL:310 · BODA_CAL_YEAR:311 · BODA_CAL_MONTH:312

**Funciones:** saveBodas:18 · bodaPlaceEmoji:39 · bodaPlaceOf:43 · bodaPlaceLabel:48 · bodaNextColor:69 · bodaCouple:77 · bodaSlot:81 · bodaSlotColors:91 · bodaMarkFor:96 · evBodaSvg:102 · bodaClasses:119 · bodaPrimeraClase:123 · bodaClassesOfCouple:127 · bodaEsUltimoEnsayo:131 · bodaUltimoEnsayoHtml:137 · bodaFreeClasses:140 · bodaClaseById:143 · bodaSortClasses:147 · bodaClassesOnDay:154 · bodaNewClass:157 · bodaNormalizeClasses:172 · bodaPlaceForNewOn:209 · bodaDayFull:214 · bodaBulkCreate:218 · bodaProgress:229 · saveBodaClosed:240 · bodaIsClosed:241 · bodaReopenDay:242 · bodaToggleClosed:246 · bodaPendingCount:256 · bodaEff:258 · bodaSetPending:267 · bodaPendingApply:271 · bodaPendingDiscard:294 · _bodaLegendHtml:315 · _renderBodaCalendario:326 (!88) · _renderBodasBody:414 · _bodaCmpFecha:444 · _renderBodaParejas:450 (!91) · _bodaFmt:541 · _bodaFmtCorto:542 · _renderBodaClases:549 (!108)

### js/core.js  _(826 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:115 · THEME_STORAGE_KEY:118 · THEME:119 · THEME_LABELS:125 · THEME_META:126 · THEME_SEQUENCE:127 · ECON_YEAR_CONFIG:151 · MN_SHORT:153 · DN5:468 · FESTIVOS_ANIO:692 · NAV_SWITCH_TIMER:808

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:25 · startedInPanel:38 · addLongPress:80 · start:84 · move:98 · end:101 · applyTheme:128 · cycleTheme:135 · updateThemeBtn:140 · load:158 · save:170 · loadEconYear:175 · saveEconYear:194 · fakeTrans:204 · simpleBarChart:221 · hBarRows:245 · shareOrDownload:262 · fallback:269 · download:270 · renderDocumentIcon:300 · menuTitle:302 · escHtml:308 · mkey:313 · getMonthH:314 · defH:320 · dayH:321 · dayT:322 · dk:323 · fd:324 · ad:325 · fh:326 · fhP:327 · isToday:328 · isPast:329 · wn:330 · weeks:333 · homeSubmissionStatus:347 · renderHomeSubmissionStatus:352 · getWD:361 · _toastReset:377 · _toastBindSwipe:387 · end:412 · showToast:430 · sendEmail:457 · buildMailtoBody:467 · render:489 · buildHomeCalendar:504 (!89) · fmtH:570 · openSheet:593 · closeSheet:612 · selectType:618 · contarVacaciones:651 · confirmarCupoVacaciones:664 · contarFestivos:680 · confirmarCupoFestivos:693 · togSent:702 · _panelBorrarLuego:723 · _panelCancelarBorrado:734 · abrirPanel:736 · engancharFondo:756 · abrirUnaVez:774 · cerrarPanel:780 · renderNavBar:791 · bindNavBar:798 · navigateMain:809 · open:820

### js/csv-sync.js  _(40 líneas)_
**Estado global:** CSV_EXPORT_KEY:2 · CSV_WARNED:3

**Funciones:** csvYearContent:4 · csvExportRecords:15 · csvRecordExport:18 · csvPendingWarnings:23 · csvCheckChanges:32

### js/data-integrity.js  _(192 líneas)_
**Estado global:** STORAGE_ERROR:2 · MAIL_CFG_SK:138

**Funciones:** fail:5 · validIsoDate:21 · validateImport:25 (!105) · visit:27 · hour:87 · days:88 · schedule:89 · validBirthday:130 · prepareImportRelations:131 · loadMailConfig:139 · saveMailConfig:142 · birthdayValidation:145 · rutLimitExceeded:150 · legacy:181

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(570 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:33 · ESTUDIO_HIP_CALC:34 · ESTUDIO_GAS_SCENARIOS:228 · ESTUDIO_GAS_CALC:229 · ESTUDIO_GAS_IVA:230 · ESTUDIO_ELECT_SCENARIOS:318 · ESTUDIO_ELECT_CALC:319 · ESTUDIO_ELECT_IVA:320 · ESTUDIO_ELECT_TAX:321

**Funciones:** renderEconEstudio:6 · _defaultVinc:29 · _defaultHipAlt:30 · _renderEstudioHipotecaComp:36 (!95) · bindEconEstudioEvents:131 · _estudioReRender:144 · _bindEstudioHipoteca:149 · _readEstHipAltAt:199 · _readEstHipVincAt:210 · _calcGasCost:232 · _currentGasTariff:233 · _renderEstudioGasComp:241 · _renderGasCompCard:288 · _calcElectCost:323 · _currentElectTariff:324 · _renderEstudioElectComp:329 · _renderMultiScenarioResult:332 · _bindEstudioGas:400 · _bindEstudioElect:431 · _bindScenarios:433 · _readScenarios:452 · _bindCompFields:461 · _saveCompFields:496 · renderEstudioContent:512 · openEstudio:526 · closeEstudio:536 · reRenderEstudio:541 · bindEstudioEvents:549

### js/economics-fiscal-bind.js  _(580 líneas)_
**Funciones:** openFiscal:9 · closeFiscal:27 · reRenderFiscal:33 · bindFiscalEvents:44 · _switchTab:48 · _bindYearSelector:82 · _bindTabPersonal:120 · updateField:168 · _bindTabIrpf:183 · _bindTabGastosDesg:228 (!91) · _rebindComprasDel:277 · _bindTabIrpfDeduc:319 · _bindTabDesgrav:332 (!96) · _bindList:334 · _bindTabDespachoOnly:428 (!87) · _syncLiveD:443 · _updateFmt:481 · _saveFiscalAll:515 · _rv:544

### js/economics-fiscal-datos.js  _(346 líneas)_
**Estado global:** FISCAL_SK:10 · DEFAULT_BRACKETS:16 · FISCAL:23 · FISCAL_TAB:26 · FISCAL_IRPF_SUB:27 · FISCAL_YEAR:28 · HOUSEHOLD_TAB_KEY:30 · FISCAL_ENTRY:31 · FISCAL_HIP_SUB:33 · FISCAL_HIP_EDITING:35 · FISCAL_HIP_EDIT_SNAPSHOT:36 · FISCAL_HIP_DETAIL_TARGET:37 · PERSONAL_SK:43 · PERSONAL_DATA:44 · PERSONAL_SAVED:45 · DEFAULT_PERSONAL_GASTOS_REC:48 · DEFAULT_PERSONAL_INVERSIONES:54 · INGRESOS_SK:101 · INGRESOS_ITEMS:102 · GASTOS_SK:119 · GASTOS_DIFICIL_PCT:120 · DEFAULT_GASTOS:121 · GASTOS_ITEMS:139 · COMPRAS_SK:201 · COMPRAS_IVA_ENABLED:202 · DEFAULT_COMPRAS:203 · COMPRAS_ITEMS:209 · DESGRAV_SK:256 · DESGRAV_DEFAULT:258 · DESGRAV_ITEMS:278 · OBSOLETE_IDS:281

**Funciones:** householdTab:32 · setHouseholdTab:34 · _yearKey:40 · personalHasChanges:46 · _ensureDefaults:61 · loadPersonalYear:77 · savePersonalYear:94 · loadIngresos:103 · saveIngresos:106 · findIngreso:109 · ingresoAnual:113 · loadFiscal:141 · saveFiscal:149 · getIrpfPct:152 · getBrackets:153 · _loadGastosFromRaw:155 · loadGastosYear:173 · loadGastos:186 · saveGastosYear:187 · findGasto:190 · gastoAnual:194 · loadCompras:210 · saveCompras:227 · comprasTotal:231 · comprasIvaTotal:241 · loadDesgrav:280 · saveDesgrav:311 · desgravAnual:314 · computeTotalDesgrav:335

### js/economics-fiscal-elect.js  _(217 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:111

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:60 · _despField:76 · _despFieldMoney:85 · _renderIngresosDesgList:98 · _renderGastoItem:117 · renderGastosList:132 · _bindElectDetalle:154 · _bindSegurosNormales:201

### js/economics-fiscal-gas.js  _(106 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:69

### js/economics-fiscal-hip.js  _(862 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipROvinc:364 · _calcInsOvercost:374 · _renderInlineOvercost:385 · _renderHipResumen:404 · _renderHipDetalle:407 · _renderHipSectionContent:433 · _renderCompraSection:445 · _hipRateDetail:474 · fmt:477 · _renderPrestamoSection:484 · _renderSubSection:530 · renderFiscalTabDespacho:600 · _bindTabDespacho:618 · _bindHipResumen:645 · _bindHipAnalysis:661 · _bindHipDetalle:671 · _rerenderSection:742 · _readSectionInputs:751 · _rv:752 · _rv_s:753 · _bindEditingSection:811

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

### js/economics.js  _(690 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_TARIFF_OPEN:10 · ECON_RATE_PERIODS:11 · ECON_ESTUDIO_SUB:15 · ESTUDIO_YEAR:16

**Funciones:** computeSalaryNet:24 · fc:42 · fcPlain:47 · _rateForDate:57 · _buildDatePeriods:72 · computeEconEx:86 · econBarChart:145 · _fmtDateEs:173 · _prevDate:178 · _ensureDatePeriods:185 · _renderRateInputs:202 · _econCard:219 · _econCards7:225 · f:227 · _getMultiRateOpts:242 · renderEconResumen:246 (!194) · renderEconContent:440 · openEcon:465 · closeEcon:482 · reRenderEcon:487 · bindEconEvents:499 · bindEconResumenEvents:537 (!153)

### js/electricity-comparator-inputs.js  _(113 líneas)_
**Estado global:** ELECTRIC_COMPARISON_COLORS:2 · ELECTRIC_COMPARISON_COLLAPSED:3

**Funciones:** electricComparisonTaxes:4 · electricComparisonApplied:8 · electricInputValue:12 · electricFixedDay:18 · electricInputField:19 · electricUsageYear:23 · electricInitialScenarios:28 · electricWeightWarning:33 · electricFoldCard:39 · electricUsageYears:45 · bindElectricComparisonCard:50 · validate:52 · save:57 · bindElectricityComparison:89 · refresh:93

### js/electricity-comparator.js  _(85 líneas)_
**Funciones:** energyHistoricalTariffs:2 · electricComparisonTariff:9 · electricHistoricalCopy:16 · electricModesHtml:24 · electricTariffFieldsHtml:28 · electricComparisonCard:46 · electricConsumptionScenariosHtml:55 · electricUsageYearsHtml:63 · renderElectricityComparison:69 · _renderElectricityComparison:72

### js/energy-analysis-bind.js  _(61 líneas)_
**Funciones:** bindEnergyAnalysis:2 · refresh:5 · year:8 · tab:11 · energyBindSwipe:32 · cancel:57

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

### js/events-bind.js  _(634 líneas)_
**Funciones:** _switchEvView:6 · openEvents:24 · closeEvents:34 · openEventsAt:41 · refreshEvents:48 · bindEvYearHeader:69 · setYear:73 · bindEvEvents:86 · _bindEvNav:95 (!202) · _scrollWeekToMonth:104 · _scrollWeekToToday:151 · doScroll:161 · _bindEvCal:297 (!93) · evLayoutWeekTitles:390 · _bindEvWeekTitleBackground:412 · update:418 · schedule:419 · evFilterCategories:424 · evFilterCategoryFor:433 · evListFilterLabel:434 · evListFilterMatches:442 · evToggleListFilter:448 · openEvTypeFilter:460 · isSelected:462 · option:463 · close:472 · paint:475 · _bindEvListas:479 (!122) · apply:589 · _bindEvGestos:601 · _evSwipeUpcoming:614 · _evSwipeBodas:621 · _evSwipeRutinas:628

### js/events-cal.js  _(374 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!167) · _renderEvMonthCard:181 (!161) · _renderEvAnnual:342 · _renderEvQuad:351 · renderEvCalMonth:371 · renderEvAnnual:372 · renderEvQuad:373

### js/events-calendar-export.js  _(230 líneas)_
**Estado global:** EV_CAL_EXPORT:3 · EV_ICS_KEY:4 · EV_ICS_UPPER_KEY:5 · EV_ICS_NOTES_KEY:6 · EV_ICS_AUTHOR_KEY:7

**Funciones:** evIcsAuthor:8 · evIcsDescription:9 · evIcsText:14 · evIcsFold:17 · evIcsNextDay:26 · evIcsCandidates:27 · evIcsFile:47 · evIcsRecords:74 · evIcsMergeRecords:77 · evIcsRoutineRows:83 · evIcsRoutineCurrent:93 · evIcsRememberedRows:97 · evIcsPrepare:114 · evIcsExportRows:131 · evIcsExportStatus:134 · evIcsFilterRows:140 · renderEvCalendarExport:145 · openEvCalendarExport:160 · close:163 · find:166 · count:167 · filters:176 · list:182 · dates:198

### js/events-carousel.js  _(60 líneas)_
**Funciones:** bindEvCarouselDrag:2 · preview:6 · position:15 · clear:20 · finish:24

### js/events-detail.js  _(646 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · evDetailTitleColor:40 · evDetailAlarmDate:49 · renderEvDetail:63 (!142) · fd2:67 · _fila:160 · evDayCarItems:205 · evCarGo:218 · _evCarShow:226 · openEvDayCarousel:234 · closeEvDayCarousel:242 · openEvDetail:249 (!155) · repaintRoutine:283 · repintar:300 · closeEvDetail:404 · renderEvAlarmPanel:407 (!95) · fd2:409 · openEvAlarm:502 · closeEvAlarm:508 · openBdayAlarmFromEvents:516 · bindEvAlarmEvents:521 (!125) · _syncPre:559 · fmtD:589

### js/events-form-controls.js  _(88 líneas)_
**Funciones:** _evFormEl:2 · _evFormAll:3 · _evFormKind:4 · _evFormColor:5 · _evFormSuggestTitle:9 · _evFormTypeUI:14 · _bindEvFormTypes:22 · _bindEvFormCategories:40 · _evFormShapePreviews:55 · _bindEvFormAppearance:58 · _evFormTravelUI:75 · _bindEvFormDetails:81

### js/events-form-save.js  _(114 líneas)_
**Funciones:** _evFormRead:2 · _evFormReadDetails:29 · _evFormSaveBodas:52 · _evFormCommit:80 · _evFormDelete:96 · _bindEvFormActions:107

### js/events-form-schedule.js  _(71 líneas)_
**Funciones:** evFormLegacyDays:2 · evFormDateLabel:5 · evFormScheduleControl:6 · renderEvFormLead:9 · renderEvKindSymbols:22 · _evFormUpdateHeading:30 · _evFormScheduleState:34 · bindEvFormSchedule:56 · bindEvFormMultiday:62

### js/events-form.js  _(214 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · _renderEvTypeButton:29 · evAdmiteRepeticion:47 · renderEvForm:48 (!121) · openEvForm:169 · closeEvForm:192 · evSuggestedTitle:200 · bindEvFormEvents:204

### js/events-management.js  _(33 líneas)_
**Funciones:** evPaymentCoinsSvg:1 · evTaxBuildingSvg:2 · evUtilityHomeSvg:3 · evManagementShapeInner:5 · evManagementCheckable:18 · evManagementDate:19 · evManagementDone:20 · evManagementCheckHtml:21 · bindEvManagementCheck:26

### js/events-order.js  _(80 líneas)_
**Estado global:** EV_PLAN_ORDER_KEY:2 · EV_PLAN_ORDER_DRAFT:3 · EV_PLAN_ORDER_CACHE:4 · EV_PLAN_ORDER_STOP:5

**Funciones:** renderEvPlanOrderButton:6 · evPlanOrderDefaults:7 · validateEvPlanOrder:11 · evPlanOrderData:16 · evPlanReferenceTime:24 · evCompareOrder:27 · evPlanOrderPosition:37 · minutes:38 · closeEvPlanOrder:48 · evPlanOrderReorder:49 · openEvPlanOrder:59 · renderEvPlanOrder:60

### js/events-picker-color.js  _(373 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_MANAGEMENT_SUBTYPES:42 · EV_PLAN_SUBTYPES:43 · EV_KINDS:47 · EV_TYPE_COLORS:52 · EV_FREE_COLOR:100 · EV_FREE_SHAPE:101 · EV_OTHER_FIXED_COLORS:103 · EV_FREE_DATES:107 · EV_BAR_SIZES:110 · EV_FREE_BARSIZE:111 · EV_DOT_SOLID:115 · EV_SHAPE_BW:142

**Funciones:** evIsManagement:44 · evIsPlan:45 · evFixedSymbol:46 · evOtherShapeColor:104 · evBarSize:116 · evBarSizeCls:122 · evTypeKey:123 · evTypeColor:124 · getEvKind:127 · evPlanShapeInner:143 · evShapeSvg:164 (!87) · evMorePlusSvg:251 · evTravelColor:260 · getEvType:266 · isEvBarAlways:278 · getEvDisplayColor:280 · _renderColorPicker:302 · _bindColorPicker:325 · updatePreview:335

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:12

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:13 · _count:14 · _render:15 · _attach:56 · _rerender:87 · _close:93

### js/events-plan-picker.js  _(87 líneas)_
**Estado global:** EV_PLAN_PICK:2 · EV_QUICK_PLANS:3 · EV_PICKER_GROUPS:4 · EV_CULTURE_OPTIONS:75

**Funciones:** evPickerHas:8 · evPickerMoreIcon:9 · evQuickSelection:10 · renderEvQuickPlans:13 · updateEvQuickPlan:20 · evFormRenderTypes:25 · renderEvPlanOptions:32 · closeEvPlanPicker:39 · evPlanPickerKey:45 · openEvPlanPicker:48 · renderEvCultureFields:76 · bindEvCultureFields:80

### js/events-render.js  _(652 líneas)_
**Estado global:** EV_LIST_TYPES:223

**Funciones:** renderEvListItem:11 · fd2:15 · evUpcomingCompare:44 · renderEvUpcoming:47 (!177) · fd2:54 · renderEvItem:55 · renderEvPanel:106 · occurrenceKey:133 · evListInYear:224 · renderEvByTypes:239 · coincide:259 · renderEvMonthsView:304 · _evWeekLanes:315 · assign:318 · evWeekTravelRow:333 · renderEvWeek:353 (!133) · hexA:357 · renderEvYearHeader:486 · renderEvContent:496 (!156)

### js/events-routines.js  _(63 líneas)_
**Funciones:** evActiveRoutines:2 · evRoutineChoice:6 · renderEvRoutineChoices:9 · bindEvRoutineChoices:13 · choose:14 · close:21 · rutPlanFixedSession:27 · openEvRoutineSession:46 · week:49

### js/events-statistics.js  _(57 líneas)_
**Estado global:** EV_STATS_YEAR:2 · EV_STATS_LAST_YEAR:3 · EV_STATS_PERIOD:4

**Funciones:** evStatsGroup:5 · computeEventStatistics:9 · count:31 · renderEventStatistics:35 · bindEventStatistics:51

### js/events-tax-model.js  _(28 líneas)_
**Estado global:** EV_TAX_MODELS:2

**Funciones:** evTaxTitle:3 · renderEvTaxFields:4 · evFormTaxCode:8 · bindEvTaxFields:9 · change:11 · close:18

### js/events.js  _(822 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_LIST_YEAR:8 · EV_LIST_LAST_YEAR:9 · EV_VIEW_STATE:13 · EV_SCROLL_RESET:18 · EV_VIEW:19 · EV_EDIT:20 · EV_EDIT_DS:21 · EV_FORM_CONTAINER:22 · EV_EDIT_MODE:23 · EV_BRIGHT_PAST:24 · EV_ANNUAL_VIEW:25 · EV_ANNUAL_FILTER_HIDDEN:26 · EV_FILTER_GROUPS:35 · EV_FILTER_SHORT:41 · EV_FILTER_COLOR:43 · EV_FILTER_SEP_AFTER:46 · EV_FILTER_CYCLE:47 · EV_PREV_VIEW:65 · EV_QUAD_YEAR:66 · EV_QUAD_MONTH:67 · EV_TO_SUBTAB:68 · EV_TYPES_FILTER:69 · EV_TYPES_PAST:70 · EV_LIST_SORT:71 · EV_LIST_SEARCH:72 · EV_COLORS:73 · EVENTS:74 · EV_ALARM_SK:103 · EV_ALARMS_SET:104 · EV_NO_RUT:196 · EV_MAX_BAR_DIA:252 · EV_MARK_ORDER:358 · EV_MAX_PUNT_DIA:400 · EV_MAX_RUT_DIA:401 · EV_CAL_CORNER_STACK:404 · EV_MAX_VIP_DIA:406 · EV_CAL_VIP_MAX:407 · EV_UP_SHOW_RUT:409 · EV_UP_SHOW_BODA:410 · EV_BAR_Z:462 · EV_COMPARTE_DIA:466 · EV_MNS:673 · EV_CAR:716 · EV_TRANSPORTES:735 · EV_TRANS_EMOJI:741 · EV_DATE_INDEX:808

**Funciones:** evCycleFilters:48 · evFilterGroup:54 · saveEvents:98 · loadEvAlarms:105 · saveEvAlarms:106 · _findBdayByEvId:107 · isEvAlarmSet:119 · setEvAlarmState:125 · evDk:132 · _evClampDate:141 · eventOccursOn:145 · getEventsOn:189 · evSignature:204 · evMergeIncoming:214 · evMergeMsg:239 · _fmtDayEs:251 · evBarLimitExceeded:253 · evDayLimitExceeded:263 · rutDayCount:299 · hasUpcomingEvent:306 · updateEventsBtn:315 · evDefaultShape:329 · evMarkerHtml:337 · evMorePlusHtml:352 · evMarkPriority:359 · evBodaMinutes:367 · evSortMarks:378 · ev0:379 · evAnnualXsHtml:411 · vipStarSvgHtml:421 · vipIconHtml:430 · evIsoDate:436 · _isVipBdayTooFar:437 · evUpcomingMarkHtml:444 · _evRowOcc:463 · evComparteDia:467 · _evSoloSeRozan:472 · _evTrozosSeRozan:483 · _evAssignRow:491 · _evMarcarMitades:505 · _evMitadesStyle:520 · evBarZ:527 · _evBarSegments:531 · _evBarBand:555 · _evBarSegmentStyle:561 · _evBarExtent:566 · _evRoundedOutline:577 · near:586 · _evBarMutedColor:605 · _evBarPast:610 · _evSteppedBar:622 · _evAnnualCtx:676 · visible:677 · _evLoadPuentes:695 · _evScheduleRemove:723 · _evCancelRemove:724 · evStartTime:743 · evCompareTime:749 · evEndTime:750 · evTimeLabel:757 · evTramos:764 · evTramoTexto:775 · evMinutosDe:782 · _positionEvBright:792 · withEventDateIndex:809

### js/export-files.js  _(91 líneas)_
**Estado global:** EXPORT_DIRECTORY:3 · EXPORT_DIRECTORY_LABEL:4 · EXPORT_DIRECTORY_READY:5 · EXPORT_NAME_LAST:6

**Funciones:** exportFileName:7 · exportDirectoryStore:15 · initExportDirectory:32 · openExportDirectory:52 · close:54 · status:60 · load:61 · renderExportActionIcon:75 · openExportChoice:79 · close:80 · location:85

### js/home-popup.js  _(121 líneas)_
**Estado global:** HOME_BIRTHDAYS_OPEN:2

**Funciones:** homeReminderColor:3 · homeReminderEventText:4 · homeReminderNoteHtml:8 · homeReminderEvents:12 · homeReminderTasksHtml:36 · homeReminderItemsHtml:43 · endGroup:45 · closeHomePopup:64 · openHomePopup:68

### js/household-summary.js  _(92 líneas)_
**Funciones:** householdMortgagePayment:2 · householdMortgagePeriod:5 · householdValue:18 · householdMortgageCard:19 · date:20 · householdUtilityPrices:35 · householdUtilityCard:67 · householdMortgageAnalysisButton:79 · renderHouseholdSummary:80

### js/household.js  _(39 líneas)_
**Estado global:** HOUSEHOLD_RETURN:3

**Funciones:** householdHost:4 · renderHouseholdContent:5 · openHousehold:8 · closeHousehold:21 · reRenderHousehold:28 · bindHousehold:33 · move:36

### js/import-export.js  _(536 líneas)_
**Funciones:** _lsJson:239 · askImportMode:246 · close:260 · _mergeMap:274 · _mergeList:285 · _sigEvent:295 · _sigCouple:297 · _sigAlarm:298 · _sigGasto:299 · _keyId:301 · _keyBday:302 · _keyGasto:303 · _exportPerYearKeys:309 (!84) · _applyFullImport:393 (!143)

### js/import-preview.js  _(19 líneas)_
**Funciones:** renderImportPreview:2 · add:4

### js/init.js  _(453 líneas)_
**Estado global:** DRUM_ITEM_H:133 · DN_ES:288

**Funciones:** _updateHeaderActive:31 · buildDrumPicker:134 · updateDrumSelected:166 · getDrumValue:171 · checkDrumMinuteWrap:177 · buildAlarmDayBtns:207 · showAlarmPastConfirm:233 · createHeaderAlarm:254 · proceed:274 · aplicarActualizacion:377 · reload:383 · _showUpdateBar:405 · _buscar:440

### js/invoices-export.js  _(36 líneas)_
**Funciones:** invoiceXml:2 · invoiceZip:3 · header:5 · invoiceWorkbook:14 · textCell:15 · numCell:16 · sheet:26

### js/invoices-kairo.js  _(75 líneas)_
**Estado global:** INVOICE_KAIRO_BUSY:2

**Funciones:** invoiceKairoUrl:3 · invoiceKairoState:9 · invoiceKairoSection:12 · invoiceKairoExchange:24 · finish:27 · receive:28 · bindInvoiceKairo:44

### js/invoices-ui.js  _(129 líneas)_
**Funciones:** invoicePanel:2 · invoiceField:8 · openInvoiceSettings:9 · invoiceSummary:32 · money:33 · number:34 · invoiceDaysSummary:42 · invoicePrivacyButton:58 · invoiceManualSection:62 · invoiceTools:71 · error:97 · bindPrivacy:100 · openHoursExport:108 · initInvoices:113 · bindInvoiceConfigImport:118 · readFields:119

### js/invoices.js  _(115 líneas)_
**Estado global:** INVOICE_KEY:2 · INVOICE_MONTH:3 · INVOICE_BACK:4 · INVOICE_OPEN_SEQ:5 · INVOICE_HIDE_AMOUNTS:6

**Funciones:** invoiceDefaults:7 · invoiceData:8 · invoiceValidate:9 · invoiceSave:30 · invoiceMerge:31 · invoiceDecimal:36 · invoiceMoney:40 · invoiceLabel:41 · invoiceText:42 · invoiceDayRows:43 · invoiceCalculate:55 · invoiceEmails:80 · invoiceGmailUrl:81 · invoiceFinalBlob:95 · invoiceConfigImport:98 · invoiceIban:108

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/nav-icons.js  _(70 líneas)_
**Estado global:** NAV_ICON_STYLE:2 · NAV_MAIN_ITEMS:4 · NAV_ICON_PATHS:11

**Funciones:** navIconHtml:20 · applyNavIconStyle:26 · openNavIconPicker:33 · closeNavIconPicker:55 · bindNavIconStyle:56 · initMainNavigation:62 · bdaySymbolHtml:67

### js/personal-cards.js  _(66 líneas)_
**Estado global:** PERSONAL_CARDS_KEY:3 · PERSONAL_CARDS_OPEN:4

**Funciones:** loadPersonalCards:5 · personalCardKey:8 · personalCardOpen:9 · setPersonalCardOpen:10 · savePersonalCards:14 · personalAdvancedCards:15 · personalCardsAllOpen:23 · togglePersonalCards:27 · renderPersonalCardsToggle:32 · renderPersonalPeriods:36 · renderPersonalCard:41 · syncPersonalSave:62

### js/personal-periods-editor.js  _(55 líneas)_
**Estado global:** PERSONAL_PERIOD_EDIT:2

**Funciones:** renderPersonalPeriodEditor:3 · openPersonalPeriodEditor:16 · closePersonalPeriodEditor:20 · paintPersonalPeriodEditor:23 · error:26 · readFields:27 · valid:33

### js/personal-periods.js  _(57 líneas)_
**Estado global:** PERSONAL_SECTIONS:2

**Funciones:** personalDay:3 · personalDate:4 · personalFactor:5 · personalPeriods:6 · personalAnnual:10 · personalValidatePeriods:18 · personalValidateData:28 · personalPauseFrom:38 · personalCopyYear:45 · personalPeriodLabel:56

### js/rutinas-addition.js  _(55 líneas)_
**Funciones:** closeRutAddition:3 · rutAdditionPanel:4 · openRutAddition:10 · rutAdditionPickWeek:21 · rutAdditionPickSession:26 · rutAdditionForm:38

### js/rutinas-bulk.js  _(61 líneas)_
**Funciones:** rutBulkChange:3 · rutOffsetDate:11 · rutPauseAfter:12 · rutHistorySelectionHtml:19 · bindRutHistorySelection:25 · openRutBulkConfirm:37 · close:49

### js/rutinas-flex.js  _(145 líneas)_
**Estado global:** RUT_PLAN:2

**Funciones:** rutFlexible:3 · rutFlexEarliest:4 · rutFlexTarget:5 · rutFlexRange:9 · rutFlexCount:15 · rutFlexStatus:18 · rutFlexWarnings:25 · rutFlexSummary:31 · rutFlexOptionsHtml:36 · bindRutFlexOptions:51 · paint:53 · rutFlexRead:71 · rutFlexSetSession:90 · renderRutPlan:108 · openRutPlan:131 · closeRutPlan:132 · refreshRutPlan:133 · mutate:140

### js/rutinas-form.js  _(239 líneas)_
**Funciones:** rutSetupLocked:3 · rutFormCandidate:11 · rutReadForm:41 · renderRutForm:75 · openRutForm:142 (!96) · _rutRepaintIcons:149 · _rutPintaHoras:174 · closeRutForm:238

### js/rutinas-history.js  _(178 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · rutHistoryMonthGroups:41 · renderRutHistorySession:47 · renderRutHistory:59 · rutHistoryScrollToday:82 · openRutHistory:87 · closeRutHistory:113 · rutSessionOriginal:114 · rutSessionMoved:123 · rutEditSession:127 · openRutHistoryEdit:147 · close:160

### js/rutinas-icons.js  _(95 líneas)_
**Estado global:** RUT_ICONS:7 · RUT_APPEARANCE_KEY:8 · RUT_GYM_COLOR:9 · RUT_FIXED_COLOR:10 · RUT_ICON_LABEL:13

**Funciones:** rutDisplayColor:11 · rutColorOf:12 · _rutIconShapes:14 · _rutIconDetails:37 · rutIconOf:56 · _rutIconRawSvg:66 · setRutGymColor:83 · evActivitySvg:90 · rutIconSvg:94

### js/rutinas-recovery.js  _(64 líneas)_
**Estado global:** RUT_RECOVERY_PICK:3

**Funciones:** rutUnrecoveredSessions:4 · openRutRecoveryList:9 · openRutRecoveryDay:26 · render:33 · select:44 · move:48 · rutReadOnlyDayHtml:54

### js/rutinas-sessions.js  _(132 líneas)_
**Funciones:** rutSessionsOn:3 · rutSessionByKey:9 · rutRecoveryFor:14 · rutSessionTag:15 · rutRecoveryNote:20 · rutRecoveryHtml:24 · rutDoneCandidate:30 · rutChangeFromDetail:40 · apply:42 · close:48 · rutValidateAddition:55 · rutAddSession:60 · rutValidateExtraSessions:81 · rutSaveSessionChange:97 · rutDeleteSession:104 · openRutSessionDelete:118 · close:125

### js/rutinas.js  _(612 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_SUBTAB:266 · RUT_WEEK_SEL:399 · RUT_WEEK_CAL:400

**Funciones:** saveRutinas:25 · rutMarkerHtml:39 · rutMarkerGroups:47 · rutDayMarkersHtml:54 · rutById:59 · rutWeekKey:64 · rutTimeOfDay:73 · rutTieneHorarios:78 · rutScheduleOn:86 · rutScheduleCopy:91 · rutDurationOn:95 · rutChangeFrom:100 · rutChangeWeek:124 · update:128 · rutWeekCfg:140 · rutSuspendedOn:151 · rutDiaLleno:161 · rutOccursOn:165 · rutIsSkipped:176 · rutToggleSkip:177 · rutFin:197 · rutEventsOn:205 · rutEventFromId:222 · rutSessions:231 · rutStats:245 · rutProximas:259 · renderRutinasBody:269 · _rutTimeRange:282 · _renderRutSchedule:286 · _renderRutLista:300 · _rutFmt:339 · _rutFmtCorto:340 · _renderRutStats:346 · openRutWeek:401 · _rutWeekPick:410 · back:435 · rutDayTimesHtml:466 · _rutWeekRender:469 (!95) · paintTimes:506 · closeRutWeek:564 · openRutSesion:567 · closeRutSesion:571 · bindRutinasEvents:574

### js/settings-menu.js  _(108 líneas)_
**Estado global:** SETTINGS_MENU_ANCHOR:3 · SETTINGS_MENU_BACK:4 · SETTINGS_EDITOR_MODES:5

**Funciones:** closeSettingsMenu:6 · positionSettingsMenu:15 · _positionHeaderMenu:19 · toggleSettingsMenu:27 · settingsEditorActions:37 · settingsPanelHtml:40 · bindSettingsEditor:43 · setEditing:47 · settingsCopyIcon:66 · bindSettingsCopy:71 · openConnectionsSettings:79 · close:81 · initSettingsMenu:94

### js/settings-personal.js  _(155 líneas)_
**Estado global:** CONTACT_DATA_KEY:2 · PERSONAL_NOTES_KEY:3 · HAIRDRESSER_NOTES_KEY:4 · PERSONAL_NOTES_TAB:5 · CONTACT_LIMIT:6 · CONTACT_FIELDS:7 · CONTACT_GROUPS:8

**Funciones:** normalizeContactData:14 · text:16 · validateContactData:29 · string:31 · mergeContactData:39 · signature:44 · contactData:50 · personalNote:51 · hairdresserNote:52 · contactValueText:53 · contactFieldHtml:56 · renderContactGroups:59 · readContactFields:72 · contactSelectionText:77 · contactPrimaryIndex:85 · contactResizeFields:86 · bindContactGroups:87 · update:88 · openPersonalData:100 · close:102 · selection:108 · openPersonalNotes:131 · close:134 · selectTab:140

### js/summary.js  _(613 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · VAC_YEAR_KEY:16 · VAC_BY_YEAR:17 · SPAIN_AVG:258 · DN7S:282

**Funciones:** vacEntitlementForYear:18 · saveVacEntitlement:21 · fhY:27 · fdY:28 · computeYearlySummary:30 · barChart3:104 · computePuentes:131 · isNWD:141 · typeOf:142 · renderSummaryWorkBody:175 (!101) · fmtSigned:263 · renderSummaryPuentesBody:276 (!94) · fdd:283 · renderSummaryTimeOffBody:370 (!92) · fdd:376 · bindSummaryWorkBodyEvents:462 · bindSummaryPuentesBodyEvents:472 · bindSummaryTimeOffBodyEvents:497 · renderSummaryContent:503 · closeSummary:524 · bindSummaryEvents:530 (!83)

### js/swipe-content.js  _(42 líneas)_
**Estado global:** SWIPE_PREVIEW_STYLES:2 · SWIPE_PREVIEW_SHEET:3 · SWIPE_CONTENT_GAP:5 · SWIPE_FIXED_SELECTOR:7

**Funciones:** swipeContentDistance:6 · swipePreviewRoot:8 · swipeContentResolver:18 · fixed:24 · content:25 · resolve:32 · swipeContentReset:34 · animateContentSwipe:35

### js/swipe-layout.js  _(49 líneas)_
**Funciones:** swipeLayoutClone:2 · swipeLayoutMerge:14 · swipeLayoutViewport:23 · swipeLayoutFrame:33

### js/swipe-live.js  _(50 líneas)_
**Funciones:** swipeCommonRoot:2 · createLiveSwipe:5 · pauseMotion:9 · hide:14 · reveal:15 · clear:20 · prepare:24 · move:28 · finish:33

### js/swipe-render.js  _(73 líneas)_
**Funciones:** swipeWithState:2 · swipeMonth:9 · swipeNext:10 · swipeFrame:11 · swipeKeepsPreviewScroll:12 · swipeCalendarPreview:17 · swipeEventsPreview:25 · swipeRenderPreview:41

### js/tasks-drag.js  _(71 líneas)_
**Estado global:** TASKS_DRAG_CANCEL:2

**Funciones:** tasksStopDrag:3 · bindListReorder:4 · focus:6 · announce:7 · rows:18 · cleanup:19 · cancel:23 · key:24 · place:25 · tick:35 · move:40 · end:52 · finish:59 · bindTasksReorder:68

### js/tasks-events.js  _(63 líneas)_
**Funciones:** tasksEventMatches:3 · tasksEventId:6 · tasksEventRow:11 · tasksEventMonthReminder:14 · tasksEventLimit:15 · tasksEventVisible:21 · tasksReconcileEvents:26 · tasksSetEventDone:51 · tasksRebindEventRefs:59

### js/tasks-float.js  _(80 líneas)_
**Estado global:** TASKS_FAB_HIDDEN_KEY:3 · TASKS_FAB_HIDDEN:4 · TASKS_FLOAT:5

**Funciones:** tasksFloatPosition:6 · tasksDock:17 · tasksUpdateFab:20 · initTasks:27 · end:49 · resize:61 · tasksSetAccessHidden:71 · tasksRestoreAccess:72 · bindTasksRestoreGesture:73 · distance:75

### js/tasks-view.js  _(131 líneas)_
**Estado global:** TASKS_VIEW:2 · TASKS_ICON:3

**Funciones:** renderTasks:4 · tasksDateLabel:20 · renderTasksList:24 · renderTaskRow:38 · openTasks:55 · closeTasks:63 · tasksKeydown:70 · renderTasksPanel:80 · tasksPerform:98 · tasksRowAction:102 · tasksFocusRow:124 · renderTaskColors:128

### js/tasks.js  _(102 líneas)_
**Estado global:** TASKS_KEY:3 · TASKS_COLORS:4

**Funciones:** tasksValidate:5 · tasksValidTimestamp:20 · tasksNormalize:21 · tasksData:33 · tasksSave:38 · tasksMigrate:39 · tasksMerge:44 · tasksItems:50 · tasksPendingRows:54 · tasksNeedsDateChoice:55 · tasksCreate:58 · tasksChange:63 · tasksMoveCompleted:80 · tasksUndoMove:85 · tasksMove:90 · tasksReminder:97 · tasksReminderSeen:101

### js/time-picker.js  _(145 líneas)_
**Funciones:** timePickerInitial:2 · markPickerDrum:8 · timePickerDrum:16 · bindMinuteDrumMotion:22 · finish:27 · position:35 · coast:39 · release:62 · bindTimePickerDrum:73 · index:75 · mark:76 · move:80 · openTimePicker:90 · close:101 · escape:107 · save:116

## CSS

> `css/styles.css` se genera: editar las fuentes listadas a continuación.

### css/source/base.css  _(332 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:20
- El tema crema tiene sus propios tokens en theme-cream.css.:39
- HEADER:43
- JORNADA DEFECTO:53
- Barra vertical que separa la campana del bloque de navegacion:90
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:96
- WEEK CARDS:109
- WEEK ACTIONS:141
- BOTTOM SHEET (day type selector):150
- TOAST:172
- Tema claro: el fondo oscuro con letra de color no se leia bien:182
- SW UPDATE BUTTON (en menú ⋯):186
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:190
- ANIMATIONS:194
- Las semanas se desplazan con el mes, sin otra entrada vertical.:196
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:219
- OVERLAY BASE (summary, econ, bday, events):225
- SHARED OVERLAY HEADER:230
- SHARED BODY:244
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:293
- Vacaciones config:299
- Quitar festivos/vacaciones checkboxes:303
- Month summary breakdown:325
- Ausencia list tag:330

**Rangos por prefijo de clase:**
.action-btn:143-147 · .app-logo:48-48 · .app-version:107-107 · .bd-export:241-241 · .bottom-sheet:153-154 · .btn-icon:86-86 · .csv-export:59-60 · .data-actions:82-82 · .data-btn:83-98 · .data-menu:100-106 · .day-cell:121-223 · .day-date:126-126 · .day-hours:127-127 · .day-name:125-125 · .day-status:134-134 · .days-grid:120-120 · .default-hours:55-64 · .ev-dot:139-139 · .ev-dots:138-138 · .ev-upcoming:298-298 · .ev-week:294-295 · .excl-item:324-324 · .excl-row:304-304 · .full-overlay:226-227 · .header:44-46 · .header-brand:47-47 · .hour-chip:73-74 · .hour-chips:72-72 · .hour-picker:70-71 · .hours-chip:67-68 · .hours-chips:66-66 · .hours-control:54-54 · .hours-label:65-65 · .hours-panel:69-69 · .ico-doc:61-61 · .ico-exportar:242-242 · .month-nav:49-51 · .month-stat:76-79 · .month-summary:75-75 · .ms-breakdown:326-328 · .ms-hrs:81-81 · .ms-label:80-80 · .ms-num:77-77 · .ms-sep:329-329 · .option-desc:169-169 · .option-dot:162-166 · .option-hours:170-170 · .option-info:167-167 · .option-label:168-168 · .overlay:151-152 · .sent-badge:117-117 · .sheet-handle:155-155 · .sheet-option:159-161 · .sheet-options:158-158 · .sheet-subtitle:157-157 · .sheet-title:156-156 · .sw-upd:187-187 · .sy-body:245-245 · .sy-card:256-263 · .sy-cards3:248-248 · .sy-cards4:249-249 · .sy-chart:274-274 · .sy-hdr:235-235 · .sy-header:231-234 · .sy-lbl:265-265 · .sy-list:278-331 · .sy-month:292-292 · .sy-note:275-277 · .sy-pdf:239-240 · .sy-puente:284-288 · .sy-section:246-247 · .sy-spain:250-255 · .sy-suelto:289-291 · .sy-table:266-270 · .sy-td:271-271 · .sy-tr:272-273 · .sy-val:261-264 · .sy-year:232-238 · .toast:173-192 · .toast-undo:189-189 · .vac-config:300-302 · .week-actions:142-142 · .week-card:111-205 · .week-header:114-114 · .week-info:115-116 · .week-total:118-118 · .weeks-container:110-110

### css/source/navigation-controls.css  _(33 líneas)_

**Secciones:**

- Variantes compactas de las flechas del cuatrimestre.:15
- Hoy: base y acentos de cada consumidor, con la especificidad existente.:23

**Rangos por prefijo de clase:**
.bday-today:32-32 · .ev-agenda:28-28 · .ev-calendar:30-30 · .fiscal-year:20-21 · .nav-btn:12-13 · .sy-back:4-8 · .sy-nav:9-17 · .today-btn:24-25

### css/source/economics.css  _(679 líneas)_

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
- §1.1 Tarifa dual:152
- §1.3 Stats por hora/día:164
- §1.4 Toggles:171
- §1.5 Declaración IRPF:176
- Tab 2: Comparador:189
- Calcular Tarifa (sim):217
- Scenario zones (Comparar Escenarios):235
- Análisis Ec. Personal:252
- Bloques de la Subrogación:254
- Fiscal config modal — purple theme override:297
- Fiscal config modal:299
- ECONOMICS v3: opt-buttons, cascade, gastos:325
- Cascade ingresos/gastos:332
- Media mensual: cards:342
- Tab 4: Análisis:352
- IRPF Breakdown visual:366
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:393
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):395
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):419
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:428
- Resumen fiscal al final de Ingresos y Gastos:430
- Donut chart:437
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):447
- Fiscal config: gastos items:454
- Fiscal: tab bar:466
- Fiscal: sticky save:471
- Fiscal: section title income/expense colors:473
- Fiscal: desgravaciones:483
- Fiscal: compras profesionales:510
- Desgravaciones: notas + tabla despacho info:518
- Nota IVA compras:538
- IVA por item en compras:540
- Fiscal: despacho en casa:547
- Hipoteca — resumen visual:570
- Hipoteca — compact 2-col grid:593
- Hipoteca — compact vinculaciones:601
- Hipoteca — read-only fields:612
- Hipoteca — edit/detail buttons:621
- Hipoteca — period summary card:627
- Multi-rate period cards:640
- Distribución de ingresos:656
- Comparador: reorder buttons:672
- Rate input styled:676

**Rangos por prefijo de clase:**
.ah-cuota:117-119 · .ah-donut:127-129 · .ah-section:114-116 · .ah-total:124-126 · .ah-vs:120-123 · .analisis-card:264-266 · .analisis-cards:253-253 · .analisis-hbar:267-272 · .analisis-input:282-285 · .analisis-ins:291-296 · .analisis-insurance:290-290 · .analisis-mortgage:273-289 · .econ-add:199-200 · .econ-ahorro:420-427 · .econ-annual:25-25 · .econ-avg:26-347 · .econ-bracket:182-188 · .econ-calc:330-331 · .econ-casc:334-341 · .econ-cascade:333-333 · .econ-chart:212-213 · .econ-comp:190-214 · .econ-decl:177-351 · .econ-distrib:657-671 · .econ-donut:438-453 · .econ-equiv:652-655 · .econ-fiscal:431-436 · .econ-formula:45-48 · .econ-gastos:353-365 · .econ-gear:149-150 · .econ-hdr:67-151 · .econ-ingresado:33-33 · .econ-irpf:367-429 · .econ-legend:215-216 · .econ-line:210-211 · .econ-month:50-63 · .econ-mr:649-650 · .econ-multi:641-651 · .econ-opt:326-329 · .econ-qcard:15-22 · .econ-qcell:11-14 · .econ-qm:20-20 · .econ-qmonth:18-19 · .econ-quarter:7-10 · .econ-rate:153-161 · .econ-row:34-44 · .econ-sc:192-678 · .econ-scenario:191-191 · .econ-section:64-64 · .econ-sim:218-228 · .econ-stats:165-170 · .econ-sub:70-82 · .econ-tab:68-69 · .econ-toggle:172-175 · .econ-val:49-49 · .est-btn:87-91 · .est-card:97-99 · .est-detail:94-94 · .est-field:106-112 · .est-fields:105-105 · .est-group:85-89 · .est-modo:100-100 · .est-nav:84-84 · .est-section:93-93 · .est-tariff:95-104 · .ev-sub:76-78 · .excl-item:163-163 · .excl-row:162-162 · .fiscal-add:319-482 · .fiscal-bracket:310-318 · .fiscal-compras:511-546 · .fiscal-copy:146-148 · .fiscal-custom:307-307 · .fiscal-ded:521-535 · .fiscal-desgrav:484-536 · .fiscal-despacho:548-569 · .fiscal-error:323-323 · .fiscal-gasto:455-517 · .fiscal-gastos:537-537 · .fiscal-hdr:467-467 · .fiscal-highlight:508-508 · .fiscal-onoff:550-551 · .fiscal-pct:308-317 · .fiscal-period:463-464 · .fiscal-radio:302-306 · .fiscal-save:321-322 · .fiscal-section:300-475 · .fiscal-sticky:472-472 · .fiscal-subsection:476-477 · .fiscal-tab:468-470 · .fiscal-viaje:478-479 · .fiscal-vinc:561-562 · .fiscal-year:144-145 · .hip-add:639-639 · .hip-auto:590-590 · .hip-bar:576-583 · .hip-cancel:626-626 · .hip-cf:595-600 · .hip-edit:622-624 · .hip-g2:594-594 · .hip-grid:588-588 · .hip-period:628-637 · .hip-resumen:571-575 · .hip-ro:613-620 · .hip-save:625-625 · .hip-section:589-638 · .hip-stat:585-587 · .hip-stats:584-584 · .hip-sub:592-592 · .hip-vinc:591-591 · .hip-vr:602-611 · .mg-budget:131-140 · .mg-cat:141-141 · .mg-desgrav:142-142 · .mg-sort:137-137 · .rate-input:4-4 · .rate-label:3-3 · .rate-row:2-2 · .rate-suffix:5-5 · .rut-sub:74-80 · .sim-combo:230-234 · .sim-field:219-220 · .sim-hr:229-229 · .sim-period:226-226 · .sim-target:221-225 · .sub-block:255-256 · .sub-row:257-263 · .sy-sublbl:24-24

### css/source/birthdays.css  _(153 líneas)_

**Secciones:**

- BIRTHDAYS:1
- El nombre admite hasta cuatro líneas.:17
- Misma posición en las tres vistas; compactar solo el botón.:32
- VIP controls bar:37
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:48
- VIP edit mode item states:51
- Feat 1: Buscador en lista por meses:61
- Upcoming birthdays:87
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:104
- Categorías de personas y filtros de consulta.:125

**Rangos por prefijo de clase:**
.bd-detail:149-149 · .bday-add:102-103 · .bday-alarm:152-152 · .bday-badge:18-21 · .bday-buscar:64-66 · .bday-calendar:7-23 · .bday-cancel:49-50 · .bday-cell:11-105 · .bday-detail:141-141 · .bday-filter:145-147 · .bday-group:126-148 · .bday-hdr:6-6 · .bday-header:24-33 · .bday-io:70-86 · .bday-list:36-60 · .bday-month:35-35 · .bday-num:15-15 · .bday-person:144-144 · .bday-search:67-69 · .bday-symbol:2-2 · .bday-upcoming:3-101 · .bday-vip:26-47 · .bday-week:8-10 · .data-btn:5-5 · .ev-btn:4-4 · .ev-cell:106-123 · .ev-io:72-72 · .io-peligro:77-85 · .io-primaria:76-83 · .vip-no:44-45

### css/source/event-calendar.css  _(386 líneas)_

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
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:238
- Marcador "+" (más de 4 eventos puntuales en el mismo día):242
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:244
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:250
- Calendario 4 meses: 2 columnas × 2 filas:252
- Botón ir al calendario mensual en puentes del resumen:254
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:266
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:270
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:288
- Dropdown de vista anual:295
- Linea que separa los chips de eventos grandes de los puntuales:304
- Planes: cuatro accesos y cuadrícula ampliada con confirmación fija.:329
- La selección pertenece al grupo; el símbolo conserva su color propio.:361
- Selección rápida visible sin alterar los colores de cada símbolo.:381

**Rangos por prefijo de clase:**
.dp-actions:234-235 · .dp-counter:221-222 · .dp-day:229-233 · .dp-days:228-228 · .dp-grid:223-223 · .dp-handle:216-216 · .dp-hdr:217-217 · .dp-mhdr:226-227 · .dp-mname:225-225 · .dp-month:224-224 · .dp-overlay:211-215 · .dp-sheet:213-214 · .dp-title:218-218 · .dp-yearnav:219-220 · .ev-ann:267-303 · .ev-annual:19-325 · .ev-barsize:184-193 · .ev-category:95-114 · .ev-chip:311-311 · .ev-color:108-132 · .ev-dates:206-208 · .ev-detail:134-334 · .ev-edit:258-264 · .ev-filter:305-326 · .ev-hora:23-23 · .ev-io:265-265 · .ev-management:178-359 · .ev-otros:182-182 · .ev-picker:357-357 · .ev-plan:330-363 · .ev-quad:253-253 · .ev-quick:365-379 · .ev-sep:46-46 · .ev-shape:194-201 · .ev-tax:372-384 · .ev-type:89-383 · .ev-up:8-21 · .ev-upcoming:6-45 · .ev-viaje:24-32 · .ev-wk:33-87 · .sy-body:51-51 · .sy-puente:2-256

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

### css/source/event-panels.css  _(383 líneas)_

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
- El aspecto base precede a .ev-btn; la geometría final va después de su base.:63
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:70
- Conservar espacio cuando la pila está llena.:79
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):82
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):117
- Perímetro puente: capa inferior a eventos:119
- Bright past: bombilla override:139
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:146
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":151
- Quad label 3 lines:154
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:161
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:163
- Events list view:165
- Event form overlay (inside eventsOverlay):179
- Flechas de carrusel: mantener el padding, fuente y borde heredados de .ev-btn.:203
- Relleno, para que haga pareja con el naranja de "Editar evento":211
- Event detail:217
- El color del título depende de la familia; el símbolo conserva su identidad.:225
- Fichas de consulta: jerarquía común, datos legibles y controles discretos.:233
- Consulta compacta: fecha y estado comparten fila; el carrusel no cambia de alto.:271
- Formulario de evento: marco fijo, texto a la izquierda y agenda a la derecha.:308
- Solo el contenido de la ficha acompaña el dedo.:340
- Las etiquetas comparten la línea de Título/Notas; solo el dato ocupa la tarjeta.:350

**Rangos por prefijo de clase:**
.data-btn:2-2 · .ev-ann:75-77 · .ev-annual:116-138 · .ev-badge:164-164 · .ev-badges:40-40 · .ev-bar:111-111 · .ev-bars:33-33 · .ev-bright:140-153 · .ev-btn:202-213 · .ev-car:55-359 · .ev-category:354-357 · .ev-cell:124-160 · .ev-char:191-191 · .ev-checkbox:196-196 · .ev-chip:92-92 · .ev-colors:192-192 · .ev-date:193-193 · .ev-day:43-102 · .ev-delete:360-360 · .ev-detail:218-363 · .ev-edit:207-208 · .ev-event:310-316 · .ev-field:185-186 · .ev-form:180-338 · .ev-hdr:3-5 · .ev-input:187-188 · .ev-io:215-216 · .ev-kind:358-358 · .ev-list:14-178 · .ev-main:6-6 · .ev-management:253-255 · .ev-month:22-90 · .ev-multi:37-132 · .ev-num:162-162 · .ev-otros:53-107 · .ev-part:141-141 · .ev-puente:120-120 · .ev-quad:155-156 · .ev-repeat:197-197 · .ev-routine:362-362 · .ev-rut:98-365 · .ev-schedule:331-353 · .ev-stepped:113-115 · .ev-textarea:189-190 · .ev-toggle:194-195 · .ev-types:17-19 · .ev-view:4-8 · .ev-wd:199-200 · .ev-week:28-118 · .ev-weekday:198-198 · .rut-marker:94-97 · .rut-week:370-372 · .rut-wpick:373-377 · .swipe-content:368-368 · .sy-body:367-367

### css/source/dialogs-responsive.css  _(159 líneas)_

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
.alarm-cfg:78-79 · .alarm-colon:82-82 · .alarm-create:96-102 · .alarm-day:106-108 · .alarm-days:103-105 · .alarm-msg:92-93 · .alarm-nap:146-147 · .alarm-panel:80-80 · .alarm-past:110-114 · .alarm-time:81-81 · .bd-alarm:20-21 · .bday-ic:120-124 · .bday-inline:119-119 · .bday-listo:116-116 · .btn-icon:31-67 · .data-actions:33-69 · .data-btn:29-65 · .drum-picker:85-88 · .drum-sel:91-91 · .drum-wrap:84-90 · .econ-qcell:26-28 · .econ-quarter:25-25 · .ev-daynote:134-134 · .ev-detail:135-136 · .ev-kind:127-156 · .ev-note:133-133 · .header:57-70 · .logo-gallery:11-18 · .logo-popup:2-9 · .nav-bar:34-74 · .time-picker:137-145

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

### css/source/routines.css  _(98 líneas)_

**Secciones:**

- Horario distinto segun el dia:1
- Selector de icono de rutina:6
- Editor semanal: controles comunes, opciones legibles y marco estable.:62

**Rangos por prefijo de clase:**
.ev-shape:19-19 · .rut-add:45-45 · .rut-card:35-43 · .rut-day:51-52 · .rut-days:50-50 · .rut-dot:38-38 · .rut-first:16-16 · .rut-flex:13-21 · .rut-hist:57-60 · .rut-hpd:2-5 · .rut-icon:7-11 · .rut-name:39-39 · .rut-pct:44-44 · .rut-plan:22-34 · .rut-sec:12-12 · .rut-stat:54-56 · .rut-sug:46-49 · .rut-susp:53-53 · .rut-tag:40-41 · .rut-vacio:42-42 · .rut-week:64-95

### css/source/shared-refinements.css  _(1053 líneas)_

**Secciones:**

- Lista "Todos": buscador, orden y borrado con pulsacion larga:1
- Diálogo: modo de importación (añadir vs reemplazar):16
- PRINT:29
- Separacion de siluetas incluso entre grosores distintos.:49
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:63
- Editar: tono comun, con geometria propia de cada pantalla.:73
- Marca oficial con transparencia; conserva contraste en ambos temas.:90
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:110
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:128
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
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:341
- Una identidad de color por ventana para ambos juegos de iconos.:345
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:376
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:384
- Borde discreto para identificar semanas enviadas en ambos temas.:389
- Filtros junto al buscador sin ensanchar la ventana movil.:393
- Configuracion de tarifa: controles verdes y valores neutros.:407
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:425
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:442
- Controles de plegado compartidos: superficie, foco y chevrón dibujado.:445
- Recordatorios: cabecera siempre visible y contenido independiente.:482
- Los controles de cumpleaños heredan el tema de la vista que los aloja.:501
- Calendario mensual: malla tranquila; conserva la geometría de eventos y puentes.:513
- La cabecera sigue su mes; hoy comparte el acento de cumpleaños.:551
- Lista de cumpleaños: etiquetas opcionales y acceso a hoy junto al mes.:563
- Controles compactos y paneles estables: solo se desplaza su contenido.:590
- Buscador y filtro comparten fila; las opciones conservan todo el ancho.:633
- Ficha compacta, acciones compartidas y fecha sin controles nativos.:677
- Cumpleaños: jerarquía por espacios y edición junto a cada campo.:711
- Todas las personas de hoy comparten acento; solo la primera lleva la línea.:734
- Separadores discretos con aire y alarma dentro de su propia sección.:740
- Ficha de cumpleaños: paneles como en Próximos, sin separadores sueltos.:749
- Controles de cumpleaños: aire en los bordes y símbolos sin alterar las filas.:775
- Cumpleaños: resumen abierto y paneles blancos con acento suave.:786
- Fichas ajustadas a su contenido y acciones con tonos suaves.:801
- Lista de cumpleaños: controles compactos y edición por etiqueta.:856
- Todos: búsqueda y categoría a ancho completo, ordenación segmentada.:865
- Centro geométrico del panel: ambos extremos reservan el mismo ancho.:885
- Configuración personal: grupos de registros con edición explícita.:936
- Filtros: contorno de identidad, nunca relleno gris al seleccionar.:952
- Próximos: el selector de cumpleaños conserva su posición al alternar.:962
- Estadísticas: período explícito y días únicos.:968
- v457: selección de categoría separada de su desplegable.:1004
- Mantener la misma composición de texto antes, durante y después del swipe.:1017
- Navegación cuadrada, calendarios y accesos de consulta (v481).:1023
- Conservar fuentes y controles a su tamaño habitual, también en móviles estrechos.:1027

**Rangos por prefijo de clase:**
.alarm-now:1049-1049 · .alarm-panel:1046-1048 · .app-update:728-730 · .bd-detail:650-651 · .bd-panel:604-886 · .bday-category:576-745 · .bday-date:685-784 · .bday-detail:618-861 · .bday-edit:860-860 · .bday-filter:567-642 · .bday-first:588-588 · .bday-form:723-724 · .bday-group:564-727 · .bday-hdr:159-160 · .bday-header:154-503 · .bday-label:594-594 · .bday-list:573-777 · .bday-month:172-791 · .bday-name:652-732 · .bday-next:102-103 · .bday-no:624-624 · .bday-person:571-617 · .bday-show:575-679 · .bday-sub:283-284 · .bday-today:557-776 · .bday-upcoming:54-528 · .bday-vip:529-879 · .boda-catalog:80-88 · .boda-cfg:129-145 · .boda-config:76-126 · .boda-count:84-84 · .boda-date:147-165 · .boda-day:116-116 · .boda-field:117-122 · .boda-filter:58-60 · .boda-mini:66-66 · .boda-pack:85-86 · .boda-pfilters:57-61 · .boda-stat:1050-1050 · .boda-sticky:77-142 · .boda-teachers:104-104 · .contact-add:948-948 · .contact-entry:941-946 · .contact-group:938-940 · .contact-remove:947-947 · .data-actions:342-342 · .data-btn:343-354 · .econ-equiv:476-476 · .econ-tab:325-329 · .econ-tariff:408-478 · .energy-tariff:454-456 · .est-nav:327-328 · .ev-alarm:809-810 · .ev-annual:546-546 · .ev-bday:285-580 · .ev-bright:444-444 · .ev-btn:811-812 · .ev-calendar:1024-1039 · .ev-current:1041-1041 · .ev-del:13-14 · .ev-filter:830-1009 · .ev-hairdresser:1044-1045 · .ev-list:2-1013 · .ev-month:514-1043 · .ev-multi:50-71 · .ev-rut:242-309 · .ev-search:3-7 · .ev-sort:8-53 · .ev-stat:969-1015 · .ev-type:429-431 · .ev-types:428-845 · .ev-up:269-966 · .ev-upcoming:967-1001 · .ev-view:65-65 · .ev-wk:224-443 · .export-choice:815-985 · .export-folder:793-827 · .fiscal-hdr:550-550 · .fiscal-hip:405-406 · .fiscal-tab:326-326 · .hip-rate:505-509 · .hip-ro:547-548 · .home-birthday:467-498 · .home-pending:468-474 · .home-popup:483-536 · .home-reminder:462-544 · .imp-mode:17-27 · .invoice-field:999-999 · .invoice-sheet:909-909 · .macro-url:69-69 · .nav-icon:362-372 · .nav-pro:336-348 · .nav-style:360-360 · .panel-header:887-888 · .personal-copy:925-925 · .personal-data:924-931 · .personal-note:949-991 · .personal-notes:992-996 · .rate-input:46-46 · .rut-addition:204-221 · .rut-agenda:218-219 · .rut-cancelled:245-304 · .rut-done:813-814 · .rut-history:188-239 · .rut-hpd:186-186 · .rut-icon:170-171 · .rut-recovery:213-222 · .rut-session:223-223 · .rut-skipped:305-306 · .rut-week:187-187 · .selected:369-369 · .settings-copy:917-920 · .settings-details:105-107 · .settings-edit:70-937 · .settings-editor:894-932 · .settings-field:915-934 · .settings-is:904-1021 · .settings-menu:440-440 · .sw-upd:927-927 · .sy-back:37-37 · .sy-body:35-583 · .sy-card:41-41 · .sy-header:36-504 · .sy-lbl:40-40 · .sy-period:414-421 · .sy-table:42-42 · .sy-tr:43-43 · .sy-val:39-39 · .sy-year:38-38 · .week-action:881-882 · .week-card:390-390 · .weeks-container:1018-1018 · .wm-logo:91-249

### css/source/home-sharing.css  _(174 líneas)_

**Secciones:**

- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:1
- Selector de eventos para compartir por iCalendar:28
- Selector de exportación: controles compactos y lista con espacio propio.:29
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:66
- Compartir: cabecera centrada, categorías completas y lista compacta.:84
- Próximos comparte identidad celeste en sus cuatro subpestañas.:117
- Mis Datos: atajos, registros plegables y contenido multilínea completo.:131
- Próximos: contraste, alternancia y año centrado.:145
- Año de Estadísticas centrado sin desplazar las pestañas ni cambiar las flechas.:161
- Agenda y consultas anuales: cabecera estable y flechas neutras compartidas.:163

**Rangos por prefijo de clase:**
.boda-future:81-81 · .contact-address:127-139 · .contact-entry:126-126 · .contact-primary:137-143 · .contact-shortcuts:132-155 · .energy-contract:108-109 · .energy-field:111-112 · .energy-history:106-107 · .energy-price:110-115 · .energy-sheet:105-105 · .energy-tax:113-113 · .ev-cal:32-104 · .ev-field:80-80 · .ev-list:121-150 · .ev-period:164-167 · .ev-share:30-31 · .ev-stat:119-120 · .ev-stats:151-156 · .ev-up:147-171 · .ev-week:67-82 · .ev-wk:3-3 · .header:2-2 · .home-reminder:61-63 · .home-submission:4-17 · .home-summary:18-26 · .month-summary:20-21

### css/source/energy-refinements.css  _(294 líneas)_

**Secciones:**

- Facturas: mismos componentes que los contratos, cifras sin desbordar.:1
- Estudio energético: controles compactos y separación entre apartados.:11
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:14
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:30
- Cada pestaña ocupa su celda completa, igual que en Eventos.:44
- Identidad propia de cada pestaña, sin alterar el sistema general.:47
- Lados explícitos: CSSOM conserva los bordes al copiar la vista al swipe.:57
- Filas de parejas: controles compactos, columnas alineadas.:101
- Navegación: la misma geometría en Home y en las ventanas.:138
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:149
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:167
- Histórico: esquinas opacas incluso cuando la cabecera queda fija.:201
- El selector de día conserva marco y seis huecos semanales al cambiar de mes.:273
- El ancho del nombre del mes no desplaza las flechas compartidas.:288
- Deshacer acompaña a la ficha de sesión sin tapar sus controles de estado.:291

**Rangos por prefijo de clase:**
.boda-asg:106-290 · .boda-det:102-105 · .boda-last:15-19 · .contact-shortcuts:216-219 · .data-actions:139-140 · .energy-bar:91-91 · .energy-caption:2-2 · .energy-choice:12-12 · .energy-compare:133-133 · .energy-contract:4-5 · .energy-cost:87-135 · .energy-coverage:78-78 · .energy-extremes:74-74 · .energy-fee:42-43 · .energy-field:7-7 · .energy-fields:9-9 · .energy-info:63-65 · .energy-inline:84-84 · .energy-legend:92-92 · .energy-metric:125-127 · .energy-metrics:124-124 · .energy-overview:67-69 · .energy-period:70-72 · .energy-price:183-188 · .energy-range:93-93 · .energy-reconciliation:77-77 · .energy-scenario:134-134 · .energy-section:62-62 · .energy-supplier:75-128 · .energy-table:3-3 · .energy-tabs:45-56 · .energy-tariff:80-184 · .energy-tax:73-131 · .energy-vat:129-129 · .energy-window:31-123 · .energy-year:6-99 · .ev-btn:146-146 · .ev-cell:284-285 · .ev-day:286-286 · .ev-io:136-136 · .ev-main:164-165 · .ev-order:241-253 · .ev-routine:237-239 · .ev-routines:231-235 · .ev-stat:220-220 · .ev-stats:221-227 · .ev-type:236-236 · .ev-up:262-271 · .ev-upcoming:173-177 · .ev-wk:16-176 · .home-popup:18-28 · .imp-mode:113-113 · .imp-preview:114-118 · .nav-bar:141-141 · .rut-addition:256-283 · .rut-bulk:194-199 · .rut-card:158-213 · .rut-day:147-153 · .rut-days:150-150 · .rut-dpick:145-281 · .rut-history:190-205 · .rut-hora:154-156 · .rut-month:198-198 · .rut-recovery:144-144 · .rut-routine:160-160 · .rut-sec:214-215 · .rut-session:143-209 · .rut-time:157-157 · .rut-weekdays:151-151 · .sy-body:171-171 · .sy-hdr:265-265

### css/source/invoices.css  _(108 líneas)_

**Secciones:**

- Revisar jornadas y cálculo antes de las acciones; caben juntos en móvil.:63

**Rangos por prefijo de clase:**
.home-invoice:3-5 · .hours-control:1-6 · .hours-export:50-61 · .invoice-action:75-75 · .invoice-actions:21-21 · .invoice-body:10-10 · .invoice-calculation:77-89 · .invoice-card:12-14 · .invoice-config:19-94 · .invoice-confirm:26-26 · .invoice-day:25-25 · .invoice-days:98-104 · .invoice-document:34-34 · .invoice-equals:84-84 · .invoice-error:27-27 · .invoice-eye:46-47 · .invoice-field:16-16 · .invoice-fields:15-37 · .invoice-filename:28-28 · .invoice-kairo:68-107 · .invoice-line:80-83 · .invoice-mail:90-90 · .invoice-money:85-85 · .invoice-month:11-95 · .invoice-note:17-17 · .invoice-send:65-67 · .invoice-sheet:8-74 · .invoice-status:18-18 · .invoice-summary:44-45 · .invoice-tool:91-93 · .invoice-totals:20-97

### css/source/theme-cream.css  _(90 líneas)_

**Secciones:**

- Bordes suaves en reposo; el color completo identifica la selección.:86

**Rangos por prefijo de clase:**


### css/tasks.css  _(97 líneas)_

**Secciones:**

- Tareas globales: estilos aislados de calendarios y pestañas existentes.:1
- Tarjetas pastel y arrastre con hueco visible.:81

**Rangos por prefijo de clase:**
.home-popup:75-75 · .task-actions:57-60 · .task-colors:87-89 · .task-content:42-44 · .task-date:49-50 · .task-done:45-46 · .task-drag:92-93 · .task-drop:62-63 · .task-editor:54-56 · .task-grip:51-91 · .task-linked:90-90 · .task-more:53-53 · .task-moving:61-61 · .task-row:40-86 · .task-title:43-43 · .tasks-add:35-37 · .tasks-count:14-14 · .tasks-day:47-48 · .tasks-docked:15-16 · .tasks-dragging:94-95 · .tasks-drop:8-12 · .tasks-empty:71-73 · .tasks-fab:4-13 · .tasks-footer:64-65 · .tasks-header:23-28 · .tasks-heading:24-25 · .tasks-list:39-39 · .tasks-move:66-70 · .tasks-open:2-3 · .tasks-overlay:17-21 · .tasks-reminder:76-77 · .tasks-reminders:29-29 · .tasks-sheet:20-22 · .tasks-status:74-74 · .tasks-tabs:31-34

### css/household.css  _(119 líneas)_

**Secciones:**

- Vivienda: lectura con contraste, cifras principales y detalle secundario.:1
- Pares de precios: cifra neta principal, importe con impuestos secundario.:61

**Rangos por prefijo de clase:**
.energy-pair:63-69 · .energy-price:62-70 · .household-active:100-100 · .household-analysis:56-56 · .household-balance:29-32 · .household-body:6-118 · .household-card:15-42 · .household-dates:24-24 · .household-detail:55-98 · .household-empty:54-54 · .household-equivalent:35-39 · .household-eyebrow:18-18 · .household-gas:50-115 · .household-header:5-5 · .household-history:43-46 · .household-investment:12-14 · .household-luz:49-49 · .household-metrics:25-25 · .household-mortgage:16-16 · .household-ok:40-40 · .household-payment:21-23 · .household-price:71-71 · .household-progress:33-34 · .household-rate:81-86 · .household-section:47-47 · .household-status:20-20 · .household-summary:10-10 · .household-tax:72-73 · .household-utilities:48-48 · .household-utility:53-53 · .household-value:26-28

### css/electricity-comparator.css  _(77 líneas)_

**Secciones:**

- Solo el comparador eléctrico: no altera pestañas ni formularios compartidos.:1

**Rangos por prefijo de clase:**
.electric-add:72-72 · .electric-card:20-71 · .electric-cards:19-19 · .electric-check:31-31 · .electric-company:34-34 · .electric-comparator:2-73 · .electric-current:6-8 · .electric-field:54-55 · .electric-fields:70-70 · .electric-fold:27-27 · .electric-identity:33-33 · .electric-input:56-58 · .electric-link:9-9 · .electric-modes:41-43 · .electric-period:46-48 · .electric-power:53-53 · .electric-reference:63-63 · .electric-remove:18-18 · .electric-results:74-76 · .electric-scenario:15-17 · .electric-scenarios:10-10 · .electric-section:11-13 · .electric-source:35-40 · .electric-tax:59-62 · .electric-usage:64-69 · .electric-weight:51-52 · .electric-weighted:49-50

### css/finance-views.css  _(82 líneas)_

**Secciones:**

- Contenido financiero. No modifica la navegación ni las subpestañas globales.:1

**Rangos por prefijo de clase:**
.econ-rate:10-14 · .econ-stats:7-7 · .econ-summary:3-76 · .study-company:20-20 · .study-mortgage:61-64 · .study-rate:51-60 · .study-workspace:15-80

### css/personal-periods.css  _(34 líneas)_

**Secciones:**

- Partidas simples y por tramos: misma fila y misma jerarquía visual.:1

**Rangos por prefijo de clase:**
.fiscal-year:23-23 · .personal-amount:8-11 · .personal-average:18-18 · .personal-fold:24-25 · .personal-frequency:32-32 · .personal-gear:5-5 · .personal-item:3-22 · .personal-period:14-33

