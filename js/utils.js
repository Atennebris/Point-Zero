// ============================================================
// Point Zero - Утилиты
// ============================================================

// Функция задержки (sleep)
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция retry с exponential backoff
async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            if (response.status === 504 || response.status === 502) {
                console.log(`Retry ${i + 1}/${retries} after ${i * 2} seconds...`);
                await sleep((i + 1) * 2000);
                continue;
            }
            return response;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
                await sleep((i + 1) * 2000);
            }
        }
    }
    throw new Error('Max retries exceeded');
}

// Функция добавления статуса
function addStatus(message, type = 'pending') {
    const statusBox = document.getElementById('statusBox');
    const statusList = document.getElementById('statusList');
    statusBox.style.display = 'block';

    const statusItem = document.createElement('div');
    statusItem.className = `status-item ${type}`;
    statusItem.textContent = message;
    statusList.appendChild(statusItem);
}

// Экспорт в глобальную область
window.Utils = {
    sleep,
    fetchWithRetry,
    addStatus
};
