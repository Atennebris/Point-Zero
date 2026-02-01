/**
 * Модуль AI Descriptions
 * Интеграция с OpenRouter API для генерации человеко-понятных описаний объектов
 */

// ===========================================
// AI МОДЕЛИ (БЕСПЛАТНЫЕ OpenRouter)
// ===========================================

const AI_MODELS = {
    'gemma-3-12b': {
        id: 'google/gemma-3-12b-it:free',
        name: 'Gemma 3 12B',
        description: 'Google Gemma 12B - Free ($0)',
        maxTokens: 4096
    },
    'gemma-3-27b': {
        id: 'google/gemma-3-27b-it:free',
        name: 'Gemma 3 27B',
        description: 'Google Gemma 27B - Free ($0)',
        maxTokens: 4096
    },
    'deepseek-chimera': {
        id: 'tngtech/deepseek-r1t2-chimera:free',
        name: 'DeepSeek R1 Chimera',
        description: '671B MoE model - Free ($0)',
        maxTokens: 2048
    },
    'mimo-flash': {
        id: 'xiaomi/mimo-v2-flash-20251210:free',
        name: 'Xiaomi MiMo Flash',
        description: 'Xiaomi fast model - Free ($0)',
        maxTokens: 2048
    }
};

const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CACHE_PREFIX = 'ai_desc_';
const CACHE_VERSION = 'v1';

// ===========================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
// ===========================================

/**
 * Получить OpenRouter API ключ из localStorage
 */
function getOpenRouterApiKey() {
    return localStorage.getItem('openrouter_api_key') || '';
}

/**
 * Сохранить OpenRouter API ключ в localStorage
 */
function saveOpenRouterApiKey(apiKey) {
    localStorage.setItem('openrouter_api_key', apiKey.trim());
}

/**
 * Получить выбранную модель из localStorage
 */
function getSelectedModel() {
    const saved = localStorage.getItem('openrouter_selected_model');
    return saved || 'gemma-3-12b'; // Default: Gemma 3 12B (Free)
}

/**
 * Сохранить выбранную модель в localStorage
 */
function saveSelectedModel(modelKey) {
    localStorage.setItem('openrouter_selected_model', modelKey);
}

/**
 * Получить кастомный промпт из settings
 */
function getCustomPrompt() {
    // Пытаемся получить из pointZeroSettings
    try {
        const settings = JSON.parse(localStorage.getItem('pointZeroSettings') || '{}');
        return settings.aiCustomPrompt || '';
    } catch (e) {
        return '';
    }
}

// ===========================================
// КЕШИРОВАНИЕ
// ===========================================

/**
 * Получить ключ кеша для объекта
 */
function getCacheKey(osmId, modelKey) {
    return `${CACHE_PREFIX}${CACHE_VERSION}_${osmId}_${modelKey}`;
}

/**
 * Получить AI-описание из кеша
 */
function getCachedDescription(osmId, modelKey) {
    const key = getCacheKey(osmId, modelKey);
    const cached = localStorage.getItem(key);

    if (cached) {
        try {
            const data = JSON.parse(cached);
            // Проверяем срок действия кеша (30 дней)
            const age = Date.now() - data.timestamp;
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 дней

            if (age < maxAge) {
                return data.description;
            } else {
                // Удаляем устаревший кеш
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error('Error parsing cached description:', e);
            localStorage.removeItem(key);
        }
    }

    return null;
}

/**
 * Сохранить AI-описание в кеш
 */
function cacheDescription(osmId, modelKey, description) {
    const key = getCacheKey(osmId, modelKey);
    const data = {
        description: description,
        timestamp: Date.now(),
        version: CACHE_VERSION
    };

    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error caching description:', e);
        // Если localStorage переполнен, очищаем старые кеши
        if (e.name === 'QuotaExceededError') {
            clearOldCaches();
            // Пробуем еще раз
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e2) {
                console.error('Still cannot cache after cleanup:', e2);
            }
        }
    }
}

