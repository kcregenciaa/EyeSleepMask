<?php
session_start();

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'User';
}

$pageTitle = 'DeepSleepers | Settings';
$pageStyles = ['assets/css/settings.css'];
include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg settings-page">
    <div class="bg-orb orb-one"></div>
    <div class="bg-orb orb-two"></div>

    <main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
        <section class="settings-card p-4 p-md-5 w-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <p class="small text-uppercase tracking mb-1">DeepSleepers</p>
                    <h2 class="text-light mb-0">Settings</h2>
                    <p class="mb-0 soft-text">Manage your account and preferences</p>
                </div>
                <a href="daily-tracker.php" class="btn btn-outline-light btn-sm">Back to Dashboard</a>
            </div>

            <div class="row g-3 g-md-4">
                <div class="col-12 col-md-6">
                    <a href="edit-profile.php" class="setting-action d-block h-100">
                        <span class="setting-icon"><i class="bi bi-person-lines-fill"></i></span>
                        <h3>Edit Profile</h3>
                        <p>Update your personal information, age, birthdate, gender, and email address.</p>
                    </a>
                </div>
            </div>
        </section>
    </main>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>


