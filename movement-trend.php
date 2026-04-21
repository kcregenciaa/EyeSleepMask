<?php
session_start();

require __DIR__ . '/backend/auth_guard.php';

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'Sleeper';
}
$displayName = ucwords($userName);

$pageTitle = 'Doze | Movement Trend';
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
                        <h1 class="h3 mb-0 text-light">Movement Trend Details, <?php echo htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8'); ?></h1>
                        <a href="statistics.php" class="movement-back-link" aria-label="Back to statistics">&larr;</a>
                    </div>

                    <div class="movement-flow">
                        <div class="row g-3 g-lg-4 mt-0">
                            <div class="col-12">
                                <article class="panel-card p-3 p-lg-4 movement-panel movement-panel-trend h-100">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Movement Trend</h2>
                                        <span class="movement-muted">Overnight movement intensity</span>
                                    </div>
                                    <canvas id="movementPatternChart" aria-label="Movement trend graph" role="img" height="100"></canvas>

                                    <div class="movement-trend-extras mt-3">
                                        <div class="movement-stage-wrap">
                                            <div class="movement-extra-head">
                                                <span>Sleep Stage Estimation</span>
                                                <small class="movement-muted" id="movementStageSummary">Waiting for data...</small>
                                            </div>
                                            <div class="movement-stage-timeline" id="movementStageTimeline" aria-label="Estimated sleep stages timeline"></div>
                                            <div class="movement-stage-legend">
                                                <span><i class="stage-dot stage-deep"></i>Deep Sleep</span>
                                                <span><i class="stage-dot stage-light"></i>Light Sleep</span>
                                                <span><i class="stage-dot stage-awake"></i>Awake</span>
                                            </div>
                                        </div>

                                        <div class="movement-extra-grid">
                                            <div class="movement-extra-card">
                                                <p>Movement Score</p>
                                                <strong id="movementScoreValue">--/100</strong>
                                                <div class="movement-score-meter">
                                                    <span id="movementScoreMeterFill"></span>
                                                </div>
                                                <small class="movement-muted" id="movementScoreLabel">Waiting for data...</small>
                                            </div>
                                            <div class="movement-extra-card">
                                                <p>Tosses &amp; Turns</p>
                                                <strong id="tossTurnCount">--</strong>
                                                <small class="movement-muted" id="disturbanceCountText">Disturbance markers unavailable.</small>
                                            </div>
                                            <div class="movement-extra-card">
                                                <p>Movement Stability</p>
                                                <strong id="movementStabilityLabel">--</strong>
                                                <small class="movement-muted" id="movementStabilityHint">Waiting for telemetry...</small>
                                            </div>
                                        </div>

                                        <p class="movement-disturbance-detail mt-2 mb-0" id="movementDisturbanceDetail">Tap a disturbance marker on the graph to see its exact time.</p>
                                    </div>
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
