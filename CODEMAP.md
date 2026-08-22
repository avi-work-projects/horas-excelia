# CODEMAP — índice de símbolos

> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**
> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí
> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.

## JavaScript

### js/alarms.js  _(48 líneas)_
**Estado global:** ALARMS_SK:8 · ALARMS:9

**Funciones:** saveAlarms:17 · addAlarm:23 · removeAlarm:30 · isAlarmPast:35 · nextAlarmTime:43

### js/birthdays.js  _(1015 líneas)_
**Estado global:** BDAY_STORAGE_KEY:5 · BDAY_YEAR:6 · BDAY_EDIT:7 · BDAY_SEARCH:8 · BDAY_FILTER_VIP:9 · BDAY_EDIT_VIP:10 · BDAY_VIP_PENDING:11 · BDAY_ALARM_SET_KEY:65 · BDAY_ALARM_SET:66 · BDAY_ALARM_COUNT_KEY:67 · BDAY_ALARM_COUNT:68 · BDAY_PALETTE:72 · BDAYS:76 · DN7:236

**Funciones:** _showBdayInlineCtrl:17 · tc:85 · bdName:86 · getBdayColor:88 · getBdaysOn:97 · daysUntil:99 · hasUpcomingBday:106 · updateBdayBtn:112 · getBdayAlarmKey:122 · isBdayAlarmSet:123 · setBdayAlarmState:124 · syncVipBdaysToEvents:130 · renderBdayUpcoming:155 · getBdaysInRange:160 · bdayLabel:175 · renderGroup:184 · renderBdayCalMonth:234 · renderBdayList:275 · getEffVip:282 · renderBdayContent:324 · renderBdayDetail:392 · renderBdayAlarmPanel:413 · fmtDate:425 · openBdayAlarm:480 · _bdRefreshBoth:487 · closeBdayAlarm:492 · bindBdayAlarmEvents:494 (!147) · fmtD:610 · onOk:618 · onErr:619 · renderBdayForm:641 · openBdayDetail:674 · closeBdayDetail:684 · openBdayForm:687 · closeBdayForm:697 · bindBdayFormEvents:701 · openBday:742 · closeBday:751 · refreshBday:757 · applyBdaySearch:762 · bindBdayEvents:774 (!241) · _bdResetScroll:805 · _bdScrollToMonth:807

### js/bodas.js  _(1577 líneas)_
**Estado global:** BODAS_SK:13 · BODA_COUPLES:14 · BODA_PLACE_LIST:21 · BODA_PLACE_DEFAULT:27 · BODA_PLACE_NONE:30 · BODA_PLACE_SHORT:31 · BODA_PLACE_EMOJI:33 · BODA_WHITE:50 · BODA_SLOTS:51 · BODA_NO_TIME_COLOR:57 · BODA_NO_COUPLE_COLOR:58 · BODA_DEFAULT_TIME:59 · BODA_PALETTE:62 · BODA_CLOSED_SK:214 · BODA_CLOSED:215 · BODA_PENDING:230 · BODA_SUBTAB:271 · BODA_CLASS_MODE:272 · BODA_CLASES_SEARCH:273 · BODA_HIDE_PAST:274 · BODA_HIDE_CLOSED:275 · BODA_CARD_OPEN:276 · BODA_PAREJAS_SEARCH:277 · BODA_PAREJAS_SORT:280 · BODA_PAREJAS_FILTER:281 · BODA_CAL_HL:282 · BODA_CAL_YEAR:283 · BODA_CAL_MONTH:284 · MN2:299 · DN2:790 · BODA_ASSIGN:837 · BODA_FORM:1078 · BODA_TIME_H:1231

**Funciones:** saveBodas:18 · bodaPlaceEmoji:34 · bodaPlaceOf:38 · bodaPlaceLabel:43 · bodaNextColor:64 · bodaCouple:72 · bodaSlot:76 · bodaSlotColors:86 · bodaMarkFor:91 · evBodaSvg:97 · bodaClasses:114 · bodaPrimeraClase:118 · bodaClassesOfCouple:122 · bodaFreeClasses:125 · bodaSortClasses:128 · bodaClassesOnDay:135 · bodaNewClass:138 · bodaNormalizeClasses:153 · bodaPlaceForNewOn:188 · bodaDayFull:193 · bodaBulkCreate:198 · bodaProgress:208 · saveBodaClosed:219 · bodaIsClosed:220 · bodaToggleClosed:221 · bodaPendingCount:231 · bodaEff:233 · bodaSetPending:241 · bodaPendingApply:245 · bodaPendingDiscard:268 · _bodaLegendHtml:287 · _renderBodaCalendario:298 (!86) · renderBodasBody:384 · _bodaCmpFecha:413 · _renderBodaParejas:419 (!88) · _bodaFmt:507 · _bodaFmtCorto:508 · _renderBodaClases:515 (!90) · bodaOpenSheet:605 · bodaCloseSheet:608 · bodaCreatedAt:614 · bodaIssues:619 · _renderBodaIssueCards:635 · card:638 · openBodaIssue:659 (!81) · findEv:701 · closeBodaIssue:740 · _bodaWeekKey:743 · _renderBodaStats:750 (!88) · openBodaAssign:838 · closeBodaAssign:858 · renderBodaAssign:862 (!81) · bindBodaAssign:943 · openBodaPlacePicker:1012 · closeBodaPlacePicker:1041 · bodaAplicarCampo:1045 · bodaTrasElegir:1055 · _bodaMasUnaHora:1067 · openBodaClaseForm:1079 · _bodaFormRender:1093 (!88) · closeBodaClaseForm:1181 · openBodaCouplePicker:1187 · row:1197 · apply:1214 · closeBodaCouplePicker:1228 · openBodaTimePicker:1234 · drum:1239 · setDrum:1262 · mark:1267 · drumVal:1271 · readManual:1292 · closeBodaTimePicker:1312 · renderBodaCoupleForm:1315 · openBodaCoupleForm:1339 · closeBodaCoupleForm:1376 · bodaRefreshRow:1380 · bindBodasEvents:1407 (!170) · _guardaPendientes:1409 · _bodaCalMove:1425 · findClass:1513

### js/core.js  _(706 líneas)_
**Estado global:** APP_VERSION:6 · NAV_BACK:101 · THEME_STORAGE_KEY:104 · THEME:105 · THEME_LABELS:111 · THEME_META:112 · THEME_SEQUENCE:113 · ECON_YEAR_CONFIG:133 · MN_SHORT:135 · DN5:345 · FESTIVOS_ANIO:561

