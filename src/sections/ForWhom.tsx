import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Users, Clock, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const criteria = [
  {
    icon: TrendingUp,
    title: 'Оборот от 500 млн ₽ в год',
    description: 'У компании есть что анализировать и оптимизировать'
  },
  {
    icon: Users,
    title: 'Готовность собственника участвовать',
    description: 'Я работаю в паре с владельцем бизнеса, без этого не получится'
  },
  {
    icon: Clock,
    title: 'Временной горизонт — от 3 месяцев',
    description: 'Быстрые результаты есть, но система требует времени'
  },
  {
    icon: RefreshCw,
    title: 'Готовность к изменениям',
    description: 'Придётся менять процессы и подходы'
  }
];

const ForWhom = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const criteriaRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Center circle animation
      gsap.fromTo(centerRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Connecting lines draw animation
      const lines = linesRef.current?.querySelectorAll('.connecting-line');
      if (lines) {
        lines.forEach((line, index) => {
          gsap.fromTo(line,
            { strokeDashoffset: 200 },
            {
              strokeDashoffset: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
                toggleActions: 'play none none reverse'
              },
              delay: 0.4 + index * 0.12
            }
          );
        });
      }

      // Criteria cards animation
      const cards = criteriaRef.current?.querySelectorAll('.criterion-card');
      if (cards) {
        cards.forEach((card, index) => {
          const directions = [
            { x: -50, y: -50 },
            { x: 50, y: -50 },
            { x: -50, y: 50 },
            { x: 50, y: 50 }
          ];
          const dir = directions[index];
          
          gsap.fromTo(card,
            { x: dir.x, y: dir.y, opacity: 0 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 55%',
                toggleActions: 'play none none reverse'
              },
              delay: 0.6 + index * 0.12
            }
          );
        });
      }

      // Continuous pulse animation for center
      gsap.to(centerRef.current, {
        scale: 1.02,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="for-whom"
      className="relative py-12 lg:py-20 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Desktop Layout with Center Circle */}
          <div className="hidden lg:block relative">
            {/* Center Title */}
            <div 
              ref={centerRef}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0"
            >
              <div className="w-64 h-64 rounded-full bg-[var(--color-bg-card)] border-2 border-[var(--color-gold)] flex items-center justify-center p-8 animate-pulse-glow">
                <h2 className="text-2xl font-semibold text-center leading-tight">
                  Подходит <span className="text-[var(--color-gold)]">не всем</span>.
                  <br />
                  И это нормально.
                </h2>
              </div>
            </div>

            {/* Connecting Lines SVG */}
            <svg 
              ref={linesRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ minHeight: '600px' }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--color-gold)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Lines from center to corners */}
              <line className="connecting-line" x1="50%" y1="50%" x2="15%" y2="15%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="200" strokeDashoffset="200" />
              <line className="connecting-line" x1="50%" y1="50%" x2="85%" y2="15%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="200" strokeDashoffset="200" />
              <line className="connecting-line" x1="50%" y1="50%" x2="15%" y2="85%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="200" strokeDashoffset="200" />
              <line className="connecting-line" x1="50%" y1="50%" x2="85%" y2="85%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="200" strokeDashoffset="200" />
            </svg>

            {/* Criteria Cards */}
            <div ref={criteriaRef} className="grid grid-cols-2 gap-x-80 gap-y-48 py-24">
              {criteria.map((criterion, index) => {
                const Icon = criterion.icon;
                const positions = [
                  'justify-self-end self-end',
                  'justify-self-start self-end',
                  'justify-self-end self-start',
                  'justify-self-start self-start'
                ];
                
                return (
                  <div 
                    key={index}
                    className={`criterion-card w-72 p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] opacity-0 hover:border-[var(--color-gold)] transition-all duration-300 hover:-translate-y-1 ${positions[index]}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{criterion.title}</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">{criterion.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-10 text-center">
              Подходит <span className="text-[var(--color-gold)]">не всем</span>.
              <br />
              И это нормально.
            </h2>

            <div className="space-y-4">
              {criteria.map((criterion, index) => {
                const Icon = criterion.icon;
                return (
                  <div 
                    key={index}
                    className="criterion-card p-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] opacity-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold mb-1">{criterion.title}</h3>
                        <p className="text-sm text-[var(--color-text-muted)]">{criterion.description}</p>
                      </div>
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

export default ForWhom;
