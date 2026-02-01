// ============================================================
// Point Zero - Настройки приложения
// ============================================================

// Ключ для localStorage
const SETTINGS_KEY = 'pointZeroSettings';

// Дефолтные настройки
const DEFAULT_SETTINGS = {
    theme: 'dark',
    defaultRadius: 20,
    autoSaveHistory: true,
    showAdvancedFilters: false,
    enableOSM: true,
    enableGeoNames: false,
    enableWikidata: false,
    geonamesUsername: ''
};

// Загрузка настроек из localStorage
function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        return DEFAULT_SETTINGS;
    }
}

// Сохранение настроек в localStorage
function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        console.log('Настройки сохранены:', settings);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        return false;
    }
}

// Применение настроек к интерфейсу
function applySettings() {
    const settings = loadSettings();

    // Применение темы
    if (settings.theme === 'light') {
        document.documentElement.classList.add('light-theme');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    // Применение дефолтного радиуса
    const radiusInput = document.getElementById('radius');
    if (radiusInput && !radiusInput.value) {
        radiusInput.value = settings.defaultRadius;
    }

    // Применение источников данных
    const sourceOSM = document.getElementById('sourceOSM');
    const sourceGeoNames = document.getElementById('sourceGeoNames');
    const sourceWikidata = document.getElementById('sourceWikidata');

    if (sourceOSM) sourceOSM.checked = settings.enableOSM;
    if (sourceGeoNames) sourceGeoNames.checked = settings.enableGeoNames;
    if (sourceWikidata) sourceWikidata.checked = settings.enableWikidata;

    // Применение GeoNames username
    const geonamesUsername = document.getElementById('geonamesUsername');
    if (geonamesUsername && settings.geonamesUsername) {
        geonamesUsername.value = settings.geonamesUsername;
    }

    // Применение показа Advanced Filters по умолчанию
    if (settings.showAdvancedFilters && window.Filters) {
        // Открываем Advanced Filters если настройка включена
        const advancedFiltersList = document.getElementById('advancedFiltersList');
        const advancedFiltersToggleIcon = document.getElementById('advancedFiltersToggleIcon');
        if (advancedFiltersList && advancedFiltersToggleIcon) {
            advancedFiltersList.style.display = 'block';
            advancedFiltersToggleIcon.textContent = '▲';
        }
    }

    console.log('Настройки применены');
}

// Сброс настроек к дефолтным значениям
function resetSettings() {
    if (confirm('Reset all settings to default values?\n\nThis will:\n- Reset theme to Dark\n- Clear saved data sources\n- Clear GeoNames username\n- Reset default radius to 20km\n\nHistory and search results will NOT be affected.')) {
        // Сохраняем дефолтные настройки
        saveSettings(DEFAULT_SETTINGS);

        // Применяем их
        applySettings();

        // Обновляем DataSources список
        if (window.DataSources && window.DataSources.updateActiveSourcesList) {
            window.DataSources.updateActiveSourcesList();
        }

        alert('✅ Settings have been reset to default values!');

        // Закрываем модалку настроек
        closeSettingsModal();

        // Перезагружаем страницу для полного применения
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

// Открытие модального окна настроек
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        // Загружаем текущие настройки в поля
        loadSettingsToModal();
        // Показываем модалку
        modal.classList.add('show');
    }
}

// Закрытие модального окна настроек
function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Сохранение текущих настроек из UI
function saveCurrentSettings() {
    const settings = {
        theme: localStorage.getItem('theme') || 'dark',
        defaultRadius: parseInt(document.getElementById('defaultRadiusInput')?.value) || 20,
        autoSaveHistory: document.getElementById('autoSaveHistoryCheck')?.checked ?? true,
        showAdvancedFilters: document.getElementById('showAdvancedFiltersCheck')?.checked ?? false,
        enableOSM: document.getElementById('sourceOSM')?.checked ?? true,
        enableGeoNames: document.getElementById('sourceGeoNames')?.checked ?? false,
        enableWikidata: document.getElementById('sourceWikidata')?.checked ?? false,
        geonamesUsername: document.getElementById('geonamesUsername')?.value?.trim() || ''
    };

    if (saveSettings(settings)) {
        alert('✅ Settings saved successfully!');
        closeSettingsModal();
    } else {
        alert('❌ Error saving settings!');
    }
}

// Загрузка настроек в UI модалки
function loadSettingsToModal() {
    const settings = loadSettings();

    const defaultRadiusInput = document.getElementById('defaultRadiusInput');
    const autoSaveHistoryCheck = document.getElementById('autoSaveHistoryCheck');
    const showAdvancedFiltersCheck = document.getElementById('showAdvancedFiltersCheck');

    if (defaultRadiusInput) defaultRadiusInput.value = settings.defaultRadius;
    if (autoSaveHistoryCheck) autoSaveHistoryCheck.checked = settings.autoSaveHistory;
    if (showAdvancedFiltersCheck) showAdvancedFiltersCheck.checked = settings.showAdvancedFilters;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    applySettings();
});

// Экспорт
window.Settings = {
    loadSettings,
    saveSettings,
    applySettings,
    resetSettings,
    openSettingsModal,
    closeSettingsModal,
    saveCurrentSettings,
    loadSettingsToModal
};
