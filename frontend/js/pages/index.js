// Mise à jour de l'année dans le footer
const yearEl = document.getElementById('current-year');
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const translations = {
    fr: {
        "nav.home": "Accueil",
        "nav.destinations": "Destinations",
        "nav.circuits": "Circuits",
        "nav.experiences": "Expériences",
        "nav.contact": "Contact",
        "nav.why": "Pourquoi nous ?",
        "nav.login": "Connexion",
        "nav.register": "Inscription",
        "nav.dashboard": "Mon Tableau de bord",
        "nav.logout": "Déconnexion",
        "hero.title": "Explorez Madagascar avec TravelMS",
        "hero.subtitle": "Découvrez des destinations inoubliables, des circuits uniques et des hébergements de prestige au cœur de la Grande Île.",
        "hero.placeholder": "Quelle région souhaitez-vous explorer ?",
        "hero.search": "Rechercher",
        "destinations.title": "DESTINATIONS POPULAIRES",
        "exp.title": "VIVEZ DES EXPÉRIENCES UNIQUES",
        "reviews.title": "CE QUE DISENT NOS CLIENTS",
        "newsletter.title": "RESTEZ INFORMÉ DE NOS OFFRES",
        "circuits.title": "Nos Circuits Phares à Madagascar",
        "circuits.subtitle": "Les expériences les plus prisées par nos voyageurs du monde entier.",
        "circuit.nosybe.duration": "⏳ 8 jours / 7 nuits",
        "circuit.nosybe.title": "Nosy Be & Îles Voisines",
        "circuit.nosybe.price": "Dès 850 €",
        "circuit.nosybe.desc": "Eaux turquoise, récifs coralliens et détente tropicale absolue.",
        "circuit.baobabs.duration": "⏳ 6 jours / 5 nuits",
        "circuit.baobabs.title": "L'Avenue des Baobabs",
        "circuit.baobabs.price": "Dès 690 €",
        "circuit.baobabs.desc": "Couchers de soleil mythiques au cœur des géants de l'Ouest malgache.",
        "circuit.tsingy.duration": "⏳ 10 jours / 9 nuits",
        "circuit.tsingy.title": "Expédition Tsingy de Bemaraha",
        "circuit.tsingy.price": "Dès 920 €",
        "circuit.tsingy.desc": "Labyrinthes de pierre uniques au monde et canyons spectaculaires.",
        "circuit.cta": "Découvrir le circuit →",
        "card.from": "À partir de",
        "card.cta": "Voir l'offre",
        "feat.1.title": "Paiement 100% sécurisé",
        "feat.1.desc": "Transactions internationales protégées par les standards de sécurité les plus stricts.",
        "feat.2.title": "Support local & international 24/7",
        "feat.2.desc": "Une équipe dédiée sur place à Madagascar vous accompagne avant, pendant et après votre voyage.",
        "feat.3.title": "Circuits sur-mesure",
        "feat.3.desc": "Des experts locaux conçoivent des itinéraires authentiques adaptés à vos envies d'évasion.",
        "footer.rights": "Tous droits réservés."
    },
    en: {
        "nav.home": "Home",
        "nav.destinations": "Destinations",
        "nav.circuits": "Tours",
        "nav.experiences": "Experiences",
        "nav.contact": "Contact",
        "nav.why": "Why us?",
        "nav.login": "Sign In",
        "nav.register": "Register",
        "nav.dashboard": "My Dashboard",
        "nav.logout": "Sign Out",
        "hero.title": "Explore Madagascar with TravelMS",
        "hero.subtitle": "Discover unforgettable destinations, unique tours, and prestigious accommodations in the heart of the Great Island.",
        "hero.placeholder": "Which region do you want to explore?",
        "hero.search": "Search",
        "destinations.title": "POPULAR DESTINATIONS",
        "exp.title": "LIVE UNIQUE EXPERIENCES",
        "reviews.title": "WHAT OUR CLIENTS SAY",
        "newsletter.title": "STAY INFORMED ABOUT OUR OFFERS",
        "circuits.title": "Our Featured Tours in Madagascar",
        "circuits.subtitle": "The most popular experiences chosen by travelers worldwide.",
        "circuit.nosybe.duration": "⏳ 8 days / 7 nights",
        "circuit.nosybe.title": "Nosy Be & Neighboring Islands",
        "circuit.nosybe.price": "From €850",
        "circuit.nosybe.desc": "Turquoise waters, coral reefs, and absolute tropical relaxation.",
        "circuit.baobabs.duration": "⏳ 6 days / 5 nights",
        "circuit.baobabs.title": "The Avenue of the Baobabs",
        "circuit.baobabs.price": "From €690",
        "circuit.baobabs.desc": "Mythical sunsets in the heart of the Malagasy western giants.",
        "circuit.tsingy.duration": "⏳ 10 days / 9 nights",
        "circuit.tsingy.title": "Tsingy de Bemaraha Expedition",
        "circuit.tsingy.price": "From €920",
        "circuit.tsingy.desc": "Unique stone labyrinths in the world and spectacular canyons.",
        "circuit.cta": "Discover the tour →",
        "card.from": "From",
        "card.cta": "See offer",
        "feat.1.title": "100% Secure Payment",
        "feat.1.desc": "International transactions protected by the strictest security standards.",
        "feat.2.title": "24/7 Local & International Support",
        "feat.2.desc": "A dedicated team on site in Madagascar supports you before, during, and after your trip.",
        "feat.3.title": "Custom Tours",
        "feat.3.desc": "Local experts design authentic itineraries tailored to your desires for escape.",
        "footer.rights": "All rights reserved."
    },
    es: {
        "nav.home": "Inicio",
        "nav.destinations": "Destinos",
        "nav.circuits": "Circuitos",
        "nav.experiences": "Experiencias",
        "nav.contact": "Contacto",
        "nav.why": "¿Por qué nosotros?",
        "nav.login": "Iniciar sesión",
        "nav.register": "Registrarse",
        "nav.dashboard": "Mi panel",
        "nav.logout": "Cerrar sesión",
        "hero.title": "Explora Madagascar con TravelMS",
        "hero.subtitle": "Descubre destinos inolvidables, circuitos únicos y alojamientos de prestigio en el corazón de la Gran Isla.",
        "hero.placeholder": "¿Qué región te gustaría explorar?",
        "hero.search": "Buscar",
        "destinations.title": "DESTINOS POPULARES",
        "exp.title": "VIVE EXPERIENCIAS ÚNICAS",
        "reviews.title": "LO QUE DICEN NUESTROS CLIENTES",
        "newsletter.title": "MANTENTE INFORMADO DE NUESTRAS OFERTAS",
        "circuits.title": "Nuestros circuitos destacados en Madagascar",
        "circuits.subtitle": "Las experiencias más populares elegidas por viajeros de todo el mundo.",
        "circuit.nosybe.duration": "⏳ 8 días / 7 noches",
        "circuit.nosybe.title": "Nosy Be e Islas Vecinas",
        "circuit.nosybe.price": "Desde 850 €",
        "circuit.nosybe.desc": "Aguas turquesas, arrecifes de coral y relajación tropical absoluta.",
        "circuit.baobabs.duration": "⏳ 6 días / 5 noches",
        "circuit.baobabs.title": "La Avenida de los Baobabs",
        "circuit.baobabs.price": "Desde 690 €",
        "circuit.baobabs.desc": "Puestas de sol míticas en el corazón de los gigantes del oeste malgache.",
        "circuit.tsingy.duration": "⏳ 10 días / 9 noches",
        "circuit.tsingy.title": "Expedición Tsingy de Bemaraha",
        "circuit.tsingy.price": "Desde 920 €",
        "circuit.tsingy.desc": "Laberintos de piedra únicos en el mundo y cañones espectaculares.",
        "circuit.cta": "Descubrir el circuito →",
        "card.from": "Desde",
        "card.cta": "Ver oferta",
        "feat.1.title": "Pago 100% seguro",
        "feat.1.desc": "Transacciones internacionales protegidas por los estándares de seguridad más estrictos.",
        "feat.2.title": "Soporte local e internacional 24/7",
        "feat.2.desc": "Un equipo dedicado in situ en Madagascar te acompaña antes, durante y después de tu viaje.",
        "feat.3.title": "Circuitos a medida",
        "feat.3.desc": "Expertos locales diseñan itinerarios auténticos adaptados a tus deseos de evasión.",
        "footer.rights": "Todos los derechos reservados."
    },
    ru: {
        "nav.home": "Главная",
        "nav.destinations": "Направления",
        "nav.circuits": "Туры",
        "nav.experiences": "Впечатления",
        "nav.contact": "Контакты",
        "nav.why": "Почему мы?",
        "nav.login": "Войти",
        "nav.register": "Регистрация",
        "nav.dashboard": "Мой кабинет",
        "nav.logout": "Выйти",
        "hero.title": "Исследуйте Мадагаскар с TravelMS",
        "hero.subtitle": "Откройте для себя незабываемые места, уникальные туры и престижные отели в самом сердце Великого острова.",
        "hero.placeholder": "Какой регион вы хотите исследовать?",
        "hero.search": "Поиск",
        "destinations.title": "ПОПУЛЯРНЫЕ НАПРАВЛЕНИЯ",
        "exp.title": "УНИКАЛЬНЫЕ ВПЕЧАТЛЕНИЯ",
        "reviews.title": "ОТЗЫВЫ НАШИХ КЛИЕНТОВ",
        "newsletter.title": "БУДЬТЕ В КУРСЕ НАШИХ ПРЕДЛОЖЕНИЙ",
        "circuits.title": "Наши лучшие туры на Мадагаскар",
        "circuits.subtitle": "Самые популярные направления по версии путешественников со всего мира.",
        "circuit.nosybe.duration": "⏳ 8 дней / 7 ночей",
        "circuit.nosybe.title": "Нуси-Бе и соседние острова",
        "circuit.nosybe.price": "От 850 €",
        "circuit.nosybe.desc": "Бирюзовые воды, коралловые рифы и абсолютный тропический релакс.",
        "circuit.baobabs.duration": "⏳ 6 дней / 5 ночей",
        "circuit.baobabs.title": "Аллее баобабов",
        "circuit.baobabs.price": "От 690 €",
        "circuit.baobabs.desc": "Мифические закаты в сердце малагасийских западных гигантов.",
        "circuit.tsingy.duration": "⏳ 10 дней / 9 ночей",
        "circuit.tsingy.title": "Экспедиция в Цинжи-де-Бемараха",
        "circuit.tsingy.price": "От 920 €",
        "circuit.tsingy.desc": "Уникальные каменные лабиринты и захватывающие каньоны.",
        "circuit.cta": "Узнать тур →",
        "card.from": "От",
        "card.cta": "Смотреть",
        "feat.1.title": "100% безопасная оплата",
        "feat.1.desc": "Международные транзакции защищены строжайшими стандартами безопасности.",
        "feat.2.title": "Местная и международная поддержка 24/7",
        "feat.2.desc": "Специальная команда на месте на Мадагаскаре сопровождает вас до, во время и после поездки.",
        "feat.3.title": "Индивидуальные туры",
        "feat.3.desc": "Местные эксперты разрабатывают аутентичные маршруты под ваши пожелания.",
        "footer.rights": "Все права защищены."
    },
    it: {
        "nav.home": "Home",
        "nav.destinations": "Destinazioni",
        "nav.circuits": "Tour",
        "nav.experiences": "Esperienze",
        "nav.contact": "Contatti",
        "nav.why": "Perché noi?",
        "nav.login": "Accedi",
        "nav.register": "Registrati",
        "nav.dashboard": "La mia dashboard",
        "nav.logout": "Esci",
        "hero.title": "Esplora il Madagascar con TravelMS",
        "hero.subtitle": "Scopri destinazioni indimenticabili, tour unici e alloggi di prestigio nel cuore della Grande Isola.",
        "hero.placeholder": "Quale regione desideri esplorare?",
        "hero.search": "Cerca",
        "destinations.title": "DESTINAZIONI POPOLARI",
        "exp.title": "VIVI ESPERIENZE UNICHE",
        "reviews.title": "COSA DICONO I NOSTRI CLIENTI",
        "newsletter.title": "RESTA INFORMATO SULLE NOSTRE OFFERTE",
        "circuits.title": "I nostri tour di punta in Madagascar",
        "circuits.subtitle": "Le esperienze più apprezzate dai nostri viaggiatori di tutto il mondo.",
        "circuit.nosybe.duration": "⏳ 8 giorni / 7 notti",
        "circuit.nosybe.title": "Nosy Be e Isole Vicine",
        "circuit.nosybe.price": "Da 850 €",
        "circuit.nosybe.desc": "Acque turchesi, barriere coralline e assoluto relax tropicale.",
        "circuit.baobabs.duration": "⏳ 6 giorni / 5 notti",
        "circuit.baobabs.title": "Il Viale dei Baobab",
        "circuit.baobabs.price": "Da 690 €",
        "circuit.baobabs.desc": "Tramonti mitici nel cuore dei giganti dell'Ovest malgascio.",
        "circuit.tsingy.duration": "⏳ 10 giorni / 9 notti",
        "circuit.tsingy.title": "Spedizione Tsingy de Bemaraha",
        "circuit.tsingy.price": "Da 920 €",
        "circuit.tsingy.desc": "Labirinti di pietra unici al mondo e canyon spettacolari.",
        "circuit.cta": "Scopri il tour →",
        "card.from": "Da",
        "card.cta": "Vedi offerta",
        "feat.1.title": "Pagamento 100% sicuro",
        "feat.1.desc": "Transazioni internazionali protette dai più rigorosi standard di sicurezza.",
        "feat.2.title": "Supporto locale e internazionale 24/7",
        "feat.2.desc": "Un team dedicato sul posto in Madagascar ti accompagna prima, durante e dopo il viaggio.",
        "feat.3.title": "Tour su misura",
        "feat.3.desc": "Esperti locali progettano itinerari autentici adatti ai tuoi desideri di evasione.",
        "footer.rights": "Tutti i diritti riservati."
    },
    zh: {
        "nav.home": "首页",
        "nav.destinations": "目的地",
        "nav.circuits": "线路",
        "nav.experiences": "体验",
        "nav.contact": "联系我们",
        "nav.why": "为什么选择我们",
        "nav.login": "登录",
        "nav.register": "注册",
        "nav.dashboard": "我的控制台",
        "nav.logout": "退出登录",
        "hero.title": "与 TravelMS 探索马达加斯加",
        "hero.subtitle": "在大岛中心发现令人难忘的目的地、独特行程和尊贵住宿体验。",
        "hero.placeholder": "您想探索哪个地区？",
        "hero.search": "搜索",
        "destinations.title": "热门目的地",
        "exp.title": "体验非凡时刻",
        "reviews.title": "客户评价",
        "newsletter.title": "获取最新的特别优惠",
        "circuits.title": "马达加斯加精选线路",
        "circuits.subtitle": "全球旅行者最青睐的精彩体验。",
        "circuit.nosybe.duration": "⏳ 8天7晚",
        "circuit.nosybe.title": "贝岛及周边群岛",
        "circuit.nosybe.price": "850欧元起",
        "circuit.nosybe.desc": "碧蓝的海水、珊瑚礁与极致的热带放松体验。",
        "circuit.baobabs.duration": "⏳ 6天5晚",
        "circuit.baobabs.title": "猴面包树大道",
        "circuit.baobabs.price": "690欧元起",
        "circuit.baobabs.desc": "马达加斯加西部巨树环绕中的传奇日落。",
        "circuit.tsingy.duration": "⏳ 10天9晚",
        "circuit.tsingy.title": "贝马拉哈石林探险",
        "circuit.tsingy.price": "920欧元起",
        "circuit.tsingy.desc": "世界独一无二的石林迷宫与壮丽的峡谷。",
        "circuit.cta": "了解行程 →",
        "card.from": "起价",
        "card.cta": "查看详情",
        "feat.1.title": "100% 安全支付",
        "feat.1.desc": "国际交易受最严格的安全标准保护。",
        "feat.2.title": "24/7 本地与国际支持",
        "feat.2.desc": "马达加斯加当地的专业团队在您的旅行前、中、后全程陪伴。",
        "feat.3.title": "私人定制路线",
        "feat.3.desc": "当地专家为您量身打造贴合心意的地道行程。",
        "footer.rights": "保留所有权利。"
    }
};

