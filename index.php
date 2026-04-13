<?php
$pageTitle = 'DeepSleepers | Home';
$pageStyles = ['assets/css/home.css'];
$pageScripts = ['assets/js/home.js'];
include __DIR__ . '/includes/bootstrap-head.php';
?>
<body class="deep-bg">
	<div class="bg-orb orb-one"></div>
	<div class="bg-orb orb-two"></div>

	<header class="container py-3">
		<nav class="navbar navbar-expand-lg glass-nav px-3 py-2 rounded-4">
			<a class="navbar-brand fw-semibold text-light" href="index.php">DeepSleepers</a>
			<button class="navbar-toggler border-0 text-light" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
				<i class="bi bi-list fs-3"></i>
			</button>
			<div class="collapse navbar-collapse" id="mainNav">
				<ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-3">
					<li class="nav-item"><a class="nav-link text-light" href="#features">Features</a></li>
					<li class="nav-item"><a class="nav-link text-light" href="#mask">Mask Tech</a></li>
					<li class="nav-item"><a class="nav-link text-light" href="discover.php">Discover</a></li>
				</ul>
				<a href="login.php" class="btn btn-accent ms-lg-3">Login</a>
			</div>
		</nav>
	</header>

	<main>
		<section class="container hero-section py-4 py-lg-5">
			<div class="row align-items-center g-4 g-lg-5">
				<div class="col-lg-6 order-2 order-lg-1">
					<span class="eyebrow-pill">Sleep Reimagined</span>
					<h1 class="display-5 fw-bold mt-3 text-light">DeepSleepers</h1>
					<p class="hero-copy mt-3 mb-4">
						Power your nights with a smarter eye sleep mask experience. Designed to block distractions,
						calm your senses, and help you wake up focused.
					</p>
					<div class="d-flex flex-wrap gap-3">
						<a href="login.php" class="btn btn-accent btn-lg">Start Sleeping Better</a>
						<a href="discover.php" class="btn btn-outline-light btn-lg">Explore Discover</a>
					</div>
					<div class="stats-row mt-4">
						<div class="stat-card">
							<strong>96%</strong>
							<span>Sleep satisfaction</span>
						</div>
						<div class="stat-card">
							<strong>7.8h</strong>
							<span>Average nightly rest</span>
						</div>
						<div class="stat-card">
							<strong>30d</strong>
							<span>Comfort guarantee</span>
						</div>
					</div>
				</div>

				<div class="col-lg-6 order-1 order-lg-2">
					<div class="hero-visual">
						<div class="mask-shell">
							<div class="mask-core">
								<div class="mini-mask" aria-hidden="true">
									<span class="mini-mask-strap"></span>
									<span class="mini-mask-eye mini-mask-eye-left"></span>
									<span class="mini-mask-eye mini-mask-eye-right"></span>
									<span class="mini-mask-glow"></span>
								</div>
							</div>
							<div class="mask-highlight"></div>
						</div>
						<div class="floating-chip chip-left">
							<i class="bi bi-moon-stars"></i> Ultra blackout
						</div>
						<div class="floating-chip chip-right">
							<i class="bi bi-volume-mute"></i> Quiet comfort
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="features" class="container py-5">
			<div class="row g-4">
				<div class="col-md-6 col-xl-4">
					<article class="feature-card h-100">
						<i class="bi bi-moon-stars feature-icon"></i>
						<h3>Fall Asleep Faster.</h3>
						<p>Neural Soundscapes designed to ease your racing mind into a relaxed sleep state.</p>
					</article>
				</div>
				<div class="col-md-6 col-xl-4">
					<article class="feature-card h-100">
						<i class="bi bi-activity feature-icon"></i>
						<h3>Double Deep Sleep.</h3>
						<p>Neurofeedback Smart Coaching helps strengthen the neural pathways responsible for deep sleep.</p>
					</article>
				</div>
				<div class="col-md-6 col-xl-4">
					<article class="feature-card h-100">
						<i class="bi bi-sunrise feature-icon"></i>
						<h3>Smart Sunrise Alarm.</h3>
						<p>Have the sun rise inside the mask, at the right time in your sleep cycle, improving morning energy.</p>
					</article>
				</div>
				<div class="col-md-6 col-xl-6">
					<article class="feature-card h-100">
						<i class="bi bi-eye-slash feature-icon"></i>
						<h3>100% Blackout.</h3>
						<p>Hundreds of head shapes studied to create a unique light-blocking 3D shape with deep eye pockets.</p>
					</article>
				</div>
				<div class="col-md-6 col-xl-6">
					<article class="feature-card h-100">
						<i class="bi bi-person-standing feature-icon"></i>
						<h3>Comfortable in every position.</h3>
						<p>Built by side-sleepers for side-sleepers. Engineered for comfort with no hard parts over the ears.</p>
					</article>
				</div>
			</div>
		</section>

		<section id="dashboard-video" class="container pb-5">
			<div class="dashboard-video-template p-4 p-lg-5">
				<div class="row g-4 align-items-center">
					<div class="col-lg-5">
						<span class="eyebrow-pill">Dashboard Demo</span>
						<h2 class="text-light mt-3">See the sleep dashboard in action</h2>
						<p class="mb-0 video-template-copy">Auto-playing product walkthrough styled to match your DeepSleepers interface. This block sits right after Features for a smooth story flow.</p>
					</div>
					<div class="col-lg-7">
						<div class="video-template-frame">
							<iframe
								title="DeepSleepers Dashboard Video"
								src="https://www.youtube.com/embed/u8CACcZGrOY?autoplay=1&mute=1&loop=1&playlist=u8CACcZGrOY&controls=1&modestbranding=1&rel=0"
								allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
								allowfullscreen
								loading="lazy"></iframe>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="deepsleepers-app" class="container pb-5">
			<div class="deepsleepers-app-panel p-4 p-lg-5">
				<h2 class="deepsleepers-app-title text-center">Great Sleep Begins With the Deep Sleepers App</h2>
				<div class="row g-4 g-xl-5 align-items-center mt-1">
					<div class="col-12 col-lg-6">
						<div class="app-ring-content">
							<div class="store-chip-row mb-3">
								<span class="store-chip"><i class="bi bi-google-play"></i></span>
								<span class="store-chip"><i class="bi bi-apple"></i></span>
							</div>
							<p class="mb-3">Choose your program, wear the mask, and leave the rest to Deep Sleepers.</p>
							<div class="ring-stage-row">
								<div class="sleep-ring-wrap">
									<div class="sleep-ring"></div>
									<div class="sleep-ring-inner">
										<strong>10:30</strong>
										<span>to</span>
										<strong>07:00</strong>
									</div>
								</div>
								<ul class="sleep-stage-list mb-0">
									<li>Falling asleep</li>
									<li>Light Sleep</li>
									<li>Deep Sleep</li>
									<li>REM Sleep</li>
									<li class="active">Waking up</li>
								</ul>
							</div>
						</div>
					</div>

					<div class="col-12 col-lg-6">
						<div class="app-visual-right">
							<article class="app-photo-card">
								<div class="app-photo-art" aria-hidden="true"></div>
								<div class="app-side-controls">
									<div class="app-toggle-row">
										<span>Neural Music</span>
										<span class="toggle-dot active"></span>
									</div>
									<div class="app-toggle-row">
										<span>Sunrise Lights</span>
										<span class="toggle-dot active"></span>
									</div>
								</div>
							</article>

							<article class="sleep-phone-card">
								<span class="phone-side-btn phone-side-btn-left-1" aria-hidden="true"></span>
								<span class="phone-side-btn phone-side-btn-left-2" aria-hidden="true"></span>
								<span class="phone-side-btn phone-side-btn-right" aria-hidden="true"></span>
								<div class="sleep-phone-notch"></div>
								<div class="sleep-phone-screen">
									<span class="sleep-phone-close" aria-hidden="true">×</span>
									<p class="sleep-app-label mb-2">Deep Sleepers</p>
									<div class="sleep-mask-pill">Battery level: 80%</div>
									<div class="sleep-time-panel mt-3">
										<span>Sleep</span>
										<strong>8:15 AM</strong>
										<button type="button">Start</button>
									</div>
									<ul class="sleep-list mt-3 mb-0">
										<li><i class="bi bi-moon-stars"></i> Sleep</li>
										<li><i class="bi bi-cup-hot"></i> Nap</li>
										<li><i class="bi bi-wind"></i> Meditate</li>
										<li><i class="bi bi-alarm"></i> Time shift</li>
									</ul>
								</div>
							</article>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="mask" class="container pb-5">
			<div class="spotlight-panel p-4 p-lg-5">
				<div class="row g-4 align-items-center">
					<div class="col-lg-8">
						<h2 class="text-light">Built for deep rest and sharp mornings</h2>
						<p class="mb-0">Inspired by premium sleep products, redesigned with a dark cinematic interface and smooth interactions that feel modern and focused.</p>
					</div>
					<div class="col-lg-4 text-lg-end">
						<a href="login.php" class="btn btn-accent">Get Started</a>
					</div>
				</div>
			</div>
		</section>
	</main>

<?php include __DIR__ . '/includes/bootstrap-foot.php'; ?>

