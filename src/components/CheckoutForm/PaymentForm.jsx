import { Typography, Button, Divider } from "@mui/material";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Review from "./Review";

const stripePromise = loadStripe("process.env.REACT_APP_STRIPE_PUBLIC_KEY");

const PaymentForm = ({ shippingData, checkoutToken, backStep, onCaptureCheckout, nextStep }) => {
  return (
    <>
      <Review checkoutToken={checkoutToken} />
      <Divider />
      <Typography variant="h6" gutterBottom style={{ margin: "20px 0" }}>
        Payment method
      </Typography>
      <Elements stripe={stripePromise}>
        <CheckoutForm
          shippingData={shippingData}
          checkoutToken={checkoutToken}
          backStep={backStep}
          onCaptureCheckout={onCaptureCheckout}
          nextStep={nextStep}
        />
      </Elements>
    </>
  );
};

const CheckoutForm = ({ shippingData, checkoutToken, backStep, onCaptureCheckout, nextStep }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event, elements, stripe) => {
    event.preventDefault();
    console.log(event, elements, stripe);
    if (!stripe || elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({ type: "card", card: cardElement });

    if (error) {
      console.log(error);
    } else {
      const orderData = {
        line_items: checkoutToken.live.line_items,
        customer: { firstname: shippingData.firstname, lastname: shippingData.lastname, email: shippingData.email },
        shipping: {
          name: "Primary",
          street: shippingData.address1,
          town_city: shippingData.city,
          county_state: shippingData.shippingSubdivision,
          postal_zip_code: shippingData.zip,
          country: shippingData.shippingCountry,
        },
        fulfillment: { shipping_method: shippingData.shippingOption },
        payment: {
          gateway: "stripe",
          stripe: {
            payment_method_id: paymentMethod.id,
          },
        },
      };

      onCaptureCheckout(checkoutToken.id, orderData);

      nextStep();
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, elements, stripe)}>
      <CardElement />
      <br /> <br />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={backStep}>
          Back
        </Button>
        <Button type="submit" variant="contained" disabled={!stripe} color="primary">
          Pay {checkoutToken.live.subtotal.formatted_with_symbol}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
