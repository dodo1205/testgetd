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
app.get('/subtitles.vtt', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
        let url;
        if (req?.query?.from) {
            url = req.query.from;
        } else {
            res.status(400).send('Missing subtitle URL');
            return;
        }
        // Configure proxy options exactly as in stremio-opensubtitles-main
        let proxy;
        if (req?.query?.proxy) {
            proxy = JSON.parse(Buffer.from(req.query.proxy, 'base64').toString());
        } else {
            proxy = {
                BaseURL: "https://api.gestdown.info",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
            };
        }
        let generated = sub2vtt.gerenateUrl(url, { referer: "https://api.gestdown.info" });
        let sub = new sub2vtt(url, { proxy: proxy });
        let file = await sub.getSubtitle();
        if (!file?.subtitle) {
            res.status(500).send('Error converting subtitle');
            return;
        }
        res.setHeader('Content-Type', 'text/vtt; charset=UTF-8');
        res.send(file.subtitle);
    } catch (error) {
        console.error(`Error processing subtitle:`, error.message);
        res.status(500).send('Error fetching or converting subtitle');
    }
});

module.exports = app