var env = 'local';

var config = {
    BaseURL: "https://api.gestdown.info",
    APIURL: 'https://api.themoviedb.org/3'
}

switch (env) {
    case 'local':
		config.port = 64395
        config.local = "http://127.0.0.1:" + config.port;
        break;
}

module.exports = config;