document.addEventListener('DOMContentLoaded', function () {
    const heroVisual = document.querySelector('.hero-visual');

    if (!heroVisual) {
        return;
    }

    window.addEventListener('mousemove', function (event) {
        const xOffset = (event.clientX / window.innerWidth - 0.5) * 10;
        const yOffset = (event.clientY / window.innerHeight - 0.5) * 10;
        heroVisual.style.transform = 'translate(' + xOffset * -0.5 + 'px, ' + yOffset * -0.4 + 'px)';
    });
});
