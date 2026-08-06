import { apiRequest } from '../api.js';

const urlParams = new URLSearchParams(window.location.search);
const destinationId = urlParams.get('id');
const loading = document.getElementById('destination-loading');
const errorBox = document.getElementById('destination-error');
const content = document.getElementById('destination-content');

if (!destinationId) {
    showError('Aucune destination définie dans l’URL.');
} else {
    loadDestination(destinationId);
}

async function loadDestination(id) {
    try {
        const destination = await apiRequest(`/destinations/${encodeURIComponent(id)}`, 'GET');

        document.getElementById('destinationHero').src = destination.image_url;
        document.getElementById('destinationHero').alt = destination.title;
        document.getElementById('destinationLocation').textContent = destination.location;
        document.getElementById('destinationTitle').textContent = destination.title;
        document.getElementById('destinationLead').textContent = destination.description.slice(0, 160);
        document.getElementById('destinationDescription').textContent = destination.description;
        document.getElementById('destinationLocationDetail').textContent = destination.location;
        document.getElementById('destinationPrice').textContent = `${Number(destination.price).toFixed(2)} €`;
        document.getElementById('destinationStatus').textContent = destination.is_active ? 'Disponible' : 'Indisponible';

        const highlights = document.getElementById('destinationHighlights');
        highlights.innerHTML = '';
        if (Array.isArray(destination.highlights) && destination.highlights.length) {
            destination.highlights.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                highlights.appendChild(li);
            });
        }

        loading.classList.add('hidden');
        content.classList.remove('hidden');
    } catch (err) {
        showError(err.message || 'Impossible de charger la destination.');
    }"}]}

function showError(message) {
    loading.classList.add('hidden');
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
}
