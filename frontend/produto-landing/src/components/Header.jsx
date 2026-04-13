

import React, { useEffect, useState } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

function scrollToSection(e, id) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


function isAuthenticated() {
  // Checa se existe token de autenticação no localStorage
  return Boolean(localStorage.getItem('token'));
}

function Header() {
  const [showLogo, setShowLogo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Carrinho removido
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShowLogo(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha menu mobile ao clicar em link
  const handleNavClick = (e, id) => {
    scrollToSection(e, id);
    setMenuOpen(false);
  };

  return (
    <header className={`main-header${showLogo ? ' show-logo' : ''}`}> 
      <div className="header-inner">
        <img
          src="/logo-impulso.png"
          alt="Logo Impulso"
          className="header-logo"
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.preventDefault();
            const el = document.getElementById('inicio');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setMenuOpen(false);
          }}
        />

        {/* User menu para usuário autenticado */}
        {/* Carrinho removido */}

        <button className="header-hamburger" aria-label="Abrir menu" onClick={() => setMenuOpen(m => !m)}>
          <span aria-hidden="true">☰</span>
        </button>
  <ul className={`header-nav${menuOpen ? ' open' : ''}`}> 
    <li><a href="#beneficios" onClick={e => handleNavClick(e, 'beneficios')}>Benefícios</a></li>
    <li><a href="#programa" onClick={e => handleNavClick(e, 'programa')}>Programa</a></li>
    <li><a href="#sobre" onClick={e => handleNavClick(e, 'sobre')}>Sobre</a></li>
    <li><a href="#passos" onClick={e => handleNavClick(e, 'passos')}>Como Funciona</a></li>
    <li><a href="#resultados" onClick={e => handleNavClick(e, 'resultados')}>Resultados</a></li>
    <li className="header-faq"><a href="#faq" onClick={e => handleNavClick(e, 'faq')}>FAQ</a></li>
    <li style={{width:'100%',textAlign:'center',padding:'12px 0 0 0',display:'block'}}>
      <button
        className="header-cta-btn"
        onClick={e => {
          e.preventDefault();
          const el = document.getElementById('contato');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          setMenuOpen(false);
        }}
      >
        Fale com a gente
      </button>
    </li>
  </ul>
      </div>
    </header>
  );
}

export default Header;
