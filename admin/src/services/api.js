const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'}/api`;

class ApiService {
  async getTestesInteligencia() {
    return this.request('/testes-inteligencia');
  }
  async autorizarTesteInteligencia(id) {
    return this.request(`/testes-inteligencia/${id}/autorizar`, {
      method: 'PUT'
    });
  }
  async getTesteInteligencia(id, admin = false) {
    const url = admin
      ? `/testes-inteligencia/${id}?admin=true`
      : `/testes-inteligencia/${id}`;
    return this.request(url);
  }

  async deletarTesteInteligencia(id) {
    return this.request(`/testes-inteligencia/${id}`, {
      method: 'DELETE'
    });
  }

  async permitirRefazerTeste(usuarioId) {
    return this.request(`/testes-inteligencia/usuario/${usuarioId}/permitir-refazer`, {
      method: 'PUT'
    });
  }

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Projetos endpoints
  async getProjetos() {
    return this.request('/projetos');
  }

  async getProjetoById(id) {
    return this.request(`/projetos/${id}`);
  }

  async createProjeto(data) {
    return this.request('/projetos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProjeto(id, data) {
    return this.request(`/projetos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProjeto(id) {
    return this.request(`/projetos/${id}`, {
      method: 'DELETE'
    });
  }

  async criarTesteInteligencia(dadosTeste) {
    return this.request('/testes-inteligencia', {
      method: 'POST',
      body: JSON.stringify(dadosTeste)
    });
  }

  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  getPublicHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async publicRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getPublicHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Users endpoints
  async getUsers() {
    return this.request('/usuarios');
  }

  async getUserById(id) {
    return this.request(`/usuarios/${id}`);
  }

  async createUser(userData) {
    return this.request('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE'
    });
  }

  async getUserTestPermissions(userId) {
    return this.request(`/usuarios/${userId}/permissoes-testes`);
  }

  async updateUserTestPermissions(userId, permissions) {
    return this.request(`/usuarios/${userId}/permissoes-testes`, {
      method: 'PUT',
      body: JSON.stringify(permissions)
    });
  }

  async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request(`/arquivos/avatar/${userId}`, {
      method: 'POST',
      body: formData,
      headers: {
        // Remover Content-Type para deixar o browser definir com boundary
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
  }

  async uploadFile(formData) {
    return this.request('/arquivos/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Remover Content-Type para deixar o browser definir com boundary
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
  }

  async getUsersStats() {
    return this.request('/usuarios/stats/overview');
  }

  // Testes endpoints
  async getTestes() {
    return this.request('/testes');
  }

  async getTesteById(id) {
    return this.request(`/testes/${id}`);
  }

  async createTeste(testeData) {
    return this.request('/testes', {
      method: 'POST',
      body: JSON.stringify(testeData)
    });
  }

  async updateTeste(id, testeData) {
    return this.request(`/testes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testeData)
    });
  }

  async deleteTeste(id) {
    return this.request(`/testes/${id}`, {
      method: 'DELETE'
    });
  }

  // Métodos públicos para o teste de múltiplas inteligências
  async getTestesPublic() {
    return this.publicRequest('/testes');
  }

  async finalizarTeste(testeData) {
    return this.publicRequest('/testes/finalizar', {
      method: 'POST',
      body: JSON.stringify(testeData)
    });
  }

  // Métodos públicos para perguntas
  async getPerguntasPublic(categoriaId = null) {
    const params = categoriaId ? `?categoria_id=${categoriaId}` : '';
    return this.publicRequest(`/perguntas${params}`);
  }

  // Categorias endpoints
  async getCategorias() {
    return this.request('/categorias');
  }

  async getCategoriaById(id) {
    return this.request(`/categorias/${id}`);
  }

  async createCategoria(categoriaData) {
    return this.request('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoriaData)
    });
  }

  async updateCategoria(id, categoriaData) {
    return this.request(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoriaData)
    });
  }

  async deleteCategoria(id) {
    return this.request(`/categorias/${id}`, {
      method: 'DELETE'
    });
  }

  async getCategoriasStats() {
    return this.request('/categorias/stats/resumo');
  }

  async getDashboardStats() {
    return this.request('/categorias/dashboard/stats');
  }

  // Perguntas endpoints
  async getPerguntas(categoriaId = null) {
    const params = categoriaId ? `?categoria_id=${categoriaId}` : '';
    return this.request(`/perguntas${params}`);
  }

  async getPergunta(id) {
    return this.request(`/perguntas/${id}`);
  }

  async createPergunta(perguntaData) {
    return this.request('/perguntas', {
      method: 'POST',
      body: JSON.stringify(perguntaData)
    });
  }

  async updatePergunta(id, perguntaData) {
    return this.request(`/perguntas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(perguntaData)
    });
  }

  async deletePergunta(id) {
    return this.request(`/perguntas/${id}`, {
      method: 'DELETE'
    });
  }

  async getPerguntasStats() {
    return this.request('/perguntas/stats/resumo');
  }

  // Possibilidades endpoints
  async getPossibilidades(perguntaId = null) {
    const params = perguntaId ? `?pergunta_id=${perguntaId}` : '';
    return this.request(`/possibilidades${params}`);
  }

  async getPossibilidade(id) {
    return this.request(`/possibilidades/${id}`);
  }

  async createPossibilidade(possibilidadeData) {
    return this.request('/possibilidades', {
      method: 'POST',
      body: JSON.stringify(possibilidadeData)
    });
  }

  async updatePossibilidade(id, possibilidadeData) {
    return this.request(`/possibilidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(possibilidadeData)
    });
  }

  async deletePossibilidade(id) {
    return this.request(`/possibilidades/${id}`, {
      method: 'DELETE'
    });
  }

  async getPossibilidadesStats() {
    return this.request('/possibilidades/stats/resumo');
  }

  // Resultados endpoints
  async getResultados(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(`/resultados${queryString ? `?${queryString}` : ''}`);

    // Aplicar autorizações locais aos resultados
    if (response.success && response.data) {
      const autorizacoesLocais = this.getResultadosAutorizadosLocais();
      response.data = response.data.map(resultado => ({
        ...resultado,
        autorizado: resultado.autorizado || autorizacoesLocais.includes(resultado.id.toString())
      }));
    }

    return response;
  }

  async getResultado(id) {
    return this.request(`/resultados/${id}`);
  }

  async createResultado(resultadoData) {
    return this.request('/resultados', {
      method: 'POST',
      body: JSON.stringify(resultadoData)
    });
  }

  async updateResultado(id, resultadoData) {
    return this.request(`/resultados/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resultadoData)
    });
  }

  async deleteResultado(id) {
    return this.request(`/resultados/${id}`, {
      method: 'DELETE'
    });
  }

  async autorizarResultado(id) {
    // Chama a API real do backend para autorizar o teste de inteligência
    return this.request(`/testes-inteligencia/${id}/autorizar`, {
      method: 'PUT'
    });
  }

  // Verificar se um resultado está autorizado localmente
  isResultadoAutorizado(id) {
    const autorizacoes = JSON.parse(localStorage.getItem('resultados_autorizados') || '[]');
    return autorizacoes.includes(id.toString());
  }

  // Obter todos os IDs autorizados localmente
  getResultadosAutorizadosLocais() {
    // Migrar dados antigos de "resultados_aprovados" para "resultados_autorizados"
    const aprovadosAntigos = JSON.parse(localStorage.getItem('resultados_aprovados') || '[]');
    const autorizados = JSON.parse(localStorage.getItem('resultados_autorizados') || '[]');

    if (aprovadosAntigos.length > 0) {
      // Migrar dados antigos
      const migrados = [...new Set([...autorizados, ...aprovadosAntigos])];
      localStorage.setItem('resultados_autorizados', JSON.stringify(migrados));
      localStorage.removeItem('resultados_aprovados'); // Limpar dados antigos
      return migrados;
    }

    return autorizados;
  }

  async getResultadosStats() {
    return this.request('/resultados/stats');
  }

  async getResultadosUsuario(userId) {
    return this.request(`/resultados/usuario/${userId}`);
  }

  // Configurações endpoints
  async getConfiguracoes() {
    return this.request('/configuracoes');
  }

  async updateConfiguracoes(configData) {
    return this.request('/configuracoes', {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  }

  async resetConfiguracoes() {
    return this.request('/configuracoes/reset', {
      method: 'POST'
    });
  }

  // Dominância Cerebral endpoints
  async getResultadosDominancia() {
    const response = await fetch(`${this.baseURL}/testes-dominancia/resultados/todos`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar resultados de dominância cerebral');
    }

    return response.json();
  }

  async permitirRefazerTesteDominancia(usuarioId) {
    return this.request(`/testes-dominancia/usuario/${usuarioId}/permitir-refazer`, {
      method: 'PUT'
    });
  }

  // Agendamentos endpoints
  async getAgendamentos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/agendamentos${queryString ? `?${queryString}` : ''}`);
  }

  async getAgendamento(id) {
    return this.request(`/agendamentos/${id}`);
  }

  async createAgendamento(agendamentoData) {
    return this.request('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(agendamentoData)
    });
  }

  async updateAgendamento(id, agendamentoData) {
    return this.request(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agendamentoData)
    });
  }

  async deleteAgendamento(id) {
    return this.request(`/agendamentos/${id}`, {
      method: 'DELETE'
    });
  }

  async updateStatusAgendamento(id, status) {
    return this.request(`/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Dashboard geral - estatísticas globais do sistema
  async getDashboardOverview() {
    const [usuarios, testes, agendamentos, contatos] = await Promise.all([
      this.request('/usuarios/stats/overview').catch(() => ({ totalUsuarios: 0, novosUsuarios: 0 })),
      this.request('/relatorios/estatisticas').catch(() => ({ data: { totalTestes: 0 } })),
      this.request('/agendamentos').catch(() => []),
      this.request('/contatos').catch(() => [])
    ]);

    // Calcular agendamentos de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const agendamentosHoje = agendamentos.filter((a) => {
      const dataAgendamento = new Date(a.data_hora);
      return dataAgendamento >= hoje && dataAgendamento < amanha;
    });

    return {
      totalUsuarios: usuarios.totalUsuarios || 0,
      novosUsuarios: usuarios.novosUsuarios || 0,
      totalTestes: testes.data?.totalTestes || 0,
      agendamentosHoje: agendamentosHoje.length,
      contatosPendentes: contatos.filter((c) => c.status === 'novo').length,
      agendamentosHojeList: agendamentosHoje
    };
  }

  async getRecentActivities() {
    const [testesInteligencia, novosusuarios, contatos] = await Promise.all([
      this.request('/testes-inteligencia?limite=5').catch(() => []),
      this.request('/usuarios?limite=5').catch(() => []),
      this.request('/contatos?limite=5').catch(() => [])
    ]);

    return {
      testesRecentes: Array.isArray(testesInteligencia) ? testesInteligencia.slice(0, 5) : [],
      usuariosRecentes: Array.isArray(novosusuarios) ? novosusuarios.slice(0, 5) : [],
      contatosRecentes: Array.isArray(contatos) ? contatos.slice(0, 5) : []
    };
  }

  // ============================================
  // DISC Endpoints
  // ============================================

  async getQuestoesDISCAdmin() {
    return this.request('/testes-disc/admin/questoes');
  }

  async getResultadosDISC() {
    return this.request('/testes-disc/admin/testes');
  }

  async getResultadoDISCById(testeId) {
    return this.request(`/testes-disc/admin/testes/${testeId}`);
  }

  async updateQuestaoDISC(questaoId, data) {
    return this.request(`/testes-disc/admin/questoes/${questaoId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateOpcaoDISC(opcaoId, data) {
    return this.request(`/testes-disc/admin/opcoes/${opcaoId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getEstatisticasDISC() {
    return this.request('/testes-disc/admin/estatisticas');
  }

  // Kanban endpoints
  async getTasks(projectId) {
    let url = '/kanban';
    if (projectId) {
      url += `?projeto_id=${projectId}`;
    }
    return this.request(url);
  }

  async getTaskById(id) {
    return this.request(`/kanban/${id}`);
  }

  async createTask(taskData) {
    return this.request('/kanban', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(id, taskData) {
    return this.request(`/kanban/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  }

  async updateTaskStatus(id, status) {
    return this.request(`/kanban/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteTask(id) {
    return this.request(`/kanban/${id}`, {
      method: 'DELETE'
    });
  }

  async getKanbanStats(projetoId) {
    let url = '/kanban/stats/resumo';
    if (projetoId) {
      url += `?projeto_id=${projetoId}`;
    }
    return this.request(url);
  }

  // ADMIN: Buscar todos os testes de múltiplas inteligências concluídos (autorizados ou não)
  async getTestesInteligenciaAdmin() {
    return this.request('/testes-inteligencia/admin');
  }

  // ============================================
  // Recrutamento e Seleção Endpoints
  // ============================================

  // Empresas
  async getCompanies() {
    return this.request('/companies');
  }

  async getCompanyById(id) {
    return this.request(`/companies/${id}`);
  }

  async createCompany(data) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCompany(id, data) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCompany(id) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE'
    });
  }

  // Vagas
  async getJobs() {
    return this.request('/jobs');
  }

  async getJobById(id) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateJob(id, data) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE'
    });
  }

  // Candidaturas
  async getJobApplications(jobId = '', status = '') {
    let url = '/job-applications?';
    if (jobId) url += `job_id=${jobId}&`;
    if (status) url += `status=${status}`;
    return this.request(url);
  }

  async updateJobApplicationStatus(id, status) {
    return this.request(`/job-applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
}

const apiService = new ApiService();
export default apiService;
