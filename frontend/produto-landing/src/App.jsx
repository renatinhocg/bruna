import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HeroSection from './components/HeroSection';
import Header from './components/Header';
import BenefitsSection from './components/BenefitsSection';
import ProgramSection from './components/ProgramSection';
import AboutSection from './components/AboutSection';
import StepsSection from './components/StepsSection';
import TestimonialsSection from './components/TestimonialsSection';
import ResultsSection from './components/ResultsSection';
import FAQSection from './components/FAQSection';
import ContactFormSection from './components/ContactFormSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';


import ObrigadoPage from './pages/ObrigadoPage';
import MeusTestesPage from './pages/MeusTestesPage';
import MinhasComprasPage from './pages/MinhasComprasPage';

function HomePage() {
  return (
    <>
      <Header />
      <div id="inicio"><HeroSection /></div>
      <div id="funciona"><BenefitsSection /></div>
      <div id="programa"><ProgramSection /></div>
      <div id="sobre"><AboutSection /></div>
      <div id="passos"><StepsSection /></div>
      <div id="depoimentos"><TestimonialsSection /></div>
      <div id="resultados"><ResultsSection /></div>
      <div id="duvidas"><FAQSection /></div>
      <div id="contato"><ContactFormSection /></div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/obrigado" element={<ObrigadoPage />} />
      <Route path="/meus-testes" element={<MeusTestesPage />} />
      <Route path="/minhas-compras" element={<MinhasComprasPage />} />
    </Routes>
  );
}

export default App;
