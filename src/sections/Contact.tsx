import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, Send, MessageCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title
      gsap.fromTo(titleRef.current,
        { y: 40, opacity: 0 },
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

      // Divider line
      gsap.fromTo(dividerRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          },
          delay: 0.3
        }
      );

      // Form fields
      const fields = formRef.current?.querySelectorAll('.form-field');
      if (fields) {
        gsap.fromTo(fields,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse'
            },
            delay: 0.4
          }
        );
      }

      // Submit button
      const submitBtn = formRef.current?.querySelector('.submit-btn');
      if (submitBtn) {
        gsap.fromTo(submitBtn,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse'
            },
            delay: 0.9
          }
        );
      }

      // Contact info
      gsap.fromTo(contactsRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none reverse'
          },
          delay: 0.5
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setFormData({ name: '', phone: '', email: '', company: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section 
      ref={sectionRef}
      id="contact"
      className="relative py-12 lg:py-20 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--color-bg) 0%, #242b3d 100%)' }}
    >
      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 
              ref={titleRef}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 opacity-0"
            >
              Давайте обсудим <span className="text-[var(--color-gold)]">вашу ситуацию</span>
            </h2>
            <p className="text-base lg:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Запишитесь на бесплатную диагностическую сессию. 
              За 30 минут поймём, есть ли смысл работать дальше.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 relative">
            {/* Form */}
            <form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-5 lg:pr-12"
            >
              <div className="form-field opacity-0">
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Имя</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-gold)] focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(212,168,83,0.2)]"
                  placeholder="Ваше имя"
                />
              </div>

              <div className="form-field opacity-0">
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-gold)] focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(212,168,83,0.2)]"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className="form-field opacity-0">
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-gold)] focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(212,168,83,0.2)]"
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-field opacity-0">
                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Компания и оборот</label>
                <textarea
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-gold)] focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(212,168,83,0.2)] resize-none"
                  placeholder="Название компании, сфера, годовой оборот"
                />
              </div>

              <button 
                type="submit"
                className="submit-btn btn-primary w-full opacity-0"
              >
                <span>Записаться на диагностику</span>
                <Send className="ml-2 w-5 h-5" />
              </button>
            </form>

            {/* Divider */}
            <div 
              ref={dividerRef}
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--color-gold)] to-transparent origin-top"
            />

            {/* Contact Info */}
            <div 
              ref={contactsRef}
              className="lg:pl-12 flex flex-col justify-center opacity-0"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Телефон</div>
                    <a href="tel:+79990000000" className="text-lg hover:text-[var(--color-gold)] transition-colors">
                      +7 (999) 000-00-00
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Email</div>
                    <a href="mailto:Dmitriy.Ayzenshtat@gmail.com" className="text-lg hover:text-[var(--color-gold)] transition-colors">
                      Dmitriy.Ayzenshtat@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-muted)]">Telegram</div>
                    <a href="https://t.me/DmitriyAyzenshtat" className="text-lg hover:text-[var(--color-gold)] transition-colors">
                      @DmitriyAyzenshtat
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    // Отвечаю в течении рабочего дня
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
              Заявка отправлена
            </DialogTitle>
            <DialogDescription className="text-[var(--color-text-muted)]">
              Спасибо за обращение! Я свяжусь с вами в ближайшее время для согласования встречи.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Contact;
