import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const PresentationViewer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [officeViewerUrl, setOfficeViewerUrl] = useState('');
  const { filename } = useParams();
  const location = useLocation();
  // permissões: allow passing a direct file URL via query ?fileUrl=
  const query = new URLSearchParams(location.search);
  const fileUrlQuery = query.get('fileUrl');
  const [filesList, setFilesList] = useState([]);

  useEffect(() => {
    if (fileUrlQuery) {
      // fileUrlQuery may be absolute (frontend) or relative
      const resolved = fileUrlQuery.startsWith('http') ? fileUrlQuery : `${API_BASE_URL}/${fileUrlQuery.replace(/^\//, '')}`;
      setOfficeViewerUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resolved)}`);
    } else if (filename) {
      const fileUrl = `${API_BASE_URL}/uploads/presentations/${encodeURIComponent(filename)}`;
      setOfficeViewerUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`);
    } else {
      // buscar lista de apresentações
      (async () => {
        try {
          const resp = await fetch(`${API_BASE_URL}/api/arquivos/presentations`);
          if (!resp.ok) return;
          const data = await resp.json();
          setFilesList(data || []);
        } catch (err) {
          console.error('Erro ao buscar lista de apresentações', err);
        }
      })();
    }
  }, [filename]);

  const handleFileChange = (e) => {
    setError(null);
    const f = e.target.files[0];
    setFile(f);
  };

  const handleUpload = async () => {
    setError(null);
    if (!file) {
      setError('Selecione um arquivo .pptx ou .ppsx antes de enviar.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const resp = await fetch(`${API_BASE_URL}/api/arquivos/upload-pptx`, {
        method: 'POST',
        body: form
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Erro no upload');
      }

      const data = await resp.json();

      if (data.officeViewerUrl) {
        setOfficeViewerUrl(data.officeViewerUrl);
      } else if (data.url) {
        // fallback: gerar manualmente
        setOfficeViewerUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(data.url)}`);
      } else {
        throw new Error('Resposta inesperada do servidor');
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Erro ao enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Visualizador de Apresentação (.pptx / .ppsx)</h2>

      <div style={{ marginBottom: 12 }}>
        <input type="file" accept=".pptx,.ppsx" onChange={handleFileChange} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar e Visualizar'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {!filename && filesList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Apresentações disponíveis</h3>
          <ul>
            {filesList.map(f => (
              <li key={f.filename}>
                <a href={`/presentation-viewer/${encodeURIComponent(f.filename)}`}>{f.filename}</a>
                {' — '}
                <a href={f.url} target="_blank" rel="noreferrer">Download</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {officeViewerUrl && (
        <div style={{ marginTop: 16 }}>
          <p>Visualização (Office Online):</p>
          <p style={{ fontSize: 12, color: '#666' }}>
            Nota: se estiver rodando em `localhost` o Office Online não conseguirá acessar o arquivo. Use uma URL pública (ngrok) ou faça download.
          </p>
          <div style={{ marginBottom: 8 }}>
            <a href={`${API_BASE_URL}/uploads/presentations/${encodeURIComponent(filename || '')}`} target="_blank" rel="noreferrer">Baixar arquivo</a>
          </div>
          <iframe
            title="presentation-viewer"
            src={officeViewerUrl}
            width="100%"
            height="700px"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default PresentationViewer;
