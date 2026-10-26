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

### js/birthdays-bind.js  _(355 líneas)_
**Funciones:** bindBdayFormEvents:1 · openBday:49 · closeBday:53 · refreshBday:54 · applyBdaySearch:58 · bindBdayEvents:93 (!208) · updateListOffset:99 · _bdResetScroll:139 · _bdScrollToToday:141 · bindBdayUpcoming:301 · bdayPanelHost:341 · openBdayCalendarDay:346 · close:347

### js/birthdays-groups.js  _(95 líneas)_
**Estado global:** BDAY_GROUP_DEFAULTS:2 · BDAY_GROUP_FILTER:3 · BDAY_EDIT_GROUP:4 · BDAY_GROUP_PENDING:5 · BDAY_SHOW_GROUPS:6

**Funciones:** bdayNormalizeGroup:7 · bdayGroups:14 · bdayGroupCatalog:15 · bdayGroupHue:17 · bdayGroupTags:18 · bdayGroupMatch:19 · bdayGroupChips:20 · renderBdayGroupTools:21 · bdayGroupFilterLabel:29 · renderBdayGroupPickerFields:30 · renderBdayGroupFields:31 · renderBdayPersonGroups:32 · bindBdayCategoryButton:33 · openBdayCategoryPicker:37 · close:38 · bdayReadGroupFields:45 · updateBdayGroupStatus:46 · bindBdayGroupTools:57 · bdaySaveGroupDraft:64 · cancelBdayGroupEdit:70 · openBdayGroupEdit:71 · close:72 · bindBdayGroupEdit:81 · toggleBdayGroupPerson:89

### js/birthdays-panels.js  _(370 líneas)_
**Funciones:** bdaySwitchPanel:1 · renderBdayNameVip:6 · updateBdayNameVip:7 · renderBdayVipToggle:8 · renderBdayDetail:9 · renderBdayAlarmPanel:27 · fmtDate:39 · openBdayAlarm:94 · back:99 · _bdRefreshBoth:103 · closeBdayAlarm:107 · bindBdayAlarmEvents:109 (!149) · fmtD:228 · onOk:235 · onErr:236 · renderBdayForm:258 · openBdayDetail:285 · savePerson:289 · closeBdayDetail:305 · openBdayForm:308 · back:309 · closeBdayForm:318 · deleteBdayPerson:322 · persist:325 · bindBdayDateFields:328 · update:330 · openBdayDatePicker:342 · close:343 · index:359 · mark:360 · select:361

### js/birthdays-render.js  _(257 líneas)_
**Estado global:** DN7:104

**Funciones:** renderBdayVipFilter:1 · renderBdayUpcoming:5 (!88) · getBdaysInRange:10 · bdayLabel:25 · renderGroup:34 · bdayCalendarPeople:93 · renderBdayCalendarDay:96 · renderBdayCalMonth:102 · renderBdayList:143 · getEffVip:151 · renderBdayAddButton:199 · renderBdayContent:202

### js/birthdays.js  _(169 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_CAL_VIP:7 · BDAY_EDIT:8 · BDAY_SEARCH:9 · BDAY_LIST_TOP:10 · BDAY_UP_VIP:11 · BDAY_FILTER_VIP:12 · BDAY_EDIT_VIP:13 · BDAY_VIP_PENDING:14 · BDAY_ALARM_SET_KEY:68 · BDAY_ALARM_SET:69 · BDAY_ALARM_COUNT_KEY:70 · BDAY_ALARM_COUNT:71 · BDAY_PALETTE:75 · BDAYS:79

**Funciones:** _showBdayInlineCtrl:20 · tc:88 · bdName:89 · getBdayColor:91 · getBdaysOn:100 · daysUntil:102 · bdayCanSetAlarm:110 · hasUpcomingBday:116 · updateBdayBtn:122 · getBdayAlarmKey:132 · isBdayAlarmSet:133 · setBdayAlarmState:137 · syncVipBdaysToEvents:144

### js/bodas-assign.js  _(479 líneas)_
**Estado global:** DN2:196 · BODA_ASSIGN:229

**Funciones:** bodaOpenSheet:1 · bodaCloseSheet:4 · bodaCreatedAt:10 · bodaIssues:15 · _renderBodaIssueCards:31 · card:34 · openBodaIssue:55 (!81) · findEv:97 · closeBodaIssue:136 · _bodaWeekKey:139 · bodaStatsOverview:147 · renderBodaStatsOverview:156 · _renderBodaStats:164 · openBodaAssign:230 · closeBodaAssign:249 · renderBodaAssign:253 · renderBodaAssignHtml:257 (!81) · bindBodaAssign:338 · openBodaPlacePicker:409 · closeBodaPlacePicker:442 · bodaAplicarCampo:446 · bodaTrasElegir:456 · bodaEndAt:468

### js/bodas-bind.js  _(304 líneas)_
**Estado global:** BODA_RENDER_CLASSES:299

**Funciones:** renderBodaCoupleForm:1 · openBodaCoupleForm:30 · closeBodaCoupleForm:70 · bodaRefreshRow:74 · bindBodasEvents:103 (!185) · _guardaPendientes:108 · _bodaCalMove:119 · selectDay:134 · findClass:223 · bodaMatchesDate:288 · bodaMatchesClasses:294 · renderBodasBody:300

### js/bodas-class-form.js  _(335 líneas)_
**Estado global:** BODA_FORM:1 · BODA_TIME_H:212

**Funciones:** openBodaClaseForm:2 · _bodaFormRender:22 (!138) · closeBodaClaseForm:160 · openBodaCouplePicker:167 · row:178 · apply:195 · closeBodaCouplePicker:209 · openBodaTimePicker:215 (!84) · drum:224 · setDrum:247 · mark:255 · drumVal:259 · readManual:279 · closeBodaTimePicker:299 · openBodaDurationPicker:303 · close:308 · bodaTeachersLabel:313 · openBodaTeachersPicker:316 · close:322

### js/bodas-config.js  _(174 líneas)_
**Estado global:** BODA_CONFIG_SK:2 · BODA_CONFIG:3

**Funciones:** bodaLoadConfig:4 · bodaApplyConfig:15 · saveBodaConfig:24 · validateBodaConfig:25 · importBodaConfig:42 · bodaPackOf:58 · bodaDuration:59 · bodaDefaultDuration:60 · bodaDurationOf:61 · bodaConfigUsed:62 · bodaSetCatalogItem:66 · bodaDeleteCatalogItem:75 · bodaTaken:80 · bodaPackStats:85 · bodaTeacherName:97 · bodaTeacherCount:98 · bodaTeacherStats:99 · renderBodaPackStats:105 · renderBodaConfig:123 · openBodaConfig:142 · bindBodaConfig:143 · openBodaCatalogForm:152

### js/bodas.js  _(657 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:25 · BODA_PLACE_DEFAULT:31 · BODA_PLACE_NONE:34 · BODA_PLACE_SHORT:35 · BODA_PLACE_DESC:36 · BODA_PLACE_EMOJI:38 · BODA_WHITE:55 · BODA_SLOTS:56 · BODA_NO_TIME_COLOR:62 · BODA_NO_COUPLE_COLOR:63 · BODA_DEFAULT_TIME:64 · BODA_PALETTE:67 · BODA_CLOSED_SK:235 · BODA_CLOSED:236 · BODA_PENDING:255 · BODA_SUBTAB:297 · BODA_CLASS_MODE:298 · BODA_CLASES_SEARCH:299 · BODA_HIDE_PAST:300 · BODA_HIDE_CLOSED:301 · BODA_CARD_OPEN:302 · BODA_PAREJAS_SEARCH:303 · BODA_PAREJAS_SORT:306 · BODA_PAREJAS_CLASSES:307 · BODA_PAREJAS_FILTER:308 · BODA_CAL_DAY:309 · BODA_CAL_HL:310 · BODA_CAL_YEAR:311 · BODA_CAL_MONTH:312

**Funciones:** saveBodas:18 · bodaPlaceEmoji:39 · bodaPlaceOf:43 · bodaPlaceLabel:48 · bodaNextColor:69 · bodaCouple:77 · bodaSlot:81 · bodaSlotColors:91 · bodaMarkFor:96 · evBodaSvg:102 · bodaClasses:119 · bodaPrimeraClase:123 · bodaClassesOfCouple:127 · bodaEsUltimoEnsayo:131 · bodaUltimoEnsayoHtml:137 · bodaFreeClasses:140 · bodaClaseById:143 · bodaSortClasses:147 · bodaClassesOnDay:154 · bodaNewClass:157 · bodaNormalizeClasses:172 · bodaPlaceForNewOn:209 · bodaDayFull:214 · bodaBulkCreate:218 · bodaProgress:229 · saveBodaClosed:240 · bodaIsClosed:241 · bodaReopenDay:242 · bodaToggleClosed:246 · bodaPendingCount:256 · bodaEff:258 · bodaSetPending:267 · bodaPendingApply:271 · bodaPendingDiscard:294 · _bodaLegendHtml:315 · _renderBodaCalendario:326 (!88) · _renderBodasBody:414 · _bodaCmpFecha:444 · _renderBodaParejas:450 (!91) · _bodaFmt:541 · _bodaFmtCorto:542 · _renderBodaClases:549 (!108)

