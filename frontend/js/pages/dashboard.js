// ==========================================
// 1. CONFIGURATION CENTRALE
// ==========================================
const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;
const DEFAULT_AVATAR_URL = '/assets/default-avatar.svg';
const token = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('travelms_user') || localStorage.getItem('user') || '{}');

if (!token && !userData.email) {
    window.location.href = 'login.html';
}

function setAvatar(url) {
    const image = document.getElementById('avatarDisplay');
    image.onerror = () => { image.onerror = null; image.src = DEFAULT_AVATAR_URL; };
    image.src = url || DEFAULT_AVATAR_URL;
}

// ==========================================
// 2. PRÉVISUALISATION INSTANTANÉE (AVEC NETTOYAGE MÉMOIRE)
// ==========================================
const avatarFileInput = document.getElementById('avatarFile');
avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const previewUrl = URL.createObjectURL(file);
        const img = document.getElementById('avatarDisplay');
        img.src = previewUrl;
        img.onload = () => URL.revokeObjectURL(previewUrl);
    }
});

// ==========================================
// 3. VÉRIFICATION DYNAMIQUE DU PROFIL
// ==========================================
function getBirthdateBounds() {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const formatDate = (date) => date.toISOString().slice(0, 10);
    return { min: formatDate(minDate), max: formatDate(maxDate) };
}

function isValidBirthdate(value) {
    const { min, max } = getBirthdateBounds();
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= min && value <= max;
}

function checkProfileCompletion() {
    const badge = document.getElementById('profileStatusBadge');
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;
    const nationality = document.getElementById('nationality').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const birthdate = document.getElementById('birthdate').value;
    const postalCode = document.getElementById('postalCode').value.trim();
    const address = document.getElementById('address').value.trim();

    const isComplete = fullName && email && /^\d{6,12}$/.test(phone) && gender && nationality
        && country && city && postalCode && address && isValidBirthdate(birthdate);

    if (isComplete) {
        badge.className = "bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-emerald-200/50";
        badge.textContent = "Profil Complet";
    } else {
        badge.className = "bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-amber-200/50";
        badge.textContent = "Profil Partiel";
    }
}

// Gestion des contraintes de saisie téléphone et date
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    checkProfileCompletion();
});

const birthdateInput = document.getElementById('birthdate');
const birthdateBounds = getBirthdateBounds();
birthdateInput.min = birthdateBounds.min;
birthdateInput.max = birthdateBounds.max;
birthdateInput.addEventListener('change', () => {
    if (birthdateInput.value && !isValidBirthdate(birthdateInput.value)) {
        birthdateInput.setCustomValidity('Vous devez avoir entre 13 et 120 ans.');
    } else {
        birthdateInput.setCustomValidity('');
    }
    checkProfileCompletion();
});

// ==========================================
// 4. DONNÉES GÉOGRAPHIQUES ET NATIONALITÉS
// ==========================================
const citiesByCountry = {
    "Madagascar": ["Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga", "Toliara", "Antsiranana", "Nosy Be"],
    "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
    "Belgique": ["Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges"],
    "Suisse": ["Genève", "Zurich", "Lausanne", "Berne", "Bâle"],
    "Canada": ["Montréal", "Toronto", "Québec", "Vancouver", "Ottawa"],
    "États-Unis": ["New York", "Los Angeles", "Chicago", "Miami", "San Francisco"],
    "Algérie": ["Alger", "Oran", "Constantine", "Annaba"],
    "Maroc": ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger"],
    "Tunisie": ["Tunis", "Sfax", "Sousse", "Bizerte"],
    "Espagne": ["Madrid", "Barcelone", "Valence", "Séville"],
    "Italie": ["Rome", "Milan", "Naples", "Turin", "Florence"],
    "Allemagne": ["Berlin", "Hambourg", "Munich", "Francfort"]
};

