<?php
session_start();

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
$isLoggedIn = $userName !== '';
if ($userName === '') {
    $userName = 'Sleeper';
}

$pageTitle = 'DeepSleepers | Movement Tracker';
$pageStyles = ['assets/css/tracker-ui.css'];
$pageScripts = ['https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js', 'assets/js/dashboard.js'];
include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg dashboard-page">
    <div class="container-fluid py-3 py-lg-4">
        <div class="dashboard-shell p-3 p-lg-4">
            <div class="row g-4">
                <aside class="col-12 col-lg-3 col-xl-2">
                    <div class="sidebar-panel h-100">
                        <div class="brand-line d-flex align-items-center gap-2 mb-4">
                            <span class="avatar-dot"><i class="bi bi-person"></i></span>
                            <a href="index.php" class="brand-link"><strong>DeepSleepers</strong></a>
                        </div>
                        <nav class="nav flex-row flex-lg-column gap-2 dashboard-nav">
                            <a class="nav-link" href="discover.php"><i class="bi bi-compass"></i> Discover</a>
                            <a class="nav-link" href="daily-tracker.php"><i class="bi bi-calendar3"></i> Daily Tracker</a>
                            <a class="nav-link" href="sleep-tracker.php"><i class="bi bi-moon-stars"></i> Sleep Tracker</a>
                            <a class="nav-link active" href="#"><i class="bi bi-activity"></i> Movement Tracker</a>
                            <a class="nav-link" href="settings.php"><i class="bi bi-gear"></i> Settings</a>
                        </nav>
                        <a href="?action=logout" class="nav-link logout-btn mt-auto d-flex align-items-center gap-2"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </div>
                </aside>

                <section class="col-12 col-lg-9 col-xl-10" id="movementTrackerRoot">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <div>
                            <p class="daily-date mb-1">Movement patterns while sleeping</p>
                            <h1 class="h3 mb-0 text-light">Movement Tracker for <?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?></h1>
                        </div>
                        <div class="top-actions d-flex align-items-center gap-2">
                            <a href="#" class="notif-btn" aria-label="Notifications">
                                <i class="bi bi-bell"></i>
                                <span class="notif-count">3</span>
                            </a>
                            <?php if (!$isLoggedIn): ?>
                            <a href="index.php" class="home-btn"><i class="bi bi-house-door"></i> Home</a>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="movement-flow">
                        <article class="panel-card movement-hero-card p-3 p-lg-4">
                            <div class="movement-hero-head">
                                <div>
                                    <p class="movement-muted mb-1">Selected sleep date</p>
                                    <input type="date" class="movement-date-input" id="movementDateInput">
                                </div>
                                <div class="movement-type-block">
                                    <span class="movement-type-chip" id="movementSleeperType">Still sleeper</span>
                                    <div class="movement-type-rail" aria-hidden="true">
                                        <span id="movementTypeNeedle"></span>
                                    </div>
                                    <div class="movement-type-legend" aria-hidden="true">
                                        <span id="movementLegendStill">Still</span>
                                        <span id="movementLegendBalanced">Balanced</span>
                                        <span id="movementLegendMischievous">Mischievous</span>
                                    </div>
                                </div>
                            </div>
                            <div class="movement-hero-metrics">
                                <div class="movement-metric-box">
                                    <p>Movement score</p>
                                    <strong id="movementScore">0</strong>
                                </div>
                                <div class="movement-metric-box">
                                    <p>Turn events</p>
                                    <strong id="movementTurns">0</strong>
                                </div>
                                <div class="movement-metric-box">
                                    <p>Longest still period</p>
                                    <strong id="movementStillPeriod">0 min</strong>
                                </div>
                            </div>
                            <p class="movement-insight mb-0" id="movementInsight">Loading movement profile...</p>
                        </article>

                        <div class="row g-3 g-lg-4">
                            <div class="col-12 col-xl-8">
                                <article class="panel-card p-3 p-lg-4 movement-panel h-100">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Night movement pattern</h2>
                                        <span class="movement-muted">15-minute intervals</span>
                                    </div>
                                    <canvas id="movementPatternChart" height="180"></canvas>
                                </article>
                            </div>
                            <div class="col-12 col-xl-4">
                                <article class="panel-card p-3 p-lg-4 movement-panel h-100">
                                    <div class="movement-panel-head">
                                        <h2 class="h5 mb-0">Sleep style split</h2>
                                        <span class="movement-muted">Still vs active</span>
                                    </div>
                                    <canvas id="movementStyleChart" height="180"></canvas>
                                </article>
                            </div>
                        </div>

                        <article class="panel-card p-3 p-lg-4 movement-panel">
                            <div class="movement-panel-head mb-3">
                                <h2 class="h5 mb-0">Body movement heat strip</h2>
                                <span class="movement-muted">Darker bars mean calmer sleep</span>
                            </div>
                            <div class="movement-heat-strip" id="movementHeatStrip"></div>
                        </article>
                    </div>
                </section>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
