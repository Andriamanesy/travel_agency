const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const destinationsRouter = require('./routes/destinations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les uploads statiques
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Monter les routes API
app.use('/api', destinationsRouter);

app.get('/', (req, res) => res.json({ status: 'API TravelMS (Express) en ligne' }));

app.use((err, req, res, next) => {
    console.error('[Express Error]', err.stack || err.message || err);
    res.status(err.status || 500).json({ error: err.message || 'Erreur interne' });
});

app.listen(PORT, () => console.log(`Express server démarré sur ${PORT}`));