### js/core.js  _(828 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:115 · THEME_STORAGE_KEY:118 · THEME:119 · THEME_LABELS:125 · THEME_META:126 · THEME_SEQUENCE:127 · ECON_YEAR_CONFIG:151 · MN_SHORT:153 · DN5:468 · FESTIVOS_ANIO:692 · NAV_SWITCH_TIMER:809

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:25 · startedInPanel:38 · addLongPress:80 · start:84 · move:98 · end:101 · applyTheme:128 · cycleTheme:135 · updateThemeBtn:140 · load:158 · save:170 · loadEconYear:175 · saveEconYear:194 · fakeTrans:204 · simpleBarChart:221 · hBarRows:245 · shareOrDownload:262 · fallback:269 · download:270 · renderDocumentIcon:300 · menuTitle:302 · escHtml:308 · mkey:313 · getMonthH:314 · defH:320 · dayH:321 · dayT:322 · dk:323 · fd:324 · ad:325 · fh:326 · fhP:327 · isToday:328 · isPast:329 · wn:330 · weeks:333 · homeSubmissionStatus:347 · renderHomeSubmissionStatus:352 · getWD:361 · _toastReset:377 · _toastBindSwipe:387 · end:412 · showToast:430 · sendEmail:457 · buildMailtoBody:467 · render:489 · buildHomeCalendar:504 (!89) · fmtH:570 · openSheet:593 · closeSheet:612 · selectType:618 · contarVacaciones:651 · confirmarCupoVacaciones:664 · contarFestivos:680 · confirmarCupoFestivos:693 · togSent:702 · _panelBorrarLuego:723 · _panelCancelarBorrado:734 · abrirPanel:736 · engancharFondo:757 · abrirUnaVez:775 · cerrarPanel:781 · renderNavBar:792 · bindNavBar:799 · navigateMain:811 · open:822

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

### js/economics-fiscal-hip.js  _(863 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipROvinc:364 · _calcInsOvercost:374 · _renderInlineOvercost:385 · _renderHipResumen:404 · _renderHipDetalle:407 · _renderHipSectionContent:433 · _renderCompraSection:445 · _hipRateDetail:474 · fmt:477 · _renderPrestamoSection:484 · _renderSubSection:530 · renderFiscalTabDespacho:600 · _bindTabDespacho:619 · _bindHipResumen:646 · _bindHipAnalysis:662 · _bindHipDetalle:672 · _rerenderSection:743 · _readSectionInputs:752 · _rv:753 · _rv_s:754 · _bindEditingSection:812

### js/economics-fiscal.js  _(435 líneas)_
**Estado global:** GROUP_CASA_DESP:298 · GROUP_UTIL_DESP:299

**Funciones:** renderFiscalContent:8 · _renderYearSelector:38 · _renderCopyYearBtn:47 · _personalListHtml:70 · _personalTripFilter:73 · _personalTotal:82 · _personalTotalWeekly:86 · renderFiscalTabPersonal:90 · renderFiscalTabIrpf:131 · renderFiscalTabGastosDesg:178 · renderComprasList:209 · renderFiscalTabIrpfDeduc:258 · renderFiscalTabDesgrav:272 · renderDesgravDespachoInfo:294 · _dedCard:335 · renderDesgravList:370

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

### js/energy-analysis-view.js  _(111 líneas)_
**Estado global:** ENERGY_ANALYSIS_TAB:2 · ENERGY_ANALYSIS_YEAR:3 · ENERGY_SUMMARY_TOTAL:4 · ENERGY_ANALYSIS_KIND:5 · ENERGY_RETURN:6 · ENERGY_ANALYSIS_TABS:7

**Funciones:** energyAnalysisHtml:8 · _energyAnalysisHtml:11 · energyConsumptionHtml:27 · energyCostsHtml:35 · energyTariffsHtml:61 · energyScenarioOptions:86 · energyComparisonHtml:90 · energyArchiveHtml:98 · closeEnergyAnalysis:103 · openEnergyAnalysis:104 · energyRefreshAnalysis:110

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

### js/energy-study.js  _(99 líneas)_
**Estado global:** ENERGY_COST_VAT:2 · ENERGY_COMPARE_TARIFF:3

**Funciones:** energyDocumentedYears:4 · energyContractInYear:12 · energyYearIndicators:16 · tax:21 · energyMetric:24 · energyInfoHtml:25 · energySectionTitle:26 · energyPeriodsHtml:27 · energySuppliersHtml:40 · energyContractPeriods:50 · energyCommercialPeriods:52 · signature:54 · energyPriceExtremes:60 · energySummaryHtml:66 · energyVatStrip:79 · energyCompareChart:91 · energyCompareTable:95

### js/energy-tariff-editor.js  _(55 líneas)_
**Funciones:** energyNumericField:2 · energyTariffEditorHtml:3 · openEnergyTariff:21 · close:24 · read:25 · update:26 · energyEditLegacyTariff:38 · energySendToScenarios:48

### js/events-alarm-policy.js  _(36 líneas)_
**Funciones:** evAlarmTargets:3 · evAlarmMoment:9 · evAlarmOptions:12 · evDetailAlarmDate:20 · evAlarmNotice:28 · evAlarmCreationAllowed:31

### js/events-appearance.js  _(48 líneas)_
**Estado global:** EV_APPEARANCE_KEY:3 · EV_APPEARANCE_FIELDS:4 · EV_APPEARANCE:23

**Funciones:** evAppearanceDefaults:10 · validateEventAppearance:13 · loadEventAppearance:19 · applyEventAppearance:24 · setEventAppearance:28 · evSymbolStroke:37

### js/events-bind.js  _(656 líneas)_
**Estado global:** EV_RENDER_DAY:7

**Funciones:** refreshCalendarDate:8 · initCalendarDateRefresh:14 · resume:16 · _switchEvView:28 · openEvents:46 · closeEvents:56 · openEventsAt:63 · refreshEvents:70 · bindEvYearHeader:91 · setYear:95 · bindEvEvents:108 · _bindEvNav:117 (!202) · _scrollWeekToMonth:126 · _scrollWeekToToday:173 · doScroll:183 · _bindEvCal:319 (!93) · evLayoutWeekTitles:412 · _bindEvWeekTitleBackground:434 · update:440 · schedule:441 · evFilterCategories:446 · evFilterCategoryFor:455 · evListFilterLabel:456 · evListFilterMatches:464 · evToggleListFilter:470 · openEvTypeFilter:482 · isSelected:484 · option:485 · close:494 · paint:497 · _bindEvListas:501 (!122) · apply:611 · _bindEvGestos:623 · _evSwipeUpcoming:636 · _evSwipeBodas:643 · _evSwipeRutinas:650

### js/events-cal.js  _(372 líneas)_
**Estado global:** DN7:25

**Funciones:** _renderEvCalMonth:14 (!165) · _renderEvMonthCard:179 (!161) · _renderEvAnnual:340 · _renderEvQuad:349 · renderEvCalMonth:369 · renderEvAnnual:370 · renderEvQuad:371

### js/events-calendar-export.js  _(230 líneas)_
**Estado global:** EV_CAL_EXPORT:3 · EV_ICS_KEY:4 · EV_ICS_UPPER_KEY:5 · EV_ICS_NOTES_KEY:6 · EV_ICS_AUTHOR_KEY:7

**Funciones:** evIcsAuthor:8 · evIcsDescription:9 · evIcsText:14 · evIcsFold:17 · evIcsNextDay:26 · evIcsCandidates:27 · evIcsFile:47 · evIcsRecords:74 · evIcsMergeRecords:77 · evIcsRoutineRows:83 · evIcsRoutineCurrent:93 · evIcsRememberedRows:97 · evIcsPrepare:114 · evIcsExportRows:131 · evIcsExportStatus:134 · evIcsFilterRows:140 · renderEvCalendarExport:145 · openEvCalendarExport:160 · close:163 · find:166 · count:167 · filters:176 · list:182 · dates:198

### js/events-carousel.js  _(60 líneas)_
**Funciones:** bindEvCarouselDrag:2 · preview:6 · position:15 · clear:20 · finish:24

### js/events-detail.js  _(638 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · evDetailTitleColor:40 · renderEvDetailAlarm:49 · evDetailDateText:55 · renderEvLargeFacts:56 · renderEvDetail:70 (!142) · fd2:74 · _fila:167 · evDayCarItems:212 · evCarGo:225 · _evCarShow:233 · openEvDayCarousel:241 · closeEvDayCarousel:249 · openEvDetail:256 (!155) · repaintRoutine:290 · repintar:307 · closeEvDetail:411 · renderEvAlarmPanel:414 · fd2:416 · openEvAlarm:484 · closeEvAlarm:495 · openBdayAlarmFromEvents:503 · bindEvAlarmEvents:508 (!130) · _syncPre:547 · fmtD:577

