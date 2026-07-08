import {readFile} from "node:fs/promises";

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const services = await readJson("portal/geobasis-nrw/resources/services.json");
const config = await readJson("portal/geobasis-nrw/config.json");
const styles = await readJson("portal/geobasis-nrw/resources/style.json");

const fail = message => {
    console.error(`ERROR: ${message}`);
    process.exitCode = 1;
};

const ids = services.map(service => service.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) fail(`duplicate service ids: ${[...new Set(duplicateIds)].join(", ")}`);

const referencedIds = [];
const walk = nodes => {
    for (const node of nodes ?? []) {
        if (node.id) referencedIds.push(node.id);
        if (node.children) walk(node.children);
    }
};
walk(config.layerConfig?.baselayer);
walk(config.layerConfig?.subjectlayer);

for (const id of referencedIds) {
    if (!ids.includes(id)) fail(`layerConfig references missing service id: ${id}`);
}

const styleIds = new Set(styles.map(style => style.styleId));
for (const service of services.filter(service => service.styleId)) {
    if (!styleIds.has(service.styleId)) fail(`${service.id} references missing styleId ${service.styleId}`);
}

const expectedBases = new Set([
    "https://ogc-api.nrw.de/lika/v1",
    "https://ogc-api.nrw.de/gebref/v1",
    "https://ogc-api.nrw.de/tfis/v1"
]);
const oafServices = services.filter(service => service.typ === "OAF");
if (oafServices.length !== 22) fail(`expected 22 GeoJSON-compatible OAF collection layers, found ${oafServices.length}`);
for (const base of expectedBases) {
    if (!oafServices.some(service => service.url === base)) fail(`missing OAF family ${base}`);
}

const tileTypes = new Set(services.map(service => service.typ));
for (const required of ["WMS", "VectorTile", "TileSet3D", "OAF"]) {
    if (!tileTypes.has(required)) fail(`missing service type ${required}`);
}

if (!process.exitCode) {
    console.log(`Configuration valid: ${services.length} services, ${oafServices.length} OAF collections.`);
}
