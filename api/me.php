<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Non connecté']);
    exit;
}
$stmt = $pdo->prepare('SELECT id, pseudo FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();
echo json_encode($user);
?>
