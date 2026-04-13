import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

export default function MeusRelatorios() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelatorio, setSelectedRelatorio] = useState(null);

  useEffect(() => {
    loadRelatorios();
  }, []);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/api/agendamentos`, {
        params: { usuario_id: user.id },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filtrar apenas agendamentos concluídos com relatório visível
      const agendamentosComRelatorio = response.data.filter(
        ag => ag.status === 'concluido' && 
              ag.resumo_sessao && 
              ag.visivel_cliente !== false
      );

      setAgendamentos(agendamentosComRelatorio);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const downloadAnexo = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'anexo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAnexos = (anexosJson) => {
    if (!anexosJson) return null;
    
    try {
      const anexos = JSON.parse(anexosJson);
      if (!anexos || anexos.length === 0) return null;

      return (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">📎 Anexos</h4>
          <div className="space-y-2">
            {anexos.map((url, index) => {
              const filename = url.split('/').pop() || `arquivo-${index + 1}`;
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
              
              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  {isImage ? (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="flex-1 text-sm text-gray-700 truncate">{filename}</span>
                  <button
                    onClick={() => downloadAnexo(url, filename)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Baixar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Erro ao parsear anexos:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (selectedRelatorio) {
    const ag = selectedRelatorio;
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setSelectedRelatorio(null)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para lista
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <h1 className="text-2xl font-bold mb-2">{ag.titulo}</h1>
              <div className="flex items-center gap-4 text-sm">
                <span>📅 {dayjs(ag.data_hora).format('DD/MM/YYYY HH:mm')}</span>
                <span>⏱️ {ag.duracao_minutos} minutos</span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Resumo */}
              {ag.resumo_sessao && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>📝</span> Resumo da Sessão
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                    {ag.resumo_sessao}
                  </p>
                </div>
              )}

              {/* Objetivos Alcançados */}
              {ag.objetivos_alcancados && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>🎯</span> Objetivos Alcançados
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded border-l-4 border-green-500">
                    {ag.objetivos_alcancados}
                  </p>
                </div>
              )}

              {/* Próximos Passos */}
              {ag.proximos_passos && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>👣</span> Próximos Passos
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                    {ag.proximos_passos}
                  </p>
                </div>
              )}

              {/* Recomendações - DESTACADO */}
              {ag.recomendacoes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>💡</span> Recomendações
                  </h3>
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap font-medium">
                      {ag.recomendacoes}
                    </p>
                  </div>
                </div>
              )}

              {/* Avaliação */}
              {ag.avaliacao_progresso && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ⭐ Avaliação do Progresso
                  </h3>
                  <div className="flex items-center gap-3">
                    {renderStars(ag.avaliacao_progresso)}
                    <span className="text-gray-600">
                      {ag.avaliacao_progresso}/5
                    </span>
                  </div>
                </div>
              )}

              {/* Próxima Sessão */}
              {ag.proxima_sessao_sugerida && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>📆</span> Próxima Sessão Sugerida
                  </h3>
                  <p className="text-gray-700 bg-purple-50 p-4 rounded border-l-4 border-purple-500">
                    {dayjs(ag.proxima_sessao_sugerida).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              )}

              {/* Anexos - DESTACADO */}
              {ag.anexos && renderAnexos(ag.anexos)}

              {/* Pontos Positivos */}
              {ag.pontos_positivos && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>✅</span> Pontos Positivos
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded">
                    {ag.pontos_positivos}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meus Relatórios de Sessões</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe o resumo e recomendações das suas sessões concluídas
          </p>
        </div>

        {agendamentos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum relatório disponível
            </h3>
            <p className="text-gray-500">
              Os relatórios das suas sessões concluídas aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                onClick={() => setSelectedRelatorio(ag)}
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                  <h3 className="font-semibold text-lg mb-1">{ag.titulo}</h3>
                  <p className="text-sm opacity-90">
                    {dayjs(ag.data_hora).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>⏱️ {ag.duracao_minutos} min</span>
                    {ag.avaliacao_progresso && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {renderStars(ag.avaliacao_progresso)}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {ag.resumo_sessao && (
                    <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                      {ag.resumo_sessao}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2">
                      {ag.recomendacoes && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          💡 Recomendações
                        </span>
                      )}
                      {ag.anexos && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          📎 Anexos
                        </span>
                      )}
                    </div>
                  </div>

                  <button className="mt-3 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
