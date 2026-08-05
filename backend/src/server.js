const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

// Connexion à la base de données Docker
const pool = new Pool({
    host: process.env.DB_HOST || 'database',
    user: process.env.DB_USER || 'travel_user',
    password: process.env.DB_PASSWORD || 'travel_password',
    database: process.env.DB_NAME || 'travel_db',
    port: 5432,
});

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/hello' && req.method === 'GET') {
        try {
            // Requête SQL pour récupérer le message "Hello World" en BDD
            const result = await pool.query('SELECT message FROM greetings LIMIT 1');
            const dbMessage = result.rows[0]?.message || 'Hello World !';
            
            res.writeHead(200);
            res.end(JSON.stringify({ message: dbMessage }));
        } catch (err) {
            console.error('Erreur SQL :', err);
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