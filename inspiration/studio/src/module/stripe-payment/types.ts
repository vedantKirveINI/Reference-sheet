export type StripeConnectionData = {
  configs: {
    [key: string]: any;
    access_token?: string;
    refresh_token?: string;
    stripe_user_id?: string;
    stripe_publishable_key?: string;
    livemode?: boolean;
    token_type?: string;
  };
} & Record<string, any>;

export type StripePaymentFillerRef = {
  validate: () => Promise<string>;
  getStripe: () => any;
  getElements: () => any;
  createPaymentIntent: () => Promise<string>;
};

export type StripePaymentFillerProps = {
  question: any;
  theme?: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
  value?: any;
};
