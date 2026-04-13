

import React from 'react';

function scrollToSection(e, id) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/logo-footer.png" alt="Bruna Morais" className="footer-logo-bruna" />
        </div>
        <nav className="footer-nav">
          <a href="#inicio" onClick={e => scrollToSection(e, 'inicio')}>Início</a>
          <a href="#funciona" onClick={e => scrollToSection(e, 'funciona')}>Como funciona</a>
          <a href="#sobre" onClick={e => scrollToSection(e, 'sobre')}>Sobre</a>
          <a href="#depoimentos" onClick={e => scrollToSection(e, 'depoimentos')}>Depoimentos</a>
          <a href="#duvidas" onClick={e => scrollToSection(e, 'duvidas')}>Dúvidas</a>
          <a href="#contato" onClick={e => scrollToSection(e, 'contato')}>Contato</a>
        </nav>
        <div className="footer-contact">
          <span>brunamorais@gmail.com</span>
          <span>|</span>
          <span>(21) 97124-0055</span>
          <a href="https://www.instagram.com/bmconsultoria.rh/" target="_blank" rel="noopener noreferrer" className="footer-social"><img src="/icon-instragram.png" alt="Instagram" /></a>
          <a href="https://www.linkedin.com/company/bm-consultoria-de-rh/" target="_blank" rel="noopener noreferrer" className="footer-social"><img src="/linkedin.png" alt="LinkedIn" /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 IMPULSO – Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}

export default Footer;
