const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // En-têtes pour autoriser le JSON et le CORS si besoin
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Route /api/health
    if (req.url === '/api/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'OK', message: 'Backend Node.js natif est en ligne !' }));
    } 
    // Route /api/hello
    else if (req.url === '/api/hello' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Hello World depuis le Backend ! 🚀' }));
    } 
    // Route non trouvée
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route introuvable' }));
    }
});

server.listen(PORT, () => {
    console.log(`Serveur Backend à l'écoute sur le port ${PORT}`);
});