# Stripe Payment Question Type - Knowledge Documentation

## Overview

The Stripe Payment question type is a form component that allows users to collect payment information using Stripe's secure payment elements. It integrates with Stripe's OAuth2 authorization system to manage connections and securely processes payment card information.

## Component Architecture

### Main Components

1. **StripePayment** (`stripe-payment.tsx`)
   - Main entry point component
   - Uses `forwardRef` to expose imperative handle methods
   - Routes between Creator and Filler modes based on `isCreator` prop
   - Creator mode: Shows `StripePaymentCreator` (currently minimal implementation)
   - Filler mode: Shows `StripePaymentFillerRoot` which handles validation and connection checks

2. **StripePaymentFillerRoot** (`components/StripePaymentFillerRoot.tsx`)
   - Validation layer component that sits between `StripePayment` and `StripePaymentFiller`
   - Validates amount > 0 and access token existence before rendering payment form
   - Shows error messages for invalid amount or missing connection
   - Only renders `StripePaymentFiller` if all prerequisites are met

3. **StripePaymentFiller** (`components/StripePaymentFiller.tsx`)
   - Main payment form component used in filler/view mode
   - Creates Stripe Elements instance with connection-specific publishable key
   - Manages refs for Elements instance and Stripe instance
   - Exposes imperative handle with `validate()` and `getStripe()` methods
   - Wraps `StripeContextBridge` inside `<Elements>` provider

4. **StripeContextBridge** (internal component in StripePaymentFiller.tsx)
   - Bridge component that lives inside Elements context
   - Uses `useStripe()` hook to access Stripe instance
   - Passes Stripe instance back to parent via `onStripeReady` callback
   - Renders `StripePaymentForm` as children

5. **StripePaymentForm** (internal component in StripePaymentFiller.tsx)
   - The actual form UI with Stripe Payment Element
   - Uses `PaymentElement` from `@stripe/react-stripe-js` (unified payment UI)
   - Handles custom name and email input fields
   - Manages form state via `useStripePayment` hook

6. **StripePaymentCreator** (`components/StripePaymentCreator.tsx`)
   - Placeholder component for creator/edit mode
   - Currently shows minimal UI ("StripePaymentCreator")
   - Uses `forwardRef` to match interface requirements

## Question Prop Data Structure

### Default Setup Structure

```typescript
{
  _id: "stripe_payment_123",
  question: "Question Title",
  description: "Question Description",
  type: QuestionType.STRIPE_PAYMENT,
  module: "Question",
  buttonLabel: "Next",
  value: {
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    name: "",
    country: "",
    email: "",
  },
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    amount: "",
    currency: "USD",
    stripe_connection_data: null,
    sendReceipt: false,
    toolTipText: "",
  },
  response_type: QUESTION_RESPONSE_TYPES.STRING,
}
```

### Settings Object Breakdown

The `question.settings` object contains:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `questionAlignment` | `QuestionAlignments` | `LEFT` | Alignment of the question (LEFT, CENTER, RIGHT) |
| `required` | `boolean` | `false` | Whether the payment field is required |
| `amount` | `string` | `""` | Payment amount (numeric string) |
| `currency` | `string` | `"USD"` | Currency code (USD, EUR, GBP, etc.) |
| `stripe_connection_data` | `object \| null` | `null` | Stripe connection/account data |
| `sendReceipt` | `boolean` | `false` | Whether to collect email for receipt |
| `toolTipText` | `string` | `""` | Tooltip text to display |

### Stripe Connection Data Structure

When a Stripe connection is selected, `stripe_connection_data` contains:

```typescript
{
  _id: string,                      // Connection ID
  id: string,                       // Alias for _id
  name: string,                     // Connection name
  created_at: string,               // ISO date string
  configs: {
    access_token: string,            // Stripe access token (used for API calls)
    refresh_token?: string,          // Stripe refresh token
    stripe_user_id?: string,         // Connected Stripe account ID
    stripe_publishable_key: string,  // Publishable key (used to initialize Stripe.js)
    livemode?: boolean,              // Whether using live or test mode
    token_type?: string,             // Token type (typically "bearer")
    [key: string]: any,              // Other configuration values
  },
  // ... other Stripe connection properties
}
```

