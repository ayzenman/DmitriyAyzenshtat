import { useState, useEffect } from 'react';

/**
 * Cookie-баннер для соответствия 152-ФЗ.
 * Информирует посетителя об использовании cookie и Яндекс.Метрики.
 * Факт согласия запоминается в localStorage, чтобы не показывать баннер повторно.
 *
 * Куда подключить: в App.tsx добавить <CookieBanner /> внутри корневого <div>,
 * рядом с <Footer /> (см. инструкцию в чате).
 */
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('cookie_consent');
      if (!accepted) setVisible(true);
    } catch {
      // если localStorage недоступен — показываем баннер на всякий случай
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('cookie_consent', 'true');
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5"
      style={{ background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[var(--color-text-muted)] leading-snug flex-1">
          Мы используем файлы cookie и сервис Яндекс.Метрика для работы сайта и анализа посещаемости.
          Продолжая пользоваться сайтом, вы соглашаетесь с обработкой данных в соответствии с{' '}
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-gold)] underline hover:no-underline"
          >
            Политикой обработки персональных данных
          </a>.
        </p>
        <button
          onClick={accept}
          className="btn-primary shrink-0 px-6 py-2 text-sm whitespace-nowrap"
        >
          Принять
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
