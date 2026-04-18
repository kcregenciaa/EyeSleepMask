<?php
// Determine current page to highlight active nav item
$currentPage = basename($_SERVER['PHP_SELF']);
$isActive = function($page) use ($currentPage) {
    return $currentPage === $page ? 'active' : '';
};
?>
<footer class="mobile-footbar">
    <nav class="footbar-container">
        <a href="statistics.php" class="footbar-item <?php echo $isActive('statistics.php'); ?>" title="Statistics">
            <i class="bi bi-bar-chart"></i>
            <span class="footbar-label">Stats</span>
        </a>
        <a href="sleep-tracker.php" class="footbar-item <?php echo $isActive('sleep-tracker.php'); ?>" title="Clock" aria-label="Clock">
            <i class="bi bi-moon-stars"></i>
            <span class="footbar-label">Clock</span>
        </a>
        <a href="device.php" class="footbar-item <?php echo $isActive('device.php'); ?>" title="Device">
            <i class="bi bi-cpu"></i>
            <span class="footbar-label">Device</span>
        </a>
        <a href="settings.php" class="footbar-item <?php echo $isActive('settings.php'); ?>" title="Settings">
            <i class="bi bi-gear"></i>
            <span class="footbar-label">Settings</span>
        </a>
    </nav>
</footer>
