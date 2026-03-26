document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const ageInput = document.getElementById('age');
    const birthdateInput = document.getElementById('birthdate');
    let syncing = false;

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

    function formatDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function computeBirthdateFromAge(ageValue) {
        const parsedAge = parseInt(ageValue, 10);
        if (Number.isNaN(parsedAge) || parsedAge < 0) {
            return null;
        }

        const today = new Date();
        const birthDate = new Date(today.getFullYear() - parsedAge, today.getMonth(), today.getDate());
        return formatDate(birthDate);
    }

    if (birthdateInput && ageInput) {
        birthdateInput.addEventListener('change', function () {
            if (syncing) {
                return;
            }

            const calculatedAge = computeAge(birthdateInput.value);
            if (calculatedAge !== null && calculatedAge >= 0) {
                syncing = true;
                ageInput.value = calculatedAge;
                syncing = false;
            }
        });

        ageInput.addEventListener('input', function () {
            if (syncing) {
                return;
            }

            const computedBirthdate = computeBirthdateFromAge(ageInput.value);
            if (computedBirthdate !== null) {
                syncing = true;
                birthdateInput.value = computedBirthdate;
                syncing = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            const age = parseInt(ageInput.value, 10);
            const ageFromBirthdate = computeAge(birthdateInput.value);

            if (Number.isNaN(age) || age < 18 || ageFromBirthdate === null || ageFromBirthdate < 18 || age !== ageFromBirthdate) {
                event.preventDefault();
                window.alert('Age and birthdate must match and must be 18+ to register.');
            }
        });
    }
});
