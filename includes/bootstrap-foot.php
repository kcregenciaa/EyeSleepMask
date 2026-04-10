<?php
if (!isset($pageScripts) || !is_array($pageScripts)) {
    $pageScripts = [];
}

if (!function_exists('asset_url')) {
    function asset_url($path)
    {
        $path = (string) $path;

        if ($path === '' || preg_match('/^(https?:)?\\/\\//i', $path)) {
            return $path;
        }

        $cleanPath = strtok($path, '?');
        $relativePath = ltrim(str_replace('\\\\', '/', (string) $cleanPath), '/');
        $absolutePath = realpath(__DIR__ . '/../' . $relativePath);

        if ($absolutePath && is_file($absolutePath)) {
            $version = @filemtime($absolutePath);
            if ($version) {
                $separator = strpos($path, '?') !== false ? '&' : '?';
                return $path . $separator . 'v=' . $version;
            }
        }

        return $path;
    }
}
?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<?php foreach ($pageScripts as $script): ?>
    <script src="<?php echo htmlspecialchars(asset_url($script), ENT_QUOTES, 'UTF-8'); ?>"></script>
<?php endforeach; ?>
</body>
</html>
