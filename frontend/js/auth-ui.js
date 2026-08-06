/* Session UI shared by the public pages. Authorization remains server-side:
 * decoding a JWT here is only for navigation visibility. */
function readAccessClaims() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
        return payload;
    } catch { return null; }
}

document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('authNav');
    const claims = readAccessClaims();
    if (!host || !claims) return;
    const isAdmin = Array.isArray(claims.roles) && claims.roles.includes('admin');
    host.replaceChildren();
    const links = [
        ['profile.html', 'Mon profil'],
        ...(isAdmin ? [['admin.html', 'Administration']] : []),
        ['#', 'Déconnexion']
    ];
    links.forEach(([href, label], index) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        link.className = 'font-medium text-slate-700 hover:text-blue-600 transition';
        if (index === links.length - 1) {
            link.addEventListener('click', async event => {
                event.preventDefault();
                await fetch(`${window.TravelConfig?.apiBaseUrl || ''}/api/logout`, {
                    method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, credentials: 'same-origin'
                }).catch(() => {});
                localStorage.removeItem('token');
                localStorage.removeItem('travelms_user');
                window.location.assign('login.html');
            });
        }
        host.append(link);
    });
});
