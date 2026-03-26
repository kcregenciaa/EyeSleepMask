document.addEventListener('DOMContentLoaded', function () {
    const chartDefaults = {
        color: '#99afc8',
        borderColor: 'rgba(121, 167, 217, 0.18)',
        tickColor: 'rgba(110, 148, 192, 0.16)'
    };

    const revenueCanvas = document.getElementById('revenueChart');
    if (revenueCanvas) {
        new Chart(revenueCanvas, {
            type: 'line',
            data: {
                labels: ['W1', 'W2', 'W3', 'W4'],
                datasets: [{
                    data: [120, 380, 300, 650],
                    borderColor: '#8bd8ff',
                    backgroundColor: 'rgba(90, 201, 255, 0.16)',
                    fill: true,
                    tension: 0.36,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }

    const barCanvas = document.getElementById('barChart');
    if (barCanvas) {
        new Chart(barCanvas, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    data: [90, 180, 95, 160, 70],
                    borderRadius: 8,
                    backgroundColor: ['#6a88ab', '#8ea5c6', '#6a88ab', '#8ea5c6', '#6a88ab']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }

    const engagementCanvas = document.getElementById('engagementChart');
    if (engagementCanvas) {
        new Chart(engagementCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    data: [180, 220, 300, 380, 420, 500, 550, 610, 680, 720, 800, 890],
                    borderColor: '#afc8e4',
                    backgroundColor: 'rgba(162, 188, 218, 0.12)',
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#e3f1ff',
                    pointBorderWidth: 0,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }

    const accelCanvas = document.getElementById('accelChart');
    if (accelCanvas) {
        new Chart(accelCanvas, {
            type: 'bar',
            data: {
                labels: ['X', 'Y', 'Z'],
                datasets: [{
                    data: [0.2, 0.1, 9.8],
                    borderRadius: 6,
                    backgroundColor: ['#57d0ff', '#57d0ff', '#8bd8ff']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: chartDefaults.borderColor },
                        ticks: { color: chartDefaults.color },
                        max: 10
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartDefaults.color }
                    }
                }
            }
        });
    }
});
