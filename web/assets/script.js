// Script pour gérer la configuration de l'addon Gestdown Subtitles
document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('language');
    const saveConfigButton = document.getElementById('saveConfig');

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
        
        // Appliquer la configuration à l'addon (peut nécessiter une API ou un endpoint pour sauvegarder côté serveur)
        console.log(`Langue sélectionnée : ${selectedLanguage}`);
        // Si un endpoint API est disponible pour sauvegarder la config, l'appeler ici
        // Exemple : fetch('/saveConfig', { method: 'POST', body: JSON.stringify({ language: selectedLanguage }) });
    });
});