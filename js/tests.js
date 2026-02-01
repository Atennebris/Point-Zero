// ============================================================
// Point Zero - Test Locations Toggle
// ============================================================

// Состояние раскрытия тестовых кнопок
let testButtonsExpanded = false;

// Переключение видимости Test Buttons
function toggleTestButtons() {
    testButtonsExpanded = !testButtonsExpanded;
    const list = document.getElementById('testButtonsList');
    const icon = document.getElementById('testButtonsToggleIcon');

    if (testButtonsExpanded) {
        list.style.display = 'block';
        icon.textContent = '▲';
    } else {
        list.style.display = 'none';
        icon.textContent = '▼';
    }
}

// Экспорт
window.Tests = {
    toggleTestButtons
};
