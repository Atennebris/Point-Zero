// ============================================================
// Point Zero - Share Functionality
// ============================================================

// Генерация shareable link
function generateShareLink() {
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;
    const radius = document.getElementById('radius').value;
    const military = document.getElementById('filterMilitary').checked ? '1' : '0';
    const hospital = document.getElementById('filterHospital').checked ? '1' : '0';

    // Источники данных
    const sourceOSM = document.getElementById('sourceOSM').checked ? '1' : '0';
    const sourceGeoNames = document.getElementById('sourceGeoNames').checked ? '1' : '0';
    const sourceWikidata = document.getElementById('sourceWikidata').checked ? '1' : '0';

    const params = new URLSearchParams({
        lat: lat,
        lon: lon,
        radius: radius,
        military: military,
        hospital: hospital,
        sourceOSM: sourceOSM,
        sourceGeoNames: sourceGeoNames,
        sourceWikidata: sourceWikidata,
        auto: '1'
    });

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    document.getElementById('shareUrl').value = shareUrl;
}

// Копирование share link в буфер обмена
function copyShareLink() {
    const shareUrl = document.getElementById('shareUrl');
    const copyBtn = document.getElementById('copyBtn');

    shareUrl.select();
    shareUrl.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(shareUrl.value).then(() => {
            copyBtn.textContent = '✅ Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = '📋 Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    } catch (err) {
        // Fallback для старых браузеров
        document.execCommand('copy');
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
}

// Загрузка параметров из URL
function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('lat') && params.has('lon') && params.has('radius')) {
        const lat = parseFloat(params.get('lat'));
        const lon = parseFloat(params.get('lon'));
        const radius = parseFloat(params.get('radius'));

        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && radius >= 0.001 && radius <= 10000) {
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lon;
            document.getElementById('radius').value = radius;

            if (params.has('military')) {
                document.getElementById('filterMilitary').checked = params.get('military') === '1';
            }
            if (params.has('hospital')) {
                document.getElementById('filterHospital').checked = params.get('hospital') === '1';
            }

            // Восстановление настроек источников данных
            if (params.has('sourceOSM')) {
                document.getElementById('sourceOSM').checked = params.get('sourceOSM') === '1';
            }
            if (params.has('sourceGeoNames')) {
                document.getElementById('sourceGeoNames').checked = params.get('sourceGeoNames') === '1';
            }
            if (params.has('sourceWikidata')) {
                document.getElementById('sourceWikidata').checked = params.get('sourceWikidata') === '1';
            }

            window.AppState.map.setView([lat, lon], Math.max(10, 14 - Math.floor(radius / 10)));

            if (params.get('auto') === '1') {
                setTimeout(() => window.App.searchObjects(), 1000);
            }
        }
    }
}

// Экспорт
window.Share = {
    generateShareLink,
    copyShareLink,
    loadFromUrlParams
};
