const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const subtitles = require('./gestdown');
const manifest = require("./manifest.json");
const languages = require('./languages.json');
const sub2vtt = require('sub2vtt');

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
    res.setHeader('Content-Type', 'application/json');

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
// Endpoint to serve languages.json for the frontend
app.get('/languages.json', (_, res) => {
    res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
    res.setHeader('Content-Type', 'application/json');
    res.send(languages);
    res.end();
});

// Custom endpoint to proxy and convert subtitles to VTT using sub2vtt, mirroring stremio-opensubtitles-main approach
app.get('/sub.vtt', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
        let url, proxyConfig;
        if (req?.query?.from) {
            url = req.query.from;
        } else {
            res.status(400).send('Missing subtitle URL');
            return;
        }
        if (req?.query?.proxy) {
            proxyConfig = JSON.parse(Buffer.from(req.query.proxy, 'base64').toString('utf8'));
        }

        // Utiliser sub2vtt pour convertir les sous-titres en VTT
        let sub = new sub2vtt(url, proxyConfig ? { proxy: proxyConfig } : {});
        let file = await sub.getSubtitle();
        if (!file?.subtitle) {
            console.error('Erreur lors de la conversion des sous-titres avec sub2vtt.');
            res.status(500).send('Error converting subtitle with sub2vtt');
            return;
        }
        res.setHeader('Content-Type', 'text/vtt; charset=UTF-8');
        res.send(file.subtitle);
    } catch (error) {
        console.error(`Erreur lors du traitement des sous-titres :`, error.message);
        res.status(500).send('Error fetching or converting subtitle');
    }
});

module.exports = app