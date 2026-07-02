import {  PaymentElement } from '@stripe/react-stripe-js';

const paymentElementOptions = {
layout: "tabs",
terms: {
    card: "never",
    applePay: "never",
    googlePay: "never",
    cashapp: "never",
    auBecsDebit: "never",
    bancontact: "never",
    ideal: "never",
    paypal: "never",
    sepaDebit: "never",
    sofort: "never",
    usBankAccount: "never",
},
};

const PaymentElementComp = () => {
    console.log("from checkoutr")
    const errorhandler = (e) => {
        console.log("from error", e)
    }
    return (
        <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
            onLoadError={errorhandler}
        />
    )

}

export default PaymentElementComp;