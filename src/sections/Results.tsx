import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const results = [
  {
    title: '«Видим реальную прибыль по каждому направлению»',
    before: 'Общая цифра в бухгалтерии, непонятно что приносит деньги',
    after: 'Прозрачная маржинальность по продуктам и клиентам'
  },
  {
    title: '«Принимаем решения быстрее и увереннее»',
    before: 'Долгие совещания без конкретики, решения на интуиции',
    after: 'Чёткие данные за 5 минут, обоснованные решения'
  },
  {
    title: '«Деньги перестали "испаряться"»',
    before: 'Прибыль есть, а денег нет, непонятно куда ушло',
    after: 'Прозрачный cash flow, планирование платежей'
  },
  {
    title: '«Понимаем, куда расти»',
    before: 'Рост "вслепую", непонятно какие направления окупаются',
    after: 'Ясная картина по точкам роста и инвестициям'
  }
];

const Results = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards animation with 3D rise effect
      const cards = cardsRef.current?.querySelectorAll('.result-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { y: 80, rotateX: 15, opacity: 0 },
            {
              y: 0,
              rotateX: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              },
              delay: index * 0.13
            }
          );
        });
      }

      // Background color shift on scroll
      gsap.to(sectionRef.current, {
        backgroundColor: '#242b3d',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="results"
      className="relative py-12 lg:py-20 overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-gold)] opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <div className="section-padding relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h2 
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-12 lg:mb-16 text-center opacity-0"
          >
            Результаты, которые <span className="text-[var(--color-gold)]">получают клиенты</span>
          </h2>

          {/* Results Grid */}
          <div 
            ref={cardsRef}
            className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12"
            style={{ perspective: '800px' }}
          >
            {results.map((result, index) => (
              <div 
                key={index}
                className="result-card group relative p-6 lg:p-8 rounded-xl bg-[var(--color-bg-card)] border-l-4 border-[var(--color-gold)] opacity-0 transition-all duration-400 hover:translate-z-10 hover:scale-[1.02] hover:shadow-2xl"
                style={{ 
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}
              >
                {/* Title */}
                <h3 className="text-lg lg:text-xl font-semibold mb-6 text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors duration-300">
                  {result.title}
                </h3>

                {/* Before/After */}
                <div className="space-y-4">
                  {/* Before */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center mt-0.5">
                      <span className="text-xs text-[var(--color-text-muted)]">×</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">Раньше</span>
                      <p className="text-sm text-[var(--color-text-muted)]">{result.before}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-[var(--color-gold)] rotate-90" />
                  </div>

                  {/* After */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)] flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-gold)]" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[var(--color-gold)] block mb-1">Сейчас</span>
                      <p className="text-sm text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors duration-300">{result.after}</p>
                    </div>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl bg-[var(--color-gold)] opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Обсудить мою ситуацию</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Results;
