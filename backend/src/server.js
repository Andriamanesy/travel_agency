const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

// Configuration du pool PostgreSQL avec sécurités réseau
const pool = new Pool({
    host: process.env.DB_HOST || 'database',
    user: process.env.DB_USER || 'travel_user',
    password: process.env.DB_PASSWORD || 'travel_password',
    database: process.env.DB_NAME || 'travel_db',
    port: 5432,
    
    // --- BONS RÉGLAGES DE SÉCURITÉ ---
    connectionTimeoutMillis: 3000, // Abandonne si la BDD ne répond pas en 3s (évite 502/Timeout)
    idleTimeoutMillis: 30000,      // Libère les connexions inactives après 30s
    max: 10,                       // Limite le nombre de connexions simultanées
});

// Évite le crash du process Node.js si PostgreSQL redémarre soudainement
pool.on('error', (err) => {
    console.error('Erreur inattendue sur le pool PostgreSQL :', err.message);
});

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    // Route de Healthcheck (utilisée par Docker / Reverse Proxy)
    if (req.url === '/api/health' && req.method === 'GET') {
        res.writeHead(200);
        return res.end(JSON.stringify({ status: 'UP', timestamp: new Date() }));
    }

    // Route principale
    if (req.url === '/api/hello' && req.method === 'GET') {
        try {
            const result = await pool.query('SELECT message FROM greetings LIMIT 1');
            const dbMessage = result.rows[0]?.message || 'Hello World !';
            
            res.writeHead(200);
            res.end(JSON.stringify({ message: dbMessage }));
        } catch (err) {
            console.error('Erreur SQL :', err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Erreur de connexion à la base de données' }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route non trouvée' }));
    }
});

server.listen(PORT, () => {
    console.log(`Backend démarré sur le port ${PORT}`);
});

// Arrêt propre (Graceful Shutdown) lors d'un `docker stop` ou `docker compose down`
const shutdown = (signal) => {
    console.log(`Signal ${signal} reçu : fermeture propre du serveur...`);
    server.close(async () => {
        await pool.end();
        console.log('Pool PostgreSQL fermé. Arrêt terminé.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));