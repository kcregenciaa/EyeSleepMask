document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function () {
            // Allow normal form submit so PHP can set session and redirect.
        });
    }
});
