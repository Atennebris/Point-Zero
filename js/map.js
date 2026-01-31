// ============================================================
// Point Zero - Map Functions
// ============================================================

// Инициализация карты
function initMap() {
    // Создание карты с zoom control
    window.AppState.map = L.map('map', {
        zoomControl: true,  // Включаем zoom controls (+/-)
        scrollWheelZoom: true,  // Зум колесиком мыши
        doubleClickZoom: true,  // Зум двойным кликом
        touchZoom: true  // Зум на touch устройствах
    }).setView([55.7558, 37.6173], 10);

    // Определение различных tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 2
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
        minZoom: 2
    });

    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors',
        maxZoom: 17,
        minZoom: 2
    });

    // Добавляем OSM слой по умолчанию
    osmLayer.addTo(window.AppState.map);

    // Создаем группы слоев для переключателя
    const baseMaps = {
        "🗺️ Street Map": osmLayer,
        "🛰️ Satellite": satelliteLayer,
        "🏔️ Topographic": topoLayer
    };

    // Добавляем Layers Control (переключатель карт)
    L.control.layers(baseMaps, null, {
        position: 'topright',
        collapsed: false
    }).addTo(window.AppState.map);

    // Добавление кастомной кнопки "Recenter"
    addRecenterButton();

    // Улучшенный клик на карте - показываем видимый маркер
    window.AppState.map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(4);
        const lon = e.latlng.lng.toFixed(4);

        // Обновляем координаты в полях
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lon;

        // Показываем временный маркер клика
        showClickMarker(e.latlng);
    });

    // Инициализация всех модулей
    window.Theme.loadTheme();
    window.Share.loadFromUrlParams();
    window.History.renderHistory();
    window.Credentials.loadCredentials();
    window.Validation.setupValidation();
    window.DataSources.setupDataSourceListeners();
    window.Credentials.setupCredentialsListeners();
}

// Добавление кнопки Recenter (центрирование на последний поиск)
function addRecenterButton() {
    // Создание кастомного Leaflet control
    L.Control.Recenter = L.Control.extend({
        onAdd: function(map) {
            const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-recenter');
            btn.innerHTML = '🎯';
            btn.title = 'Recenter to search location';
            btn.style.width = '30px';
            btn.style.height = '30px';
            btn.style.fontSize = '18px';
            btn.style.cursor = 'pointer';
            btn.style.backgroundColor = 'white';
            btn.style.border = '2px solid rgba(0,0,0,0.2)';
            btn.style.borderRadius = '4px';

            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                recenterMap();
            };

            return btn;
        },
        onRemove: function(map) {}
    });

    L.control.recenter = function(opts) {
        return new L.Control.Recenter(opts);
    }

    L.control.recenter({ position: 'topleft' }).addTo(window.AppState.map);
}

// Центрирование карты на последнюю точку поиска
function recenterMap() {
    if (window.AppState.searchMarker) {
        const latlng = window.AppState.searchMarker.getLatLng();
        window.AppState.map.setView(latlng, 12);
        window.AppState.searchMarker.openPopup();
    } else {
        alert('No search location set. Please perform a search first.');
    }
}

