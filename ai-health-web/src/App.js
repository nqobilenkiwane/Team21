import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Diagnostic from './pages/Diagnostic';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './index.css';
import '@testing-library/jest-dom';
import './setupTests';
import './App.css';

function App() {
  return (
    <Router>
      <Routes option={{ title: 'AI Health Web' }}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} option={{ title: 'Login' }} />
        <Route path="/register" element={<Register />} option={{ title: 'Register' }} />
        <Route path="/dashboard" element={<Dashboard />} option={{ title: 'Dashboard' }} />
        <Route path="/diagnostic" element={<Diagnostic />} option={{ title: 'Diagnostic' }} />
        <Route path="/profile" element={<Profile />} option={{ title: 'Profile' }} />
        <Route path="/settings" element={<Settings />} option={{ title: 'Settings' }} />
      </Routes>
    </Router>
  );
}

export default App;
