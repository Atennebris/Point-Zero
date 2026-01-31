// ============================================================
// Point Zero - Валидация
// ============================================================

// Валидация широты
function validateLatitude() {
    const input = document.getElementById('latitude');
    const error = document.getElementById('latError');
    const value = parseFloat(input.value);

    if (isNaN(value) || value < -90 || value > 90) {
        input.classList.add('input-error');
        error.textContent = 'Latitude must be between -90 and 90';
        error.classList.add('show');
        return false;
    } else {
        input.classList.remove('input-error');
        error.classList.remove('show');
        return true;
    }
}

// Валидация долготы
function validateLongitude() {
    const input = document.getElementById('longitude');
    const error = document.getElementById('lonError');
    const value = parseFloat(input.value);

    if (isNaN(value) || value < -180 || value > 180) {
        input.classList.add('input-error');
        error.textContent = 'Longitude must be between -180 and 180';
        error.classList.add('show');
        return false;
    } else {
        input.classList.remove('input-error');
        error.classList.remove('show');
        return true;
    }
}

// Валидация радиуса
function validateRadius() {
    const input = document.getElementById('radius');
    const error = document.getElementById('radiusError');
    const value = parseFloat(input.value);

    if (isNaN(value) || value < 0.001 || value > 10000) {
        input.classList.add('input-error');
        error.textContent = 'Radius must be between 0.001 km (1m) and 10,000 km';
        error.classList.add('show');
        return false;
    } else {
        input.classList.remove('input-error');
        error.classList.remove('show');
        return true;
    }
}

// Валидация всех полей
function validateAllInputs() {
    const latValid = validateLatitude();
    const lonValid = validateLongitude();
    const radiusValid = validateRadius();
    return latValid && lonValid && radiusValid;
}

// Настройка валидации при загрузке
function setupValidation() {
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const radiusInput = document.getElementById('radius');

    latInput.addEventListener('input', () => validateLatitude());
    latInput.addEventListener('blur', () => validateLatitude());
    lonInput.addEventListener('input', () => validateLongitude());
    lonInput.addEventListener('blur', () => validateLongitude());
    radiusInput.addEventListener('input', () => validateRadius());
    radiusInput.addEventListener('blur', () => validateRadius());
}

// Экспорт
window.Validation = {
    validateLatitude,
    validateLongitude,
    validateRadius,
    validateAllInputs,
    setupValidation
};
