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