const postalCodesByCity = {
    "Antananarivo": "101", "Toamasina": "501", "Antsirabe": "110", "Fianarantsoa": "301", 
    "Mahajanga": "401", "Toliara": "601", "Antsiranana": "201", "Nosy Be": "207",
    "Paris": "75001", "Lyon": "69001", "Marseille": "13001", "Toulouse": "31000", 
    "Nice": "06000", "Nantes": "44000", "Strasbourg": "67000", "Montpellier": "34000", 
    "Bordeaux": "33000", "Lille": "59000", "Bruxelles": "1000", "Anvers": "2000", 
    "Genève": "1201", "Zurich": "8001", "Lausanne": "1000", "Montréal": "H3A 0G4", 
    "Toronto": "M5V 2H1", "New York": "10001", "Alger": "16000", "Oran": "31000", 
    "Casablanca": "20000", "Rabat": "10000", "Tunis": "1000", "Madrid": "28001", 
    "Barcelone": "08001", "Rome": "00100", "Milan": "20121", "Berlin": "10115", "Munich": "80331"
};

function updateCities(selectedCountry, preselectedCity = '') {
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="" disabled selected>Sélectionner la ville</option>';
    const cities = citiesByCountry[selectedCountry] || ["Autre / Saisie libre"];

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        if (preselectedCity && preselectedCity === city) {
            option.selected = true;
        }
        citySelect.appendChild(option);
    });
    checkProfileCompletion();
}

document.getElementById('city').addEventListener('change', (e) => {
    const selectedCity = e.target.value;
    const postalInput = document.getElementById('postalCode');
    if (postalCodesByCity[selectedCity]) {
        postalInput.value = postalCodesByCity[selectedCity];
    }
    checkProfileCompletion();
});

async function loadCountries() {
    const countrySelect = document.getElementById('country');
    const fallbackCountries = [...new Set([
        ...Object.keys(citiesByCountry),
        userData.country
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));

    const renderCountries = (countries) => {
        countrySelect.innerHTML = '<option value="" disabled selected>Sélectionner le pays</option>';
        countries.forEach(frenchName => {
            const option = document.createElement('option');
            option.value = frenchName;
            option.textContent = frenchName;
            if (userData.country === frenchName) option.selected = true;
            countrySelect.appendChild(option);
        });
    };

    renderCountries(fallbackCountries);

    if (userData.country) {
        updateCities(userData.country, userData.city);
    }
    checkProfileCompletion();

    try {
        const response = await fetch('/api/countries');
        if (!response.ok) throw new Error('Erreur réseau');
        const { countries } = await response.json();
        renderCountries(countries);
    } catch (error) {
        // Mode hors-ligne géré silencieusement
    }
}

document.getElementById('country').addEventListener('change', (e) => {
    updateCities(e.target.value);
    document.getElementById('postalCode').value = '';
    checkProfileCompletion();
});

function loadNationalities() {
    const natSelect = document.getElementById('nationality');
    const nationalities = [
        "Malgache", "Française", "Belge", "Suisse", "Canadienne", "Américaine", 
        "Algérienne", "Allemande", "Britannique", "Espagnole", "Italienne", 
        "Marocaine", "Tunisienne", "Sénégalaise", "Portugaise", "Autre"
    ].sort();

    natSelect.innerHTML = '<option value="" disabled selected>Sélectionner la nationalité</option>';
    nationalities.forEach(nat => {
        const option = document.createElement('option');
        option.value = nat;
        option.textContent = nat;
        if (userData.nationality === nat) option.selected = true;
        natSelect.appendChild(option);
    });
}

// ==========================================
// 5. INITIALISATION DES DONNÉES DU PROFIL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    loadNationalities();
    
    document.getElementById('fullName').value = userData.name || userData.fullName || '';
    document.getElementById('email').value = userData.email || '';
    
    if (userData.phone) {
        const parts = userData.phone.trim().split(' ');
        if (parts.length >= 2 && parts[0].startsWith('+')) {
            document.getElementById('phoneCode').value = parts[0];
            document.getElementById('phone').value = parts.slice(1).join('').replace(/\D/g, '');
        } else {
            document.getElementById('phone').value = userData.phone.replace(/\D/g, '');
        }
    }

    document.getElementById('birthdate').value = userData.birthdate?.slice(0, 10) || '';
    document.getElementById('gender').value = userData.gender || '';
    document.getElementById('postalCode').value = userData.postalCode || '';
    document.getElementById('address').value = userData.address || '';
    document.getElementById('preferredLang').value = userData.preferredLang || 'fr';

    if (userData.avatar_url) {
        setAvatar(userData.avatar_url);
    }

    document.getElementById('userNameDisplay').textContent = userData.name || userData.fullName || 'Voyageur';
    checkProfileCompletion();

    // Gestion dynamique du rôle Administrateur dans la sidebar
    const userRole = localStorage.getItem('user_role'); 
    if (userRole === 'admin') {
        const sidebar = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3 > div:first-child');
        if (sidebar) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin-destinations.html';
            adminLink.className = 'flex items-center space-x-3.5 px-4.5 py-3.5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition';
            adminLink.innerHTML = '<span class="text-xl opacity-70">⚙️</span> <span class="text-sm">Administration</span>';
            sidebar.appendChild(adminLink);
        }
    }
});

