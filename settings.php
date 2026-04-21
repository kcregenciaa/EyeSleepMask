<?php
session_start();

require __DIR__ . '/backend/auth_guard.php';

$profile = require __DIR__ . '/backend/backend_settings.php';

$displayName = trim((string) ($profile['fullname'] ?? 'User'));
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

$pageTitle = 'Doze | Settings';
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


