const axios = require('axios');
const API_URL = 'https://api.gestdown.info';

/**
 * Effectue une recherche de série sur Gestdown avec une gestion des erreurs et des retries pour la limite de taux.
 * @param {string} query - Le nom de la série à rechercher.
 * @param {number} retries - Nombre de tentatives restantes en cas de limite de taux (429).
 * @returns {Promise<string|null>} L'ID unique de la série ou null si non trouvé ou en cas d'erreur.
 */
async function searchShow(query, retries = 3) {
    try {
        const searchUrl = `${API_URL}/shows/search/${encodeURIComponent(query)}`;
        if (query.length < 3) {
            console.log(`Requête trop courte: ${query}. Minimum 3 caractères requis.`);
            return null;
        }
        console.log(`Recherche de série sur Gestdown avec la requête: ${query}`);
        console.log(`URL de recherche générée: ${searchUrl}`);
        const response = await axios.get(searchUrl, {
            headers: { 'accept': 'application/json' },
            timeout: 10000 // Timeout de 10 secondes pour éviter les attentes interminables
        });
        console.log(`Réponse de l'API Gestdown - Statut: ${response.status}, Données: ${JSON.stringify(response.data).substring(0, 200)}...`);
        // Logique pour choisir le bon show si plusieurs résultats
        if (response.data && response.data.shows && response.data.shows.length > 0) {
            console.log(`Série trouvée: ${response.data.shows[0].name} (ID: ${response.data.shows[0].id})`);
            return response.data.shows[0].id;
        } else {
            console.log(`Aucune série trouvée pour la requête: ${cleanedQuery}`);
            // Essayer une recherche alternative avec une version raccourcie ou modifiée si possible
            const words = cleanedQuery.split(' ');
            if (words.length > 1) {
                const shorterQuery = words.slice(0, words.length - 1).join(' ');
                console.log(`Tentative avec une requête plus courte: ${shorterQuery}`);
                return await searchShow(shorterQuery, retries);
            }
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la recherche de la série:', error.message);
        if (error.response && error.response.status === 429 && retries > 0) {
            const waitTime = Math.pow(2, 3 - retries) * 1000; // Backoff exponentiel: 1s, 2s, 4s
            console.log(`Limite de taux (429) atteinte lors de la recherche. Attente de ${waitTime/1000} secondes avant une nouvelle tentative (${retries} restantes).`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return searchShow(query, retries - 1);
        }
        return null;
    }
}

/**
 * Récupère une série sur Gestdown par son ID TVDB.
 * @param {string} tvdbId - L'ID TVDB de la série.
 * @param {number} retries - Nombre de tentatives restantes en cas de limite de taux (429).
 * @returns {Promise<string|null>} L'ID unique de la série ou null si non trouvé ou en cas d'erreur.
 */
async function getShowByTvdbId(tvdbId, retries = 3) {
    try {
        const response = await axios.get(`${API_URL}/shows/external/tvdb/${tvdbId}`, {
            headers: { 'accept': 'application/json' },
            timeout: 10000
        });
        if (response.data && response.data.uniqueId) {
            console.log(`Série trouvée par TVDB ID: ${tvdbId} (Gestdown ID: ${response.data.uniqueId})`);
            return response.data.uniqueId;
        } else {
            console.log(`Aucune série trouvée pour TVDB ID: ${tvdbId}`);
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la série par TVDB ID:', error.message);
        if (error.response && error.response.status === 429 && retries > 0) {
            const waitTime = Math.pow(2, 3 - retries) * 1000;
            console.log(`Limite de taux (429) atteinte pour TVDB ID. Attente de ${waitTime/1000} secondes avant une nouvelle tentative (${retries} restantes).`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return getShowByTvdbId(tvdbId, retries - 1);
        }
        return null;
    }
}

/**
 * Récupère les sous-titres pour un épisode spécifique d'une série sur Gestdown.
 * @param {string} showUniqueId - L'ID unique de la série sur Gestdown.
 * @param {string} season - Numéro de la saison.
 * @param {string} episode - Numéro de l'épisode.
 * @param {string} language - Code de la langue des sous-titres.
 * @param {number} retries - Nombre de tentatives restantes en cas de limite de taux (429).
 * @returns {Promise<Array>} Liste des sous-titres disponibles ou tableau vide en cas d'erreur ou si non trouvé.
 */
async function getSubtitles(showUniqueId, season, episode, language, retries = 3) {
    try {
        // Normaliser le code de langue pour correspondre aux attentes de Gestdown (par exemple, "french" -> "fr")
        const normalizedLang = language.toLowerCase().startsWith('fr') ? 'fr' : language;
        console.log(`Recherche de sous-titres pour ${showUniqueId} S${season}E${episode} en langue normalisée: ${normalizedLang}`);
        const url = `${API_URL}/subtitles/get/${showUniqueId}/${season}/${episode}/${normalizedLang}`;
        console.log(`URL de recherche de sous-titres: ${url}`);
        const response = await axios.get(url, {
            headers: { 'accept': 'application/json' },
            timeout: 10000
        });
        console.log(`Réponse de l'API Gestdown pour sous-titres - Statut: ${response.status}, Données: ${JSON.stringify(response.data).substring(0, 200)}...`);
        if (response.data && response.data.matchingSubtitles && Array.isArray(response.data.matchingSubtitles)) {
            console.log(`Sous-titres récupérés pour ${showUniqueId} S${season}E${episode} en ${normalizedLang}: ${response.data.matchingSubtitles.length} résultats`);
            return response.data.matchingSubtitles;
        } else {
            console.log(`Aucun sous-titre trouvé ou format de réponse inattendu pour ${showUniqueId} S${season}E${episode} en ${normalizedLang}`);
            return [];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des sous-titres:', error.message);
        if (error.response) {
            if (error.response.status === 404) {
                console.log(`Aucun sous-titre trouvé pour ${showUniqueId} S${season}E${episode} en ${language} (404)`);
                return [];
            } else if (error.response.status === 429 && retries > 0) {
                const waitTime = Math.pow(2, 3 - retries) * 1000;
                console.log(`Limite de taux (429) atteinte pour les sous-titres. Attente de ${waitTime/1000} secondes avant une nouvelle tentative (${retries} restantes).`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return getSubtitles(showUniqueId, season, episode, language, retries - 1);
            } else if (error.response.status === 423) {
                console.log(`Rafraîchissement nécessaire (423) pour ${showUniqueId} S${season}E${episode}, veuillez réessayer plus tard.`);
                return [];
            }
        }
        return [];
    }
}

module.exports = { searchShow, getShowByTvdbId, getSubtitles };