import cartReducer, {
  setCart,
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  addItemToWishlist,
  removeItemFromWishlist,
} from '../features/UIUpdates/CartWishlist';

const makeItem = (id: number) => ({
  cartItemID: id,
  productID: id,
  productImg: 'img.jpg',
  productAlt: 'alt',
  productName: `Product ${id}`,
  productPrice: 29.99,
  productColor: 'Red',
  productSize: 'M',
  quantity: 1,
});

describe('cartWishlistSlice — cart', () => {
  it('returns empty initial state', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state.cart).toEqual([]);
    expect(state.wishlist).toEqual([]);
  });

  it('setCart replaces the cart', () => {
    const items = [makeItem(1), makeItem(2)];
    const state = cartReducer(undefined, setCart(items));
    expect(state.cart).toHaveLength(2);
  });

  it('addItemToCart adds a new item', () => {
    const state = cartReducer(undefined, addItemToCart(makeItem(10)));
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].productName).toBe('Product 10');
  });

  it('addItemToCart increases quantity for existing item', () => {
    let state = cartReducer(undefined, addItemToCart(makeItem(1)));
    state = cartReducer(state, addItemToCart({ ...makeItem(1), quantity: 3 }));
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].quantity).toBe(4);
  });

  it('removeItemFromCart removes the correct item', () => {
    let state = cartReducer(undefined, addItemToCart(makeItem(1)));
    state = cartReducer(state, addItemToCart(makeItem(2)));
    state = cartReducer(state, removeItemFromCart(1));
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].productID).toBe(2);
  });

  it('updateCartItemQuantity updates the quantity', () => {
    let state = cartReducer(undefined, addItemToCart(makeItem(5)));
    state = cartReducer(state, updateCartItemQuantity({ id: 5, quantity: 10 }));
    expect(state.cart[0].quantity).toBe(10);
  });
});

describe('cartWishlistSlice — wishlist', () => {
  const wish = { wishlistItemID: 1, productID: 99, productImg: 'img.jpg', productAlt: 'alt', productName: 'Jacket', productPrice: 59.99 };

  it('addItemToWishlist adds a new item', () => {
    const state = cartReducer(undefined, addItemToWishlist(wish));
    expect(state.wishlist).toHaveLength(1);
  });

  it('addItemToWishlist does not duplicate items', () => {
    let state = cartReducer(undefined, addItemToWishlist(wish));
    state = cartReducer(state, addItemToWishlist(wish));
    expect(state.wishlist).toHaveLength(1);
  });

  it('removeItemFromWishlist removes the correct item', () => {
    let state = cartReducer(undefined, addItemToWishlist(wish));
    state = cartReducer(state, removeItemFromWishlist(99));
    expect(state.wishlist).toHaveLength(0);
  });
});
