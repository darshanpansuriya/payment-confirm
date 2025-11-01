import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import config from '../config/config';
import './PaymentForm.css';

const stripePromise = loadStripe(config.stripe.tracelo);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '18px',
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4'
      },
      padding: '20px',
      lineHeight: '48px'
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  },
  hidePostalCode: true // This removes the ZIP/Postal code field
};

const StripeCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [showCardInput, setShowCardInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const handleClientSecretSubmit = async (event) => {
    event.preventDefault();
    if (!clientSecret) return;

    try {
      // Validate the client secret by retrieving the payment intent
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      if (paymentIntent && paymentIntent.status) {
        setShowCardInput(true);
        setError(null);
      } else {
        setError('Invalid client secret. Please check and try again.');
      }
    } catch (err) {
      setError('Invalid client secret. Please check and try again.');
    }
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        setPaymentResult(null);
      } else {
        // Payment successful
        console.log('Payment Result:', result);
        setPaymentResult(result);
      }
    } catch (err) {
      setError('An error occurred while processing your payment.');
    }

    setLoading(false);
  };

  if (!showCardInput) {
    return (
      <form onSubmit={handleClientSecretSubmit} className="payment-form">
        <div className="form-group">
          <label>Client Secret</label>
          <input
            type="text"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Enter Client Secret"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">
          Continue to Payment
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePaymentSubmit} className="payment-form">
      <div className="form-group">
        <label>Card Details</label>
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Confirm Payment'}
      </button>

      {paymentResult && (
        <div className="payment-result">
          <h3>Payment Successful!</h3>
          <div className="payment-details">
            <p><strong>Payment ID:</strong> {paymentResult.paymentIntent.id}</p>
            <p><strong>Amount:</strong> {(paymentResult.paymentIntent.amount / 100).toFixed(2)} {paymentResult.paymentIntent.currency.toUpperCase()}</p>
            <p><strong>Status:</strong> <span className="status-badge">{paymentResult.paymentIntent.status}</span></p>
            <p><strong>Payment Method:</strong> {paymentResult.paymentIntent.payment_method_types.join(', ')}</p>
            <div className="payment-json">
              <h4>Complete Payment Details:</h4>
              <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

const StripePayment = () => {
  return (
    <div className="payment-container">
      <h1>Stripe Payment Confirmation</h1>
      <Elements stripe={stripePromise}>
        <StripeCheckoutForm />
      </Elements>
    </div>
  );
};

export default StripePayment;