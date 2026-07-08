# Masterportal – Geobasis NRW OGC APIs

Dieses Repository enthält eine Masterportal-Konfiguration und einen GitHub-Actions-Workflow für ein Deployment über GitHub Pages. Stand der eingebundenen Geobasis-NRW-APIs: **8. Juli 2026**.

## Enthaltene Dienste

Die Konfiguration bindet die derzeit veröffentlichten Geobasis-NRW-API-Familien ein:

- Liegenschaftskataster: 7 OGC-API-Features-Collections und ein aggregierter Vector-Tile-Layer
- Gebäudereferenzen: 1 OGC-API-Features-Collection und ein Vector-Tile-Layer
- TFIS NRW: 14 OGC-API-Features-Collections und ein aggregierter Vector-Tile-Layer
- Gebäude LoD2: ein 3D-Tiles-Layer aus der OGC API

Damit sind **22 GeoJSON-kompatible OGC-API-Features-Collections** konfiguriert. Für die normale, landesweite Darstellung sollten die Tile-Layer verwendet werden; die OAF-Layer sind vor allem für Abfragen in kleineren Kartenausschnitten gedacht.

## Repository-Struktur

```text
.github/workflows/pages.yml          Build und GitHub-Pages-Deployment
portal/geobasis-nrw/config.js        Masterportal-Pfade und Projektionen
portal/geobasis-nrw/config.json      Portal-, Karten- und Themenbaumkonfiguration
portal/geobasis-nrw/resources/       Dienste, REST-Konfiguration und lokaler OAF-Stil
scripts/validate-config.mjs          Strukturelle Prüfung der Konfiguration
scripts/check-endpoints.mjs          Optionaler Live-Test zentraler Endpunkte
```

## GitHub Pages aktivieren

1. Repository auf GitHub anlegen und diesen Inhalt auf den Branch `main` pushen.
2. Unter **Settings → Pages → Build and deployment** als Quelle **GitHub Actions** auswählen.
3. Den Workflow **Build and deploy Masterportal to GitHub Pages** ausführen oder erneut auf `main` pushen.

Der Workflow klont Masterportal, kopiert die Portal-Konfiguration über das Basic-Portal, baut `dist/` und deployt das Ergebnis. Die Portal-URLs werden zur Laufzeit relativ zur GitHub-Pages-Projekt-URL erzeugt; ein fest codierter Repository-Name ist nicht nötig.

## Masterportal-Version

In `.github/workflows/pages.yml` ist Masterportal auf `v3.23.0` festgelegt:

```yaml
MASTERPORTAL_REF: v3.23.0
```

Für reproduzierbare Deployments sollte eine geprüfte Release-Version verwendet werden. Bei einem Versionswechsel zuerst lokal beziehungsweise in einem Test-Branch bauen, da sich Konfigurationsschemata ändern können.

## Lokale Prüfungen

Voraussetzung: Node.js 22 oder neuer.

```bash
npm run validate
npm run check:endpoints
```

`check:endpoints` benötigt Internetzugriff und kann bei temporären Störungen der externen Dienste fehlschlagen. Der Deployment-Workflow führt deshalb nur die strukturelle Validierung zwingend aus.

## Wichtige Hinweise

- Die OAF-Layer fordern für die Portaldarstellung EPSG:3857 an. Beim Liegenschaftskataster sind amtliche Koordinaten in EPSG:25832 maßgeblich; serverseitig transformierte Koordinaten sind nur für die Darstellung vorgesehen.
- Die LoD2-API liefert Features als CityGML, CityJSON, CityJSON-Seq oder glTF, nicht als GeoJSON. Da der Masterportal-OAF-Layer GeoJSON erwartet, wird diese API über ihren 3D-Tiles-Endpunkt eingebunden. Der Layer ist erst nach dem Wechsel in den 3D-Modus sinnvoll nutzbar.
- `limit: 5000` begrenzt einzelne OAF-Abfragen. Sehr große Ausschnitte sollten vermieden werden.
- Der mitgelieferte lokale Stil ist bewusst generisch. Die Vector-Tile-Layer verwenden die von Geobasis NRW angebotenen Mapbox-Stile.
- Die MIT-Lizenz dieses Repositorys gilt nur für den Repository-Code. Daten, Kartenstile und Dienste unterliegen den jeweiligen Nutzungsbedingungen der Anbieter. Quellenhinweise im Portal dürfen nicht entfernt werden.

## Aktualisieren der Collections

Neue Collections werden in `portal/geobasis-nrw/resources/services.json` ergänzt und anschließend im Themenbaum von `config.json` referenziert. Der Validator erwartet aktuell 22 OAF-Layer; diese Zahl muss bei Änderungen ebenfalls in `scripts/validate-config.mjs` angepasst werden.
