document.addEventListener('DOMContentLoaded', async () => {
    const apiMessageEl = document.getElementById('api-message');
    const statusDot = document.getElementById('status-dot');

    // Appel de l'API Phase 0
    const data = await fetchHomeMessage();

    if (data.error) {
        apiMessageEl.textContent = data.error;
        statusDot.className = "dot error";
    } else {
        // Affiche le message provenant directement de PostgreSQL via Node.js natif
        apiMessageEl.textContent = data.message;
        statusDot.className = "dot success";
    }
});