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

$pageTitle = 'DeepSleepers | Sleep Tracker';
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
                            <?php if (!$isLoggedIn): ?>
                            <a href="index.php" class="home-btn"><i class="bi bi-house-door"></i> Home</a>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="row g-3 g-lg-4 justify-content-center">
                        <div class="col-12 col-xl-8">
                            <article class="panel-card sleep-tracker-card p-3 p-lg-4">
                                <div class="sleep-tracker-head d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h2 class="h4 mb-1">Sleep Tracker</h2>
                                    </div>
                                </div>

                                <div class="sleep-dial" data-bedtime="00:20" data-alarm-end="05:20">
                                    <div class="sleep-dial-track" aria-hidden="true"></div>
                                    <div class="sleep-dial-arc" aria-hidden="true"></div>
                                    <div class="sleep-dial-core" aria-hidden="true"></div>

                                    <button type="button" class="sleep-marker sleep-marker-start" data-marker="bedtime" aria-label="Edit bedtime"><i class="bi bi-moon-stars-fill"></i></button>
                                    <button type="button" class="sleep-marker sleep-marker-end" data-marker="alarm" aria-label="Edit alarm"><i class="bi bi-sun-fill"></i></button>

                                    <span class="sleep-dial-label label-12am">12 AM</span>
                                    <span class="sleep-dial-label label-6am">6 AM</span>
                                    <span class="sleep-dial-label label-12pm">12 PM</span>
                                    <span class="sleep-dial-label label-6pm">6 PM</span>
                                    <span class="sleep-dial-total" aria-live="polite">
                                        <span class="sleep-dial-total-top"><strong data-display="sleep-hours-number">05</strong><span class="sleep-dial-total-unit">hr</span></span>
                                        <span class="sleep-dial-total-minutes" data-display="sleep-minutes-number">30 min</span>
                                    </span>
                                    <span class="sleep-dial-no-alarm" aria-live="polite">
                                        <strong>No alarm</strong>
                                        <span>Just track my sleep</span>
                                    </span>
                                </div>

                                <p class="sleep-total-hours mt-3 mb-0">Total sleep: <strong data-display="total-sleep">5 h</strong></p>

                                <div class="sleep-times mt-3 mt-lg-4">
                                    <div class="sleep-time-row">
                                        <span class="sleep-time-name">Bedtime</span>
                                        <span class="sleep-time-value"><span class="sleep-time-text" data-display="bedtime">12:20 AM</span></span>
                                        <button type="button" class="sleep-edit-btn" data-edit="bedtime" aria-label="Edit bedtime">
                                            <i class="bi bi-pencil-fill"></i>
                                        </button>
                                    </div>
                                    <form class="sleep-edit-panel" data-panel="bedtime" hidden>
                                        <label class="sleep-edit-label">Bedtime</label>
                                        <div class="sleep-wheel-picker" data-picker="bedtime">
                                            <div class="sleep-wheel-column" data-column="hours">
                                                <div class="sleep-wheel-item" data-slot="prev">11</div>
                                                <div class="sleep-wheel-item sleep-wheel-selected" data-slot="current">12</div>
                                                <div class="sleep-wheel-item" data-slot="next">1</div>
                                            </div>
                                            <div class="sleep-wheel-column" data-column="divider">:</div>
                                            <div class="sleep-wheel-column" data-column="minutes">
                                                <div class="sleep-wheel-item" data-slot="prev">19</div>
                                                <div class="sleep-wheel-item sleep-wheel-selected" data-slot="current">20</div>
                                                <div class="sleep-wheel-item" data-slot="next">21</div>
                                            </div>
                                            <div class="sleep-wheel-column" data-column="period">
                                                <div class="sleep-wheel-item" data-slot="prev"></div>
                                                <div class="sleep-wheel-item sleep-wheel-selected" data-slot="current">AM</div>
                                                <div class="sleep-wheel-item" data-slot="next">PM</div>
                                            </div>
                                        </div>
                                        <input id="bedtimeInput" name="bedtime" class="sleep-time-input-hidden" type="time" value="00:20">
                                        <div class="sleep-edit-actions">
                                            <button type="button" class="sleep-edit-cancel" data-cancel="bedtime">Cancel</button>
                                            <button type="submit" class="sleep-edit-save">Save</button>
                                        </div>
                                    </form>

                                    <div class="sleep-time-row">
                                        <span class="sleep-time-name">Alarm</span>
                                        <span class="sleep-time-value"><span class="sleep-time-text" data-display="alarm">05:20 AM</span></span>
                                        <button type="button" class="sleep-edit-btn" data-edit="alarm" aria-label="Edit alarm">
                                            <i class="bi bi-pencil-fill"></i>
                                        </button>
                                    </div>
                                    <form class="sleep-edit-panel" data-panel="alarm" hidden>
                                        <label class="sleep-edit-label">Alarm</label>
                                        <div class="sleep-wheel-picker" data-picker="alarm-end">
                                            <div class="sleep-wheel-column" data-column="hours">
                                                <div class="sleep-wheel-item" data-slot="prev">4</div>
                                                <div class="sleep-wheel-item sleep-wheel-selected" data-slot="current">5</div>
                                                <div class="sleep-wheel-item" data-slot="next">6</div>
                                            </div>
                                            <div class="sleep-wheel-column" data-column="divider">:</div>
                                            <div class="sleep-wheel-column" data-column="minutes">
                                                <div class="sleep-wheel-item" data-slot="prev">19</div>
                                                <div class="sleep-wheel-item sleep-wheel-selected" data-slot="current">20</div>
                                                <div class="sleep-wheel-item" data-slot="next">21</div>
                                            </div>
                                            <div class="sleep-wheel-column" data-column="period">
                                                <div class="sleep-wheel-item" data-slot="prev"></div>
                                                <div class="sleep-wheel-item sleep-wheel-selected" data-slot="current">AM</div>
                                                <div class="sleep-wheel-item" data-slot="next">PM</div>
                                            </div>
                                        </div>
                                        <input id="alarmEndInput" name="alarmEnd" class="sleep-time-input-hidden" type="time" value="05:20">

                                        <div class="sleep-settings-section">
                                            <div class="sleep-setting-row">
                                                <div class="sleep-setting-label">
                                                    <span class="sleep-setting-name">Alarm</span>
                                                </div>
                                                <label class="sleep-toggle">
                                                    <input type="checkbox" id="alarmToggle" checked>
                                                    <span class="sleep-toggle-slider"></span>
                                                </label>
                                            </div>

                                            <div class="sleep-setting-row sleep-days-row">
                                                <div class="sleep-setting-label">
                                                    <span class="sleep-setting-name">Repeat</span>
                                                </div>
                                                <button type="button" class="sleep-repeat-link" data-repeat-open>
                                                    <span data-display="alarm-repeat">Every day</span>
                                                    <i class="bi bi-chevron-right"></i>
                                                </button>
                                            </div>

                                            <div class="sleep-setting-row">
                                                <span class="sleep-setting-name">Alarm ringtone</span>
                                                <a href="#" class="sleep-setting-link">Sunbreak <i class="bi bi-chevron-right"></i></a>
                                            </div>

                                            <div class="sleep-setting-row">
                                                <div class="sleep-setting-label smart-alarm-label">
                                                    <span class="sleep-setting-name">Smart alarm</span>
                                                    <i class="bi bi-info-circle sleep-info-icon" title="It's proven that waking up in the lightest sleep will give you an energetic morning.&#10;&#10;Smart alarm will detect this moment and wakes you up within the wake-up period you set."></i>
                                                </div>
                                                <label class="sleep-toggle">
                                                    <input type="checkbox" id="smartAlarmToggle" checked>
                                                    <span class="sleep-toggle-slider"></span>
                                                </label>
                                            </div>

                                            <div class="sleep-setting-row" data-smart-alarm-row>
                                                <span class="sleep-setting-name">Wake up period</span>
                                                <button type="button" class="sleep-repeat-link" data-wakeup-open>
                                                    <span data-display="wakeup-period">30 min</span>
                                                    <i class="bi bi-chevron-right"></i>
                                                </button>
                                            </div>

                                            <div class="sleep-setting-row">
                                                <span class="sleep-setting-name">Snooze</span>
                                                <button type="button" class="sleep-repeat-link" data-snooze-open>
                                                    <span data-display="snooze-minutes">15 min</span>
                                                    <i class="bi bi-chevron-right"></i>
                                                </button>
                                            </div>

                                            <div class="sleep-setting-row">
                                                <div>
                                                    <span class="sleep-setting-name">Remind me to sleep</span>
                                                    <span class="sleep-setting-sub sleep-reminder-hint" data-sleep-reminder-hint hidden>Enable browser notifications to get reminders.</span>
                                                </div>
                                                <label class="sleep-toggle">
                                                    <input type="checkbox" id="sleepReminderToggle" checked>
                                                    <span class="sleep-toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>

                                        <div class="sleep-repeat-modal" id="repeatModal" hidden>
                                            <div class="sleep-repeat-backdrop" data-repeat-close></div>
                                            <div class="sleep-repeat-sheet" role="dialog" aria-modal="true" aria-labelledby="repeatTitle">
                                                <div class="sleep-repeat-header">
                                                    <button type="button" class="sleep-repeat-back" data-repeat-close>
                                                        <i class="bi bi-chevron-left"></i>
                                                        Back
                                                    </button>
                                                    <h3 id="repeatTitle">Repeat</h3>
                                                </div>
                                                <div class="sleep-repeat-list" role="group" aria-label="Repeat days" data-repeat-list>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Sunday</span>
                                                        <input type="checkbox" data-alarm-day="sun" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Monday</span>
                                                        <input type="checkbox" data-alarm-day="mon" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Tuesday</span>
                                                        <input type="checkbox" data-alarm-day="tue" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Wednesday</span>
                                                        <input type="checkbox" data-alarm-day="wed" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Thursday</span>
                                                        <input type="checkbox" data-alarm-day="thu" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Friday</span>
                                                        <input type="checkbox" data-alarm-day="fri" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                    <label class="sleep-repeat-item">
                                                        <span>Every Saturday</span>
                                                        <input type="checkbox" data-alarm-day="sat" checked>
                                                        <span class="sleep-repeat-check"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="sleep-repeat-modal" id="snoozeModal" hidden>
                                            <div class="sleep-repeat-backdrop" data-snooze-close></div>
                                            <div class="sleep-repeat-sheet" role="dialog" aria-modal="true" aria-labelledby="snoozeTitle">
                                                <div class="sleep-repeat-header">
                                                    <button type="button" class="sleep-repeat-back" data-snooze-close>
                                                        <i class="bi bi-chevron-left"></i>
                                                        Back
                                                    </button>
                                                    <h3 id="snoozeTitle">Snooze</h3>
                                                </div>
                                                <div class="snooze-wheel" data-snooze-wheel>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="1">1 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="2">2 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="3">3 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="4">4 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="5">5 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="6">6 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="7">7 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="8">8 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="9">9 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="10">10 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="11">11 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="12">12 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="13">13 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="14">14 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-snooze-minute="15">15 min</button>
                                                    <span class="snooze-wheel-fade" aria-hidden="true"></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="sleep-repeat-modal" id="wakeupModal" hidden>
                                            <div class="sleep-repeat-backdrop" data-wakeup-close></div>
                                            <div class="sleep-repeat-sheet" role="dialog" aria-modal="true" aria-labelledby="wakeupTitle">
                                                <div class="sleep-repeat-header">
                                                    <button type="button" class="sleep-repeat-back" data-wakeup-close>
                                                        <i class="bi bi-chevron-left"></i>
                                                        Back
                                                    </button>
                                                    <h3 id="wakeupTitle">Wake Up Period</h3>
                                                </div>
                                                <div class="snooze-wheel" data-wakeup-wheel>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="5">5 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="6">6 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="7">7 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="8">8 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="9">9 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="10">10 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="11">11 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="12">12 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="13">13 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="14">14 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="15">15 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="16">16 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="17">17 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="18">18 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="19">19 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="20">20 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="21">21 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="22">22 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="23">23 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="24">24 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="25">25 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="26">26 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="27">27 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="28">28 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="29">29 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="30">30 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="31">31 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="32">32 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="33">33 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="34">34 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="35">35 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="36">36 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="37">37 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="38">38 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="39">39 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="40">40 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="41">41 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="42">42 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="43">43 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="44">44 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="45">45 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="46">46 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="47">47 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="48">48 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="49">49 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="50">50 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="51">51 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="52">52 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="53">53 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="54">54 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="55">55 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="56">56 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="57">57 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="58">58 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="59">59 min</button>
                                                    <button type="button" class="snooze-wheel-item" data-wakeup-minute="60">60 min</button>
                                                    <span class="snooze-wheel-fade" aria-hidden="true"></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="sleep-edit-actions">
                                            <button type="button" class="sleep-edit-cancel" data-cancel="alarm">Cancel</button>
                                            <button type="submit" class="sleep-edit-save">Save</button>
                                        </div>
                                    </form>
                                </div>

                                <button type="button" class="sleep-now-btn mt-4" id="sleepNowBtn">Sleep Now</button>
                            </article>
                        </div>
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
