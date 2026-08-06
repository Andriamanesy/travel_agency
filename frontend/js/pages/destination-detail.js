import { apiRequest } from '../api.js';

const urlParams = new URLSearchParams(window.location.search);
const destinationId = urlParams.get('id');

// Sélecteurs DOM
const loading = document.getElementById('destination-loading');
const errorBox = document.getElementById('destination-error');
const content = document.getElementById('destination-content');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');

// Initialisation de la page
if (!destinationId) {
    showError('Aucune destination spécifiée dans l’URL.');
} else {
    loadDestination(destinationId);
}

// Configuration des événements pour la Lightbox (déclarés une seule fois)
if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });
}

/**
 * Charge et affiche les détails d'une destination depuis l'API
 */
async function loadDestination(id) {
    try {
        const response = await apiRequest(`/destinations/${encodeURIComponent(id)}`, 'GET');
        const destination = response.destination;
        
        if (!destination) {
            throw new Error('Destination introuvable.');
        }

        // 1. Mise à jour du titre de la page dans l'onglet du navigateur
        document.title = `${destination.title} - TravelMS`;

        // 2. Injection des informations dans le Hero et les en-têtes
        const heroEl = document.getElementById('destinationHero');
        if (heroEl) {
            heroEl.src = destination.cover_image || destination.image_url || 'https://via.placeholder.com/1200x600?text=TravelMS';
            heroEl.alt = destination.title;
        }

        setText('destinationLocation', destination.location || 'Madagascar');
        setText('destinationTitle', destination.title);
        setText('destinationLead', destination.description ? destination.description.slice(0, 160) + '...' : '');
        setText('destinationDescription', destination.description);
        setText('destinationLocationDetail', destination.location || 'Non spécifié');

        // 3. Formatage propre du prix (ex: "850 €")
        const priceEl = document.getElementById('destinationPrice');
        if (priceEl) {
            const formattedPrice = !isNaN(destination.price) 
                ? `${Number(destination.price).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €` 
                : 'Sur devis';
            priceEl.textContent = formattedPrice;
        }

        // 4. Gestion de la disponibilité
        const statusEl = document.getElementById('destinationStatus');
        if (statusEl) {
            if (destination.is_active === false) {
                statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500"></span> Indisponible`;
                statusEl.className = "inline-flex items-center gap-1.5 text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1 rounded-full";
            }
        }

        // 5. Mise à jour du lien de réservation
        const bookingLink = document.getElementById('destinationBookingLink');
        if (bookingLink) {
            bookingLink.href = `/booking.html?destination_id=${encodeURIComponent(destination.id)}`;
        }

        // 6. Génération dynamique de la galerie photo
        renderGallery(destination);

        // 7. Affichage du contenu
        loading.classList.add('hidden');
        content.classList.remove('hidden');

    } catch (err) {
        console.error("Erreur de chargement de la destination :", err);
        showError(err.message || 'Impossible de charger les détails de cette destination.');
    }
}

/**
 * Génère la galerie d'images et configure la modale Lightbox
 */
function renderGallery(destination) {
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';
    const galleryItems = Array.isArray(destination.gallery) ? destination.gallery : [];

    if (galleryItems.length === 0) {
        galleryGrid.innerHTML = `
            <div class="col-span-full text-center text-slate-400 py-6 text-sm bg-slate-100/60 rounded-2xl border border-dashed border-slate-200">
                Aucune photo supplémentaire disponible pour ce séjour.
            </div>`;
        return;
    }

    galleryItems.forEach(item => {
        // Supporte les URLs directes (string) ou les objets { image_url: "..." }
        const imageUrl = typeof item === 'string' ? item : item.image_url;
        if (!imageUrl) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 hover:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600 transition shadow-sm group';
        
        const thumbnail = document.createElement('img');
        thumbnail.src = imageUrl;
        thumbnail.alt = `Galerie ${destination.title}`;
        thumbnail.className = 'w-full h-24 md:h-32 object-cover transition duration-300 group-hover:scale-105 cursor-pointer';
        
        button.appendChild(thumbnail);
        button.addEventListener('click', () => openLightbox(imageUrl));
        galleryGrid.appendChild(button);
    });
}

/**
 * Fonctions de gestion de la Lightbox
 */
function openLightbox(src) {
    if (!lightboxImage || !lightbox) return;
    lightboxImage.src = src;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    if (lightboxClose) lightboxClose.focus();
}

function closeLightbox() {
    if (!lightboxImage || !lightbox) return;
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    lightboxImage.src = '';
}

/**
 * Utilitaire pour injecter du texte en toute sécurité si l'élément existe
 */
function setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text || '';
    }
}

/**
 * Affiche une erreur et masque le chargement
 */
function showError(message) {
    if (loading) loading.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
    }
}