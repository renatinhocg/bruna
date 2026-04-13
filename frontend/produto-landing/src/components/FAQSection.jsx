
import React from 'react';

const faqs = [
  {
    question: 'Quanto tempo dura o programa IMPULSO?',
    answer: 'O programa é personalizado, mas geralmente acontece em alguns encontros ao longo de algumas semanas, com atividades práticas entre eles.'
  },
  {
    question: 'Preciso já ter uma ideia de curso ou profissão para participar?',
    answer: 'Não! O IMPULSO foi criado justamente para quem está em dúvida ou quer repensar suas escolhas.'
  },
  {
    question: 'O programa é só para adolescentes do ensino médio?',
    answer: 'Não. Também atendemos jovens na faculdade ou que já começaram um curso e querem avaliar se estão no caminho certo.'
  },
  {
    question: 'O que eu recebo no final do programa?',
    answer: 'Você recebe um book personalizado de carreira, com resultados de testes, reflexões, entrevistas e um plano de ação claro para os próximos passos.'
  },
  {
    question: 'E se eu não conseguir decidir logo de cara?',
    answer: 'Não tem problema. O objetivo é te dar clareza e ferramentas para que você tome decisões no seu tempo, com segurança.'
  },
];

function FAQSection() {
  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Ainda com dúvidas? A gente responde.</h2>
        <ul className="faq-list">
          {faqs.map((faq, i) => (
            <li className="faq-item" key={i}>
              <span className="faq-question">{faq.question}</span>
              <span className="faq-answer">{faq.answer}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FAQSection;
