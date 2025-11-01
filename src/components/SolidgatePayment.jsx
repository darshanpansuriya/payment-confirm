import React, { useState } from 'react';
import Payment from '@solidgate/react-sdk';
import './PaymentForm.css';

const SolidgatePayment = () => {
  const [merchantId, setMerchantId] = useState('');
  const [paymentIntent, setPaymentIntent] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!merchantId || !paymentIntent || !signature) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError(null);
    setShowCheckout(true);
  };

  const handleCheckoutComplete = (result) => {
    console.log('Payment Result:', result);
    setPaymentResult(result);
    setShowCheckout(false);
    setLoading(false);
  };

  const handleCheckoutError = (error) => {
    console.error('Payment Error:', error);
    setError(error.message || 'Payment failed');
    setShowCheckout(false);
    setLoading(false);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setLoading(false);
  };

  const handleOrderStatus = (e) => {
    console.log("orderStatus", e);
  }

  return (
    <div className="payment-container">
      <h1>Solidgate Payment Confirmation</h1>
      <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Merchant ID</label>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="Enter Merchant ID"
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Intent ID</label>
            <input
              type="text"
              value={paymentIntent}
              onChange={(e) => setPaymentIntent(e.target.value)}
              placeholder="Enter Payment Intent ID"
              required
            />
          </div>
          <div className="form-group">
            <label>Signature</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter Signature"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>

          {paymentResult && (
            <div className="payment-result">
              <h3>Payment Successful!</h3>
              <div className="payment-details">
                <p><strong>Transaction ID:</strong> {paymentResult.transactionId}</p>
                <p><strong>Status:</strong> <span className="status-badge">{paymentResult.status}</span></p>
                <div className="payment-json">
                  <h4>Complete Payment Details:</h4>
                  <pre>{JSON.stringify(paymentResult, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
      </form>

      {showCheckout && (
        <div style={{ marginTop: 24 }}>
          <Payment
            merchantData={{ merchant: merchantId, paymentIntent: paymentIntent, signature: signature }}
            width={1000}
            styles={{}}
            formParams={{}}
            onMounted={(msg) => {
              console.log('Solidgate SDK mounted:', msg);
            }}
            onReadyPaymentInstance={(instance) => {
              console.log('Ready payment instance', instance);
            }}
            onSuccess={(result) => handleCheckoutComplete(result)}
            onError={(err) => handleCheckoutError(err)}
            onFail={(err) => handleCheckoutError(err)}
            onClose={() => handleCheckoutClose()}
            onPaymentDetails={(e) => console.log("onPaymentDetails", e)}
            onOrderStatus={handleOrderStatus}
          />
        </div>
      )}
    </div>
  );
};

export default SolidgatePayment;