**Important Notes**:
- `configs.stripe_publishable_key` is used to initialize Stripe.js via `getStripePromise()`
- `configs.access_token` is used for server-side API calls (not used in component)
- The connection data is stored in `question.settings.stripe_connection_data`

### Value Object Structure (Form Response)

The `onChange` callback receives an object with the following structure:

```typescript
{
  name: string,                        // Name on card (required)
  email: string,                       // Email (only if sendReceipt is true)
  paymentIntentId: null,               // Always null - payment processing is handled by parent
  paymentStatus: null,                 // Always null - payment processing is handled by parent
}
```

**Important Notes**:
1. For PCI compliance, actual card values (card number, expiry, CVC) are NEVER exposed. The PaymentElement handles all card data internally.
2. The component only collects user details (name, email) and Payment Element data. Payment processing must be done by the parent component using the exposed `getStripe()` method.
3. Card validation is handled internally by Stripe's PaymentElement and exposed via the `validate()` method.

## Settings Configuration

### Settings Location

Settings are configured in:
- **File**: `components/fds/skeleton/settings-footer/components/questions/stripe-payment/stripe-payment-general-settings.tsx`

### Settings UI Components

1. **Question Alignment** - Left/Center/Right alignment
2. **Required Toggle** - Make the payment field required
3. **Tooltip Text** - Add tooltip text
4. **CTA Editor** - Button label customization
5. **Stripe Connection Manager** - Manage Stripe account connections
6. **Amount Field** - Set payment amount (numeric only)
7. **Currency Dropdown** - Select currency from supported list
8. **Send Receipt Toggle** - Enable/disable email collection for receipts

### Supported Currencies

The component supports the following currencies (defined in `constants/currencies.ts`):

- EUR (Euro)
- GBP (British Pound Sterling)
- USD (United States Dollar)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- CHF (Swiss Franc)
- NOK (Norwegian Krone)
- SEK (Swedish Krona)
- DKK (Danish Krone)
- MXN (Mexican Peso)
- NZD (New Zealand Dollar)
- BRL (Brazilian Real)

## Stripe Connection Management

### Connection Manager Component

**Location**: `components/fds/skeleton/settings-footer/components/questions/stripe-payment/components/StripeConnectionManager.tsx`

### Features

1. **Add New Connection**
   - Opens OAuth2 popup window for Stripe authorization
   - Uses PKCE (Proof Key for Code Exchange) for security
   - Stores connection state temporarily during OAuth flow
   - Handles popup window communication via postMessage API

2. **List Existing Connections**
   - Uses `authorizeDataSDKServices.getByParent()` to fetch connections
   - Displays connections sorted by creation date (newest first)
   - Shows connection name and creation date
   - Radio button selection for active connection
   - Delete functionality with trash icon (removes connection from state and API)

3. **OAuth2 Flow**
   - Uses authorization ID: `97d540cf-0e5b-4544-96d1-124aae116a5e`
   - Uses parent ID: `3247445e-6297-464d-86ad-84b818150277`
   - Generates code verifier and challenge for PKCE
   - Opens popup window for user consent
   - Receives authorization callback via postMessage

### API Services Used

**Location**: `components/common/core/utils/services/authorizeDataSDKServices.ts`

1. **Get Connections**
   ```typescript
   authorizeDataSDKServices.getByParent({
     authorization_id: AUTHORIZATION_ID,
     workspace_id: workspaceId,
   })
   ```
   - Returns list of connections sorted by creation date
   - Used to fetch and display existing connections

2. **Delete Connection**
   ```typescript
   authorizeDataSDKServices.deleteById(authorized_data_id)
   ```
   - Deletes a connection by ID
   - Updates local state immediately after successful deletion
   - Clears selection if deleted connection was selected

