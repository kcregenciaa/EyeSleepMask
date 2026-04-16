<?php
session_start();

$pageTitle = 'DeepSleepers | Login';
$pageStyles = ['assets/css/login.css'];
$pageScripts = ['assets/js/login.js'];
$registered = isset($_GET['registered']) && $_GET['registered'] === '1';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$username = trim($_POST['username'] ?? '');
	if ($username !== '') {
		$_SESSION['user_name'] = $username;
		header('Location: sleep-tracker.php');
		exit;
	}
}

include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg login-page">
	<div id="pageLoader" class="page-loader" aria-live="polite" aria-label="Loading DeepSleepers login">
		<div class="mask-logo" role="img" aria-label="Eye Sleep Mask logo">
			<span class="strap"></span>
			<span class="eye left-eye"></span>
			<span class="eye right-eye"></span>
			<span class="glow"></span>
		</div>
		<h1>EYE SLEEP MASK</h1>
		<p>Preparing dream mode...</p>
	</div>

	<main class="container py-4 min-vh-100 d-flex align-items-center justify-content-center">
		<section class="login-card p-4 p-md-5 w-100">
			<div class="text-center mb-4">
				<p class="small text-uppercase tracking">DeepSleepers</p>
				<h2 class="text-light">Welcome Back</h2>
				<p class="muted-soft mb-0">Sign in to continue to your sleep dashboard</p>
			</div>

			<?php if ($registered): ?>
				<div class="alert alert-success py-2" role="alert">
					Registration complete. You can now log in.
				</div>
			<?php endif; ?>

			<form id="loginForm" class="row g-3" action="login.php" method="post" novalidate>
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
