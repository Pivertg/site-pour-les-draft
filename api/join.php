<?php
header('Content-Type: application/json');
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $code = $data['code'] ?? '';
    $player = $data['player'] ?? '';
    if (!$code || !$player) {
        http_response_code(400);
        echo json_encode(['error' => 'Code et pseudo requis']);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id FROM rooms WHERE code = ?');
    $stmt->execute([$code]);
    $room = $stmt->fetch();
    if (!$room) {
        http_response_code(404);
        echo json_encode(['error' => 'Room not found']);
        exit;
    }
    $stmt2 = $pdo->prepare('INSERT INTO players (room_id, pseudo) VALUES (?, ?)');
    $stmt2->execute([$room['id'], $player]);
    echo json_encode(['ok' => true]);
} else {
    http_response_code(405);
}
?>