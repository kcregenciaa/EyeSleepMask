document.addEventListener('DOMContentLoaded', function () {
    const motionFeed = document.getElementById('motionFeed');

    const updateMotionFeed = function (entries) {
        if (!motionFeed) {
            return;
        }

        motionFeed.textContent = JSON.stringify(entries, null, 2);
    };

    const loadMotionData = function () {
        fetch('/api/motion-data.php', { cache: 'no-store' })
            .then(function (response) { return response.json(); })
            .then(function (payload) {
                updateMotionFeed(payload.data || []);
            })
            .catch(function () {
                if (motionFeed) {
                    motionFeed.textContent = 'Motion data is unavailable until Apache/XAMPP is running.';
                }
            });
    };

    window.postMotionSample = function (motion) {
        return fetch('/api/motion-data.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motion: motion })
        }).then(function (response) { return response.json(); });
    };

    loadMotionData();
    setInterval(loadMotionData, 2000);
});
