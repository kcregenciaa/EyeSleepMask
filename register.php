<?php
session_start();

$pageTitle = 'DeepSleepers | Register';
$pageStyles = ['assets/css/register.css'];
$pageScripts = ['assets/js/register.js'];

$errors = [];
$formData = [
	'fullname' => '',
	'username' => '',
	'email' => '',
	'birthdate' => '',
	'age' => '',
	'gender' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$formData['fullname'] = trim($_POST['fullname'] ?? '');
	$formData['username'] = trim($_POST['username'] ?? '');
	$formData['email'] = trim($_POST['email'] ?? '');
	$formData['birthdate'] = trim($_POST['birthdate'] ?? '');
	$formData['age'] = trim($_POST['age'] ?? '');
	$formData['gender'] = trim($_POST['gender'] ?? '');
	$password = (string)($_POST['password'] ?? '');
	$confirmPassword = (string)($_POST['confirm_password'] ?? '');

	if ($formData['fullname'] === '') {
		$errors[] = 'Full name is required.';
	}

	if ($formData['username'] === '') {
		$errors[] = 'Username is required.';
	}

	if ($formData['email'] === '' || !filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
		$errors[] = 'A valid email address is required.';
	}

	if ($formData['birthdate'] === '') {
		$errors[] = 'Birthdate is required.';
	}

	$ageInput = filter_var($formData['age'], FILTER_VALIDATE_INT);
	if ($ageInput === false || $ageInput < 18) {
		$errors[] = 'Registration is only allowed for users aged 18 and above.';
	}

	if ($formData['birthdate'] !== '') {
		$birthDate = DateTime::createFromFormat('Y-m-d', $formData['birthdate']);
		if ($birthDate instanceof DateTime) {
			$today = new DateTime('today');
			$calculatedAge = $birthDate->diff($today)->y;
			if ($calculatedAge < 18) {
				$errors[] = 'Birthdate indicates an age below 18.';
			}
			if ($ageInput !== false && $calculatedAge !== (int)$ageInput) {
				$errors[] = 'Age and birthdate must match.';
			}
		} else {
			$errors[] = 'Birthdate format is invalid.';
		}
	}

	if (!in_array($formData['gender'], ['male', 'female', 'other'], true)) {
		$errors[] = 'Please select a gender option.';
	}

	if (strlen($password) < 6) {
		$errors[] = 'Password must be at least 6 characters long.';
	}

	if ($password !== $confirmPassword) {
		$errors[] = 'Password and confirmation do not match.';
	}

	if (empty($errors)) {
		$_SESSION['registered_user'] = [
			'fullname' => $formData['fullname'],
			'username' => $formData['username'],
			'email' => $formData['email'],
			'birthdate' => $formData['birthdate'],
			'age' => (int)$ageInput,
			'gender' => $formData['gender']
		];

		header('Location: login.php?registered=1');
		exit;
	}
}

include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg register-page">
	<main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
		<section class="register-card p-4 p-md-5 w-100">
			<div class="text-center mb-4">
				<p class="small text-uppercase tracking">DeepSleepers</p>
				<h2 class="text-light">Create Account</h2>
				<p class="text-muted mb-0">Join the sleep experience. Registration is for users 18+.</p>
			</div>

			<?php if (!empty($errors)): ?>
				<div class="alert alert-danger py-2" role="alert">
					<ul>
						<?php foreach ($errors as $error): ?>
							<li><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endif; ?>

			<form id="registerForm" class="row g-3" action="register.php" method="post" novalidate>
				<div class="col-12 col-md-6">
					<label for="fullname" class="form-label">Full Name</label>
					<input
						type="text"
						class="form-control"
						id="fullname"
						name="fullname"
						value="<?php echo htmlspecialchars($formData['fullname'], ENT_QUOTES, 'UTF-8'); ?>"
						required>
				</div>

				<div class="col-12 col-md-6">
					<label for="username" class="form-label">Username</label>
					<input
						type="text"
						class="form-control"
						id="username"
						name="username"
						value="<?php echo htmlspecialchars($formData['username'], ENT_QUOTES, 'UTF-8'); ?>"
						required>
				</div>

				<div class="col-12">
					<label for="email" class="form-label">Email</label>
					<input
						type="email"
						class="form-control"
						id="email"
						name="email"
						value="<?php echo htmlspecialchars($formData['email'], ENT_QUOTES, 'UTF-8'); ?>"
						required>
				</div>

				<div class="col-12 col-md-6">
					<label for="birthdate" class="form-label">Birthdate</label>
					<input
						type="date"
						class="form-control"
						id="birthdate"
						name="birthdate"
						value="<?php echo htmlspecialchars($formData['birthdate'], ENT_QUOTES, 'UTF-8'); ?>"
						required>
				</div>

				<div class="col-12 col-md-6">
					<label for="age" class="form-label">Age</label>
					<input
						type="number"
						min="18"
						class="form-control"
						id="age"
						name="age"
						value="<?php echo htmlspecialchars($formData['age'], ENT_QUOTES, 'UTF-8'); ?>"
						required>
				</div>

				<div class="col-12">
					<label class="form-label d-block">Gender</label>
					<div class="gender-group d-flex flex-column flex-sm-row gap-2">
						<input class="btn-check" type="radio" name="gender" id="genderMale" value="male" <?php echo $formData['gender'] === 'male' ? 'checked' : ''; ?>>
						<label class="btn btn-gender" for="genderMale">Male</label>

						<input class="btn-check" type="radio" name="gender" id="genderFemale" value="female" <?php echo $formData['gender'] === 'female' ? 'checked' : ''; ?>>
						<label class="btn btn-gender" for="genderFemale">Female</label>

						<input class="btn-check" type="radio" name="gender" id="genderOther" value="other" <?php echo $formData['gender'] === 'other' ? 'checked' : ''; ?>>
						<label class="btn btn-gender" for="genderOther">Other</label>
					</div>
				</div>

				<div class="col-12 col-md-6">
					<label for="password" class="form-label">Password</label>
					<input type="password" class="form-control" id="password" name="password" required>
				</div>

				<div class="col-12 col-md-6">
					<label for="confirm_password" class="form-label">Confirm Password</label>
					<input type="password" class="form-control" id="confirm_password" name="confirm_password" required>
				</div>

				<div class="col-12 d-grid mt-2">
					<button class="btn btn-accent btn-lg" type="submit">Create Account</button>
				</div>

				<div class="col-12 text-center mt-1">
					<span class="text-muted">Already have an account?</span>
					<a href="login.php" class="forgot-link ms-1">Login here</a>
				</div>
			</form>
		</section>
	</main>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
