import { apiRequest } from '../api.js'; // Si vous utilisez un module API centralisé, sinon fetch direct

const translations = {
    fr: {
        "nav.home": "Accueil",
        "nav.destinations": "Destinations",
        "nav.circuits": "Circuits",
        "nav.login": "Connexion",
        "nav.register": "S'inscrire",
        "nav.logout": "Déconnexion",
        "login.title": "Connexion",
        "login.subtitle": "Accédez à votre espace voyageur TravelMS",
        "login.email": "Adresse email",
        "login.email_placeholder": "jean.dupont@exemple.com",
        "login.password": "Mot de passe",
        "login.password_placeholder": "••••••••",
        "login.forgot": "Mot de passe oublié ?",
        "login.submit": "Se connecter",
        "login.submitting": "Connexion en cours...",
        "login.no_account": "Pas encore de compte ?",
        "login.success_msg": "Connexion réussie ! Redirection...",
        "login.error_default": "Email ou mot de passe incorrect.",
        "login.verify_title": "Votre adresse e-mail n’est pas encore vérifiée.",
        "login.verify_subtitle": "Renvoyez un e-mail de confirmation, puis ouvrez le nouveau lien reçu.",
        "login.resend": "Renvoyer l’e-mail de vérification",
        "login.resending": "Envoi en cours...",
        "login.resend_sent": "Si ce compte n’est pas encore vérifié, un nouvel e-mail vient d’être envoyé.",
        "footer.rights": "Tous droits réservés."
    },
    en: {
        "nav.home": "Home",
        "nav.destinations": "Destinations",
        "nav.circuits": "Tours",
        "nav.login": "Sign In",
        "nav.register": "Register",
        "nav.logout": "Sign Out",
        "login.title": "Sign In",
        "login.subtitle": "Access your TravelMS traveler space",
        "login.email": "Email address",
        "login.email_placeholder": "john.doe@example.com",
        "login.password": "Password",
        "login.password_placeholder": "••••••••",
        "login.forgot": "Forgot password?",
        "login.submit": "Sign In",
        "login.submitting": "Signing in...",
        "login.no_account": "Don't have an account?",
        "login.success_msg": "Login successful! Redirecting...",
        "login.error_default": "Invalid email or password.",
        "footer.rights": "All rights reserved."
    },
    es: {
        "nav.home": "Inicio",
        "nav.destinations": "Destinos",
        "nav.circuits": "Circuitos",
        "nav.login": "Iniciar sesión",
        "nav.register": "Registrarse",
        "nav.logout": "Cerrar sesión",
        "login.title": "Iniciar sesión",
        "login.subtitle": "Accede tu espacio de viajero TravelMS",
        "login.email": "Correo electrónico",
        "login.email_placeholder": "juan.perez@ejemplo.com",
        "login.password": "Contraseña",
        "login.password_placeholder": "••••••••",
        "login.forgot": "¿Contraseña olvidada?",
        "login.submit": "Iniciar sesión",
        "login.submitting": "Iniciando sesión...",
        "login.no_account": "¿No tienes cuenta?",
        "login.success_msg": "¡Inicio de sesión exitoso! Redirigiendo...",
        "login.error_default": "Correo o contraseña incorrectos.",
        "footer.rights": "Todos los derechos reservados."
    },
    ru: {
        "nav.home": "Главная",
        "nav.destinations": "Направления",
        "nav.circuits": "Туры",
        "nav.login": "Войти",
        "nav.register": "Регистрация",
        "nav.logout": "Выйти",
        "login.title": "Вход",
        "login.subtitle": "Войдите в свой кабинет путешественника TravelMS",
        "login.email": "Электронная почта",
        "login.email_placeholder": "ivan@example.com",
        "login.password": "Пароль",
        "login.password_placeholder": "••••••••",
        "login.forgot": "Забыли пароль?",
        "login.submit": "Войти",
        "login.submitting": "Вход...",
        "login.no_account": "Еще нет аккаунта?",
        "login.success_msg": "Вход выполнен успешно! Перенаправление...",
        "login.error_default": "Неверный email или пароль.",
        "footer.rights": "Все права защищены."
    },
    it: {
        "nav.home": "Home",
        "nav.destinations": "Destinazioni",
        "nav.circuits": "Tour",
        "nav.login": "Accedi",
        "nav.register": "Registrati",
        "nav.logout": "Esci",
        "login.title": "Accedi",
        "login.subtitle": "Accedi alla tua area viaggiatore TravelMS",
        "login.email": "Indirizzo email",
        "login.email_placeholder": "mario.rossi@esempio.com",
        "login.password": "Password",
        "login.password_placeholder": "••••••••",
        "login.forgot": "Password dimenticata?",
        "login.submit": "Accedi",
        "login.submitting": "Accesso in corso...",
        "login.no_account": "Non hai un account?",
        "login.success_msg": "Accesso effettuato con successo! Reindirizzamento...",
        "login.error_default": "Email o password non validi.",
        "footer.rights": "Tutti i diritti riservati."
    },
    zh: {
        "nav.home": "首页",
        "nav.destinations": "目的地",
        "nav.circuits": "旅游线路",
        "nav.login": "登录",
        "nav.register": "注册",
        "nav.logout": "退出登录",
        "login.title": "登录",
        "login.subtitle": "访问您的 TravelMS 旅行者空间",
        "login.email": "电子邮箱",
        "login.email_placeholder": "zhangsan@example.com",
        "login.password": "密码",
        "login.password_placeholder": "••••••••",
        "login.forgot": "忘记密码？",
        "login.submit": "登录",
        "login.submitting": "正在登录...",
        "login.no_account": "还没有账号？",
        "login.success_msg": "登录成功！正在重定向...",
        "login.error_default": "邮箱或密码错误。",
        "footer.rights": "保留所有权利。"
    }
};