function setLanguage(lang) {
    localStorage.setItem('travelms_lang', lang);
    document.documentElement.setAttribute('lang', lang);

    // Traduction des textes normaux
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Traduction des placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });

    const select = document.getElementById('langSwitch');
    if (select) select.value = lang;
}

const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;
const savedLang = localStorage.getItem('travelms_lang') || 'fr';
setLanguage(savedLang);

const langSwitchEl = document.getElementById('langSwitch');
if (langSwitchEl) {
    langSwitchEl.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

// Gestion de la session utilisateur avec design adapté à la maquette
const storedUser = localStorage.getItem('travelms_user') || localStorage.getItem('user');
const token = localStorage.getItem('token');
const authNav = document.getElementById('authNav');

if (storedUser && token && authNav) {
    authNav.innerHTML = `
        <a href="dashboard.html" class="font-semibold text-slate-700 hover:text-brand-700 transition flex items-center space-x-1.5">
            <span>👤 <span data-i18n="nav.dashboard">Mon Tableau de bord</span></span>
        </a>
        <button id="logoutHomeBtn" class="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3.5 py-1.5 rounded-lg font-semibold transition text-xs" data-i18n="nav.logout">Déconnexion</button>
    `;
    
    setLanguage(savedLang);

    document.getElementById('logoutHomeBtn').addEventListener('click', async () => {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('travelms_user');
            localStorage.removeItem('user');
        }
        window.location.reload();
    });
}

