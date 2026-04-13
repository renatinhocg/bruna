import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('impulso_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('impulso_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (produto) => {
    // Verificar se já existe no carrinho
    const existingItem = cart.find(item => item.id === produto.id);
    
    if (existingItem) {
      // Se for combo, não permitir adicionar mais de 1
      if (produto.tipo_teste === 'combo') {
        alert('O Pacote Completo só pode ser adicionado uma vez!');
        return;
      }
      // Não permitir duplicatas de testes individuais
      alert('Este produto já está no carrinho!');
      return;
    }

    // Se estiver adicionando o combo, limpar carrinho
    if (produto.tipo_teste === 'combo') {
      setCart([produto]);
      setIsCartOpen(true);
      return;
    }

    // Se já tiver combo no carrinho, não permitir adicionar testes individuais
    if (cart.some(item => item.tipo_teste === 'combo')) {
      alert('Você já tem o Pacote Completo no carrinho! Remova-o primeiro para adicionar testes individuais.');
      return;
    }

    setCart([...cart, produto]);
    setIsCartOpen(true);
  };

  const removeFromCart = (produtoId) => {
    setCart(cart.filter(item => item.id !== produtoId));
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.preco), 0);
  };

  const getItemCount = () => {
    return cart.length;
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
    isCartOpen,
    toggleCart,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
