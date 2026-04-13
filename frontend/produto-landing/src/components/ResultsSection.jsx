
import React from "react";
import "../App.css";

function ResultsSection() {
  return (
    <section className="results-section">
      <div className="results-container">
        <h2 className="results-title">
          Muito mais do que <span className="highlight-blue">conversas</span>: você sai com <span className="highlight-blue">clareza</span> e um plano em mãos.
        </h2>
        <p className="results-subtitle">
          No final do programa, você não leva apenas reflexões. O <span className="highlight">IMPULSO</span> entrega resultados concretos, organizados em um material exclusivo para guiar seus próximos passos.
        </p>
        <div className="results-content">
          <div className="results-image-wrapper">
            <img className="results-image" src="/caderno.png" alt="Caderno de carreira IMPULSO" />
          </div>
          <div className="results-list">
            <div className="results-item">
              <div className="results-item-title">Caderno de carreira</div>
              <div className="results-item-desc">Um documento completo com os resultados dos testes, análises e reflexões feitas durante o programa.</div>
            </div>
            <div className="results-item">
              <div className="results-item-title">Resultados de testes de perfil e interesses</div>
              <div className="results-item-desc">Ferramentas que ajudam a identificar seus talentos, valores e áreas de afinidade</div>
            </div>
            <div className="results-item">
              <div className="results-item-title">Síntese das entrevistas e encontros</div>
              <div className="results-item-desc">Os principais insights das conversas, organizados para você consultar sempre que precisar.</div>
            </div>
            <div className="results-item">
              <div className="results-item-title">Plano de ação prático</div>
              <div className="results-item-desc">Um roteiro claro com próximos passos para suas escolhas acadêmicas e profissionais.</div>
            </div>
            <div className="results-item results-item-note">
              <span><b>*Esse material será o seu guia para tomar decisões com confiança e clareza, sempre que precisar revisitar seus objetivos.</b></span>
            </div>
            <div style={{ marginTop: 32, textAlign: 'left' }}>
              <button
                className="cta results-cta"
                onClick={e => {
                  e.preventDefault();
                  const el = document.getElementById('contato');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Quero receber meu material exclusivo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultsSection;
