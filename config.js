var env = process.env.NODE_ENV || 'local';

var config = {
    BaseURL: "https://api.gestdown.info",
    APIURL: 'https://api.themoviedb.org/3'
}

switch (env) {
    case 'local':
        config.port = 64395;
        config.local = "http://127.0.0.1:" + config.port;
        console.log(`Mode local activé. URL de configuration: ${config.local}, Port: ${config.port}`);
        break;
    case 'production':
        config.port = process.env.PORT || 3951;
        config.local = process.env.HOST_NAME;
        console.log(`Mode production activé. URL de configuration: ${config.local}, Port: ${config.port}`);
        break;
}

module.exports = config;