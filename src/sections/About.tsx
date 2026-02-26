import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Briefcase, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  { icon: Briefcase, value: '15+', label: 'лет в финансовом управлении' },
  { icon: GraduationCap, value: '2 + EMBA', label: 'высших образования, стратегия' },
  { icon: TrendingUp, value: '1 млрд+', label: 'средний оборот клиентов' }
];

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image container animation
      gsap.fromTo(imageRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Decorative frame
      gsap.fromTo(frameRef.current,
        { opacity: 0, x: 20, y: 20 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          },
          delay: 0.3
        }
      );

      // Title
      gsap.fromTo(titleRef.current,
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse'
          },
          delay: 0.2
        }
      );

      // Content paragraphs
      const paragraphs = contentRef.current?.querySelectorAll('.bio-paragraph');
      if (paragraphs) {
        gsap.fromTo(paragraphs,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 55%',
              toggleActions: 'play none none reverse'
            },
            delay: 0.4
          }
        );
      }

      // Metrics
      const metricItems = contentRef.current?.querySelectorAll('.metric-card');
      if (metricItems) {
        metricItems.forEach((item, index) => {
          gsap.fromTo(item,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              },
              delay: index * 0.1
            }
          );
        });
      }

      // Parallax effect on scroll
      gsap.to(imageRef.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

      gsap.to(frameRef.current, {
        y: 20,
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
      id="about"
      className="relative py-12 lg:py-20 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Image */}
            <div className="relative order-2 lg:order-1">
              {/* Decorative Frame */}
              <div 
                ref={frameRef}
                className="absolute -inset-4 lg:-inset-6 border border-[var(--color-gold)] opacity-30 rounded-lg translate-x-5 translate-y-5 opacity-0"
              />
              
              {/* Image Container */}
              <div 
                ref={imageRef}
                className="relative rounded-lg overflow-hidden opacity-0"
              >
                <img 
                  src="/expert-photo.jpg" 
                  alt="Дмитрий Айзенштат, финансовый консультант"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent opacity-40" />
                
                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--color-gold)] opacity-60" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--color-gold)] opacity-60" />
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-1 bg-[var(--color-gold)] opacity-5 blur-2xl rounded-lg -z-10" />
            </div>

            {/* Right Column - Content */}
            <div ref={contentRef} className="order-1 lg:order-2">
              <h2 
                ref={titleRef}
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-8 opacity-0 leading-tight"
              >
                Не внедряю системы.
                <br />
                <span className="text-[var(--color-gold)]">Выстраиваю управление</span> финансами.
              </h2>

              <div className="space-y-6 mb-10">
                <p className="bio-paragraph text-base lg:text-lg text-[var(--color-text-muted)] leading-relaxed opacity-0">
                  Привет! Меня зовут Дмитрий Айзенштат, 15 лет работал финансовым директором в крупных производственных и торговых компаниях. 
                  Выстраивал финансовое управление с нуля, внедрял системы планирования, 
                  готовил компании к масштабированию.
                </p>
                
                <p className="bio-paragraph text-base lg:text-lg text-[var(--color-text-muted)] leading-relaxed opacity-0">
                  EMBA по стратегии бизнеса. Понимаю бизнес не только с точки зрения цифр, 
                  но и с позиции собственника — какие решения нужны для роста и как их 
                  принимать на основе данных.
                </p>
                
                <p className="bio-paragraph text-base lg:text-lg text-[var(--color-text-muted)] leading-relaxed opacity-0">
                  Это позволяет мне говорить с вами на одном языке и строить не просто отчеты, 
                  а инструменты для роста вашего бизнеса.
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div 
                      key={index}
                      className="metric-card p-4 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] opacity-0 hover:border-[var(--color-gold)] transition-colors duration-300"
                    >
                      <Icon className="w-5 h-5 text-[var(--color-gold)] mb-3" />
                      <div className="font-mono text-xl lg:text-2xl font-semibold text-[var(--color-gold)] mb-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] leading-tight">
                        {metric.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
