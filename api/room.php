<?php
header('Content-Type: application/json');
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $code = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $player = $data['player'] ?? null;
    if (!$player) {
        http_response_code(400);
        echo json_encode(['error' => 'Pseudo requis']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO rooms (code) VALUES (?)');
    $stmt->execute([$code]);
    $room_id = $pdo->lastInsertId();
    $stmt2 = $pdo->prepare('INSERT INTO players (room_id, pseudo) VALUES (?, ?)');
    $stmt2->execute([$room_id, $player]);
    echo json_encode(['code' => $code]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $code = $_GET['code'] ?? '';
    $stmt = $pdo->prepare('SELECT r.id, r.code, p.pseudo FROM rooms r LEFT JOIN players p ON r.id = p.room_id WHERE r.code = ?');
    $stmt->execute([$code]);
    $rows = $stmt->fetchAll();
    if (!$rows) {
        http_response_code(404);
        echo json_encode(['error' => 'Room not found']);
        exit;
    }
    $players = array_map(fn($row) => $row['pseudo'], $rows);
    // Ajout de l'état de partie partagé (pour play.js)
    $file = __DIR__ . "/game_state_$code.json";
    $gameState = file_exists($file) ? json_decode(file_get_contents($file), true) : null;
    $result = ['code' => $code, 'players' => $players];
    if ($gameState) {
        $result = array_merge($result, $gameState);
    }
    echo json_encode($result);
} else {
    http_response_code(405);
}
?>