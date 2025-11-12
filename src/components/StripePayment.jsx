import React, { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import config from '../config/config';
import './PaymentForm.css';

const stripePromise = loadStripe(config.stripe.tracelo);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '18px',
      color: '#1a1f36',
      iconColor: '#5469d4',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#6b7c93'
      },
      ':-webkit-autofill': {
        color: '#1a1f36'
      },
      padding: '20px',
      lineHeight: '48px',
      backgroundColor: '#ffffff',
      caretColor: '#1a1f36'
    },
    invalid: {
      color: '#df1b41',
      iconColor: '#df1b41'
    },
    complete: {
      color: '#1a1f36'
    }
  },
  hidePostalCode: true
};

const StripeCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecretInput, setClientSecretInput] = useState('');
  const [paymentIntentInfo, setPaymentIntentInfo] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [step, setStep] = useState('collectSecret');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const paymentSummary = useMemo(() => {
    if (!paymentIntentInfo) return null;

    const amount = (paymentIntentInfo.amount / 100).toFixed(2);
    const currency = paymentIntentInfo.currency?.toUpperCase();

    return {
      amount: `${amount} ${currency}`,
      status: paymentIntentInfo.status,
      description: paymentIntentInfo.description || 'Payment Intent',
      paymentMethods: paymentIntentInfo.payment_method_types?.join(', ')
    };
  }, [paymentIntentInfo]);

  const handleClientSecretSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !clientSecretInput.trim()) {
      setErrorMessage('Enter a client secret to continue.');
      return;
    }

    setIsBusy(true);
    setStatusMessage('Checking client secret...');
    setErrorMessage('');

    try {
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecretInput.trim());
      if (error || !paymentIntent) {
        throw new Error(error?.message || 'Unable to find a payment intent for that client secret.');
      }

      setPaymentIntentInfo(paymentIntent);
      setStep('collectPayment');
      setStatusMessage('Client secret verified. Enter card details below.');
    } catch (err) {
      setErrorMessage(err.message || 'Client secret is invalid. Please verify and try again.');
      setStatusMessage('');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecretInput.trim()) return;

    setIsBusy(true);
    setStatusMessage('Confirming payment...');
    setErrorMessage('');

    try {
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecretInput.trim(), {
        payment_method: {
          card: cardElement
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setPaymentIntentInfo(result.paymentIntent);
      setStatusMessage('Payment successful!');
      setStep('completed');
    } catch (err) {
      setErrorMessage(err.message || 'We were unable to process your payment, please try again.');
      setStatusMessage('');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-steps">
        <div className={`step ${step === 'collectSecret' ? 'active' : step !== 'collectSecret' ? 'completed' : ''}`}>
          <span className="step-index">1</span>
          <div>
            <p className="step-title">Client Secret</p>
            <p className="step-text">Paste the Payment Intent client secret to start.</p>
          </div>
        </div>
        <div className={`step ${step === 'collectPayment' ? 'active' : step === 'completed' ? 'completed' : ''}`}>
          <span className="step-index">2</span>
          <div>
            <p className="step-title">Card Details</p>
            <p className="step-text">Enter the customer’s payment information.</p>
          </div>
        </div>
        <div className={`step ${step === 'completed' ? 'active completed' : ''}`}>
          <span className="step-index">3</span>
          <div>
            <p className="step-title">Confirmation</p>
            <p className="step-text">Review final payment status and identifiers.</p>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        {statusMessage && <div className="status-banner info">{statusMessage}</div>}
        {errorMessage && <div className="status-banner error">{errorMessage}</div>}

        {step === 'collectSecret' && (
          <form className="checkout-card" onSubmit={handleClientSecretSubmit}>
            <h2>Enter Client Secret</h2>
            <p className="card-subtitle">
              This value comes from the Payment Intent generated on your server. It should look like
              <code> pi_***_secret_***</code>.
            </p>
            <div className="form-group">
              <label htmlFor="client-secret">Client Secret</label>
              <input
                id="client-secret"
                type="text"
                value={clientSecretInput}
                onChange={(event) => setClientSecretInput(event.target.value)}
                placeholder="pi_123456789_secret_ABCDEF"
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <button type="submit" disabled={isBusy}>
              {isBusy ? 'Validating…' : 'Continue to Card Entry'}
            </button>
          </form>
        )}

        {step === 'collectPayment' && (
          <form className="checkout-card" onSubmit={handlePaymentSubmit}>
            <h2>Card Information</h2>
            {paymentSummary && (
              <div className="summary-panel">
                <div>
                  <span className="summary-label">Amount</span>
                  <p className="summary-value">{paymentSummary.amount}</p>
                </div>
                <div>
                  <span className="summary-label">Status</span>
                  <p className={`summary-value status ${paymentSummary.status}`}>{paymentSummary.status}</p>
                </div>
                <div>
                  <span className="summary-label">Allowed Methods</span>
                  <p className="summary-value">{paymentSummary.paymentMethods || 'Not specified'}</p>
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="card-element">Card Details</label>
              <div className="card-element-shell">
                <CardElement
                  id="card-element"
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={(event) => setCardComplete(event.complete)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={() => setStep('collectSecret')} disabled={isBusy}>
                Back
              </button>
              <button type="submit" disabled={!stripe || !cardComplete || isBusy}>
                {isBusy ? 'Processing…' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        )}

        {step === 'completed' && paymentIntentInfo && (
          <div className="checkout-card">
            <h2>Payment Complete</h2>
            <p className="card-subtitle">Here are the final details for this payment.</p>

            <div className="result-grid">
              <div>
                <span className="summary-label">Payment Intent</span>
                <p className="summary-value">{paymentIntentInfo.id}</p>
              </div>
              <div>
                <span className="summary-label">Amount</span>
                <p className="summary-value">
                  {(paymentIntentInfo.amount / 100).toFixed(2)}{' '}
                  {paymentIntentInfo.currency?.toUpperCase()}
                </p>
              </div>
              <div>
                <span className="summary-label">Status</span>
                <p className={`summary-value status ${paymentIntentInfo.status}`}>{paymentIntentInfo.status}</p>
              </div>
              <div>
                <span className="summary-label">Next Action</span>
                <p className="summary-value">
                  {paymentIntentInfo.next_action ? paymentIntentInfo.next_action.type : 'None'}
                </p>
              </div>
            </div>

            <details className="json-block">
              <summary>View raw payment intent response</summary>
              <pre>{JSON.stringify(paymentIntentInfo, null, 2)}</pre>
            </details>

            <div className="result-actions">
              <button type="button" onClick={() => {
                setStep('collectSecret');
                setClientSecretInput('');
                setPaymentIntentInfo(null);
                setCardComplete(false);
                setStatusMessage('');
                setErrorMessage('');
              }}>
                Start Another Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StripePayment = () => (
  <div className="payment-container">
    <h1>Stripe Payment Confirmation</h1>
    <p className="page-intro">
      Validate a Payment Intent client secret and securely confirm the payment using Stripe Elements.
    </p>
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm />
    </Elements>
  </div>
);

export default StripePayment;