3. **Get Authorization** (Direct API call)
   ```
   GET /service/v0/authorization/by/parent?parent_id={PARENT_ID}&state=ACTIVE
   ```
   - Fetches authorization configuration for OAuth2 setup

4. **Save Authorization State** (Direct API call)
   ```
   POST /service/v0/temp/storage/save
   Body: { meta: authorizationState }
   ```
   - Saves temporary state during OAuth2 flow

## Payment Form Fields

### Payment Element (Card Details)
- **Element**: `PaymentElement` from `@stripe/react-stripe-js`
- **Type**: Unified payment UI that handles card number, expiry, CVC, and country
- **Layout**: Tabs (configured in options)
- **Validation**: Handled internally by Stripe Elements
- **Billing Details**: Configured to collect country automatically, name and email are collected separately
- **No Actual Value**: Card data is never exposed (PCI compliance)
- **Configuration**: 
  ```typescript
  {
    layout: "tabs",
    fields: {
      billingDetails: {
        address: {
          country: "auto"  // Stripe collects country automatically
        }
      }
    }
  }
  ```

### Name on Card
- **Element**: Native HTML `<input type="text">`
- **Placeholder**: "John Smith"
- **Data Collected**: Full name string
- **Required**: Yes (validated in `validate()` method)
- **Note**: Collected separately from PaymentElement for custom control

### Email (Conditional)
- **Element**: Native HTML `<input type="email">`
- **Condition**: Only shown if `settings.sendReceipt === true`
- **Placeholder**: "example@email.com"
- **Data Collected**: Email address string
- **Required**: Only if sendReceipt is enabled (validated in `validate()` method)
- **Validation**: Basic email format validation via regex
- **Note**: Collected separately from PaymentElement for conditional display

## Data Flow

### Creator Mode Flow

```
StripePayment (isCreator=true)
  → StripePaymentCreator
    → Shows placeholder/preview
```

### Filler Mode Flow

```
StripePayment (isCreator=false)
  → StripePaymentFillerRoot
    → Validates amount > 0 (shows error if invalid)
    → Validates access token exists (shows error if missing)
    → StripePaymentFiller (if valid)
      → Extracts publishable key from connection data
      → Creates Stripe Elements instance with connection-specific key
      → Creates Elements wrapper with amount, currency, theme
      → StripeContextBridge (inside Elements context)
        → Accesses Stripe instance via useStripe()
        → Passes Stripe instance to parent via onStripeReady
        → StripePaymentForm
          → Renders PaymentElement (unified payment UI)
          → Renders custom name input field
          → Renders email input field (if sendReceipt enabled)
          → Manages form state via useStripePayment hook
          → Calls onChange when form fields change
```

### onChange Callback Behavior

The `onChange` callback is called whenever:
- Name field changes
- Email field changes (if enabled)

**In Creator Mode**:
```typescript
onChange("value", formData)
```

**In Filler Mode**:
```typescript
onChange({
  name: string,
  email: string,        // Only included if sendReceipt is true
  paymentIntentId: null,
  paymentStatus: null
})
```

**Note**: Card element changes are handled internally by PaymentElement and validated via the `validate()` method exposed through the ref.

## Stripe Integration

### Stripe Initialization

**File**: `utils.ts`

```typescript
getStripePromise(stripeOAuthData: StripeConnectionData): Promise<Stripe | null>
```

- Loads Stripe.js using publishable key from connection data
- Key source: `stripeOAuthData.configs.stripe_publishable_key`
- **Important**: Each connection has its own publishable key, loaded dynamically
- Throws error if publishable key is not available

### Stripe Elements Configuration

**Location**: `StripePaymentFiller.tsx`

```typescript
const elementsOptions: StripeElementsOptions = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: theme?.styles?.buttons || "#000",
      colorText: theme?.styles?.questions || "#000",
      fontFamily: theme?.styles?.fontFamily || "Inter",
    },
  },
  mode: "payment",
  currency: currency.toLowerCase(),
  amount: amountInCents,  // Amount in smallest currency unit
  locale: "en",
};
```

### Payment Element Configuration

