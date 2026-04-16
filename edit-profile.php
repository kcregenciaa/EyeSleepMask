<?php
session_start();

$userName = trim($_SESSION['user_name'] ?? '');
if ($userName === '') {
    $userName = 'User';
}

$pageTitle = 'DeepSleepers | Edit Profile';
$pageStyles = ['assets/css/profile.css'];

$profile = $_SESSION['user_profile'] ?? [];
$old = [
    'name' => (string) ($profile['name'] ?? $userName),
    'age' => (string) ($profile['age'] ?? ''),
    'birthdate' => (string) ($profile['birthdate'] ?? ''),
    'gender' => (string) ($profile['gender'] ?? ''),
    'email' => (string) ($profile['email'] ?? '')
];

$errors = [];
$saved = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $old['name'] = trim($_POST['name'] ?? '');
    $old['age'] = trim($_POST['age'] ?? '');
    $old['birthdate'] = trim($_POST['birthdate'] ?? '');
    $old['gender'] = trim($_POST['gender'] ?? '');
    $old['email'] = trim($_POST['email'] ?? '');

    if ($old['name'] === '') {
        $errors[] = 'Name is required.';
    }

    if ($old['age'] === '' || !ctype_digit($old['age'])) {
        $errors[] = 'Age must be a valid number.';
    } elseif ((int) $old['age'] < 18) {
        $errors[] = 'Age must be 18 or above.';
    }

    if ($old['birthdate'] === '') {
        $errors[] = 'Birthdate is required.';
    } else {
        $birthDate = DateTime::createFromFormat('Y-m-d', $old['birthdate']);
        $today = new DateTime('today');
        if (!$birthDate) {
            $errors[] = 'Birthdate format is invalid.';
        } else {
            $eighteenthBirthday = (clone $birthDate)->modify('+18 years');
            if ($eighteenthBirthday > $today) {
                $errors[] = 'Birthdate indicates age is below 18.';
            }
        }
    }

    if (!in_array($old['gender'], ['Male', 'Female', 'Other', 'Prefer not to say'], true)) {
        $errors[] = 'Please select a valid gender.';
    }

    if (!filter_var($old['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address.';
    }

    if (!$errors) {
        $_SESSION['user_profile'] = $old;
        $_SESSION['user_name'] = $old['name'];
        $saved = true;
    }
}

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

            <?php if ($saved): ?>
                <div class="alert alert-success py-2" role="alert">
                    <i class="bi bi-check-circle"></i> Profile updated successfully!
                </div>
            <?php endif; ?>

            <?php if ($errors): ?>
                <div class="alert alert-danger" role="alert">
                    <ul class="mb-0 ps-3">
                        <?php foreach ($errors as $error): ?>
                            <li><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <form class="row g-3" action="edit-profile.php" method="post" novalidate>
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
