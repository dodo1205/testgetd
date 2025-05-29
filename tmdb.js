const axios = require('axios').default;
var slugify = require('slugify');
const BaseURL = require('./config').APIURL;
require('dotenv').config();

async function request(url, header) {

    return await axios
        .get(url, header, { timeout: 5000 })
        .then(res => {
            return res;
        })
        .catch(error => {
            if (error.response) {
                console.error('error on tmdb.js request:', error.response.status, error.response.statusText, error.config.url);
            } else {
                console.error(error);
            }
        });

}
async function getMeta(type, id) {
    if (!process.env.TMDB_API) {
        console.error("Erreur: La clé API TMDB n'est pas définie. Définissez TMDB_API dans votre environnement.");
        return { title: id, slug: id }; // Retourner une valeur par défaut pour éviter les erreurs en aval
    }

    if (type == "movie") {
        let url = `${BaseURL}/movie/${id}?api_key=${process.env.TMDB_API}`;
        let res = await request(url);
        if (!res || !res.data) {
            console.error(`Aucune donnée reçue de TMDB pour le film ID: ${id}`);
            return { title: id, slug: id };
        }
        let title = res.data.original_title?.match(/[\u3400-\u9FBF]/) ? res.data.title : res.data.original_title;
        if (!title) {
            console.error(`Titre non trouvé pour le film ID: ${id}`);
            return { title: id, slug: id };
        }
        var slug = slugify(title, { replacement: '-', remove: undefined, lower: true, strict: true, trim: true });
        return { title: title, slug: slug };
    } else if (type == "series") {
        let url = `${BaseURL}/find/${id}?api_key=${process.env.TMDB_API}&external_source=imdb_id`;
        let res = await request(url);
        if (!res || !res.data || !res.data.tv_results || res.data.tv_results.length === 0) {
            console.error(`Aucune donnée ou série trouvée sur TMDB pour ID: ${id}`);
            return { title: id, slug: id };
        }
        let title = res.data.tv_results[0].original_name?.match(/[\u3400-\u9FBF]/) ? res.data.tv_results[0].name : res.data.tv_results[0].original_name;
        if (!title) {
            console.error(`Titre non trouvé pour la série ID: ${id}`);
            return { title: id, slug: id };
        }
        var slug = slugify(title, { replacement: '-', remove: undefined, lower: true, strict: true, trim: true });
        return { title: title, slug: slug };
    }
    return { title: id, slug: id }; // Valeur par défaut si type non reconnu
}


//getMeta("series", 'tt0903747').then(meta => (console.log(meta)))
module.exports = getMeta;