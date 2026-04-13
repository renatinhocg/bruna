import React from 'react';

function ProgramSection() {
  return (
    <section className="program-section">
      <div className="program-container">
        <h2 className="program-title">
          O caminho certo para <span className="program-highlight">descobrir</span> e <span className="program-highlight">construir</span> sua trajetória profissional.
        </h2>
        <p className="program-desc">
          O <strong>IMPULSO</strong> é um programa de orientação de carreiras criado pela Bruna Morais para ajudar jovens a tomarem decisões com mais clareza e confiança. Através de encontros estruturados, ferramentas práticas e acompanhamento personalizado, você vai entender seus talentos, alinhar seus interesses e definir os próximos passos com segurança
        </p>
        <div className="program-cards-grid">
          <div className="program-card">Clareza sobre seus pontos fortes e áreas de interesse.</div>
          <div className="program-card">Apoio para escolher o curso ou profissão que mais combina com você.</div>
          <div className="program-card">Estratégias práticas para planejar o futuro sem ansiedade.</div>
          <div className="program-card">Acompanhamento próximo para transformar dúvidas em decisões seguras.</div>
        </div>
      </div>
    </section>
  );
}

export default ProgramSection;