**Location**: `StripePaymentForm` component

```typescript
<PaymentElement
  options={{
    layout: "tabs",
    fields: {
      billingDetails: {
        address: {
          country: "auto",  // Stripe automatically collects country
        },
      },
    },
  }}
/>
```

**Note**: Name and email are NOT collected by PaymentElement. They are collected via custom input fields for conditional display and custom validation.

## Validation & Error Handling

### Amount Validation

- **Location**: `StripePaymentFillerRoot.tsx`
- Amount must be > 0
- If amount <= 0, shows error: "Looks like there's nothing to charge. Please check the amount."
- Amount is parsed as float: `parseFloat(settings?.amount || "0")`
- Prevents rendering of payment form if invalid

### Connection Validation

- **Location**: `StripePaymentFillerRoot.tsx`
- Access token must exist in `stripe_connection_data.configs.access_token`
- If missing, shows error: "Stripe connection not configured. Please check your settings."
- Prevents rendering of payment form if connection is not configured

### Form Validation

**Location**: `StripePaymentFiller.tsx` (via imperative handle)

The component exposes a `validate()` method through `forwardRef` and `useImperativeHandle`:

```typescript
validate(): Promise<string>
```

Validation steps:
1. **PaymentElement validation**: Calls `elements.submit()` to validate card details
   - Returns error message if card validation fails
2. **Name validation**: Checks if name is provided and not empty
   - Returns "Name on card is required" if missing
3. **Email validation** (if `sendReceipt` is true):
   - Checks if email is provided
   - Validates email format using regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Returns appropriate error message if validation fails

### Validation Integration

**Location**: `components/fds/skeleton/question-filler/pre-hooks/stripePayment.ts`

The validation is triggered via pre-hooks system:
- Pre-hook calls `ref.current.validate()` before form submission
- Returns error if validation fails, preventing form submission
- Basic field validation also exists in `validation/stripe-payment.ts`

### Error Display

