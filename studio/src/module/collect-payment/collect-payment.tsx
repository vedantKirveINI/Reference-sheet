import RazorpayPaymentForm from "./components/razorpay";
import StripePaymentForm from "./components/stripe";
import PaymentSuccess from "./components/success";

export type CollectPaymentProps = {
  isCreator: boolean;
  question: any;
  onChange: any;
  answers: any;
};

export function CollectPayment({
  question,
  isCreator,
  onChange,
  answers,
}: CollectPaymentProps) {
  const paymentMethod = question?.settings?.paymentMethod;

  if (answers[question?.node_id]) {
    return (
      <PaymentSuccess
        question={question}
        answer={answers[question?.node_id]?.response}
      />
    );
  }

  return (
    <div>
      {paymentMethod === "RAZORPAY" && (
        <RazorpayPaymentForm
          isCreator={isCreator}
          settings={question?.settings}
          assetId={1}
          onChange={onChange}
        />
      )}
      {paymentMethod === "STRIPE" && <StripePaymentForm />}
    </div>
  );
}
