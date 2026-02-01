// ============================================================
// Point Zero - Export Functionality
// ============================================================

// Открытие модального окна экспорта
function openExportModal() {
    const modal = document.getElementById('exportModal');
    modal.classList.add('show');

    // Генерация имени файла с timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    document.getElementById('exportFilename').value = `point_zero_${timestamp}`;
}

// Закрытие модального окна экспорта
function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.classList.remove('show');
}

// Выполнение экспорта
async function executeExport() {
    const format = document.getElementById('exportFormat').value;
    const filename = document.getElementById('exportFilename').value || 'point_zero_results';

    // Если выбран ZIP - экспортируем все форматы сразу
    if (format === 'zip') {
        await exportToZIP(filename);
        closeExportModal();
        return;
    }

    // Иначе экспортируем один формат
    let content, mimeType, extension;

    switch (format) {
        case 'csv':
            content = exportToCSV(window.AppState.allResults);
            mimeType = 'text/csv;charset=utf-8;';
            extension = 'csv';
            break;
        case 'json':
            content = exportToJSON(window.AppState.allResults);
            mimeType = 'application/json';
            extension = 'json';
            break;
        case 'geojson':
            content = exportToGeoJSON(window.AppState.allResults);
            mimeType = 'application/geo+json';
            extension = 'geojson';
            break;
        case 'html':
            content = exportToHTML(window.AppState.allResults);
            mimeType = 'text/html';
            extension = 'html';
            break;
        case 'txt':
            content = exportToTXT(window.AppState.allResults);
            mimeType = 'text/plain';
            extension = 'txt';
            break;
        case 'md':
            content = exportToMD(window.AppState.allResults);
            mimeType = 'text/markdown';
            extension = 'md';
            break;
    }

    downloadFile(content, `${filename}.${extension}`, mimeType);
    closeExportModal();
}

// Экспорт в CSV формат
function exportToCSV(results) {
    const headers = ['Type', 'Name', 'Subtype', 'Latitude', 'Longitude', 'Source'];
    const rows = results.map(r => [
        r.type,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.subtype.replace(/"/g, '""')}"`,
        r.coords[0],
        r.coords[1],
        r.source
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Экспорт в JSON формат
function exportToJSON(results) {
    const data = {
        metadata: {
            exportDate: new Date().toISOString(),
            totalResults: results.length,
            tool: 'Point Zero OSINT',
            version: '1.0.0'
        },
        results: results
    };
    return JSON.stringify(data, null, 2);
}

// Экспорт в GeoJSON формат
function exportToGeoJSON(results) {
    const features = results.map(r => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [r.coords[1], r.coords[0]] // GeoJSON использует [lon, lat]
        },
        properties: {
            type: r.type,
            name: r.name,
            subtype: r.subtype,
            source: r.source
        }
    }));

    return JSON.stringify({
        type: 'FeatureCollection',
        features: features
    }, null, 2);
}

// Экспорт в HTML формат
function exportToHTML(results) {
    const military = results.filter(r => r.type === 'military').length;
    const hospitals = results.filter(r => r.type === 'hospital').length;

    const rows = results.map(r => `
        <tr>
            <td>${r.type}</td>
            <td>${r.name}</td>
            <td>${r.subtype}</td>
            <td>${r.coords[0].toFixed(4)}</td>
            <td>${r.coords[1].toFixed(4)}</td>
            <td>${r.source}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Point Zero OSINT Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        h1 { color: #d32f2f; }
        .summary { background: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; background: white; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #d32f2f; color: white; }
        tr:hover { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>🎯 Point Zero OSINT Report</h1>
    <div class="summary">
        <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Results:</strong> ${results.length}</p>
        <p><strong>Military Facilities:</strong> ${military}</p>
        <p><strong>Hospitals:</strong> ${hospitals}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Subtype</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Source</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
</body>
</html>`;
}

// Экспорт в TXT формат
function exportToTXT(results) {
    const lines = [
        '='.repeat(60),
        'POINT ZERO OSINT REPORT',
        '='.repeat(60),
        `Export Date: ${new Date().toLocaleString()}`,
        `Total Results: ${results.length}`,
        '',
        'RESULTS:',
        '-'.repeat(60)
    ];

    results.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.name}`);
        lines.push(`   Type: ${r.type} | Subtype: ${r.subtype}`);
        lines.push(`   Coordinates: ${r.coords[0].toFixed(4)}, ${r.coords[1].toFixed(4)}`);
        lines.push(`   Source: ${r.source}`);
        lines.push('');
    });

    return lines.join('\n');
}

// Экспорт в Markdown формат
function exportToMD(results) {
    const military = results.filter(r => r.type === 'military').length;
    const hospitals = results.filter(r => r.type === 'hospital').length;

    const rows = results.map(r =>
        `| ${r.type} | ${r.name} | ${r.subtype} | ${r.coords[0].toFixed(4)} | ${r.coords[1].toFixed(4)} | ${r.source} |`
    ).join('\n');

    return `# 🎯 Point Zero OSINT Report

## Summary

- **Export Date:** ${new Date().toLocaleString()}
- **Total Results:** ${results.length}
- **Military Facilities:** ${military}
- **Hospitals:** ${hospitals}

## Results

| Type | Name | Subtype | Latitude | Longitude | Source |
|------|------|---------|----------|-----------|--------|
${rows}

---

Generated by [Point Zero OSINT](https://github.com/pointzero)
`;
}

// Экспорт в ZIP архив (все форматы сразу)
async function exportToZIP(baseFilename) {
    if (typeof JSZip === 'undefined') {
        window.Notifications.error('JSZip library not loaded! Cannot create ZIP archive.');
        return;
    }

    try {
        // Создаем новый ZIP архив
        const zip = new JSZip();
        const results = window.AppState.allResults;

        // Добавляем все форматы в архив
        zip.file(`${baseFilename}.csv`, exportToCSV(results));
        zip.file(`${baseFilename}.json`, exportToJSON(results));
        zip.file(`${baseFilename}.geojson`, exportToGeoJSON(results));
        zip.file(`${baseFilename}.html`, exportToHTML(results));
        zip.file(`${baseFilename}.txt`, exportToTXT(results));
        zip.file(`${baseFilename}.md`, exportToMD(results));

        // Добавляем README с информацией
        const readme = `# Point Zero OSINT Export

Export Date: ${new Date().toLocaleString()}
Total Results: ${results.length}

## Files Included:
- ${baseFilename}.csv - Excel/Google Sheets format
- ${baseFilename}.json - JSON format with metadata
- ${baseFilename}.geojson - GeoJSON for GIS tools
- ${baseFilename}.html - HTML report (open in browser)
- ${baseFilename}.txt - Plain text list
- ${baseFilename}.md - Markdown format

Generated by Point Zero OSINT Tool
https://github.com/pointzero
`;
        zip.file('README.txt', readme);

        // Генерируем ZIP файл
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });

        // Скачиваем
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${baseFilename}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        console.log('✅ ZIP export completed:', `${baseFilename}.zip`);
    } catch (error) {
        console.error('❌ ZIP export failed:', error);
        window.Notifications.error(`Failed to create ZIP archive:\n\n${error.message}`);
    }
}

// Скачивание файла
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Экспорт
window.Export = {
    openExportModal,
    closeExportModal,
    executeExport,
    exportToCSV,
    exportToJSON,
    exportToGeoJSON,
    exportToHTML,
    exportToTXT,
    exportToMD,
    exportToZIP,
    downloadFile
};
