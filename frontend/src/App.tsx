import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ContactList from './components/contacts/ContactList';
import LeadList from './components/leads/LeadList';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginForm />} />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="contacts" element={<ContactList />} />
                <Route path="leads" element={<LeadList />} />
                <Route 
                  path="opportunities" 
                  element={
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
                      <p className="text-gray-600 mt-2">Coming soon...</p>
                    </div>
                  } 
                />
                <Route 
                  path="activities" 
                  element={
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
                      <p className="text-gray-600 mt-2">Coming soon...</p>
                    </div>
                  } 
                />
                <Route 
                  path="reports" 
                  element={
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                      <p className="text-gray-600 mt-2">Coming soon...</p>
                    </div>
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                      <p className="text-gray-600 mt-2">Coming soon...</p>
                    </div>
                  } 
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;