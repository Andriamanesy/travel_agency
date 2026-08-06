    // CONFIGURATION CENTRALE DE L'API (proxy Nginx, même origine)
const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "reset.title": "Nouveau mot de passe",
            "reset.subtitle": "Veuillez entrer votre nouveau mot de passe sécurisé.",
            "reset.password_label": "Nouveau mot de passe",
            "reset.password_placeholder": "••••••••",
            "reset.submit": "Mettre à jour le mot de passe",
            "reset.updating": "Mise à jour...",
            "reset.token_error": "Jeton de réinitialisation manquant ou invalide.",
            "reset.success_msg": "Mot de passe mis à jour avec succès !",
            "reset.success_title": "Mot de passe mis à jour",
            "reset.success_subtitle": "Votre mot de passe a été modifié avec succès. Connectez-vous avec vos nouveaux identifiants.",
            "reset.login_btn": "Se connecter",
            "reset.error_default": "Une erreur est survenue.",
            "footer.rights": "Tous droits réservés."
        },
        en: {
            "reset.title": "New Password",
            "reset.subtitle": "Please enter your new secure password.",
            "reset.password_label": "New password",
            "reset.password_placeholder": "••••••••",
            "reset.submit": "Update password",
            "reset.updating": "Updating...",
            "reset.token_error": "Missing or invalid reset token.",
            "reset.success_msg": "Password updated successfully!",
            "reset.success_title": "Password updated",
            "reset.success_subtitle": "Your password has been updated. Sign in with your new credentials.",
            "reset.login_btn": "Sign in",
            "reset.error_default": "An error occurred.",
            "footer.rights": "All rights reserved."
        },
        es: {
            "reset.title": "Nueva contraseña",
            "reset.subtitle": "Por favor, introduce tu nueva contraseña segura.",
            "reset.password_label": "Nueva contraseña",
            "reset.password_placeholder": "••••••••",
            "reset.submit": "Actualizar contraseña",
            "reset.updating": "Actualizando...",
            "reset.token_error": "Token de restablecimiento faltante o no válido.",
            "reset.success_msg": "¡Contraseña actualizada con éxito!",
            "reset.error_default": "Ocurrió un error.",
            "footer.rights": "Todos los derechos reservados."
        },
        ru: {
            "reset.title": "Новый пароль",
            "reset.subtitle": "Пожалуйста, введите новый надежный пароль.",
            "reset.password_label": "Новый пароль",
            "reset.password_placeholder": "••••••••",
            "reset.submit": "Обновить пароль",
            "reset.updating": "Обновление...",
            "reset.token_error": "Отсутствует или недействителен токен сброса.",
            "reset.success_msg": "Пароль успешно обновлен!",
            "reset.error_default": "Произошла ошибка.",
            "footer.rights": "Все права защищены."
        },
        it: {
            "reset.title": "Nuova password",
            "reset.subtitle": "Inserisci la tua nuova password sicura.",
            "reset.password_label": "Nuova password",
            "reset.password_placeholder": "••••••••",
            "reset.submit": "Aggiorna password",
            "reset.updating": "Aggiornamento...",
            "reset.token_error": "Token di reset mancante o non valido.",
            "reset.success_msg": "Password aggiornata con successo!",
            "reset.error_default": "Si è verificato un errore.",
            "footer.rights": "Tutti i diritti riservati."
        },
        zh: {
            "reset.title": "新密码",
            "reset.subtitle": "请输入您的新安全密码。",
            "reset.password_label": "新密码",
            "reset.password_placeholder": "••••••••",
            "reset.submit": "更新密码",
            "reset.updating": "正在更新...",
            "reset.token_error": "重置令牌丢失或无效。",
            "reset.success_msg": "密码更新成功！",
            "reset.error_default": "发生错误。",
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

    // Récupération du token depuis l'URL (?token=XYZ)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const passwordInput = document.getElementById('password');
    const confirmationInput = document.getElementById('password_confirm');
    const matchText = document.getElementById('match-text');
    const strengthText = document.getElementById('strength-text');
    const strengthBars = [1, 2, 3, 4].map(index => document.getElementById(`strength-bar-${index}`));

    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.target);
            const visible = input.type === 'password';
            input.type = visible ? 'text' : 'password';
            button.textContent = visible ? '🙈' : '👁';
        });
    });

    function updatePasswordUi() {
        const password = passwordInput.value;
        const score = [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
        const colors = ['bg-rose-500', 'bg-amber-500', 'bg-brand-500', 'bg-emerald-500'];
        const labels = ['Très faible', 'Faible', 'Moyenne', 'Forte'];
        strengthBars.forEach((bar, index) => bar.className = `h-full w-1/4 transition-colors ${index < score ? colors[score - 1] : 'bg-slate-100'}`);
        strengthText.textContent = password ? `Sécurité : ${labels[Math.max(score - 1, 0)]}` : 'Sécurité : Inconnue';
        const mismatch = Boolean(confirmationInput.value) && password !== confirmationInput.value;
        matchText.classList.toggle('hidden', !mismatch);
        confirmationInput.setCustomValidity(mismatch ? 'Les mots de passe ne correspondent pas.' : '');
    }

    passwordInput.addEventListener('input', updatePasswordUi);
    confirmationInput.addEventListener('input', updatePasswordUi);

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
        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    const currentLangCheck = localStorage.getItem('travelms_lang') || 'fr';
    if (!token) {
        showToast(translations[currentLangCheck]["reset.token_error"], "error");
        document.getElementById('error-alert').classList.remove('hidden');
        document.getElementById('error-message').textContent = translations[currentLangCheck]["reset.token_error"];
        document.getElementById('reset-form').style.display = 'none';
    }

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const submitBtn = document.getElementById('submit-btn');
        const buttonText = document.getElementById('btn-text');
        const spinner = document.getElementById('btn-spinner');
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';

        if (password !== confirmationInput.value) {
            updatePasswordUi();
            confirmationInput.focus();
            return;
        }

        buttonText.textContent = translations[currentLang]["reset.updating"];
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            // Utilisation de API_BASE_URL pour pointer correctement vers le backend (ex: port 3000)
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || translations[currentLang]["reset.error_default"]);
            }

            showToast(data.message || translations[currentLang]["reset.success_msg"], "success");
            document.getElementById('form-wrapper').classList.add('hidden');
            document.getElementById('reset-success-title').textContent = translations[currentLang]["reset.success_title"] || translations.fr["reset.success_title"];
            document.getElementById('reset-success-message').textContent = translations[currentLang]["reset.success_subtitle"] || translations.fr["reset.success_subtitle"];
            document.getElementById('reset-login-link').textContent = translations[currentLang]["reset.login_btn"] || translations.fr["reset.login_btn"];
            const success = document.getElementById('reset-success');
            success.classList.remove('hidden');
            requestAnimationFrame(() => success.classList.remove('opacity-0'));

        } catch (err) {
            showToast(err.message, "error");
            document.getElementById('error-alert').classList.remove('hidden');
            document.getElementById('error-message').textContent = err.message;
            buttonText.textContent = translations[currentLang]["reset.submit"];
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
