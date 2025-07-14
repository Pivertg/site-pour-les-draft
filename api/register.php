<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
$pseudo = $data['pseudo'] ?? '';
$password = $data['password'] ?? '';

if (!$pseudo || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Pseudo et mot de passe requis']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare('INSERT INTO users (pseudo, password_hash) VALUES (?, ?)');
    $stmt->execute([$pseudo, $hash]);
    session_start();
    $_SESSION['user_id'] = $pdo->lastInsertId();
    setcookie('PHPSESSID', session_id(), time()+3600*24*30, '/');
    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['error' => 'Pseudo déjà utilisé']);
}
?>
