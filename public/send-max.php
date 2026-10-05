<?php


// ======= ЗАГРУЗКА СЕКРЕТОВ (токен лежит вне репозитория) =======
$secretsPath = __DIR__ . '/secrets.php';
if (!file_exists($secretsPath)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'no_secrets']);
    error_log('send-max: secrets.php not found');
    exit;
}
$secrets = require $secretsPath; // вернёт массив ['bot_token' => '...', 'chat_id' => 000]
$BOT_TOKEN = $secrets['bot_token'] ?? '';
$CHAT_ID   = $secrets['chat_id'] ?? 0;
// ===============================================================

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

if ($BOT_TOKEN === '' || $CHAT_ID === 0) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'bad_secrets']);
    exit;
}

// Читаем данные формы (JSON или обычный POST)
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

function clean($v) {
    return trim(mb_substr((string)($v ?? ''), 0, 2000));
}
$name    = clean($input['name']    ?? '');
$method  = clean($input['method']  ?? '');
$contact = clean($input['contact'] ?? '');
$topic   = clean($input['topic']   ?? '');

// Совместимость со старой формой (если страница закеширована у посетителя)
$phone   = clean($input['phone']   ?? '');
$email   = clean($input['email']   ?? '');
$company = clean($input['company'] ?? '');
if ($contact === '' && $phone !== '') { $method = 'phone'; $contact = $phone; }
if ($contact === '' && $email !== '') { $method = 'email'; $contact = $email; }
if ($topic === '' && $company !== '') { $topic = $company; }

$methodLabels = ['phone' => 'Телефон', 'telegram' => 'Telegram', 'max' => 'Max', 'email' => 'Email'];
$methodLabel  = $methodLabels[$method] ?? 'Контакт';

// Минимальная проверка: имя и контакт
if ($name === '' || $contact === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'validation']);
    exit;
}

// Текст заявки (в MAX поддерживается HTML-разметка)
$lines = [];
$lines[] = '<b>Новая заявка с сайта</b>';
$lines[] = '';
$lines[] = '<b>Имя:</b> ' . htmlspecialchars($name);
$lines[] = '<b>' . $methodLabel . ':</b> ' . htmlspecialchars($contact);
if ($topic !== '') $lines[] = '<b>Что хотят обсудить:</b> ' . htmlspecialchars($topic);
$lines[] = '';
$lines[] = '<i>' . date('d.m.Y H:i') . '</i>';
$text = implode("\n", $lines);

// Отправка в MAX
$url = 'https://platform-api2.max.ru/messages?chat_id=' . $CHAT_ID;
$payload = json_encode(['text' => $text, 'format' => 'html'], JSON_UNESCAPED_UNICODE);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: ' . $BOT_TOKEN,
    'Content-Type: application/json',
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($resp !== false && $code >= 200 && $code < 300) {
    echo json_encode(['ok' => true]);
} else {
    error_log('send-max failed: HTTP ' . $code . ' resp=' . $resp . ' err=' . $err);
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
