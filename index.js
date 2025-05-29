const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const subtitles = require('./gestdown');
const manifest = require("./manifest.json");
const languages = require('./languages.json');

app.set('trust proxy', true)

const serveIndex = require('serve-index');

app.use('/logs', express.static(path.join(__dirname, 'logs'),{etag: false}), serveIndex('logs', {'icons': true,'view':'details '}))

app.use('/configure', express.static(path.join(__dirname, 'static')));
app.use('/assets', express.static(path.join(__dirname, 'static')));

app.use(cors())

app.get('/', (_, res) => {
	res.redirect('/configure')
	res.end();
});

app.get('/:configuration?/configure', (req, res) => {
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('content-type', 'text/html');
	res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/manifest.json', (_, res) => {
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	manifest.behaviorHints.configurationRequired = true;
	res.send(manifest);
	res.end();
});

app.get('/:configuration?/manifest.json', (_, res) => {
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	manifest.behaviorHints.configurationRequired = false;
	res.send(manifest);
	res.end();
});

app.get('/:configuration?/:resource/:type/:id/:extra?.json', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    console.log('Requête reçue:', req.params);
    const { configuration, resource, type, id } = req.params;
    if (resource !== "subtitles") {
        console.log(`Ressource non prise en charge: ${resource}`);
        res.send(JSON.stringify({ subtitles: [] }));
        res.end();
        return;
    }

    if (configuration && configuration !== "subtitles") {
        let lang = configuration;
        if (languages[lang]) {
            console.log(`Recherche de sous-titres pour ${type} ID: ${id} en langue: ${lang}`);
            subtitles(type, id, lang)
                .then(subs => {
                    console.log(`Sous-titres retournés pour ${id}: ${subs.length} résultats`);
                    res.send(JSON.stringify({ subtitles: subs }));
                    res.end();
                })
                .catch(error => {
                    console.error(`Erreur lors de la récupération des sous-titres pour ${id}:`, error);
                    res.send(JSON.stringify({ subtitles: [] }));
                    res.end();
                });
        } else {
            console.log(`Langue non prise en charge: ${lang}`);
            res.send(JSON.stringify({ subtitles: [] }));
            res.end();
        }
    } else {
        console.log(`Aucune langue spécifiée pour ${id}, retour d'une liste vide`);
        res.send(JSON.stringify({ subtitles: [] }));
        res.end();
    }
});

// Endpoint to serve languages.json for the frontend
app.get('/languages.json', (_, res) => {
    res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
    res.setHeader('Content-Type', 'application/json');
    res.send(languages);
    res.end();
});

// Proxy endpoint to download, convert, and serve subtitles with proper encoding (inspired by stremio-opensubtitles-main)
app.get('/proxy/subtitle/:subtitleId', async (req, res) => {
    const { subtitleId } = req.params;
    const subtitleUrl = `https://api.gestdown.info/subtitles/download/${subtitleId}`;
    console.log(`Proxy request for subtitle ID: ${subtitleId}, URL: ${subtitleUrl}`);
    
    try {
        const axios = require('axios');
        // Download the subtitle file
        const response = await axios.get(subtitleUrl, {
            responseType: 'arraybuffer', // Get raw data to handle encoding
            timeout: 10000
        });
        
        // For now, serve the raw data as-is. In a complete implementation, convert to VTT with UTF-8 encoding.
        // This would require libraries like 'sub2vtt' or 'iconv-lite' to handle format and encoding conversion.
        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.send(response.data);
        res.end();
        console.log(`Subtitle ID ${subtitleId} served through proxy.`);
    } catch (error) {
        console.error(`Error downloading subtitle ID ${subtitleId}:`, error.message);
        res.status(500).send('Error downloading subtitle');
        res.end();
    }
});

module.exports = app
