<?php
if (!isset($pageTitle)) {
    $pageTitle = 'DeepSleepers';
}
if (!isset($pageStyles) || !is_array($pageStyles)) {
    $pageStyles = [];
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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo htmlspecialchars(asset_url('assets/css/common.css'), ENT_QUOTES, 'UTF-8'); ?>">
    <?php foreach ($pageStyles as $style): ?>
        <link rel="stylesheet" href="<?php echo htmlspecialchars(asset_url($style), ENT_QUOTES, 'UTF-8'); ?>">
    <?php endforeach; ?>
</head>