### js/events-form-controls.js  _(88 líneas)_
**Funciones:** _evFormEl:2 · _evFormAll:3 · _evFormKind:4 · _evFormColor:5 · _evFormSuggestTitle:9 · _evFormTypeUI:14 · _bindEvFormTypes:22 · _bindEvFormCategories:40 · _evFormShapePreviews:55 · _bindEvFormAppearance:58 · _evFormTravelUI:75 · _bindEvFormDetails:81

### js/events-form-save.js  _(114 líneas)_
**Funciones:** _evFormRead:2 · _evFormReadDetails:29 · _evFormSaveBodas:52 · _evFormCommit:80 · _evFormDelete:96 · _bindEvFormActions:107

### js/events-form-schedule.js  _(71 líneas)_
**Funciones:** evFormLegacyDays:2 · evFormDateLabel:5 · evFormScheduleControl:6 · renderEvFormLead:9 · renderEvKindSymbols:22 · _evFormUpdateHeading:30 · _evFormScheduleState:34 · bindEvFormSchedule:56 · bindEvFormMultiday:62

### js/events-form.js  _(216 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · _renderEvTypeButton:29 · evAdmiteRepeticion:47 · renderEvForm:48 (!123) · openEvForm:171 · closeEvForm:194 · evSuggestedTitle:202 · bindEvFormEvents:206

### js/events-management.js  _(33 líneas)_
**Funciones:** evPaymentCoinsSvg:1 · evTaxBuildingSvg:2 · evUtilityHomeSvg:3 · evManagementShapeInner:5 · evManagementCheckable:18 · evManagementDate:19 · evManagementDone:20 · evManagementCheckHtml:21 · bindEvManagementCheck:26

### js/events-order.js  _(85 líneas)_
**Estado global:** EV_PLAN_ORDER_KEY:2 · EV_PLAN_ORDER_DRAFT:3 · EV_PLAN_ORDER_CACHE:4 · EV_PLAN_ORDER_STOP:5

**Funciones:** renderEvPlanOrderButton:6 · evPlanOrderDefaults:7 · validateEvPlanOrder:11 · evPlanOrderData:20 · evPlanReferenceTime:28 · evCompareOrder:32 · evPlanOrderPosition:42 · minutes:43 · closeEvPlanOrder:53 · evPlanOrderReorder:54 · openEvPlanOrder:64 · renderEvPlanOrder:65

### js/events-picker-color.js  _(385 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:25 · EV_MANAGEMENT_SUBTYPES:42 · EV_PLAN_SUBTYPES:43 · EV_KINDS:49 · EV_TYPE_COLORS:54 · EV_FREE_COLOR:107 · EV_FREE_SHAPE:108 · EV_OTHER_FIXED_COLORS:110 · EV_FREE_DATES:114 · EV_BAR_SIZES:117 · EV_FREE_BARSIZE:118 · EV_DOT_SOLID:122 · EV_SHAPE_BW:149

**Funciones:** evPlanType:45 · evIsManagement:46 · evIsPlan:47 · evFixedSymbol:48 · evOtherShapeColor:111 · evBarSize:123 · evBarSizeCls:129 · evTypeKey:130 · evTypeColor:131 · getEvKind:134 · evPlanShapeInner:150 · evShapeSvg:176 (!87) · evMorePlusSvg:263 · evTravelColor:272 · getEvType:278 · isEvBarAlways:290 · getEvDisplayColor:292 · _renderColorPicker:314 · _bindColorPicker:337 · updatePreview:347

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

### js/events-statistics.js  _(58 líneas)_
**Estado global:** EV_STATS_YEAR:2 · EV_STATS_LAST_YEAR:3 · EV_STATS_PERIOD:4

**Funciones:** evStatsGroup:5 · computeEventStatistics:9 · count:31 · renderEventStatistics:35 · bindEventStatistics:52

### js/events-tax-model.js  _(28 líneas)_
**Estado global:** EV_TAX_MODELS:2

**Funciones:** evTaxTitle:3 · renderEvTaxFields:4 · evFormTaxCode:8 · bindEvTaxFields:9 · change:11 · close:18

### js/events.js  _(878 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_LIST_YEAR:8 · EV_LIST_LAST_YEAR:9 · EV_VIEW_STATE:13 · EV_SCROLL_RESET:18 · EV_VIEW:19 · EV_EDIT:20 · EV_EDIT_DS:21 · EV_FORM_CONTAINER:22 · EV_EDIT_MODE:23 · EV_BRIGHT_PAST:24 · EV_ANNUAL_VIEW:25 · EV_ANNUAL_FILTER_HIDDEN:26 · EV_FILTER_GROUPS:35 · EV_FILTER_SHORT:41 · EV_FILTER_COLOR:43 · EV_FILTER_SEP_AFTER:46 · EV_FILTER_CYCLE:47 · EV_PREV_VIEW:65 · EV_QUAD_YEAR:66 · EV_QUAD_MONTH:67 · EV_TO_SUBTAB:68 · EV_TYPES_FILTER:69 · EV_TYPES_PAST:70 · EV_LIST_SORT:71 · EV_LIST_SEARCH:72 · EV_COLORS:73 · EVENTS:74 · EV_ALARM_SK:103 · EV_ALARMS_SET:104 · EV_NO_RUT:196 · EV_MAX_BAR_DIA:252 · EV_MARK_ORDER:358 · EV_MAX_PUNT_DIA:400 · EV_MAX_RUT_DIA:401 · EV_CAL_CORNER_STACK:404 · EV_MAX_VIP_DIA:406 · EV_CAL_VIP_MAX:407 · EV_UP_SHOW_RUT:409 · EV_UP_SHOW_BODA:410 · EV_BAR_Z:462 · EV_COMPARTE_DIA:466 · EV_MNS:729 · EV_CAR:772 · EV_TRANSPORTES:791 · EV_TRANS_EMOJI:797 · EV_DATE_INDEX:864

**Funciones:** evCycleFilters:48 · evFilterGroup:54 · saveEvents:98 · loadEvAlarms:105 · saveEvAlarms:106 · _findBdayByEvId:107 · isEvAlarmSet:119 · setEvAlarmState:125 · evDk:132 · _evClampDate:141 · eventOccursOn:145 · getEventsOn:189 · evSignature:204 · evMergeIncoming:214 · evMergeMsg:239 · _fmtDayEs:251 · evBarLimitExceeded:253 · evDayLimitExceeded:263 · rutDayCount:299 · hasUpcomingEvent:306 · updateEventsBtn:315 · evDefaultShape:329 · evMarkerHtml:337 · evMorePlusHtml:352 · evMarkPriority:359 · evBodaMinutes:367 · evSortMarks:378 · ev0:379 · evAnnualXsHtml:411 · vipStarSvgHtml:421 · vipIconHtml:430 · evIsoDate:436 · _isVipBdayTooFar:437 · evUpcomingMarkHtml:444 · _evRowOcc:463 · evComparteDia:467 · _evSoloSeRozan:472 · _evTrozosSeRozan:483 · _evAssignRow:491 · evBarTravelTimes:505 · _evMarcarMitades:510 · _evMitadesStyle:530 · evBarZ:537 · _evBarSegments:541 · _evBarBand:565 · _evBarSegmentStyle:571 · _evBarExtent:576 · _evRoundedOutline:587 · near:596 · _evBarMutedColor:616 · _evBarPast:621 · _evSteppedBar:633 · position:646 · _evMonthBarTitle:680 · width:690 · _evMonthBarTitleRepeats:702 · _evAnnualCtx:732 · visible:733 · _evLoadPuentes:751 · _evScheduleRemove:779 · _evCancelRemove:780 · evStartTime:799 · evCompareTime:805 · evEndTime:806 · evTimeLabel:813 · evTramos:820 · evTramoTexto:831 · evMinutosDe:838 · _positionEvBright:848 · withEventDateIndex:865

### js/export-files.js  _(91 líneas)_
**Estado global:** EXPORT_DIRECTORY:3 · EXPORT_DIRECTORY_LABEL:4 · EXPORT_DIRECTORY_READY:5 · EXPORT_NAME_LAST:6

**Funciones:** exportFileName:7 · exportDirectoryStore:15 · initExportDirectory:32 · openExportDirectory:52 · close:54 · status:60 · load:61 · renderExportActionIcon:75 · openExportChoice:79 · close:80 · location:85

### js/home-popup.js  _(196 líneas)_
**Estado global:** HOME_BIRTHDAYS_OPEN:2 · HOME_REMINDER_EDITING:3

**Funciones:** homeReminderColor:4 · homeReminderEventText:5 · homeReminderNoteHtml:10 · homeReminderEvents:14 · homeReminderTasksHtml:38 · homeReminderCardHtml:45 · homeReminderGroup:55 · homeReminderPendingHtml:58 · homeReminderLargeHtml:63 · homeReminderItemsHtml:78 · closeHomePopup:95 · homeReminderEdit:101 · homeReminderSelectEdit:113 · bindHomeReminderEditing:121 · choose:128 · openHomePopup:140

