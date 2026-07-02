import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StripePayment from './components/StripePayment';
import SolidgateAccounts from './components/SolidgateAccounts';
import SolidgatePayment from './components/SolidgatePayment';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stripe-payment" element={<StripePayment />} />
          <Route path="/solidgate" element={<SolidgateAccounts />} />
          <Route path="/solidgate/:brand" element={<SolidgatePayment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
