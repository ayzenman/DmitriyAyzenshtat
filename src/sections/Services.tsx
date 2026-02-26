import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Settings, Target, HandshakeIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    number: '01',
    icon: Search,
    title: 'Диагностика',
    duration: '2 недели',
    description: 'Понимаю текущую ситуацию в финансах',
    details: [
      'Собираю информацию, анализирую процессы',
      'Опрашиваю ключевых руководителей (онлайн-анкета и 2-3 личные встречи)',
      'Готовлю письменный отчёт с предложениями'
    ],
    {/*   price: '50 000 ₽' */}
  },
  {
    number: '02',
    icon: Settings,
    title: 'Настройка отчётности',
    duration: '2-4 месяца',
    description: 'Внедряю систему управленческой отчётности',
    details: [
      'Настройка отчётов по движению денег, прибыли, себестоимости',
      'Внедрение планирования и бюджетирования',
      'Ключевые показатели (KPI) для бизнеса',
      'Быстрые победы — улучшения "здесь и сейчас"'
    ],
    {/* price: '250 000 — 300 000 ₽/мес' */}
  },
  {
    number: '03',
    icon: Target,
    title: 'Стратегия',
    duration: '2 месяца',
    description: 'Разрабатываю финансовую стратегию роста',
    details: [
      'Модели роста, сценарии развития',
      'Инвестиционные решения, точки входа/выхода',
      'План масштабирования с финансовой моделью'
    ],
    {/* price: '250 000 — 300 000 ₽/мес' */}
  },
  {
    number: '04',
    icon: HandshakeIcon,
    title: 'Сопровождение',
    duration: 'постоянно',
    description: 'Остаюсь в команде для стратегических вопросов',
    details: [
      'Участие в ключевых совещаниях',
      'Анализ отчётности, корректировки',
      'Развитие системы под новые задачи',
          ],
    {/* price: '150 000 ₽/мес' */}
  }
];

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards animation
      const cards = sectionRef.current?.querySelectorAll('.service-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { rotateY: -30, opacity: 0, x: 100 },
            {
              rotateY: 0,
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              },
              delay: index * 0.15
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="services"
      className="relative py-12 lg:py-20 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 lg:mb-16">
            <h2 
              ref={titleRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 opacity-0"
            >
              Как выглядит <span className="text-[var(--color-gold)]">наше сотрудничество</span>
            </h2>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              
              return (
                <div 
                  key={index}
                  className="service-card group relative p-6 lg:p-8 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all duration-300 opacity-0"
                  style={{ perspective: '1000px' }}
                >
                  {/* Number */}
                  <div className="absolute top-4 right-4 font-mono text-4xl lg:text-5xl font-bold text-[var(--color-gold)] opacity-10">
                    {service.number}
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-gold)] transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[var(--color-gold)]" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl lg:text-2xl font-semibold mb-1">{service.title}</h3>
                      <span className="text-sm text-[var(--color-text-muted)]">{service.duration}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[var(--color-text-muted)] mb-4">{service.description}</p>

                  {/* Details - always visible */}
                  <ul className="space-y-2">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] mt-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Glow effect on hover */}
                  <div className="absolute -inset-px bg-[var(--color-gold)] opacity-0 group-hover:opacity-5 blur-lg rounded-xl -z-10 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