**Funciones:** normalizeMacroBase:9 · addSwipe:18 · startedInScrollX:24 · startedInPanel:37 · addLongPress:66 · start:70 · move:84 · end:87 · applyTheme:114 · cycleTheme:121 · updateThemeBtn:126 · load:140 · save:152 · loadEconYear:156 · saveEconYear:175 · fakeTrans:185 · simpleBarChart:202 · hBarRows:226 · shareOrDownload:243 · escHtml:263 · mkey:268 · getMonthH:269 · defH:275 · dayH:276 · dayT:277 · dk:278 · fd:279 · ad:280 · fh:281 · fhP:282 · isToday:283 · isPast:284 · wn:285 · weeks:288 · getWD:303 · showToast:316 · sendEmail:334 · buildMailtoBody:344 · render:366 (!97) · fmtH:442 · openSheet:463 · closeSheet:482 · selectType:488 · contarVacaciones:521 · confirmarCupoVacaciones:534 · contarFestivos:549 · confirmarCupoFestivos:562 · togSent:571 · _panelBorrarLuego:592 · _panelCancelarBorrado:603 · abrirPanel:605 · engancharFondo:620 · abrirUnaVez:638 · cerrarPanel:644 · renderNavBar:655 · bindNavBar:678 · doNav:685

### js/economics-analisis.js  _(797 líneas)_
**Estado global:** ANALISIS_SUB:6 · ANALISIS_SORT:7 · ANALISIS_FILTER_TEXT:8 · ANALISIS_FILTER_CAT:9 · ANALISIS_CAT_MODE:10 · ANALISIS_DET_MODE:11 · ANALISIS_RES_MODE:12 · ANALISIS_SEG_NORMAL:15

**Funciones:** renderEconAnalisis:17 · _renderAnalisisGastos:32 (!250) · _triDonut:282 · _renderAnalisisHipoteca:304 (!119) · _ahRow:423 · _donutChart:428 · _balanceEvolutionChart:444 · xPos:477 · yPos:478 · _renderSubrogacionAnalysis:512 (!152) · _analisisCard:664 · _analisisHBar:672 · _mortgageDiffChart:692 · xPos:712 · yPos:713 · bindEconAnalisisEvents:762 · _reRenderKeepScroll:769

### js/economics-comp.js  _(296 líneas)_
**Estado global:** ECON_COMP_SK:5 · ECON_SCENARIOS:6 · ECON_COMP_ACCUM:10 · ECON_COMP_DIFF:11 · ECON_COMP_COLORS:12 · SC_LABELS:13 · ECON_COMP_CALC:14

**Funciones:** _salaryMonths:17 · loadEconComp:23 · saveEconComp:29 · econLineChart:34 · xPos:49 · yPos:50 · renderEconComp:77 (!119) · bindEconCompEvents:196 (!100) · _selectZone:217

### js/economics-estudio.js  _(704 líneas)_
**Estado global:** ESTUDIO_HIP_ALTS:32 · ESTUDIO_HIP_CALC:33 · ESTUDIO_GAS_SCENARIOS:230 · ESTUDIO_GAS_CALC:231 · ESTUDIO_GAS_IVA:232 · ESTUDIO_ELECT_SCENARIOS:334 · ESTUDIO_ELECT_CALC:335 · ESTUDIO_ELECT_IVA:336

**Funciones:** renderEconEstudio:6 · _defaultVinc:28 · _defaultHipAlt:29 · _renderEstudioHipotecaComp:35 (!98) · bindEconEstudioEvents:133 · _estudioReRender:146 · _bindEstudioHipoteca:151 · _readEstHipAltAt:201 · _readEstHipVincAt:212 · _calcGasCost:234 · _currentGasTariff:238 · _renderEstudioGasComp:246 · _renderGasCompCard:306 · _calcElectCost:338 · _currentElectTariff:347 · _renderEstudioElectComp:352 · _renderElectCompCard:413 · _renderMultiScenarioResult:442 · _bindEstudioGas:510 · _bindEstudioElect:540 · _bindScenarios:570 · _readScenarios:589 · _bindCompFields:598 · _saveCompFields:631 · renderEstudioContent:646 · openEstudio:660 · closeEstudio:670 · reRenderEstudio:675 · bindEstudioEvents:683

### js/economics-fiscal-elect.js  _(229 líneas)_
**Estado global:** FISCAL_ELECT_EDITING:5 · GASTOS_GROUPS:125

**Funciones:** _renderElectDetalle:6 · _renderSegurosNormales:75 · _despField:90 · _despFieldMoney:99 · _renderIngresosDesgList:112 · _renderGastoItem:131 · renderGastosList:146 · _bindElectDetalle:168 · _bindSegurosNormales:213

### js/economics-fiscal-gas.js  _(108 líneas)_
**Estado global:** FISCAL_GAS_EDITING:5

**Funciones:** _ensureGasScenarios:6 · _renderGasDetalle:14 · _bindGasDetalle:72

### js/economics-fiscal-hip.js  _(1033 líneas)_
**Estado global:** DESPACHO_SK:5 · DESPACHO:6 · GROUP_CASA:110 · GROUP_UTIL:111

**Funciones:** _defaultCompra:8 · _defaultSubrogacion:9 · loadDespacho:10 · saveDespacho:62 · _despachoGetPct:65 · computeDespachoDeduccion:70 · computeDeclResult:124 · computeIrpfBrackets:177 · _hipEffRate:194 · _buildMortgageSwitches:200 · _computeAnnualInterest:221 · _computeBalanceAtDate:255 · renderFiscalTabDespachoOnly:288 · _getActiveMortgage:352 · _fmtDuration:359 · _hipPeriodCard:365 (!87) · _hipROvinc:452 · _calcInsOvercost:462 · _renderInlineOvercost:473 · _renderHipResumen:492 (!99) · _renderHipDetalle:591 · _renderHipSectionContent:617 · _renderCompraSection:629 · _renderPrestamoSection:658 · _renderSubSection:705 · renderFiscalTabDespacho:776 · _bindTabDespacho:793 · _bindHipResumen:817 · _bindHipDetalle:842 · _rerenderSection:913 · _readSectionInputs:922 · _rv:923 · _rv_s:924 · _bindEditingSection:982

### js/economics-fiscal.js  _(1342 líneas)_
**Estado global:** FISCAL_SK:5 · DEFAULT_BRACKETS:11 · FISCAL:18 · FISCAL_TAB:21 · FISCAL_IRPF_SUB:22 · FISCAL_YEAR:23 · FISCAL_HIP_SUB:25 · FISCAL_HIP_EDITING:26 · FISCAL_HIP_EDIT_SNAPSHOT:27 · FISCAL_HIP_DETAIL_TARGET:28 · PERSONAL_SK:34 · PERSONAL_DATA:35 · DEFAULT_PERSONAL_GASTOS_REC:37 · DEFAULT_PERSONAL_INVERSIONES:43 · INGRESOS_SK:87 · INGRESOS_ITEMS:88 · GASTOS_SK:105 · GASTOS_DIFICIL_PCT:106 · DEFAULT_GASTOS:107 · GASTOS_ITEMS:125 · COMPRAS_SK:187 · COMPRAS_IVA_ENABLED:188 · DEFAULT_COMPRAS:189 · COMPRAS_ITEMS:195 · DESGRAV_SK:242 · DESGRAV_DEFAULT:244 · DESGRAV_ITEMS:264 · OBSOLETE_IDS:267 · GROUP_CASA_DESP:659 · GROUP_UTIL_DESP:660

