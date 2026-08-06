import { apiRequest } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadDestinations();

    document.getElementById('destination-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitDestinationForm();
    });

    document.getElementById('destinationResetBtn').addEventListener('click', () => {
        clearDestinationForm();
    });

    // Preview handlers
    document.getElementById('destinationCoverFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        renderCoverPreview(file);
    });

    document.getElementById('destinationGalleryFiles').addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        renderGalleryPreviews(files);
    });
});

async function loadDestinations() {
    const tbody = document.getElementById('destinations-table-body');
    const errorDiv = document.getElementById('destinations-error-message');
    const successDiv = document.getElementById('destinations-success-message');

    try {
        const response = await apiRequest('/admin/destinations', 'GET');
        tbody.innerHTML = '';

        response.destinations.forEach(destination => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${destination.id}</td>
                <td>${destination.title}</td>
                <td>${destination.location}</td>
                <td>${Number(destination.price).toFixed(2)} €</td>
                <td>${destination.is_active ? 'Actif' : 'Inactif'}</td>
                <td>
                    <button class="btn-edit-destination" data-id="${destination.id}">Modifier</button>
                    <button class="btn-delete-destination" data-id="${destination.id}">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-destination').forEach(button => {
            button.addEventListener('click', async (e) => {
                const destinationId = e.target.getAttribute('data-id');
                await populateDestinationForm(destinationId);
            });
        });

        document.querySelectorAll('.btn-delete-destination').forEach(button => {
            button.addEventListener('click', async (e) => {
                const destinationId = e.target.getAttribute('data-id');
                if (confirm('Voulez-vous vraiment supprimer cette destination ?')) {
                    await deleteDestination(destinationId);
                }
            });
        });

        errorDiv.style.display = 'none';
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Erreur lors du chargement des destinations.';
        successDiv.style.display = 'none';
    }
}

async function populateDestinationForm(destinationId) {
    const errorDiv = document.getElementById('destinations-error-message');
    errorDiv.style.display = 'none';

    try {
        const response = await apiRequest('/admin/destinations', 'GET');
        const destination = response.destinations.find(d => d.id === destinationId);
        if (!destination) throw new Error('Destination introuvable.');

        document.getElementById('destinationId').value = destination.id;
        document.getElementById('destinationTitle').value = destination.title;
        document.getElementById('destinationLocation').value = destination.location;
        document.getElementById('destinationPrice').value = destination.price;
        document.getElementById('destinationImageUrl').value = destination.image_url || destination.cover_image || '';
        document.getElementById('destinationIsActive').checked = destination.is_active;
        document.getElementById('destinationDescription').value = destination.description;
        // show existing cover image preview when editing
        const coverUrl = destination.image_url || destination.cover_image || '';
        if (coverUrl) renderCoverPreview(null, coverUrl);
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Impossible de récupérer la destination.';
    }
}

async function submitDestinationForm() {
    const successDiv = document.getElementById('destinations-success-message');
    const errorDiv = document.getElementById('destinations-error-message');
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    const destinationId = document.getElementById('destinationId').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('destinationTitle').value.trim());
    formData.append('description', document.getElementById('destinationDescription').value.trim());
    formData.append('price', document.getElementById('destinationPrice').value);
    formData.append('location', document.getElementById('destinationLocation').value.trim());
    formData.append('image_url', document.getElementById('destinationImageUrl').value.trim());
    formData.append('is_active', document.getElementById('destinationIsActive').checked ? 'true' : 'false');
    formData.append('replace_gallery', document.getElementById('destinationReplaceGallery').checked ? 'true' : 'false');

    const coverFile = document.getElementById('destinationCoverFile').files[0];
    if (coverFile) {
        formData.append('cover_image', coverFile);
    }

    const galleryFiles = document.getElementById('destinationGalleryFiles').files;
    if (galleryFiles.length > 0) {
        for (const galleryFile of galleryFiles) {
            formData.append('gallery', galleryFile);
        }
    }

    try {
        const url = destinationId ? `/api/admin/destinations/${destinationId}` : '/api/admin/destinations';
        const method = destinationId ? 'PUT' : 'POST';
        const payload = await sendFormDataRequest(url, method, formData);

        successDiv.textContent = destinationId ? 'Destination mise à jour avec succès.' : 'Destination créée avec succès.';
        successDiv.style.display = 'block';
        clearDestinationForm();
        await loadDestinations();
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Erreur lors de l’enregistrement de la destination.';
        successDiv.style.display = 'none';
    }
}

async function sendFormDataRequest(url, method, formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        method,
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.error || payload?.message || `Erreur HTTP : ${response.status}`);
    }
    return payload;
}

async function deleteDestination(destinationId) {
    const successDiv = document.getElementById('destinations-success-message');
    const errorDiv = document.getElementById('destinations-error-message');
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    try {
        await apiRequest(`/admin/destinations/${destinationId}`, 'DELETE');
        successDiv.style.display = 'block';
        successDiv.textContent = 'Destination supprimée avec succès.';
        await loadDestinations();
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Erreur lors de la suppression de la destination.';
    }
}

function clearDestinationForm() {
    document.getElementById('destinationId').value = '';
    document.getElementById('destinationTitle').value = '';
    document.getElementById('destinationLocation').value = '';
    document.getElementById('destinationPrice').value = '';
    document.getElementById('destinationImageUrl').value = '';
    document.getElementById('destinationCoverFile').value = '';
    document.getElementById('destinationGalleryFiles').value = '';
    document.getElementById('destinationReplaceGallery').checked = false;
    document.getElementById('destinationIsActive').checked = true;
    document.getElementById('destinationDescription').value = '';
    // clear previews
    clearCoverPreview();
    clearGalleryPreviews();
}

// --- Preview utilities ---
let _coverObjectUrl = null;
function renderCoverPreview(file, remoteUrl) {
    const img = document.getElementById('destinationCoverPreview');
    if (!img) return;
    // clear previous object URL
    if (_coverObjectUrl) {
        URL.revokeObjectURL(_coverObjectUrl);
        _coverObjectUrl = null;
    }

    if (file && file instanceof File) {
        _coverObjectUrl = URL.createObjectURL(file);
        img.src = _coverObjectUrl;
        img.classList.remove('hidden');
        return;
    }

    if (remoteUrl) {
        img.src = remoteUrl;
        img.classList.remove('hidden');
        return;
    }

    // no preview available
    img.src = '';
    img.classList.add('hidden');
}

function clearCoverPreview() {
    const img = document.getElementById('destinationCoverPreview');
    if (!img) return;
    if (_coverObjectUrl) {
        URL.revokeObjectURL(_coverObjectUrl);
        _coverObjectUrl = null;
    }
    img.src = '';
    img.classList.add('hidden');
}

function renderGalleryPreviews(files) {
    const container = document.getElementById('destinationGalleryPreview');
    if (!container) return;
    clearGalleryPreviews();
    files.forEach((file) => {
        if (!(file instanceof File)) return;
        const url = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.src = url;
        img.className = 'w-full h-24 object-cover rounded-2xl border border-slate-200';
        // store objectUrl on element for cleanup
        img.dataset._obj = url;
        const wrapper = document.createElement('div');
        wrapper.className = 'overflow-hidden rounded-2xl';
        wrapper.appendChild(img);
        container.appendChild(wrapper);
    });
}

function clearGalleryPreviews() {
    const container = document.getElementById('destinationGalleryPreview');
    if (!container) return;
    // revoke any object URLs
    container.querySelectorAll('img').forEach(img => {
        const url = img.dataset._obj;
        if (url) URL.revokeObjectURL(url);
    });
    container.innerHTML = '';
}
