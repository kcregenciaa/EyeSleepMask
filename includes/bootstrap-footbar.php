<?php
// Determine current page to highlight active nav item
$currentPage = basename($_SERVER['PHP_SELF']);
$isActive = function($page) use ($currentPage) {
    return $currentPage === $page ? 'active' : '';
};
?>
<footer class="mobile-footbar">
    <nav class="footbar-container">
        <a href="statistics.php" class="footbar-item <?php echo $isActive('statistics.php'); ?>" title="Statistics" aria-label="Statistics">
            <img src="assets/images/logo.png" alt="Statistics" class="footbar-icon-image">
        </a>
        <a href="sleep-tracker.php" class="footbar-item <?php echo $isActive('sleep-tracker.php'); ?>" title="Clock" aria-label="Clock">
            <i class="bi bi-moon-stars"></i>
        </a>
        <a href="device.php" class="footbar-item <?php echo $isActive('device.php'); ?>" title="Device" aria-label="Device">
            <i class="bi bi-cpu"></i>
        </a>
        <a href="settings.php" class="footbar-item <?php echo $isActive('settings.php'); ?>" title="Settings" aria-label="Settings">
            <i class="bi bi-gear"></i>
        </a>
    </nav>
</footer>
