<?php
$host = "sql313.infinityfree.com"; // remplace par ton vrai serveur
$user = "if0_39441285";            // ton nom d’utilisateur MySQL
$pass = "9LA3MJbIduLI";        // ton mot de passe MySQL
$db   = "if0_39441285_pivert"; // nom complet de la base
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erreur de connexion: " . $conn->connect_error);
}
?>