
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { OrdersProvider } from './context/OrdersContext';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <UserProvider>
        <OrdersProvider>
          <App />
        </OrdersProvider>
      </UserProvider>
    </CartProvider>
  </React.StrictMode>
);


