// ============================================================
// Point Zero - API запросы (Overpass, GeoNames, Wikidata)
// ============================================================

// Поиск через Overpass API (OpenStreetMap)
async function searchOverpassAPI(lat, lon, radius, type) {
    const radiusMeters = radius * 1000;
    let query = '';

    if (type === 'military') {
        query = `
            [out:json][timeout:90];
            (
                node["building"="military"](around:${radiusMeters},${lat},${lon});
                way["building"="military"](around:${radiusMeters},${lat},${lon});
                relation["building"="military"](around:${radiusMeters},${lat},${lon});
                node["military"](around:${radiusMeters},${lat},${lon});
                way["military"](around:${radiusMeters},${lat},${lon});
                relation["military"](around:${radiusMeters},${lat},${lon});
                node["landuse"="military"](around:${radiusMeters},${lat},${lon});
                way["landuse"="military"](around:${radiusMeters},${lat},${lon});
                relation["landuse"="military"](around:${radiusMeters},${lat},${lon});
            );
            out center;
        `;
    } else if (type === 'hospital') {
        query = `
            [out:json][timeout:90];
            (
                node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
                way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
                relation["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
                node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
                way["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
                relation["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
                node["building"="hospital"](around:${radiusMeters},${lat},${lon});
                way["building"="hospital"](around:${radiusMeters},${lat},${lon});
            );
            out center;
        `;
    }

    console.log(`Searching ${type} via Overpass API...`);

    for (const server of window.Config.OVERPASS_SERVERS) {
        try {
            const response = await window.Utils.fetchWithRetry(server, {
                method: 'POST',
                body: query,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Success from server ${server}`);
                console.log(`Found ${data.elements?.length || 0} elements`);

                let count = 0;
                if (data.elements && data.elements.length > 0) {
                    data.elements.forEach(element => {
                        let coords;
                        if (element.lat && element.lon) {
                            coords = [element.lat, element.lon];
                        } else if (element.center) {
                            coords = [element.center.lat, element.center.lon];
                        }

                        if (coords) {
                            const tags = element.tags || {};
                            const name = tags.name || 'Unnamed';
                            const subtype = tags.military || tags.landuse || tags.building || tags.healthcare || tags.amenity || type;

                            window.AppState.allResults.push({
                                type: type,
                                name: name,
                                subtype: subtype,
                                coords: coords,
                                source: 'OpenStreetMap',
                                id: 'osm_' + element.id
                            });
                            count++;
                        }
                    });
                }

                return count;
            }
        } catch (error) {
            console.warn(`Server ${server} failed:`, error.message);
            continue;
        }
    }

    throw new Error('All Overpass servers unavailable');
}

// Поиск через GeoNames API
async function searchGeoNamesAPI(lat, lon, radius, type) {
    const username = document.getElementById('geonamesUsername').value.trim();

    if (!username) {
        window.Utils.addStatus('⚠️ GeoNames: Username not provided', 'error');
        return 0;
    }

    const featureCode = type === 'military' ? 'MLTY' : 'HSP';
    const url = `http://api.geonames.org/findNearbyJSON?lat=${lat}&lng=${lon}&radius=${radius}&featureCode=${featureCode}&maxRows=100&username=${username}`;

    console.log(`Searching ${type} via GeoNames API...`);
    console.log(`GeoNames URL: ${url}`);

    try {
        const response = await fetch(url);

        console.log('===== GeoNames DEBUG =====');
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Response body:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed JSON:', data);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            console.error('Raw response:', responseText);
        }

        if (response.status === 401) {
            const errorMsg = data?.status?.message || '401 Unauthorized - Account not activated or invalid username';
            console.error('GeoNames 401 Error:', errorMsg);
            console.error('Full response:', data);
            window.Utils.addStatus(`⚠️ GeoNames: ${errorMsg}`, 'error');
            return 0;
        }

        if (!response.ok) {
            const errorMsg = `GeoNames HTTP ${response.status}: ${response.statusText}`;
            console.error(errorMsg);
            window.Utils.addStatus(`❌ ${errorMsg}`, 'error');
            return 0;
        }

        if (data.geonames && data.geonames.length > 0) {
            let count = 0;
            data.geonames.forEach(place => {
                window.AppState.allResults.push({
                    type: type,
                    name: place.name || place.toponymName || 'Unnamed',
                    subtype: place.fcodeName || type,
                    coords: [parseFloat(place.lat), parseFloat(place.lng)],
                    source: 'GeoNames',
                    id: 'geonames_' + place.geonameId
                });
                count++;
            });
            return count;
        } else if (data.status) {
            console.warn('GeoNames API error:', data.status.message);
            window.Utils.addStatus(`⚠️ GeoNames: ${data.status.message}`, 'error');
            return 0;
        }
        return 0;
    } catch (error) {
        console.error('GeoNames API error:', error);
        window.Utils.addStatus(`❌ GeoNames API unavailable: ${error.message}`, 'error');
        return 0;
    }
}

// Поиск через Wikidata SPARQL API
async function searchWikidataAPI(lat, lon, radius, type) {
    const endpoint = 'https://query.wikidata.org/sparql';

    let sparqlQuery;
    if (type === 'military') {
        sparqlQuery = `
            SELECT DISTINCT ?item ?itemLabel ?coord WHERE {
                SERVICE wikibase:around {
                    ?item wdt:P625 ?coord.
                    bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral.
                    bd:serviceParam wikibase:radius "${radius}".
                    bd:serviceParam wikibase:distance ?dist.
                }
                {
                    ?item wdt:P31/wdt:P279* wd:Q245016.
                } UNION {
                    ?item wdt:P31/wdt:P279* wd:Q695793.
                } UNION {
                    ?item wdt:P31/wdt:P279* wd:Q1785071.
                } UNION {
                    ?item wdt:P31/wdt:P279* wd:Q18691599.
                } UNION {
                    ?item wdt:P31/wdt:P279* wd:Q744099.
                } UNION {
                    ?item wdt:P137 wd:Q9212.
                } UNION {
                    ?item wdt:P366 wd:Q245068.
                } UNION {
                    ?item wdt:P241 ?militaryBranch.
                } UNION {
                    ?item wdt:P127/wdt:P31 wd:Q247952.
                }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ru". }
            }
            ORDER BY ?dist
            LIMIT 200
        `;
    } else {
        sparqlQuery = `
            SELECT DISTINCT ?item ?itemLabel ?coord WHERE {
                SERVICE wikibase:around {
                    ?item wdt:P625 ?coord.
                    bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral.
                    bd:serviceParam wikibase:radius "${radius}".
                    bd:serviceParam wikibase:distance ?dist.
                }
                {
                    ?item wdt:P31 wd:Q16917.
                } UNION {
                    ?item wdt:P31 wd:Q1059324.
                } UNION {
                    ?item wdt:P31 wd:Q4260475.
                }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ru". }
            }
            ORDER BY ?dist
            LIMIT 100
        `;
    }

    console.log(`Searching ${type} via Wikidata SPARQL:`, sparqlQuery);

    try {
        const response = await fetch(endpoint + '?query=' + encodeURIComponent(sparqlQuery), {
            headers: {
                'Accept': 'application/sparql-results+json',
                'User-Agent': 'Point-Zero-OSINT/1.0'
            }
        });

        if (!response.ok) {
            const errorMsg = `Wikidata HTTP ${response.status}: ${response.statusText}`;
            console.error(errorMsg);
            window.Utils.addStatus(`❌ ${errorMsg}`, 'error');
            return 0;
        }

        const data = await response.json();
        console.log('Wikidata response:', data);

        if (data.results && data.results.bindings && data.results.bindings.length > 0) {
            let count = 0;
            data.results.bindings.forEach(binding => {
                if (binding.coord && binding.coord.value) {
                    const coordMatch = binding.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
                    if (coordMatch) {
                        const coordLon = parseFloat(coordMatch[1]);
                        const coordLat = parseFloat(coordMatch[2]);

                        window.AppState.allResults.push({
                            type: type,
                            name: binding.itemLabel?.value || 'Unnamed',
                            subtype: 'Wikidata Entity',
                            coords: [coordLat, coordLon],
                            source: 'Wikidata',
                            id: 'wikidata_' + binding.item.value.split('/').pop()
                        });
                        count++;
                    }
                }
            });
            console.log(`Wikidata returned ${count} results for ${type}`);
            return count;
        } else {
            console.warn('Wikidata: No results in response');
            return 0;
        }
    } catch (error) {
        console.error('Wikidata API error:', error);
        window.Utils.addStatus(`❌ Wikidata API error: ${error.message}`, 'error');
        return 0;
    }
}

// Экспорт
window.API = {
    searchOverpassAPI,
    searchGeoNamesAPI,
    searchWikidataAPI
};