### js/household-summary.js  _(92 líneas)_
**Funciones:** householdMortgagePayment:2 · householdMortgagePeriod:5 · householdValue:18 · householdMortgageCard:19 · date:20 · householdUtilityPrices:35 · householdUtilityCard:67 · householdMortgageAnalysisButton:79 · renderHouseholdSummary:80

### js/household.js  _(39 líneas)_
**Estado global:** HOUSEHOLD_RETURN:3

**Funciones:** householdHost:4 · renderHouseholdContent:5 · openHousehold:8 · closeHousehold:21 · reRenderHousehold:28 · bindHousehold:33 · move:36

### js/import-export.js  _(536 líneas)_
**Funciones:** _lsJson:239 · askImportMode:246 · close:260 · _mergeMap:274 · _mergeList:285 · _sigEvent:295 · _sigCouple:297 · _sigAlarm:298 · _sigGasto:299 · _keyId:301 · _keyBday:302 · _keyGasto:303 · _exportPerYearKeys:309 (!84) · _applyFullImport:393 (!143)

### js/import-preview.js  _(19 líneas)_
**Funciones:** renderImportPreview:2 · add:4

### js/init.js  _(454 líneas)_
**Estado global:** DRUM_ITEM_H:134 · DN_ES:289

**Funciones:** _updateHeaderActive:32 · buildDrumPicker:135 · updateDrumSelected:167 · getDrumValue:172 · checkDrumMinuteWrap:178 · buildAlarmDayBtns:208 · showAlarmPastConfirm:234 · createHeaderAlarm:255 · proceed:275 · aplicarActualizacion:378 · reload:384 · _showUpdateBar:406 · _buscar:441

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

### js/rutinas-flex.js  _(154 líneas)_
**Estado global:** RUT_PLAN:2

**Funciones:** rutFlexible:3 · rutFlexEarliest:4 · rutFlexTarget:5 · rutFlexRange:9 · rutFlexCount:15 · rutFlexStatus:18 · rutFlexWarnings:25 · rutFlexSummary:31 · rutFlexOptionsHtml:36 · bindRutFlexOptions:51 · paint:53 · rutFlexRead:71 · rutFlexSetSession:90 · rutFlexPlanSessions:109 · renderRutPlan:115 · openRutPlan:137 · closeRutPlan:138 · refreshRutPlan:139 · read:143 · edit:144

### js/rutinas-form.js  _(240 líneas)_
**Funciones:** rutSetupLocked:3 · rutFormCandidate:11 · rutReadForm:41 · renderRutForm:75 · openRutForm:142 (!97) · _rutRepaintIcons:149 · _rutPintaHoras:175 · closeRutForm:239

### js/rutinas-history.js  _(192 líneas)_
**Estado global:** RUT_HISTORY:2

**Funciones:** rutNewSchedule:3 · rutScheduleSignature:12 · rutHistoryPeriods:15 · rutHistorySessions:27 · rutHistoryLabel:36 · rutHistoryMonthGroups:41 · renderRutHistorySession:47 · renderRutHistory:59 · rutHistoryScrollToday:82 · openRutHistory:87 · closeRutHistory:113 · rutSessionOriginal:114 · rutSessionMoved:123 · rutEditSession:127 · rutRescheduleSession:147 · openRutHistoryEdit:159 · close:173

### js/rutinas-icons.js  _(95 líneas)_
**Estado global:** RUT_ICONS:7 · RUT_APPEARANCE_KEY:8 · RUT_GYM_COLOR:9 · RUT_FIXED_COLOR:10 · RUT_ICON_LABEL:13

**Funciones:** rutDisplayColor:11 · rutColorOf:12 · _rutIconShapes:14 · _rutIconDetails:37 · rutIconOf:56 · _rutIconRawSvg:66 · setRutGymColor:83 · evActivitySvg:90 · rutIconSvg:94

### js/rutinas-recovery.js  _(64 líneas)_
**Estado global:** RUT_RECOVERY_PICK:3

**Funciones:** rutUnrecoveredSessions:4 · openRutRecoveryList:9 · openRutRecoveryDay:26 · render:33 · select:44 · move:48 · rutReadOnlyDayHtml:54

### js/rutinas-sessions.js  _(131 líneas)_
**Funciones:** rutSessionsOn:3 · rutSessionByKey:9 · rutRecoveryFor:14 · rutSessionTag:15 · rutRecoveryNote:20 · rutRecoveryHtml:24 · rutDoneCandidate:30 · rutChangeFromDetail:40 · apply:42 · close:48 · rutValidateAddition:55 · rutAddSession:60 · rutValidateExtraSessions:80 · rutSaveSessionChange:96 · rutDeleteSession:103 · openRutSessionDelete:117 · close:124

### js/rutinas.js  _(586 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_SUBTAB:266 · RUT_WEEK_SEL:373 · RUT_WEEK_CAL:374

**Funciones:** saveRutinas:25 · rutMarkerHtml:39 · rutMarkerGroups:47 · rutDayMarkersHtml:54 · rutById:59 · rutWeekKey:64 · rutTimeOfDay:73 · rutTieneHorarios:78 · rutScheduleOn:86 · rutScheduleCopy:91 · rutDurationOn:95 · rutChangeFrom:100 · rutChangeWeek:124 · update:128 · rutWeekCfg:140 · rutSuspendedOn:151 · rutDiaLleno:161 · rutOccursOn:165 · rutIsSkipped:176 · rutToggleSkip:177 · rutFin:197 · rutEventsOn:205 · rutEventFromId:222 · rutSessions:231 · rutStats:245 · rutProximas:259 · renderRutinasBody:269 · _rutTimeRange:282 · _renderRutSchedule:286 · _renderRutLista:300 · _rutFmt:339 · _rutFmtCorto:340 · _renderRutStats:346 · openRutWeek:375 · _rutWeekPick:384 · back:409 · rutDayTimesHtml:440 · _rutWeekRender:443 (!95) · paintTimes:480 · closeRutWeek:538 · openRutSesion:541 · closeRutSesion:545 · bindRutinasEvents:548

### js/settings-menu.js  _(109 líneas)_
**Estado global:** SETTINGS_MENU_ANCHOR:3 · SETTINGS_MENU_BACK:4 · SETTINGS_EDITOR_MODES:5

**Funciones:** closeSettingsMenu:6 · positionSettingsMenu:15 · _positionHeaderMenu:19 · toggleSettingsMenu:27 · settingsEditorActions:37 · settingsPanelHtml:40 · bindSettingsEditor:43 · setEditing:47 · settingsCopyIcon:66 · bindSettingsCopy:71 · openConnectionsSettings:79 · close:81 · initSettingsMenu:94

### js/settings-personal.js  _(155 líneas)_
**Estado global:** CONTACT_DATA_KEY:2 · PERSONAL_NOTES_KEY:3 · HAIRDRESSER_NOTES_KEY:4 · PERSONAL_NOTES_TAB:5 · CONTACT_LIMIT:6 · CONTACT_FIELDS:7 · CONTACT_GROUPS:8

**Funciones:** normalizeContactData:14 · text:16 · validateContactData:29 · string:31 · mergeContactData:39 · signature:44 · contactData:50 · personalNote:51 · hairdresserNote:52 · contactValueText:53 · contactFieldHtml:56 · renderContactGroups:59 · readContactFields:72 · contactSelectionText:77 · contactPrimaryIndex:85 · contactResizeFields:86 · bindContactGroups:87 · update:88 · openPersonalData:100 · close:102 · selection:108 · openPersonalNotes:131 · close:134 · selectTab:140

### js/statistics-ui.js  _(8 líneas)_
**Funciones:** renderStatsCard:2 · renderStatsMetrics:5

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

### js/swipe-render.js  _(79 líneas)_
**Estado global:** EV_SWIPE_ORDER:3

**Funciones:** swipeWithState:8 · swipeMonth:15 · swipeNext:16 · swipeFrame:17 · swipeKeepsPreviewScroll:18 · swipeCalendarPreview:23 · swipeEventsPreview:31 · swipeRenderPreview:47

### js/tasks-drag.js  _(71 líneas)_
**Estado global:** TASKS_DRAG_CANCEL:2

**Funciones:** tasksStopDrag:3 · bindListReorder:4 · focus:6 · announce:7 · rows:18 · cleanup:19 · cancel:23 · key:24 · place:25 · tick:35 · move:40 · end:52 · finish:59 · bindTasksReorder:68

### js/tasks-events.js  _(63 líneas)_
**Funciones:** tasksEventMatches:3 · tasksEventId:6 · tasksEventRow:11 · tasksEventMonthReminder:14 · tasksEventLimit:15 · tasksEventVisible:21 · tasksReconcileEvents:26 · tasksSetEventDone:51 · tasksRebindEventRefs:59

### js/tasks-float.js  _(80 líneas)_
**Estado global:** TASKS_FAB_HIDDEN_KEY:3 · TASKS_FAB_HIDDEN:4 · TASKS_FLOAT:5

**Funciones:** tasksFloatPosition:6 · tasksDock:17 · tasksUpdateFab:20 · initTasks:27 · end:49 · resize:61 · tasksSetAccessHidden:71 · tasksRestoreAccess:72 · bindTasksRestoreGesture:73 · distance:75

