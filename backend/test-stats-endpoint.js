// Usando fetch nativo do Node.js 18+

async function testarEndpoint() {
  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:8002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        senha: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Erro no login:', loginData);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    const token = loginData.token;

    // 2. Testar endpoint de estatísticas
    console.log('\n📊 Testando endpoint de estatísticas...');
    console.log('URL: http://localhost:8002/api/categorias/dashboard/stats');
    
    const statsResponse = await fetch('http://localhost:8002/api/categorias/dashboard/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', statsResponse.status, statsResponse.statusText);

    if (statsResponse.status === 404) {
      console.error('❌ 404 - Endpoint não encontrado');
      console.log('Verifique se a rota está registrada ANTES de /:id');
      return;
    }

    const statsData = await statsResponse.json();
    console.log('\n✅ Resposta recebida:');
    console.log(JSON.stringify(statsData, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testarEndpoint();
