// ============================================
// MATERIAL DESIGN 3 - PERFECT FORM JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggle();
    initNumberControls();
    initSlider();
    initColorPicker();
    initFormSubmit();
});

// ============================================
// 1. PASSWORD TOGGLE
// ============================================
function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwort');
    const eyeIcon = toggleBtn.querySelector('.m3-icon-eye');
    const eyeOffIcon = toggleBtn.querySelector('.m3-icon-eye-off');

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeIcon.style.display = isPassword ? 'none' : 'block';
        eyeOffIcon.style.display = isPassword ? 'block' : 'none';
    });
}

// ============================================
// 2. NUMBER FIELD CONTROLS
// ============================================
function initNumberControls() {
    const input = document.getElementById('anzahl');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');

    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 0;
        const min = parseInt(input.min) || 0;
        if (currentValue > min) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('input'));
        }
    });

    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value) || 0;
        const max = parseInt(input.max) || 100;
        if (currentValue < max) {
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('input'));
        }
    });
}

// ============================================
// 3. SLIDER
// ============================================
function initSlider() {
    const sliderInput = document.getElementById('lautstaerke');
    const sliderThumb = document.getElementById('sliderThumb');
    const sliderTrackActive = document.getElementById('sliderTrackActive');
    const sliderValue = document.getElementById('sliderValue');

    function updateSlider() {
        const value = sliderInput.value;
        const percentage = (value / sliderInput.max) * 100;

        sliderTrackActive.style.width = percentage + '%';
        sliderThumb.style.left = percentage + '%';
        sliderValue.textContent = value;
    }

    // Initial update
    updateSlider();

    // Update on input
    sliderInput.addEventListener('input', updateSlider);
}

// ============================================
// 4. COLOR PICKER
// ============================================
function initColorPicker() {
    const colorInput = document.getElementById('farbe');
    const colorSwatch = document.getElementById('colorSwatch');
    const colorValue = document.getElementById('colorValue');
    const colorDisplay = document.querySelector('.m3-color-display');

    function updateColor() {
        const color = colorInput.value;
        colorSwatch.style.setProperty('--color-value', color);
        colorValue.textContent = color.toUpperCase();
    }

    // Initial update
    updateColor();

    // Update on change
    colorInput.addEventListener('input', updateColor);

    // Click on display to open color picker
    colorDisplay.addEventListener('click', () => {
        colorInput.click();
    });
}

// ============================================
// 5. FORM SUBMIT
// ============================================
function initFormSubmit() {
    const form = document.getElementById('m3Form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect form data
        const formData = {
            datum: document.getElementById('datum').value,
            zeit: document.getElementById('zeit').value,
            passwort: document.getElementById('passwort').value,
            anzahl: document.getElementById('anzahl').value,
            farbe: document.getElementById('farbe').value,
            lautstaerke: document.getElementById('lautstaerke').value,
            nachricht: document.getElementById('nachricht').value,
            agb: document.getElementById('agb').checked,
            notifications: document.getElementById('notifications').checked,
            tarif: document.querySelector('input[name="tarif"]:checked')?.value
        };

        console.log('Form submitted:', formData);
        alert('Formular erfolgreich gesendet!\n\nSiehe Console für Details.');
    });

    // Reset button
    const resetBtn = form.querySelector('.m3-button-text');
    resetBtn.addEventListener('click', () => {
        form.reset();

        // Reset slider
        const sliderInput = document.getElementById('lautstaerke');
        sliderInput.value = 50;
        sliderInput.dispatchEvent(new Event('input'));

        // Reset color
        const colorInput = document.getElementById('farbe');
        colorInput.value = '#1a73e8';
        colorInput.dispatchEvent(new Event('input'));
    });
}
