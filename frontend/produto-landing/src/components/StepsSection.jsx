
function StepsSection() {
  return (
    <section className="steps-section">
      <div className="steps-container">
        <h2 className="steps-title">
          Um <span className="steps-title-highlight">passo a passo</span> claro para você tomar <span className="steps-title-highlight">decisões</span> seguras.
        </h2>
        <p className="steps-subtitle">
          O IMPULSO foi criado para guiar você em cada etapa da escolha profissional. Através de encontros organizados e ferramentas práticas, o programa transforma dúvidas em clareza e insegurança em confiança
        </p>
        <div className="timeline-flow">
          {/* Etapa 1 */}
          <div className="timeline-row">
            <div className="timeline-card left">
              <div className="step-card-header step-color-orange"><span>01</span></div>
              <div className="step-card-content">
                <strong>Autoconhecimento</strong>
                <p>Descubra seus talentos, interesses e valores para entender o que realmente faz sentido para você.</p>
              </div>
            </div>
            <div className="timeline-center">
              <span className="timeline-dot" />
              <div className="timeline-line" />
            </div>
            <div className="timeline-card right empty" />
          </div>
          {/* Etapa 2 */}
          <div className="timeline-row">
            <div className="timeline-card left empty" />
            <div className="timeline-center">
              <span className="timeline-dot" />
              <div className="timeline-line" />
            </div>
            <div className="timeline-card right">
              <div className="step-card-header step-color-green"><span>02</span></div>
              <div className="step-card-content">
                <strong>Exploração de possibilidades</strong>
                <p>Conheça cursos, áreas e profissões que se conectam ao seu perfil e objetivos</p>
              </div>
            </div>
          </div>
          {/* Etapa 3 */}
          <div className="timeline-row">
            <div className="timeline-card left">
              <div className="step-card-header step-color-purple"><span>03</span></div>
              <div className="step-card-content">
                <strong>Planejamento de escolhas</strong>
                <p>Construa um plano claro para decidir sua faculdade ou repensar sua carreira com segurança.</p>
              </div>
            </div>
            <div className="timeline-center">
              <span className="timeline-dot" />
              <div className="timeline-line" />
            </div>
            <div className="timeline-card right empty" />
          </div>
          {/* Etapa 4 */}
          <div className="timeline-row">
            <div className="timeline-card left empty" />
            <div className="timeline-center">
              <span className="timeline-dot" />
              {/* Última linha não tem linha para baixo */}
            </div>
            <div className="timeline-card right">
              <div className="step-card-header step-color-orange"><span>04</span></div>
              <div className="step-card-content">
                <strong>Acompanhamento e ação</strong>
                <p>Receba suporte próximo para colocar suas decisões em prática e seguir com confiança</p>
              </div>
            </div>
          </div>
        </div>
        <div className="steps-btn-wrapper">
          <button
            className="cta steps-cta"
            onClick={e => {
              e.preventDefault();
              const el = document.getElementById('contato');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Quero conhecer meu caminho com o IMPULSO
          </button>
        </div>
      </div>
    </section>
  );
}

export default StepsSection;
