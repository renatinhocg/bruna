import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider locale={ptBR}>
    <App />
  </ConfigProvider>
);
