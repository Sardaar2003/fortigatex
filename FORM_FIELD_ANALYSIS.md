# Form Field Analysis - Common Fields & Extra Fields

This document analyzes all order forms to identify common fields (same semantic meaning) and extra/unique fields needed for a unified form.

## Forms Analyzed
1. **PSONLINEOrderForm** - PSOnline payment processing
2. **MIOrderForm** - MI Project with checking account
3. **RadiusOrderForm** - Radius Project with credit card
4. **SemprisOrderForm** - Sempris API integration
5. **SubProjectOrderForm** - Sublytics API with billing/shipping addresses

---

## Common Fields (All Forms)

These fields appear in multiple forms with the same semantic meaning but different naming conventions:

### Personal Information
| Semantic Meaning | PSONLINE | MI | Radius | Sempris | SubProject |
|-----------------|----------|----|--------|---------|------------|
| First Name | `firstName` | `firstName` | `firstName` | `first_name` | `bill_fname` |
| Last Name | `lastName` | `lastName` | `lastName` | `last_name` | `bill_lname` |
| Email | `email` | `email` | `email` | `email` | `email` |
| Phone | `phone` | `phoneNumber` | `phoneNumber` | `phone` | `phone` |
| Secondary Phone | `secondaryPhone` | ❌ | `secondaryPhoneNumber` | `secondary_phone` | ❌ |
| Date of Birth | `dob` | `dateOfBirth` | ❌ | ❌ | ❌ |

### Address Information
| Semantic Meaning | PSONLINE | MI | Radius | Sempris | SubProject |
|-----------------|----------|----|--------|---------|------------|
| Street Address Line 1 | `streetAddress` | `address1` | `address1` | `address1` | `bill_address1` |
| Street Address Line 2 / Apt | `apt` | `address2` | `address2` | `address2` | `bill_address2` |
| City | `city` | `city` | `city` | `city` | `bill_city` |
| State | `state` | `state` | `state` | `state` | `bill_state` |
| ZIP Code | `zipCode` | `zipCode` | `zipCode` | `zip` | `bill_zipcode` |

### Payment Information (Credit Card)
| Semantic Meaning | PSONLINE | MI | Radius | Sempris | SubProject |
|-----------------|----------|----|--------|---------|------------|
| Card Number | `cardNumber` | ❌ | `creditCardNumber` | `card_number` | `card_number` |
| Card Expiration | `expiryMonth` + `expiryYear` | ❌ | `creditCardExpiration` (MMYY) | `card_expiration` (MMYY) | `card_exp_month` + `card_exp_year` |
| CVV | `cvv` | ❌ | ❌ | `card_cvv` | `card_cvv` |
| Card Type/Issuer | ❌ | ❌ | ❌ | `issuer` | `card_type_id` |

---

## Extra/Unique Fields by Form

### PSONLINEOrderForm - Unique Fields
- **Product Selection**
  - `selectedProducts` (array) - Multiple products can be selected
  - `amount` - Calculated total amount
- **Personal Info**
  - `gender` - Gender field (M/F)
- **Payment**
  - `expiryMonth` - Separate month field
  - `expiryYear` - Separate year field
- **Special Features**
  - BIN reject list validation
  - State reject list (ME, IA, UT, MN, VT, KS, WI, MO)

### MIOrderForm - Unique Fields
- **Date**
  - `callDate` - Date of call
- **Bank Account Information**
  - `checkingAccountName` - Name on checking account
  - `bankName` - Bank name
  - `routingNumber` - 9-digit routing number
  - `checkingAccountNumber` - 10-12 digit account number
- **Consent/Confirmation**
  - `authorizedSigner` - YES/NO confirmation
  - `ageConfirmation` - YES confirmation (18-90)
  - `consent` - Object with:
    - `benefitsIdTheft` - Boolean
    - `myTelemedicine` - Boolean
- **Order Information**
  - `orderNumber` - Order number field
- **Special Features**
  - Restricted states: IA, WI, MS, MN

### RadiusOrderForm - Unique Fields
- **Date**
  - `orderDate` - Order date
- **Product Information**
  - `sourceCode` - Source code (default: 'R4N')
  - `sku` - SKU code (default: 'F11')
  - `productName` - Product name (default: 'Ear Plug')
- **Session**
  - `sessionId` - Random session ID
  - `project` - Project name (default: 'Radius Project')
- **Special Features**
  - Restricted states: IA, ME, MN, UT, VT, WI
  - Prepaid card BIN validation

### SemprisOrderForm - Unique Fields
- **Product Information**
  - `source` - Source code (fixed: '43254')
  - `sku` - SKU code (fixed: '103822')
- **Payment**
  - `issuer` - Card issuer (diners-club, discover, jcb, visa, mastercard, american-express)
- **Vendor/Tracking**
  - `vendor_id` - Vendor ID (default: 'STAR')
  - `tracking_number` - UUID tracking number
- **Special Features**
  - Fixed source and SKU values
  - Card issuer dropdown validation

### SubProjectOrderForm - Unique Fields
- **Order Configuration**
  - `user_id` - User ID (default: '37')
  - `connection_id` - Connection ID (default: '1')
  - `payment_method_id` - Payment method ID (default: '1')
  - `campaign_id` - Campaign ID (default: '1')
  - `offers` - Array of offers with `offer_id` and `order_offer_quantity`
  - `currency_id` - Currency ID (default: '1')