// Nettoyage de l'ancien token sur la page de connexion
localStorage.removeItem('token');

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

const langSwitch = document.getElementById('langSwitch');
if (langSwitch) {
    langSwitch.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

// 1. Gestion de l'Œil magique (Affichage/Masquage du mot de passe)
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            togglePassword.innerHTML = `
                <svg class="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.027 10.027 0 01-4.132 5.411m0 0L21 21" />
                </svg>`;
        } else {
            togglePassword.innerHTML = `
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>`;
        }
    });
}

// 2. Fonction Toast pour les notifications élégantes
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

// 3. Soumission du formulaire de connexion
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submit-btn');
        const verificationHelp = document.getElementById('verification-help');

        if (!emailInput || !passwordInput || !submitBtn) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';

        submitBtn.textContent = translations[currentLang]["login.submitting"];
        submitBtn.disabled = true;
        if (verificationHelp) {
            verificationHelp.classList.add('hidden');
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            let data = {};
            try {
                data = await response.json();
            } catch (parseError) {
                data = {};
            }

            if (!response.ok) {
                if (response.status === 403 && verificationHelp) {
                    verificationHelp.classList.remove('hidden');
                }
                throw new Error(data.error || data.message || translations[currentLang]["login.error_default"]);
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            const userData = data.user || { name: email.split('@')[0], email };
            localStorage.setItem('travelms_user', JSON.stringify(userData));
            localStorage.setItem('user', JSON.stringify(userData));

            showToast(translations[currentLang]["login.success_msg"], "success");

            setTimeout(() => {
                window.location.assign('/dashboard.html');
            }, 1200);

        } catch (err) {
            showToast(err.message || translations[currentLang]["login.error_default"], "error");
            submitBtn.textContent = translations[currentLang]["login.submit"];
            submitBtn.disabled = false;
        }
    });
}

// 4. Gestion du renvoi de l'e-mail de vérification
const resendVerificationBtn = document.getElementById('resend-verification-btn');
if (resendVerificationBtn) {
    resendVerificationBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';
        
        if (!email) {
            document.getElementById('email').focus();
            showToast('Saisissez votre adresse e-mail pour recevoir un nouveau lien.', 'error');
            return;
        }

        resendVerificationBtn.disabled = true;
        resendVerificationBtn.textContent = translations[currentLang]['login.resending'] || translations.fr['login.resending'];
        
        try {
            const response = await fetch('/api/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) throw new Error(data.error || translations[currentLang]['login.error_default']);
            
            showToast(data.message || translations[currentLang]['login.resend_sent'] || translations.fr['login.resend_sent'], 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            resendVerificationBtn.disabled = false;
            resendVerificationBtn.textContent = translations[currentLang]['login.resend'] || translations.fr['login.resend'];
        }
    });
}
