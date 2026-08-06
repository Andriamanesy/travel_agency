    // CONFIGURATION CENTRALE DE L'API (proxy Nginx, même origine)
const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "verify.loading_title": "Vérification en cours",
            "verify.loading_subtitle": "Veuillez patienter pendant que nous validons votre adresse e-mail.",
            "verify.success_title": "E-mail vérifié !",
            "verify.success_subtitle": "Votre compte est désormais actif. Vous pouvez vous connecter à votre espace TravelMS.",
            "verify.error_title": "Échec de la vérification",
            "verify.error_subtitle": "Le lien de vérification est invalide ou a expiré.",
            "verify.login_btn": "Se connecter",
            "footer.rights": "Tous droits réservés."
        },
        en: {
            "verify.loading_title": "Verification in progress",
            "verify.loading_subtitle": "Please wait while we validate your email address.",
            "verify.success_title": "Email Verified!",
            "verify.success_subtitle": "Your account is now active. You can sign in to your TravelMS space.",
            "verify.error_title": "Verification Failed",
            "verify.error_subtitle": "The verification link is invalid or has expired.",
            "verify.login_btn": "Sign In",
            "footer.rights": "All rights reserved."
        },
        es: {
            "verify.loading_title": "Verificación en curso",
            "verify.loading_subtitle": "Por favor espere mientras validamos su correo electrónico.",
            "verify.success_title": "¡Correo verificado!",
            "verify.success_subtitle": "Su cuenta ya está activa. Puede iniciar sesión en su espacio TravelMS.",
            "verify.error_title": "Error de verificación",
            "verify.error_subtitle": "El enlace de verificación no es válido o ha caducado.",
            "verify.login_btn": "Iniciar sesión",
            "footer.rights": "Todos los derechos reservados."
        },
        ru: {
            "verify.loading_title": "Идет проверка",
            "verify.loading_subtitle": "Пожалуйста, подождите, пока мы подтвердим ваш адрес электронной почты.",
            "verify.success_title": "Эл. почта подтверждена!",
            "verify.success_subtitle": "Ваша учетная запись активна. Теперь вы можете войти в систему TravelMS.",
            "verify.error_title": "Ошибка проверки",
            "verify.error_subtitle": "Ссылка для подтверждения недействительна или истекла.",
            "verify.login_btn": "Войти",
            "footer.rights": "Все права защищены."
        },
        it: {
            "verify.loading_title": "Verifica in corso",
            "verify.loading_subtitle": "Attendere prego mentre verifichiamo il vostro indirizzo email.",
            "verify.success_title": "Email verificata!",
            "verify.success_subtitle": "Il tuo account è ora attivo. Puoi accedere alla tua area TravelMS.",
            "verify.error_title": "Verifica fallita",
            "verify.error_subtitle": "Il link di verifica non è valido o è scaduto.",
            "verify.login_btn": "Accedi",
            "footer.rights": "Tutti i diritti riservati."
        },
        zh: {
            "verify.loading_title": "正在验证",
            "verify.loading_subtitle": "请稍候，我们正在验证您的电子邮件地址。",
            "verify.success_title": "邮箱验证成功！",
            "verify.success_subtitle": "您的账户现已激活。您可以登录您的 TravelMS 空间。",
            "verify.error_title": "验证失败",
            "verify.error_subtitle": "验证链接无效或已过期。",
            "verify.login_btn": "登录",
            "footer.rights": "保留所有权利。"
        }
    };

    function setLanguage(lang) {
        localStorage.setItem('travelms_lang', lang);
        document.documentElement.setAttribute('lang', lang);

        // Met à jour les éléments statiques avec data-i18n s'il y en a
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
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

    // Logique d'appel API de vérification au chargement
    window.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';

        const iconEl = document.getElementById('status-icon');
        const titleEl = document.getElementById('status-title');
        const messageEl = document.getElementById('status-message');
        const actionContainer = document.getElementById('action-container');

        if (!token) {
            iconEl.className = "w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6";
            iconEl.textContent = "❌";
            titleEl.textContent = translations[currentLang]["verify.error_title"];
            messageEl.textContent = translations[currentLang]["verify.error_subtitle"];
            actionContainer.classList.remove('hidden');
            return;
        }

        try {
            // Utilisation de API_BASE_URL pour pointer correctement vers le backend (ex: port 3000)
            const response = await fetch(`${API_BASE_URL}/verify?token=${encodeURIComponent(token)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error("Token invalid or expired");
            }

            // Succès de la vérification
            iconEl.className = "w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6";
            iconEl.textContent = "✅";
            titleEl.textContent = translations[currentLang]["verify.success_title"];
            messageEl.textContent = translations[currentLang]["verify.success_subtitle"];
            actionContainer.classList.remove('hidden');

        } catch (err) {
            // Erreur de vérification
            iconEl.className = "w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6";
            iconEl.textContent = "❌";
            titleEl.textContent = translations[currentLang]["verify.error_title"];
            messageEl.textContent = translations[currentLang]["verify.error_subtitle"];
            actionContainer.classList.remove('hidden');
        }
    });
