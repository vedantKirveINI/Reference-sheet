import styles from "./index.module.css";

export default function PaymentSuccess({ answer, question }) {
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <img
          src={"https://cdn-icons-png.flaticon.com/512/633/633611.png"}
          alt="Card Icon"
          className={styles.cardIcon}
        />
        Your payment of {question?.settings?.currency}{" "}
        {question?.settings?.amount} has been successfully collected with
        transaction ID: {answer?.paymentId}
      </div>
    </div>
  );
}
