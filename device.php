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

$pageTitle = 'Doze | Device';
$pageStyles = ['assets/css/tracker-ui.css'];
$pageScripts = ['assets/js/dashboard.js'];
include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg dashboard-page device-page">
    <div class="container-fluid py-3 py-lg-4">
        <div class="dashboard-shell p-3 p-lg-4">
            <div class="row g-4">
                <section class="col-12">
                    <div class="row g-3 g-lg-4 justify-content-center" id="deviceLivePanel">
                        <div class="col-12 col-lg-9 col-xl-8">
                            <article class="device-hub-card p-3 p-lg-4">
                                <div class="device-hub-top-grid">
                                    <div class="device-top-item">
                                        <span class="device-top-label">Battery</span>
                                        <div class="device-battery-row">
                                            <i class="bi bi-battery-half"></i>
                                            <strong id="deviceBatteryPercent">--%</strong>
                                            <span class="device-dot" id="deviceBatteryDot"></span>
                                        </div>
                                    </div>
                                    <div class="device-top-item">
                                        <span class="device-top-label">Charging</span>
                                        <strong class="device-top-value" id="deviceChargingStatus">Not Charging</strong>
                                    </div>
                                    <div class="device-top-item">
                                        <span class="device-top-label">Connection</span>
                                        <div class="device-signal-row">
                                            <span class="device-signal-bars" id="deviceSignalBars">
                                                <i></i><i></i><i></i><i></i>
                                            </span>
                                            <strong class="device-top-value" id="deviceConnectionStrength">No Signal</strong>
                                        </div>
                                    </div>
                                </div>

                                <div class="device-hub-middle mt-3">
                                    <div class="device-image-wrap mb-2">
                                        <img src="assets/images/whitemask.png" alt="EyeSleepMask device" class="device-image" loading="lazy">
                                    </div>
                                    <p class="device-session-label mb-0" id="deviceSessionStatus">Sleep Session Idle</p>
                                    <p class="device-connection-state mb-0 mt-1" id="deviceConnectionStateLabel">Disconnected</p>
                                </div>

                                <div class="device-controls-wrap mt-3">
                                    <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                                        <span class="device-top-label">LED Brightness</span>
                                        <strong class="device-top-value" id="deviceLedBrightnessValue">50%</strong>
                                    </div>
                                    <input type="range" min="0" max="100" step="1" value="50" id="deviceLedBrightness" class="device-brightness-slider" aria-label="LED brightness">

                                    <div class="d-flex justify-content-between align-items-center gap-2 mt-3 mb-2">
                                        <span class="device-top-label">Wake Blink Speed</span>
                                        <strong class="device-top-value" id="deviceWakeBlinkSpeedValue">500 ms</strong>
                                    </div>
                                    <input type="range" min="100" max="1500" step="50" value="500" id="deviceWakeBlinkSpeed" class="device-brightness-slider" aria-label="Wake blink speed">
                                    <small class="device-wake-hint mt-2 d-block">Used during your alarm wake-up window.</small>

                                    <div class="d-flex justify-content-between align-items-center gap-2 mt-3 mb-2">
                                        <span class="device-top-label">LED Mode</span>
                                        <strong class="device-top-value" id="deviceLedModeValue">Static</strong>
                                    </div>
                                    <div class="device-mode-segment" role="group" aria-label="LED mode">
                                        <button type="button" class="device-mode-btn is-active" id="deviceLedModeStatic" data-led-mode="static">Static</button>
                                    </div>
                                </div>

                                <div class="device-live-data-grid mt-3">
                                    <div class="device-live-data-item">
                                        <span>Heart Rate</span>
                                        <strong id="deviceHeartRate">-- BPM</strong>
                                    </div>
                                    <div class="device-live-data-item">
                                        <span>Movement</span>
                                        <strong id="deviceMovement">--</strong>
                                    </div>
                                    <div class="device-live-data-item">
                                        <span>Snore Status</span>
                                        <strong id="deviceSnoreStatus">--</strong>
                                    </div>
                                </div>

                                <div class="device-hub-actions mt-3">
                                    <a href="sleep-tracker.php" class="device-action-btn device-action-primary">Sleep Now</a>
                                    <button type="button" class="device-action-btn" id="deviceSyncNowBtn">Sync Now</button>
                                    <button type="button" class="device-action-btn" id="deviceDisconnectBtn">Disconnect</button>
                                </div>

                                <p class="movement-insight device-last-update mt-3 mb-0" id="deviceLastUpdate">Last update: --</p>
                            </article>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-footbar.php'; ?>
<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
