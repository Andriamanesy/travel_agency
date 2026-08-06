import { apiRequest } from '../api.js'; // Ajustez le chemin selon votre structure d'API

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await Promise.all([loadUsers(), loadDestinations()]);

    document.getElementById('destination-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitDestinationForm();
    });

    document.getElementById('destinationResetBtn').addEventListener('click', () => {
        clearDestinationForm();
    });
});

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    const errorDiv = document.getElementById('error-message');
    
    try {
        // Endpoint backend pour lister les utilisateurs (protégé par RBAC)
        const response = await apiRequest('/admin/users', 'GET');
        
        tbody.innerHTML = '';
        response.users.forEach(user => {
            const currentRole = Array.isArray(user.roles) && user.roles.length ? user.roles[0] : 'client';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${user.is_verified ? '✅ Vérifié' : '⏳ En attente'}</td>
                <td>
                    <select class="role-select" data-user-id="${user.id}">
                        <option value="client" ${currentRole === 'client' ? 'selected' : ''}>Client</option>
                        <option value="agent" ${currentRole === 'agent' ? 'selected' : ''}>Agent</option>
                        <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <button class="btn-save-role" data-user-id="${user.id}">Mettre à jour</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Activer les boutons de mise à jour de rôle
        document.querySelectorAll('.btn-save-role').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.target.getAttribute('data-user-id');
                const select = document.querySelector(`.role-select[data-user-id="${userId}"]`);
                const newRole = select.value;
                await updateUserRole(userId, newRole);
            });
        });

    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Erreur lors du chargement des utilisateurs (Accès refusé ?)';
    }
}

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
        const response = await apiRequest(`/admin/destinations`, 'GET');
        const destination = response.destinations.find(d => d.id === destinationId);
        if (!destination) throw new Error('Destination introuvable.');

        document.getElementById('destinationId').value = destination.id;
        document.getElementById('destinationTitle').value = destination.title;
        document.getElementById('destinationLocation').value = destination.location;
        document.getElementById('destinationPrice').value = destination.price;
        document.getElementById('destinationImageUrl').value = destination.image_url;
        document.getElementById('destinationIsActive').checked = destination.is_active;
        document.getElementById('destinationDescription').value = destination.description;
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
        const response = await sendFormDataRequest(
            destinationId ? `/api/admin/destinations/${destinationId}` : '/api/admin/destinations',
            destinationId ? 'PUT' : 'POST',
            formData
        );

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
    document.getElementById('destinationIsActive').checked = true;
    document.getElementById('destinationDescription').value = '';
}

async function updateUserRole(userId, role) {
    const successDiv = document.getElementById('success-message');
    const errorDiv = document.getElementById('error-message');

    try {
        await apiRequest(`/admin/users/${userId}/roles`, 'PUT', { roles: [role] });
        successDiv.style.display = 'block';
        successDiv.textContent = 'Rôle mis à jour avec succès !';
        errorDiv.style.display = 'none';
        setTimeout(() => successDiv.style.display = 'none', 3000);
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Erreur lors de la mise à jour du rôle.';
        successDiv.style.display = 'none';
    }
}