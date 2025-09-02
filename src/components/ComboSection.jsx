import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ComboSection.css';

const comboData = [
  {
    _id: 'combo1',
    name: 'Veggie Combo',
    image: '/assets/combo-veg.jpg',
    price: '199',
    category: 'combo',
  },
  {
    _id: 'combo2',
    name: 'Exotic Salad Combo',
    image: '/assets/combo-exotic.jpg',
    price: '299',
    category: 'combo',
  },
  {
    _id: 'combo3',
    name: 'Family Pack Combo',
    image: '/assets/combo-family.jpg',
    price: '499',
    category: 'combo',
  },
  {
    _id: 'combo4',
    name: 'Daily Essentials Combo',
    image: '/assets/combo-daily.jpg',
    price: '259',
    category: 'combo',
  },
  {
    _id: 'combo5',
    name: 'Green Booster Combo',
    image: '/assets/combo-green.jpg',
    price: '329',
    category: 'combo',
  },
  {
    _id: 'combo6',
    name: 'Immunity Combo',
    image: '/assets/combo-immunity.jpg',
    price: '289',
    category: 'combo',
  },
];

const ComboSection = () => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  return (
    <section className="combo-wrapper">
      <h2 className="section-title">Combo Offers</h2>
      <div className="Combo-grid">
        {comboData.map(product => {
          const cartItem = cartItems.find(item => item._id === product._id);

          return (
            <div key={product._id} className="Combo-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>

              {cartItem ? (
                <div className="quantity-controls1">
                  <button
                    className="qty-btn1"
                    onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{cartItem.quantity}</span>
                  <button
                    className="qty-btn1"
                    onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button onClick={() => addToCart(product)}>Add to Cart</button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ComboSection;
