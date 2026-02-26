import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, TrendingUp, BarChart3, PieChart } from 'lucide-react';

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const preTitleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // Background grid animation
      tl.fromTo('.grid-dot', 
        { opacity: 0, scale: 0 },
        { opacity: 0.15, scale: 1, duration: 1.2, stagger: { amount: 0.8, from: 'center' } }
      );

      // Pre-title
      tl.fromTo(preTitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.6'
      );

      // Title words animation
      const titleWords = titleRef.current?.querySelectorAll('.word');
      if (titleWords) {
        tl.fromTo(titleWords,
          { y: 100, opacity: 0, rotateX: -40 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.08 },
          '-=0.3'
        );
      }

      // Subtitle
      tl.fromTo(subtitleRef.current,
        { opacity: 0, filter: 'blur(10px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.7 },
        '-=0.4'
      );

      // CTA Button
      tl.fromTo(ctaRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
        '-=0.3'
      );

      // Metrics
      const metrics = metricsRef.current?.querySelectorAll('.metric-item');
      if (metrics) {
        tl.fromTo(metrics,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          '-=0.2'
        );
      }

      // Floating shapes
      gsap.to('.floating-shape', {
        y: 'random(-30, 30)',
        x: 'random(-20, 20)',
        rotation: 'random(-10, 10)',
        duration: 'random(8, 15)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: {
          amount: 5,
          from: 'random'
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle 
                cx="30" 
                cy="30" 
                r="2" 
                fill="var(--color-gold)" 
                className="grid-dot"
                opacity="0"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape absolute top-20 right-[15%] w-32 h-32 border border-[var(--color-gold)] opacity-10 rotate-45" />
        <div className="floating-shape absolute top-40 right-[25%] w-20 h-20 border border-[var(--color-gold)] opacity-10 rounded-full" />
        <div className="floating-shape absolute bottom-40 right-[10%] w-40 h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-20" />
        <div className="floating-shape absolute top-1/3 left-[5%] w-24 h-24 border border-[var(--color-border)] opacity-20" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--color-gold)] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[var(--color-gold)] opacity-[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 section-padding py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Pre-title */}
          <span 
            ref={preTitleRef}
            className="inline-block text-xs sm:text-sm tracking-[0.2em] uppercase text-[var(--color-gold)] mb-6 opacity-0"
          >
            Финансовый консалтинг для среднего бизнеса
          </span>

          {/* Title */}
          <h1 
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-8 perspective-1000"
          >
            <span className="word inline-block opacity-0">Превращаю</span>{' '}
            <span className="word inline-block opacity-0">финансовый</span>{' '}
            <span className="word inline-block opacity-0 text-[var(--color-gold)]">хаос </span>
            <br className="hidden sm:block" />
            <span className="word inline-block opacity-0">в </span>{' '}
            <span className="word inline-block opacity-0">стратегическое </span>
            <br className="hidden sm:block" />
            <span className="word inline-block opacity-0 text-[var(--color-gold)]">преимущество</span>
          </h1>

          {/* Subtitle */}
          <p 
            ref={subtitleRef}
            className="text-base sm:text-lg lg:text-xl text-[var(--color-text-muted)] max-w-2xl mb-10 leading-relaxed opacity-0"
          >
            Для собственников компаний с оборотом от 500 млн рублей, 
            которые хотят видеть реальную картину бизнеса и принимать взвешенные решения
          </p>

          {/* CTA Button */}
          <button 
            ref={ctaRef}
            onClick={scrollToContact}
            className="btn-primary group opacity-0"
          >
            <span>Получить консультацию</span>
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Metrics Panel */}
        <div 
          ref={metricsRef}
          className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-12 max-w-4xl"
        >
          <div className="metric-item flex items-center gap-4 opacity-0">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--color-gold)]" />
            </div>
            <div>
              <div className="font-mono text-2xl lg:text-3xl font-semibold text-[var(--color-gold)]">15+</div>
              <div className="text-sm text-[var(--color-text-muted)]">лет опыта</div>
            </div>
          </div>

          <div className="metric-item flex items-center gap-4 opacity-0">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[var(--color-gold)]" />
            </div>
            <div>
              <div className="font-mono text-2xl lg:text-3xl font-semibold text-[var(--color-gold)]">2 млрд+</div>
              <div className="text-sm text-[var(--color-text-muted)]">оборот под управлением</div>
            </div>
          </div>

          <div className="metric-item flex items-center gap-4 opacity-0">
            <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
              <PieChart className="w-6 h-6 text-[var(--color-gold)]" />
            </div>
            <div>
              <div className="font-mono text-2xl lg:text-3xl font-semibold text-[var(--color-gold)]">50+</div>
              <div className="text-sm text-[var(--color-text-muted)]">внедрённых систем</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
