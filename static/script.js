document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('configForm');
    const messageDiv = document.getElementById('message');
    const installButton = document.getElementById('installButton');
    const installMessageDiv = document.getElementById('installMessage');
    const languageSelect = document.getElementById('language');

    // Variable to store languages fetched from the server
    let languages = {};

    // Function to fetch languages from the server
    async function fetchLanguages() {
        try {
            const response = await fetch('/languages.json');
            if (!response.ok) {
                throw new Error('Failed to fetch languages');
            }
            languages = await response.json();
            populateLanguages();
        } catch (error) {
            console.error('Error fetching languages:', error);
            messageDiv.textContent = 'Error loading languages. Please refresh the page.';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
    }

    // Populate the language dropdown
    function populateLanguages() {
        Object.keys(languages).forEach(langKey => {
            const lang = languages[langKey];
            const option = document.createElement('option');
            option.value = lang.id;
            option.textContent = lang.name;
            languageSelect.appendChild(option);
        });
        // Set default language to French
        languageSelect.value = 'french';
    }

    // Load languages on page load
    fetchLanguages();

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const language = document.getElementById('language').value;
        
        // Simulate saving configuration by sending a request to the backend
        // In a real scenario, this would interact with an API endpoint
        try {
            // For demonstration, we'll just show a success message
            // Replace this with actual API call to save configuration
            console.log('Saving configuration for language:', language);
            
            // Display success message
            messageDiv.textContent = `Configuration saved successfully for language: ${languages[language].name}`;
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            
            // Here you would send the configuration to the backend
            // Example: fetch('/saveConfig', { method: 'POST', body: JSON.stringify({ language }) })
        } catch (error) {
            console.error('Error saving configuration:', error);
            messageDiv.textContent = 'Error saving configuration. Please try again.';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
    });

    // Handle Install Addon button
    installButton.addEventListener('click', function() {
        // Generate Stremio addon install link based on the current host and selected language
        const host = window.location.host; // e.g., 127.0.0.1:64395 (without protocol)
        const language = document.getElementById('language').value;
        const stremioLink = `stremio://${host}/${language}/manifest.json`;
        const httpLink = `${window.location.protocol}//${host}/${language}/manifest.json`;
        console.log('Generating install links:', { stremioLink, httpLink });
        
        // Show the install options
        const installOptions = document.getElementById('installOptions');
        installOptions.style.display = 'block';
        installMessageDiv.style.display = 'none'; // Hide any previous install message
        
        // Handle Open in Stremio
        document.getElementById('openStremio').onclick = function() {
            window.location.href = stremioLink;
            installMessageDiv.textContent = 'Opening Stremio to install the addon. If Stremio does not open, ensure it is installed.';
            installMessageDiv.className = 'message success';
            installMessageDiv.style.display = 'block';
            installOptions.style.display = 'none';
        };
        
        // Handle Copy Link
        document.getElementById('copyLink').onclick = function() {
            navigator.clipboard.writeText(httpLink).then(() => {
                document.getElementById('copyMessage').style.display = 'block';
                installMessageDiv.textContent = 'Link copied to clipboard! Paste it into Stremio\'s "Add Addon" feature.';
                installMessageDiv.className = 'message success';
                installMessageDiv.style.display = 'block';
            }, () => {
                installMessageDiv.textContent = 'Failed to copy link. Please manually copy it from the console or refresh the page.';
                installMessageDiv.className = 'message error';
                installMessageDiv.style.display = 'block';
            });
            installOptions.style.display = 'none';
        };
    });
});