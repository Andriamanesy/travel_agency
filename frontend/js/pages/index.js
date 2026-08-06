    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "nav.home": "Accueil",
            "nav.circuits": "Circuits à Madagascar",
            "nav.why": "Pourquoi nous ?",
            "nav.login": "Connexion",
            "nav.register": "S'inscrire",
            "nav.dashboard": "Mon Tableau de bord",
            "nav.logout": "Déconnexion",
            "hero.tag": "Vivez l'extraordinaire à Madagascar",
            "hero.title": "Découvrez les trésors cachés de la Grande Île",
            "hero.subtitle": "Partez l'esprit tranquille avec nos séjours sur-mesure, pensés pour vous faire vivre des aventures inoubliables entre terres sauvages et plages paradisiaques.",
            "hero.placeholder": "Quelle région souhaitez-vous explorer ?",
            "hero.search": "Rechercher",
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
            "nav.circuits": "Madagascar Tours",
            "nav.why": "Why us?",
            "nav.login": "Sign In",
            "nav.register": "Register",
            "nav.dashboard": "My Dashboard",
            "nav.logout": "Sign Out",
            "hero.tag": "Live the extraordinary in Madagascar",
            "hero.title": "Discover the hidden treasures of the Great Island",
            "hero.subtitle": "Travel with peace of mind with our custom stays, designed to give you unforgettable adventures between wild lands and paradise beaches.",
            "hero.placeholder": "Which region do you want to explore?",
            "hero.search": "Search",
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
            "nav.circuits": "Circuitos en Madagascar",
            "nav.why": "¿Por qué nosotros?",
            "nav.login": "Iniciar sesión",
            "nav.register": "Registrarse",
            "nav.dashboard": "Mi panel",
            "nav.logout": "Cerrar sesión",
            "hero.tag": "Vive lo extraordinario en Madagascar",
            "hero.title": "Descubre los tesoros ocultos de la Gran Isla",
            "hero.subtitle": "Viaja con tranquilidad con nuestras estancias a medida, diseñadas para brindarte aventuras inolvidables entre tierras salvajes y playas paradisíacas.",
            "hero.placeholder": "¿Qué región te gustaría explorar?",
            "hero.search": "Buscar",
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
            "nav.circuits": "Туры на Мадагаскар",
            "nav.why": "Почему мы?",
            "nav.login": "Войти",
            "nav.register": "Регистрация",
            "nav.dashboard": "Мой кабинет",
            "nav.logout": "Выйти",
            "hero.tag": "Испытайте невероятное на Мадагаскаре",
            "hero.title": "Откройте скрытые сокровища Великого острова",
            "hero.subtitle": "Путешествуйте со спокойной душой благодаря нашим индивидуальным турам, созданным для незабываемых приключений среди дикой природы и райских пляжей.",
            "hero.placeholder": "Какой регион вы хотите исследовать?",
            "hero.search": "Поиск",
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
            "nav.circuits": "Tour in Madagascar",
            "nav.why": "Perché noi?",
            "nav.login": "Accedi",
            "nav.register": "Registrati",
            "nav.dashboard": "La mia dashboard",
            "nav.logout": "Esci",
            "hero.tag": "Vivi lo straordinario in Madagascar",
            "hero.title": "Scopri i tesori nascosti della Grande Isola",
            "hero.subtitle": "Viaggia in totale tranquillità con i nostri soggiorni su misura, pensati per farti vivere avventure indimenticabili tra terre selvagge e spiagge paradisiache.",
            "hero.placeholder": "Quale regione desideri esplorare?",
            "hero.search": "Cerca",
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
            "nav.circuits": "马达加斯加旅游线路",
            "nav.why": "为什么选择我们",
            "nav.login": "登录",
            "nav.register": "注册",
            "nav.dashboard": "我的控制台",
            "nav.logout": "退出登录",
            "hero.tag": "体验马达加斯加的非凡魅力",
            "hero.title": "探索大岛隐藏的宝藏",
            "hero.subtitle": "通过我们为您量身定制的行程安心出行，在荒野与天堂般的海滩之间开启难忘的冒险。",
            "hero.placeholder": "您想探索哪个地区？",
            "hero.search": "搜索",
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

    const savedLang = localStorage.getItem('travelms_lang') || 'fr';
    setLanguage(savedLang);

    document.getElementById('langSwitch').addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    // Gestion de la session utilisateur avec compatibilité multi-langue
    const storedUser = localStorage.getItem('travelms_user') || localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const authNav = document.getElementById('authNav');

    if (storedUser && token) {
        authNav.innerHTML = `
            <a href="dashboard.html" class="font-medium text-slate-700 hover:text-blue-600 transition flex items-center space-x-2">
                <span>👤 <span data-i18n="nav.dashboard">Mon Tableau de bord</span></span>
            </a>
            <button id="logoutHomeBtn" class="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl font-medium transition text-sm" data-i18n="nav.logout">Déconnexion</button>
        `;
        // Appliquer les traductions sur le contenu injecté dynamiquement
        setLanguage(savedLang);

        document.getElementById('logoutHomeBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('travelms_user');
            localStorage.removeItem('user');
            window.location.reload();
        });
    }