**Funciones:** _yearKey:31 · _ensureDefaults:50 · loadPersonalYear:66 · savePersonalYear:82 · loadIngresos:89 · saveIngresos:92 · findIngreso:95 · ingresoAnual:99 · loadFiscal:127 · saveFiscal:135 · getIrpfPct:138 · getBrackets:139 · _loadGastosFromRaw:141 · loadGastosYear:159 · loadGastos:172 · saveGastosYear:173 · findGasto:176 · gastoAnual:180 · loadCompras:196 · saveCompras:213 · comprasTotal:217 · comprasIvaTotal:227 · loadDesgrav:266 · saveDesgrav:297 · desgravAnual:300 · computeTotalDesgrav:321 · renderFiscalContent:333 · _renderYearSelector:359 · _renderCopyYearBtn:367 · _personalListHtml:390 · _personalTotal:433 · _personalTotalWeekly:443 · renderFiscalTabPersonal:452 · renderFiscalTabIrpf:493 · renderFiscalTabGastosDesg:540 · renderComprasList:571 · renderFiscalTabIrpfDeduc:620 · renderFiscalTabDesgrav:633 · renderDesgravDespachoInfo:655 · _dedCard:696 · renderDesgravList:731 · openFiscal:797 · closeFiscal:810 · reRenderFiscal:816 · bindFiscalEvents:826 · _switchTab:830 · _bindYearSelector:863 · _bindTabPersonal:900 · _bindTabIrpf:949 · _bindTabGastosDesg:994 (!91) · _rebindComprasDel:1043 · _bindTabIrpfDeduc:1085 · _bindTabDesgrav:1098 (!96) · _bindList:1100 · _bindTabDespachoOnly:1194 (!83) · _syncLiveD:1205 · _updateFmt:1243 · _saveFiscalAll:1277 · _rv:1306

### js/economics-gastos.js  _(701 líneas)_
**Estado global:** GASTOS_TOGGLES_SK:5 · GASTOS_TOGGLES:6 · GROUP_SEMIOBL:96 · GROUP_CASA:97 · GROUP_OTROS_IMP:98 · GROUP_S:472 · GROUP_C:473 · GROUP_S2:571 · GROUP_C2:572

**Funciones:** loadGastosToggles:8 · saveGastosToggles:14 · isTglOn:17 · computeDisponible:22 · renderEconGastos:45 (!155) · _gastosGroup:100 · renderResultadoDeclaracion:200 (!113) · _renderDesgloseAhorroPartida:313 · renderIrpfBreakdown:384 · _renderIrpfTramos:431 · renderIncomeDistrib:457 · pctOf:460 · distRow:461 · grpLbl:497 · _sectorPath:529 · _donutSummaryHtml:537 · renderIncomeDonut:566 · _bindDonutClick:637 · gastosCascRow:658 · gastosResultRow:675 · bindEconGastosEvents:682

### js/economics-helpers.js  _(68 líneas)_
**Funciones:** _fmtMiles:8 · _hipMoney:14 · _hipNum:19 · _hipDate:24 · _hipText:28 · _hipVinc:32 · _hipVincSum:46 · _hipRO:62 · _hipROmoney:65

### js/economics-sim.js  _(201 líneas)_
**Estado global:** SIM_TARGET:5 · SIM_PERIOD:6 · SIM_NET_MODE:7

**Funciones:** _simComputeAll:10 · _inverseSalary:48 · renderEconSim:62 (!102) · bindEconSimEvents:164

### js/economics.js  _(688 líneas)_
**Estado global:** ECON_YEAR:5 · ECON_VIEW:6 · ECON_RESUMEN_MODE:7 · ECON_RATE_MODE:8 · ECON_MULTI_RATE:9 · ECON_RATE_PERIODS:10 · ECON_ESTUDIO_SUB:14 · ESTUDIO_YEAR:15

**Funciones:** computeSalaryNet:23 · fc:41 · fcPlain:46 · _rateForDate:56 · _buildDatePeriods:71 · computeEconEx:85 · econBarChart:144 · _fmtDateEs:171 · _prevDate:176 · _ensureDatePeriods:183 · _renderRateInputs:200 · _econCard:217 · _econCards7:223 · f:225 · _getMultiRateOpts:240 · renderEconResumen:244 (!197) · renderEconContent:441 · openEcon:466 · closeEcon:482 · reRenderEcon:487 · bindEconEvents:499 · bindEconResumenEvents:537 (!151)

### js/events-bind.js  _(484 líneas)_
**Funciones:** _switchEvView:6 · openEvents:23 · closeEvents:33 · openEventsAt:40 · refreshEvents:47 · bindEvEvents:63 (!421) · _scrollWeekToMonth:71 · _scrollWeekToToday:118 · doScroll:128 · apply:447

### js/events-detail.js  _(571 líneas)_
**Funciones:** openEvDeleteSheet:7 · closeEvDeleteSheet:37 · renderEvDetail:40 (!117) · fd2:43 · _fila:122 · evDayCarItems:157 · evCarGo:170 · _evCarShow:178 · openEvDayCarousel:186 · closeEvDayCarousel:194 · openEvDetail:201 (!155) · repintar:241 · closeEvDetail:356 · renderEvAlarmPanel:359 (!80) · fd2:361 · openEvAlarm:439 · closeEvAlarm:445 · openBdayAlarmFromEvents:453 · bindEvAlarmEvents:461 (!110) · _syncPre:499 · fmtD:529

### js/events-form.js  _(606 líneas)_
**Funciones:** evPuntualDays:6 · _renderEvTypeSwatches:15 · evAdmiteRepeticion:35 · renderEvForm:38 (!188) · openEvForm:226 · closeEvForm:252 · bindEvFormEvents:264 (!342) · _refreshShapePreviews:280 · _refreshPickDatesLabel:285 · _curKind:304 · _applyTypeUI:305 · _bindTypeSwatches:334 · _viajeSync:428

