import React, { useState } from 'react';
import ListaProjetos from './ListaProjetos';
import dynamic from 'next/dynamic';

type Projeto = {
  id: number;
  nome: string;
};

// Importação dinâmica para evitar problemas de SSR com dnd-kit
const KanbanPage = dynamic(() => import('./page'), { ssr: false });

export default function KanbanRoot() {
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);

  return (
    <div>
      {!projetoSelecionado ? (
        <ListaProjetos onSelecionar={setProjetoSelecionado} />
      ) : (
        <div>
          <button onClick={() => setProjetoSelecionado(null)} style={{ marginBottom: 16 }}>
            ← Voltar para lista de projetos
          </button>
          <KanbanPage />
        </div>
      )}
    </div>
  );
}
