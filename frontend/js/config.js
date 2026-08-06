/**
 * Configuration partagée + gestion centralisée de l'authentification.
 * Le refresh token reste uniquement dans un cookie HttpOnly.
 */
window.TravelConfig = Object.freeze({
    apiBaseUrl: ''
});

(() => {
    const nativeFetch = window.fetch.bind(window);
    let refreshPromise = null;

    function getUrl(input) {
        return new URL(
            typeof input === 'string' ? input : input.url,
            window.location.origin
        );
    }

    function isApiRequest(input) {
        return getUrl(input).pathname.startsWith('/api/');
    }

    function isPublicAuthRoute(input) {
        const pathname = getUrl(input).pathname;

        return [
            '/api/login',
            '/api/register',
            '/api/refresh',
            '/api/forgot-password',
            '/api/reset-password',
            '/api/verify',
            '/api/resend-verification'
        ].includes(pathname);
    }

    function clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('travelms_user');
        localStorage.removeItem('user');
    }

    function redirectToLogin() {
        clearSession();

        if (!window.location.pathname.endsWith('/login.html')) {
            window.location.assign('/login.html');
        }
    }

    async function refreshAccessToken() {
        const response = await nativeFetch('/api/refresh', {
            method: 'POST',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Refresh token expiré ou révoqué.');
        }

        const payload = await response.json();

        if (!payload.token) {
            throw new Error('Nouveau token manquant.');
        }

        localStorage.setItem('token', payload.token);
        return payload.token;
    }

    window.fetch = async (input, options = {}) => {
        const apiRequest = isApiRequest(input);
        const publicAuthRoute = isPublicAuthRoute(input);
        const headers = new Headers(options.headers || {});
        const token = localStorage.getItem('token');

        if (apiRequest && !publicAuthRoute && token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        let response = await nativeFetch(input, {
            ...options,
            headers,
            credentials: options.credentials || 'same-origin'
        });

        const alreadyRetried = options._travelmsRetried === true;

        if (
            response.status !== 401 ||
            !apiRequest ||
            publicAuthRoute ||
            alreadyRetried
        ) {
            if (response.status === 403 && apiRequest && !publicAuthRoute) {
                window.dispatchEvent(new CustomEvent('travelms:forbidden'));
                redirectToLogin();
            }
            return response;
        }

        try {
            refreshPromise ||= refreshAccessToken()
                .finally(() => {
                    refreshPromise = null;
                });

            const newToken = await refreshPromise;
            headers.set('Authorization', `Bearer ${newToken}`);

            response = await nativeFetch(input, {
                ...options,
                headers,
                credentials: options.credentials || 'same-origin',
                _travelmsRetried: true
            });

            return response;
        } catch {
            redirectToLogin();
            return response;
        }
    };

    function getAccessTokenPayload() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const encodedPayload = token
                .split('.')[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            return JSON.parse(atob(encodedPayload));
        } catch {
            return null;
        }
    }

    /**
     * Masque les éléments ayant data-permission si le JWT ne contient pas
     * la permission demandée. Ceci est uniquement visuel : le backend reste
     * la source d'autorisation.
     */
    function updateAuthorizationUi() {
        const payload = getAccessTokenPayload();
        const permissions = payload?.permissions || [];
        const roles = payload?.roles || [];

        document.querySelectorAll('[data-permission]').forEach(element => {
            const permission = element.dataset.permission;
            element.classList.toggle(
                'hidden',
                !permissions.includes(permission)
            );
        });

        document.querySelectorAll('[data-role]').forEach(element => {
            const role = element.dataset.role;
            element.classList.toggle(
                'hidden',
                !roles.includes(role)
            );
        });
    }

    window.TravelAuth = Object.freeze({
        getAccessTokenPayload,
        updateAuthorizationUi,
        redirectToLogin
    });

    document.addEventListener('DOMContentLoaded', updateAuthorizationUi);
})();
