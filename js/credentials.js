// ============================================================
// Point Zero - API Credentials
// ============================================================

// Загрузка сохраненных credentials
function loadCredentials() {
    try {
        const geonamesUsername = localStorage.getItem('geonamesUsername');
        if (geonamesUsername) {
            document.getElementById('geonamesUsername').value = geonamesUsername;
        }
    } catch (e) {
        console.error('Error loading credentials:', e);
    }
}

// Сохранение GeoNames username
function saveGeonamesUsername() {
    const username = document.getElementById('geonamesUsername').value;
    if (username) {
        localStorage.setItem('geonamesUsername', username);
    }
}

// Настройка event listeners
function setupCredentialsListeners() {
    const geonamesInput = document.getElementById('geonamesUsername');
    geonamesInput.addEventListener('change', saveGeonamesUsername);
    geonamesInput.addEventListener('blur', saveGeonamesUsername);
}

// Тест подключения к GeoNames
async function testGeoNamesConnection() {
    const username = document.getElementById('geonamesUsername').value.trim();

    if (!username) {
        window.Notifications.warning('Please enter your GeoNames username first!');
        return;
    }

    const testUrl = `http://api.geonames.org/getJSON?geonameId=2988507&username=${username}`;
    console.log('Testing GeoNames connection:', testUrl);

    try {
        const response = await fetch(testUrl);

        console.log('===== GeoNames TEST DEBUG =====');
        console.log('Test URL:', testUrl);
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
        }

        if (response.status === 401) {
            const errorDetail = data?.status?.message || 'Unknown error';
            console.error('GeoNames 401 Error:', errorDetail);
            window.Notifications.error(`GeoNames Test Failed: 401 Unauthorized\n\nError: ${errorDetail}\n\nYour account is NOT activated properly.\n\nCheck console (F12) for details.`);
            return;
        }

        if (response.ok) {
            if (data && data.name) {
                await window.Notifications.success(`GeoNames Test Successful!\n\nYour account "${username}" is working correctly.\n\nTest location: ${data.name}, ${data.countryName}\n\nYou can now use GeoNames data source.`);
            } else if (data && data.status) {
                await window.Notifications.warning(`GeoNames Error: ${data.status.message}`);
            }
        } else {
            await window.Notifications.error(`GeoNames Test Failed: HTTP ${response.status}\n\n${response.statusText}\n\nCheck console (F12) for details.`);
        }
    } catch (error) {
        console.error('GeoNames test error:', error);
        await window.Notifications.error(`Connection Error: ${error.message}\n\nCheck your internet connection.`);
    }
}

// Toggle credentials секции
function toggleCredentials() {
    const credentialsList = document.getElementById('credentialsList');
    const icon = document.getElementById('credentialsToggleIcon');

    if (credentialsList.classList.contains('show')) {
        credentialsList.classList.remove('show');
        icon.textContent = '▼';
    } else {
        credentialsList.classList.add('show');
        icon.textContent = '▲';
    }
}

// Экспорт
window.Credentials = {
    loadCredentials,
    saveGeonamesUsername,
    setupCredentialsListeners,
    testGeoNamesConnection,
    toggleCredentials
};
