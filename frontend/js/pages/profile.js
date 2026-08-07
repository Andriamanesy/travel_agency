
// Nginx relaie /api vers le backend : rester sur la même origine.
const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

// Gestion de l'année dynamique dans le footer si présent
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const translations = {
    fr: {
        "nav.home": "Tableau de bord",
        "nav.profile": "Mon Profil",
        "nav.trips": "Mes Voyages",
        "nav.wishlist": "Ma Wishlist",
        "nav.logout": "Déconnexion",
        "profile.title": "Paramètres du Profil",
        "profile.subtitle": "Mettez à jour vos informations personnelles et préférences de voyage.",
        "profile.firstname_label": "Prénom",
        "profile.lastname_label": "Nom",
        "profile.email_label": "Adresse email",
        "profile.phone_label": "Téléphone",
        "profile.address_label": "Adresse Postale",
        "profile.comfort_label": "Niveau de confort habituel",
        "profile.diet_label": "Régimes alimentaires & Allergies",
        "profile.submit": "Enregistrer les modifications",
        "profile.updating": "Mise à jour...",
        "profile.success": "Profil mis à jour avec succès !",
        "profile.error": "Erreur lors de la mise à jour.",
        "profile.load_error": "Impossible de charger le profil."
    },
    en: {
        "nav.home": "Dashboard",
        "nav.profile": "My Profile",
        "nav.trips": "My Trips",
        "nav.wishlist": "My Wishlist",
        "nav.logout": "Sign Out",
        "profile.title": "Profile Settings",
        "profile.subtitle": "Update your personal information and travel preferences.",
        "profile.firstname_label": "First name",
        "profile.lastname_label": "Last name",
        "profile.email_label": "Email address",
        "profile.phone_label": "Phone",
        "profile.address_label": "Postal Address",
        "profile.comfort_label": "Preferred comfort level",
        "profile.diet_label": "Diets & Allergies",
        "profile.submit": "Save changes",
        "profile.updating": "Updating...",
        "profile.success": "Profile successfully updated!",
        "profile.error": "Error updating profile.",
        "profile.load_error": "Could not load profile."
    },
    es: {
        "nav.home": "Panel",
        "nav.profile": "Mi Perfil",
        "nav.trips": "Mis Viajes",
        "nav.wishlist": "Mi Lista",
        "nav.logout": "Cerrar sesión",
        "profile.title": "Configuración del Perfil",
        "profile.subtitle": "Actualiza tu información personal y preferencias de viaje.",
        "profile.firstname_label": "Nombre",
        "profile.lastname_label": "Apellido",
        "profile.email_label": "Correo electrónico",
        "profile.phone_label": "Teléfono",
        "profile.address_label": "Dirección postal",
        "profile.comfort_label": "Nivel de confort habitual",
        "profile.diet_label": "Dietas y alergias",
        "profile.submit": "Guardar cambios",
        "profile.updating": "Actualizando...",
        "profile.success": "¡Perfil actualizado con éxito!",
        "profile.error": "Error al actualizar el perfil.",
        "profile.load_error": "No se pudo cargar el perfil."
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

const langSwitchEl = document.getElementById('langSwitch');
if (langSwitchEl) {
    langSwitchEl.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}

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

function redirectToLoginIfNeeded() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login.html');
        return true;
    }
    return false;
}

// Charger les données étendues du profil au chargement de la page
window.addEventListener('DOMContentLoaded', async () => {
    const currentLang = localStorage.getItem('travelms_lang') || 'fr';
    if (redirectToLoginIfNeeded()) return;

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
        
        // Remplissage des champs de l'interface Profil
        if(document.getElementById('firstname')) document.getElementById('firstname').value = data.firstname || data.name?.split(' ')[0] || '';
        if(document.getElementById('lastname')) document.getElementById('lastname').value = data.lastname || data.name?.split(' ').slice(1).join(' ') || '';
        if(document.getElementById('email')) document.getElementById('email').value = data.email || '';
        if(document.getElementById('phone')) document.getElementById('phone').value = data.phone || '';
        if(document.getElementById('address')) document.getElementById('address').value = data.address || '';
        if(document.getElementById('diet')) document.getElementById('diet').value = data.diet || '';
        if(document.getElementById('comfort')) document.getElementById('comfort').value = data.comfort || '';

    } catch (err) {
        showToast(err.message, "error");
    }
});

// Soumission globale du formulaire de profil mis à jour
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstname = document.getElementById('firstname')?.value.trim() || '';
        const lastname = document.getElementById('lastname')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        const address = document.getElementById('address')?.value.trim() || '';
        const diet = document.getElementById('diet')?.value.trim() || '';
        const comfort = document.getElementById('comfort')?.value || '';

        const submitBtn = document.getElementById('submit-btn');
        const currentLang = localStorage.getItem('travelms_lang') || 'fr';
        const token = localStorage.getItem('token');

        if (submitBtn) {
            submitBtn.textContent = translations[currentLang]["profile.updating"];
            submitBtn.disabled = true;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    name: `${firstname} ${lastname}`.trim(), 
                    firstname, 
                    lastname, 
                    email, 
                    phone, 
                    address, 
                    diet, 
                    comfort 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || translations[currentLang]["profile.error"]);
            }

            showToast(translations[currentLang]["profile.success"], "success");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            if (submitBtn) {
                submitBtn.textContent = translations[currentLang]["profile.submit"];
                submitBtn.disabled = false;
            }
        }
    });
}

// Gestion de la déconnexion
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
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
}
