<?php
session_start();

require __DIR__ . '/backend/auth_guard.php';

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'Sleeper';
}
$displayName = ucwords($userName);

$pageTitle = 'Doze | Snore Trend';
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
                        <h1 class="h3 mb-0 text-light">Snore Level Trend, <?php echo htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8'); ?></h1>
                        <a href="statistics.php" class="movement-back-link" aria-label="Back to statistics">&larr;</a>
                    </div>

                    <div class="movement-flow">
                        <div class="row g-3 g-lg-4 mt-0">
                            <div class="col-12">
                                <article class="panel-card p-3 p-lg-4 movement-panel movement-panel-trend h-100" id="snoreGraphPanel">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Snore Level Trend</h2>
                                        <span class="movement-muted" id="snoreGraphStatus">Waiting for live metrics...</span>
                                    </div>
                                    <canvas id="snoreTrendChart" aria-label="Snore level graph" role="img" height="110"></canvas>
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
