<?php
/**
 * test.php — временный диагностический файл.
 * Залейте его в корень сайта на SpaceWeb и откройте в браузере:
 *   https://ваш-сайт/test.php
 *
 * Он покажет, что доступно на вашем тарифе и заработает ли отправка заявок в MAX.
 * ПОСЛЕ ПРОВЕРКИ ФАЙЛ НУЖНО УДАЛИТЬ — он не должен оставаться на сайте.
 */

header('Content-Type: text/html; charset=utf-8');
echo "<html><head><meta charset='utf-8'><title>Проверка хостинга</title>";
echo "<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6}
.ok{color:#1a7f37;font-weight:bold}.bad{color:#c00;font-weight:bold}.row{padding:8px 0;border-bottom:1px solid #eee}
code{background:#f4f4f4;padding:2px 6px;border-radius:4px}</style></head><body>";
echo "<h1>Проверка возможностей хостинга</h1>";

function row($label, $ok, $note = '') {
    $mark = $ok ? "<span class='ok'>✓ ДА</span>" : "<span class='bad'>✗ НЕТ</span>";
    echo "<div class='row'><strong>$label:</strong> $mark";
    if ($note) echo "<br><small>$note</small>";
    echo "</div>";
}

// 1. Версия PHP
echo "<div class='row'><strong>Версия PHP:</strong> <code>" . phpversion() . "</code></div>";

// 2. cURL — основной способ отправки запроса в MAX
$has_curl = function_exists('curl_init');
row('Расширение cURL установлено', $has_curl,
    $has_curl ? 'Хорошо — это основной способ отправки в MAX.' : 'cURL нет — проверим запасной способ ниже.');

// 3. allow_url_fopen — запасной способ (file_get_contents по URL)
$has_fopen = filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN);
row('allow_url_fopen включён', $has_fopen,
    'Запасной способ отправки, если cURL недоступен.');

// 4. САМОЕ ГЛАВНОЕ: проходит ли реальный исходящий HTTPS-запрос наружу
echo "<h2>Главная проверка: исходящий запрос в интернет</h2>";
echo "<p>Пробуем реально достучаться до внешнего сервера (api.github.com — нейтральный тест).</p>";

$outbound_ok = false;
$detail = '';

if ($has_curl) {
    $ch = curl_init('https://api.github.com/zen');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_USERAGENT, 'hosting-test');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($resp !== false && $code >= 200 && $code < 400) {
        $outbound_ok = true;
        $detail = "Ответ получен (HTTP $code). cURL работает наружу.";
    } else {
        $detail = "cURL не смог: HTTP $code" . ($err ? ", ошибка: $err" : "");
    }
} elseif ($has_fopen) {
    $ctx = stream_context_create(['http' => ['timeout' => 10, 'header' => "User-Agent: hosting-test\r\n"]]);
    $resp = @file_get_contents('https://api.github.com/zen', false, $ctx);
    if ($resp !== false) {
        $outbound_ok = true;
        $detail = "Ответ получен через file_get_contents. Запросы наружу работают.";
    } else {
        $detail = "file_get_contents не смог получить ответ.";
    }
} else {
    $detail = "Нет ни cURL, ни allow_url_fopen — отправить запрос в MAX с этого хостинга не получится.";
}

row('Исходящий HTTPS-запрос проходит', $outbound_ok, $detail);

// Итог
echo "<h2>Вывод</h2>";
if ($outbound_ok) {
    echo "<p class='ok'>Хостинг подходит для отправки заявок в MAX через PHP.</p>";
    echo "<p>Можно делать вариант с <code>send-max.php</code> прямо на SpaceWeb.</p>";
} else {
    echo "<p class='bad'>С этого хостинга напрямую отправить заявку в MAX, скорее всего, не выйдет.</p>";
    echo "<p>Это частое ограничение бесплатных тарифов. Тогда пойдём через Yandex Cloud Functions — данные тоже остаются в РФ.</p>";
}

echo "<hr><p><strong>Не забудьте удалить этот файл (test.php) после проверки.</strong></p>";
echo "</body></html>";
