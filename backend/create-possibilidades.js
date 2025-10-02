import pg from 'pg';
const { Client } = pg;

async function criarPossibilidades() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    
    // Verificar se tabela existe
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%possibilidade%'
    `);
    console.log('Tabelas encontradas:', tables.rows);
    
    // Limpar possibilidades existentes
    await client.query('DELETE FROM possibilidades_resposta');
    
    // Criar as 5 possibilidades padrão (escala 0-4)
    const possibilidades = [
      ['Discordo Completamente', 0, 1, 'Não concordo de forma alguma com a afirmação'],
      ['Discordo um Pouco', 1, 2, 'Discordo parcialmente da afirmação'],
      ['Incerto', 2, 3, 'Neutro, não tenho certeza ou depende da situação'],
      ['Concordo um Pouco', 3, 4, 'Concordo parcialmente com a afirmação'],
      ['Concordo Totalmente', 4, 5, 'Concordo completamente com a afirmação']
    ];
    
    for (const [texto, valor, ordem, descricao] of possibilidades) {
      await client.query(`
        INSERT INTO possibilidades_resposta (texto, valor, ordem, descricao, ativo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, true, NOW(), NOW())
      `, [texto, valor, ordem, descricao]);
    }
    
    console.log('✓ Possibilidades padrão criadas com sucesso!');
    
    // Verificar se foram criadas
    const result = await client.query('SELECT * FROM possibilidades_resposta ORDER BY ordem');
    console.log('Possibilidades criadas:');
    result.rows.forEach(row => {
      console.log(`- ${row.texto} (valor: ${row.valor})`);
    });
    
  } catch (error) {
    console.error('Erro completo:', error);
  } finally {
    await client.end();
  }
}

criarPossibilidades();
