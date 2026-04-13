
function BenefitsSection() {
  return (
    <section className="benefits-section">
      <div className="benefits-container">
        <h2 className="benefits-title">
          Escolher o <span className="benefits-title-highlight">próximo passo</span> da sua vida não precisa ser tão confuso.
        </h2>
        <p className="benefits-subtitle">
          Seja no ensino médio, na faculdade ou até depois de começar um curso, muitas pessoas se sentem perdidas sobre qual caminho seguir.<br />
          A pressão para decidir rápido, a dúvida sobre fazer a escolha certa e o medo de se arrepender acabam gerando ansiedade e insegurança.
        </p>
        <div className="benefits-cards">
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon-tie">
              <img src="/terno.png" alt="Ícone de gravata" width="63" height="63" />
            </div>
            <div className="benefit-text">Não ter clareza sobre qual área combina com seus talentos e interesses.</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon-hat">
              <img src="/escola.png" alt="Ícone de gravata" width="63" height="63" />
            </div>
            <div className="benefit-text">Medo de escolher um curso ou profissão e depois se frustrar.</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon-family">
              <img src="/familia.png" alt="Ícone de família" width="63" height="63" />
            </div>
            <div className="benefit-text">Pressão da família, da escola ou da sociedade para “decidir logo”.</div>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon benefit-icon-hand">
              <img src="/cabeca.png" alt="Ícone de mão" width="63" height="63" />
            </div>
            <div className="benefit-text">Sensação de estar atrasado em relação aos colegas.</div>
          </div>
        </div>
        <div className="benefits-btn-wrapper">
          <button
            className="cta benefits-cta"
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

export default BenefitsSection;
