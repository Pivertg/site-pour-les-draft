<?php
session_start();
session_destroy();
setcookie('PHPSESSID', '', time()-3600, '/');
echo json_encode(['ok' => true]);
?>
