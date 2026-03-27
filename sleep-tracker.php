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

$pageTitle = 'DeepSleepers | Sleep Tracker';
$pageStyles = ['assets/css/dashboard.css'];
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
                            <a class="nav-link active" href="#"><i class="bi bi-moon-stars"></i> Sleep Tracker</a>
                            <a class="nav-link" href="movement-tracker.php"><i class="bi bi-activity"></i> Movement Tracker</a>
                            <a class="nav-link" href="settings.php"><i class="bi bi-gear"></i> Settings</a>
                        </nav>
                        <a href="?action=logout" class="nav-link logout-btn mt-auto d-flex align-items-center gap-2"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </div>
                </aside>

                <section class="col-12 col-lg-9 col-xl-10">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <h1 class="h3 mb-0 text-light"><?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?>'s Sleep Tracker</h1>
                        <div class="top-actions d-flex align-items-center gap-2">
                            <a href="#" class="notif-btn" aria-label="Notifications">
                                <i class="bi bi-bell"></i>
                                <span class="notif-count">3</span>
                            </a>
                            <a href="index.php" class="home-btn"><i class="bi bi-house-door"></i> Home</a>
                        </div>
                    </div>

                    <div class="row g-3 g-lg-4 justify-content-center">
                        <div class="col-12 col-xl-8">
                            <article class="panel-card sleep-tracker-card p-3 p-lg-4">
                                <div class="sleep-tracker-head d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h2 class="h4 mb-1">Sleep Tracker</h2>
                                        <p class="sleep-tracker-subtitle mb-0">Leap Fitness</p>
                                    </div>
                                    <span class="sale-badge" aria-hidden="true"><i class="bi bi-stars"></i> Sale</span>
                                </div>

                                <div class="sleep-dial" data-bedtime="00:20" data-alarm-start="04:50" data-alarm-end="05:20">
                                    <div class="sleep-dial-track" aria-hidden="true"></div>
                                    <div class="sleep-dial-arc" aria-hidden="true"></div>
                                    <div class="sleep-dial-core" aria-hidden="true"></div>

                                    <span class="sleep-marker sleep-marker-start" aria-hidden="true"><i class="bi bi-moon-stars-fill"></i></span>
                                    <span class="sleep-marker sleep-marker-end" aria-hidden="true"><i class="bi bi-sun-fill"></i></span>

                                    <span class="sleep-dial-label label-12am">12 AM</span>
                                    <span class="sleep-dial-label label-6am">6 AM</span>
                                    <span class="sleep-dial-label label-12pm">12 PM</span>
                                    <span class="sleep-dial-label label-6pm">6 PM</span>
                                </div>

                                <div class="sleep-times mt-3 mt-lg-4">
                                    <div class="sleep-time-row">
                                        <span class="sleep-time-name">Bedtime</span>
                                        <span class="sleep-time-value"><span class="sleep-time-text" data-display="bedtime">12:20 AM</span></span>
                                        <button type="button" class="sleep-edit-btn" data-edit="bedtime" aria-label="Edit bedtime">
                                            <i class="bi bi-pencil-fill"></i>
                                        </button>
                                    </div>
                                    <form class="sleep-edit-panel" data-panel="bedtime" hidden>
                                        <label for="bedtimeInput" class="sleep-edit-label">Bedtime</label>
                                        <input id="bedtimeInput" name="bedtime" class="sleep-time-input" type="time" value="00:20">
                                        <div class="sleep-edit-actions">
                                            <button type="button" class="sleep-edit-cancel" data-cancel="bedtime">Cancel</button>
                                            <button type="submit" class="sleep-edit-save">Save</button>
                                        </div>
                                    </form>

                                    <div class="sleep-time-row">
                                        <span class="sleep-time-name">Alarm</span>
                                        <span class="sleep-time-value"><span class="sleep-time-text" data-display="alarm">04:50 AM-05:20 AM</span></span>
                                        <button type="button" class="sleep-edit-btn" data-edit="alarm" aria-label="Edit alarm range">
                                            <i class="bi bi-pencil-fill"></i>
                                        </button>
                                    </div>
                                    <form class="sleep-edit-panel" data-panel="alarm" hidden>
                                        <label for="alarmStartInput" class="sleep-edit-label">Alarm range</label>
                                        <div class="sleep-range-inputs">
                                            <input id="alarmStartInput" name="alarmStart" class="sleep-time-input" type="time" value="04:50">
                                            <span class="sleep-range-separator">to</span>
                                            <input id="alarmEndInput" name="alarmEnd" class="sleep-time-input" type="time" value="05:20">
                                        </div>
                                        <div class="sleep-edit-actions">
                                            <button type="button" class="sleep-edit-cancel" data-cancel="alarm">Cancel</button>
                                            <button type="submit" class="sleep-edit-save">Save</button>
                                        </div>
                                    </form>
                                </div>

                                <button type="button" class="sleep-now-btn mt-4">Sleep Now</button>
                            </article>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
