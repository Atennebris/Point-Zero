// ============================================================
// Point Zero - Конфигурация и константы
// ============================================================

// Глобальные переменные состояния
let map;
let markers = [];
let searchMarker;
let searchCircle;
let allResults = [];

// Список Overpass API серверов с fallback
const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter'
];

// Экспорт для глобального доступа
window.AppState = {
    map: null,
    markers: [],
    searchMarker: null,
    searchCircle: null,
    allResults: [],
    markerCluster: null
};

window.Config = {
    OVERPASS_SERVERS: OVERPASS_SERVERS
};
