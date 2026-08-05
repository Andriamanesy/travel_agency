document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const apiMessageEl = document.getElementById('api-message');

    // Appel vers l'API Node.js à travers Nginx Proxy
    fetch('/api/hello')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            statusEl.textContent = "Frontend  & Backend connectées !";
            apiMessageEl.textContent = data.message;
        })
        .catch(error => {
            console.error("Erreur d'appel API :", error);
            statusEl.textContent = "Impossible de joindre le Backend.";
        });
});