import AdminLayout from '@/components/AdminLayout';
import { Suspense } from 'react';

export default function KanbanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <Suspense fallback={<div>Carregando...</div>}>
        {children}
      </Suspense>
    </AdminLayout>
  );
}
