// Script pour gérer la configuration et l'installation de l'addon Gestdown Subtitles
document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('language');
    const saveConfigButton = document.getElementById('saveConfig');
    const installAddonButton = document.getElementById('installAddon');

    // Charger la configuration sauvegardée s'il y en a une
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        languageSelect.value = savedLanguage;
    }

    // Gérer le clic sur le bouton de sauvegarde
    saveConfigButton.addEventListener('click', function() {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem('preferredLanguage', selectedLanguage);
        alert(`Configuration sauvegardée ! Langue préférée définie sur : ${languageSelect.options[languageSelect.selectedIndex].text}`);
        console.log(`Langue sélectionnée : ${selectedLanguage}`);
        // Appliquer la configuration à l'addon via une requête au serveur si possible
        fetch('/configure/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ language: selectedLanguage }),
        })
        .then(response => response.json())
        .then(data => console.log('Configuration sauvegardée côté serveur:', data))
        .catch(error => console.error('Erreur lors de la sauvegarde côté serveur:', error));
    });

    // Gérer le clic sur le bouton d'installation de l'addon
    installAddonButton.addEventListener('click', function() {
        const manifestUrl = window.location.origin + '/manifest.json';
        const installUrl = `stremio://subscribe/${encodeURIComponent(manifestUrl)}`;
        console.log(`Tentative d'installation de l'addon avec l'URL : ${installUrl}`);
        window.location.href = installUrl;
        alert(`Installation de l'addon en cours... Si Stremio est installé, il devrait s'ouvrir maintenant. Sinon, assurez-vous que Stremio est installé sur votre appareil.`);
    });
});