// Показ временного маркера клика
let clickMarker = null;
function showClickMarker(latlng) {
    // Удаляем предыдущий временный маркер
    if (clickMarker) {
        window.AppState.map.removeLayer(clickMarker);
    }

    // Создаем новый временный маркер
    const clickIcon = L.divIcon({
        className: 'click-marker',
        html: '<div style="background: #FF6B6B; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: pulse 1s ease-out;"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    clickMarker = L.marker(latlng, { icon: clickIcon }).addTo(window.AppState.map);

    // Показываем popup с координатами
    clickMarker.bindPopup(`
        <b>📍 Clicked Location</b><br>
        Lat: ${latlng.lat.toFixed(4)}<br>
        Lon: ${latlng.lng.toFixed(4)}
    `).openPopup();

    // Автоматически удаляем через 3 секунды
    setTimeout(() => {
        if (clickMarker) {
            window.AppState.map.removeLayer(clickMarker);
            clickMarker = null;
        }
    }, 3000);
}

// Добавление маркера поиска на карту (DRAGGABLE!)
function addSearchMarker(lat, lon, radius) {
    if (window.AppState.searchMarker) {
        window.AppState.map.removeLayer(window.AppState.searchMarker);
    }
    if (window.AppState.searchCircle) {
        window.AppState.map.removeLayer(window.AppState.searchCircle);
    }

    const searchIcon = L.divIcon({
        className: 'search-marker',
        html: '<div style="background: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: move;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    // Создаем DRAGGABLE маркер
    window.AppState.searchMarker = L.marker([lat, lon], {
        icon: searchIcon,
        draggable: true,  // ← ВАЖНО: маркер можно перетаскивать!
        autoPan: true
    }).addTo(window.AppState.map);

    window.AppState.searchMarker.bindPopup('<b>🎯 Search Center</b><br>Coordinates: ' + lat.toFixed(4) + ', ' + lon.toFixed(4) + '<br><small style="color: #888;">💡 Drag to move</small>');

    // Добавляем круг радиуса
    window.AppState.searchCircle = L.circle([lat, lon], {
        color: '#2196F3',
        fillColor: '#2196F3',
        fillOpacity: 0.1,
        radius: radius * 1000
    }).addTo(window.AppState.map);

    // Синхронизация при перетаскивании маркера
    window.AppState.searchMarker.on('dragstart', function(e) {
        // Закрываем popup во время перетаскивания
        e.target.closePopup();
    });

    window.AppState.searchMarker.on('drag', function(e) {
        // Обновляем позицию круга в реальном времени
        const newLatLng = e.target.getLatLng();
        window.AppState.searchCircle.setLatLng(newLatLng);
    });

    window.AppState.searchMarker.on('dragend', function(e) {
        // Получаем новые координаты после перетаскивания
        const newLatLng = e.target.getLatLng();
        const newLat = newLatLng.lat.toFixed(4);
        const newLon = newLatLng.lng.toFixed(4);

        // Обновляем поля ввода координат
        document.getElementById('latitude').value = newLat;
        document.getElementById('longitude').value = newLon;

        // Обновляем popup
        e.target.setPopupContent('<b>🎯 Search Center</b><br>Coordinates: ' + newLat + ', ' + newLon + '<br><small style="color: #888;">💡 Drag to move</small>');
        e.target.openPopup();

        // Валидация новых координат
        window.Validation.validateLatitude();
        window.Validation.validateLongitude();

        console.log('🎯 Search marker moved to:', newLat, newLon);
    });

    window.AppState.map.setView([lat, lon], Math.max(10, 14 - Math.floor(radius / 10)));
}

// Отображение результатов на карте (с кластеризацией!)
function displayResults(results) {
    const resultsList = document.getElementById('resultsList');
    const resultCount = document.getElementById('resultCount');

    // Применяем расширенные фильтры
    const filteredResults = window.Filters.applyAdvancedFilters(results);

    resultCount.textContent = filteredResults.length;

    if (filteredResults.length === 0) {
        resultsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No objects found</p>';
        document.getElementById('exportBtn').style.display = 'none';
        document.getElementById('shareSection').style.display = 'none';
        window.Filters.updateHeatmapToggleVisibility(false);
        return;
    }

    // Показать кнопку экспорта, share секцию и heatmap toggle
    document.getElementById('exportBtn').style.display = 'block';
    document.getElementById('shareSection').style.display = 'block';
    window.Filters.updateHeatmapToggleVisibility(true);

    resultsList.innerHTML = '';

    const militaryResults = filteredResults.filter(r => r.type === 'military');
    const hospitalResults = filteredResults.filter(r => r.type === 'hospital');

    [...militaryResults, ...hospitalResults].forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="type">${result.source} | ${result.subtype}</div>
            <div class="name">${result.name}</div>
        `;

        resultItem.onclick = () => {
            window.AppState.map.setView(result.coords, 15);

            // Если используется кластеризация, нужно найти маркер в кластере
            if (window.AppState.markerCluster) {
                window.AppState.markerCluster.eachLayer(layer => {
                    if (layer.resultId === result.id) {
                        window.AppState.markerCluster.zoomToShowLayer(layer, () => {
                            layer.openPopup();
                        });
                    }
                });
            } else {
                const marker = window.AppState.markers.find(m => m.resultId === result.id);
                if (marker) {
                    marker.openPopup();
                }
            }
        };

        resultsList.appendChild(resultItem);
    });

    // Создаем Marker Cluster Group если больше 50 результатов
    const usesClustering = filteredResults.length > 50;

    if (usesClustering && typeof L.markerClusterGroup !== 'undefined') {
        // Создаем кластер группу
        window.AppState.markerCluster = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: true,
            removeOutsideVisibleBounds: true,
            maxClusterRadius: 80,
            iconCreateFunction: function(cluster) {
                const childCount = cluster.getChildCount();
                let className = 'marker-cluster ';

                if (childCount < 10) {
                    className += 'marker-cluster-small';
                } else if (childCount < 100) {
                    className += 'marker-cluster-medium';
                } else {
                    className += 'marker-cluster-large';
                }

                return L.divIcon({
                    html: `<div><span>${childCount}</span></div>`,
                    className: className,
                    iconSize: new L.Point(40, 40)
                });
            }
        });

        console.log(`🗂️ Using marker clustering for ${filteredResults.length} results`);
    }

    filteredResults.forEach(result => {
        const color = result.type === 'military' ? '#e94560' : '#4CAF50';

        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        const marker = L.marker(result.coords, { icon: markerIcon });
        marker.bindPopup(`
            <b>${result.name}</b><br>
            <small>Type: ${result.subtype}</small><br>
            <small>Source: ${result.source}</small>
        `);
        marker.resultId = result.id;

        if (usesClustering && window.AppState.markerCluster) {
            // Добавляем в кластер
            window.AppState.markerCluster.addLayer(marker);
        } else {
            // Добавляем напрямую на карту
            marker.addTo(window.AppState.map);
        }

        window.AppState.markers.push(marker);
    });

    // Добавляем кластер группу на карту
    if (usesClustering && window.AppState.markerCluster) {
        window.AppState.map.addLayer(window.AppState.markerCluster);
    }
}

// Очистка результатов
function clearResults() {
    // Очистка кластера если он существует
    if (window.AppState.markerCluster) {
        window.AppState.map.removeLayer(window.AppState.markerCluster);
        window.AppState.markerCluster.clearLayers();
        window.AppState.markerCluster = null;
    }

    // Очистка обычных маркеров
    window.AppState.markers.forEach(marker => {
        window.AppState.map.removeLayer(marker);
    });
    window.AppState.markers = [];
    window.AppState.allResults = [];
    document.getElementById('resultsList').innerHTML = '';
    document.getElementById('resultCount').textContent = '0';
    document.getElementById('statusBox').style.display = 'none';
    document.getElementById('exportBtn').style.display = 'none';
    document.getElementById('shareSection').style.display = 'none';
}

// Экспорт
window.Map = {
    initMap,
    addSearchMarker,
    displayResults,
    clearResults,
    recenterMap,
    showClickMarker
};
