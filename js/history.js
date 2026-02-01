// ============================================================
// Point Zero - Search History
// ============================================================

// Загрузка истории из localStorage
function loadHistory() {
    try {
        const history = localStorage.getItem('searchHistory');
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error('Error loading history:', e);
        return [];
    }
}

// Сохранение истории в localStorage
function saveHistory(searches) {
    try {
        localStorage.setItem('searchHistory', JSON.stringify(searches));
    } catch (e) {
        console.error('Error saving history:', e);
    }
}

// Добавление поиска в историю
function addSearchToHistory(lat, lon, radius, filters, count) {
    // Проверка настройки Auto-save
    if (window.Settings) {
        const settings = window.Settings.loadSettings();
        if (!settings.autoSaveHistory) {
            console.log('Auto-save history disabled');
            return;
        }
    }

    const searches = loadHistory();

    const newSearch = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        location: { lat, lon },
        radius: radius,
        filters: filters,
        resultsCount: count
    };

    searches.unshift(newSearch);

    // Ограничение до 50 записей
    if (searches.length > 50) {
        searches.pop();
    }

    saveHistory(searches);
    renderHistory();
}

// Отрисовка истории
function renderHistory() {
    const searches = loadHistory();
    const historyList = document.getElementById('historyList');
    const clearBtn = document.getElementById('clearHistoryBtn');

    if (searches.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 10px;">No search history</p>';
        clearBtn.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'block';
    historyList.innerHTML = '';

    searches.slice(0, 20).forEach(search => {
        const date = new Date(search.timestamp);
        const timeStr = date.toLocaleString();

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div><strong>${search.location.lat.toFixed(4)}, ${search.location.lon.toFixed(4)}</strong></div>
            <div>Radius: ${search.radius}km | Results: ${search.resultsCount}</div>
            <div class="time">${timeStr}</div>
        `;

        item.onclick = () => restoreSearch(search);
        historyList.appendChild(item);
    });
}

// Восстановление поиска из истории
function restoreSearch(search) {
    document.getElementById('latitude').value = search.location.lat;
    document.getElementById('longitude').value = search.location.lon;
    document.getElementById('radius').value = search.radius;
    document.getElementById('filterMilitary').checked = search.filters.military;
    document.getElementById('filterHospital').checked = search.filters.hospital;

    window.AppState.map.setView([search.location.lat, search.location.lon], Math.max(10, 14 - Math.floor(search.radius / 10)));

    setTimeout(() => window.App.searchObjects(), 500);
}

// Toggle истории
function toggleHistory() {
    const historyList = document.getElementById('historyList');
    const icon = document.getElementById('historyToggleIcon');

    if (historyList.classList.contains('show')) {
        historyList.classList.remove('show');
        icon.textContent = '▼';
    } else {
        historyList.classList.add('show');
        icon.textContent = '▲';
    }
}

// Очистка истории
async function clearHistory() {
    const confirmed = await window.Notifications.confirm(
        'Are you sure you want to clear all search history?',
        { confirmText: 'Clear', cancelText: 'Cancel', type: 'warning' }
    );

    if (confirmed) {
        localStorage.removeItem('searchHistory');
        renderHistory();
        await window.Notifications.success('Search history cleared');
    }
}

// Экспорт
window.History = {
    loadHistory,
    saveHistory,
    addSearchToHistory,
    renderHistory,
    restoreSearch,
    toggleHistory,
    clearHistory
};