['fullName', 'email', 'birthdate', 'postalCode', 'address', 'gender', 'nationality', 'preferredLang', 'phoneCode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', checkProfileCompletion);
        el.addEventListener('change', checkProfileCompletion);
    }
});

// ==========================================
// 6. SOUMISSION ET GESTION DES ALERTES
// ==========================================
const profileForm = document.getElementById('profileForm');
const alertBox = document.getElementById('alertBox');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const submitSpinner = document.getElementById('submitSpinner');

function showAlert(message, type = 'rose') {
    alertBox.className = type === 'rose' 
        ? "p-4 rounded-2xl text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200 transition-all duration-300"
        : "p-4 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all duration-300";
    alertBox.textContent = message;
    alertBox.classList.remove('hidden');
}

function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
        submitBtnText.textContent = "Enregistrement...";
        submitSpinner.classList.remove('hidden');
    } else {
        submitBtnText.textContent = "Mettre à jour mon profil";
        submitSpinner.classList.add('hidden');
    }
}

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phoneCode = document.getElementById('phoneCode').value;
    const phoneNum = phoneInput.value.trim();
    if (phoneNum && !/^\d{6,12}$/.test(phoneNum)) {
        showAlert("⚠️ Le numéro de téléphone doit contenir uniquement des chiffres (entre 6 et 12 chiffres).");
        return;
    }

    const cityInput = document.getElementById('city').value;
    if (!cityInput) {
        showAlert("⚠️ Veuillez sélectionner une ville.");
        return;
    }

    const postalInput = document.getElementById('postalCode').value.trim();
    const postalRegex = /^[a-zA-Z0-9\s\-]{2,10}$/;
    if (postalInput && !postalRegex.test(postalInput)) {
        showAlert("⚠️ Veuillez entrer un code postal valide.");
        return;
    }

    const birthdate = birthdateInput.value;
    if (!isValidBirthdate(birthdate)) {
        showAlert("⚠️ La date de naissance doit correspondre à un âge compris entre 13 et 120 ans.");
        return;
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('fullName').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('phone', phoneNum ? `${phoneCode} ${phoneNum}` : '');
    formData.append('birthdate', birthdate);
    formData.append('gender', document.getElementById('gender').value);
    formData.append('nationality', document.getElementById('nationality').value);
    formData.append('country', document.getElementById('country').value);
    formData.append('city', cityInput);
    formData.append('postalCode', postalInput);
    formData.append('address', document.getElementById('address').value);
    formData.append('preferredLang', document.getElementById('preferredLang').value);

    const imageFile = avatarFileInput.files[0];
    if (imageFile) {
        formData.append('avatar', imageFile);
    }

    try {
        setLoadingState(true);

        const response = await fetch(`${API_BASE_URL}/profile/update`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Erreur lors de la sauvegarde sur le serveur.");
        }

        userData = data.user;
        localStorage.setItem('travelms_user', JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.avatar_url) {
            setAvatar(userData.avatar_url);
        }

        document.getElementById('userNameDisplay').textContent = userData.name;
        checkProfileCompletion();

        showAlert("✅ Votre profil et votre photo ont été enregistrés sur le serveur !", "emerald");

        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 4500);

    } catch (error) {
        console.error("Erreur de sauvegarde :", error);
        showAlert(`❌ ${error.message}`);
    } finally {
        setLoadingState(false);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
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
    window.location.href = 'index.html';
});

const savedLang = localStorage.getItem('travelms_lang') || 'fr';
document.getElementById('langSwitch').value = savedLang;
document.getElementById('langSwitch').addEventListener('change', (e) => {
    localStorage.setItem('travelms_lang', e.target.value);
    window.location.reload();
});