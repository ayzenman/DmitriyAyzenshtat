<?php
header('Content-Type: application/json');

// Подключаем конфигурацию с паролями (файл находится выше папки сайта)
require_once __DIR__ . '/../config/email-config.php';

// Подключаем PHPMailer (он лежит рядом)
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Получаем данные из формы
$name   = $_POST['name'] ?? '';
$phone  = $_POST['phone'] ?? '';
$email  = $_POST['email'] ?? '';
$company = $_POST['company'] ?? '';

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Имя и телефон обязательны']);
    exit;
}

// Формируем письмо
$subject = "Новая заявка с сайта ayzenshtat.ru";
$message = "
    <html>
    <body>
        <h2>Заявка с сайта</h2>
        <p><strong>Имя:</strong> $name</p>
        <p><strong>Телефон:</strong> $phone</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Компания / оборот:</strong> $company</p>
    </body>
    </html>
";

$mail = new PHPMailer(true);
try {
    // SMTP настройки (берутся из конфига)
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;

    // Отправитель и получатель
    $mail->setFrom(SMTP_USER, 'Сайт ayzenshtat.ru');
    $mail->addAddress(RECIPIENT_EMAIL);
    $mail->addReplyTo($email, $name);

    // Содержимое
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $message;

    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка отправки: ' . $mail->ErrorInfo]);
}
