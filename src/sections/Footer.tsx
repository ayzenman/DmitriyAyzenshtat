import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(footerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 95%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer 
      ref={footerRef}
      className="relative py-8 border-t border-[var(--color-border)] opacity-0"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright + реквизиты владельца сайта (152-ФЗ) */}
            <div className="text-sm text-[var(--color-text-muted)] text-center sm:text-left">
              © {currentYear} Дмитрий Айзенштат. Все права защищены.
              {/* TODO: указать реквизиты владельца — ИП/ФИО, ИНН, ОГРНИП, контакт для связи */}
              <div className="mt-1 text-xs opacity-80">
                ИП Айзенштат Дмитрий Александрович · ИНН 744916201645 · ОГРНИП 325745600093550
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a 
                href="/privacy.html" 
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors"
              >
                Политика конфиденциальности
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
