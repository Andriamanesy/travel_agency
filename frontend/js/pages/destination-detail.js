import { apiRequest } from '../api.js';

const urlParams = new URLSearchParams(window.location.search);
const destinationId = urlParams.get('id');
const loading = document.getElementById('destination-loading');
const errorBox = document.getElementById('destination-error');
const content = document.getElementById('destination-content');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');

if (!destinationId) {
    showError('Aucune destination définie dans l’URL.');
} else {
    loadDestination(destinationId);
}

async function loadDestination(id) {
    try {
        const response = await apiRequest(`/destinations/${encodeURIComponent(id)}`, 'GET');
        const destination = response.destination;
        if (!destination) throw new Error('Destination introuvable.');

        document.getElementById('destinationHero').src = destination.cover_image || destination.image_url || '';
        document.getElementById('destinationHero').alt = destination.title;
        document.getElementById('destinationLocation').textContent = destination.location;
        document.getElementById('destinationTitle').textContent = destination.title;
        document.getElementById('destinationLead').textContent = destination.description.slice(0, 160);
        document.getElementById('destinationDescription').textContent = destination.description;
        document.getElementById('destinationLocationDetail').textContent = destination.location;
        document.getElementById('destinationPrice').textContent = `${Number(destination.price).toFixed(2)} €`;
        document.getElementById('destinationStatus').textContent = destination.is_active ? 'Disponible' : 'Indisponible';
        document.getElementById('destinationBookingLink').href = `/booking.html?destination_id=${encodeURIComponent(destination.id)}`;

        galleryGrid.innerHTML = '';
        const galleryItems = Array.isArray(destination.gallery) ? destination.gallery : [];
        if (galleryItems.length === 0) {
            galleryGrid.innerHTML = '<div class="col-span-2 text-center text-slate-500">Aucune photo de galerie disponible.</div>';
        } else {
            galleryItems.forEach(image => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
                const thumbnail = document.createElement('img');
                thumbnail.src = image.image_url;
                thumbnail.alt = `Galerie ${destination.title}`;
                thumbnail.className = 'w-full h-40 object-cover transition duration-300 hover:scale-105';
                button.appendChild(thumbnail);
                button.addEventListener('click', () => openLightbox(image.image_url));
                galleryGrid.appendChild(button);
            });
        }

lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox) closeLightbox();
        });

        loading.classList.add('hidden');
        content.classList.remove('hidden');
    } catch (err) {
        showError(err.message || 'Impossible de charger la destination.');
    }
}

function openLightbox(src) {
    lightboxImage.src = src;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    lightboxClose.focus();
}

function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    lightboxImage.src = '';
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !lightbox.classList.contains('hidden')) closeLightbox();
});

function showError(message) {
    loading.classList.add('hidden');
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
}
