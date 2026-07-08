/* global URL */
// Absolute URLs are derived at runtime so the portal works below a GitHub Pages
// project path such as /owner/repository/ without hard-coded repository names.
const portalBaseUrl = new URL("./", window.location.href);

const Config = {
    portalConf: new URL("config.json", portalBaseUrl).href,
    layerConf: new URL("resources/services.json", portalBaseUrl).href,
    restConf: new URL("resources/rest-services.json", portalBaseUrl).href,
    styleConf: new URL("resources/style.json", portalBaseUrl).href,
    namedProjections: [
        ["EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs"],
        ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"]
    ],
    portalLanguage: {
        enabled: false,
        languages: {de: "Deutsch"},
        fallbackLanguage: "de"
    }
};