- **Billing Address**
  - `bill_organization` - Organization name (optional)
  - `bill_country` - Country field
- **Shipping Address** (Complete separate address)
  - `shipping_same` - Boolean toggle for same as billing
  - `ship_fname` - Shipping first name
  - `ship_lname` - Shipping last name
  - `ship_organization` - Shipping organization
  - `ship_country` - Shipping country
  - `ship_address1` - Shipping address line 1
  - `ship_address2` - Shipping address line 2
  - `ship_city` - Shipping city
  - `ship_state` - Shipping state
  - `ship_zipcode` - Shipping ZIP code
- **Payment**
  - `card_exp_month` - Separate expiration month
  - `card_exp_year` - Separate expiration year (YYYY format)
- **Tracking**
  - `tracking1` - Tracking code 1 (default: 'SA')
  - `tracking2` - Tracking code 2 (default: '01')
- **Special Features**
  - Restricted states: IA, OH, AK, HI, ME, MN, UT, VT, WI
  - Separate billing and shipping addresses
  - Email fallback to phone@noemail.com if email not provided

---

## Recommended Unified Form Structure

### Core Common Fields (Always Required)
1. **Personal Information**
   - First Name
   - Last Name
   - Email
   - Phone
   - Secondary Phone (Optional)
   - Date of Birth (Optional - only for PSOnline and MI)

2. **Billing Address**
   - Street Address Line 1
   - Street Address Line 2 / Apt (Optional)
   - City
   - State
   - ZIP Code

3. **Payment Information**
   - Payment Method Type (Credit Card / Bank Account / etc.)
   - Based on payment method, show relevant fields:
     - **Credit Card**: Card Number, Expiration (Month/Year or MMYY), CVV, Card Type/Issuer
     - **Bank Account**: Account Name, Bank Name, Routing Number, Account Number

### Conditional Fields (Show based on Order Type)

#### For PSOnline Orders:
- Product Selection (multi-select)
- Gender
- Amount (calculated)

#### For MI Orders:
- Call Date
- Bank Account Information (all fields)
- Authorized Signer Confirmation
- Age Confirmation
- Consent Checkboxes (Benefits ID Theft, Telemedicine)
- Order Number

#### For Radius Orders:
- Order Date
- Source Code
- SKU
- Product Name
- Session ID

#### For Sempris Orders:
- Source (fixed value)
- SKU (fixed value)
- Card Issuer
- Vendor ID
- Tracking Number

#### For SubProject Orders:
- User ID, Connection ID, Payment Method ID, Campaign ID
- Currency ID
- Offers (array)
- Shipping Address (if shipping_same = false)
- Organization (billing and shipping)
- Country (billing and shipping)
- Tracking codes

---

## Field Name Standardization Recommendations

### Suggested Standard Field Names:
```javascript
{
  // Personal Information
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  secondaryPhone?: string,
  dateOfBirth?: string,
  gender?: 'M' | 'F',
  
  // Address
  addressLine1: string,
  addressLine2?: string,
  city: string,
  state: string,
  zipCode: string,
  country?: string,
  organization?: string,
  
  // Payment - Credit Card
  cardNumber?: string,
  cardExpirationMonth?: string,
  cardExpirationYear?: string,
  cardExpirationMMYY?: string, // Alternative format
  cardCVV?: string,
  cardType?: string,
  cardIssuer?: string,
  
  // Payment - Bank Account
  accountName?: string,
  bankName?: string,
  routingNumber?: string,
  accountNumber?: string,
  
  // Order Specific
  orderType: 'psonline' | 'mi' | 'radius' | 'sempris' | 'subproject',
  orderDate?: string,
  callDate?: string,
  products?: Array<{id: number, name: string, price: number, quantity: number}>,
  sourceCode?: string,
  sku?: string,
  productName?: string,
  amount?: number,
  
  // Consent/Confirmation (MI specific)
  authorizedSigner?: 'YES' | 'NO',
  ageConfirmation?: 'YES',
  consent?: {
    benefitsIdTheft?: boolean,
    myTelemedicine?: boolean
  },
  
  // Shipping (SubProject specific)
  shippingSameAsBilling?: boolean,
  shippingAddress?: {
    firstName: string,
    lastName: string,
    organization?: string,
    country: string,
    addressLine1: string,
    addressLine2?: string,
    city: string,
    state: string,
    zipCode: string
  },
  
  // Tracking/Metadata
  sessionId?: string,
  trackingNumber?: string,
  tracking1?: string,
  tracking2?: string,
  vendorId?: string,
  orderNumber?: string
}
```

---

## Implementation Strategy

1. **Create a base form component** with all common fields
2. **Add conditional rendering** based on `orderType` prop
3. **Map field names** from unified structure to API-specific formats during submission
4. **Implement validation** rules per order type
5. **Handle state restrictions** per order type
6. **Support payment method switching** (Credit Card vs Bank Account)

---

## Notes

- **Date Formats**: Different forms use different date formats (MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY). Standardize to ISO 8601 (YYYY-MM-DD) internally.
- **Phone Numbers**: All forms expect 10-digit phone numbers. Some allow secondary phone, some don't.
- **Card Expiration**: Different formats:
  - PSOnline: Separate month and year
  - Radius/Sempris: MMYY format (4 digits)
  - SubProject: Separate month and year (YYYY format for year)
- **State Restrictions**: Each form has different restricted states. This should be handled per order type.
- **Required Fields**: Vary by order type. Implement dynamic validation based on selected order type.







