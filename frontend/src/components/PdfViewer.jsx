import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Modal } from 'antd';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ visible, onClose, pdfUrl }) => (
  <Modal
    open={visible}
    onCancel={onClose}
    footer={null}
    width={700}
    centered
    bodyStyle={{ padding: 0, background: '#f5f5f5' }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      <Document file={pdfUrl} loading={<div>Carregando PDF...</div>}>
        <Page pageNumber={1} width={640} />
      </Document>
    </div>
  </Modal>
);

export default PdfViewer;
