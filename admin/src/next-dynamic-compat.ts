import React from 'react';

// Emulação simples de next/dynamic para carregar componentes no cliente usando React.lazy
export default function dynamic(importFunc: () => Promise<any>, options?: any) {
  return React.lazy(importFunc);
}
