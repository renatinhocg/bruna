import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app/globals.css'; // Carrega os estilos globais premium

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