### js/tasks-view.js  _(135 líneas)_
**Estado global:** TASKS_VIEW:2 · TASKS_ICON:3

**Funciones:** renderTasks:4 · tasksDateLabel:20 · renderTasksList:24 · renderTaskRow:38 · openTasks:55 · closeTasks:63 · tasksKeydown:70 · renderTasksPanel:80 · tasksPerform:102 · tasksRowAction:106 · tasksFocusRow:128 · renderTaskColors:132

### js/tasks.js  _(102 líneas)_
**Estado global:** TASKS_KEY:3 · TASKS_COLORS:4

**Funciones:** tasksValidate:5 · tasksValidTimestamp:20 · tasksNormalize:21 · tasksData:33 · tasksSave:38 · tasksMigrate:39 · tasksMerge:44 · tasksItems:50 · tasksPendingRows:54 · tasksNeedsDateChoice:55 · tasksCreate:58 · tasksChange:63 · tasksMoveCompleted:80 · tasksUndoMove:85 · tasksMove:90 · tasksReminder:97 · tasksReminderSeen:101

### js/time-picker.js  _(145 líneas)_
**Funciones:** timePickerInitial:2 · markPickerDrum:8 · timePickerDrum:16 · bindMinuteDrumMotion:22 · finish:27 · position:35 · coast:39 · release:62 · bindTimePickerDrum:73 · index:75 · mark:76 · move:80 · openTimePicker:90 · close:101 · escape:107 · save:116

## CSS

> `css/styles.css` se genera: editar las fuentes listadas a continuación.

### css/source/base.css  _(334 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:20
- El tema crema tiene sus propios tokens en theme-cream.css.:39
- HEADER:43
- JORNADA DEFECTO:53
- Barra vertical que separa la campana del bloque de navegacion:90
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:96
- WEEK CARDS:111
- WEEK ACTIONS:143
- BOTTOM SHEET (day type selector):152
- TOAST:174
- Tema claro: el fondo oscuro con letra de color no se leia bien:184
- SW UPDATE BUTTON (en menú ⋯):188
- Aviso pulsable entero (el de nueva version): se nota que se puede tocar.:192
- ANIMATIONS:196
- Las semanas se desplazan con el mes, sin otra entrada vertical.:198
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:221
- OVERLAY BASE (summary, econ, bday, events):227
- SHARED OVERLAY HEADER:232
- SHARED BODY:246
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:295
- Vacaciones config:301
- Quitar festivos/vacaciones checkboxes:305
- Month summary breakdown:327
- Ausencia list tag:332

**Rangos por prefijo de clase:**
.action-btn:145-149 · .app-logo:48-48 · .app-version:109-109 · .bd-export:243-243 · .bottom-sheet:155-156 · .btn-icon:86-86 · .csv-export:59-60 · .data-actions:82-82 · .data-btn:83-98 · .data-menu:100-106 · .day-cell:123-225 · .day-date:128-128 · .day-hours:129-129 · .day-name:127-127 · .day-status:136-136 · .days-grid:122-122 · .default-hours:55-64 · .ev-dot:141-141 · .ev-dots:140-140 · .ev-upcoming:300-300 · .ev-week:296-297 · .excl-item:326-326 · .excl-row:306-306 · .full-overlay:228-229 · .header:44-46 · .header-brand:47-47 · .hour-chip:73-74 · .hour-chips:72-72 · .hour-picker:70-71 · .hours-chip:67-68 · .hours-chips:66-66 · .hours-control:54-54 · .hours-label:65-65 · .hours-panel:69-69 · .ico-doc:61-61 · .ico-exportar:244-244 · .month-nav:49-51 · .month-stat:76-79 · .month-summary:75-75 · .ms-breakdown:328-330 · .ms-hrs:81-81 · .ms-label:80-80 · .ms-num:77-77 · .ms-sep:331-331 · .option-desc:171-171 · .option-dot:164-168 · .option-hours:172-172 · .option-info:169-169 · .option-label:170-170 · .overlay:153-154 · .sent-badge:119-119 · .settings-quick:107-108 · .sheet-handle:157-157 · .sheet-option:161-163 · .sheet-options:160-160 · .sheet-subtitle:159-159 · .sheet-title:158-158 · .sw-upd:189-189 · .sy-body:247-247 · .sy-card:258-265 · .sy-cards3:250-250 · .sy-cards4:251-251 · .sy-chart:276-276 · .sy-hdr:237-237 · .sy-header:233-236 · .sy-lbl:267-267 · .sy-list:280-333 · .sy-month:294-294 · .sy-note:277-279 · .sy-pdf:241-242 · .sy-puente:286-290 · .sy-section:248-249 · .sy-spain:252-257 · .sy-suelto:291-293 · .sy-table:268-272 · .sy-td:273-273 · .sy-tr:274-275 · .sy-val:263-266 · .sy-year:234-240 · .toast:175-194 · .toast-undo:191-191 · .vac-config:302-304 · .week-actions:144-144 · .week-card:113-207 · .week-header:116-116 · .week-info:117-118 · .week-total:120-120 · .weeks-container:112-112

### css/source/navigation-controls.css  _(34 líneas)_

**Secciones:**

- Variantes compactas de las flechas del cuatrimestre.:15
- Hoy: base y acentos de cada consumidor, con la especificidad existente.:23

**Rangos por prefijo de clase:**
.bday-today:33-33 · .ev-agenda:28-28 · .ev-calendar:30-30 · .fiscal-year:20-21 · .nav-btn:12-13 · .sy-back:4-8 · .sy-nav:9-17 · .today-btn:24-25

### css/source/economics.css  _(686 líneas)_

**Secciones:**

- ECONOMICS:1
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:6
- Summary sublabel (hours breakdown):23
- Ingresado box (formerly cobrado) — neutral:32
- ECONOMICS v2: tabs + nuevas secciones:66
- Estudio Cambio — grouped nav:83
- Estudio — tariff comparison cards:96
- Análisis hipoteca — secciones organizadas:117
- Mis gastos — budget table:134
- Year selector for per-year fiscal tabs:147
- §1.1 Tarifa dual:156
- §1.3 Stats por hora/día:168
- §1.4 Toggles:175
- §1.5 Declaración IRPF:180
- Tab 2: Comparador:193
- Calcular Tarifa (sim):221
- Scenario zones (Comparar Escenarios):239
- Análisis Ec. Personal:256
- Bloques de la Subrogación:258
- Fiscal config modal — purple theme override:301
- Fiscal config modal:303
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
.ah-cuota:121-123 · .ah-donut:131-133 · .ah-section:118-120 · .ah-total:128-130 · .ah-vs:124-127 · .analisis-card:268-270 · .analisis-cards:257-257 · .analisis-hbar:271-276 · .analisis-input:286-289 · .analisis-ins:295-300 · .analisis-insurance:294-294 · .analisis-mortgage:277-293 · .econ-add:203-204 · .econ-ahorro:427-434 · .econ-annual:25-25 · .econ-avg:26-354 · .econ-bracket:186-192 · .econ-calc:337-338 · .econ-casc:341-348 · .econ-cascade:340-340 · .econ-chart:216-217 · .econ-comp:194-218 · .econ-decl:181-358 · .econ-distrib:664-678 · .econ-donut:445-460 · .econ-equiv:659-662 · .econ-fiscal:438-443 · .econ-formula:45-48 · .econ-gastos:360-372 · .econ-gear:153-154 · .econ-hdr:67-155 · .econ-ingresado:33-33 · .econ-irpf:374-436 · .econ-legend:219-220 · .econ-line:214-215 · .econ-month:50-63 · .econ-mr:656-657 · .econ-multi:648-658 · .econ-opt:333-336 · .econ-qcard:15-22 · .econ-qcell:11-14 · .econ-qm:20-20 · .econ-qmonth:18-19 · .econ-quarter:7-10 · .econ-rate:157-165 · .econ-row:34-44 · .econ-sc:196-685 · .econ-scenario:195-195 · .econ-section:64-64 · .econ-sim:222-232 · .econ-stats:169-174 · .econ-sub:70-82 · .econ-tab:68-69 · .econ-toggle:176-179 · .econ-val:49-49 · .est-btn:91-95 · .est-card:101-103 · .est-detail:98-98 · .est-field:110-116 · .est-fields:109-109 · .est-group:89-93 · .est-modo:104-104 · .est-nav:88-88 · .est-section:97-97 · .est-tariff:99-108 · .ev-sub:76-78 · .excl-item:167-167 · .excl-row:166-166 · .fiscal-add:326-489 · .fiscal-body:304-308 · .fiscal-bracket:317-325 · .fiscal-compras:518-553 · .fiscal-copy:150-152 · .fiscal-custom:314-314 · .fiscal-ded:528-542 · .fiscal-desgrav:491-543 · .fiscal-despacho:555-576 · .fiscal-error:330-330 · .fiscal-gasto:462-524 · .fiscal-gastos:544-544 · .fiscal-hdr:474-474 · .fiscal-highlight:515-515 · .fiscal-onoff:557-558 · .fiscal-pct:315-324 · .fiscal-period:470-471 · .fiscal-radio:309-313 · .fiscal-save:328-329 · .fiscal-section:305-482 · .fiscal-sticky:479-479 · .fiscal-subsection:483-484 · .fiscal-tab:475-477 · .fiscal-viaje:485-486 · .fiscal-vinc:568-569 · .fiscal-year:148-149 · .hip-add:646-646 · .hip-auto:597-597 · .hip-bar:583-590 · .hip-cancel:633-633 · .hip-cf:602-607 · .hip-edit:629-631 · .hip-g2:601-601 · .hip-grid:595-595 · .hip-period:635-644 · .hip-resumen:578-582 · .hip-ro:620-627 · .hip-save:632-632 · .hip-section:596-645 · .hip-stat:592-594 · .hip-stats:591-591 · .hip-sub:599-599 · .hip-vinc:598-598 · .hip-vr:609-618 · .mg-budget:135-144 · .mg-cat:145-145 · .mg-desgrav:146-146 · .mg-sort:141-141 · .rate-input:4-4 · .rate-label:3-3 · .rate-row:2-2 · .rate-suffix:5-5 · .rut-sub:74-80 · .sim-combo:234-238 · .sim-field:223-224 · .sim-hr:233-233 · .sim-period:230-230 · .sim-target:225-229 · .study-intro:85-87 · .sub-block:259-260 · .sub-row:261-267 · .sy-sublbl:24-24

