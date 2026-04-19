<?php
session_start();

require __DIR__ . '/backend/auth_guard.php';

if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    session_destroy();
    header('Location: login.php');
    exit;
}

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'Sleeper';
}
$displayName = ucwords($userName);

$pageTitle = 'Doze | Statistics';
$pageStyles = ['assets/css/tracker-ui.css'];
$pageScripts = ['https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js', 'assets/js/dashboard.js'];
include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg dashboard-page statistics-page">
    <div class="container-fluid py-3 py-lg-4">
        <div class="dashboard-shell p-3 p-lg-4">
            <div class="row g-4">
                <section class="col-12" id="movementTrackerRoot">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <h1 class="h3 mb-0 text-light">How's your sleep, <?php echo htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8'); ?>?</h1>
                        <div class="profile-avatar">
                            <?php echo strtoupper(substr($displayName, 0, 1)); ?>
                        </div>
                    </div>

                    <div class="movement-flow">
                        <div class="device-connection-block">
                            <div class="device-connection-status-row">
                                <img src="assets/images/bluetooth.png" alt="Bluetooth" class="device-bluetooth-icon" loading="lazy">
                                <div class="device-connection-text">
                                    <p class="movement-muted mb-1">Your Device is</p>
                                    <p class="device-connection-state mb-0" id="deviceConnectionStateLabel">⚪ Disconnected</p>
                                </div>
                            </div>
                        </div>

                        <h2 class="sleep-section-title sleep-overview-title mb-2">Sleep Overview</h2>

                        <article class="panel-card sleep-calendar-card p-3 p-lg-4">
                            <div class="sleep-quality-top">
                                <div class="daily-week-nav" role="group" aria-label="Week navigation">
                                    <button type="button" class="daily-week-btn" id="dailyPrevWeek" aria-label="View previous week"><i class="bi bi-chevron-left"></i></button>
                                    <span class="daily-week-range" id="dailyCalendarRange">This week</span>
                                    <button type="button" class="daily-week-btn" id="dailyNextWeek" aria-label="View next week"><i class="bi bi-chevron-right"></i></button>
                                </div>
                            </div>

                            <div class="daily-calendar-days sleep-quality-days" id="dailyCalendarDays"></div>
                        </article>

                        <article class="panel-card sleep-quality-card sleep-quality-details-card p-3 p-lg-4 mt-3">
                            <div class="sleep-summary-container">
                                <div class="sleep-summary-main">
                                    <div class="sleep-summary-item score-item">
                                        <p class="sleep-item-label">Sleep Score</p>
                                        <div class="sleep-score-display">
                                            <span class="sleep-score-number" id="sleepScoreDisplay">76</span>
                                        </div>
                                    </div>
                                    
                                    <div class="sleep-summary-item quality-item">
                                        <p class="sleep-item-label">Sleep Quality</p>
                                        <div class="sleep-quality-badge" id="sleepQualityBadge" data-quality="fair">
                                            <span id="sleepQualityText">Fair</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="sleep-summary-details mt-4 pt-4">
                                    <div class="sleep-metric-box">
                                        <p>Bedtime</p>
                                        <strong id="dailyBedtime">--</strong>
                                    </div>
                                    <div class="sleep-metric-box">
                                        <p>Wake up</p>
                                        <strong id="dailyWokeUp">--</strong>
                                    </div>
                                    <div class="sleep-metric-box">
                                        <p>Duration</p>
                                        <strong id="dailyInBed">--</strong>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <div class="row g-3 g-lg-4 mt-0">
                            <div class="col-12">
                                <article class="panel-card p-3 p-lg-4 movement-panel h-100">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Movement Trend</h2>
                                        <span class="movement-muted">Overnight movement intensity</span>
                                    </div>
                                    <canvas id="movementPatternChart" aria-label="Movement trend graph" role="img" height="100"></canvas>
                                </article>
                            </div>
                            <div class="col-12 col-xl-6">
                                <article class="panel-card p-3 p-lg-4 movement-panel h-100" id="snoreGraphPanel">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Snore Level Trend</h2>
                                        <span class="movement-muted" id="snoreGraphStatus">Waiting for live metrics...</span>
                                    </div>
                                    <canvas id="snoreTrendChart" aria-label="Snore level graph" role="img" height="100"></canvas>
                                </article>
                            </div>
                            <div class="col-12 col-xl-6">
                                <article class="panel-card p-3 p-lg-4 movement-panel h-100" id="heartRateGraphPanel">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Heart Rate Trend</h2>
                                        <span class="movement-muted" id="heartRateGraphStatus">Waiting for live metrics...</span>
                                    </div>
                                    <canvas id="heartRateTrendChart" aria-label="Heart rate graph" role="img" height="100"></canvas>
                                </article>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-footbar.php'; ?>
<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>


