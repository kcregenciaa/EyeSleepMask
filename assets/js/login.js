document.addEventListener('DOMContentLoaded', function () {
    const loader = document.getElementById('pageLoader');
    const loginForm = document.getElementById('loginForm');

    window.setTimeout(function () {
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 2100);

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            window.location.href = 'dashboard.php';
        });
    }
});
