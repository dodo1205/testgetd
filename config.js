var env = process.env.NODE_ENV ? 'beamup':'local';

var config = {
    BaseURL: "https://api.gestdown.info",
    APIURL: 'https://api.themoviedb.org/3'
}

switch (env) {
    case 'beamup':
  config.port = process.env.PORT || 3300;
        config.local = process.env.LOCAL_URL || "https://your-custom-domain.com";
        console.log(`Mode beamup activé. URL locale: ${config.local}, Port: ${config.port}`);
        break;

    case 'local':
		config.port = 63358
        config.local = "http://127.0.0.1:" + config.port;
        break;
}

module.exports = config;