import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Problems from './sections/Problems';
import About from './sections/About';
import Services from './sections/Services';
import Results from './sections/Results';
import ForWhom from './sections/ForWhom';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import CookieBanner from './sections/CookieBanner';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Configure ScrollTrigger defaults
    ScrollTrigger.defaults({
      toggleActions: 'play none none reverse',
      start: 'top 80%'
    });

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Переход по прямой ссылке с якорем (например, /#contact с другой страницы)
    // Браузер пытается проскроллить к якорю ещё до того, как шрифты, GSAP
    // и раскладка секций устоятся — из-за этого страница остаётся наверху.
    // Ждём, пока всё осядет, и прокручиваем вручную.
    if (window.location.hash) {
      const scrollToHash = () => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      // Двойной таймаут: сначала даём осесть шрифтам/изображениям,
      // затем — самому GSAP/ScrollTrigger после его refresh().
      const timer = setTimeout(() => {
        requestAnimationFrame(scrollToHash);
      }, 400);
      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <main>
        <Hero />
        <Problems />
        <About />
        <Services />
        <Results />
        <ForWhom />
        <Contact />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default App;
