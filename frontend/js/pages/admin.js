import { apiRequest } from '../api.js'; // Ajustez le chemin selon votre structure d'API

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token || !hasAdminRole(token)) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(localStorage.getItem('travelms_user') || localStorage.getItem('user') || '{}');
    const name = user.name || user.email || 'Administrateur';
    document.getElementById('admin-name').textContent = name;
    document.getElementById('admin-avatar').textContent = name.trim().charAt(0).toUpperCase() || 'A';

    const usersMenuButton = document.getElementById('btn-users');
    const usersMenu = document.getElementById('menu-users');
    const usersMenuIcon = document.getElementById('icon-users');
    usersMenuButton?.addEventListener('click', () => {
        usersMenu.classList.toggle('hidden');
        usersMenuIcon.classList.toggle('rotate-180', !usersMenu.classList.contains('hidden'));
    });

    await Promise.all([loadUsers(), loadDestinations()]);

    document.getElementById('invite-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        await submitInvitation();
    });

    document.getElementById('destination-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitDestinationForm();
    });

    document.getElementById('destinationResetBtn').addEventListener('click', () => {
        clearDestinationForm();
    });
});

function hasAdminRole(token) {
    try {
        const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return claims.exp * 1000 > Date.now() && Array.isArray(claims.roles) && claims.roles.includes('admin');
    } catch {
        return false;
    }
}

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
            tr.className = 'transition hover:bg-slate-900/60';
            tr.innerHTML = `
                <td class="p-3 font-mono text-slate-500">${escapeHtml(user.id)}</td>
                <td class="p-3 font-semibold text-white">${escapeHtml(user.email)}</td>
                <td class="p-3">${user.is_verified ? '<span class="text-emerald-400">✓ Vérifié</span>' : '<span class="text-amber-400">⏳ En attente</span>'}</td>
                <td>
                    <select class="role-select rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200" data-user-id="${user.id}">
                        <option value="client" ${currentRole === 'client' ? 'selected' : ''}>Client</option>
                        <option value="agent" ${currentRole === 'agent' ? 'selected' : ''}>Agent</option>
                        <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td class="p-3 text-right">
                    <button class="btn-save-role rounded-lg bg-brand-700 px-2.5 py-1.5 font-bold text-white hover:bg-brand-800" data-user-id="${user.id}">Mettre à jour</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('users-count').textContent = response.users.length;

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

async function submitInvitation() {
    const successDiv = document.getElementById('invite-success');
    const errorDiv = document.getElementById('invite-error');
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    const email = document.getElementById('invite-email').value.trim();
    const role = document.getElementById('invite-role').value;

    try {
        const payload = await apiRequest('/admin/invitations', 'POST', { email, role });
        successDiv.style.display = 'block';
        successDiv.textContent = payload.message || 'Invitation envoyée avec succès.';
        document.getElementById('invite-form').reset();
    } catch (err) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = err.message || 'Impossible d’envoyer l’invitation.';
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
            tr.className = 'transition hover:bg-slate-900/60';
            tr.innerHTML = `
                <td class="p-3 font-semibold text-white">${escapeHtml(destination.title)}</td>
                <td class="p-3">${escapeHtml(destination.location)}</td>
                <td class="p-3">${Number(destination.price).toFixed(2)} €</td>
                <td class="p-3">${destination.is_active ? '<span class="rounded-full border border-emerald-800/50 bg-emerald-950 px-2 py-1 text-[10px] font-bold text-emerald-400">Actif</span>' : '<span class="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">Inactif</span>'}</td>
                <td class="space-x-1 p-3 text-right">
                    <button class="btn-edit-destination rounded-lg bg-slate-800 px-2.5 py-1.5 font-bold text-white hover:bg-slate-700" data-id="${destination.id}">Modifier</button>
                    <button class="btn-delete-destination rounded-lg border border-rose-800 bg-rose-950/50 px-2.5 py-1.5 font-bold text-rose-300 hover:bg-rose-900" data-id="${destination.id}">Supprimer</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('destinations-count').textContent = response.destinations.length;
        document.getElementById('active-destinations-count').textContent = response.destinations.filter(destination => destination.is_active).length;

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
        await apiRequest(`/admin/users/${userId}/role`, 'PUT', { roles: [role] });
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
