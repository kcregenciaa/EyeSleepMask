<?php
session_start();
require __DIR__ . '/backend/form_security.php';

$pageTitle = 'DOZE | Register';
$pageStyles = ['assets/css/register.css'];
$pageScripts = ['assets/js/register.js'];

$formData = [
	'fullname' => '',
	'username' => '',
	'email' => '',
	'birthdate' => '',
	'age' => '',
	'gender' => ''
];

$registerFlash = pop_form_flash('register');
$csrfToken = csrf_token();

if (isset($_SESSION['register_form_data']) && is_array($_SESSION['register_form_data'])) {
	$formData = array_merge($formData, $_SESSION['register_form_data']);
	unset($_SESSION['register_form_data']);
}

include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg register-page">
	<main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
		<section class="register-card p-4 p-md-5 w-100">
			<div class="text-center mb-4">
				<p class="small text-uppercase tracking">DOZE</p>
				<h2 class="text-light">Create Account</h2>
				<p class="text-muted mb-0">Join the sleep experience. Registration is for users 18+.</p>
			</div>

			<form id="registerForm" class="row g-3" action="backend/backend_register.php" method="post" novalidate>
				<input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
				<?php if (is_array($registerFlash) && !empty($registerFlash['message'])): ?>
					<div class="col-12">
						<div class="card <?php echo $registerFlash['type'] === 'success' ? 'success' : 'error'; ?> auth-card auth-card-form" role="alert">
							<?php echo htmlspecialchars((string)$registerFlash['message'], ENT_QUOTES, 'UTF-8'); ?>
						</div>
					</div>
				<?php endif; ?>

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
					<div class="password-field-wrap">
						<input type="password" class="form-control password-field" id="password" name="password" required>
						<button type="button" class="password-toggle-btn" data-password-toggle="password" aria-label="Show password" aria-pressed="false">
							<i class="bi bi-eye"></i>
						</button>
					</div>
				</div>

				<div class="col-12 col-md-6">
					<label for="confirm_password" class="form-label">Confirm Password</label>
					<div class="password-field-wrap">
						<input type="password" class="form-control password-field" id="confirm_password" name="confirm_password" required>
						<button type="button" class="password-toggle-btn" data-password-toggle="confirm_password" aria-label="Show confirm password" aria-pressed="false">
							<i class="bi bi-eye"></i>
						</button>
					</div>
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
