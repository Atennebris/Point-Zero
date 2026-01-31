// ============================================================
// Point Zero - Data Sources Management
// ============================================================

// Настройка listeners для источников данных
function setupDataSourceListeners() {
    const sources = ['sourceOSM', 'sourceGeoNames', 'sourceWikidata'];
    sources.forEach(sourceId => {
        document.getElementById(sourceId).addEventListener('change', updateActiveSourcesList);
    });
    updateActiveSourcesList();
}

// Обновление списка активных источников
function updateActiveSourcesList() {
    const activeSources = [];

    if (document.getElementById('sourceOSM').checked) {
        activeSources.push('• OpenStreetMap (Overpass API)');
    }
    if (document.getElementById('sourceGeoNames').checked) {
        activeSources.push('• GeoNames API');
    }
    if (document.getElementById('sourceWikidata').checked) {
        activeSources.push('• Wikidata API');
    }

    const list = document.getElementById('activeSourcesList');
    if (activeSources.length === 0) {
        list.innerHTML = '<span style="color: var(--warning);">⚠️ No sources selected!</span>';
    } else {
        list.innerHTML = activeSources.join('<br>');
    }
}

// Экспорт
window.DataSources = {
    setupDataSourceListeners,
    updateActiveSourcesList
};
