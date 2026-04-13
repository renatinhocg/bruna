import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  LeftOutlined, 
  RightOutlined, 
  ZoomInOutlined, 
  ZoomOutOutlined,
  FileTextOutlined,
  LoadingOutlined 
} from '@ant-design/icons';

// Configuração correta do worker para react-pdf v5
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDF_URL = '/CartilhadigitalBrunav4.pdf';

export default function Cartilha() {
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [error, setError] = React.useState(null);
  const [scale, setScale] = React.useState(1.0);
  const [loading, setLoading] = React.useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
    setLoading(false);
  }

  function onDocumentLoadError(err) {
    setError('Falha ao carregar o PDF. Verifique o caminho ou tente outro arquivo.');
    setLoading(false);
  }

  const goToPrevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber(p => Math.min(numPages, p + 1));
  const zoomIn = () => setScale(s => Math.min(s + 0.2, 2.0));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.6));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1C2541 0%, #4A6FA5 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px 20px 0 0',
          padding: '30px 40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 8
          }}>
            <img 
              src="/logo-site.png" 
              alt="Bruna Morais" 
              style={{ 
                height: 40,
                objectFit: 'contain'
              }} 
            />
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            margin: 0,
            fontSize: 14
          }}>
            Navegue pelo conteúdo usando os controles abaixo
          </p>
        </div>

        {/* Controls Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          flexWrap: 'wrap',
          gap: 16
        }}>
          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber === 1}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: pageNumber === 1 ? '#f0f0f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: pageNumber === 1 ? '#ccc' : '#fff',
                fontWeight: 600,
                cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s ease',
                transform: pageNumber === 1 ? 'none' : 'scale(1)',
                boxShadow: pageNumber === 1 ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (pageNumber !== 1) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (pageNumber !== 1) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              <LeftOutlined />
              Anterior
            </button>
            
            <div style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 10,
              fontWeight: 600,
              color: '#333',
              fontSize: 15,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <span style={{ color: '#667eea' }}>{pageNumber}</span> / {numPages || '...'}
            </div>
            
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber === numPages}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: pageNumber === numPages ? '#f0f0f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: pageNumber === numPages ? '#ccc' : '#fff',
                fontWeight: 600,
                cursor: pageNumber === numPages ? 'not-allowed' : 'pointer',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s ease',
                boxShadow: pageNumber === numPages ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (pageNumber !== numPages) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (pageNumber !== numPages) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              Próxima
              <RightOutlined />
            </button>
          </div>

          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={zoomOut} 
              disabled={scale <= 0.6}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '2px solid #667eea',
                background: '#fff',
                color: scale <= 0.6 ? '#ccc' : '#667eea',
                fontWeight: 600,
                cursor: scale <= 0.6 ? 'not-allowed' : 'pointer',
                fontSize: 15,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (scale > 0.6) {
                  e.target.style.background = '#667eea';
                  e.target.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (scale > 0.6) {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#667eea';
                }
              }}
            >
              <ZoomOutOutlined />
            </button>
            
            <span style={{ 
              fontWeight: 600, 
              color: '#667eea',
              minWidth: 50,
              textAlign: 'center'
            }}>
              {Math.round(scale * 80)}%
            </span>
            
            <button 
              onClick={zoomIn} 
              disabled={scale >= 2.0}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '2px solid #667eea',
                background: '#fff',
                color: scale >= 2.0 ? '#ccc' : '#667eea',
                fontWeight: 600,
                cursor: scale >= 2.0 ? 'not-allowed' : 'pointer',
                fontSize: 15,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (scale < 2.0) {
                  e.target.style.background = '#667eea';
                  e.target.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (scale < 2.0) {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#667eea';
                }
              }}
            >
              <ZoomInOutlined />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {numPages && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              height: 6,
              background: '#e0e0e0',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(pageNumber / numPages) * 100}%`,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s ease',
                borderRadius: 3
              }} />
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '40px',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          minHeight: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <LoadingOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} spin />
              <p style={{ color: '#666', fontSize: 16 }}>Carregando cartilha...</p>
            </div>
          )}
          
          {error && (
            <div style={{
              background: '#fff2f0',
              border: '2px solid #ffccc7',
              borderRadius: 12,
              padding: '30px',
              textAlign: 'center',
              maxWidth: 500
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <p style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 16, margin: 0 }}>
                {error}
              </p>
            </div>
          )}
          
          {!error && (
            <div style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 8,
              overflow: 'hidden',
              transition: 'transform 0.3s ease'
            }}>
              <Document
                file={PDF_URL}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 12,
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ 
            color: '#fff', 
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            🔒 Conteúdo protegido - Download e impressão desabilitados
          </p>
        </div>
      </div>
    </div>
  );
}