/**
 * Очистить старые кеши AI-описаний
 */
function clearOldCaches() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
            keys.push(key);
        }
    }

    // Сортируем по времени и удаляем самые старые
    const caches = keys.map(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return { key, timestamp: data.timestamp || 0 };
        } catch {
            return { key, timestamp: 0 };
        }
    }).sort((a, b) => a.timestamp - b.timestamp);

    // Удаляем половину самых старых
    const toRemove = Math.ceil(caches.length / 2);
    for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(caches[i].key);
    }

    console.log(`Cleared ${toRemove} old AI description caches`);
}

/**
 * Получить все закешированные описания
 */
function getAllCachedDescriptions() {
    const descriptions = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                descriptions.push({
                    osmId: key.split('_')[3], // Извлекаем OSM ID
                    model: key.split('_')[4], // Извлекаем model key
                    description: data.description,
                    timestamp: data.timestamp
                });
            } catch (e) {
                console.error('Error parsing cached description:', e);
            }
        }
    }

    return descriptions;
}

// ===========================================
// ГЕНЕРАЦИЯ ПРОМПТОВ
// ===========================================

/**
 * Создать промпт для AI на основе данных объекта
 */
function createPrompt(location) {
    const { name, type, tags, lat, lon } = location;

    // Формируем список тегов
    const tagsList = tags && Object.keys(tags).length > 0
        ? Object.entries(tags)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')
        : 'No tags available';

    let prompt = `Analyze this location and provide a concise description:

Location Information:
- Name: ${name || 'Unnamed'}
- Type: ${type || 'Unknown'}
- Tags: ${tagsList}
- Coordinates: ${lat}, ${lon}

Please provide:
1. Brief human-readable description (2-3 sentences)
2. Category and classification
3. Likely purpose or activity type

Format your response in a clear, structured way.`;

    // Добавляем кастомный промпт если есть
    const customPrompt = getCustomPrompt();
    if (customPrompt) {
        prompt += `\n\nAdditional Instructions:\n${customPrompt}`;
    }

    return prompt;
}

// ===========================================
// API ЗАПРОСЫ
// ===========================================

/**
 * Запрос к OpenRouter API для генерации описания
 */
