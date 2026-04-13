import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider 
    locale={ptBR}
    theme={{
      token: {
        colorPrimary: '#FDB913',
        colorLink: '#F39200',
        borderRadius: 8,
        fontFamily: 'Poppins, sans-serif',
      },
    }}
  >
    <App />
  </ConfigProvider>
);
