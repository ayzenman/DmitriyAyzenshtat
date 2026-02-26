import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wallet, TrendingDown, CalendarX, EyeOff } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    icon: Wallet,
    title: '«Куда уходят деньги?»',
    description: 'Отсутствие прозрачной отчётности по движению денежных средств'
  },
  {
    icon: TrendingDown,
    title: '«Прибыль есть, а денег нет»',
    description: 'Путаница между бухгалтерской прибылью и реальным cash flow'
  },
  {
    icon: CalendarX,
    title: '«Планирование наугад»',
    description: 'Нет точных прогнозов, бюджеты составляются "на глазок"'
  },
  {
    icon: EyeOff,
    title: '«Решения вслепую»',
    description: 'Нет ключевых показателей для оценки эффективности'
  }
];

const Problems = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
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

      // Intro text
      gsap.fromTo(introRef.current,
        { opacity: 0, filter: 'blur(5px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.problem-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { x: 100, y: 50, rotateZ: 5, opacity: 0 },
            {
              x: 0,
              y: 0,
              rotateZ: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              },
              delay: index * 0.12
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
      id="problems"
      className="relative py-12 lg:py-20 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Diagonal Line Decoration */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-gold)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line 
          x1="0" 
          y1="100%" 
          x2="40%" 
          y2="0" 
          stroke="url(#lineGradient)" 
          strokeWidth="1"
          className="problem-line"
        />
      </svg>

      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column - Text */}
            <div className="lg:sticky lg:top-32">
              <h2 
                ref={titleRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6 opacity-0 leading-tight"
              >
                Большинство компаний на росте{' '}
                <span className="text-[var(--color-gold)]">теряют управляемость</span>
              </h2>
              
              <p 
                ref={introRef}
                className="text-base lg:text-lg text-[var(--color-text-muted)] leading-relaxed opacity-0"
              >
                Когда бизнес растёт быстрее, чем успевают выстраиваться процессы, 
                финансовая картина размывается. Собственник принимает решения вслепую — 
                по интуиции или по тем данным, которые не отражают реальность.
              </p>
            </div>

            {/* Right Column - Cards */}
            <div ref={cardsRef} className="space-y-4">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <div 
                    key={index}
                    className="problem-card group relative p-6 lg:p-8 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--color-gold)] opacity-0"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-[var(--color-gold)] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    
                    <div className="relative flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-gold)] transition-colors duration-300">
                        <Icon className="w-6 h-6 text-[var(--color-gold)]" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg lg:text-xl font-semibold mb-2 text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors duration-300">
                          {problem.title}
                        </h3>
                        <p className="text-sm lg:text-base text-[var(--color-text-muted)] leading-relaxed">
                          {problem.description}
                        </p>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-xl">
                      <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-[var(--color-gold)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-0 right-0 h-px w-8 bg-gradient-to-l from-[var(--color-gold)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problems;
