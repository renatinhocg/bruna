import React from 'react';

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <h2 className="about-title">
              Quem está por trás do <span className="about-title-highlight">IMPULSO</span>
            </h2>
            <div className="about-description">
              <p>Profissional de Recursos Humanos há mais de 20 anos, com experiência corporativa consolidada em desenvolvimento de pessoas, liderança de equipes multidisciplinares e gestão de projetos estratégicos. Atuei na implantação de áreas de T&D, Educação Corporativa, Atração e Seleção, Cultura, Ambientação e Experiência do Colaborador (EX) e do Cliente (CX), sempre com foco em resultados sustentáveis e melhoria contínua.</p>
              <p>Atuo também mentora de carreira e como professora universitária nos cursos de graduação e pós-graduação nas áreas de Gestão e Educação. Acredito muito nas conexões entre o mundo acadêmico e executivo.</p>
              <p>Sou mestra em Administração e Desenvolvimento Empresarial, especialista em Gestão Estratégica de Recursos Humanos, certificada em DISC, PI e PAT Perfil, e tenho algumas formações complementares em Orientação Profissional, Coaching e metodologia Lean Six Sigma (Yellow Belt). Tenho um olhar atento à tecnologia e à inovação como aliadas na construção de soluções inteligentes e responsáveis para o ambiente corporativo.</p>
              <p>Casada e mãe de três, acredito que o equilíbrio entre vida pessoal e profissional amplia nossa sensibilidade e capacidade de liderar com empatia. Estou sempre aberta a novas conexões, oportunidades e trocas que inspirem crescimento e evolução.<br />
              Formação em Gestão de Recursos Humanos com especialização em Gestão de Carreira e Desenvolvimento Humano. Certificações internacionais em coaching e assessment de perfil profissional.</p>
            </div>
          </div>
          <div className="about-image-wrapper">

            <img src="/bruna.png" alt="Bruna Morais" className="about-image" />
          </div>
        </div>
        <div className="about-btn-wrapper">
          <button
            className="cta about-cta"
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

export default AboutSection;
