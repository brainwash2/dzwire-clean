import type { Locale } from "./types";

export type EventCategory =
  | "national"
  | "islamic"
  | "tech"
  | "tourism"
  | "sport"
  | "culture"
  | "trade";

export interface DzEvent {
  id: string;
  date: string;     // YYYY-MM-DD (start)
  endDate?: string; // YYYY-MM-DD
  title: Record<Locale, string>;
  category: EventCategory;
  icon: string;
  description?: Record<Locale, string>;
  location?: Record<Locale, string>;
  website?: string;
  tags?: string[];
  isApprox?: boolean;
  featured?: boolean;
}

export const CATEGORY_META: Record<
  EventCategory,
  { label: Record<Locale, string>; color: string; bg: string; icon: string }
> = {
  national:  { icon: "🇩🇿", label: { fr: "Fête nationale", ar: "عيد وطني",     en: "National"    }, color: "#00d632", bg: "rgba(0,214,50,0.08)"   },
  islamic:   { icon: "☪️",  label: { fr: "Fête islamique", ar: "عيد ديني",     en: "Islamic"     }, color: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  tech:      { icon: "💻",  label: { fr: "Tech & Digital",  ar: "تكنولوجيا",    en: "Tech & Dev"  }, color: "#0088cc", bg: "rgba(0,136,204,0.08)"  },
  tourism:   { icon: "🏺",  label: { fr: "Tourisme",        ar: "سياحة",        en: "Tourism"     }, color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  sport:     { icon: "⚽",  label: { fr: "Sport",           ar: "رياضة",        en: "Sport"       }, color: "#ff0055", bg: "rgba(255,0,85,0.08)"   },
  culture:   { icon: "🎭",  label: { fr: "Culture",         ar: "ثقافة",        en: "Culture"     }, color: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  trade:     { icon: "🤝",  label: { fr: "Foire / Salon",   ar: "معارض تجارية", en: "Trade Fair"  }, color: "#f97316", bg: "rgba(249,115,22,0.08)" },
};

export const DZ_EVENTS_2026: DzEvent[] = [

  // ── NATIONAL HOLIDAYS ──────────────────────────────────────────────
  {
    id: "new-year-2026",
    date: "2026-01-01",
    title: { fr: "Nouvel An", ar: "رأس السنة الميلادية", en: "New Year's Day" },
    category: "national", icon: "🎆",
    location: { fr: "Nationale", ar: "وطني", en: "Nationwide" },
  },
  {
    id: "yennayer-2976",
    date: "2026-01-12",
    title: { fr: "Yennayer 2976 — Nouvel An Amazigh", ar: "يناير 2976 — رأس السنة الأمازيغية", en: "Yennayer 2976 — Amazigh New Year" },
    category: "national", icon: "☀️", featured: true,
    location: { fr: "Nationale", ar: "وطني", en: "Nationwide" },
    description: {
      fr: "Yennayer marque le début du calendrier agraire berbère. Fête nationale depuis 2018.",
      ar: "يناير يرمز إلى بداية التقويم الأمازيغي الزراعي. عيد وطني رسمي منذ 2018.",
      en: "Yennayer marks the start of the Berber agrarian calendar. Official public holiday since 2018.",
    },
  },
  {
    id: "labour-day-2026",
    date: "2026-05-01",
    title: { fr: "Fête du Travail", ar: "عيد العمال", en: "Labour Day" },
    category: "national", icon: "⚒️",
    location: { fr: "Nationale", ar: "وطني", en: "Nationwide" },
  },
  {
    id: "oil-nationalisation",
    date: "2026-06-19",
    title: { fr: "Fête de la Récupération du Pétrole", ar: "ذكرى تأميم المحروقات", en: "Oil Nationalisation Day" },
    category: "national", icon: "🛢️",
  },
  {
    id: "independence-day-2026",
    date: "2026-07-05",
    title: { fr: "Fête de l'Indépendance — 64 ans", ar: "عيد الاستقلال — 64 عاماً", en: "Independence Day — 64th Anniversary" },
    category: "national", icon: "🇩🇿", featured: true,
    location: { fr: "Nationale", ar: "وطني", en: "Nationwide" },
    description: {
      fr: "Anniversaire de l'indépendance de l'Algérie proclamée le 5 juillet 1962.",
      ar: "الذكرى السنوية لاستقلال الجزائر المُعلَن في 5 يوليو 1962.",
      en: "Anniversary of Algeria's independence proclaimed on 5 July 1962.",
    },
  },
  {
    id: "revolution-day-2026",
    date: "2026-11-01",
    title: { fr: "Fête de la Révolution — 72 ans", ar: "عيد الثورة — 72 عاماً", en: "Revolution Day — 72nd Anniversary" },
    category: "national", icon: "🔥",
    description: {
      fr: "Commémoration du déclenchement de la guerre d'indépendance le 1ᵉʳ novembre 1954.",
      ar: "إحياء ذكرى اندلاع ثورة التحرير في الأول من نوفمبر 1954.",
      en: "Commemoration of the outbreak of the War of Independence on 1 November 1954.",
    },
  },

  // ── ISLAMIC HOLIDAYS ───────────────────────────────────────────────
  {
    id: "eid-al-fitr-2026",
    date: "2026-03-20",
    title: { fr: "Aïd El-Fitr", ar: "عيد الفطر المبارك", en: "Eid Al-Fitr" },
    category: "islamic", icon: "🌙", isApprox: true, featured: true,
    description: {
      fr: "Fin du mois de Ramadan. Date approximative — dépend de l'observation du croissant.",
      ar: "انتهاء شهر رمضان المبارك. التاريخ تقريبي ويعتمد على رؤية الهلال.",
      en: "End of Ramadan. Approximate — depends on moon sighting.",
    },
  },
  {
    id: "eid-al-adha-2026",
    date: "2026-05-27",
    title: { fr: "Aïd El-Adha (Grande Fête)", ar: "عيد الأضحى المبارك", en: "Eid Al-Adha" },
    category: "islamic", icon: "🐑", isApprox: true, featured: true,
  },
  {
    id: "muharram-1448",
    date: "2026-06-16",
    title: { fr: "Nouvel An Hégirien 1448", ar: "رأس السنة الهجرية 1448", en: "Islamic New Year 1448" },
    category: "islamic", icon: "🕌", isApprox: true,
  },
  {
    id: "achura-2026",
    date: "2026-07-25",
    title: { fr: "Achoura", ar: "عاشوراء", en: "Ashura" },
    category: "islamic", icon: "🕯️", isApprox: true,
  },
  {
    id: "mawlid-2026",
    date: "2026-09-23",
    title: { fr: "Mawlid An-Nabawi Acharif", ar: "المولد النبوي الشريف", en: "Prophet's Birthday (Mawlid)" },
    category: "islamic", icon: "🌹", isApprox: true,
  },

  // ── TECH & DIGITAL EVENTS ──────────────────────────────────────────
  {
    id: "pycon-algeria-2026",
    date: "2026-03-14",
    endDate: "2026-03-15",
    title: { fr: "PyCon Algeria 2026", ar: "مؤتمر بايثون الجزائر 2026", en: "PyCon Algeria 2026" },
    category: "tech", icon: "🐍", featured: true,
    location: { fr: "Alger — ESI ou USTHB", ar: "الجزائر — مدرسة العليا للإعلام الآلي", en: "Algiers — ESI or USTHB" },
    tags: ["Python", "Open Source", "Data Science"],
    description: {
      fr: "Conférence annuelle de la communauté Python algérienne. Talks, workshops et networking.",
      ar: "المؤتمر السنوي لمجتمع بايثون الجزائري. محاضرات وورش عمل وفرص للتواصل.",
      en: "Annual conference of the Algerian Python community. Talks, workshops & networking.",
    },
    website: "https://pyalgeria.com",
  },
  {
    id: "microsoft-ai-tour-alger-2026",
    date: "2026-04-09",
    title: { fr: "Microsoft AI Tour — Alger", ar: "Microsoft AI Tour — الجزائر", en: "Microsoft AI Tour — Algiers" },
    category: "tech", icon: "🤖",
    location: { fr: "Alger — Hôtel El Aurassi", ar: "الجزائر — فندق الأوراسي", en: "Algiers — El Aurassi Hotel" },
    tags: ["AI", "Azure", "Microsoft", "LLM"],
    description: {
      fr: "Étape algérienne du tour mondial Microsoft sur l'IA générative et Azure OpenAI.",
      ar: "المحطة الجزائرية من الجولة العالمية لـ Microsoft حول الذكاء الاصطناعي وAzure.",
      en: "Algiers stop of Microsoft's global generative AI & Azure OpenAI tour.",
    },
  },
  {
    id: "gitex-africa-2026",
    date: "2026-04-14",
    endDate: "2026-04-16",
    title: { fr: "GITEX Africa 2026 — Marrakech", ar: "جيتكس أفريقيا 2026 — مراكش", en: "GITEX Africa 2026 — Marrakech" },
    category: "tech", icon: "🌍", featured: true,
    location: { fr: "Marrakech, Maroc", ar: "مراكش، المغرب", en: "Marrakech, Morocco" },
    tags: ["Tech", "Startup", "Investment", "AI", "Africa"],
    description: {
      fr: "Le plus grand salon tech d'Afrique. Les startups algériennes y participent massivement.",
      ar: "أكبر معرض تقني في أفريقيا. تشارك فيه الشركات الناشئة الجزائرية بكثافة.",
      en: "Africa's biggest tech show. Algerian startups attend in force.",
    },
    website: "https://gitexafrica.com",
  },
  {
    id: "digital-algeria-forum-2026",
    date: "2026-05-19",
    endDate: "2026-05-20",
    title: { fr: "Digital Algeria Forum 2026", ar: "منتدى الجزائر الرقمي 2026", en: "Digital Algeria Forum 2026" },
    category: "tech", icon: "🇩🇿", featured: true,
    location: { fr: "Alger — Centre International de Conférences", ar: "الجزائر — المركز الدولي للمؤتمرات", en: "Algiers — International Conference Centre" },
    tags: ["Digital", "Government", "Startup", "e-Gov"],
    description: {
      fr: "Forum annuel sur la transformation numérique de l'Algérie, organisé avec le Ministère de la Numérisation.",
      ar: "المنتدى السنوي للتحول الرقمي في الجزائر، بتنظيم مشترك مع وزارة الرقمنة.",
      en: "Annual forum on Algeria's digital transformation, co-organised with the Ministry of Digitisation.",
    },
  },
  {
    id: "aws-community-day-dz-2026",
    date: "2026-06-06",
    title: { fr: "AWS Community Day Algeria 2026", ar: "يوم مجتمع AWS الجزائر 2026", en: "AWS Community Day Algeria 2026" },
    category: "tech", icon: "☁️",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
    tags: ["AWS", "Cloud", "DevOps", "Serverless"],
    description: {
      fr: "Journée communautaire AWS avec sessions techniques, workshops et meetup.",
      ar: "يوم مجتمعي لـ AWS مع جلسات تقنية وورش عمل وملتقى.",
      en: "AWS community day with technical sessions, workshops & meetup.",
    },
  },
  {
    id: "hack4algeria-2026",
    date: "2026-06-20",
    endDate: "2026-06-21",
    title: { fr: "Hack4Algeria 2026 — Hackathon National", ar: "هاك فور الجزائر 2026 — الهاكاثون الوطني", en: "Hack4Algeria 2026 — National Hackathon" },
    category: "tech", icon: "🧑‍💻", featured: true,
    location: { fr: "Alger + plusieurs wilayas", ar: "الجزائر + عدة ولايات", en: "Algiers + multiple wilayas" },
    tags: ["Hackathon", "Startup", "Innovation", "Civic Tech"],
    description: {
      fr: "Hackathon national sur 48h organisé par le Ministère de la Numérisation. Équipes de 4-6 développeurs.",
      ar: "هاكاثون وطني لمدة 48 ساعة تنظمه وزارة الرقمنة. فرق من 4-6 مطورين.",
      en: "48-hour national hackathon organised by the Ministry of Digitisation. Teams of 4-6 developers.",
    },
  },
  {
    id: "algeria-startup-weekend-2026",
    date: "2026-09-11",
    endDate: "2026-09-13",
    title: { fr: "Startup Weekend Algeria — Alger", ar: "ستارتب ويكند الجزائر — الجزائر العاصمة", en: "Startup Weekend Algeria — Algiers" },
    category: "tech", icon: "🚀",
    location: { fr: "Alger — Hub d'Innovation", ar: "الجزائر — مركز الابتكار", en: "Algiers — Innovation Hub" },
    tags: ["Startup", "Entrepreneurship", "Lean Startup", "54h"],
    description: {
      fr: "54 heures pour créer une startup : idéation → prototype → pitch. Format Techstars.",
      ar: "54 ساعة لإنشاء شركة ناشئة: الفكرة → النموذج الأولي → العرض. نمط Techstars.",
      en: "54 hours to build a startup: idea → prototype → pitch. Techstars format.",
    },
  },
  {
    id: "gdg-algiers-devfest-2026",
    date: "2026-10-10",
    endDate: "2026-10-11",
    title: { fr: "GDG Alger DevFest 2026", ar: "مهرجان المطورين GDG الجزائر 2026", en: "GDG Algiers DevFest 2026" },
    category: "tech", icon: "🔵", featured: true,
    location: { fr: "Alger — Campus USTHB", ar: "الجزائر — جامعة USTHB", en: "Algiers — USTHB Campus" },
    tags: ["Google", "Android", "Flutter", "Web", "AI/ML"],
    description: {
      fr: "Le plus grand événement tech de la communauté Google Developers Group d'Alger. Gratuit.",
      ar: "أكبر فعالية تقنية لمجتمع Google Developers Group بالجزائر. مجاني.",
      en: "The biggest tech event of Google Developers Group Algiers. Free to attend.",
    },
    website: "https://gdg.community/gdg-algiers",
  },
  {
    id: "djazair-innov-2026",
    date: "2026-11-10",
    endDate: "2026-11-13",
    title: { fr: "Djazaïr Innov 2026", ar: "جزائر إينوف 2026", en: "Djazaïr Innov 2026" },
    category: "tech", icon: "⚡", featured: true,
    location: { fr: "Alger — Palais des Expositions (SAFEX)", ar: "الجزائر — قصر المعارض (صافكس)", en: "Algiers — SAFEX Exhibition Palace" },
    tags: ["Innovation", "Startup", "R&D", "Industry 4.0"],
    description: {
      fr: "Salon national de l'innovation et de l'industrie 4.0. Exposants, compétitions startups et conferences.",
      ar: "المعرض الوطني للابتكار والصناعة 4.0. عارضون ومسابقات للشركات الناشئة ومحاضرات.",
      en: "National innovation & Industry 4.0 show. Exhibitors, startup competitions & conferences.",
    },
  },
  {
    id: "open-source-day-dz-2026",
    date: "2026-10-28",
    title: { fr: "Open Source Day Algeria 2026", ar: "يوم المصدر المفتوح الجزائر 2026", en: "Open Source Day Algeria 2026" },
    category: "tech", icon: "🐧",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
    tags: ["Linux", "Open Source", "FOSS", "Community"],
    description: {
      fr: "Journée dédiée à l'open source avec conférences, ateliers et projets collaboratifs.",
      ar: "يوم مخصص للبرمجيات مفتوحة المصدر مع محاضرات وورش عمل ومشاريع تعاونية.",
      en: "Day dedicated to open source with talks, workshops & collaborative projects.",
    },
  },

  // ── TOURISM & CULTURAL FESTIVALS ──────────────────────────────────
  {
    id: "sitev-2026",
    date: "2026-03-19",
    endDate: "2026-03-22",
    title: {
      fr: "SITEV 2026 — Salon International du Tourisme et Voyage",
      ar: "سيتاف 2026 — الصالون الدولي للسياحة والسفر",
      en: "SITEV 2026 — International Tourism & Travel Expo",
    },
    category: "tourism", icon: "✈️", featured: true,
    location: { fr: "Alger — SAFEX, Pins Maritimes", ar: "الجزائر — صافكس، الصنوبر البحري", en: "Algiers — SAFEX, Pins Maritimes" },
    tags: ["Tourism", "Travel", "Hospitality", "Expo"],
    description: {
      fr: "Le grand salon algérien du tourisme rassemblant offices du tourisme, tour-opérateurs et agences.",
      ar: "المعرض الجزائري الكبير للسياحة الذي يجمع مكاتب السياحة والمشغّلين والوكالات.",
      en: "Algeria's flagship tourism expo bringing together tourism offices, tour operators and agencies.",
    },
  },
  {
    id: "festival-tlemcen-2026",
    date: "2026-07-01",
    endDate: "2026-07-10",
    title: {
      fr: "Festival International de Musique Andalouse — Tlemcen",
      ar: "مهرجان الموسيقى الأندلسية الدولي — تلمسان",
      en: "International Andalusian Music Festival — Tlemcen",
    },
    category: "tourism", icon: "🎶",
    location: { fr: "Tlemcen", ar: "تلمسان", en: "Tlemcen" },
    tags: ["Music", "Andalusian", "Heritage", "UNESCO"],
    description: {
      fr: "Tlemcen, capitale de la culture islamique, accueille ce festival exceptionnel de musique arabo-andalouse.",
      ar: "تلمسان، عاصمة الثقافة الإسلامية، تستضيف هذا المهرجان الاستثنائي للموسيقى الأندلسية العربية.",
      en: "Tlemcen, capital of Islamic culture, hosts this exceptional festival of Arabo-Andalusian music.",
    },
  },
  {
    id: "festival-timgad-2026",
    date: "2026-08-01",
    endDate: "2026-08-07",
    title: { fr: "Festival International de Timgad", ar: "مهرجان تيمقاد الدولي", en: "Timgad International Festival" },
    category: "tourism", icon: "🏛️", featured: true,
    location: { fr: "Timgad, Batna", ar: "تيمقاد، باتنة", en: "Timgad, Batna" },
    tags: ["Music", "Open-Air", "Roman Ruins", "Heritage"],
    description: {
      fr: "Le plus grand festival open-air d'Afrique du Nord, dans les ruines romaines de Timgad. Artistes de renommée mondiale.",
      ar: "أكبر مهرجان في الهواء الطلق في شمال أفريقيا، وسط أطلال مدينة تيمقاد الرومانية. فنانون عالميون.",
      en: "The largest open-air festival in North Africa, among the Roman ruins of Timgad. World-class artists.",
    },
  },
  {
    id: "salon-artisanat-national-2026",
    date: "2026-05-05",
    endDate: "2026-05-12",
    title: {
      fr: "Salon National de l'Artisanat Algérien",
      ar: "الصالون الوطني للصناعة التقليدية الجزائرية",
      en: "National Algerian Crafts Fair",
    },
    category: "tourism", icon: "🏺",
    location: { fr: "Alger — SAFEX", ar: "الجزائر — صافكس", en: "Algiers — SAFEX" },
    tags: ["Crafts", "Artisanat", "Culture", "Heritage"],
    description: {
      fr: "Exposition des métiers d'art algériens : bijoux berbères, poterie kabyle, tapis du M'Zab.",
      ar: "معرض الحرف الجزائرية: المجوهرات الأمازيغية وخزف القبائل وسجاد وادي ميزاب.",
      en: "Exhibition of Algerian arts and crafts: Berber jewellery, Kabyle pottery, M'Zab rugs.",
    },
  },
  {
    id: "fisa-taghit-2026",
    date: "2026-12-10",
    endDate: "2026-12-14",
    title: {
      fr: "Festival International du Film du Sahara — Taghit",
      ar: "مهرجان الصحراء الدولي للفيلم — تاغيت",
      en: "International Sahara Film Festival — Taghit",
    },
    category: "tourism", icon: "🎬",
    location: { fr: "Taghit, Béchar", ar: "تاغيت، بشار", en: "Taghit, Béchar" },
    tags: ["Film", "Cinema", "Sahara", "Culture"],
    description: {
      fr: "Cinéma sous les étoiles du Sahara algérien. Une expérience unique alliant 7ème art et désert.",
      ar: "السينما تحت نجوم الصحراء الجزائرية. تجربة فريدة تجمع الفن السابع والصحراء الكبرى.",
      en: "Cinema under the stars of the Algerian Sahara. A unique experience blending film and desert.",
    },
  },
  {
    id: "fete-tapis-ghardaia-2026",
    date: "2026-10-15",
    endDate: "2026-10-20",
    title: {
      fr: "Fête du Tapis de Ghardaïa",
      ar: "مهرجان السجاد التقليدي — غرداية",
      en: "Ghardaïa Carpet Festival",
    },
    category: "tourism", icon: "🧶",
    location: { fr: "Ghardaïa (M'Zab)", ar: "غرداية (وادي مزاب)", en: "Ghardaïa (M'Zab Valley)" },
    tags: ["Crafts", "Heritage", "UNESCO", "Amazigh"],
    description: {
      fr: "Festival célébrant le tapis traditionnel du M'Zab dans la cité millénaire de Ghardaïa, classée UNESCO.",
      ar: "مهرجان يحتفي بالسجاد التقليدي لوادي مزاب في مدينة غرداية التاريخية، المصنّفة يونيسكو.",
      en: "Festival celebrating traditional M'Zab rugs in Ghardaïa, a UNESCO World Heritage city.",
    },
  },

  // ── TRADE FAIRS ────────────────────────────────────────────────────
  {
    id: "fipa-2026",
    date: "2026-06-01",
    endDate: "2026-06-06",
    title: {
      fr: "FIPA 2026 — Foire Internationale d'Alger",
      ar: "FIPA 2026 — المعرض الدولي للجزائر",
      en: "FIPA 2026 — International Algiers Trade Fair",
    },
    category: "trade", icon: "🏢", featured: true,
    location: { fr: "Alger — SAFEX, Pins Maritimes", ar: "الجزائر — صافكس، الصنوبر البحري", en: "Algiers — SAFEX, Pins Maritimes" },
    tags: ["B2B", "International", "Trade", "Export"],
    description: {
      fr: "La plus ancienne foire internationale d'Algérie. Milliers d'exposants de plus de 60 pays.",
      ar: "أقدم معرض دولي في الجزائر. آلاف العارضين من أكثر من 60 دولة.",
      en: "Algeria's oldest international trade fair. Thousands of exhibitors from 60+ countries.",
    },
    website: "https://safex.dz",
  },
  {
    id: "batimatec-2026",
    date: "2026-05-10",
    endDate: "2026-05-14",
    title: {
      fr: "Batimatec 2026 — Salon de la Construction",
      ar: "بتيماتيك 2026 — معرض البناء والمواد",
      en: "Batimatec 2026 — Construction & Materials Expo",
    },
    category: "trade", icon: "🏗️",
    location: { fr: "Alger — SAFEX", ar: "الجزائر — صافكس", en: "Algiers — SAFEX" },
    tags: ["Construction", "Architecture", "Real Estate", "Materials"],
    description: {
      fr: "Salon international de la construction, des matériaux et de l'équipement. Le plus grand du secteur BTP en Algérie.",
      ar: "المعرض الدولي للبناء والمواد والتجهيزات. الأكبر في قطاع البناء في الجزائر.",
      en: "International exhibition for construction, materials & equipment. Algeria's largest construction industry show.",
    },
  },
  {
    id: "motor-show-alger-2026",
    date: "2026-10-08",
    endDate: "2026-10-13",
    title: {
      fr: "Salon International de l'Auto — Alger 2026",
      ar: "المعرض الدولي للسيارات بالجزائر 2026",
      en: "Algiers International Motor Show 2026",
    },
    category: "trade", icon: "🚗",
    location: { fr: "Alger — SAFEX", ar: "الجزائر — صافكس", en: "Algiers — SAFEX" },
    tags: ["Automotive", "EV", "Industry", "B2C"],
    description: {
      fr: "Salon automobile avec lancements de modèles, véhicules électriques et constructeurs internationaux.",
      ar: "معرض السيارات مع إطلاق موديلات جديدة وسيارات كهربائية وصناع دوليون.",
      en: "Auto show with new model launches, electric vehicles & international manufacturers.",
    },
  },
  {
    id: "sila-2026",
    date: "2026-10-28",
    endDate: "2026-11-07",
    title: { fr: "Salon International du Livre d'Alger (SILA)", ar: "الصالون الدولي للكتاب بالجزائر", en: "Algiers International Book Fair (SILA)" },
    category: "culture", icon: "📚", featured: true,
    location: { fr: "Alger — SAFEX, Pins Maritimes", ar: "الجزائر — صافكس، الصنوبر البحري", en: "Algiers — SAFEX, Pins Maritimes" },
    tags: ["Literature", "Books", "Arab World", "Publishing"],
    description: {
      fr: "L'un des plus grands salons du livre du monde arabe. Plus de 1 000 éditeurs internationaux.",
      ar: "من أكبر معارض الكتاب في العالم العربي. أكثر من 1000 ناشر دولي.",
      en: "One of the largest book fairs in the Arab world. 1,000+ international publishers.",
    },
  },

  // ── SPORT ──────────────────────────────────────────────────────────
  {
    id: "can-2025-afcon",
    date: "2026-05-15",
    endDate: "2026-06-15",
    title: { fr: "CAN 2025 — Maroc (Les Fennecs)", ar: "كأس أمم أفريقيا 2025 — المغرب", en: "AFCON 2025 — Morocco (Fennecs)" },
    category: "sport", icon: "⚽", featured: true,
    location: { fr: "Maroc", ar: "المملكة المغربية", en: "Morocco" },
    tags: ["Football", "Fennecs", "AFCON", "Africa"],
    description: {
      fr: "La Coupe d'Afrique des Nations 2025 se tient au Maroc. Les Fennecs algériens visent le titre.",
      ar: "كأس أمم أفريقيا 2025 في المغرب. الفنيكس الجزائري يطمح للقب.",
      en: "Africa Cup of Nations 2025 hosted in Morocco. Algeria's Fennecs aim for the title.",
    },
  },
  {
    id: "fifa-world-cup-2026",
    date: "2026-06-11",
    endDate: "2026-07-19",
    title: { fr: "Coupe du Monde FIFA 2026", ar: "كأس العالم FIFA 2026", en: "FIFA World Cup 2026" },
    category: "sport", icon: "🏆", featured: true,
    location: { fr: "USA · Canada · Mexique", ar: "الولايات المتحدة · كندا · المكسيك", en: "USA · Canada · Mexico" },
    tags: ["Football", "FIFA", "Algeria", "World Cup"],
    description: {
      fr: "Coupe du Monde 2026 co-organisée par les États-Unis, le Canada et le Mexique. L'Algérie participe.",
      ar: "كأس العالم 2026 تستضيفها الولايات المتحدة وكندا والمكسيك. الجزائر مشاركة.",
      en: "FIFA World Cup co-hosted by USA, Canada & Mexico. Algeria participating.",
    },
  },
  {
    id: "marathon-algiers-2026",
    date: "2026-03-07",
    title: { fr: "Marathon International d'Alger 2026", ar: "ماراثون الجزائر الدولي 2026", en: "Algiers International Marathon 2026" },
    category: "sport", icon: "🏃",
    location: { fr: "Alger", ar: "الجزائر العاصمة", en: "Algiers" },
    tags: ["Running", "Athletics", "Sport"],
    description: {
      fr: "Course annuelle de 42 km à travers les plus beaux quartiers de la capitale algérienne.",
      ar: "سباق سنوي لمسافة 42 كم عبر أجمل أحياء العاصمة الجزائرية.",
      en: "Annual 42 km race through the most beautiful neighbourhoods of Algiers.",
    },
  },
  {
    id: "tour-algerie-cyclisme-2026",
    date: "2026-04-20",
    endDate: "2026-04-27",
    title: { fr: "Tour International d'Algérie (Cyclisme)", ar: "الطواف الدولي للجزائر (الدراجات)", en: "International Tour of Algeria (Cycling)" },
    category: "sport", icon: "🚴",
    location: { fr: "Plusieurs wilayas", ar: "عدة ولايات", en: "Multiple wilayas" },
    tags: ["Cycling", "UCI", "Africa", "Sport"],
    description: {
      fr: "Épreuve cycliste UCI se déroulant sur plusieurs étapes à travers l'Algérie.",
      ar: "سباق الدراجات UCI يمتد على عدة مراحل عبر الجزائر.",
      en: "UCI cycling race spanning multiple stages across Algeria.",
    },
  },

  // ── CULTURE ────────────────────────────────────────────────────────
  {
    id: "festival-theatre-nat-2026",
    date: "2026-04-16",
    endDate: "2026-04-24",
    title: {
      fr: "Festival National du Théâtre Professionnel",
      ar: "المهرجان الوطني للمسرح المحترف",
      en: "National Professional Theatre Festival",
    },
    category: "culture", icon: "🎭",
    location: { fr: "Alger — TNA", ar: "الجزائر — المسرح الوطني الجزائري", en: "Algiers — TNA" },
    tags: ["Theatre", "Arts", "Ministry of Culture", "Drama"],
    description: {
      fr: "Festival majeur du théâtre algérien organisé par le Ministère de la Culture.",
      ar: "مهرجان مسرحي جزائري كبير ينظمه وزارة الثقافة.",
      en: "Major Algerian theatre festival organised by the Ministry of Culture.",
    },
  },
  {
    id: "journee-patrimoine-2026",
    date: "2026-04-18",
    title: {
      fr: "Journée Internationale du Patrimoine",
      ar: "اليوم العالمي للتراث",
      en: "World Heritage Day",
    },
    category: "culture", icon: "🏰",
    location: { fr: "Sites UNESCO d'Algérie", ar: "مواقع اليونسكو في الجزائر", en: "Algeria's UNESCO sites" },
    tags: ["UNESCO", "Heritage", "Tourism", "History"],
    description: {
      fr: "Journée internationale des monuments et sites. Accès libre aux sites UNESCO algériens.",
      ar: "اليوم الدولي للمعالم والمواقع. دخول مجاني للمواقع الجزائرية المصنّفة يونيسكو.",
      en: "International Day of Monuments and Sites. Free access to Algeria's UNESCO sites.",
    },
  },
];

// ── Helpers ─────────────────────────────────────────────────────────
export function getStatus(event: DzEvent): "ended" | "ongoing" | "upcoming" {
  const today = new Date().toISOString().split("T")[0];
  const end = event.endDate ?? event.date;
  if (end < today) return "ended";
  if (event.date <= today) return "ongoing";
  return "upcoming";
}

export function getUpcomingEvents(count = 6): DzEvent[] {
  const today = new Date().toISOString().split("T")[0];
  return DZ_EVENTS_2026
    .filter((e) => (e.endDate ?? e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

export function getFeaturedUpcoming(events: DzEvent[] = DZ_EVENTS_2026): DzEvent | undefined {
  const today = new Date().toISOString().split("T")[0];
  return events
    .filter((e) => e.featured && (e.endDate ?? e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}
