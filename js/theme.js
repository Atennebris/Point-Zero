// ============================================================
// Point Zero - Темы (Dark/Light Mode)
// ============================================================

// Загрузка сохраненной темы
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

// Переключение темы
function toggleTheme() {
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    if (root.classList.contains('light-theme')) {
        root.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Экспорт
window.Theme = {
    loadTheme,
    toggleTheme
};
