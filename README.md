# ayzenshtat.ru

Сайт Дмитрия Айзенштата — системы управления для собственников бизнеса.

## Устройство

Сайт статичный: обычные HTML-страницы, без сборки и фреймворков.

| Путь | Что это |
|---|---|
| `index.html` | главная страница |
| `public/assets/site.css` | стили главной |
| `public/assets/js/site.js` | анимации, меню, форма записи, баннер cookie, цели Метрики |
| `public/assets/js/gsap.min.js`, `ScrollTrigger.min.js` | библиотека анимаций GSAP |
| `public/library/` | библиотека статей — каждая статья в своей папке `index.html` |
| `public/send-max.php` | приём заявок с формы и пересылка в MAX |
| `public/privacy.html` | политика обработки персональных данных |
| `public/404.html`, `public/.htaccess` | страница «не найдено» и настройки сервера |
| `public/sitemap.xml`, `public/robots.txt` | для поисковиков |
| `public/google…html`, `public/yandex_…html` | подтверждение прав в Search Console и Яндекс Вебмастере — не удалять |

## Обновление стилей и скрипта главной

После правки `site.css` или `site.js` поменяйте в `index.html` число после `?v=` (например, на сегодняшнюю дату) — иначе браузеры посетителей могут ещё какое-то время показывать старую версию.

## Выкладка

Любой коммит в `main` запускает `.github/workflows/deploy.yml`:
файлы из `public/` и `index.html` копируются в папку `dist`, туда же создаётся `secrets.php`
(токен MAX из GitHub Secrets), и всё загружается по FTP в `public_html/`.
Загружаются только изменённые файлы. Две выкладки одновременно не идут — вторая ждёт первую.

Запустить выкладку вручную: вкладка **Actions → Deploy → Run workflow**.

## Цели Яндекс Метрики (счётчик 110737676)

Главная: `lead_form_sent` (заявка отправлена), `home_tg_channel`, `home_tg_personal`, `home_email`.
Статьи: `<статья>_read_90s`, `<статья>_scroll_75`, `<статья>_to_telegram`, `<статья>_to_home` и др.
Тест: `test_started`, `test_company_filled`, `test_completed`.