### css/source/birthdays.css  _(159 líneas)_

**Secciones:**

- BIRTHDAYS:1
- Vista compacta: dos nombres y acceso al listado completo, sin alterar la casilla.:17
- Misma posición en las tres vistas; compactar solo el botón.:32
- VIP controls bar:37
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:48
- VIP edit mode item states:51
- Feat 1: Buscador en lista por meses:61
- Upcoming birthdays:87
- Fin de semana suave; hoy conserva su borde y su fecha destacada.:104
- Categorías de personas y filtros de consulta.:125

**Rangos por prefijo de clase:**
.bd-detail:149-155 · .bday-add:102-103 · .bday-alarm:152-152 · .bday-badge:18-21 · .bday-buscar:64-66 · .bday-calendar:7-23 · .bday-cancel:49-50 · .bday-cell:11-105 · .bday-day:154-158 · .bday-detail:141-141 · .bday-filter:145-147 · .bday-group:126-148 · .bday-hdr:6-6 · .bday-header:24-33 · .bday-io:70-86 · .bday-list:36-60 · .bday-month:35-35 · .bday-num:15-15 · .bday-person:144-144 · .bday-search:67-69 · .bday-symbol:2-2 · .bday-upcoming:3-101 · .bday-vip:26-47 · .bday-week:8-10 · .data-btn:5-5 · .ev-btn:4-4 · .ev-cell:106-123 · .ev-io:72-72 · .io-peligro:77-85 · .io-primaria:76-83 · .vip-no:44-45

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

### css/source/navigation-alarms.css  _(105 líneas)_

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
- MACRO URL EN MENÚ:80
- Feat 4: Nav-bar emoji alignment:86
- Birthday detail / form overlays:96

**Rangos por prefijo de clase:**
.bd-alarm:26-78 · .bd-detail:97-104 · .bday-hdr:6-6 · .bday-upcoming:24-24 · .bday-vip:23-23 · .ev-alarm:49-55 · .ev-hdr:7-7 · .ev-upcoming:29-32 · .macro-section:81-82 · .macro-url:83-85 · .nav-bar:3-95 · .overlay-nav:2-4 · .sy-puente:14-21 · .sy-tab:9-12

### css/source/event-panels.css  _(417 líneas)_

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
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):130
- Perímetro puente: capa inferior a eventos:132
- Bright past: bombilla override:152
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:159
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":164
- Quad label 3 lines:167
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:174
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:176
- Events list view:178
- Event form overlay (inside eventsOverlay):192
- Flechas de carrusel: mantener el padding, fuente y borde heredados de .ev-btn.:216
- Relleno, para que haga pareja con el naranja de "Editar evento":224
- Event detail:230
- El color del título depende de la familia; el símbolo conserva su identidad.:238
- Fichas de consulta: jerarquía común, datos legibles y controles discretos.:246
- Consulta compacta: fecha y estado comparten fila; el carrusel no cambia de alto.:283
- Formulario de evento: marco fijo, texto a la izquierda y agenda a la derecha.:332
- Solo el contenido de la ficha acompaña el dedo.:372
- Las etiquetas comparten la línea de Título/Notas; solo el dato ocupa la tarjeta.:381

**Rangos por prefijo de clase:**
.data-btn:2-2 · .ev-alarm:414-414 · .ev-ann:75-77 · .ev-annual:129-151 · .ev-badge:177-177 · .ev-badges:40-40 · .ev-bar:111-111 · .ev-bars:33-33 · .ev-bright:124-166 · .ev-btn:215-226 · .ev-car:55-390 · .ev-category:385-388 · .ev-cell:137-173 · .ev-char:204-204 · .ev-checkbox:209-209 · .ev-chip:92-92 · .ev-colors:205-205 · .ev-date:206-206 · .ev-day:43-102 · .ev-delete:391-391 · .ev-detail:231-392 · .ev-edit:220-221 · .ev-event:334-340 · .ev-field:198-199 · .ev-fixed:341-347 · .ev-form:193-370 · .ev-hdr:3-5 · .ev-input:200-201 · .ev-io:228-229 · .ev-kind:389-389 · .ev-large:318-325 · .ev-list:14-191 · .ev-main:6-6 · .ev-management:266-268 · .ev-month:22-123 · .ev-multi:37-145 · .ev-num:175-175 · .ev-otros:53-107 · .ev-part:154-154 · .ev-puente:133-133 · .ev-quad:168-169 · .ev-repeat:210-210 · .ev-routine:393-393 · .ev-rut:98-395 · .ev-schedule:363-384 · .ev-stepped:126-128 · .ev-textarea:202-203 · .ev-title:120-121 · .ev-toggle:207-208 · .ev-types:17-19 · .ev-view:4-8 · .ev-wd:212-213 · .ev-week:28-131 · .ev-weekday:211-211 · .rut-marker:94-97 · .rut-week:400-402 · .rut-wpick:403-407 · .swipe-content:398-398 · .sy-body:397-397

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

### css/source/statistics.css  _(27 líneas)_

**Secciones:**

- Marco único para Bodas, Rutinas y Eventos. Los datos conservan su dominio.:1

**Rangos por prefijo de clase:**
.stats-empty:23-23 · .stats-head:7-8 · .stats-list:24-25 · .stats-metric:11-14 · .stats-metrics:9-10 · .stats-note:15-15 · .stats-section:6-26 · .stats-stack:2-5 · .stats-table:18-22

### css/source/wedding-moves.css  _(330 líneas)_

**Secciones:**

- Pestana Bodas y pestana partida Vacaciones/Festivos:1
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:2
- Acento de acciones propio; los botones compartidos conservan su color por defecto fuera de Bodas.:13
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):26
- Filas del panel de un aviso:40
- Estadisticas:44
- Barras horizontales de reparto (componente generico: hBarRows):48
- Dia cerrado: no admite mas clases:73
- Una clase a la que le falta la hora o la sala se marca ella sola.:84
- Fila con cambios sin guardar:89
- Filtros de Parejas como chips pulsables:101
- El color de la pareja va en un punto delante; el nombre, en color normal:164
- Sala sin asignar: se marca en naranja para que cante en la lista:169
- Nota propia del dia en la lista de Proximos:172
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:174
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):176
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:184
- Editar siempre en naranja, como en el resto de la app:190
- Los tres botones del detalle de pareja comparten aspecto:207
- Subpestana Calendario de bodas:247
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:261
- Dia resaltado al pulsar una pareja en la leyenda:268
- Medible antes de abrir: colocar las ruedas sin mostrar su posición inicial.:274
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:296
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:298
- etiqueta al minimo: el nombre de la pareja necesita el resto:307
- el color de la pareja va en un punto, no tinendo el nombre:310
- Los tres botones de la pareja, en una sola linea:317
- Buscador y boton de anadir en la misma fila:320
- Tarjeta de pareja desplegada en su sitio (antes era un modal):326

