<?php
session_start();
require __DIR__ . '/backend/form_security.php';

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'User';
}

$pageTitle = 'DeepSleepers | Edit Profile';
$pageStyles = ['assets/css/profile.css'];

$profileFlash = pop_form_flash('profile');
$csrfToken = csrf_token();

$profile = $_SESSION['user_profile'] ?? [];
$old = [
    'name' => (string) ($profile['name'] ?? $userName),
    'age' => (string) ($profile['age'] ?? ''),
    'birthdate' => (string) ($profile['birthdate'] ?? ''),
    'gender' => (string) ($profile['gender'] ?? ''),
    'email' => (string) ($profile['email'] ?? '')
];

include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg profile-page">
    <div class="bg-orb orb-one"></div>
    <div class="bg-orb orb-two"></div>

    <main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
        <section class="profile-card p-4 p-md-5 w-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <p class="small text-uppercase tracking mb-1">DeepSleepers</p>
                    <h2 class="text-light mb-0">Edit Profile</h2>
                </div>
                <a href="settings.php" class="btn btn-outline-light btn-sm">Back to Settings</a>
            </div>

            <?php if (is_array($profileFlash) && !empty($profileFlash['message'])): ?>
                <div class="alert <?php echo $profileFlash['type'] === 'success' ? 'alert-success' : 'alert-danger'; ?> py-2" role="alert">
                    <?php echo htmlspecialchars((string) $profileFlash['message'], ENT_QUOTES, 'UTF-8'); ?>
                </div>
            <?php endif; ?>

            <form class="row g-3" action="backend/backend_edit_profile.php" method="post" novalidate>
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
                <div class="col-12">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($old['name'], ENT_QUOTES, 'UTF-8'); ?>" required>
                </div>

                <div class="col-md-6">
                    <label for="age" class="form-label">Age (18+)</label>
                    <input type="number" class="form-control" id="age" name="age" min="18" value="<?php echo htmlspecialchars($old['age'], ENT_QUOTES, 'UTF-8'); ?>" required>
                </div>

                <div class="col-md-6">
                    <label for="birthdate" class="form-label">Birthdate</label>
                    <input type="date" class="form-control" id="birthdate" name="birthdate" value="<?php echo htmlspecialchars($old['birthdate'], ENT_QUOTES, 'UTF-8'); ?>" required>
                </div>

                <div class="col-12">
                    <label class="form-label d-block mb-2">Gender</label>
                    <div class="d-flex flex-wrap gap-2 gender-group">
                        <?php
                        $genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
                        foreach ($genders as $gender):
                            $checked = $old['gender'] === $gender;
                            $id = 'gender_' . preg_replace('/[^a-z0-9]/i', '_', strtolower($gender));
                        ?>
                            <input type="radio" class="btn-check" name="gender" id="<?php echo $id; ?>" value="<?php echo htmlspecialchars($gender, ENT_QUOTES, 'UTF-8'); ?>" autocomplete="off" <?php echo $checked ? 'checked' : ''; ?>>
                            <label class="btn btn-gender" for="<?php echo $id; ?>"><?php echo htmlspecialchars($gender, ENT_QUOTES, 'UTF-8'); ?></label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="col-12">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" value="<?php echo htmlspecialchars($old['email'], ENT_QUOTES, 'UTF-8'); ?>" required>
                </div>

                <div class="col-12 d-grid mt-3">
                    <button class="btn btn-accent btn-lg" type="submit">Save Changes</button>
                </div>
            </form>
        </section>
    </main>

<?php include __DIR__ . '/includes/bootstrap-footbar.php'; ?>
<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
