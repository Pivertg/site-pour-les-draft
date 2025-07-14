<?php
header('Content-Type: application/json');
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
$pseudo = $data['pseudo'] ?? '';
$password = $data['password'] ?? '';

$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE pseudo = ?');
$stmt->execute([$pseudo]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    session_start();
    $_SESSION['user_id'] = $user['id'];
    setcookie('PHPSESSID', session_id(), time()+3600*24*30, '/');
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Identifiants invalides']);
}
?>