- **External errors**: Displayed via `error` prop (passed to StripePaymentForm)
- **Card field errors**: Displayed inline by Stripe's PaymentElement
- **Validation errors**: Returned by `validate()` method and displayed by parent component
- **Error styling**: Red text (#C83C3C), 0.875em font size

## Styling & Theming

### Theme Object Structure

```typescript
{
  styles: {
    questions: string,        // Text color for questions
    fontFamily: string,       // Font family (default: "Inter")
    buttons: string,          // Button background color
    buttonTextColor: string,  // Button text color
  }
}
```

### Style Functions

**File**: `styles.ts`

1. `getContainerStyles()` - Main container wrapper
2. `getAmountDisplayStyles(theme)` - Amount display styling
3. `getPaymentFormStyles()` - Payment form container
4. `getErrorStyles()` - Error message styling
5. `getSuccessStyles()` - Success message styling (not currently used)
6. `getButtonStyles(theme, disabled)` - Button styling (not currently used)
7. `getCardElementStyles(theme)` - Stripe card element wrapper

## Component Props

### StripePayment Props

```typescript
type StripePaymentProps = {
  isCreator: boolean;      // Whether in creator/edit mode
  question: any;          // Question object with settings
  onChange: any;          // Callback for value changes
  theme?: any;           // Theme object for styling
  error?: string;        // External error message
  disabled?: boolean;    // Whether form is disabled
  value?: any;           // Current value (for controlled component)
};
```

**Ref Type**: `StripePaymentFillerRef`

Exposes methods:
- `validate(): Promise<string>` - Validates form and returns error message (empty string if valid)
- `getStripe(): any` - Returns Stripe instance for payment processing (used by parent)

### StripePaymentFillerRoot Props

```typescript
type StripePaymentFillerProps = {
  question: any;         // Question object with settings
  theme?: any;          // Theme object for styling
  onChange: (value: any) => void;  // Callback for form changes
  disabled?: boolean;    // Whether form is disabled
  error?: string;       // External error message
  value?: any;          // Current value (for prefilling form)
};
```

**Ref Type**: `StripePaymentFillerRef`

### StripePaymentFiller Props

Same as `StripePaymentFillerRoot` props.

**Ref Type**: `StripePaymentFillerRef`

### StripePaymentFillerRef Interface

```typescript
type StripePaymentFillerRef = {
  validate: () => Promise<string>;  // Validates form, returns error message
  getStripe: () => any;              // Returns Stripe instance from Elements context
};
```

## Usage Example

### In Answer Section

**Location**: `components/fds/skeleton/question-v2/components/answer-section/index.tsx`

```typescript
<StripePayment
  ref={ref}  // Ref is passed for imperative handle access
  isCreator={isCreator}
  question={questionData}
  onChange={(_value) => {
    if (isCreator) {
      onChange("value", _value);
    } else {
      onChange(_value);
    }
  }}
  theme={theme}
  error={error}
  disabled={loading}
  value={isCreator ? value : value?.response}
/>
```

### Validation Usage

**Location**: `components/fds/skeleton/question-filler/pre-hooks/stripePayment.ts`

The ref is used in pre-hooks to validate before submission:

```typescript
const handleStripePayment = async ({ node, ref }) => {
  if (ref?.current?.validate) {
    const error = await ref.current.validate();
    if (error) {
      return { error, earlyExit: false };
    }
  }
  return {};
};
```

### Payment Processing Usage

After validation passes, the parent component can access the Stripe instance:

```typescript
const stripeInstance = ref.current?.getStripe();
// Use stripeInstance to confirm payment, create payment intents, etc.
```

**Note**: Actual payment processing is handled by the parent component, not within the StripePayment component itself.

## Important Notes

1. **PCI Compliance**: Actual card numbers, expiry dates, and CVCs are NEVER exposed. The PaymentElement handles all card data internally, and no card values are accessible in the component code.

2. **Connection Required**: Payment form only works when a Stripe connection is configured in settings. Each connection provides its own `stripe_publishable_key` which is used to initialize Stripe.js.

3. **Amount Validation**: The form will not render if amount is 0 or invalid. Validation happens in `StripePaymentFillerRoot` before rendering the payment form.

4. **Email Collection**: Email field is conditionally rendered based on `settings.sendReceipt`. Collected separately from PaymentElement for better control.

5. **Imperative Handle**: The component uses `forwardRef` and `useImperativeHandle` to expose `validate()` and `getStripe()` methods. These are used by parent components for validation and payment processing.

6. **Stripe Context Bridge**: A bridge component (`StripeContextBridge`) is used to access Stripe instance from within Elements context. This allows exposing the Stripe instance to parent components via the ref.

7. **Validation Flow**: 
   - PaymentElement validation is done via `elements.submit()`
   - Form field validation (name, email) is done manually
   - Validation is triggered through pre-hooks system before form submission
   - Errors are returned as strings (empty string = valid)

8. **Payment Processing**: This component only **collects** payment information. Actual payment processing must be handled by the parent component using the exposed `getStripe()` method. The component does not create Payment Intents or process charges - it only validates and collects payment details securely.

9. **OAuth2 Security**: Connection management uses PKCE (Proof Key for Code Exchange) for secure OAuth2 flow.

10. **Popup Communication**: Connection authorization uses postMessage API for cross-window communication.

11. **Data Persistence**: The component accepts `value` prop to prefill form fields (name, email) when navigating back to the question.

12. **Settings Registration**: The settings component is registered in `components/fds/skeleton/settings-footer/components/general-settings/index.tsx` under `QuestionType.STRIPE_PAYMENT`.

## File Structure

```
stripe-payment/
├── components/
│   ├── StripePaymentCreator.tsx       # Creator mode component (minimal)
│   ├── StripePaymentFiller.tsx        # Main payment form component
│   └── StripePaymentFillerRoot.tsx    # Validation layer component
├── hooks/
│   └── useStripePayment.ts            # Form state management hook
├── stripe-payment.tsx                 # Main entry component
├── types.ts                           # TypeScript type definitions
├── utils.ts                           # Stripe initialization utility
├── styles.ts                          # Styling functions
├── index.ts                           # Exports
├── package.json                       # Dependencies
├── STRIPE_PAYMENT_KNOWLEDGE.md        # This documentation
└── README.md                          # Project README

settings-footer/components/questions/stripe-payment/
├── components/
│   └── StripeConnectionManager.tsx    # Connection management UI
├── constants/
│   └── currencies.ts                  # Supported currencies list
├── stripe-payment-general-settings.tsx  # Settings UI
└── styles.ts                          # Settings styles

question-filler/
├── validation/
│   └── stripe-payment.ts              # Basic field validation
└── pre-hooks/
    └── stripePayment.ts               # Pre-submission validation via ref
```

## Dependencies

### Key Packages

- `@stripe/stripe-js` - Stripe.js library
- `@stripe/react-stripe-js` - React components for Stripe Elements
- `@emotion/react` - CSS-in-JS styling
- `@oute/oute-ds.core.constants` - Countries list
- `@oute/oute-ds.atom.error` - Error component

## Payment Processing Flow

**Important**: This component does NOT process payments. It only collects payment information securely and exposes the Stripe instance for parent components to handle payment processing.

### Current Implementation
- Collects card information using Stripe's PaymentElement (unified payment UI)
- Collects name and email via custom input fields
- Validates form fields (card details, name, email) via `validate()` method
- Exposes Stripe instance via `getStripe()` method
- Does NOT create Payment Intents or process charges
- Does NOT handle payment confirmation

### Parent Component Processing Flow
To actually process payments, the parent component should:

1. **Validate Form**: Call `ref.current.validate()` before submission
2. **Get Stripe Instance**: Access `ref.current.getStripe()` to get Stripe instance
3. **Create Payment Intent**: Use server-side API to create Payment Intent with amount and currency
4. **Confirm Payment**: Use Stripe instance to confirm payment with PaymentElement
5. **Handle Results**: Process success/failure callbacks

Example flow:
```typescript
// 1. Validate form
const validationError = await ref.current.validate();
if (validationError) {
  // Show validation error
  return;
}

// 2. Get Stripe instance
const stripe = ref.current.getStripe();
if (!stripe) {
  // Handle missing Stripe instance
  return;
}

// 3. Get form data
const formData = {
  name: value.name,
  email: value.email,
};

// 4. Create Payment Intent (server-side)
const { clientSecret } = await createPaymentIntent({
  amount,
  currency,
  accessToken,
});

// 5. Confirm payment with Stripe
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  clientSecret,
  confirmParams: {
    payment_method_data: {
      billing_details: {
        name: formData.name,
        email: formData.email,
      },
    },
  },
});
```

The component provides the foundation for payment collection and validation, but payment processing must be implemented by the parent component.

## Custom Hook: useStripePayment

**Location**: `hooks/useStripePayment.ts`

Manages form state (name, email) and handles onChange callbacks:

```typescript
const { name, email, setName, setEmail } = useStripePayment({
  sendReceipt: boolean,
  onChange: (value: any) => void,
  initialName?: string,
  initialEmail?: string,
});
```

**Features**:
- Manages name and email state
- Initializes from `initialName` and `initialEmail` props
- Calls `onChange` with structured data whenever fields change
- Returns setters (`setName`, `setEmail`) that update state and trigger onChange

## Future Improvements

1. **StripePaymentCreator**: Currently minimal implementation - could show preview of payment form
2. **Error Handling**: Could add more comprehensive error handling for connection failures
3. **Loading States**: Could add loading indicators during Stripe initialization
4. **Validation Feedback**: Could enhance visual feedback for form validation states
5. **Connection Persistence**: Could improve connection state persistence across navigation

## Related Components

- **Collect Payment**: Another payment collection component (different implementation)
- **Question Alignment**: Shared component for question alignment settings
- **CTA Editor**: Shared component for button label editing
- **Switch Option**: Shared component for toggle switches
- **Settings TextField**: Shared component for text input in settings

