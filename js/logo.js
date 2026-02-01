// ============================================================
// Point Zero - Logo интерактивность
// ============================================================

// Счетчик кликов на logo
let logoClickCount = 0;

// Обработка клика на logo
function handleLogoClick() {
    const logo = document.getElementById('sidebarLogo');

    // Увеличение счетчика
    logoClickCount++;

    // Каждые 10 кликов - кувырок
    if (logoClickCount % 10 === 0) {
        // Убираем предыдущие анимации
        logo.classList.remove('pulse', 'flip');

        // Принудительный reflow для перезапуска анимации
        void logo.offsetWidth;

        // Добавляем анимацию кувырка
        logo.classList.add('flip');

        // Убираем класс после завершения анимации
        setTimeout(() => {
            logo.classList.remove('flip');
        }, 800);

        console.log('🎉 10-й клик! Кувырок выполнен!');
    } else {
        // Обычная пульсация
        logo.classList.remove('pulse', 'flip');

        // Принудительный reflow
        void logo.offsetWidth;

        // Добавляем пульсацию
        logo.classList.add('pulse');

        // Убираем класс после анимации
        setTimeout(() => {
            logo.classList.remove('pulse');
        }, 300);
    }
}

// Экспорт
window.Logo = {
    handleLogoClick
};
