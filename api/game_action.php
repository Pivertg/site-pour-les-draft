<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$code = $input['code'] ?? null;
$pseudo = $input['pseudo'] ?? null;
$type = $input['type'] ?? null;
$value = $input['value'] ?? null;
if (!$code || !$pseudo || !$type) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètres manquants']);
    exit;
}
$file = __DIR__ . "/game_state_$code.json";
$state = file_exists($file) ? json_decode(file_get_contents($file), true) : [
    'phase' => 'ban',
    'bansBleu' => [],
    'bansRouge' => [],
    'picksBleu' => [],
    'picksRouge' => [],
    'brawlers' => [],
    'mode' => '',
    'map' => '',
    'modeImg' => '',
    'mapImg' => ''
];
// Initialisation de la liste des brawlers si vide
if (empty($state['brawlers'])) {
    $state['brawlers'] = array_map(function($i) {
        return [
            'name' => 'Brawler ' . $i,
            'img' => 'https://via.placeholder.com/44x44?text=B' . $i
        ];
    }, range(1, 30));
}
// Gestion des actions
if ($type === 'ban') {
    // Pour la démo, on alterne bleu/rouge selon le nombre de bans
    $team = count($state['bansBleu']) <= count($state['bansRouge']) ? 'bansBleu' : 'bansRouge';
    $brawler = array_values(array_filter($state['brawlers'], fn($b) => $b['name'] === $value));
    if ($brawler) $state[$team][] = $brawler[0];
    // Passage à la phase pick si assez de bans
    if (count($state['bansBleu']) + count($state['bansRouge']) >= 4) $state['phase'] = 'pick';
}
if ($type === 'pick') {
    // Pour la démo, on alterne bleu/rouge selon le nombre de picks
    $team = count($state['picksBleu']) <= count($state['picksRouge']) ? 'picksBleu' : 'picksRouge';
    $brawler = array_values(array_filter($state['brawlers'], fn($b) => $b['name'] === $value));
    if ($brawler) $state[$team][] = $brawler[0];
    // Passage à la phase end si assez de picks
    if (count($state['picksBleu']) + count($state['picksRouge']) >= 6) $state['phase'] = 'end';
}
file_put_contents($file, json_encode($state));
echo json_encode(['ok' => true]);
