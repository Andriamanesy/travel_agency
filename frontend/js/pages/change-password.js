(() => {
    const API_BASE_URL = window.TravelConfig.apiBaseUrl;
    const form = document.getElementById('change-password-form');
    const submitButton = document.getElementById('submit-btn');
    const message = document.getElementById('form-message');

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `rounded-xl px-4 py-3 text-sm ${type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmation = document.getElementById('confirm-password').value;

        if (!token) {
            showMessage('Votre session a expiré. Veuillez vous reconnecter.', 'error');
            return;
        }
        if (newPassword !== confirmation) {
            showMessage('Les nouveaux mots de passe ne correspondent pas.', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Mise à jour…';
        try {
            const response = await fetch(`${API_BASE_URL}/api/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'La mise à jour a échoué.');

            form.reset();
            showMessage(data.message, 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Mettre à jour le mot de passe';
        }
    });
})();
