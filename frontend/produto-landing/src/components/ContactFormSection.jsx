
import React, { useState } from "react";
import "../App.css";
import API_BASE_URL from "../config/api";


function maskPhone(value) {
  // Remove tudo que não for número
  value = value.replace(/\D/g, "");
  // (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length > 10) {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (value.length > 6) {
    return value.replace(/(\d{2})(\d{4,5})(\d{0,4})/, "($1) $2-$3");
  } else if (value.length > 2) {
    return value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    return value;
  }
}

function ContactFormSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "phone") {
      setForm({ ...form, phone: maskPhone(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
  await fetch(`${API_BASE_URL}/contatos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.name,
          email: form.email,
          telefone: form.phone,
          mensagem: form.message,
          impulso: true
        })
      });
      setSent(true);
    } catch (err) {
      alert("Erro ao enviar mensagem. Tente novamente.");
    }
    setLoading(false);
  }

  return (
    <section className="contactform-section">
      <div className="contactform-container">
        <h2 className="contactform-title">Está pronto para dar o próximo passo?</h2>
        <p className="contactform-subtitle">
          O futuro não precisa ser uma incerteza. Com o <span className="highlight">IMPULSO</span>, você terá clareza, confiança e um plano para seguir em frente.
        </p>
        {sent ? (
          <div className="contactform-success">Mensagem enviada! Em breve entrarei em contato.</div>
        ) : (
          <form className="contactform-form" onSubmit={handleSubmit} autoComplete="off">
            <input
              type="text"
              name="name"
              placeholder="Nome completo*"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail*"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="(99) 99999-9999*"
              value={form.phone}
              onChange={handleChange}
              maxLength={15}
              required
              inputMode="tel"
              autoComplete="tel"
            />
           
            <textarea
              name="message"
              placeholder="Conte-nos sobre seus objetivos e que entro em contato."
              value={form.message}
              onChange={handleChange}
              rows={4}
            />
            <button type="submit" className="contactform-btn" disabled={loading}>
              {loading ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default ContactFormSection;