### js/events-picker-color.js  _(241 líneas)_
**Estado global:** EV_COLOR_GRID:6 · EV_COLOR_TYPES:27 · EV_KINDS:44 · EV_TYPE_COLORS:49 · EV_FREE_COLOR:60 · EV_FREE_SHAPE:61 · EV_FREE_DATES:64 · EV_BAR_SIZES:67 · EV_FREE_BARSIZE:68 · EV_DOT_SOLID:72 · EV_SHAPE_BW:99

**Funciones:** evBarSize:73 · evBarSizeCls:79 · evTypeKey:80 · evTypeColor:81 · getEvKind:84 · evShapeSvg:100 · evMorePlusSvg:125 · evTravelColor:134 · getEvType:140 · isEvBarAlways:148 · getEvDisplayColor:150 · _renderColorPicker:170 · _bindColorPicker:193 · updatePreview:203

### js/events-picker-date.js  _(103 líneas)_
**Estado global:** MNS:10

**Funciones:** openOtrosDatePicker:7 (!96) · _evDk:11 · _count:12 · _render:13 · _attach:54 · _rerender:85 · _close:93

### js/events-render.js  _(904 líneas)_
**Estado global:** DN7:20

**Funciones:** renderEvCalMonth:9 (!145) · renderEvListItem:154 · fd2:158 · renderEvUpcoming:186 (!177) · fd2:193 · renderEvItem:194 · renderEvPanel:244 · _renderEvMonthCard:363 (!146) · renderEvAnnual:509 · renderEvQuad:518 · renderEvByTypes:539 · coincide:565 · renderEvMonthsView:611 · renderEvWeek:620 (!132) · hexA:624 · renderEvContent:752 (!152)

### js/events.js  _(621 líneas)_
**Estado global:** EV_STORAGE_KEY:5 · EV_YEAR:6 · EV_MONTH:7 · EV_VIEW_STATE:11 · EV_SCROLL_RESET:16 · EV_VIEW:17 · EV_EDIT:18 · EV_EDIT_DS:19 · EV_FORM_CONTAINER:20 · EV_EDIT_MODE:21 · EV_BRIGHT_PAST:22 · EV_ANNUAL_VIEW:23 · EV_ANNUAL_FILTER_HIDDEN:24 · EV_FILTER_GROUPS:32 · EV_FILTER_SHORT:38 · EV_FILTER_COLOR:40 · EV_FILTER_SEP_AFTER:43 · EV_PREV_VIEW:53 · EV_QUAD_YEAR:54 · EV_QUAD_MONTH:55 · EV_TO_SUBTAB:56 · EV_TYPES_FILTER:57 · EV_TYPES_PAST:58 · EV_LIST_SORT:59 · EV_LIST_SEARCH:60 · EV_COLORS:61 · EVENTS:62 · EV_ALARM_SK:91 · EV_ALARMS_SET:92 · EV_NO_RUT:184 · EV_MARK_ORDER:332 · EV_MAX_PUNT_DIA:373 · EV_MAX_RUT_DIA:374 · EV_CAL_CORNER_STACK:377 · EV_MAX_VIP_DIA:379 · EV_CAL_VIP_MAX:380 · EV_UP_SHOW_RUT:382 · EV_UP_SHOW_BODA:383 · EV_BAR_Z:432 · EV_MNS:491 · EV_CAR:534 · EV_TRANSPORTES:553 · EV_TRANS_EMOJI:559

**Funciones:** evFilterGroup:44 · saveEvents:86 · loadEvAlarms:93 · saveEvAlarms:94 · _findBdayByEvId:95 · isEvAlarmSet:107 · setEvAlarmState:113 · evDk:120 · _evClampDate:129 · eventOccursOn:133 · getEventsOn:177 · evSignature:192 · evMergeIncoming:202 · evMergeMsg:226 · _fmtDayEs:238 · evDayLimitExceeded:239 · rutDayCount:274 · hasUpcomingEvent:281 · updateEventsBtn:290 · evDefaultShape:304 · evMarkerHtml:310 · evMorePlusHtml:324 · evMarkPriority:333 · evBodaMinutes:340 · evSortMarks:351 · ev0:352 · evAnnualXsHtml:384 · vipStarSvgHtml:394 · evIsoDate:406 · _isVipBdayTooFar:407 · evUpcomingMarkHtml:414 · _evRowOcc:433 · _evSoloSeRozan:439 · _evAssignRow:445 · _evMarcarMitades:459 · _evMitadesStyle:474 · evBarZ:481 · _evAnnualCtx:494 · visible:495 · _evLoadPuentes:513 · _evScheduleRemove:541 · _evCancelRemove:542 · evStartTime:561 · evEndTime:567 · evTimeLabel:574 · evTramos:581 · evTramoTexto:590 · evMinutosDe:597 · _positionEvBright:607

### js/home-popup.js  _(102 líneas)_
**Funciones:** dismissPopup:93

### js/import-export.js  _(549 líneas)_
**Funciones:** askImportMode:299 · close:311 · _mergeMap:325 · _mergeList:336 · _sigEvent:357 · _sigCouple:359 · _sigAlarm:360 · _sigGasto:361 · _keyId:363 · _keyBday:364 · _keyGasto:365 · _exportPerYearKeys:371 · _applyFullImport:444 (!105)

### js/init.js  _(466 líneas)_
**Estado global:** DRUM_ITEM_H:144 · DN_ES:321

**Funciones:** _updateHeaderActive:23 · buildDrumPicker:145 · updateDrumSelected:173 · getDrumValue:179 · checkDrumMinuteWrap:185 · buildAlarmDayBtns:216 · showAlarmPastConfirm:246 · proceed:296 · _showUpdateBar:433

### js/logo-popup.js  _(51 líneas)_
**Funciones:** _logoUpdateDots:14

### js/rutinas.js  _(792 líneas)_
**Estado global:** RUT_SK:20 · RUTINAS:21 · RUT_SUGERENCIAS:28 · RUT_DUR_DEFAULT:33 · RUT_TIME_DEFAULT:34 · RUT_DN:35 · RUT_DN_LARGO:36 · RUT_ICONS:44 · RUT_FIXED_COLOR:47 · RUT_ICON_LABEL:49 · RUT_SUBTAB:262 · RUT_WEEK_SEL:596 · RUT_WEEK_CAL:597

**Funciones:** saveRutinas:25 · rutColorOf:48 · _rutIconShapes:50 · _rutIconDetails:75 · rutIconOf:94 · rutIconSvg:104 · rutMarkerHtml:115 · rutById:122 · rutWeekKey:127 · rutTimeOfDay:136 · rutTieneHorarios:141 · rutWeekCfg:148 · rutSuspendedOn:157 · rutDiaLleno:166 · rutOccursOn:180 · rutIsSkipped:188 · rutToggleSkip:189 · rutFin:194 · rutEventsOn:202 · rutEventFromId:219 · rutSessions:228 · rutStats:242 · rutProximas:255 · renderRutinasBody:265 · _renderRutLista:276 · _rutFmt:334 · _rutFmtCorto:335 · _renderRutStats:341 · renderRutForm:402 · openRutForm:462 (!129) · _rutRepaintIcons:468 · _rutPintaHoras:494 · closeRutForm:591 · openRutWeek:598 · _rutWeekPick:607 · _rutWeekRender:659 · closeRutWeek:720 · openRutSesion:723 · closeRutSesion:752 · bindRutinasEvents:755

