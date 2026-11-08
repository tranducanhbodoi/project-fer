import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import ManagerProducts from './pages/ManagerProducts';
import ManagerOrders from './pages/ManagerOrders';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="d-flex flex-column min-vh-100">
            <AppNavbar />
            <div className="flex-grow-1">
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute allowedRoles={['customer']} allowGuest={true}>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedRoute allowedRoles={['customer']} allowGuest={true}>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/manager/products"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagerProducts />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/manager/orders"
                  element={
                    <ProtectedRoute allowedRoles={['manager']}>
                      <ManagerOrders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
