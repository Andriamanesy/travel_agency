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
        document.getElementById('reset-form').style.display = 'none';
    }

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const submitBtn = document.getElementById('submit-btn');
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';

        submitBtn.textContent = translations[currentLang]["reset.updating"];
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
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (err) {
            showToast(err.message, "error");
            submitBtn.textContent = translations[currentLang]["reset.submit"];
            submitBtn.disabled = false;
        }
    });
