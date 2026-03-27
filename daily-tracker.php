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

$pageTitle = 'DeepSleepers | Daily Tracker';
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
                            <a class="nav-link" href="dashboard.php"><i class="bi bi-grid"></i> Dashboard</a>
                            <a class="nav-link" href="discover.php"><i class="bi bi-compass"></i> Discover</a>
                            <a class="nav-link active" href="#"><i class="bi bi-calendar3"></i> Daily Tracker</a>
                            <a class="nav-link" href="sleep-tracker.php"><i class="bi bi-moon-stars"></i> Sleep Tracker</a>
                            <a class="nav-link" href="movement-tracker.php"><i class="bi bi-activity"></i> Movement Tracker</a>
                            <a class="nav-link" href="settings.php"><i class="bi bi-gear"></i> Settings</a>
                        </nav>
                        <a href="?action=logout" class="nav-link logout-btn mt-auto d-flex align-items-center gap-2"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </div>
                </aside>

                <section class="col-12 col-lg-9 col-xl-10">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <div>
                            <p class="daily-date mb-1" id="dailySelectedDate">March 26</p>
                            <h1 class="h3 mb-0 text-light">Daily Tracker for <?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?></h1>
                        </div>
                        <div class="top-actions d-flex align-items-center gap-2">
                            <a href="#" class="notif-btn" aria-label="Notifications">
                                <i class="bi bi-bell"></i>
                                <span class="notif-count">3</span>
                            </a>
                            <a href="index.php" class="home-btn"><i class="bi bi-house-door"></i> Home</a>
                        </div>
                    </div>

                    <div class="daily-flow">
                        <article class="panel-card daily-program-card">
                            <div class="daily-program-content">
                                <p class="daily-program-label">Sleep Aid Program</p>
                                <h2>Scientific guidance to get better sleep!</h2>
                            </div>
                            <button type="button" class="daily-program-toggle" aria-label="Expand program"><i class="bi bi-chevron-down"></i></button>
                        </article>

                        <article class="panel-card daily-calendar-card">
                            <div class="daily-calendar-head">
                                <h2 class="daily-section-title">Daily calendar</h2>
                                <div class="daily-week-nav" role="group" aria-label="Week navigation">
                                    <button type="button" class="daily-week-btn" id="dailyPrevWeek" aria-label="View previous week"><i class="bi bi-chevron-left"></i></button>
                                    <span class="daily-week-range" id="dailyCalendarRange">This week</span>
                                    <button type="button" class="daily-week-btn" id="dailyNextWeek" aria-label="View next week"><i class="bi bi-chevron-right"></i></button>
                                </div>
                            </div>
                            <div class="daily-weekdays" aria-hidden="true">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                            <div class="daily-calendar-days" id="dailyCalendarDays"></div>
                            <p class="daily-calendar-hint mb-0">Select any past day from this or previous weeks to view sleep performance.</p>
                        </article>

                        <article class="panel-card daily-goal-card">
                            <h2 class="daily-section-title">Sleep goal</h2>
                            <div class="daily-goal-grid">
                                <div class="daily-goal-left">
                                    <div class="daily-meta-row">
                                        <p><i class="bi bi-bed"></i> Bedtime</p>
                                        <strong id="dailyBedtime">12:20 AM</strong>
                                    </div>
                                    <div class="daily-meta-row">
                                        <p><i class="bi bi-alarm"></i> Alarm</p>
                                        <strong id="dailyAlarm">04:50 AM-05:20 AM</strong>
                                    </div>
                                </div>
                                <div class="daily-goal-right">
                                    <p class="daily-goal-caption"><i class="bi bi-stopwatch"></i> Goal</p>
                                    <strong class="daily-goal-value" id="dailyGoalValue">5 h</strong>
                                    <button type="button" class="daily-cta-btn" id="dailyTrackNowBtn">Track now</button>
                                </div>
                            </div>
                        </article>

                        <article class="panel-card daily-diary-card">
                            <h2 class="daily-section-title">Diary</h2>
                            <div class="daily-diary-line">
                                <span>Sleep notes</span>
                            </div>
                            <textarea id="dailyNoteInput" class="daily-note-input" rows="4" placeholder="Write what happened during your sleep tonight..."></textarea>
                            <p class="daily-note-caption mb-0">This note is saved for the currently selected date.</p>
                        </article>

                        <article class="panel-card daily-analysis-card">
                            <h2 class="daily-section-title">Sleep Analysis</h2>
                            <div class="daily-analysis-grid" id="dailyAnalysisGrid">
                                <div>
                                    <p>Went to bed</p>
                                    <strong id="dailyWentBed">12:26 AM</strong>
                                </div>
                                <div>
                                    <p>Woke up</p>
                                    <strong id="dailyWokeUp">08:10 AM</strong>
                                </div>
                                <div>
                                    <p>In bed</p>
                                    <strong id="dailyInBed">7 h 44 m</strong>
                                </div>
                                <div>
                                    <p>Asleep</p>
                                    <strong id="dailyAsleep">6 h 58 m</strong>
                                </div>
                                <div>
                                    <p>Awake</p>
                                    <strong id="dailyAwake">13 min</strong>
                                </div>
                                <div>
                                    <p>Noise</p>
                                    <strong id="dailyNoise">25 dB</strong>
                                </div>
                            </div>
                            <div class="daily-analysis-overlay">
                                <p id="dailyPerformanceSummary">Enjoy sweet sleep and get insights into your sleep quality</p>
                                <button type="button" class="daily-cta-btn" id="dailySleepNowBtn">Sleep now</button>
                            </div>
                        </article>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <div class="sleep-flow-layer" id="sleepFlowLayer" hidden>
        <article class="sleep-popup-card sleep-popup-charge" id="sleepPopupCharge" hidden>
            <button type="button" class="sleep-popup-close" data-sleep-close="charge" aria-label="Close"><i class="bi bi-x-lg"></i></button>
            <div class="sleep-popup-visual sleep-popup-visual-charge" aria-hidden="true"></div>
            <div class="sleep-popup-copy">
                <h2>Sweet dreams!</h2>
                <p>Please keep your phone <strong>charged</strong> and place it as shown in the picture.</p>
            </div>
            <button type="button" class="sleep-popup-main-btn" id="sleepPopupDoneBtn">Done</button>
            <button type="button" class="sleep-popup-link" id="sleepPopupSkipChargeBtn">Don't remind me anymore</button>
        </article>

        <article class="sleep-popup-card sleep-popup-audio" id="sleepPopupAudio" hidden>
            <button type="button" class="sleep-popup-close" data-sleep-close="audio" aria-label="Close"><i class="bi bi-x-lg"></i></button>
            <div class="sleep-popup-visual sleep-popup-visual-audio" aria-hidden="true">
                <i class="bi bi-mic-fill"></i>
            </div>
            <div class="sleep-popup-copy">
                <h2>Ensure Accuracy</h2>
                <p>Background audio may interfere with analysis. Please turn it off if running.</p>
            </div>
            <button type="button" class="sleep-popup-main-btn" id="sleepPopupGotItBtn">Got it</button>
            <button type="button" class="sleep-popup-link" id="sleepPopupSkipAudioBtn">Don't remind me anymore</button>
        </article>

        <article class="sleep-intro-screen" id="sleepIntroScreen" hidden>
            <div class="sleep-intro-copy">
                <h2>Sweet dreams!</h2>
                <p>Start to track your sleep...</p>
            </div>
        </article>

        <article class="sleep-session-screen" id="sleepSessionScreen" hidden>
            <div class="sleep-session-meta-top">
                <div>
                    <p class="sleep-session-noise-label mb-0">Ambient Noise</p>
                    <strong class="sleep-session-noise-value" id="sleepSessionNoise">69 dB</strong>
                </div>
            </div>
            <div class="sleep-session-center">
                <h2 class="sleep-session-time" id="sleepSessionTime">02:24</h2>
                <span class="sleep-session-period" id="sleepSessionPeriod">PM</span>
                <p class="sleep-session-alarm" id="sleepSessionAlarm">04:50 AM-05:20 AM</p>
                <p class="sleep-session-countdown" id="sleepSessionCountdown">Session ends in 5 h 0 m</p>
            </div>
            <div class="sleep-session-actions">
                <button type="button" class="sleep-wake-btn" id="sleepWakeBtn">Long press to wake up</button>
                <button type="button" class="sleep-end-now-btn" id="sleepEndNowBtn">I'm awake, end session</button>
            </div>
        </article>
    </div>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
