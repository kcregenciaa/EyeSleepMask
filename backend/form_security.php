<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

if (!function_exists('csrf_token')) {
    function csrf_token(): string
    {
        if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }
}

if (!function_exists('is_valid_csrf_token')) {
    function is_valid_csrf_token(?string $token): bool
    {
        if (!is_string($token) || $token === '') {
            return false;
        }

        $sessionToken = $_SESSION['csrf_token'] ?? '';
        return is_string($sessionToken) && $sessionToken !== '' && hash_equals($sessionToken, $token);
    }
}

if (!function_exists('set_form_flash')) {
    function set_form_flash(string $formKey, string $message, string $type = 'error'): void
    {
        $_SESSION['form_flash'][$formKey] = [
            'message' => $message,
            'type' => $type === 'success' ? 'success' : 'error'
        ];
    }
}

if (!function_exists('pop_form_flash')) {
    function pop_form_flash(string $formKey): ?array
    {
        $flashBucket = $_SESSION['form_flash'] ?? null;
        if (!is_array($flashBucket) || !isset($flashBucket[$formKey]) || !is_array($flashBucket[$formKey])) {
            return null;
        }

        $message = $flashBucket[$formKey]['message'] ?? '';
        $type = $flashBucket[$formKey]['type'] ?? 'error';

        unset($_SESSION['form_flash'][$formKey]);

        if (!is_string($message) || $message === '') {
            return null;
        }

        return [
            'message' => $message,
            'type' => $type === 'success' ? 'success' : 'error'
        ];
    }
}

if (!function_exists('clean_input_text')) {
    function clean_input_text($value, int $maxLength = 255): string
    {
        $text = trim((string) ($value ?? ''));
        $text = preg_replace('/[\x00-\x1F\x7F]/u', '', $text) ?? '';

        if ($maxLength > 0) {
            if (function_exists('mb_substr')) {
                $text = mb_substr($text, 0, $maxLength);
            } else {
                $text = substr($text, 0, $maxLength);
            }
        }

        return $text;
    }
}
