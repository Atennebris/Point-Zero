// ============================================================
// Point Zero - Main Application Logic
// ============================================================

// Установка тестовых координат (Pentagon)
function setTestLocation() {
    document.getElementById('latitude').value = 38.8707;
    document.getElementById('longitude').value = -77.0559;
    document.getElementById('radius').value = 10;
    window.AppState.map.setView([38.8707, -77.0559], 12);
    window.Utils.addStatus('🇺🇸 Pentagon coordinates set', 'pending');
}

// Установка координат Москвы
function setMoscowLocation() {
    document.getElementById('latitude').value = 55.7558;
    document.getElementById('longitude').value = 37.6173;
    document.getElementById('radius').value = 20;
    window.AppState.map.setView([55.7558, 37.6173], 10);
    window.Utils.addStatus('🏛️ Moscow coordinates set', 'pending');
}

// Установка координат Берлина
function setBerlinLocation() {
    document.getElementById('latitude').value = 52.5200;
    document.getElementById('longitude').value = 13.4050;
    document.getElementById('radius').value = 20;
    window.AppState.map.setView([52.5200, 13.4050], 10);
    window.Utils.addStatus('🇩🇪 Berlin coordinates set', 'pending');
}

// Тестовый запрос
async function testSimpleQuery() {
    const lat = parseFloat(document.getElementById('latitude').value) || 55.7558;
    const lon = parseFloat(document.getElementById('longitude').value) || 37.6173;
    const radius = parseFloat(document.getElementById('radius').value) || 10;
    const radiusMeters = radius * 1000;

    window.Utils.addStatus('🧪 Test query (military objects)...', 'pending');

    try {
        const query = `
            [out:json][timeout:25];
            (
                node["landuse"="military"](around:${radiusMeters},${lat},${lon});
                way["landuse"="military"](around:${radiusMeters},${lat},${lon});
                node["military"](around:${radiusMeters},${lat},${lon});
                way["military"](around:${radiusMeters},${lat},${lon});
            );
            out center 100;
        `;

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
                    window.Utils.addStatus(`✅ Found ${data.elements?.length || 0} objects`, 'success');

                    if (data.elements && data.elements.length > 0) {
                        window.Map.clearResults();

                        const testResults = [];
                        const limit = Math.min(20, data.elements.length);

                        for (let i = 0; i < limit; i++) {
                            const element = data.elements[i];
                            let coords;
                            if (element.lat && element.lon) {
                                coords = [element.lat, element.lon];
                            } else if (element.center) {
                                coords = [element.center.lat, element.center.lon];
                            }

                            if (coords) {
                                const tags = element.tags || {};
                                const name = tags.name || 'Unnamed';
                                const type = element.type || 'unknown';

                                testResults.push({
                                    type: 'military',
                                    name: name + ` (${type})`,
                                    subtype: 'Test Object',
                                    coords: coords,
                                    source: 'Test Query',
                                    id: 'test_' + i
                                });
                            }
                        }

                        window.Map.displayResults(testResults);
                        window.Utils.addStatus(`🎉 Displayed ${testResults.length} test objects`, 'success');
                    }
                    return;
                }
            } catch (error) {
                console.warn(`Сервер ${server}: ${error.message}`);
                continue;
            }
        }

        window.Utils.addStatus('❌ All servers unavailable', 'error');
    } catch (error) {
        console.error('Test error:', error);
        window.Utils.addStatus(`❌ Test error: ${error.message}`, 'error');
    }
}