**Rangos por prefijo de clase:**
.boda-actions:199-199 · .boda-add:201-201 · .boda-asg:224-246 · .boda-buscar:321-323 · .boda-cal:248-273 · .boda-card:106-329 · .boda-chip:103-105 · .boda-chips:102-102 · .boda-cl:161-198 · .boda-class:85-160 · .boda-controls:63-63 · .boda-couple:142-144 · .boda-cpk:215-223 · .boda-create:17-19 · .boda-date:200-200 · .boda-day:79-122 · .boda-det:206-319 · .boda-dia:149-151 · .boda-distribution:23-25 · .boda-dot:110-110 · .boda-falta:117-117 · .boda-filters:66-66 · .boda-fsel:67-70 · .boda-ftoggles:71-72 · .boda-hd:194-196 · .boda-inp:137-137 · .boda-iss:41-43 · .boda-issue:28-39 · .boda-issues:27-27 · .boda-legend:202-205 · .boda-mini:156-189 · .boda-mode:55-57 · .boda-multi:152-158 · .boda-name:111-111 · .boda-ok:118-118 · .boda-overview:21-21 · .boda-place:145-171 · .boda-prog:113-114 · .boda-ro:162-170 · .boda-save:99-100 · .boda-savebar:95-98 · .boda-search:324-324 · .boda-sec:12-20 · .boda-sobra:119-119 · .boda-sort:325-325 · .boda-stat:45-47 · .boda-sticky:8-10 · .boda-sum:59-62 · .boda-summary:58-58 · .boda-swap:127-134 · .boda-time:138-138 · .boda-tp:277-280 · .boda-wed:112-112 · .ev-alarm:177-183 · .ev-bficha:303-303 · .ev-bfila:304-313 · .ev-bpunto:311-311 · .ev-bver:316-316 · .ev-car:299-300 · .ev-detail:297-297 · .ev-upcoming:173-175 · .ev-wk:185-187 · .hbar-lbl:51-51 · .hbar-row:50-50 · .hbar-rows:49-49 · .hbar-track:52-53 · .hbar-val:54-54 · .rut-wpick:290-295 · .sy-body:5-11

### css/source/routines.css  _(106 líneas)_

**Secciones:**

- Horario distinto segun el dia:1
- Selector de icono de rutina:6
- Editor semanal: controles comunes, opciones legibles y marco estable.:70

**Rangos por prefijo de clase:**
.ev-shape:19-19 · .rut-add:56-56 · .rut-card:46-54 · .rut-day:62-63 · .rut-days:61-61 · .rut-dot:49-49 · .rut-first:16-16 · .rut-flex:13-21 · .rut-hist:65-68 · .rut-hpd:2-5 · .rut-icon:7-11 · .rut-name:50-50 · .rut-pct:55-55 · .rut-plan:22-45 · .rut-sec:12-12 · .rut-session:42-42 · .rut-sug:57-60 · .rut-susp:64-64 · .rut-tag:51-52 · .rut-vacio:53-53 · .rut-week:72-103

### css/source/shared-refinements.css  _(992 líneas)_

**Secciones:**

- Lista "Todos": buscador, orden y borrado con pulsacion larga:1
- Diálogo: modo de importación (añadir vs reemplazar):16
- PRINT:29
- Separacion de siluetas incluso entre grosores distintos.:49
- Controles tactiles: mismo minimo en filtros y navegacion, sin agrandar marcadores.:63
- Editar: tono comun, con geometria propia de cada pantalla.:73
- Marca oficial con transparencia; conserva contraste en ambos temas.:87
- Geometría constante aunque una subpestaña tenga más contenido y scroll.:107
- Catálogos: cabecera de sección, ficha y controles siempre en el mismo orden.:125
- Las tres vistas de Cumpleaños comparten el naranja en ambos temas.:155
- Text edits retain the solid orange; only standalone pencils use a tint.:164
- Etiquetas y casillas comparten tono dentro de Eventos, tambien en sus hojas.:171
- Canceladas: visibles solo en las vistas de detalle, con marca y tono apagado.:238
- Formulario de rutina: ritmo y etiquetas comunes, sin alterar otros paneles.:253
- Cancelaciones sutiles: el calendario mensual conserva el color original.:263
- Pestañas de Eventos: la seleccion solo intensifica el fondo.:275
- Titulo y estado separados para que "saltada" nunca quede tachado.:300
- Casillas vacias: mantener el tono de su etiqueta o su color explicito.:310
- El titulo queda dentro del borde de 1.5px de su caja continua.:315
- Economia, Fiscal y Escenarios: tono constante, seleccion por fondo.:321
- Los SVG comparten caja; Home solo es mas grande con los iconos originales.:338
- Una identidad de color por ventana para ambos juegos de iconos.:342
- Mes y titulo fijo comparten una referencia de altura: sin franja abierta.:373
- Semanas enviadas en claro: verdes suaves, sin pastillas oscuras.:381
- Borde discreto para identificar semanas enviadas en ambos temas.:386
- Filtros junto al buscador sin ensanchar la ventana movil.:390
- Configuracion de tarifa: controles verdes y valores neutros.:404
- Aire entre dias; el hueco entre eventos del mismo dia se conserva.:422
- Texto del trayecto alineado con el titulo, sin mover las tarjetas puntuales.:439
- Controles de plegado compartidos: superficie, foco y chevrón dibujado.:442
- Los controles de cumpleaños heredan el tema de la vista que los aloja.:464
- Calendario mensual: malla tranquila; conserva la geometría de eventos y puentes.:476
- La cabecera sigue su mes; hoy comparte el acento de cumpleaños.:500
- Lista de cumpleaños: etiquetas opcionales y acceso a hoy junto al mes.:512
- Controles compactos y paneles estables: solo se desplaza su contenido.:539
- Buscador y filtro comparten fila; las opciones conservan todo el ancho.:582
- Ficha compacta, acciones compartidas y fecha sin controles nativos.:626
- Cumpleaños: jerarquía por espacios y edición junto a cada campo.:660
- Todas las personas de hoy comparten acento; solo la primera lleva la línea.:683
- Separadores discretos con aire y alarma dentro de su propia sección.:689
- Ficha de cumpleaños: paneles como en Próximos, sin separadores sueltos.:698
- Controles de cumpleaños: aire en los bordes y símbolos sin alterar las filas.:724
- Cumpleaños: resumen abierto y paneles blancos con acento suave.:735
- Fichas ajustadas a su contenido y acciones con tonos suaves.:750
- Lista de cumpleaños: controles compactos y edición por etiqueta.:805
- Todos: búsqueda y categoría a ancho completo, ordenación segmentada.:814
- Centro geométrico del panel: ambos extremos reservan el mismo ancho.:834
- Configuración personal: grupos de registros con edición explícita.:885
- Filtros: contorno de identidad, nunca relleno gris al seleccionar.:901
- Próximos: el selector de cumpleaños conserva su posición al alternar.:911
- Estadísticas: período explícito y días únicos.:917
- v457: selección de categoría separada de su desplegable.:943
- Mantener la misma composición de texto antes, durante y después del swipe.:956
- Navegación cuadrada, calendarios y accesos de consulta (v481).:962
- Conservar fuentes y controles a su tamaño habitual, también en móviles estrechos.:966

**Rangos por prefijo de clase:**
.alarm-now:988-988 · .alarm-panel:985-987 · .app-update:677-679 · .bd-detail:599-600 · .bd-panel:553-835 · .bday-category:525-694 · .bday-date:634-733 · .bday-detail:567-810 · .bday-edit:809-809 · .bday-filter:516-591 · .bday-first:537-537 · .bday-form:672-673 · .bday-group:513-676 · .bday-hdr:156-157 · .bday-header:151-466 · .bday-label:543-543 · .bday-list:522-726 · .bday-month:169-740 · .bday-name:601-681 · .bday-next:99-100 · .bday-no:573-573 · .bday-person:520-566 · .bday-show:524-628 · .bday-sub:280-281 · .bday-today:506-725 · .bday-upcoming:54-491 · .bday-vip:492-828 · .boda-catalog:80-85 · .boda-cfg:126-142 · .boda-config:76-123 · .boda-date:144-162 · .boda-day:113-113 · .boda-field:114-119 · .boda-filter:58-60 · .boda-mini:66-66 · .boda-pfilters:57-61 · .boda-stat:989-989 · .boda-sticky:77-139 · .boda-teachers:101-101 · .contact-add:897-897 · .contact-entry:890-895 · .contact-group:887-889 · .contact-remove:896-896 · .data-actions:339-339 · .data-btn:340-351 · .econ-equiv:460-460 · .econ-tab:322-326 · .econ-tariff:405-462 · .energy-tariff:451-453 · .est-nav:324-325 · .ev-alarm:758-759 · .ev-annual:495-495 · .ev-bday:282-529 · .ev-bright:441-441 · .ev-btn:760-761 · .ev-calendar:963-978 · .ev-current:980-980 · .ev-del:13-14 · .ev-filter:779-948 · .ev-hairdresser:983-984 · .ev-list:2-952 · .ev-month:477-982 · .ev-multi:50-71 · .ev-rut:239-306 · .ev-search:3-7 · .ev-sort:8-53 · .ev-stat:918-954 · .ev-type:426-428 · .ev-types:425-794 · .ev-up:266-915 · .ev-upcoming:916-940 · .ev-view:65-65 · .ev-wk:221-440 · .export-choice:764-925 · .export-folder:742-776 · .fiscal-hdr:499-499 · .fiscal-hip:402-403 · .fiscal-tab:323-323 · .hip-rate:468-472 · .hip-ro:496-497 · .imp-mode:17-27 · .invoice-field:938-938 · .invoice-sheet:858-858 · .macro-url:69-69 · .nav-icon:359-369 · .nav-pro:333-345 · .nav-style:357-357 · .panel-header:836-837 · .personal-copy:874-874 · .personal-data:873-880 · .personal-note:898-930 · .personal-notes:931-935 · .rate-input:46-46 · .rut-addition:201-218 · .rut-agenda:215-216 · .rut-cancelled:242-301 · .rut-done:762-763 · .rut-history:185-236 · .rut-hpd:183-183 · .rut-icon:167-168 · .rut-recovery:210-219 · .rut-session:220-220 · .rut-skipped:302-303 · .rut-week:184-184 · .selected:366-366 · .settings-copy:866-869 · .settings-details:102-104 · .settings-edit:70-886 · .settings-editor:843-881 · .settings-field:864-883 · .settings-is:853-960 · .settings-menu:437-437 · .sw-upd:876-876 · .sy-back:37-37 · .sy-body:35-532 · .sy-card:41-41 · .sy-header:36-467 · .sy-lbl:40-40 · .sy-period:411-418 · .sy-table:42-42 · .sy-tr:43-43 · .sy-val:39-39 · .sy-year:38-38 · .week-action:830-831 · .week-card:387-387 · .weeks-container:957-957 · .wm-logo:88-246

