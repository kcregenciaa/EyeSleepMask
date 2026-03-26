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
if ($userName === '') {
    $userName = 'Sleeper';
}

$pageTitle = 'DeepSleepers | Dashboard';
$pageStyles = ['assets/css/dashboard.css'];
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
                            <strong>DeepSleepers</strong>
                        </div>
                        <nav class="nav flex-row flex-lg-column gap-2 dashboard-nav">
                            <a class="nav-link active" href="#"><i class="bi bi-grid"></i> Dashboard</a>
                            <a class="nav-link" href="settings.php"><i class="bi bi-gear"></i> Settings</a>
                        </nav>
                        <a href="?action=logout" class="nav-link logout-btn mt-auto d-flex align-items-center gap-2"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </div>
                </aside>

                <section class="col-12 col-lg-9 col-xl-10">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <h1 class="h3 mb-0 text-light">Hi, <?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?></h1>
                        <a href="index.php" class="home-btn"><i class="bi bi-house-door"></i> Home</a>
                    </div>

                    <div class="row g-3 g-lg-4">
                        <div class="col-12 col-xl-6">
                            <article class="panel-card p-3 p-lg-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h2 class="h5 mb-0">Weekly Report</h2>
                                    <span class="chip">Week 1 - 4</span>
                                </div>
                                <canvas id="revenueChart" height="170"></canvas>
                            </article>
                        </div>





                        <div class="col-12 col-xl-6">
                            <article class="panel-card p-3 p-lg-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h2 class="h5 mb-0">Monthly Report</h2>
                                    <span class="chip">All Month</span>
                                </div>
                                <canvas id="engagementChart" height="170"></canvas>
                            </article>
                        </div>

                        <div class="col-12 col-xl-6">
                            <article class="panel-card p-3 p-lg-4">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h2 class="h5 mb-0">ACCELEROMETERS</h2>
                                    <span class="chip">Active</span>
                                </div>
                                <canvas id="accelChart" height="170"></canvas>
                            </article>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
