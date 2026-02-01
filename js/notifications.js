/**
 * Модуль Notifications
 * Кастомные popup уведомления вместо браузерных alert/confirm
 */

// ===========================================
// УТИЛИТЫ ДЛЯ СОЗДАНИЯ POPUP
// ===========================================

/**
 * Показать кастомный alert
 */
function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        // Удаляем существующие popup'ы
        removeExistingPopups();

        // Определяем иконку и цвет по типу
        let icon = 'ℹ️';
        let accentColor = 'var(--accent)';

        switch(type) {
            case 'success':
                icon = '✅';
                accentColor = 'var(--success)';
                break;
            case 'error':
                icon = '❌';
                accentColor = 'var(--error)';
                break;
            case 'warning':
                icon = '⚠️';
                accentColor = 'var(--warning)';
                break;
            case 'info':
            default:
                icon = 'ℹ️';
                accentColor = 'var(--accent)';
                break;
        }

        // Создаем overlay
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        `;

        // Создаем popup
        const popup = document.createElement('div');
        popup.className = 'notification-popup';
        popup.style.cssText = `
            background: var(--bg-secondary);
            border: 2px solid ${accentColor};
            border-radius: 8px;
            padding: 25px;
            max-width: 400px;
            min-width: 300px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            animation: slideDown 0.3s ease-out;
        `;

        // Контент popup
        popup.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 20px;">
                <div style="font-size: 32px; line-height: 1;">${icon}</div>
                <div style="flex: 1; color: var(--text-primary); font-size: 14px; line-height: 1.5;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="notification-btn" style="
                    background: ${accentColor};
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                ">OK</button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Обработчик кнопки OK
        const okBtn = popup.querySelector('.notification-btn');
        okBtn.addEventListener('click', () => {
            closePopup(overlay, resolve);
        });

        // Закрытие по клику на overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePopup(overlay, resolve);
            }
        });

        // Закрытие по ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closePopup(overlay, resolve);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Hover эффект для кнопки
        okBtn.addEventListener('mouseenter', () => {
            okBtn.style.opacity = '0.8';
        });
        okBtn.addEventListener('mouseleave', () => {
            okBtn.style.opacity = '1';
        });
    });
}

/**
 * Показать кастомный confirm
 */
function showConfirm(message, options = {}) {
    return new Promise((resolve) => {
        // Удаляем существующие popup'ы
        removeExistingPopups();

        const {
            confirmText = 'Yes',
            cancelText = 'Cancel',
            type = 'warning'
        } = options;

        // Определяем иконку и цвет
        let icon = '⚠️';
        let accentColor = 'var(--warning)';

        switch(type) {
            case 'danger':
                icon = '🗑️';
                accentColor = 'var(--error)';
                break;
            case 'warning':
            default:
                icon = '⚠️';
                accentColor = 'var(--warning)';
                break;
        }

        // Создаем overlay
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        `;

        // Создаем popup
        const popup = document.createElement('div');
        popup.className = 'notification-popup';
        popup.style.cssText = `
            background: var(--bg-secondary);
            border: 2px solid ${accentColor};
            border-radius: 8px;
            padding: 25px;
            max-width: 450px;
            min-width: 350px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            animation: slideDown 0.3s ease-out;
        `;

        // Контент popup
        popup.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 25px;">
                <div style="font-size: 32px; line-height: 1;">${icon}</div>
                <div style="flex: 1; color: var(--text-primary); font-size: 14px; line-height: 1.5;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="notification-btn-cancel" style="
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                    padding: 10px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                ">${cancelText}</button>
                <button class="notification-btn-confirm" style="
                    background: ${accentColor};
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: opacity 0.2s;
                ">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Обработчики кнопок
        const confirmBtn = popup.querySelector('.notification-btn-confirm');
        const cancelBtn = popup.querySelector('.notification-btn-cancel');

        confirmBtn.addEventListener('click', () => {
            closePopup(overlay, () => resolve(true));
        });

        cancelBtn.addEventListener('click', () => {
            closePopup(overlay, () => resolve(false));
        });

        // Закрытие по клику на overlay = Cancel
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePopup(overlay, () => resolve(false));
            }
        });

        // Закрытие по ESC = Cancel
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closePopup(overlay, () => resolve(false));
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Hover эффекты
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.opacity = '0.8';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.opacity = '1';
        });

        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = 'var(--bg-primary)';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'var(--bg-tertiary)';
        });
    });
}

/**
 * Закрыть popup с анимацией
 */
function closePopup(overlay, callback) {
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    const popup = overlay.querySelector('.notification-popup');
    if (popup) {
        popup.style.animation = 'slideUp 0.2s ease-out';
    }

    setTimeout(() => {
        overlay.remove();
        if (callback) callback();
    }, 200);
}

/**
 * Удалить существующие popup'ы
 */
function removeExistingPopups() {
    const existing = document.querySelectorAll('.notification-overlay');
    existing.forEach(el => el.remove());
}

// ===========================================
// CSS АНИМАЦИИ
// ===========================================

// Добавляем стили анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    @keyframes slideDown {
        from {
            transform: translateY(-30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-30px);
            opacity: 0;
        }
    }

    .notification-btn:active,
    .notification-btn-confirm:active,
    .notification-btn-cancel:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(style);

// ===========================================
// ЭКСПОРТ
// ===========================================

window.Notifications = {
    alert: showAlert,
    confirm: showConfirm,
    success: (msg) => showAlert(msg, 'success'),
    error: (msg) => showAlert(msg, 'error'),
    warning: (msg) => showAlert(msg, 'warning'),
    info: (msg) => showAlert(msg, 'info')
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Notifications module loaded');
});
