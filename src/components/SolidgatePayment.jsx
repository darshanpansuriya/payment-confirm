import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Payment from '@solidgate/react-sdk';
import config from '../config/config';
import { getBrand } from '../config/solidgateBrands';
import './SolidgatePayment.css';

const OBJECT_PLACEHOLDER = `{
  "paymentIntent": "…",
  "merchant": "api_pk_…",
  "signature": "…"
}`;

// Pull just the two fields we surface on the page out of an onOrderStatus
// payload. The card token can sit in a couple of places depending on the
// transaction shape, so check both.
const extractOrderInfo = (payload) => {
  const orderId = payload?.order?.order_id ?? null;

  let cardToken = null;
  const transactions = payload?.transactions;
  if (transactions && typeof transactions === 'object') {
    for (const tx of Object.values(transactions)) {
      const token = tx?.card_token?.token ?? tx?.card?.card_token?.token;
      if (token) {
        cardToken = token;
        break;
      }
    }
  }

  return { orderId, cardToken };
};

const SolidgatePayment = () => {
  const { brand } = useParams();
  const selectedBrand = getBrand(brand);

  const [step, setStep] = useState('input'); // input → checkout
  const [rawObject, setRawObject] = useState('');
  const [merchantData, setMerchantData] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'failed'
  const [orderInfo, setOrderInfo] = useState(null); // { orderId, cardToken }
  const [copiedField, setCopiedField] = useState(null);

  // Unknown account in the URL → bounce back to the account picker.
  if (!selectedBrand) {
    return <Navigate to="/solidgate" replace />;
  }

  const expectedMerchant = config.solidgate[brand];
  const merchantMismatch =
    merchantData && expectedMerchant && merchantData.merchant !== expectedMerchant;

  // Log every event in full to the console; keep the latest known order id /
  // card token (don't let a later event without them wipe what we captured).
  const handleOrderStatus = (payload) => {
    const { orderId, cardToken } = extractOrderInfo(payload);
    setOrderInfo((prev) => ({
      orderId: orderId || prev?.orderId || null,
      cardToken: cardToken || prev?.cardToken || null,
    }));
  };

  const log = (name, after) => (event) => {
    console.log(`[Solidgate] ${name}`, event);
    if (after) after(event);
  };

  const sdkHandlers = {
    onMounted: log('onMounted'),
    onReadyPaymentInstance: log('onReadyPaymentInstance'),
    onSubmit: log('onSubmit'),
    onInteraction: log('onInteraction'),
    onCard: log('onCard'),
    onVerify: log('onVerify'),
    onResize: log('onResize'),
    onCustomStylesAppended: log('onCustomStylesAppended'),
    onFormRedirect: log('onFormRedirect'),
    onPaymentDetails: log('onPaymentDetails'),
    onOrderStatus: log('onOrderStatus', handleOrderStatus),
    onSuccess: log('onSuccess', () => setStatus('success')),
    onFail: log('onFail', () => setStatus('failed')),
    onError: log('onError', () => setStatus('failed')),
  };

  const copy = (field, value) => {
    if (!value || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1500);
      })
      .catch(() => {});
  };

  const loadCheckout = (event) => {
    event.preventDefault();
    setError('');

    let parsed;
    try {
      parsed = JSON.parse(rawObject);
    } catch {
      setError('That is not valid JSON. Paste the full object, including the surrounding { }.');
      return;
    }

    const missing = ['paymentIntent', 'merchant', 'signature'].filter((key) => !parsed?.[key]);
    if (missing.length) {
      setError(`The object is missing required field(s): ${missing.join(', ')}.`);
      return;
    }

    setMerchantData({
      merchant: String(parsed.merchant).trim(),
      paymentIntent: String(parsed.paymentIntent).trim(),
      signature: String(parsed.signature).trim(),
    });
    setStatus(null);
    setOrderInfo(null);
    setStep('checkout');
  };

  const newPayment = () => {
    setStep('input');
    setRawObject('');
    setMerchantData(null);
    setError('');
    setStatus(null);
    setOrderInfo(null);
  };

  return (
    <div className="sg-page">
      <div className="sg-card">
        <header className="sg-header">
          <Link to="/solidgate" className="sg-back">← Accounts</Link>
          <div>
            <h1>Solidgate Checkout</h1>
            <p className="sg-sub">
              {step === 'input'
                ? 'Paste the payment object to load the checkout.'
                : 'Complete the payment — the order ID and card token appear below; the full response is in the console.'}
            </p>
          </div>
        </header>

        {step === 'input' && (
          <form className="sg-form" onSubmit={loadCheckout}>
            <span className="sg-chip">{selectedBrand.name}</span>
            <label htmlFor="sg-object">Payment object</label>
            <p className="sg-hint">
              Paste the object containing <code>paymentIntent</code>, <code>merchant</code> and{' '}
              <code>signature</code>.
            </p>
            <textarea
              id="sg-object"
              className="sg-textarea"
              rows={12}
              spellCheck="false"
              value={rawObject}
              onChange={(e) => setRawObject(e.target.value)}
              placeholder={OBJECT_PLACEHOLDER}
            />
            {error && <div className="sg-error">{error}</div>}
            <div className="sg-actions">
              <button type="submit" className="sg-primary">
                Load Checkout
              </button>
            </div>
          </form>
        )}

        {step === 'checkout' && merchantData && (
          <div className="sg-checkout">
            <span className="sg-chip">{selectedBrand.name}</span>

            {status === 'success' && (
              <div className="sg-banner sg-banner--success">✓ Payment successful</div>
            )}
            {status === 'failed' && (
              <div className="sg-banner sg-banner--failed">✕ Payment failed</div>
            )}
            {merchantMismatch && (
              <div className="sg-warn">
                Heads up: the merchant in this object doesn’t match the saved {selectedBrand.name}{' '}
                key. Continuing with the value from the object.
              </div>
            )}

            <div className="sg-frame">
              <Payment merchantData={merchantData} width="100%" {...sdkHandlers} />
            </div>

            <div className="sg-order">
              <h3>Order result</h3>
              {orderInfo ? (
                <dl className="sg-fields">
                  <div className="sg-field">
                    <dt>Order ID</dt>
                    <dd>
                      <code>{orderInfo.orderId || '—'}</code>
                      {orderInfo.orderId && (
                        <button
                          type="button"
                          className="sg-copy"
                          onClick={() => copy('orderId', orderInfo.orderId)}
                        >
                          {copiedField === 'orderId' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </dd>
                  </div>
                  <div className="sg-field">
                    <dt>Card token</dt>
                    <dd>
                      <code>{orderInfo.cardToken || '—'}</code>
                      {orderInfo.cardToken && (
                        <button
                          type="button"
                          className="sg-copy"
                          onClick={() => copy('cardToken', orderInfo.cardToken)}
                        >
                          {copiedField === 'cardToken' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="sg-events-empty">
                  The order ID and card token will appear here once the payment is processed.
                </p>
              )}
            </div>

            <div className="sg-actions">
              <button type="button" className="sg-ghost" onClick={newPayment}>
                New payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolidgatePayment;