async function generateAIDescription(location) {
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
        throw new Error('OpenRouter API key is not configured. Please add it in Settings.');
    }

    const modelKey = getSelectedModel();
    const model = AI_MODELS[modelKey];

    if (!model) {
        throw new Error(`Invalid model selected: ${modelKey}`);
    }

    // Проверяем кеш
    const osmId = location.id || `${location.lat}_${location.lon}`;
    const cached = getCachedDescription(osmId, modelKey);

    if (cached) {
        console.log('Using cached AI description for', osmId);
        return {
            description: cached,
            fromCache: true,
            model: model.name
        };
    }

    // Генерируем промпт
    const prompt = createPrompt(location);

    // Делаем запрос к API
    const requestBody = {
        model: model.id,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: model.maxTokens,
        temperature: 0.7
    };

    try {
        const response = await fetch(OPENROUTER_API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401) {
                throw new Error('Invalid OpenRouter API key. Please check your credentials in Settings.');
            } else if (response.status === 403) {
                throw new Error('API limit reached. Please try again later or upgrade your plan.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Free tier: 10 requests/hour.');
            } else {
                throw new Error(`API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
            }
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        const description = data.choices[0].message.content.trim();

        // Кешируем результат
        cacheDescription(osmId, modelKey, description);

        return {
            description: description,
            fromCache: false,
            model: model.name,
            usage: data.usage
        };

    } catch (error) {
        if (error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

/**
 * Тест подключения к OpenRouter API
 */
async function testOpenRouterConnection() {
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
        return {
            success: false,
            message: 'API key is not configured'
        };
    }

    const modelKey = getSelectedModel();
    const model = AI_MODELS[modelKey];

    try {
        const response = await fetch(OPENROUTER_API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model.id,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            })
        });

        if (response.ok) {
            return {
                success: true,
                message: 'Connection successful!'
            };
        } else {
            // Получаем детали ошибки
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.error?.message || errorData.message || JSON.stringify(errorData);
            } catch (e) {
                errorDetails = await response.text();
            }

            console.error('OpenRouter API Error:', {
                status: response.status,
                details: errorDetails,
                model: model.id
            });

            if (response.status === 401) {
                return {
                    success: false,
                    message: 'Invalid API key'
                };
            } else if (response.status === 403) {
                return {
                    success: false,
                    message: 'API limit reached'
                };
            } else if (response.status === 400) {
                return {
                    success: false,
                    message: `Bad Request: ${errorDetails.substring(0, 100)}`
                };
            } else {
                return {
                    success: false,
                    message: `Error ${response.status}: ${errorDetails.substring(0, 100)}`
                };
            }
        }
    } catch (error) {
        console.error('OpenRouter API Connection Error:', error);
        return {
            success: false,
            message: 'Network error'
        };
    }
}

// ===========================================
// ЭКСПОРТ
// ===========================================

/**
 * Экспорт всех AI-описаний в JSON
 */
function exportAIDescriptionsJSON() {
    try {
        const descriptions = getAllCachedDescriptions();

        if (descriptions.length === 0) {
            alert('⚠️ No AI descriptions to export.\n\nGenerate some descriptions first by clicking "🤖 AI Describe" on markers.');
            return;
        }

        const exportData = {
            exported_at: new Date().toISOString(),
            total_count: descriptions.length,
            descriptions: descriptions
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_descriptions_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`Exported ${descriptions.length} AI descriptions to JSON`);
    } catch (error) {
        console.error('Error exporting AI descriptions to JSON:', error);
        alert(`❌ Error exporting AI descriptions:\n\n${error.message}`);
    }
}

/**
 * Экспорт всех AI-описаний в CSV
 */
function exportAIDescriptionsCSV() {
    try {
        const descriptions = getAllCachedDescriptions();

        if (descriptions.length === 0) {
            alert('⚠️ No AI descriptions to export.\n\nGenerate some descriptions first by clicking "🤖 AI Describe" on markers.');
            return;
        }

        let csv = 'OSM ID,Model,Description,Timestamp\n';

        descriptions.forEach(desc => {
            const descText = desc.description.replace(/"/g, '""').replace(/\n/g, ' ');
            const date = new Date(desc.timestamp).toISOString();
            csv += `"${desc.osmId}","${desc.model}","${descText}","${date}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_descriptions_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`Exported ${descriptions.length} AI descriptions to CSV`);
    } catch (error) {
        console.error('Error exporting AI descriptions to CSV:', error);
        alert(`❌ Error exporting AI descriptions:\n\n${error.message}`);
    }
}

/**
 * Копировать AI-описание в буфер обмена
 */
async function copyDescriptionToClipboard(description) {
    try {
        await navigator.clipboard.writeText(description);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Экспорт текущего описания в TXT
 */
function exportCurrentDescriptionTXT() {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const description = sidebar.dataset.currentDescription;
    const locationStr = sidebar.dataset.currentLocation;
    const model = sidebar.dataset.currentModel;

    if (!description) {
        alert('No description to export');
        return;
    }

    try {
        const location = JSON.parse(locationStr || '{}');
        const content = `AI Description
================

Location: ${location.name || 'Unnamed Location'}
Type: ${location.type || 'Unknown'}
Coordinates: ${location.lat}, ${location.lon}
Model: ${model}
Generated: ${new Date().toLocaleString()}

Description:
${description}
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_description_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting TXT:', error);
        alert(`❌ Error exporting: ${error.message}`);
    }
}

/**
 * Экспорт текущего описания в MD
 */
function exportCurrentDescriptionMD() {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const description = sidebar.dataset.currentDescription;
    const locationStr = sidebar.dataset.currentLocation;
    const model = sidebar.dataset.currentModel;

    if (!description) {
        alert('No description to export');
        return;
    }

    try {
        const location = JSON.parse(locationStr || '{}');
        const content = `# AI Description

## Location Information

- **Name**: ${location.name || 'Unnamed Location'}
- **Type**: ${location.type || 'Unknown'}
- **Coordinates**: ${location.lat}, ${location.lon}
- **Model**: ${model}
- **Generated**: ${new Date().toLocaleString()}

## Description

${description}

---
*Generated by Point Zero OSINT with OpenRouter AI*
`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_description_${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting MD:', error);
        alert(`❌ Error exporting: ${error.message}`);
    }
}

/**
 * Экспорт текущего описания в JSON
 */
function exportCurrentDescriptionJSON() {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const description = sidebar.dataset.currentDescription;
    const locationStr = sidebar.dataset.currentLocation;
    const model = sidebar.dataset.currentModel;

    if (!description) {
        alert('No description to export');
        return;
    }

    try {
        const location = JSON.parse(locationStr || '{}');
        const exportData = {
            location: {
                name: location.name || 'Unnamed Location',
                type: location.type || 'Unknown',
                coordinates: {
                    lat: location.lat,
                    lon: location.lon
                }
            },
            ai_description: description,
            model: model,
            generated_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_description_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting JSON:', error);
        alert(`❌ Error exporting: ${error.message}`);
    }
}

/**
 * Экспорт описания из истории в TXT
 */
function exportSingleDescriptionTXT(osmId, modelName) {
    const descriptions = getAllCachedDescriptions();
    const desc = descriptions.find(d => d.osmId === osmId && d.model === modelName);

    if (!desc) {
        alert('Description not found');
        return;
    }

    const content = `AI Description
================

OSM ID: ${osmId}
Model: ${desc.model}
Generated: ${new Date(desc.timestamp).toLocaleString()}

Description:
${desc.description}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_description_${osmId}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Экспорт описания из истории в MD
 */
function exportSingleDescriptionMD(osmId, modelName) {
    const descriptions = getAllCachedDescriptions();
    const desc = descriptions.find(d => d.osmId === osmId && d.model === modelName);

    if (!desc) {
        alert('Description not found');
        return;
    }

    const content = `# AI Description

## Information

- **OSM ID**: ${osmId}
- **Model**: ${desc.model}
- **Generated**: ${new Date(desc.timestamp).toLocaleString()}

## Description

${desc.description}

---
*Generated by Point Zero OSINT with OpenRouter AI*
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_description_${osmId}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Экспорт описания из истории в JSON
 */
function exportSingleDescriptionJSON(osmId, modelName) {
    const descriptions = getAllCachedDescriptions();
    const desc = descriptions.find(d => d.osmId === osmId && d.model === modelName);

    if (!desc) {
        alert('Description not found');
        return;
    }

    const exportData = {
        osm_id: osmId,
        model: desc.model,
        description: desc.description,
        generated_at: new Date(desc.timestamp).toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_description_${osmId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===========================================
// UI ФУНКЦИИ
// ===========================================

/**
 * Тест подключения к OpenRouter API с UI уведомлением
 */
async function testOpenRouterConnectionUI(event) {
    // Сначала сохраняем текущие значения из UI
    const apiKeyInput = document.getElementById('aimlApiKeyInput');
    const modelSelect = document.getElementById('aimlModelSelect');

    if (apiKeyInput) {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            saveOpenRouterApiKey(apiKey);
        }
    }

    if (modelSelect) {
        const modelKey = modelSelect.value;
        if (modelKey) {
            saveSelectedModel(modelKey);
        }
    }

    // Получаем кнопку
    const btn = event ? event.target : null;
    let originalText = '🧪 Test OpenRouter Connection';

    if (btn) {
        originalText = btn.textContent;
        btn.textContent = '⏳ Testing...';
        btn.disabled = true;
    }

    try {
        const result = await testOpenRouterConnection();

        if (result.success) {
            alert(`✅ ${result.message}\n\nYour OpenRouter API is configured correctly!`);
        } else {
            alert(`❌ ${result.message}\n\nPlease check your API key and try again.`);
        }
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    } finally {
        // Восстанавливаем кнопку
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

/**
 * Открыть/закрыть AI sidebar
 */
function toggleAISidebar(show = null, showHistory = true) {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    if (show === null) {
        // Toggle
        sidebar.classList.toggle('show');
        // Если открываем, показываем историю
        if (sidebar.classList.contains('show') && showHistory) {
            showAIHistoryList();
        }
    } else if (show) {
        sidebar.classList.add('show');
        // Показываем историю только если showHistory = true
        if (showHistory) {
            showAIHistoryList();
        }
    } else {
        sidebar.classList.remove('show');
    }
}

/**
 * Показать список всех AI-описаний в sidebar
 */
function showAIHistoryList() {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const content = document.getElementById('aiDescriptionContent');
    if (!content) return;

    const descriptions = getAllCachedDescriptions();

    if (descriptions.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 10px;">🤖</div>
                <p>No AI descriptions yet</p>
                <p style="font-size: 11px; margin-top: 10px;">
                    Click "🤖 AI Describe" on any marker to generate description
                </p>
            </div>
        `;
        return;
    }

    // Сортируем по времени создания (новые сначала)
    descriptions.sort((a, b) => b.timestamp - a.timestamp);

    let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: var(--bg-tertiary); border-radius: 5px;">
            <strong>🤖 AI Descriptions History</strong>
            <div style="font-size: 10px; color: var(--text-secondary); margin-top: 5px;">
                Total: ${descriptions.length} | Click to view details
            </div>
        </div>
        <div style="max-height: calc(100vh - 150px); overflow-y: auto;">
    `;

    descriptions.forEach((desc, index) => {
        const date = new Date(desc.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Получаем название модели
        const modelName = Object.values(AI_MODELS).find(m => desc.model === m.name)?.name || desc.model;

        // Превью описания (первые 100 символов)
        const preview = desc.description.length > 100
            ? desc.description.substring(0, 100) + '...'
            : desc.description;

        html += `
            <div class="ai-history-item" onclick="window.AIDescriptions.showCachedDescription('${desc.osmId}', '${desc.model}')" style="margin-bottom: 10px; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 5px; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <strong style="font-size: 12px; color: var(--accent);">Location #${index + 1}</strong>
                    <span style="font-size: 9px; color: var(--text-secondary);">${date}</span>
                </div>
                <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 5px;">
                    Model: ${modelName}
                </div>
                <div style="font-size: 11px; color: var(--text-primary); line-height: 1.4;">
                    ${preview.replace(/\n/g, ' ')}
                </div>
            </div>
        `;
    });

    html += `</div>`;

    content.innerHTML = html;

    // Добавляем hover эффект через CSS
    const style = document.createElement('style');
    style.textContent = `
        .ai-history-item:hover {
            background: var(--bg-tertiary) !important;
            border-color: var(--accent) !important;
            transform: translateX(-3px);
        }
    `;
    if (!document.getElementById('ai-history-style')) {
        style.id = 'ai-history-style';
        document.head.appendChild(style);
    }
}

/**
 * Показать кешированное описание по OSM ID и модели
 */
function showCachedDescription(osmId, modelName) {
    const descriptions = getAllCachedDescriptions();
    const desc = descriptions.find(d => d.osmId === osmId && d.model === modelName);

    if (!desc) {
        alert('Description not found in cache');
        return;
    }

    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const content = document.getElementById('aiDescriptionContent');
    if (!content) return;

    const date = new Date(desc.timestamp).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
        <div style="margin-bottom: 15px;">
            <button onclick="window.AIDescriptions.showAIHistoryList()" style="background: var(--bg-tertiary); border: 1px solid var(--border); padding: 6px 12px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 11px;">
                ← Back to History
            </button>
        </div>

        <div class="ai-description-header">
            <strong>📍 Location</strong>
            <br>
            <span style="font-size: 11px; color: var(--text-secondary);">
                OSM ID: ${osmId}
            </span>
            <br>
            <span style="font-size: 10px; color: var(--text-secondary);">
                Model: ${desc.model} | Generated: ${date}
            </span>
        </div>

        <div class="ai-description-body">
            ${desc.description.replace(/\n/g, '<br>')}
        </div>

        <div class="ai-description-footer">
            <button onclick="window.AIDescriptions.copyDescriptionFromHistory('${desc.description.replace(/'/g, "\\'")}', event)" class="ai-copy-btn">
                📋 Copy
            </button>
        </div>

        <div class="ai-description-footer" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button onclick="window.AIDescriptions.exportSingleDescriptionTXT('${desc.osmId}', '${desc.model}')" style="flex: 1; min-width: 80px; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 10px;">
                📄 TXT
            </button>
            <button onclick="window.AIDescriptions.exportSingleDescriptionMD('${desc.osmId}', '${desc.model}')" style="flex: 1; min-width: 80px; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 10px;">
                📝 MD
            </button>
            <button onclick="window.AIDescriptions.exportSingleDescriptionJSON('${desc.osmId}', '${desc.model}')" style="flex: 1; min-width: 80px; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 10px;">
                📊 JSON
            </button>
        </div>

        <div class="ai-description-footer" style="margin-top: 10px;">
            <button onclick="window.AIDescriptions.showAIHistoryList()" class="ai-close-btn">
                ← Back to History
            </button>
        </div>
    `;

    content.innerHTML = html;

    // Сохраняем текущее описание для копирования
    sidebar.dataset.currentDescription = desc.description;
}

/**
 * Отобразить AI-описание в sidebar
 */
function showAIDescriptionInSidebar(location, description, model, fromCache) {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const content = document.getElementById('aiDescriptionContent');
    if (!content) return;

    // Формируем HTML с описанием
    const cacheLabel = fromCache
        ? '<span style="color: var(--accent); font-size: 11px;">📦 From Cache</span>'
        : '<span style="color: var(--success); font-size: 11px;">✨ Fresh</span>';

    const html = `
        <div style="margin-bottom: 15px;">
            <button onclick="window.AIDescriptions.showAIHistoryList()" style="background: var(--bg-tertiary); border: 1px solid var(--border); padding: 6px 12px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 11px;">
                ← Back to History
            </button>
        </div>

        <div class="ai-description-header">
            <strong>${location.name || 'Unnamed Location'}</strong>
            <br>
            <span style="font-size: 11px; color: var(--text-secondary);">
                Model: ${model} | ${cacheLabel}
            </span>
        </div>

        <div class="ai-description-body">
            ${description.replace(/\n/g, '<br>')}
        </div>

        <div class="ai-description-footer">
            <button onclick="window.AIDescriptions.copyCurrentDescription(event)" class="ai-copy-btn">
                📋 Copy
            </button>
        </div>

        <div class="ai-description-footer" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button onclick="window.AIDescriptions.exportCurrentDescriptionTXT()" style="flex: 1; min-width: 80px; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 10px;">
                📄 TXT
            </button>
            <button onclick="window.AIDescriptions.exportCurrentDescriptionMD()" style="flex: 1; min-width: 80px; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 10px;">
                📝 MD
            </button>
            <button onclick="window.AIDescriptions.exportCurrentDescriptionJSON()" style="flex: 1; min-width: 80px; background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px; border-radius: 5px; cursor: pointer; color: var(--text-primary); font-size: 10px;">
                📊 JSON
            </button>
        </div>

        <div class="ai-description-footer" style="margin-top: 10px;">
            <button onclick="window.AIDescriptions.showAIHistoryList()" class="ai-close-btn">
                ← Back to History
            </button>
        </div>
    `;

    content.innerHTML = html;

    // Сохраняем текущее описание для копирования и экспорта
    sidebar.dataset.currentDescription = description;
    sidebar.dataset.currentLocation = JSON.stringify({
        name: location.name,
        type: location.type,
        lat: location.lat,
        lon: location.lon
    });
    sidebar.dataset.currentModel = model;

    // Показываем sidebar (без показа истории)
    toggleAISidebar(true, false);
}

/**
 * Копировать текущее AI-описание из sidebar
 */
async function copyCurrentDescription(event) {
    const sidebar = document.getElementById('aiDescriptionSidebar');
    if (!sidebar) return;

    const description = sidebar.dataset.currentDescription;
    if (!description) {
        alert('No description to copy');
        return;
    }

    const success = await copyDescriptionToClipboard(description);

    if (success) {
        // Показываем временное уведомление
        const btn = event ? event.target : null;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.background = 'var(--success)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    } else {
        alert('❌ Failed to copy to clipboard');
    }
}

/**
 * Копировать описание из истории
 */
async function copyDescriptionFromHistory(description, event) {
    const success = await copyDescriptionToClipboard(description);

    if (success) {
        const btn = event ? event.target : null;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.style.background = 'var(--success)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    } else {
        alert('❌ Failed to copy to clipboard');
    }
}

/**
 * Генерировать AI-описание для объекта (вызывается из popup маркера)
 */
async function generateDescriptionForLocation(location, event) {
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
        alert('⚠️ OpenRouter API key is not configured!\n\nPlease add your API key in Settings (⚙️ button).');
        return;
    }

    // Показываем индикатор загрузки в кнопке
    const btn = event ? event.target : null;
    let originalText = '🤖 AI Describe';

    if (btn) {
        originalText = btn.textContent;
        btn.textContent = '⏳ Generating...';
        btn.disabled = true;
    }

    try {
        const result = await generateAIDescription(location);

        // Показываем результат в sidebar
        showAIDescriptionInSidebar(
            location,
            result.description,
            result.model,
            result.fromCache
        );

    } catch (error) {
        alert(`❌ Error generating AI description:\n\n${error.message}`);
    } finally {
        // Восстанавливаем кнопку
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

/**
 * Обновить видимость секции Export AI
 */
function updateAIExportSectionVisibility() {
    const section = document.getElementById('aiExportSection');
    if (!section) return;

    const descriptions = getAllCachedDescriptions();

    if (descriptions.length > 0) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// ===========================================
// ЭКСПОРТ В ГЛОБАЛЬНЫЙ SCOPE
// ===========================================

window.AIDescriptions = {
    // Core функции
    generateAIDescription,
    testOpenRouterConnection,
    getOpenRouterApiKey,
    saveOpenRouterApiKey,
    getSelectedModel,
    saveSelectedModel,
    getCustomPrompt,
    getCachedDescription,
    cacheDescription,
    getAllCachedDescriptions,
    clearOldCaches,

    // UI функции
    testOpenRouterConnectionUI,
    toggleAISidebar,
    showAIDescriptionInSidebar,
    showAIHistoryList,
    showCachedDescription,
    copyCurrentDescription,
    copyDescriptionFromHistory,
    generateDescriptionForLocation,
    updateAIExportSectionVisibility,

    // Экспорт функции
    exportAIDescriptionsJSON,
    exportAIDescriptionsCSV,
    copyDescriptionToClipboard,
    exportCurrentDescriptionTXT,
    exportCurrentDescriptionMD,
    exportCurrentDescriptionJSON,
    exportSingleDescriptionTXT,
    exportSingleDescriptionMD,
    exportSingleDescriptionJSON,

    // Константы
    AI_MODELS
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Descriptions module loaded');
});
