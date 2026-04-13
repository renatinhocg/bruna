import React from 'react';


function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-left">
          <img
            src="/img-hero.png"
            alt="Impulsione sua carreira"
            className="hero-bg-person-img"
          />
        </div>
        <div className="hero-right">
          <img src="/logo-impulso.png" alt="Impulso Logo" className="hero-logo" />
          <p className="hero-desc-text">
            Com a metodologia IMPULSO, você terá orientação estratégica, ferramentas práticas e acompanhamento personalizado para transformar seu potencial em conquistas reais.
          </p>
          <button
            className="cta hero-cta"
            onClick={e => {
              e.preventDefault();
              const el = document.getElementById('contato');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Agendar uma conversa gratuita
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
