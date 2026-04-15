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

$pageTitle = 'DeepSleepers | Device';
$pageStyles = ['assets/css/tracker-ui.css'];
$pageScripts = ['assets/js/dashboard.js'];
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
                            <a class="nav-link" href="sleep-tracker.php"><i class="bi bi-moon-stars"></i> Clock</a>
                            <a class="nav-link" href="movement-tracker.php"><i class="bi bi-activity"></i> Movement Tracker</a>
                            <a class="nav-link" href="snoring-tracker.php"><i class="bi bi-chat-dots"></i> Snoring Tracker</a>
                            <a class="nav-link active" href="#"><i class="bi bi-cpu"></i> Device</a>
                            <a class="nav-link" href="settings.php"><i class="bi bi-gear"></i> Settings</a>
                        </nav>
                        <a href="?action=logout" class="nav-link logout-btn mt-auto d-flex align-items-center gap-2"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </div>
                </aside>

                <section class="col-12 col-lg-9 col-xl-10">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <h1 class="h3 mb-0 text-light">Device for <?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?></h1>
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

                    <div class="row g-3 g-lg-4 justify-content-center" id="deviceLivePanel">
                        <div class="col-12 col-md-10 col-lg-8 col-xl-5 mx-auto device-module-center">
                            <div class="device-connection-block mb-3">
                                <div class="device-connection-status-row">
                                    <img src="assets/images/bluetooth.png" alt="Bluetooth" class="device-bluetooth-icon" loading="lazy">
                                    <div class="device-connection-text">
                                        <p class="movement-muted mb-1">Your Device is</p>
                                        <p class="device-connection-state mb-0" id="deviceConnectionStateLabel">⚪ Disconnected</p>
                                    </div>
                                </div>
                            </div>
                            <article class="panel-card device-status-card p-3 p-lg-4">
                                <div class="device-image-wrap mb-3">
                                    <img src="assets/images/whitemask.png" alt="EyeSleepMask device" class="device-image" loading="lazy">
                                </div>
                                <p class="text-light text-center fw-normal mb-3">Connect Your Sleep Mask Device</p>
                                <button type="button" class="device-connect-btn mb-3" id="connectDeviceBtn">Connect Device</button>
                                <div id="deviceConnectedDetails">
                                    <div class="d-flex align-items-center justify-content-between gap-2">
                                        <span class="movement-muted mb-0">Battery</span>
                                        <strong class="h5 mb-0 text-light" id="deviceBatteryPercent">--%</strong>
                                    </div>
                                    <p class="movement-insight device-last-update mt-3 mb-0" id="deviceLastUpdate">Last update: --</p>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <div class="modal fade" id="connectDeviceModal" tabindex="-1" aria-labelledby="connectDeviceModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content device-connect-modal">
                <div class="modal-header border-0 pb-0">
                    <h2 class="modal-title h5 text-light" id="connectDeviceModalLabel">Enable Bluetooth Access</h2>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-2">
                    <p class="movement-insight mb-3">We use Bluetooth to connect your sleep mask for tracking and control.</p>
                    <ul class="device-connect-checklist mb-0">
                        <li><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Bluetooth ON</li>
                        <li><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Device nearby</li>
                    </ul>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="connectDeviceContinueBtn">Continue</button>
                </div>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
