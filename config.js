var env = process.env.NODE_ENV || 'local';

var config = {
    BaseURL: "https://api.gestdown.info",
    APIURL: 'https://api.themoviedb.org/3'
}

switch (env) {
    case 'local':
        config.port = 64395;
        config.local = "http://127.0.0.1:" + config.port;
        break;
    case 'production':
        config.port = process.env.PORT || 3000;
        config.local = process.env.APP_URL || `http://0.0.0.0:${config.port}`;
        break;
    default:
        config.port = 64395;
        config.local = "http://127.0.0.1:" + config.port;
}

module.exports = config;