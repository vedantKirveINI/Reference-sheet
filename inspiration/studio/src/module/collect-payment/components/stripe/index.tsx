import styles from "./index.module.css";

export default function StripePaymentForm({}) {
  const handlePayment = async () => {};

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <img
          src={"https://cdn-icons-png.flaticon.com/512/633/633611.png"}
          alt="Card Icon"
          className={styles.cardIcon}
        />
        Stripe coming soon...
      </div>
    </div>
  );
}