### js/summary.js  _(607 líneas)_
**Estado global:** FEST_REQUIRED:5 · VAC_STORAGE_KEY:6 · VAC_ENTITLEMENT:7 · SUMMARY_YEAR:11 · SY_EXCL_PAST:12 · SY_PUENTES_LIBRES:13 · SUMMARY_TAB:14 · SPAIN_AVG:252 · DN7S:276

**Funciones:** saveVacEntitlement:16 · fhY:21 · fdY:22 · computeYearlySummary:24 · barChart3:98 · computePuentes:125 · isNWD:135 · typeOf:136 · renderSummaryWorkBody:169 (!101) · fmtSigned:257 · renderSummaryPuentesBody:270 (!94) · fdd:277 · renderSummaryTimeOffBody:364 (!92) · fdd:370 · bindSummaryWorkBodyEvents:456 · bindSummaryPuentesBodyEvents:466 · bindSummaryTimeOffBodyEvents:491 · renderSummaryContent:497 · closeSummary:518 · bindSummaryEvents:524 (!83)

## CSS

### css/styles.css  _(2243 líneas)_

**Secciones:**

- TEMA OSCURO (por defecto):5
- TEMA CLARO:18
- TEMA GRIS (intermedio entre oscuro y claro, gris pizarra cálido):35
- HEADER:53
- JORNADA DEFECTO:67
- Barra vertical que separa la campana del bloque de navegacion:103
- Aro de color único por botón (nivel 1) — igual que nav-bar-btn.active[data-nav]:109
- Punto verde notificación en botones bday/events cuando hay items próximos:118
- WEEK CARDS:128
- WEEK ACTIONS:160
- BOTTOM SHEET (day type selector):169
- TOAST:191
- Tema claro: el fondo oscuro con letra de color no se leia bien:198
- SW UPDATE BUTTON (en menú ⋯):202
- ANIMATIONS:207
- Los dias marcados (festivo/vacaciones/ausencia) mandan sobre la jornada:236
- OVERLAY BASE (summary, econ, bday, events):242
- SHARED OVERLAY HEADER:247
- SHARED BODY:268
- En Proximos la cabecera de semana manda sobre las de dia: va en pastilla:317
- Vacaciones config:323
- Quitar festivos/vacaciones checkboxes:327
- Month summary breakdown:349
- Ausencia list tag:352
- ECONOMICS:355
- Quarterly aligned grid — única cuadrícula 4 col × 4 fila:360
- Summary sublabel (hours breakdown):377
- Ingresado box (formerly cobrado) — neutral:386
- ECONOMICS v2: tabs + nuevas secciones:420
- Estudio Cambio — grouped nav:431
- Estudio — tariff comparison cards:440
- Análisis hipoteca — secciones organizadas:461
- Mis gastos — budget table:478
- Year selector for per-year fiscal tabs:491
- §1.1 Tarifa dual:502
- §1.3 Stats por hora/día:514
- §1.4 Toggles:521
- §1.5 Declaración IRPF:526
- Tab 2: Comparador:539
- Calcular Tarifa (sim):567
- Scenario zones (Comparar Escenarios):585
- Análisis Ec. Personal:602
- Bloques de la Subrogación:604
- Fiscal config modal — purple theme override:647
- Fiscal config modal:649
- ECONOMICS v3: opt-buttons, cascade, gastos:675
- Cascade ingresos/gastos:682
- Media mensual: cards:692
- Tab 4: Análisis:702
- IRPF Breakdown visual:716
- Card "A pagar / Devolución" más ancha cuando lleva sub-líneas integradas:743
- Sub-línea de deducciones integrada (antes era una tarjeta verde suelta):745
- Desglose item-por-item del Ahorro por desgravaciones (ordenado desc):769
- Anotación inline en Cálculo de base mostrando el ahorro real en IRPF que produce cada reducción:778
- Resumen fiscal al final de Ingresos y Gastos:780
- Donut chart:787
- Breakdown del sector seleccionado (IRPF/IVA dentro de Impuestos, etc.):797
- Fiscal config: gastos items:804
- Fiscal: tab bar:816
- Fiscal: sticky save:821
- Fiscal: section title income/expense colors:823
- Fiscal: desgravaciones:833
- Fiscal: compras profesionales:860
- Desgravaciones: notas + tabla despacho info:868
- Nota IVA compras:888
- IVA por item en compras:890
- Fiscal: despacho en casa:897
- Hipoteca — resumen visual:920
- Hipoteca — compact 2-col grid:943
- Hipoteca — compact vinculaciones:951
- Hipoteca — read-only fields:962
- Hipoteca — edit/detail buttons:971
- Hipoteca — period summary card:977
- Multi-rate period cards:990
- Distribución de ingresos:1006
- Comparador: reorder buttons:1022
- Rate input styled:1026
- BIRTHDAYS:1030
- Cabe el nombre entero, hasta en tres lineas:1047
- VIP controls bar:1053
- Botón Cancelar fijo al fondo de pantalla en modo edición VIP:1064
- VIP edit mode item states:1067
- Feat 1: Buscador en lista por meses:1077
- Upcoming birthdays:1091
- Weekend frame — gris lavanda suave:1108
- Hoy manda sobre el gris del fin de semana:1111
- Events in puentes (summary) — one per line:1131
- Events upcoming view:1135
- Minicabecera de día dentro de un panel de Próximos:1137
- Marcador de la tarjeta de Proximos: la forma real del evento:1147
- Horas del evento y transporte de ida/vuelta:1152
- Fallback declarativo para scrollIntoView cuando el JS aún no ha medido el sticky:1184
- Grid del mes: col fecha (48px) + col eventos (1fr):1186
- Columna fecha (col 1):1188
- Caja del multi-día: UN ÚNICO grid item que abarca varias filas → se ve como una unidad:1197
- Contenedor de chips puntuales — se monta ENCIMA del multi-día por z-index:1203
- Cuando el día está dentro de un viaje: padding extra y fondo transparente para que el viaje se vea continuo:1207
- Chip puntual: opaco con sombra para destacar sobre el viaje translúcido:1213
- Event color type picker:1217
- Tipos sin color fijo (Viaje, Otros): dot multicolor + borde neutro:1223
- Color picker avanzado (paleta 6×8 + color libre):1227
- Detail color picker toggle:1245
- Annual events calendar:1251
- Badge punto: estilo "1 mes" reducido para anual/4-meses (reemplaza la X):1281
- Selector de formas en el formulario de evento (Otros):1292
- Selector de grosor de barra (grande | Otros):1294
- Previews del formulario: mismo SVG que los calendarios (borde uniforme):1309
- Tamaños en Calendario 1 mes: "lg" en la esquina, "ovf" en la fila de desborde:1313
- Inicio/Fin bloqueados cuando hay Selección Multidía:1316
- Mini-overlay para elegir días específicos (Otros):1321
- Estrella VIP vectorial (SVG): tamaño homogéneo con el resto de markers:1348
- Marcador "+" (más de 4 eventos puntuales en el mismo día):1352
- Barras multi-día en calendario anual/4meses: ocupa una franja vertical y se divide en filas con grid:1354
- Cuando hay 2 filas: ampliar a 64% para que cada barra sea ~32% (visible):1356
- Cuando hay 3 filas: ampliar a 76% para que cada barra sea ~25% (sigue visible):1358
- Perímetro de días puente en vista anual: z-index:1, debajo de eventos:1364
- Calendario 4 meses: 2 columnas × 2 filas:1366
- Botón ir al calendario mensual en puentes del resumen:1368
- Botón editar (lápiz) en Anual/Quad — mismo aspecto que la bombilla pequeña de 1-mes/Semanal:1380
- Diagonales en anual/quad: attachment:fixed para que el patrón sea continuo entre celdas:1384
- Festivos/vac en vista anual: borde brillante + relleno suave por día individual:1402
- Dropdown de vista anual:1409
- Linea que separa los chips de eventos grandes de los puntuales:1418
- Shared overlay nav bar — nivel 1, siempre visible en lo alto del overlay:1427
- TABS NIVEL 2 (birthdays/events/summary) — nivel 2, debajo del nav bar:1431
- Summary tabs — nivel 2:1434
- BRIDGE DAY CELLS in summary:1439
- VIP BIRTHDAYS:1448
- BIRTHDAY + EVENT ALARM PANEL:1451
- Campana de alarma en items de próximos (bday + eventos):1454
- 3-ZONE ALARM MARKER:1474
- ALARM MANAGEMENT OVERLAY:1487
- HOME POPUP (semanas pendientes / VIP sin alarma):1488
- MACRO URL EN MENÚ:1499
- Feat 4: Nav-bar emoji alignment:1505
- Birthday detail / form overlays:1521
- EVENTS:1531
- Zone A: upcoming/list views — subtle blue tint:1537
- Zone B: calendar grid views — subtle teal tint, active = green:1539
- Feat 2: Lista de Eventos subtabs:1548
- Contenedor semana: barras multi-día ENCIMA (position:absolute) de las celdas:1565
- Barras multi-día: 65% de la celda, centradas verticalmente, encima de números:1567
- Si hay columna de marcadores en la esquina, la fila se queda a su izquierda:1596
- Marcadores desbordados: SEGUNDA COLUMNA (uno debajo de otro), no en fila:1600
- Carrusel del dia (estrellas VIP / "+" del calendario de 1 mes):1606
- Rutinas en anual y 4 meses: puntitos en fila arriba del dia:1621
- Los cumpleaños VIP se solapan al 75% (12px de marcador -> -9px):1626
- Sin z-index propio para no crear stacking context — permite que ev-badge (z-index:4) quede encima de ev-bars-row (z-index:3):1643
- Perímetro puente: capa inferior a eventos:1645
- Bright past: bombilla override:1658
- Bombilla en Anual/Quad — mismo estilo que la pequeña inline del 1-mes/Semanal:1662
- Bombilla en 1-mes y agenda semanal: posicionada en el centro entre el ▶ y "Hoy":1667
- Quad label 3 lines:1672
- ev-num con altura fija para alinear perfectamente todos los números de la misma semana:1679
- ev-badge: z-index:4 > ev-bars-row z-index:3 → los badges 1-día quedan encima de barras multi-día:1681
- Events list view:1683
- Event form overlay (inside eventsOverlay):1697
- Relleno, para que haga pareja con el naranja de "Editar evento":1727
- Event detail:1734
- LOGO POPUP:1742
- Gallery:1751
- BD ALARM VIP TOGGLE:1760
- RESPONSIVE (mobile header):1763
- IVA trimestral: compactar celdas para que los 4 trimestres quepan sin scroll horizontal:1765
- ALARM PANEL:1818
- Drum picker (selector giratorio de hora/minuto):1823
- Confirmación alarma en el pasado:1842
- Botón flotante "Listo" en modo Editar VIPs:1850
- Controles inline long-press cumpleaños:1853
- Selector de clase en el formulario:1861
- Notas: general vs de un dia concreto:1867
- Pestana Bodas y pestana partida Vacaciones/Festivos:1871
- Mitad marron (vacaciones/festivos) + mitad rosa (puentes), sin linea visible:1876
- Tarjetas de avisos (huecos / parejas pendientes / info incompleta):1889
- Filas del panel de un aviso:1903
- Estadisticas:1907
- Barras horizontales de reparto (componente generico: hBarRows):1915
- El marron macizo quedaba demasiado oscuro: ahora es un tinte suave:1925
- Dia cerrado: no admite mas clases:1942
- Fila con cambios sin guardar:1947
- Filtros de Parejas como chips pulsables:1959
- El color de la pareja va en un punto delante; el nombre, en color normal:1993
- Sala sin asignar: se marca en naranja para que cante en la lista:1998
- Nota propia del dia en la lista de Proximos:2001
- Hora y sala de un ensayo, al pie de la tarjeta de Proximos:2003
- Atajos de alarma para un ensayo: 1 h / 30 min antes (se pueden marcar los dos):2005
- Agenda semanal: hora y sala de los ensayos + continuacion de un mes anterior:2013
- Editar siempre en naranja, como en el resto de la app:2019
- Los tres botones del detalle de pareja comparten aspecto:2031
- Subpestana Calendario de bodas:2068
- Leyenda: una pareja por linea y pulsable para resaltar sus dias:2082
- Dia resaltado al pulsar una pareja en la leyenda:2089
- Ficha del dia: alto fijo para que no baile al pasar de un evento a otro:2116
- Sin esto los hijos se encogen y el texto se derrama sobre los botones:2118
- etiqueta al minimo: el nombre de la pareja necesita el resto:2127
- el color de la pareja va en un punto, no tinendo el nombre:2130
- Los tres botones de la pareja, en una sola linea:2137
- Buscador y boton de anadir en la misma fila:2140
- Tarjeta de pareja desplegada en su sitio (antes era un modal):2146
- Horario distinto segun el dia:2150
- Selector de icono de rutina:2156
- Lista "Todos": buscador, orden y borrado con pulsacion larga:2196
- Diálogo: modo de importación (añadir vs reemplazar):2211
- PRINT:2224

