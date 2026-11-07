let cartItems: any[] = [];

export const addToCart = (product: any) => {
  const existing = cartItems.find(item => item.id === product.id);
  if (existing) {
    existing.cantidad += 1;
  } else {
    cartItems.push({
      ...product,
      cantidad: 1,
      precio: Number(product.precio_venta || product.costo || 0)
    });
  }
};

export const getCartItems = () => cartItems;

export const getCartCount = () => {
  return cartItems.reduce((acc, item) => acc + item.cantidad, 0);
};

export const updateQuantity = (id: number, delta: number) => {
  const item = cartItems.find(i => i.id === id);
  if (item) {
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      cartItems = cartItems.filter(i => i.id !== id);
    }
  }
};

export const removeFromCart = (id: number) => {
  cartItems = cartItems.filter(i => i.id !== id);
};

export const clearCart = () => {
  cartItems = [];
};