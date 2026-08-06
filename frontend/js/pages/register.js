    // Configuration centrale de l'API (normalisée sur /api)
    const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "nav.home": "Accueil",
            "nav.destinations": "Destinations",
            "nav.circuits": "Circuits",
            "nav.login": "Connexion",
            "nav.register": "Inscription",
            "register.title": "Créer un compte",
            "register.subtitle": "Commencez votre voyage avec TravelMS",
            "register.name_label": "Nom complet",
            "register.name_placeholder": "Jean Dupont",
            "register.email_label": "Adresse email",
            "register.email_placeholder": "jean.dupont@exemple.com",
            "register.password_label": "Mot de passe",
            "register.confirm_password_label": "Confirmer le mot de passe",
            "register.password_placeholder": "••••••••",
            "register.terms_prefix": "J'accepte les",
            "register.terms_link": "conditions générales d'utilisation",
            "register.terms_suffix": "et la politique de confidentialité.",
            "register.submit": "Créer mon compte et voyager",
            "register.submitting": "Création en cours...",
            "register.security": "🔒 Vos données sont protégées et sécurisées.",
            "register.has_account": "Déjà un compte ?",
            "register.success_msg": "Compte créé avec succès ! Redirection...",
            "register.password_mismatch": "Les mots de passe ne correspondent pas.",
            "register.error_default": "Une erreur est survenue lors de l'inscription.",
            "modal.title": "Conditions Générales d'Utilisation",
            "modal.p1": "Bienvenue sur TravelMS. En créant un compte sur notre plateforme, vous acceptez de respecter les règles et conditions d'utilisation énoncées ci-dessous.",
            "modal.h1": "1. Utilisation du service",
            "modal.p2": "TravelMS s'engage à vous fournir une plateforme sécurisée pour la gestion de vos réservations et voyages à Madagascar. Vos données personnelles sont traitées conformément aux normes de sécurité en vigueur.",
            "modal.h2": "2. Compte utilisateur",
            "modal.p3": "Vous êtes responsable du maintien de la confidentialité de votre mot de passe et de votre compte. Toute action effectuée depuis votre session est réputée de votre fait.",
            "modal.h3": "3. Protection des données",
            "modal.p4": "Les informations collectées lors de votre inscription (Nom, Email) sont strictement utilisées pour le bon fonctionnement du service et ne sont jamais partagées à des tiers non autorisés.",
            "modal.btn": "J'ai compris et j'accepte",
            "footer.rights": "Tous droits réservés."
        },
        en: {
            "nav.home": "Home",
            "nav.destinations": "Destinations",
            "nav.circuits": "Tours",
            "nav.login": "Sign In",
            "nav.register": "Register",
            "register.title": "Create an account",
            "register.subtitle": "Start your journey with TravelMS",
            "register.name_label": "Full name",
            "register.name_placeholder": "John Doe",
            "register.email_label": "Email address",
            "register.email_placeholder": "john.doe@example.com",
            "register.password_label": "Password",
            "register.confirm_password_label": "Confirm password",
            "register.password_placeholder": "••••••••",
            "register.terms_prefix": "I accept the",
            "register.terms_link": "terms of service",
            "register.terms_suffix": "and the privacy policy.",
            "register.submit": "Create my account & travel",
            "register.submitting": "Creating account...",
            "register.security": "🔒 Your data is protected and secure.",
            "register.has_account": "Already have an account?",
            "register.success_msg": "Account created successfully! Redirecting...",
            "register.password_mismatch": "Passwords do not match.",
            "register.error_default": "An error occurred during registration.",
            "modal.title": "Terms of Service",
            "modal.p1": "Welcome to TravelMS. By creating an account, you agree to comply with the terms and conditions outlined below.",
            "modal.h1": "1. Use of Service",
            "modal.p2": "TravelMS provides a secure platform for managing your travel bookings in Madagascar.",
            "modal.h2": "2. User Account",
            "modal.p3": "You are responsible for maintaining the confidentiality of your account password.",
            "modal.h3": "3. Data Protection",
            "modal.p4": "Collected information is used exclusively for platform functionality.",
            "modal.btn": "I understand and accept",
            "footer.rights": "All rights reserved."
        },
        es: {
            "nav.home": "Inicio",
            "nav.destinations": "Destinos",
            "nav.circuits": "Circuitos",
            "nav.login": "Iniciar sesión",
            "nav.register": "Registrarse",
            "register.title": "Crear una cuenta",
            "register.subtitle": "Empieza tu viaje con TravelMS",
            "register.name_label": "Nombre completo",
            "register.name_placeholder": "Juan Pérez",
            "register.email_label": "Correo electrónico",
            "register.email_placeholder": "juan.perez@ejemplo.com",
            "register.password_label": "Contraseña",
            "register.confirm_password_label": "Confirmar contraseña",
            "register.password_placeholder": "••••••••",
            "register.terms_prefix": "Acepto los",
            "register.terms_link": "términos de servicio",
            "register.terms_suffix": "y la política de privacidad.",
            "register.submit": "Crear mi cuenta y viajar",
            "register.submitting": "Creando cuenta...",
            "register.security": "🔒 Tus datos están protegidos y seguros.",
            "register.has_account": "¿Ya tienes una cuenta?",
            "register.success_msg": "¡Cuenta creada con éxito! Redirigiendo...",
            "register.password_mismatch": "Las contraseñas no coinciden.",
            "register.error_default": "Ocurrió un error durante el registro.",
            "modal.title": "Términos de Servicio",
            "modal.p1": "Bienvenido a TravelMS.",
            "modal.h1": "1. Uso del servicio",
            "modal.p2": "TravelMS ofrece una plataforma segura.",
            "modal.h2": "2. Cuenta de usuario",
            "modal.p3": "Eres responsable de tu contraseña.",
            "modal.h3": "3. Protección de datos",
            "modal.p4": "Los datos se utilizan exclusivamente.",
            "modal.btn": "Entendido y acepto",
            "footer.rights": "Todos los derechos reservados."
        },
        ru: {
            "nav.home": "Главная",
            "nav.destinations": "Направления",
            "nav.circuits": "Туры",
            "nav.login": "Войти",
            "nav.register": "Регистрация",
            "register.title": "Создать аккаунт",
            "register.subtitle": "Начните свое путешествие с TravelMS",
            "register.name_label": "Полное имя",
            "register.name_placeholder": "Иван Иванов",
            "register.email_label": "Электронная почта",
            "register.email_placeholder": "ivan@example.com",
            "register.password_label": "Пароль",
            "register.confirm_password_label": "Подтвердите пароль",
            "register.password_placeholder": "••••••••",
            "register.terms_prefix": "Я принимаю",
            "register.terms_link": "условия обслуживания",
            "register.terms_suffix": "и политику конфиденциальности.",
            "register.submit": "Создать аккаунт и путешествовать",
            "register.submitting": "Создание аккаунта...",
            "register.security": "🔒 Ваши данные защищены и в безопасности.",
            "register.has_account": "Уже есть аккаунт?",
            "register.success_msg": "Аккаунт успешно создан! Перенаправление...",
            "register.password_mismatch": "Пароли не совпадают.",
            "register.error_default": "Произошла ошибка при регистрации.",
            "modal.title": "Условия обслуживания",
            "modal.p1": "Добро пожаловать в TravelMS.",
            "modal.h1": "1. Использование сервиса",
            "modal.p2": "TravelMS предоставляет безопасную платформу.",
            "modal.h2": "2. Аккаунт пользователя",
            "modal.p3": "Вы несете ответственность за безопасность пароля.",
            "modal.h3": "3. Защита данных",
            "modal.p4": "Информация используется строго по назначению.",
            "modal.btn": "Я понял и принимаю",
            "footer.rights": "Все права защищены."
        },
        it: {
            "nav.home": "Home",
            "nav.destinations": "Destinazioni",
            "nav.circuits": "Tour",
            "nav.login": "Accedi",
            "nav.register": "Registrati",
            "register.title": "Crea un account",
            "register.subtitle": "Inizia il tuo viaggio con TravelMS",
            "register.name_label": "Nome completo",
            "register.name_placeholder": "Mario Rossi",
            "register.email_label": "Indirizzo email",
            "register.email_placeholder": "mario.rossi@esempio.com",
            "register.password_label": "Password",
            "register.confirm_password_label": "Conferma password",
            "register.password_placeholder": "••••••••",
            "register.terms_prefix": "Accetto i",
            "register.terms_link": "termini di servizio",
            "register.terms_suffix": "e l'informativa sulla privacy.",
            "register.submit": "Crea il mio account e viaggia",
            "register.submitting": "Creazione in corso...",
            "register.security": "🔒 I tuoi dati sono protetti e sicuri.",
            "register.has_account": "Hai già un account?",
            "register.success_msg": "Account creato con successo! Reindirizzamento...",
            "register.password_mismatch": "Le password non coincidono.",
            "register.error_default": "Si è verificato un errore durante la registrazione.",
            "modal.title": "Termini di Servizio",
            "modal.p1": "Benvenuto su TravelMS.",
            "modal.h1": "1. Uso del servizio",
            "modal.p2": "TravelMS offre una piattaforma sicura.",
            "modal.h2": "2. Account utente",
            "modal.p3": "Sei responsabile della tua password.",
            "modal.h3": "3. Protezione dei dati",
            "modal.p4": "I dati sono utilizzati esclusivamente.",
            "modal.btn": "Ho capito e accetto",
            "footer.rights": "Tutti i diritti riservati."
        },
        zh: {
            "nav.home": "首页",
            "nav.destinations": "目的地",
            "nav.circuits": "旅游线路",
            "nav.login": "登录",
            "nav.register": "注册",
            "register.title": "创建账号",
            "register.subtitle": "开启您的 TravelMS 之旅",
            "register.name_label": "全名",
            "register.name_placeholder": "张三",
            "register.email_label": "电子邮箱",
            "register.email_placeholder": "zhangsan@example.com",
            "register.password_label": "密码",
            "register.confirm_password_label": "确认密码",
            "register.password_placeholder": "••••••••",
            "register.terms_prefix": "我接受",
            "register.terms_link": "服务条款",
            "register.terms_suffix": "与隐私政策。",
            "register.submit": "创建账号并旅行",
            "register.submitting": "正在创建...",
            "register.security": "🔒 您的数据受到保护和安全保障。",
            "register.has_account": "已有账号？",
            "register.success_msg": "账号创建成功！正在重定向...",
            "register.password_mismatch": "两次输入的密码不一致。",
            "register.error_default": "注册过程中发生错误。",
            "modal.title": "服务条款",
            "modal.p1": "欢迎来到 TravelMS。",
            "modal.h1": "1. 服务使用",
            "modal.p2": "TravelMS 为您的旅行提供安全平台。",
            "modal.h2": "2. 用户账号",
            "modal.p3": "您有责任保护您的账号密码安全。",
            "modal.h3": "3. 数据保护",
            "modal.p4": "收集的信息仅用于平台功能。",
            "modal.btn": "我已了解并接受",
            "footer.rights": "保留所有权利。"
        }
    };

    function setLanguage(lang) {
        localStorage.setItem('travelms_lang', lang);
        document.documentElement.setAttribute('lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

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

    // Gestion de la modale des CGU
    const termsModal = document.getElementById('termsModal');
    const openTermsModal = document.getElementById('openTermsModal');
    const closeTermsModal = document.getElementById('closeTermsModal');
    const acceptTermsBtn = document.getElementById('acceptTermsBtn');
    const termsCheckbox = document.getElementById('terms');

    openTermsModal.addEventListener('click', () => {
        termsModal.classList.remove('hidden');
    });

    closeTermsModal.addEventListener('click', () => {
        termsModal.classList.add('hidden');
    });

    acceptTermsBtn.addEventListener('click', () => {
        termsCheckbox.checked = true; // Coche automatiquement la case quand l'utilisateur valide la lecture
        termsModal.classList.add('hidden');
    });

    // Fermer la modale en cliquant en dehors
    termsModal.addEventListener('click', (e) => {
        if (e.target === termsModal) {
            termsModal.classList.add('hidden');
        }
    });

    // 1. Gestion de l'Œil magique
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            togglePassword.innerHTML = `
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.027 10.027 0 01-4.132 5.411m0 0L21 21" />
                </svg>`;
        } else {
            togglePassword.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>`;
        }
    });

    // 2. Fonction Toast pour les notifications
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-5 right-5 z-50 flex flex-col space-y-3';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        const bgClass = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
        
        toast.className = `${bgClass} text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 transition-all transform translate-y-2 opacity-0 duration-300 font-medium text-sm`;
        
        const icon = type === 'success' ? '✅' : '⚠️';
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);
        
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // 3. Soumission du formulaire d'inscription
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsChecked = termsCheckbox.checked;
        const submitBtn = document.getElementById('submit-btn');

        const currentLang = localStorage.getItem('travelms_lang') || 'fr';

        // Double vérification de sécurité (mot de passe + conditions cochées)
        if (password !== confirmPassword) {
            showToast(translations[currentLang]["register.password_mismatch"] || "Les mots de passe ne correspondent pas.", "error");
            return;
        }

        if (!termsChecked) {
            showToast("Veuillez accepter les conditions générales d'utilisation.", "error");
            return;
        }

        submitBtn.textContent = translations[currentLang]["register.submitting"];
        submitBtn.disabled = true;

        try {
            // Utilisation de API_BASE_URL pour pointer correctement vers le backend (ex: port 3000)
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || translations[currentLang]["register.error_default"]);
            }

            showToast(translations[currentLang]["register.success_msg"], "success");

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1200);

        } catch (err) {
            showToast(err.message, "error");
            submitBtn.textContent = translations[currentLang]["register.submit"];
            submitBtn.disabled = false;
        }
    });
