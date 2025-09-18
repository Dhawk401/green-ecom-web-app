// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupForm from './pages/SignupForm';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import EditProfile from './pages/EditProfile';
import ProductDetail from './pages/ProductDetail';
import CartBar from './components/CartBar';
import CompleteAccount from './pages/CompleteAccount';
import AccountDetails from './pages/AccountDetails';
import PrivateRoute from './components/PrivateRoute';
import Wallet from './components/Wallet';
import CheckoutWholesale from './pages/CheckoutWholesale';
import CheckoutSelector from './components/CheckoutSelector'; // <- new
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Help from './pages/Help';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signupform" element={<SignupForm />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/complete-account" element={<CompleteAccount />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/wallet" element={<Wallet />} />
        {/* Optional: keep a direct wholesale route for debugging/admin use */}
        <Route path="/checkout-wholesale" element={<CheckoutWholesale />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/help" element={<Help />} />

        {/* Protected Routes */}
        <Route path="/shop" element={
          <PrivateRoute>
            <Shop />
          </PrivateRoute>
        } />
        <Route path="/cart" element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        } />
        {/* Use CheckoutSelector so we render the right checkout based on role/toggle */}
        <Route path="/checkout" element={
          <PrivateRoute>
            <CheckoutSelector />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        } />
        <Route path="/edit-profile" element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        } />
        <Route path="/account-details" element={
          <PrivateRoute>
            <AccountDetails />
          </PrivateRoute>
        } />
      </Routes>
      <CartBar />
      <Footer />
    </Router>
  );
}

export default App;
