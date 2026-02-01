// ============================================================
// Point Zero - Advanced Filters & Heatmap
// ============================================================

// Состояние расширенных фильтров
let advancedFiltersExpanded = false;

// Переключение видимости Advanced Filters
function toggleAdvancedFilters() {
    advancedFiltersExpanded = !advancedFiltersExpanded;
    const list = document.getElementById('advancedFiltersList');
    const icon = document.getElementById('advancedFiltersToggleIcon');

    if (advancedFiltersExpanded) {
        list.style.display = 'block';
        icon.textContent = '▲';
    } else {
        list.style.display = 'none';
        icon.textContent = '▼';
    }
}

// Настройка слушателей для Advanced Filters
function setupAdvancedFiltersListeners() {
    // Включение/выключение поля минимальной площади
    document.getElementById('filterBySize').addEventListener('change', function() {
        document.getElementById('minArea').disabled = !this.checked;
    });

    // Включение/выключение поля даты
    document.getElementById('filterByDate').addEventListener('change', function() {
        document.getElementById('minDate').disabled = !this.checked;
    });

    // Устанавливаем дату по умолчанию (1 год назад)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    document.getElementById('minDate').value = oneYearAgo.toISOString().split('T')[0];
}

// Применение расширенных фильтров к результатам
function applyAdvancedFilters(results) {
    const filterNamedOnly = document.getElementById('filterNamedOnly').checked;
    const filterBySize = document.getElementById('filterBySize').checked;
    const filterByDate = document.getElementById('filterByDate').checked;

    let filtered = results;

    // Фильтр: только с названием
    if (filterNamedOnly) {
        filtered = filtered.filter(r => {
            return r.name && r.name.trim() !== '' && r.name !== 'Unnamed';
        });
    }

    // Фильтр: минимальная площадь (только для OSM данных)
    if (filterBySize) {
        const minArea = parseFloat(document.getElementById('minArea').value) || 0;
        filtered = filtered.filter(r => {
            // Проверяем только OSM объекты
            if (r.source !== 'OpenStreetMap') return true;

            // Если у объекта есть информация о площади
            if (r.area !== undefined) {
                return r.area >= minArea;
            }
            // Пропускаем объекты без информации о площади
            return true;
        });
    }

    // Фильтр: дата последнего обновления (только для OSM данных)
    if (filterByDate) {
        const minDateStr = document.getElementById('minDate').value;
        if (minDateStr) {
            const minDate = new Date(minDateStr);
            filtered = filtered.filter(r => {
                // Проверяем только OSM объекты
                if (r.source !== 'OpenStreetMap') return true;

                // Если у объекта есть timestamp
                if (r.timestamp) {
                    const objDate = new Date(r.timestamp);
                    return objDate >= minDate;
                }
                // Пропускаем объекты без timestamp
                return true;
            });
        }
    }

    return filtered;
}

// Heatmap функциональность
let heatmapLayer = null;

// Переключение heatmap
function toggleHeatmap() {
    const isEnabled = document.getElementById('heatmapToggle').checked;

    if (isEnabled) {
        showHeatmap();
    } else {
        hideHeatmap();
    }
}

// Показать heatmap
function showHeatmap() {
    if (!window.AppState.allResults || window.AppState.allResults.length === 0) {
        window.Notifications.info('No results to display on heatmap');
        document.getElementById('heatmapToggle').checked = false;
        return;
    }

    // Удаляем существующий heatmap слой
    if (heatmapLayer) {
        window.AppState.map.removeLayer(heatmapLayer);
    }

    // Подготовка данных для heatmap (координаты + intensity)
    const heatData = window.AppState.allResults.map(result => {
        return [result.coords[0], result.coords[1], 1]; // [lat, lon, intensity]
    });

    // Создание heatmap слоя
    heatmapLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
            0.0: 'blue',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
        }
    }).addTo(window.AppState.map);

    console.log('🔥 Heatmap enabled with', heatData.length, 'points');
}

// Скрыть heatmap
function hideHeatmap() {
    if (heatmapLayer) {
        window.AppState.map.removeLayer(heatmapLayer);
        heatmapLayer = null;
        console.log('🔥 Heatmap disabled');
    }
}

// Показать/скрыть heatmap toggle в зависимости от результатов
function updateHeatmapToggleVisibility(hasResults) {
    const container = document.getElementById('heatmapToggleContainer');
    if (hasResults) {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        // Выключаем heatmap если результатов нет
        document.getElementById('heatmapToggle').checked = false;
        hideHeatmap();
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setupAdvancedFiltersListeners();
});

// Экспорт
window.Filters = {
    toggleAdvancedFilters,
    setupAdvancedFiltersListeners,
    applyAdvancedFilters,
    toggleHeatmap,
    showHeatmap,
    hideHeatmap,
    updateHeatmapToggleVisibility
};
