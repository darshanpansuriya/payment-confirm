import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Select Payment Provider</h1>
      <div className="payment-options">
        <Link to="/stripe-payment" className="payment-option stripe">
          <h2>Stripe Payment</h2>
          <p>Secure payments with Stripe</p>
        </Link>
        <Link to="/solidgate" className="payment-option solidgate">
          <h2>Solidgate Payment</h2>
          <p>Secure payments with Solidgate</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;