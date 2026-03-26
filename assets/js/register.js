document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const ageInput = document.getElementById('age');
    const birthdateInput = document.getElementById('birthdate');

    function computeAge(dateValue) {
        if (!dateValue) {
            return null;
        }

        const birthDate = new Date(dateValue + 'T00:00:00');
        if (Number.isNaN(birthDate.getTime())) {
            return null;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    if (birthdateInput && ageInput) {
        birthdateInput.addEventListener('change', function () {
            const calculatedAge = computeAge(birthdateInput.value);
            if (calculatedAge !== null && calculatedAge >= 0) {
                ageInput.value = calculatedAge;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            const age = parseInt(ageInput.value, 10);
            const ageFromBirthdate = computeAge(birthdateInput.value);

            if (Number.isNaN(age) || age < 18 || ageFromBirthdate === null || ageFromBirthdate < 18) {
                event.preventDefault();
                window.alert('Registration is only allowed for users aged 18 and above.');
            }
        });
    }
});
