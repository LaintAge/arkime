import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptedData, setEncryptedData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<LoginForm setIsAuthenticated={setIsAuthenticated} setEncryptedData={setEncryptedData} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard encryptedData={encryptedData} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
