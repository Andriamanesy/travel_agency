const API_BASE_URL = `${window.TravelConfig?.apiBaseUrl || ''}/api`;

async function fetchHomeMessage() {
    try {
        const response = await fetch(`${API_BASE_URL}/hello`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur de connexion à l'API :", error);
        return { error: "Impossible de joindre le Backend ou la Base de données." };
    }
}

async function apiRequest(path, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${path}`;
    const options = {
        method,
        headers: {},
        credentials: 'same-origin'
    };

    const token = localStorage.getItem('token');
    if (token) options.headers.Authorization = `Bearer ${token}`;

    if (body !== null) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message = payload?.error || payload?.message || `Erreur HTTP : ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

export { fetchHomeMessage, apiRequest };
