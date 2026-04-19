<?php
session_start();
require __DIR__ . '/backend/form_security.php';

$pageTitle = 'DOZE | Login';
$pageStyles = ['assets/css/login.css'];
$pageScripts = ['assets/js/login.js'];
$loginFlash = pop_form_flash('login');
$csrfToken = csrf_token();

include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg login-page">
	<main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
		<section class="login-card p-4 p-md-5 w-100">
			<div class="text-center mb-4">
				<p class="small text-uppercase tracking">DOZE</p>
				<h2 class="text-light">Welcome Back</h2>
				<p class="muted-soft mb-0">Sign in to continue to your sleep dashboard</p>
			</div>

			<form id="loginForm" class="row g-3" action="backend/backend_login.php" method="post" novalidate>
				<input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
				<?php if (is_array($loginFlash) && !empty($loginFlash['message'])): ?>
					<div class="col-12">
						<div class="card <?php echo $loginFlash['type'] === 'success' ? 'success' : 'error'; ?> auth-card auth-card-form" role="alert">
							<?php echo htmlspecialchars((string)$loginFlash['message'], ENT_QUOTES, 'UTF-8'); ?>
						</div>
					</div>
				<?php endif; ?>

				<div class="col-12">
					<label for="username" class="form-label">Username</label>
					<input type="text" class="form-control" id="username" name="username" placeholder="Enter username" required>
				</div>
				<div class="col-12">
					<label for="password" class="form-label">Password</label>
					<input type="password" class="form-control" id="password" name="password" placeholder="Enter password" required>
				</div>
				<div class="col-12 d-grid mt-2">
					<button class="btn btn-accent btn-lg" type="submit">Login</button>
				</div>
				<div class="col-12 text-center mt-2">
					<a href="index.php" class="forgot-link">Forgot Password?</a>
				</div>
				<div class="col-12 text-center mt-1">
					<span class="muted-soft">New user?</span>
					<a href="register.php" class="forgot-link ms-1">Register first</a>
				</div>
			</form>
		</section>
	</main>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>
