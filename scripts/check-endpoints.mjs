import {readFile} from "node:fs/promises";

const services = JSON.parse(
    await readFile("portal/geobasis-nrw/resources/services.json", "utf8")
);

const oafFamilies = [
    "https://ogc-api.nrw.de/lika/v1",
    "https://ogc-api.nrw.de/gebref/v1",
    "https://ogc-api.nrw.de/tfis/v1"
];

let failed = false;
const requestJson = async url => {
    const response = await fetch(url, {headers: {accept: "application/json"}});
    console.log(`${response.status} ${url}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
};

for (const baseUrl of oafFamilies) {
    try {
        const document = await requestJson(`${baseUrl}/collections?f=json`);
        const advertised = new Set(document.collections.map(collection => collection.id));
        const configured = new Set(
            services
                .filter(service => service.typ === "OAF" && service.url === baseUrl)
                .map(service => service.collection)
        );

        for (const collection of advertised) {
            if (!configured.has(collection)) {
                failed = true;
                console.error(`MISSING ${baseUrl}/collections/${collection}`);
            }
        }
        for (const collection of configured) {
            if (!advertised.has(collection)) {
                failed = true;
                console.error(`STALE ${baseUrl}/collections/${collection}`);
            }
        }
    }
    catch (error) {
        failed = true;
        console.error(`FAILED ${baseUrl}: ${error.message}`);
    }
}

const standaloneEndpoints = [
    "https://ogc-api.nrw.de/3dg/v1/collections?f=json",
    "https://ogc-api.nrw.de/lika/v1/styles/lika-farbe-basis?f=mbs",
    "https://ogc-api.nrw.de/gebref/v1/styles/gebref?f=mbs",
    "https://ogc-api.nrw.de/tfis/v1/styles/tfis_basis?f=mbs",
    "https://ogc-api.nrw.de/3dg/v1/collections/building/3dtiles/tileset.json"
];

for (const url of standaloneEndpoints) {
    try {
        await requestJson(url);
    }
    catch (error) {
        failed = true;
        console.error(`FAILED ${url}: ${error.message}`);
    }
}

if (failed) process.exitCode = 1;
