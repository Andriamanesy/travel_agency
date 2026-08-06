    // CONFIGURATION CENTRALE DE L'API (proxy Nginx, même origine)
const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "nav.home": "Accueil",
            "nav.destinations": "Destinations",
            "nav.circuits": "Circuits",
            "nav.login": "Connexion",
            "nav.register": "Inscription",
            "forgot.title": "Mot de passe oublié ?",
            "forgot.subtitle": "Entrez votre email pour recevoir les instructions de réinitialisation.",
            "forgot.email_label": "Adresse email",
            "forgot.email_placeholder": "jean.dupont@exemple.com",
            "forgot.submit": "Envoyer le lien",
            "forgot.sending": "Envoi en cours...",
            "forgot.sent": "Lien envoyé",
            "forgot.back": "Retour à la connexion",
            "forgot.success_default": "Instructions envoyées par email !",
            "forgot.error_default": "Une erreur est survenue.",
            "footer.rights": "Tous droits réservés."
        },
        en: {
            "nav.home": "Home",
            "nav.destinations": "Destinations",
            "nav.circuits": "Tours",
            "nav.login": "Sign In",
            "nav.register": "Register",
            "forgot.title": "Forgot Password?",
            "forgot.subtitle": "Enter your email to receive reset instructions.",
            "forgot.email_label": "Email address",
            "forgot.email_placeholder": "john.doe@example.com",
            "forgot.submit": "Send reset link",
            "forgot.sending": "Sending...",
            "forgot.sent": "Link sent",
            "forgot.back": "Back to sign in",
            "forgot.success_default": "Instructions sent by email!",
            "forgot.error_default": "An error occurred.",
            "footer.rights": "All rights reserved."
        },
        es: {
            "nav.home": "Inicio",
            "nav.destinations": "Destinos",
            "nav.circuits": "Circuitos",
            "nav.login": "Iniciar sesión",
            "nav.register": "Registrarse",
            "forgot.title": "¿Contraseña olvidada?",
            "forgot.subtitle": "Introduce tu correo electrónico para recibir las instrucciones de restablecimiento.",
            "forgot.email_label": "Correo electrónico",
            "forgot.email_placeholder": "juan.perez@ejemplo.com",
            "forgot.submit": "Enviar enlace",
            "forgot.sending": "Enviando...",
            "forgot.sent": "Enlace enviado",
            "forgot.back": "Volver al inicio de sesión",
            "forgot.success_default": "¡Instrucciones enviadas por correo electrónico!",
            "forgot.error_default": "Ocurrió un error.",
            "footer.rights": "Todos los derechos reservados."
        },
        ru: {
            "nav.home": "Главная",
            "nav.destinations": "Направления",
            "nav.circuits": "Туры",
            "nav.login": "Войти",
            "nav.register": "Регистрация",
            "forgot.title": "Забыли пароль?",
            "forgot.subtitle": "Введите ваш email для получения инструкций по сбросу.",
            "forgot.email_label": "Электронная почта",
            "forgot.email_placeholder": "ivan@example.com",
            "forgot.submit": "Отправить ссылку",
            "forgot.sending": "Отправка...",
            "forgot.sent": "Ссылка отправлена",
            "forgot.back": "Вернуться ко входу",
            "forgot.success_default": "Инструкции отправлены на email!",
            "forgot.error_default": "Произошла ошибка.",
            "footer.rights": "Все права защищены."
        },
        it: {
            "nav.home": "Home",
            "nav.destinations": "Destinazioni",
            "nav.circuits": "Tour",
            "nav.login": "Accedi",
            "nav.register": "Registrati",
            "forgot.title": "Password dimenticata?",
            "forgot.subtitle": "Inserisci la tua email per ricevere le istruzioni di reset.",
            "forgot.email_label": "Indirizzo email",
            "forgot.email_placeholder": "mario.rossi@esempio.com",
            "forgot.submit": "Invia link",
            "forgot.sending": "Invio in corso...",
            "forgot.sent": "Link inviato",
            "forgot.back": "Torna al login",
            "forgot.success_default": "Istruzioni inviate via email!",
            "forgot.error_default": "Si è verificato un errore.",
            "footer.rights": "Tutti i diritti riservati."
        },
        zh: {
            "nav.home": "首页",
            "nav.destinations": "目的地",
            "nav.circuits": "旅游线路",
            "nav.login": "登录",
            "nav.register": "注册",
            "forgot.title": "忘记密码？",
            "forgot.subtitle": "输入您的电子邮箱以接收重置说明。",
            "forgot.email_label": "电子邮箱",
            "forgot.email_placeholder": "zhangsan@example.com",
            "forgot.submit": "发送重置链接",
            "forgot.sending": "正在发送...",
            "forgot.sent": "链接已发送",
            "forgot.back": "返回登录",
            "forgot.success_default": "说明已通过邮件发送！",
            "forgot.error_default": "发生错误。",
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

    // Fonction Toast pour les notifications élégantes
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

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const submitBtn = document.getElementById('submit-btn');
        const buttonText = document.getElementById('btn-text');
        const spinner = document.getElementById('btn-spinner');
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';

        const errorAlert = document.getElementById('error-alert');
        const errorMessage = document.getElementById('error-message');
        errorAlert.classList.add('hidden');

        if (!email || !document.getElementById('email').validity.valid) {
            errorMessage.textContent = 'Saisissez une adresse e-mail valide.';
            errorAlert.classList.remove('hidden');
            return;
        }

        buttonText.textContent = translations[currentLang]["forgot.sending"];
        buttonText.classList.add('opacity-0');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // Utilisation de API_BASE_URL pour pointer correctement vers le backend (ex: port 3000)
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || translations[currentLang]["forgot.error_default"]);
            }

            showToast(data.message || translations[currentLang]["forgot.success_default"], "success");
            document.getElementById('success-email').textContent = email;
            document.getElementById('form-wrapper').classList.add('hidden');
            const success = document.getElementById('forgot-success');
            success.classList.remove('hidden');
            requestAnimationFrame(() => success.classList.remove('opacity-0'));

        } catch (err) {
            showToast(err.message, "error");
            errorMessage.textContent = err.message;
            errorAlert.classList.remove('hidden');
            buttonText.textContent = translations[currentLang]["forgot.submit"];
            buttonText.classList.remove('opacity-0');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
