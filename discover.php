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

$pageTitle = 'DeepSleepers | Discover';
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
                            <a class="nav-link active" href="#"><i class="bi bi-compass"></i> Discover</a>
                            <a class="nav-link" href="daily-tracker.php"><i class="bi bi-calendar3"></i> Daily Tracker</a>
                            <a class="nav-link" href="sleep-tracker.php"><i class="bi bi-moon-stars"></i> Sleep Tracker</a>
                            <a class="nav-link" href="movement-tracker.php"><i class="bi bi-activity"></i> Movement Tracker</a>
                            <a class="nav-link" href="settings.php"><i class="bi bi-gear"></i> Settings</a>
                        </nav>
                        <a href="?action=logout" class="nav-link logout-btn mt-auto d-flex align-items-center gap-2"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </div>
                </aside>

                <section class="col-12 col-lg-9 col-xl-10">
                    <div class="top-title d-flex justify-content-between align-items-center mb-3 mb-lg-4">
                        <h1 class="h3 mb-0 text-light">Discover for <?php echo htmlspecialchars($userName, ENT_QUOTES, 'UTF-8'); ?></h1>
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

                    <article class="panel-card discover-card p-3 p-lg-4">
                        <div class="discover-tabs" role="tablist" aria-label="Discover categories">
                            <button class="discover-tab active" type="button" data-discover-tab="sounds" aria-selected="true">Sounds</button>
                            <button class="discover-tab" type="button" data-discover-tab="music" aria-selected="false">Music</button>
                            <button class="discover-tab" type="button" data-discover-tab="mixes" aria-selected="false">Mixes</button>
                        </div>

                        <section class="discover-panel" data-discover-panel="sounds">
                            <h2 class="h4 mb-3">Sleep Sounds</h2>

                            <article class="sounds-hero">
                                <div class="sounds-hero-content">
                                    <h3>Enjoy 100+ Sleep-aid Sounds and White Noises</h3>
                                    <button type="button" class="sounds-view-all">View all</button>
                                </div>
                            </article>

                            <div class="sounds-strip" role="list" aria-label="Featured sounds">
                                <article class="sound-tile" role="listitem">
                                    <div class="sound-cover sound-cover-window"></div>
                                    <h3>Showers on Window</h3>
                                    <p>Rain</p>
                                </article>
                                <article class="sound-tile" role="listitem">
                                    <div class="sound-cover sound-cover-forest"></div>
                                    <h3>Forest Rain</h3>
                                    <p>Rain</p>
                                </article>
                                <article class="sound-tile" role="listitem">
                                    <div class="sound-cover sound-cover-steps"></div>
                                    <h3>Steps in Rain</h3>
                                    <p>Rain</p>
                                </article>
                            </div>

                            <button type="button" class="create-mix-btn"><i class="bi bi-layers"></i> Create by myself</button>
                        </section>

                        <section class="discover-panel" data-discover-panel="music" hidden>
                            <div class="music-head">
                                <div>
                                    <h2 class="h4 mb-1">Music</h2>
                                    <p class="music-subtitle">Healing tunes designed for you</p>
                                </div>
                                <a href="#" class="discover-more">More <i class="bi bi-chevron-right"></i></a>
                            </div>

                            <article class="music-featured">
                                <span class="music-featured-time">15 min</span>
                                <span class="music-featured-icon"><i class="bi bi-bar-chart-fill"></i></span>
                                <h3>Hypnotic piano</h3>
                            </article>

                            <div class="music-secondary-grid">
                                <article class="music-secondary-card">
                                    <div class="music-secondary-thumb"></div>
                                    <h4>Healing Tone</h4>
                                    <p>29 min</p>
                                </article>
                                <article class="music-secondary-card">
                                    <div class="music-secondary-thumb"></div>
                                    <h4>Piano Sonata No. 10</h4>
                                    <p>22 min</p>
                                </article>
                            </div>
                        </section>

                        <section class="discover-panel" data-discover-panel="mixes" hidden>
                            <div class="mixes-head">
                                <div>
                                    <h2 class="h4 mb-1">Mixes</h2>
                                    <p class="mixes-subtitle">Blended for deep rest.</p>
                                </div>
                                <a href="#" class="discover-more">More <i class="bi bi-chevron-right"></i></a>
                            </div>

                            <article class="mixes-hero">
                                <div class="mixes-hero-content">
                                    <h3>Find your perfect mix and relax into night.</h3>
                                    <button type="button" class="mixes-view-all">View all</button>
                                </div>
                            </article>

                            <div class="mixes-strip" role="list" aria-label="Featured mixes">
                                <article class="mix-tile" role="listitem">
                                    <div class="mix-tile-cover"></div>
                                    <h4>Floating Waves</h4>
                                    <p>Meditation</p>
                                    <div class="mix-tile-icons">
                                        <i class="bi bi-droplet-fill"></i>
                                        <i class="bi bi-moon-stars"></i>
                                    </div>
                                </article>
                                <article class="mix-tile" role="listitem">
                                    <div class="mix-tile-cover"></div>
                                    <h4>Autumn Rain</h4>
                                    <p>Nature</p>
                                    <div class="mix-tile-icons">
                                        <i class="bi bi-cloud-rain"></i>
                                        <i class="bi bi-leaf"></i>
                                    </div>
                                </article>
                                <article class="mix-tile" role="listitem">
                                    <div class="mix-tile-cover"></div>
                                    <h4>Deep Forest</h4>
                                    <p>Nature</p>
                                    <div class="mix-tile-icons">
                                        <i class="bi bi-tree-fill"></i>
                                        <i class="bi bi-wind"></i>
                                    </div>
                                </article>
                            </div>

                            <div class="player-bar">
                                <div class="player-thumb"></div>
                                <div class="player-info">
                                    <h4>Hypnotic piano</h4>
                                    <p><i class="bi bi-clock-history"></i> 29:42</p>
                                </div>
                                <div class="player-actions">
                                    <button type="button" class="player-btn" aria-label="Like"><i class="bi bi-heart"></i></button>
                                    <button type="button" class="player-btn" aria-label="Remove"><i class="bi bi-x-lg"></i></button>
                                </div>
                            </div>
                        </section>
                    </article>
                </section>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
