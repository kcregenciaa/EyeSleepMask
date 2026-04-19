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
                <p class="mb-0 soft-text">Manage your account</p>
            </header>

            <article class="profile-summary-card mb-4">
                <div class="profile-summary-left">
                    <span class="profile-initial" aria-hidden="true"><?php echo htmlspecialchars($initial, ENT_QUOTES, 'UTF-8'); ?></span>
                    <div class="profile-identity">
                        <h3 class="mb-0"><?php echo htmlspecialchars($displayName, ENT_QUOTES, 'UTF-8'); ?></h3>
                        <p class="mb-0"><?php echo htmlspecialchars($emailDisplay, ENT_QUOTES, 'UTF-8'); ?></p>
                    </div>
                </div>
                <a href="edit-profile.php" class="profile-edit-link" aria-label="Edit profile">
                    <i class="bi bi-pencil"></i>
                </a>
            </article>

            <div class="info-section-head mb-3">
                <p class="mb-0">Personal Information</p>
                <a href="edit-profile.php" class="profile-edit-link" aria-label="Edit personal information">
                    <i class="bi bi-pencil"></i>
                </a>
            </div>

            <section class="info-card" aria-label="Personal information list">
                <div class="info-row">
                    <span class="info-icon"><i class="bi bi-calendar-event"></i></span>
                    <div class="info-copy">
                        <p class="info-label mb-0">Birthdate</p>
                        <p class="info-value mb-0"><?php echo htmlspecialchars($birthdateDisplay, ENT_QUOTES, 'UTF-8'); ?></p>
                    </div>
                </div>
            </section>

            <div class="logout-wrap mt-4">
                <a href="logout.php" class="logout-link">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </a>
            </div>
        </section>
    </main>

<?php include __DIR__ . '/includes/bootstrap-footbar.php'; ?>
<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>