// Chargement et affichage des destinations selon le design du template
loadDestinationCards();

async function loadDestinationCards() {
    const container = document.getElementById('destinationCards');
    if (!container) return;
    
    // Rendu en col-span-full pour s'adapter proprement à la grille de 4 colonnes
    container.innerHTML = `<div class="col-span-full text-center text-slate-500 py-8">Chargement des destinations...</div>`;

    try {
        const response = await fetch(`${API_BASE_URL}/destinations`);
        if (!response.ok) throw new Error('Impossible de charger les destinations.');
        const payload = await response.json();
        
        if (!Array.isArray(payload.destinations) || payload.destinations.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-slate-500 py-8">Aucune destination disponible pour le moment.</div>`;
            return;
        }

        // Structure HTML calquée sur les cartes de la maquette (Image, Titre, Prix en bas à gauche, Bouton émeraude à droite)
        container.innerHTML = payload.destinations.map(destination => {
            const shortDescription = destination.description ? destination.description.trim() : '';
            return `
                <article class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between overflow-hidden">
                    <div>
                        <div class="h-48 overflow-hidden relative">
                            <img src="${destination.image_url}" alt="${destination.title}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
                            ${destination.location ? `<div class="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md">${destination.location}</div>` : ''}
                        </div>
                        <div class="p-5">
                            <h3 class="font-bold text-lg text-slate-900 mb-1">${destination.title}</h3>
                            <p class="text-slate-500 text-xs leading-relaxed line-clamp-3">${shortDescription}</p>
                        </div>
                    </div>

                    <div class="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-50">
                        <div class="text-xs">
                            <span class="text-slate-400 block" data-i18n="card.from">À partir de</span>
                            <span class="text-slate-900 font-extrabold text-base">${Number(destination.price).toFixed(0)} €</span>
                        </div>
                        <a href="/destination-detail.html?id=${encodeURIComponent(destination.id)}" class="bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-brand-800 transition shadow-sm" data-i18n="card.cta">
                            Voir l'offre
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        // Appliquer la traduction sur les nouvelles cartes générées (ex: "card.from" / "card.cta")
        setLanguage(localStorage.getItem('travelms_lang') || 'fr');

    } catch (error) {
        container.innerHTML = `<div class="col-span-full text-center text-rose-600 py-8">Erreur de chargement des destinations.</div>`;
        console.error(error);
    }
}