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

$pageTitle = 'DeepSleepers | Device';
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
                    <h2 class="modal-title h5 text-light" id="connectDeviceModalLabel">Device Pairing</h2>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-2">
                    <div class="device-connect-visual" aria-hidden="true">
                        <i class="bi bi-phone"></i>
                    </div>
                    <p class="movement-insight mb-3">Place your device near your phone.</p>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-primary" id="connectDeviceContinueBtn">Continue</button>
                    <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
                </div>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-footbar.php'; ?>
<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
