import React from 'react';

function ContactSection() {
  return (
    <section style={{ background: '#1976d2', color: '#fff', padding: '48px 0' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 24 }}>Está pronto para dar o próximo passo?</h2>
        <p style={{ marginBottom: 32 }}>Preencha o formulário e vamos conversar. Você terá clareza, confiança e um plano para seguir em frente.</p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="text" placeholder="Nome completo" style={{ padding: 12, borderRadius: 6, border: 'none' }} />
          <input type="email" placeholder="E-mail" style={{ padding: 12, borderRadius: 6, border: 'none' }} />
          <input type="tel" placeholder="(00) 00000-0000" style={{ padding: 12, borderRadius: 6, border: 'none' }} />
          <textarea placeholder="Conte um pouco sobre sua situação ou dúvida" style={{ padding: 12, borderRadius: 6, border: 'none', minHeight: 80 }} />
          <button className="cta" type="submit" style={{ marginTop: 12 }}>Enviar mensagem</button>
        </form>
      </div>
    </section>
  );
}

export default ContactSection;
