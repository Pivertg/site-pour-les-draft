<?php
header('Content-Type: application/json');
$code = $_POST['code'] ?? ($_GET['code'] ?? null);
if (!$code) {
    http_response_code(400);
    echo json_encode(['error' => 'Code manquant']);
    exit;
}
$file = __DIR__ . "/game_state_$code.json";
if (file_exists($file)) {
    unlink($file);
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'error' => 'Fichier non trouvé']);
}
