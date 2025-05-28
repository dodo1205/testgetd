#!/usr/bin/env node
const app = require('./index.js')
const { serveHTTP, publishToCentral } = require("stremio-addon-sdk");
const config = require('./config.js');

// create local server
app.listen((config.port), function () {
    console.log(`Addon active on port ${config.port}`);
    console.log(`HTTP addon accessible at: ${config.local}/configure`);
});

// Publication sur le répertoire central de Stremio (optionnel, configuré via une variable d'environnement)
if (process.env.PUBLISH_URL) {
    publishToCentral(process.env.PUBLISH_URL)
        .then(() => {
            console.log(`Publication réussie sur le répertoire central de Stremio à l'adresse: ${process.env.PUBLISH_URL}`);
        })
        .catch(error => {
            console.error("Erreur lors de la publication sur le répertoire central de Stremio:", error);
        });
} else {
    console.log("Publication sur le répertoire central de Stremio désactivée. Définissez PUBLISH_URL dans l'environnement pour activer.");
}