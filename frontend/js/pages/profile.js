    // Nginx relaie /api vers le backend : rester sur la même origine.
const API_BASE_URL = window.TravelConfig.apiBaseUrl;

    document.getElementById('current-year').textContent = new Date().getFullYear();

    const translations = {
        fr: {
            "nav.home": "Accueil",
            "nav.destinations": "Destinations",
            "nav.circuits": "Circuits",
            "nav.logout": "Déconnexion",
            "profile.title": "Mon Profil",
            "profile.subtitle": "Consultez et mettez à jour vos informations personnelles.",
            "profile.name_label": "Nom complet",
            "profile.email_label": "Adresse email",
            "profile.submit": "Mettre à jour",
            "profile.updating": "Mise à jour...",
            "profile.success": "Profil mis à jour avec succès !",
            "profile.error": "Erreur lors de la mise à jour.",
            "profile.load_error": "Impossible de charger le profil.",
            "profile.back": "Retour à l'accueil",
            "footer.rights": "Tous droits réservés."
        },
        en: {
            "nav.home": "Home",
            "nav.destinations": "Destinations",
            "nav.circuits": "Tours",
            "nav.logout": "Sign Out",
            "profile.title": "My Profile",
            "profile.subtitle": "View and update your personal information.",
            "profile.name_label": "Full name",
            "profile.email_label": "Email address",
            "profile.submit": "Update profile",
            "profile.updating": "Updating...",
            "profile.success": "Profile successfully updated!",
            "profile.error": "Error updating profile.",
            "profile.load_error": "Could not load profile.",
            "profile.back": "Back to home",
            "footer.rights": "All rights reserved."
        },
        es: {
            "nav.home": "Inicio",
            "nav.destinations": "Destinos",
            "nav.circuits": "Circuitos",
            "nav.logout": "Cerrar sesión",
            "profile.title": "Mi Perfil",
            "profile.subtitle": "Consulta y actualiza tu información personal.",
            "profile.name_label": "Nombre completo",
            "profile.email_label": "Correo electrónico",
            "profile.submit": "Actualizar perfil",
            "profile.updating": "Actualizando...",
            "profile.success": "¡Perfil actualizado con éxito!",
            "profile.error": "Error al actualizar el perfil.",
            "profile.load_error": "No se pudo cargar el perfil.",
            "profile.back": "Volver al inicio",
            "footer.rights": "Todos los derechos reservados."
        },
        ru: {
            "nav.home": "Главная",
            "nav.destinations": "Направления",
            "nav.circuits": "Туры",
            "nav.logout": "Выйти",
            "profile.title": "Мой профиль",
            "profile.subtitle": "Просматривайте и обновляйте свою личную информацию.",
            "profile.name_label": "Полное имя",
            "profile.email_label": "Электронная почта",
            "profile.submit": "Обновить профиль",
            "profile.updating": "Обновление...",
            "profile.success": "Профиль успешно обновлен!",
            "profile.error": "Ошибка при обновлении профиля.",
            "profile.load_error": "Не удалось загрузить профиль.",
            "profile.back": "На главную",
            "footer.rights": "Все права защищены."
        },
        it: {
            "nav.home": "Home",
            "nav.destinations": "Destinazioni",
            "nav.circuits": "Tour",
            "nav.logout": "Esci",
            "profile.title": "Il mio profilo",
            "profile.subtitle": "Visualizza e aggiorna le tue informazioni personali.",
            "profile.name_label": "Nome completo",
            "profile.email_label": "Indirizzo email",
            "profile.submit": "Aggiorna profilo",
            "profile.updating": "Aggiornamento...",
            "profile.success": "Profilo aggiornato con successo!",
            "profile.error": "Errore durante l'aggiornamento.",
            "profile.load_error": "Impossibile caricare il profilo.",
            "profile.back": "Torna alla home",
            "footer.rights": "Tutti i diritti riservati."
        },
        zh: {
            "nav.home": "首页",
            "nav.destinations": "目的地",
            "nav.circuits": "旅游线路",
            "nav.logout": "退出登录",
            "profile.title": "我的个人资料",
            "profile.subtitle": "查看并更新您的个人信息。",
            "profile.name_label": "全名",
            "profile.email_label": "电子邮箱",
            "profile.submit": "更新资料",
            "profile.updating": "更新中...",
            "profile.success": "个人资料更新成功！",
            "profile.error": "更新时发生错误。",
            "profile.load_error": "无法加载个人资料。",
            "profile.back": "返回首页",
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

        const select = document.getElementById('langSwitch');
        if (select) select.value = lang;
    }

    const savedLang = localStorage.getItem('travelms_lang') || 'fr';
    setLanguage(savedLang);

    document.getElementById('langSwitch').addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    // Fonction Toast pour les notifications
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

    // Charger les données du profil au chargement de la page
    window.addEventListener('DOMContentLoaded', async () => {
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(translations[currentLang]["profile.load_error"]);
            }

            const data = await response.json();
            document.getElementById('name').value = data.name || '';
            document.getElementById('email').value = data.email || '';
        } catch (err) {
            showToast(err.message, "error");
        }
    });

    // Soumission du formulaire de mise à jour du profil
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const submitBtn = document.getElementById('submit-btn');
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';
        const token = localStorage.getItem('token');

        submitBtn.textContent = translations[currentLang]["profile.updating"];
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || translations[currentLang]["profile.error"]);
            }

            showToast(translations[currentLang]["profile.success"], "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            submitBtn.textContent = translations[currentLang]["profile.submit"];
            submitBtn.disabled = false;
        }
    });

    // Gestion de la déconnexion
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
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
        window.location.href = '/login.html';
    });