### css/source/home-sharing.css  _(171 líneas)_

**Secciones:**

- Cabecera de Home opaca, incluso sobre los botones oscuros de las semanas.:1
- Selector de eventos para compartir por iCalendar:28
- Selector de exportación: controles compactos y lista con espacio propio.:29
- Colores por tramo, compartidos entre las dos vistas de próximos cumpleaños.:63
- Compartir: cabecera centrada, categorías completas y lista compacta.:81
- Próximos comparte identidad celeste en sus cuatro subpestañas.:114
- Mis Datos: atajos, registros plegables y contenido multilínea completo.:128
- Próximos: contraste, alternancia y año centrado.:142
- Año de Estadísticas centrado sin desplazar las pestañas ni cambiar las flechas.:158
- Agenda y consultas anuales: cabecera estable y flechas neutras compartidas.:160

**Rangos por prefijo de clase:**
.boda-future:78-78 · .contact-address:124-136 · .contact-entry:123-123 · .contact-primary:134-140 · .contact-shortcuts:129-152 · .energy-contract:105-106 · .energy-field:108-109 · .energy-history:103-104 · .energy-price:107-112 · .energy-sheet:102-102 · .energy-tax:110-110 · .ev-cal:32-101 · .ev-field:77-77 · .ev-list:118-147 · .ev-period:161-164 · .ev-share:30-31 · .ev-stat:116-117 · .ev-stats:148-153 · .ev-up:144-168 · .ev-week:64-79 · .ev-wk:3-3 · .header:2-2 · .home-submission:4-17 · .home-summary:18-26 · .month-summary:20-21

### css/source/energy-refinements.css  _(292 líneas)_

**Secciones:**

- Facturas: mismos componentes que los contratos, cifras sin desbordar.:1
- Estudio energético: controles compactos y separación entre apartados.:11
- Ultimo dia de ensayo: distintivo compartido y pulso solo en el mensual.:14
- Ventana energética: cabecera fija, scroll del cuerpo, gráficos de un año.:24
- Cada pestaña ocupa su celda completa, igual que en Eventos.:38
- Identidad propia de cada pestaña, sin alterar el sistema general.:41
- Lados explícitos: CSSOM conserva los bordes al copiar la vista al swipe.:51
- Filas de parejas: controles compactos, columnas alineadas.:96
- Navegación: la misma geometría en Home y en las ventanas.:133
- Tarjetas compactas: días visibles y un único estilo para inicio y fin.:144
- Selección por fondo en las subpestañas de Eventos; cada una conserva su tono.:162
- Histórico: esquinas opacas incluso cuando la cabecera queda fija.:196
- El selector de día conserva marco y seis huecos semanales al cambiar de mes.:266
- El ancho del nombre del mes no desplaza las flechas compartidas.:281
- Deshacer acompaña a la ficha de sesión sin tapar sus controles de estado.:284
- Coste sin cobertura calculable: explicación en lugar de un gráfico vacío.:288

**Rangos por prefijo de clase:**
.boda-asg:101-283 · .boda-det:97-100 · .boda-last:15-18 · .contact-shortcuts:209-212 · .data-actions:134-135 · .energy-bar:86-86 · .energy-caption:2-2 · .energy-choice:12-12 · .energy-compare:128-128 · .energy-contract:4-5 · .energy-cost:82-291 · .energy-coverage:73-73 · .energy-extremes:69-69 · .energy-fee:36-37 · .energy-field:7-7 · .energy-fields:9-9 · .energy-info:57-59 · .energy-inline:79-79 · .energy-legend:87-87 · .energy-metric:120-122 · .energy-metrics:119-119 · .energy-overview:61-63 · .energy-period:64-67 · .energy-price:178-183 · .energy-range:88-88 · .energy-reconciliation:72-72 · .energy-scenario:129-129 · .energy-section:56-56 · .energy-supplier:70-123 · .energy-table:3-3 · .energy-tabs:39-50 · .energy-tariff:75-179 · .energy-tax:68-126 · .energy-vat:124-124 · .energy-window:25-118 · .energy-year:6-94 · .ev-btn:141-141 · .ev-cell:277-278 · .ev-day:279-279 · .ev-io:131-131 · .ev-main:159-160 · .ev-order:234-246 · .ev-routine:230-232 · .ev-routines:224-228 · .ev-stat:213-213 · .ev-stats:214-220 · .ev-type:229-229 · .ev-up:255-264 · .ev-upcoming:168-172 · .ev-wk:16-171 · .imp-mode:108-108 · .imp-preview:109-113 · .nav-bar:136-136 · .rut-addition:249-276 · .rut-bulk:189-194 · .rut-card:153-208 · .rut-day:142-148 · .rut-days:145-145 · .rut-dpick:140-274 · .rut-history:185-200 · .rut-hora:149-151 · .rut-month:193-193 · .rut-recovery:139-139 · .rut-routine:155-155 · .rut-session:138-204 · .rut-time:152-152 · .rut-weekdays:146-146 · .sy-body:166-166 · .sy-hdr:258-258

### css/source/home-reminders.css  _(75 líneas)_

**Secciones:**

- Recordatorios de inicio: marco fijo, filas compactas y detalles interiores.:1
- Excepción de filas unidas: el contorno y el color pertenecen al día.:54

**Rangos por prefijo de clase:**
.home-birthday:47-52 · .home-pending:64-72 · .home-popup:3-73 · .home-reminder:9-63 · .home-tasks:69-70 · .reminders-access:2-2

### css/source/invoices.css  _(108 líneas)_

**Secciones:**

- Revisar jornadas y cálculo antes de las acciones; caben juntos en móvil.:63

**Rangos por prefijo de clase:**
.home-invoice:3-5 · .hours-control:1-6 · .hours-export:50-61 · .invoice-action:75-75 · .invoice-actions:21-21 · .invoice-body:10-10 · .invoice-calculation:77-89 · .invoice-card:12-14 · .invoice-config:19-94 · .invoice-confirm:26-26 · .invoice-day:25-25 · .invoice-days:98-104 · .invoice-document:34-34 · .invoice-equals:84-84 · .invoice-error:27-27 · .invoice-eye:46-47 · .invoice-field:16-16 · .invoice-fields:15-37 · .invoice-filename:28-28 · .invoice-kairo:68-107 · .invoice-line:80-83 · .invoice-mail:90-90 · .invoice-money:85-85 · .invoice-month:11-95 · .invoice-note:17-17 · .invoice-send:65-67 · .invoice-sheet:8-74 · .invoice-status:18-18 · .invoice-summary:44-45 · .invoice-tool:91-93 · .invoice-totals:20-97

### css/source/theme-cream.css  _(90 líneas)_

**Secciones:**

- Bordes suaves en reposo; el color completo identifica la selección.:86

**Rangos por prefijo de clase:**


### css/tasks.css  _(100 líneas)_

**Secciones:**

- Tareas globales: estilos aislados de calendarios y pestañas existentes.:1
- Tarjetas pastel y arrastre con hueco visible.:84

**Rangos por prefijo de clase:**
.home-popup:78-78 · .task-actions:60-63 · .task-colors:90-92 · .task-content:45-47 · .task-date:52-53 · .task-done:48-49 · .task-drag:95-96 · .task-drop:65-66 · .task-editor:57-59 · .task-grip:54-94 · .task-linked:93-93 · .task-more:56-56 · .task-moving:64-64 · .task-row:43-89 · .task-title:46-46 · .tasks-add:38-40 · .tasks-count:17-17 · .tasks-day:50-51 · .tasks-docked:18-19 · .tasks-dragging:97-98 · .tasks-drop:11-15 · .tasks-empty:74-76 · .tasks-fab:4-16 · .tasks-footer:67-68 · .tasks-header:26-31 · .tasks-heading:27-28 · .tasks-list:42-42 · .tasks-move:69-73 · .tasks-open:2-3 · .tasks-overlay:20-24 · .tasks-reminder:79-80 · .tasks-reminders:32-32 · .tasks-sheet:23-25 · .tasks-status:77-77 · .tasks-tabs:34-37

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

