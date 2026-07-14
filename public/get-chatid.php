<?php
/**
 * get-chatid.php — ВРЕМЕННЫЙ скрипт, чтобы узнать ваш chat_id в MAX.
 *
 * КАК ПОЛЬЗОВАТЬСЯ:
 * 1. Впишите токен бота в переменную $TOKEN ниже (между кавычек).
 * 2. Залейте файл на сайт, НО ПОКА НЕ ОТКРЫВАЙТЕ.
 * 3. Зайдите в MAX, найдите своего бота, нажмите «Начать» и напишите ему
 *    любое сообщение (например, «привет»).
 * 4. Теперь откройте в браузере https://ваш-сайт/get-chatid.php
 * 5. На странице появится ваш chat_id — запишите его.
 * 6. УДАЛИТЕ этот файл с сайта (в нём лежит токен — он не должен там оставаться).
 */

$TOKEN = 'f9LHodD0cOJPOQMbOHTlRtFrqZch4RVchuJghWorxNJNnwGyH9s_ndlxi7-NYJqThfyYnNx83bbKBpckG-hC'; // <-- ВСТАВЬТЕ СЮДА ТОКЕН БОТА (из @MasterBot / платформы MAX)

header('Content-Type: text/html; charset=utf-8');
echo "<html><head><meta charset='utf-8'></head><body style='font-family:sans-serif;max-width:700px;margin:40px auto;line-height:1.6'>";
echo "<h1>Получение chat_id из MAX</h1>";

if ($TOKEN === '') {
    echo "<p style='color:#c00'><b>Сначала впишите токен бота</b> в переменную \$TOKEN внутри файла и залейте снова.</p>";
    echo "</body></html>";
    exit;
}

$url = 'https://platform-api2.max.ru/updates?limit=100';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: ' . $TOKEN]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($resp === false) {
    echo "<p style='color:#c00'>Ошибка запроса: $err</p></body></html>";
    exit;
}
if ($code === 401) {
    echo "<p style='color:#c00'>Ошибка 401 — токен неверный. Проверьте, что вставили токен полностью и без пробелов.</p></body></html>";
    exit;
}

$data = json_decode($resp, true);
echo "<p>HTTP-код ответа: <code>$code</code></p>";

$found = [];
if (!empty($data['updates'])) {
    foreach ($data['updates'] as $u) {
        $cid = null; $name = '';
        if (isset($u['chat_id'])) $cid = $u['chat_id'];
        if (isset($u['message']['recipient']['chat_id'])) $cid = $u['message']['recipient']['chat_id'];
        if (isset($u['message']['sender']['name'])) $name = $u['message']['sender']['name'];
        if ($cid !== null) $found[$cid] = $name;
    }
}

if (!empty($found)) {
    echo "<h2 style='color:#1a7f37'>Найденные chat_id:</h2><ul>";
    foreach ($found as $cid => $name) {
        echo "<li><b>chat_id = <code>$cid</code></b>" . ($name ? " (от: " . htmlspecialchars($name) . ")" : "") . "</li>";
    }
    echo "</ul><p>Запишите нужный chat_id (тот, что от вашего имени) — он понадобится для настройки формы.</p>";
} else {
    echo "<p style='color:#c60'>Обновления не найдены. Убедитесь, что вы:<br>";
    echo "1) нажали «Начать» у бота в MAX,<br>2) написали боту любое сообщение,<br>";
    echo "и только потом открыли эту страницу. Затем обновите страницу.</p>";
    echo "<details><summary>Технический ответ сервера (для отладки)</summary><pre>" . htmlspecialchars($resp) . "</pre></details>";
}

echo "<hr><p style='color:#c00'><b>После получения chat_id удалите этот файл с сайта — в нём токен.</b></p>";
echo "</body></html>";
