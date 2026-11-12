/* DesertSkin-X — Arabic / English language toggle.
   Translation layer only: it swaps visible text and labels. It does not change data,
   calculations, layout, colours or fonts. English remains the default. */
(() => {
'use strict';

const AR = {
  // navigation & chrome
  'Membrane': 'الغشاء', 'Readings': 'القراءات', 'Material lab': 'مختبر المواد', 'Alerts': 'التنبيهات',
  'Samples/Results': 'العينات/النتائج', 'Synthetic demo': 'عرض تجريبي', 'DesertSkin': 'DesertSkin',
  'RESPONSIVE MATERIALS / X': 'مواد مستجيبة / X', 'MATERIAL INTELLIGENCE / X': 'ذكاء المواد / X',
  'DATA SCOPE': 'نطاق البيانات', 'All deployments': 'كل المواقع', 'DEMO / SYNTHETIC': 'عرض / بيانات تجريبية',
  '01—07 NOV 2026': '01—07 نوفمبر 2026', 'Workbook time · zone unspecified': 'وقت ملف البيانات · المنطقة الزمنية غير محددة',
  'About this project': 'عن المشروع', 'Skip to membrane explorer': 'انتقل إلى مستكشف الغشاء',
  'DesertSkin-X / Membrane explorer': 'DesertSkin-X / مستكشف الغشاء',
  // membrane view
  'Material explorer': 'مستكشف المواد', 'The': 'الغشاء', 'membrane.': '',
  'Select a component to explore the responsive bilayer.': 'اختر مكوّنًا لاستكشاف الغشاء المزدوج المستجيب.',
  'DSX / 01': 'DSX / 01', 'Bilayer specimen': 'عيّنة الغشاء المزدوج', 'Preparing the membrane…': 'جارٍ تجهيز الغشاء…',
  '← Full membrane': '← الغشاء كاملًا', 'Exploded': 'مفكّك', 'Cutaway': 'مقطع', 'Assembled': 'مركّب',
  'Rotation': 'الدوران', 'View controls': 'التحكم بالعرض', 'Camera': 'الكاميرا', 'Overview': 'نظرة عامة',
  'Surface': 'السطح', 'Section': 'المقطع', 'Illustrative humidity': 'رطوبة توضيحية', 'Illustrative RH': 'رطوبة نسبية توضيحية',
  'Visual RH selection': 'اختيار الرطوبة للعرض', 'Zoom & framing': 'التكبير والإطار', 'Zoom': 'التكبير',
  'Reset view': 'إعادة ضبط العرض', 'Schematic model': 'نموذج تخطيطي', 'Not to scale': 'ليس بمقياس حقيقي',
  'Schematic, not to scale': 'تخطيطي، ليس بمقياس حقيقي', 'Drag to rotate': 'اسحب للتدوير', 'Scroll to zoom': 'مرّر للتكبير',
  'MATERIAL INSPECTOR': 'فاحص المواد', 'PASSIVE RESPONSE': 'استجابة ذاتية', 'Responsive hydrogel': 'الهيدروجيل المستجيب',
  'Select a layer or interface to inspect the proposed material composition.': 'اختر طبقة أو منطقة ربط لفحص تركيب المادة المقترح.',
  'Explore material library': 'استكشف مكتبة المواد', 'Inspect material library': 'افحص مكتبة المواد',
  'Schematic architecture. No measured material performance is implied.': 'بنية تخطيطية. لا يُقصد بها أداء مادة مُقاس.',
  'Workbook overview': 'ملخص البيانات', 'Synthetic demo data': 'بيانات عرض تجريبية',
  'AVG. MODELED SAVINGS': 'متوسط التوفير المحسوب', 'Mean of selected readings': 'متوسط القراءات المختارة',
  'MODELED WATER SAVED': 'المياه الموفّرة المحسوبة', '1 modeled hour per record': 'ساعة محسوبة واحدة لكل سجل',
  'OPERATIONAL READINGS': 'القراءات التشغيلية', 'DEPLOYMENTS IN VIEW': 'المواقع المعروضة', 'Across 6 sectors': 'عبر 6 قطاعات',
  '· Workbook metrics are independent of the illustrative 3D specimen.': '· مؤشرات البيانات مستقلة عن العيّنة ثلاثية الأبعاد التوضيحية.',
  'Open operational data': 'افتح البيانات التشغيلية', 'Inspect deployment readings': 'افحص قراءات المواقع',
  'Explore matched-RH materials': 'استكشف المواد عند رطوبة موحّدة',
  // components
  'Hydrogel': 'الهيدروجيل', 'Aerogel': 'الأيروجيل', 'Interface': 'منطقة الربط', 'Hydration': 'الترطيب',
  'Hydrogel.': 'الهيدروجيل.', 'Aerogel.': 'الأيروجيل.', 'Interface.': 'منطقة الربط.', 'Hydration.': 'الترطيب.',
  'HUMIDITY-RESPONSIVE NETWORK': 'شبكة مستجيبة للرطوبة', 'POROUS STRUCTURAL SUPPORT': 'دعامة هيكلية مسامية',
  'BILAYER ARCHITECTURE': 'بنية الغشاء المزدوج', 'WATER–POLYMER INTERACTIONS': 'تفاعلات الماء والبوليمر',
  'Aerogel scaffold': 'هيكل الأيروجيل', 'Porous aerogel': 'أيروجيل مسامي', 'Porous scaffold': 'هيكل مسامي',
  'Porous support': 'دعامة مسامية', 'Structural network': 'شبكة هيكلية', 'Responsive surface': 'سطح مستجيب',
  'The layer interface': 'منطقة ربط الطبقتين', 'Contact region': 'منطقة التلامس', 'Upper region': 'المنطقة العليا',
  'Lower region': 'المنطقة السفلى', 'Water particles': 'جزيئات الماء', 'Hydration state': 'حالة الترطيب',
  'Matrix': 'المصفوفة', 'Reinforcement': 'التقوية', 'Modifier under study': 'مُعدِّل قيد الدراسة',
  'Proposed additions': 'إضافات مقترحة', 'Role': 'الدور', 'Geometry': 'الشكل الهندسي', 'Actuation': 'آلية التشغيل',
  'Monitoring': 'المراقبة', 'Passive material response': 'استجابة ذاتية للمادة', 'Separate, powered system': 'نظام منفصل يعمل بالكهرباء',
  'Net vapor-flow driver': 'محرّك تدفق البخار الصافي', 'Vapor partial-pressure gradient': 'فرق الضغط الجزئي للبخار',
  'Response magnitude': 'مقدار الاستجابة', 'Requires validation': 'يتطلب تحققًا', 'Dataset': 'البيانات',
  'Fixed demo snapshot': 'لقطة بيانات تجريبية ثابتة', 'Inspect': 'افحص',
  'PVA · alginate · CMC': 'PVA · ألجينات · CMC', 'CNC': 'CNC', 'CNF': 'CNF', 'GO · SiO₂': 'GO · SiO₂', 'PSBMA · 0.5% / 1.0%': 'PSBMA · 0.5% / 1.0%',
  'A hydrophilic polymer network changes hydration and swelling state as humidity changes. Its effect on vapor resistance still requires experimental verification.':
    'شبكة بوليمرية محبة للماء تتغيّر حالة ترطيبها وانتفاخها مع تغيّر الرطوبة. تأثيرها على مقاومة البخار ما زال يحتاج إلى تحقق تجريبي.',
  'A hydrophilic polymer network takes up water as humidity changes.': 'شبكة بوليمرية محبة للماء تمتص الماء مع تغيّر الرطوبة.',
  'A lightweight porous network supports the responsive layer. The project proposes cellulose nanofibers with graphene oxide and silica.':
    'شبكة مسامية خفيفة تدعم الطبقة المستجيبة. يقترح المشروع ألياف السليلوز النانوية مع أكسيد الجرافين والسيليكا.',
  'A porous cellulose network supports the hydrogel above it.': 'شبكة سليلوز مسامية تدعم الهيدروجيل فوقها.',
  'The contact region joins the responsive hydrogel to its porous support.': 'منطقة التلامس تربط الهيدروجيل المستجيب بدعامته المسامية.',
  'The two material regions form one membrane architecture. Separate the layers to inspect how the hydrogel sits above the porous support.':
    'تشكّل المنطقتان بنية غشاء واحدة. افصل الطبقتين لترى كيف يستقر الهيدروجيل فوق الدعامة المسامية.',
  'These droplets illustrate water interacting with the polymer network.': 'توضّح هذه القطرات تفاعل الماء مع الشبكة البوليمرية.',
  'The highlighted particles represent water interacting with the hydrophilic network. Their number and placement are visual explanations, not a molecular simulation.':
    'تمثّل الجزيئات المميّزة تفاعل الماء مع الشبكة المحبة للماء. عددها وأماكنها للتوضيح البصري، وليست محاكاة جزيئية.',
  'The visible struts and voids explain architecture. They do not specify actual pore size, connectivity or manufacturing morphology.':
    'الدعامات والفراغات الظاهرة توضّح البنية، ولا تحدد حجم المسام الفعلي أو ترابطها أو شكلها عند التصنيع.',
  'Thickness, texture and movement are illustrative. They are not measured microstructure or a calibrated swelling curve.':
    'السماكة والملمس والحركة للتوضيح فقط، وليست بنية دقيقة مُقاسة أو منحنى انتفاخ معايَر.',
  'The exploded separation is a viewing aid, not a depiction of delamination during operation.':
    'الفصل في العرض المفكّك وسيلة للتوضيح، ولا يمثّل انفصال الطبقتين أثناء التشغيل.',
  'High relative humidity alone does not establish outward vapor flow. These controls do not change the workbook’s KPIs.':
    'الرطوبة النسبية العالية وحدها لا تعني تدفق البخار إلى الخارج. هذه الأدوات لا تغيّر مؤشرات البيانات.',
  // readings
  'WORKBOOK / OPERATIONAL RECORD': 'البيانات / السجل التشغيلي', 'Read the conditions': 'اقرأ الظروف',
  '168 synthetic readings. Eight deployment contexts.': '168 قراءة تجريبية. ثمانية مواقع استخدام.',
  'Export CSV': 'تصدير CSV', 'Humidity': 'الرطوبة', 'RELATIVE HUMIDITY / %': 'الرطوبة النسبية / %',
  'Internal': 'داخلية', 'External': 'خارجية', 'Target 45–65%': 'المستهدف 45–65%', 'Temperature': 'الحرارة',
  'DEGREES CELSIUS / °C': 'درجة مئوية / °م', 'Critical when temperature exceeds 38 °C': 'حرج عندما تتجاوز الحرارة 38 °م',
  '38 °C threshold': 'حد 38 °م', 'Reading log': 'سجل القراءات',
  'One trace per deployment · workbook time, timezone unspecified': 'منحنى لكل موقع · وقت ملف البيانات، المنطقة الزمنية غير محددة',
  'avg. modeled savings': 'متوسط التوفير المحسوب', 'modeled water saved': 'المياه الموفّرة المحسوبة',
  'readings': 'قراءة', 'deployments': 'موقع', 'Record': 'السجل', 'Deployment': 'الموقع', 'Workbook time': 'وقت البيانات',
  'Internal RH / %': 'الرطوبة الداخلية / %', 'External RH / %': 'الرطوبة الخارجية / %', 'Temp. / °C': 'الحرارة / °م',
  'Baseline / L/h': 'بدون غشاء / لتر/س', 'Use / L/h': 'الاستهلاك / لتر/س', 'Saved / L/h': 'الموفّر / لتر/س', 'Savings / %': 'التوفير / %',
  'L': 'لتر',
  // sectors & use cases
  'Agriculture': 'الزراعة', 'Buildings': 'المباني', 'Packaging': 'التغليف', 'Textiles': 'المنسوجات', 'Storage': 'التخزين', 'Industry': 'الصناعة',
  'Protected crop area': 'منطقة محاصيل محمية', 'Interior humidity buffer': 'منظّم رطوبة داخلي', 'Moisture-sensitive enclosure': 'حاوية حساسة للرطوبة',
  'Breathable protective layer': 'طبقة واقية قابلة للتنفس', 'Equipment enclosure': 'حاوية معدات', 'Process air exchange': 'تبادل هواء العمليات',
  'Open-field irrigation cover': 'غطاء ري للحقول المفتوحة', 'Warehouse envelope': 'غلاف مستودع',
  // material lab
  'WORKBOOK / MATERIAL CHARACTERIZATION': 'البيانات / توصيف المواد', 'The material lab': 'مختبر المواد',
  'Compare formulations under matched humidity conditions.': 'قارن التركيبات تحت نفس ظروف الرطوبة.',
  'CONDITION': 'الحالة', 'Demo material inputs': 'مدخلات مواد تجريبية',
  'S0–S6 are physical formulations. These values describe the supplied model, not experimental validation.':
    'S0–S6 تركيبات فعلية. هذه القيم تصف النموذج المزوَّد، وليست تحققًا تجريبيًا.',
  'MATCHED RH': 'رطوبة موحّدة', 'Include S7 open-aperture reference': 'أضف المرجع S7 (فتحة بدون غشاء)',
  'S7 has no membrane. It is shown separately from physical formulations.': 'S7 بدون غشاء، ويُعرض منفصلًا عن التركيبات الفعلية.',
  'Methods & input conditions': 'طريقة الحساب وظروف الإدخال', 'Sample': 'العينة', 'Formulation': 'التركيبة',
  'WVTR / g/m²/day': 'WVTR / غ/م²/يوم', 'Permeance / g/m²/day/kPa': 'النفاذية / غ/م²/يوم/kPa', 'Swelling / %': 'الانتفاخ / %',
  'WVTR = mass change / area / duration in days. Permeance = WVTR / vapor pressure difference. Swelling = 100 × (hydrated − dry mass) / dry mass. The telemetry WVTR proxy uses a different formula.':
    'WVTR = تغيّر الكتلة ÷ المساحة ÷ المدة بالأيام. النفاذية = WVTR ÷ فرق ضغط البخار. الانتفاخ = 100 × (الكتلة المرطّبة − الكتلة الجافة) ÷ الكتلة الجافة. مؤشر WVTR في القراءات التشغيلية يستخدم معادلة مختلفة.',
  'CNF–alginate aerogel': 'أيروجيل CNF–ألجينات', 'CNF–alginate–GO–SiO2 aerogel': 'أيروجيل CNF–ألجينات–GO–SiO2',
  'PVA–alginate hydrogel': 'هيدروجيل PVA–ألجينات', 'A3 + H4 bilayer composite': 'مركّب مزدوج A3 + H4',
  'A3 + H5a (PSBMA 0.5%)': 'A3 + H5a (PSBMA 0.5%)', 'A3 + H5b (PSBMA 1.0%)': 'A3 + H5b (PSBMA 1.0%)',
  'A3 + H4 reversed orientation': 'A3 + H4 باتجاه معكوس', 'Open aperture (no membrane)': 'فتحة مفتوحة (بدون غشاء)',
  // alerts
  'WORKBOOK / EVENT INSPECTION': 'البيانات / فحص الأحداث', 'Find the trigger': 'اعرف السبب',
  'Trace each alert to a reading, a rule and a recommendation.': 'تتبّع كل تنبيه إلى القراءة والقاعدة والتوصية.',
  'SEVERITY': 'الخطورة', 'Severity': 'الخطورة', 'All events': 'كل الأحداث', 'Critical': 'حرج', 'Warning': 'تحذير',
  'CRITICAL': 'حرج', 'NORMAL': 'طبيعي', 'alert events': 'حدث تنبيه', 'Internal RH': 'الرطوبة الداخلية',
  'Humidity risk': 'خطر الرطوبة', 'WORKBOOK RECOMMENDATION': 'توصية البيانات',
  'Inspect moisture and thermal load; verify sensors': 'افحص الرطوبة والحمل الحراري؛ وتحقق من الحساسات',
  'Continue monitoring': 'استمر في المراقبة', 'No matching alert events.': 'لا توجد تنبيهات مطابقة.',
  'No events match the selected deployment and severity.': 'لا توجد أحداث تطابق الموقع والخطورة المختارين.',
  'Critical above 75% internal RH or 38 °C. Otherwise, humidity risk above 25 triggers a warning. Scenario WATCH/ACTION decisions are separate from telemetry severity.':
    'حرج إذا تجاوزت الرطوبة الداخلية 75% أو الحرارة 38 °م. وإلا فإن خطر رطوبة أعلى من 25 يطلق تحذيرًا. قرارات المراقبة/الإجراء للمواقع منفصلة عن خطورة القراءات.',
  // samples / results
  'Laboratory measurements': 'القياسات المخبرية', 'Samples': 'العينات', 'Results': 'النتائج',
  'Choose a sample to explore its measured signals.': 'اختر عينة لاستكشاف إشاراتها المُقاسة.',
  'X-ray diffraction (XRD)': 'حيود الأشعة السينية (XRD)', 'Infrared spectrum (FTIR)': 'طيف الأشعة تحت الحمراء (FTIR)',
  'Highest measured XRD intensity': 'أعلى شدة XRD مُقاسة', 'Lowest measured FTIR transmittance': 'أقل نفاذية FTIR مُقاسة',
  '2θ (degrees)': '2θ (درجة)', 'Intensity (counts)': 'الشدة (عدّات)', 'Wavenumber (cm⁻¹)': 'العدد الموجي (cm⁻¹)',
  'Transmittance (%)': 'النفاذية (%)', 'Compare material inputs': 'قارن مدخلات المواد',
  'Workbook formulation': 'تركيبة البيانات', 'Workbook performance calculations': 'حسابات الأداء من البيانات',
  'Calculation methods': 'طرق الحساب', 'WVTR (g/m²/day)': 'WVTR (غ/م²/يوم)', 'of open-aperture WVTR': 'من WVTR الفتحة المفتوحة',
  'Swelling kinetics': 'حركية الانتفاخ', 'Time (min)': 'الزمن (دقيقة)', 'Swelling (%)': 'الانتفاخ (%)',
  'Humidity cycles at 25 °C': 'دورات الرطوبة عند 25 °م', 'Cycle': 'الدورة', 'P at 30% RH': 'P عند رطوبة 30%',
  'P at 80% RH': 'P عند رطوبة 80%', 'Change (%)': 'التغيّر (%)',
  'cycle 10 response retained vs cycle 1 (derived estimate)': 'الاستجابة المحتفَظ بها في الدورة 10 مقارنة بالدورة 1 (تقدير مشتق)',
  'The open aperture provides the WVTR reference only.': 'الفتحة المفتوحة تُستخدم مرجعًا لـ WVTR فقط.',
  'The workbooks supply illustrative material performance values. The prototype template has no completed performance tests or batch mapping to the laboratory samples.':
    'توفّر ملفات البيانات قيم أداء توضيحية للمواد. لا يحتوي النموذج الأولي على اختبارات أداء مكتملة أو ربط بين الدفعات والعينات المخبرية.',
  'WVTR = absolute mass change ÷ exposed area ÷ elapsed days. Relative WVTR = 100 × sample WVTR ÷ open-aperture WVTR. Swelling = 100 × (wet − dry mass) ÷ dry mass. Humidity response = 100 × (P80 − P30) ÷ P30. Cycle retention is an additional derived estimate. It compares the final and initial permeance differences.':
    'WVTR = التغيّر المطلق في الكتلة ÷ المساحة المعرّضة ÷ الأيام المنقضية. WVTR النسبي = 100 × WVTR العينة ÷ WVTR الفتحة المفتوحة. الانتفاخ = 100 × (الكتلة الرطبة − الجافة) ÷ الكتلة الجافة. استجابة الرطوبة = 100 × (P80 − P30) ÷ P30. الاحتفاظ عبر الدورات تقدير مشتق إضافي يقارن فرقي النفاذية النهائي والأولي.',
  'S0 · CNF–Alginate aerogel': 'S0 · أيروجيل CNF–ألجينات', 'S1 · CNF–Alginate–GO–SiO₂ aerogel': 'S1 · أيروجيل CNF–ألجينات–GO–SiO₂',
  'S2 · PVA–Alginate hydrogel': 'S2 · هيدروجيل PVA–ألجينات', 'S3 · Bilayer A3/H4': 'S3 · غشاء مزدوج A3/H4',
  'S4 · Bilayer + 0.5% PSBMA': 'S4 · غشاء مزدوج + 0.5% PSBMA', 'S5 · Bilayer + 1.0% PSBMA': 'S5 · غشاء مزدوج + 1.0% PSBMA',
  'S6 · Reversed bilayer': 'S6 · غشاء مزدوج معكوس', 'S7 · Open aperture (WVTR only)': 'S7 · فتحة مفتوحة (WVTR فقط)',
  // about / help dialogs
  'DESERTSKIN-X / RESEARCH DEMO': 'DESERTSKIN-X / عرض بحثي', 'DESERTSKIN-X / RESEARCH PROJECT': 'DESERTSKIN-X / مشروع بحثي',
  'Food Security & Environmental Sustainability Hackathon · Third Edition': 'هاكاثون الأمن الغذائي والاستدامة البيئية · النسخة الثالثة',
  'BUILD 04': 'الإصدار 04', 'A responsive bilayer membrane.': 'غشاء مزدوج مستجيب.',
  'DesertSkin-X pairs a passively responsive membrane concept with a separate, powered monitoring system. The membrane specimen is schematic: not microscopy, a molecular simulation or a calibrated model.':
    'يجمع DesertSkin-X بين فكرة غشاء يستجيب ذاتيًا ونظام مراقبة منفصل يعمل بالكهرباء. عيّنة الغشاء المعروضة تخطيطية: ليست صورة مجهرية ولا محاكاة جزيئية ولا نموذجًا معايَرًا.',
  'The dashboard uses the supplied synthetic demo workbook. All KPIs are calculated from its records. Up to 20% lower water use and 30% less condensate are development targets, not validated outcomes.':
    'تستخدم لوحة البيانات ملف بيانات تجريبيًا مزوَّدًا، وكل المؤشرات محسوبة من سجلاته. خفض استهلاك المياه حتى 20% وتقليل التكاثف 30% أهداف تطوير، وليست نتائج مُثبتة.',
  'Dataset: November 1–7, 2026. Timestamps retain workbook time without an assigned timezone.':
    'البيانات: 1–7 نوفمبر 2026. الأوقات محفوظة كما في ملف البيانات بدون منطقة زمنية محددة.',
  'DEMO / SYNTHETIC · NO LIVE SENSOR CONNECTION': 'عرض / بيانات تجريبية · لا يوجد اتصال مباشر بالحساسات',
  'NAVIGATE THE MEMBRANE EXPLORER': 'التنقل في مستكشف الغشاء', 'Take a closer look.': 'ألقِ نظرة أقرب.',
  'Rotate the specimen': 'دوّر العيّنة', 'Drag with one finger or the mouse. Arrow keys also work.': 'اسحب بإصبع واحد أو بالماوس. تعمل مفاتيح الأسهم أيضًا.',
  'Scroll, pinch, or use + and −.': 'مرّر أو اقرص أو استخدم + و −.', 'Inspect a component': 'افحص مكوّنًا',
  'Click the hydrogel, aerogel, interface or hydration label.': 'اضغط على تسمية الهيدروجيل أو الأيروجيل أو منطقة الربط أو الترطيب.',
  'See the membrane layers': 'شاهد طبقات الغشاء',
  'Switch between Assembled, Cutaway and Exploded. Press Home to reset the camera.': 'بدّل بين مركّب ومقطع ومفكّك. اضغط Home لإعادة ضبط الكاميرا.',
  'Filter the dataset': 'صفِّ البيانات',
  'Open the project menu and select a deployment. The 3D specimen stays illustrative.': 'افتح قائمة المشروع واختر موقعًا. تبقى العيّنة ثلاثية الأبعاد توضيحية.',
  'WEBGL / 3D': 'WEBGL / ثلاثي الأبعاد',
  // attributes (aria-label / title)
  'DesertSkin-X home': 'الصفحة الرئيسية لـ DesertSkin-X', 'Explore the project': 'استكشف المشروع', 'Navigation help': 'مساعدة التنقل',
  'Open project menu': 'افتح قائمة المشروع', 'Close project menu': 'أغلق قائمة المشروع', 'Close navigation': 'أغلق التنقل',
  'Close dialog': 'أغلق النافذة', 'Main navigation': 'التنقل الرئيسي', 'Data scope': 'نطاق البيانات',
  'Reset to all deployments': 'العودة إلى كل المواقع', 'Choose a sample': 'اختر عينة', 'Material comparison': 'مقارنة المواد',
  'Operational readings': 'القراءات التشغيلية', 'Presentation': 'العرض', 'Zoom in': 'تكبير', 'Zoom out': 'تصغير',
  'Pause automatic rotation': 'أوقف الدوران التلقائي', 'Start automatic rotation': 'شغّل الدوران التلقائي',
  'Isolate Hydrogel': 'اعزل الهيدروجيل', 'Isolate Aerogel': 'اعزل الأيروجيل', 'Isolate Interface': 'اعزل منطقة الربط', 'Isolate Hydration': 'اعزل الترطيب',
  'Interactive membrane. Drag or use arrow keys to rotate. Scroll or use plus and minus to zoom. Select a component to isolate it.':
    'غشاء تفاعلي. اسحب أو استخدم مفاتيح الأسهم للتدوير. مرّر أو استخدم زائد وناقص للتكبير. اختر مكوّنًا لعزله.',
  'Internal and external RH, grouped by deployment. Target 45 to 65 percent.': 'الرطوبة الداخلية والخارجية حسب الموقع. المستهدف 45 إلى 65 بالمئة.',
  'Temperature grouped by deployment, with 38 degree Celsius critical threshold.': 'الحرارة حسب الموقع، مع حد حرج 38 درجة مئوية.',
};

// pattern rules for text that is assembled at runtime
const tr = s => AR[s] !== undefined ? AR[s] : s;
const RULES = [
  [/^Sample (\d+)$/, (m, n) => 'العينة ' + n],
  [/^Sample (\d+) results$/, (m, n) => 'نتائج العينة ' + n],
  [/^at 2θ = (.+)°$/, (m, v) => 'عند 2θ = ' + v + '°'],
  [/^at (.+) cm⁻¹$/, (m, v) => 'عند ' + v + ' cm⁻¹'],
  [/^([\d,.]+) counts$/, (m, v) => v + ' عدّة'],
  [/^([\d,.]+) L$/, (m, v) => v + ' لتر'],
  [/^(\d+)% RH$/, (m, v) => 'رطوبة ' + v + '%'],
  [/^(\d+) critical$/, (m, v) => v + ' حرج'],
  [/^swelling at (\d+) min$/, (m, v) => 'الانتفاخ عند ' + v + ' دقيقة'],
  [/^(\d+) synthetic readings · all deployments$/, (m, n) => n + ' قراءة تجريبية · كل المواقع'],
  [/^(\d+) synthetic readings · (C\d\d) \/ (.+)$/, (m, n, c, u) => n + ' قراءة تجريبية · ' + c + ' / ' + tr(u)],
  [/^· (\d+) warning · (\d+) matching events$/, (m, w, e) => '· ' + w + ' تحذير · ' + e + ' حدث مطابق'],
  [/^Temperature (.+) °C exceeds (.+) °C\.$/, (m, a, b) => 'الحرارة ' + a + ' °م تتجاوز ' + b + ' °م.'],
  [/^Internal RH (.+)% exceeds (.+)%\.$/, (m, a, b) => 'الرطوبة الداخلية ' + a + '% تتجاوز ' + b + '%.'],
  [/^Humidity risk (.+) exceeds (.+)\.$/, (m, a, b) => 'خطر الرطوبة ' + a + ' يتجاوز ' + b + '.'],
  [/^RECORD INSPECTION \/ (C\d\d)$/, (m, c) => 'فحص السجل / ' + c],
  [/^(T\d{4}) \/ (C\d\d) (\S+)$/, (m, t, c, s) => t + ' / ' + c + ' ' + tr(s)],
  [/^(C\d\d) ([·/]) (\S+)$/, (m, c, sep, s) => c + ' ' + sep + ' ' + tr(s)],
  [/^Filter (C\d\d) (\S+), (.+)$/, (m, c, s, u) => 'صفِّ ' + c + ' ' + tr(s) + '، ' + tr(u)],
  [/^Inspect alert (T\d{4})$/, (m, t) => 'افحص التنبيه ' + t],
  [/^(S\d) (.+)$/, (m, id, f) => AR[f] !== undefined ? id + ' ' + AR[f] : null],
  [/^Sample (\d+) (.+)$/, (m, n, rest) => AR[rest] !== undefined ? 'العينة ' + n + ' ' + AR[rest] : null],
  [/^(T\d{4}) (C\d\d), (.+), ([\d.]+) degrees Celsius$/, (m, t, c, d, v) => t + ' ' + c + '، ' + d + '، ' + v + ' درجة مئوية'],
  [/^(T\d{4}) (C\d\d), (.+), ([\d.]+) percent (internal|external) RH$/, (m, t, c, d, v, k) => t + ' ' + c + '، ' + d + '، رطوبة ' + (k === 'internal' ? 'داخلية ' : 'خارجية ') + v + '%'],
  [/^(\d\d) Nov (\d\d:\d\d)$/, (m, d, t) => d + ' نوفمبر ' + t],
  [/^(S\d) · (\d+)% RH · (.+)$/, (m, id, rh, rest) => id + ' · رطوبة ' + rh + '% · ' + rest
      .replace('Δmass', 'Δالكتلة').replace(/\bdry\b/, 'جاف').replace(/\bhydrated\b/, 'مرطّب').replace('DEMO INPUT', 'مدخل تجريبي')],
];

function translate(raw) {
  const s = raw.replace(/\s+/g, ' ').trim();
  if (!s) return null;
  if (AR[s] !== undefined) return AR[s];
  for (const [re, fn] of RULES) {
    const m = s.match(re);
    if (m) { const out = fn(...m); if (out !== null && out !== undefined) return out; }
  }
  return null;
}

const ATTRS = ['aria-label', 'title', 'placeholder'];
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE']);
const originals = new WeakMap();          // text node -> original English
let lang = 'en';
const originalDir = document.documentElement.getAttribute('dir') || 'ltr';
let busy = false;

function doText(node) {
  if (!node.parentNode || SKIP.has(node.parentNode.nodeName)) return;
  if (node.parentNode.closest && node.parentNode.closest('[data-i18n-skip]')) return;
  const cur = node.nodeValue;
  const out = translate(cur);
  if (out === null || out === cur.trim()) return;
  originals.set(node, cur);
  const lead = cur.match(/^\s*/)[0], trail = cur.match(/\s*$/)[0];
  node.nodeValue = lead + out + trail;
}
function doAttrs(el) {
  for (const a of ATTRS) {
    const v = el.getAttribute && el.getAttribute(a);
    if (!v) continue;
    const out = translate(v);
    if (out !== null && out !== v) { el.setAttribute('data-i18n-' + a, v); el.setAttribute(a, out); }
  }
}
function walk(root) {
  if (root.nodeType === 3) { doText(root); return; }
  if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
  doAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
}
function restore() {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = w.nextNode())) {
    if (n.nodeType === 3) { if (originals.has(n)) { n.nodeValue = originals.get(n); originals.delete(n); } }
    else for (const a of ATTRS) { const o = n.getAttribute('data-i18n-' + a); if (o !== null) { n.setAttribute(a, o); n.removeAttribute('data-i18n-' + a); } }
  }
}