**Rangos por prefijo de clase:** 
.action-btn:162-166 · .ah-cuota:465-467 · .ah-donut:475-477 · .ah-section:462-464 · .ah-total:472-474 · .ah-vs:468-471 · .alarm-cfg:1819-1819 · .alarm-colon:1822-1822 · .alarm-create:1834-1835 · .alarm-day:1839-1841 · .alarm-days:1836-1838 · .alarm-macro:1848-1849 · .alarm-msg:1832-1833 · .alarm-panel:1820-1820 · .alarm-past:1843-1847 · .alarm-time:1821-1821 · .analisis-card:614-616 · .analisis-cards:603-603 · .analisis-hbar:617-622 · .analisis-input:632-635 · .analisis-ins:641-646 · .analisis-insurance:640-640 · .analisis-mortgage:623-639 · .app-logo:58-58 · .app-version:126-126 · .bd-alarm:1452-1762 · .bd-detail:1522-1529 · .bd-export:262-262 · .bday-add:1106-1107 · .bday-badge:1048-1050 · .bday-buscar:1080-1082 · .bday-cancel:1065-1066 · .bday-cell:1041-1112 · .bday-hdr:1032-1432 · .bday-ic:1855-1859 · .bday-inline:1854-1854 · .bday-io:1086-1090 · .bday-list:1052-1076 · .bday-listo:1851-1851 · .bday-month:1051-1051 · .bday-num:1046-1046 · .bday-search:1083-1085 · .bday-upcoming:1092-1450 · .bday-view:1033-1035 · .bday-vip:1054-1449 · .bday-week:1036-1038 · .boda-actions:2023-2023 · .boda-add:2025-2025 · .boda-asg:2045-2067 · .boda-buscar:2141-2143 · .boda-cal:2069-2092 · .boda-card:1965-2149 · .boda-chip:1961-1963 · .boda-chips:1960-1960 · .boda-cl:1990-2022 · .boda-class:1948-1989 · .boda-controls:1932-1932 · .boda-couple:1987-1987 · .boda-cpk:2039-2044 · .boda-date:2024-2024 · .boda-day:1943-1981 · .boda-det:2030-2139 · .boda-dot:1969-1969 · .boda-falta:1976-1976 · .boda-filters:1935-1935 · .boda-fsel:1936-1939 · .boda-ftoggles:1940-1941 · .boda-inp:1985-1985 · .boda-iss:1904-1906 · .boda-issue:1891-1902 · .boda-issues:1890-1890 · .boda-legend:2026-2029 · .boda-mini:2017-2018 · .boda-mode:1922-1924 · .boda-name:1970-1970 · .boda-ok:1977-1977 · .boda-place:1988-2000 · .boda-prog:1972-1973 · .boda-ro:1991-1999 · .boda-save:1957-1958 · .boda-savebar:1953-1956 · .boda-search:2144-2144 · .boda-sec:1888-1888 · .boda-sobra:1978-1978 · .boda-sort:2145-2145 · .boda-stat:1909-1914 · .boda-stats:1908-1908 · .boda-sticky:1884-1886 · .boda-sum:1928-1931 · .boda-summary:1927-1927 · .boda-time:1986-1986 · .boda-tp:2093-2096 · .boda-wed:1971-1971 · .bottom-sheet:172-173 · .btn-icon:99-1808 · .csv-export:71-72 · .data-actions:95-1810 · .data-btn:96-1806 · .data-menu:120-125 · .day-cell:140-240 · .day-date:145-145 · .day-hours:146-146 · .day-name:144-144 · .day-status:153-153 · .days-grid:139-139 · .default-hours:69-77 · .dp-actions:1344-1345 · .dp-counter:1331-1332 · .dp-day:1339-1343 · .dp-days:1338-1338 · .dp-grid:1333-1333 · .dp-handle:1326-1326 · .dp-hdr:1327-1327 · .dp-mhdr:1336-1337 · .dp-mname:1335-1335 · .dp-month:1334-1334 · .dp-overlay:1322-1325 · .dp-sheet:1324-1324 · .dp-title:1328-1328 · .dp-yearnav:1329-1330 · .drum-picker:1825-1828 · .drum-sel:1831-1831 · .drum-wrap:1824-1830 · .econ-add:549-550 · .econ-ahorro:770-777 · .econ-annual:379-379 · .econ-avg:380-697 · .econ-bracket:532-538 · .econ-calc:680-681 · .econ-casc:684-691 · .econ-cascade:683-683 · .econ-chart:562-563 · .econ-comp:540-564 · .econ-decl:527-701 · .econ-distrib:1007-1021 · .econ-donut:788-803 · .econ-equiv:1002-1005 · .econ-fiscal:781-786 · .econ-formula:399-402 · .econ-gastos:703-715 · .econ-gear:499-500 · .econ-hdr:421-501 · .econ-ingresado:387-387 · .econ-irpf:717-779 · .econ-legend:565-566 · .econ-line:560-561 · .econ-month:404-417 · .econ-mr:999-1000 · .econ-multi:991-1001 · .econ-opt:676-679 · .econ-qcard:369-376 · .econ-qcell:365-1769 · .econ-qm:374-374 · .econ-qmonth:372-373 · .econ-quarter:361-1766 · .econ-rate:503-511 · .econ-row:388-398 · .econ-sc:542-1028 · .econ-scenario:541-541 · .econ-section:418-418 · .econ-sim:568-578 · .econ-stats:515-520 · .econ-sub:424-430 · .econ-tab:422-423 · .econ-toggle:522-525 · .econ-val:403-403 · .est-btn:435-439 · .est-card:445-447 · .est-detail:442-442 · .est-field:454-460 · .est-fields:453-453 · .est-group:433-437 · .est-modo:448-448 · .est-nav:432-432 · .est-section:441-441 · .est-tariff:443-452 · .ev-alarm:1463-2012 · .ev-ann:1381-1623 · .ev-annual:1149-1657 · .ev-badge:1682-1682 · .ev-badges:1592-1592 · .ev-bars:1568-1568 · .ev-barsize:1295-1304 · .ev-bficha:2123-2123 · .ev-bfila:2124-2133 · .ev-bpunto:2131-2131 · .ev-bright:1659-1669 · .ev-btn:1720-1873 · .ev-bver:2136-2136 · .ev-car:1607-2120 · .ev-cell:1113-1678 · .ev-char:1709-1709 · .ev-checkbox:1714-1714 · .ev-chip:1424-1424 · .ev-color:1225-1244 · .ev-colors:1710-1710 · .ev-date:1711-1711 · .ev-dates:1317-1319 · .ev-day:1595-1634 · .ev-daynote:1869-1869 · .ev-del:2208-2209 · .ev-detail:1246-2117 · .ev-dot:158-158 · .ev-dots:157-157 · .ev-edit:1372-1724 · .ev-field:1703-1704 · .ev-filter:1419-1426 · .ev-form:1698-1719 · .ev-hdr:1433-1533 · .ev-hora:1153-1153 · .ev-input:1705-1706 · .ev-io:1379-1733 · .ev-kind:1862-1866 · .ev-list:1549-2207 · .ev-month:1557-1557 · .ev-multi:1582-1654 · .ev-note:1868-1868 · .ev-num:1680-1680 · .ev-otros:1293-1639 · .ev-puente:1646-1646 · .ev-quad:1367-1674 · .ev-repeat:1715-1715 · .ev-rut:1630-1633 · .ev-search:2198-2202 · .ev-sep:1176-1176 · .ev-shape:1305-1312 · .ev-sort:2203-2204 · .ev-textarea:1707-1708 · .ev-toggle:1712-1713 · .ev-type:1218-1226 · .ev-types:1552-1554 · .ev-up:1138-1151 · .ev-upcoming:322-2004 · .ev-viaje:1154-1162 · .ev-view:1534-1536 · .ev-wd:1717-1718 · .ev-week:318-1644 · .ev-weekday:1716-1716 · .ev-wk:1163-2016 · .ev-zone:1538-2104 · .excl-item:348-513 · .excl-row:328-512 · .fiscal-add:669-832 · .fiscal-bracket:660-668 · .fiscal-compras:861-896 · .fiscal-copy:496-498 · .fiscal-custom:657-657 · .fiscal-ded:871-885 · .fiscal-desgrav:834-886 · .fiscal-despacho:898-919 · .fiscal-error:673-673 · .fiscal-gasto:805-867 · .fiscal-gastos:887-887 · .fiscal-hdr:817-817 · .fiscal-highlight:858-858 · .fiscal-onoff:900-901 · .fiscal-pct:658-667 · .fiscal-period:813-814 · .fiscal-radio:652-656 · .fiscal-save:671-672 · .fiscal-section:650-825 · .fiscal-sticky:822-822 · .fiscal-subsection:826-827 · .fiscal-tab:818-820 · .fiscal-viaje:828-829 · .fiscal-vinc:911-912 · .fiscal-year:492-495 · .full-overlay:243-244 · .hbar-lbl:1918-1918 · .hbar-row:1917-1917 · .hbar-rows:1916-1916 · .hbar-track:1919-1920 · .hbar-val:1921-1921 · .header:54-1811 · .header-brand:57-57 · .hip-add:989-989 · .hip-auto:940-940 · .hip-bar:926-933 · .hip-cancel:976-976 · .hip-cf:945-950 · .hip-edit:972-974 · .hip-g2:944-944 · .hip-grid:938-938 · .hip-period:978-987 · .hip-resumen:921-925 · .hip-ro:963-970 · .hip-save:975-975 · .hip-section:939-988 · .hip-stat:935-937 · .hip-stats:934-934 · .hip-sub:942-942 · .hip-vinc:941-941 · .hip-vr:952-961 · .home-popup:1489-1498 · .hour-chip:86-87 · .hour-chips:85-85 · .hour-picker:83-84 · .hours-chip:80-81 · .hours-chips:79-79 · .hours-control:68-68 · .hours-label:78-78 · .hours-panel:82-82 · .ico-exportar:263-263 · .imp-mode:2212-2222 · .logo-gallery:1752-1759 · .logo-popup:1743-1750 · .macro-section:1500-1501 · .macro-url:1502-1504 · .mg-budget:479-488 · .mg-cat:489-489 · .mg-desgrav:490-490 · .mg-sort:485-485 · .month-nav:59-61 · .month-stat:89-92 · .month-summary:88-88 · .ms-breakdown:350-350 · .ms-hrs:94-94 · .ms-label:93-93 · .ms-num:90-90 · .ms-sep:351-351 · .nav-bar:1429-1815 · .nav-btn:62-63 · .option-desc:188-188 · .option-dot:181-185 · .option-hours:189-189 · .option-info:186-186 · .option-label:187-187 · .overlay:170-171 · .overlay-nav:1428-1430 · .pdf-export:73-74 · .rate-input:358-2241 · .rate-label:357-357 · .rate-row:356-356 · .rate-suffix:359-359 · .rut-add:2180-2180 · .rut-card:2163-2178 · .rut-day:2171-2187 · .rut-days:2170-2185 · .rut-dot:2166-2166 · .rut-hist:2192-2195 · .rut-hora:2155-2173 · .rut-hpd:2151-2154 · .rut-icon:2157-2161 · .rut-name:2167-2167 · .rut-pct:2179-2179 · .rut-prox:2174-2176 · .rut-sec:2162-2162 · .rut-stat:2189-2191 · .rut-sug:2181-2184 · .rut-susp:2188-2188 · .rut-tag:2168-2169 · .rut-vacio:2177-2177 · .rut-wpick:2110-2115 · .sent-badge:136-136 · .sheet-handle:174-174 · .sheet-option:178-180 · .sheet-options:177-177 · .sheet-subtitle:176-176 · .sheet-title:175-175 · .sim-combo:580-584 · .sim-field:569-570 · .sim-hr:579-579 · .sim-period:576-576 · .sim-target:571-575 · .sub-block:605-606 · .sub-row:607-613 · .sw-upd:203-203 · .sy-back:249-2232 · .sy-body:269-2230 · .sy-card:280-2236 · .sy-cards3:272-272 · .sy-cards4:273-273 · .sy-chart:298-298 · .sy-hdr:254-254 · .sy-header:248-2231 · .sy-lbl:289-2235 · .sy-list:302-353 · .sy-month:316-316 · .sy-nav:258-1671 · .sy-note:299-301 · .sy-pdf:260-261 · .sy-puente:308-1447 · .sy-section:270-271 · .sy-spain:274-279 · .sy-sublbl:378-378 · .sy-suelto:313-315 · .sy-tab:1435-1438 · .sy-table:290-2237 · .sy-td:295-295 · .sy-tr:296-2238 · .sy-val:285-2234 · .sy-year:251-2233 · .toast:192-197 · .toast-undo:205-205 · .today-btn:64-65 · .vac-config:324-326 · .vip-no:1060-1061 · .week-actions:161-161 · .week-card:130-222 · .week-header:133-133 · .week-info:134-135 · .week-total:137-137 · .weeks-container:129-129

