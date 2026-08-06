    // CONFIGURATION CENTRALE DE L'API (proxy Nginx, même origine)
const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "verify.loading_title": "Vérification en cours",
            "verify.loading_subtitle": "Veuillez patienter pendant que nous validons votre adresse e-mail.",
            "verify.success_title": "E-mail vérifié !",
            "verify.success_subtitle": "Votre compte est désormais actif. Vous pouvez vous connecter à votre espace TravelMS.",
            "verify.already_title": "E-mail déjà vérifié",
            "verify.already_subtitle": "Votre adresse est déjà validée. Vous pouvez vous connecter directement à votre compte.",
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

        const iconContainer = document.getElementById('icon-container');
        const iconSvg = document.getElementById('icon-svg');
        const titleEl = document.getElementById('status-title');
        const messageEl = document.getElementById('status-message');
        const actionContainer = document.getElementById('action-container');
        const dictionary = translations[currentLang] || translations.fr;

        function showStatus(type, title, message) {
            const palette = {
                success: ['bg-brand-100', 'text-brand-600', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />'],
                info: ['bg-blue-100', 'text-blue-600', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />'],
                error: ['bg-rose-100', 'text-rose-600', '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />']
            }[type];
            iconContainer.className = `mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full ${palette[0]} ${palette[1]} shadow-inner transition-colors duration-500`;
            iconSvg.classList.remove('animate-spin');
            iconSvg.innerHTML = palette[2];
            titleEl.textContent = title;
            messageEl.textContent = message;
            const note = document.getElementById('security-note');
            note.textContent = type === 'info'
                ? 'Votre compte est déjà actif : aucune autre action n’est nécessaire.'
                : type === 'success'
                    ? 'Votre adresse e-mail est confirmée. Vous pouvez désormais accéder à votre compte.'
                    : 'Le lien doit être complet et valide. Demandez un nouvel e-mail si nécessaire.';
            actionContainer.classList.remove('hidden');
            requestAnimationFrame(() => actionContainer.classList.remove('opacity-0'));
        }

        if (!token) {
            showStatus('error', dictionary["verify.error_title"], dictionary["verify.error_subtitle"]);
            return;
        }

        try {
            // Utilisation de API_BASE_URL pour pointer correctement vers le backend (ex: port 3000)
            const response = await fetch(`${API_BASE_URL}/verify?token=${encodeURIComponent(token)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || 'Token invalid or expired');
            if (payload.status === 'already_verified') {
                showStatus('info', dictionary["verify.already_title"] || translations.fr["verify.already_title"], dictionary["verify.already_subtitle"] || translations.fr["verify.already_subtitle"]);
            } else {
                showStatus('success', dictionary["verify.success_title"], dictionary["verify.success_subtitle"]);
            }

        } catch (err) {
            showStatus('error', dictionary["verify.error_title"], dictionary["verify.error_subtitle"]);
        }
    });
