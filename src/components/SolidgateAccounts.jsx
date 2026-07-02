import React from 'react';
import { Link } from 'react-router-dom';
import SOLIDGATE_BRANDS from '../config/solidgateBrands';
import './SolidgatePayment.css';

const SolidgateAccounts = () => (
  <div className="sg-page">
    <div className="sg-card">
      <header className="sg-header">
        <Link to="/" className="sg-back">← Home</Link>
        <div>
          <h1>Solidgate Checkout</h1>
          <p className="sg-sub">Choose a merchant account to begin.</p>
        </div>
      </header>

      <div className="sg-options">
        {SOLIDGATE_BRANDS.map((brand) => (
          <Link key={brand.id} to={`/solidgate/${brand.id}`} className="sg-option">
            <span className="sg-option-name">{brand.name}</span>
            <span className="sg-option-desc">{brand.description}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default SolidgateAccounts;
