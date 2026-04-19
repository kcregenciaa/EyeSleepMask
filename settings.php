<?php
session_start();

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'User';
}

$profile = $_SESSION['user_profile'] ?? [];
$displayName = trim((string) ($profile['name'] ?? $userName));
if ($displayName === '') {
    $displayName = 'User';
}

$email = trim((string) ($profile['email'] ?? ''));
$emailDisplay = $email !== '' ? $email : 'No email set';

$birthdateRaw = trim((string) ($profile['birthdate'] ?? ''));
$birthdateDisplay = 'Not set';
if ($birthdateRaw !== '') {
    $birthDate = DateTime::createFromFormat('Y-m-d', $birthdateRaw);
    if ($birthDate) {
        $birthdateDisplay = $birthDate->format('F j, Y');
    }
}

$initial = strtoupper(substr($displayName, 0, 1));

$pageTitle = 'DeepSleepers | Settings';
$pageStyles = ['assets/css/settings.css'];
include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg dashboard-page settings-page">
    <div class="bg-orb orb-one"></div>
    <div class="bg-orb orb-two"></div>

    <main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
        <section class="settings-card p-4 p-md-5 w-100">
            <header class="settings-head mb-4">
                <h2 class="text-light mb-1">Settings</h2>
                <p class="mb-0 soft-text">Manage your account and sleep preferences</p>
            </header>

            <section class="settings-block mb-3" aria-labelledby="profileSectionTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="profileSectionTitle">Profile Section</h3>
                    <a href="edit-profile.php" class="section-edit-btn" aria-label="Edit Profile Section">
                        <i class="bi bi-pencil"></i>
                        <span>Edit</span>
                    </a>
                </div>
                <div class="settings-block-body">
                    <div class="settings-row">
                        <span class="settings-label">Name</span>
                        <span class="settings-value"><?php echo htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8'); ?></span>
                    </div>
                    <div class="settings-row">
                        <span class="settings-label">Email</span>
                        <span class="settings-value"><?php echo htmlspecialchars($emailDisplay, ENT_QUOTES, 'UTF-8'); ?></span>
                    </div>
                </div>
            </section>

            <section class="settings-block mb-3" aria-labelledby="sleepPreferencesTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="sleepPreferencesTitle">Sleep Preferences</h3>
                </div>
                <div class="settings-block-body">
                    <div class="settings-row">
                        <span class="settings-label">Snore Sensitivity</span>
                        <span class="settings-value">Medium</span>
                    </div>
                    <div class="settings-segment" role="group" aria-label="Snore sensitivity options">
                        <button type="button" class="segment-btn">Low</button>
                        <button type="button" class="segment-btn is-active">Medium</button>
                        <button type="button" class="segment-btn">High</button>
                    </div>
                </div>
            </section>

            <section class="settings-block mb-3" aria-labelledby="ledCustomizationTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="ledCustomizationTitle">LED Customization</h3>
                </div>
                <div class="settings-block-body">
                    <div class="settings-row led-slider-row">
                        <span class="settings-label">Brightness Slider</span>
                        <span class="settings-value">0–100%</span>
                    </div>
                    <div class="led-slider-wrap">
                        <input type="range" min="0" max="100" value="70" class="led-brightness-slider" aria-label="Brightness slider">
                    </div>

                    <div class="settings-row led-row-spaced">
                        <span class="settings-label">Color selection</span>
                        <span class="settings-value">RGB LED</span>
                    </div>
                    <div class="settings-segment" role="group" aria-label="LED color options">
                        <button type="button" class="segment-btn is-active led-color-btn led-color-blue">Blue</button>
                        <button type="button" class="segment-btn led-color-btn led-color-cyan">Cyan</button>
                        <button type="button" class="segment-btn led-color-btn led-color-purple">Purple</button>
                        <button type="button" class="segment-btn led-color-btn led-color-pink">Pink</button>
                    </div>

                    <div class="settings-row led-row-spaced">
                        <span class="settings-label">Mode</span>
                        <span class="settings-value">Static</span>
                    </div>
                    <div class="settings-segment" role="group" aria-label="LED mode options">
                        <button type="button" class="segment-btn is-active">Static</button>
                        <button type="button" class="segment-btn">Breathing</button>
                        <button type="button" class="segment-btn">Off during sleep</button>
                    </div>
                </div>
            </section>

            <section class="settings-block mb-3" aria-labelledby="appSettingsTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="appSettingsTitle">App Settings</h3>
                </div>
                <div class="settings-block-body">
                    <label class="toggle-row" for="notificationsToggle">
                        <span class="settings-label">Notifications</span>
                        <span class="toggle-wrap">
                            <input id="notificationsToggle" type="checkbox" checked>
                            <span class="toggle-slider" aria-hidden="true"></span>
                        </span>
                    </label>
                    <label class="toggle-row" for="darkModeToggle">
                        <span class="settings-label">Dark Mode</span>
                        <span class="toggle-wrap">
                            <input id="darkModeToggle" type="checkbox" checked>
                            <span class="toggle-slider" aria-hidden="true"></span>
                        </span>
                    </label>
                </div>
            </section>

            <section class="settings-block mb-3" aria-labelledby="deviceSettingsTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="deviceSettingsTitle">Device Settings</h3>
                </div>
                <div class="settings-block-body">
                    <div class="settings-actions two-col">
                        <button type="button" class="settings-btn settings-btn-secondary">
                            <i class="bi bi-bluetooth"></i>
                            <span>Reconnect Device</span>
                        </button>
                        <button type="button" class="settings-btn settings-btn-secondary">
                            <i class="bi bi-arrow-clockwise"></i>
                            <span>Reset Device</span>
                        </button>
                    </div>
                </div>
            </section>

            <section class="settings-block mb-3" aria-labelledby="privacySettingsTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="privacySettingsTitle">Data &amp; Privacy</h3>
                </div>
                <div class="settings-block-body">
                    <div class="settings-actions two-col">
                        <button type="button" class="settings-btn settings-btn-secondary">
                            <i class="bi bi-download"></i>
                            <span>Export Data</span>
                        </button>
                        <button type="button" class="settings-btn settings-btn-danger">
                            <i class="bi bi-trash3"></i>
                            <span>Delete Data</span>
                        </button>
                    </div>
                </div>
            </section>

            <section class="settings-block" aria-labelledby="accountSettingsTitle">
                <div class="settings-block-head">
                    <h3 class="mb-0" id="accountSettingsTitle">Account</h3>
                </div>
                <div class="settings-block-body">
                    <div class="settings-actions">
                        <a href="logout.php" class="settings-btn settings-btn-danger">
                            <i class="bi bi-box-arrow-right"></i>
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
            </section>
        </section>
    </main>

<?php include __DIR__ . '/includes/bootstrap-footbar.php'; ?>
<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>