// Главная функция поиска
async function searchObjects() {
    // Валидация входных данных
    if (!window.Validation.validateAllInputs()) {
        window.Notifications.warning('Please correct the validation errors before searching');
        return;
    }

    const lat = parseFloat(document.getElementById('latitude').value);
    const lon = parseFloat(document.getElementById('longitude').value);
    const radius = parseFloat(document.getElementById('radius').value);
    const filterMilitary = document.getElementById('filterMilitary').checked;
    const filterHospital = document.getElementById('filterHospital').checked;

    // Проверка выбранных источников данных
    const useOSM = document.getElementById('sourceOSM').checked;
    const useGeoNames = document.getElementById('sourceGeoNames').checked;
    const useWikidata = document.getElementById('sourceWikidata').checked;

    if (!useOSM && !useGeoNames && !useWikidata) {
        window.Notifications.warning('Please select at least one data source!');
        return;
    }

    // Проверка GeoNames username
    if (useGeoNames) {
        const geonamesUsername = document.getElementById('geonamesUsername').value.trim();
        if (!geonamesUsername) {
            window.Notifications.warning('GeoNames is enabled but username is not provided!\n\nPlease enter your GeoNames username in "🔑 API Credentials" section or disable GeoNames data source.');
            return;
        }
    }

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.disabled = true;
    searchBtn.textContent = '⏳ Searching...';

    window.Map.clearResults();
    document.getElementById('statusList').innerHTML = '';
    window.Map.addSearchMarker(lat, lon, radius);

    window.AppState.allResults = [];

    try {
        // OpenStreetMap (Overpass API)
        if (useOSM) {
            if (filterMilitary) {
                window.Utils.addStatus('📡 [OSM] Searching military facilities...', 'pending');
                await window.Utils.sleep(500);
                const count = await window.API.searchOverpassAPI(lat, lon, radius, 'military');
                window.Utils.addStatus(`✅ [OSM] Military facilities: ${count} found`, 'success');
                await window.Utils.sleep(1000);
            }

            if (filterHospital) {
                window.Utils.addStatus('📡 [OSM] Searching hospitals...', 'pending');
                await window.Utils.sleep(500);
                const count = await window.API.searchOverpassAPI(lat, lon, radius, 'hospital');
                window.Utils.addStatus(`✅ [OSM] Hospitals: ${count} found`, 'success');
                await window.Utils.sleep(1000);
            }
        }

        // GeoNames API
        if (useGeoNames) {
            if (filterMilitary) {
                window.Utils.addStatus('📡 [GeoNames] Searching military facilities...', 'pending');
                await window.Utils.sleep(500);
                const count = await window.API.searchGeoNamesAPI(lat, lon, radius, 'military');
                window.Utils.addStatus(`✅ [GeoNames] Military facilities: ${count} found`, 'success');
                await window.Utils.sleep(1000);
            }

            if (filterHospital) {
                window.Utils.addStatus('📡 [GeoNames] Searching hospitals...', 'pending');
                await window.Utils.sleep(500);
                const count = await window.API.searchGeoNamesAPI(lat, lon, radius, 'hospital');
                window.Utils.addStatus(`✅ [GeoNames] Hospitals: ${count} found`, 'success');
                await window.Utils.sleep(1000);
            }
        }

        // Wikidata API
        if (useWikidata) {
            if (filterMilitary) {
                window.Utils.addStatus('📡 [Wikidata] Searching military facilities...', 'pending');
                await window.Utils.sleep(500);
                const count = await window.API.searchWikidataAPI(lat, lon, radius, 'military');
                window.Utils.addStatus(`✅ [Wikidata] Military facilities: ${count} found`, 'success');
                await window.Utils.sleep(1000);
            }

            if (filterHospital) {
                window.Utils.addStatus('📡 [Wikidata] Searching hospitals...', 'pending');
                await window.Utils.sleep(500);
                const count = await window.API.searchWikidataAPI(lat, lon, radius, 'hospital');
                window.Utils.addStatus(`✅ [Wikidata] Hospitals: ${count} found`, 'success');
            }
        }

        window.Map.displayResults(window.AppState.allResults);
        window.Utils.addStatus(`🎉 Total found: ${window.AppState.allResults.length} objects`, 'success');

        // Сохранение в историю
        window.History.addSearchToHistory(lat, lon, radius, { military: filterMilitary, hospital: filterHospital }, window.AppState.allResults.length);

        // Генерация share link
        window.Share.generateShareLink();

    } catch (error) {
        console.error('Search error:', error);
        window.Utils.addStatus(`❌ Error: ${error.message}`, 'error');
        window.Utils.addStatus('💡 Try reducing radius or retry later', 'pending');
    }

    searchBtn.disabled = false;
    searchBtn.textContent = '🔍 Find Objects';
}

// Экспорт
window.App = {
    setTestLocation,
    setMoscowLocation,
    setBerlinLocation,
    testSimpleQuery,
    searchObjects
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.Map.initMap();
});
