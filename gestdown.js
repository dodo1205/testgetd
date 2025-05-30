const tmdb = require('./tmdb');
const gestdownApi = require('./lib/gestdownApi');
const config = require('./config');
const languages = require('./languages.json');
const NodeCache = require("node-cache");
const Cache = new NodeCache();
const MetaCache = new NodeCache();
const subtitlesCache = new NodeCache();

async function subtitles(type, imdbid, lang) {
    let [id, season, episode] = imdbid.split(':');
    console.log(`Requête pour ID: ${id}, Saison: ${season}, Épisode: ${episode}, Langue: ${lang}`);
    let meta = MetaCache.get(id);
    if (!meta) {
        try {
            meta = await tmdb(type, id);
            if (meta) {
                MetaCache.set(id, meta, 86400); // Cache pour 24 heures
                console.log(`Métadonnées récupérées et mises en cache pour ID: ${id}`);
            } else {
                console.log(`Aucune métadonnée trouvée pour ID: ${id}`);
                return [];
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération des métadonnées pour ID: ${id}`, error);
            return [];
        }
    }

    console.log(`Titre: ${meta.title}, Saison: ${season}, Épisode: ${episode}`);
    const cachID = `${id}_${season}_${episode}_${lang}`;
    let cached = Cache.get(cachID);
    if (cached) {
        console.log(`Résultat en cache pour ${cachID}`);
        return cached;
    } else {
        const subtitlescachID = `${id}_${season}_${episode}`;
        let subtitlesList = subtitlesCache.get(subtitlescachID);
        if (!subtitlesList) {
            let showId = null;
            try {
                // Essayer de récupérer l'ID de la série par recherche de titre
                showId = await gestdownApi.searchShow(meta.title);
                if (!showId) {
                    console.log(`Série non trouvée sur Gestdown: ${meta.title}`);
                    return [];
                }
                console.log(`ID de série Gestdown trouvé: ${showId} pour ${meta.title}`);
                subtitlesList = await gestdownApi.getSubtitles(showId, season, episode, lang);
                if (subtitlesList && subtitlesList.length > 0) {
                    subtitlesCache.set(subtitlescachID, subtitlesList, 3600); // Cache pour 1 heure
                    console.log(`Sous-titres récupérés et mis en cache pour ${subtitlescachID}`);
                } else {
                    console.log(`Aucun sous-titre trouvé pour ${meta.title} S${season}E${episode} en ${lang}`);
                    subtitlesList = [];
                }
            } catch (error) {
                console.error(`Erreur lors de la récupération des sous-titres pour ${meta.title}`, error);
                return [];
            }
        }

        let subs = [];
        if (subtitlesList.length > 0) {
            for (let i = 0; i < subtitlesList.length; i++) {
                let subInfo = subtitlesList[i];
                let subtitleId = subInfo.subtitleId;
                // Use a custom local endpoint to serve subtitles as VTT with explicit UTF-8 encoding
                let proxyUrl = `${config.local}/subtitles/vtt/${subtitleId}.vtt`;
                subs.push({
                    lang: languages[lang].iso || languages[lang].id || lang,
                    id: `${cachID}_${i}`,
                    url: proxyUrl,
                });
            }
            console.log(`Sous-titres formatés pour Stremio:`, subs);
            console.log("Clés de cache actuelles:", Cache.keys());
            if (subs.length > 0) {
                Cache.set(cachID, subs, 3600); // Cache pour 1 heure
                console.log(`Résultat mis en cache pour ${cachID}`);
            }
            return subs;
        } else {
            console.log(`Retour d'une liste vide de sous-titres pour ${cachID}`);
            return [];
        }
    }
}

module.exports = subtitles;