const observer = new MutationObserver(muts => {
  if (lang !== 'ar' || busy) return;
  busy = true;
  try {
    for (const m of muts) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttrs(m.target);
      else m.addedNodes.forEach(walk);
    }
  } finally { busy = false; }
});

// Arabic text reads right-to-left inside each existing box; the page layout itself is untouched.
const style = document.createElement('style');
style.textContent = '@font-face{font-family:"DSX Cairo";src:url("./fonts/Cairo.woff2") format("woff2");font-weight:200 1000;font-style:normal;font-display:swap}'
  + 'html[lang="ar"] body,html[lang="ar"] body *:not(.i18n-toggle){font-family:"DSX Cairo","Segoe UI",Tahoma,Arial,sans-serif!important;font-style:normal!important;letter-spacing:normal!important}'
  + 'html[lang="ar"] body :is(p,h1,h2,h3,h4,h5,h6,li,dt,dd,td,th,caption,figcaption,label,small,strong,span,a,button,option,div,legend,summary,em,b){unicode-bidi:plaintext}'
  + 'html[dir="rtl"] svg,html[dir="rtl"] canvas,html[dir="rtl"] .wordmark{direction:ltr}'
  + '.i18n-toggle{font:inherit;font-size:.78rem;letter-spacing:.04em;cursor:pointer}';
document.head.appendChild(style);

const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'i18n-toggle';
btn.setAttribute('data-i18n-skip', '');
btn.setAttribute('aria-label', 'Language / اللغة');
const tools = document.querySelector('.nav-tools');
const help = document.getElementById('help-open');
if (tools) tools.insertBefore(btn, help || tools.firstChild);
else document.body.prepend(btn);

function setLang(next) {
  lang = next;
  document.documentElement.lang = next === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = next === 'ar' ? 'rtl' : originalDir;
  btn.textContent = next === 'ar' ? 'EN' : 'عربي';
  if (next === 'ar') { busy = true; try { walk(document.body); document.title = translate(document.title) || document.title; } finally { busy = false; } }
  else { busy = true; try { restore(); } finally { busy = false; } }
  try { localStorage.setItem('dsx-lang', next); } catch (e) { /* storage unavailable */ }
}
btn.addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar'));

observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
const originalTitle = document.title;
let start = 'en';
try { start = new URLSearchParams(location.search).get('lang') || localStorage.getItem('dsx-lang') || 'en'; } catch (e) { /* ignore */ }
setLang(start === 'ar' ? 'ar' : 'en');
btn.addEventListener('click', () => { if (lang === 'en') document.title = originalTitle; });
})();
