
const testimonials = [
  {
    text: "Eu não fazia ideia de qual faculdade escolher. Com o IMPULSO, consegui entender meus pontos fortes e hoje estou decidida a seguir Psicologia. Me sinto muito mais segura.",
    name: "Ana, 17 anos",
    context: "Ensino Médio",
  avatar: "/avatar1.png"
  },
  {
    text: "Entrei na faculdade sem ter certeza se era o curso certo. No programa, percebi que minha paixão estava em Design. Foi um alívio enorme ter clareza para mudar de rumo.",
    name: "Lucas, 20 anos",
    context: "Estudante de Engenharia",
  avatar: "/avatar2.png"
  },
  {
    text: "Ver meu filho mais confiante e motivado depois do IMPULSO foi incrível. Como mãe, fiquei tranquila em saber que ele está tomando decisões mais conscientes.",
    name: "Mariana",
    context: "mãe de aluno",
  avatar: "/avatar3.png"
  }
];

function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-title">
          Quem já passou pelo <span className="highlight">IMPULSO</span> conta como foi"
        </h2>
        <p className="testimonials-subtitle">
          Nada melhor do que ouvir de quem já viveu essa experiência. Veja como o IMPULSO ajudou jovens <br />a ganharem clareza, confiança e direção para o futuro
        </p>
        <div className="testimonials-cards">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-text">“{t.text}”</p>
              <div className="testimonial-person">
                <img className="testimonial-avatar" src={t.avatar} alt={t.name} />
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-context">{t.context}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
