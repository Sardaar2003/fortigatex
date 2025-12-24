# Unified Form Structure - Technical Specification

## Field Mapping Table

### Personal Information Fields

| Unified Field Name | PSONLINE | MI | Radius | Sempris | SubProject | Notes |
|-------------------|----------|----|----|---------|------------|-------|
| `firstName` | `firstName` | `firstName` | `firstName` | `first_name` | `bill_fname` | Always required |
| `lastName` | `lastName` | `lastName` | `lastName` | `last_name` | `bill_lname` | Always required |
| `email` | `email` | `email` | `email` | `email` | `email` | Required in all except SubProject (optional) |
| `phone` | `phone` | `phoneNumber` | `phoneNumber` | `phone` | `phone` | Always required, 10 digits |
| `secondaryPhone` | `secondaryPhone` | - | `secondaryPhoneNumber` | `secondary_phone` | - | Optional |
| `dateOfBirth` | `dob` | `dateOfBirth` | - | - | - | Optional, required for PSONLINE/MI |
| `gender` | `gender` | - | - | - | - | Optional, M/F for PSONLINE |

### Address Fields (Billing)

| Unified Field Name | PSONLINE | MI | Radius | Sempris | SubProject | Notes |
|-------------------|----------|----|----|---------|------------|-------|
| `addressLine1` | `streetAddress` | `address1` | `address1` | `address1` | `bill_address1` | Always required |
| `addressLine2` | `apt` | `address2` | `address2` | `address2` | `bill_address2` | Optional |
| `city` | `city` | `city` | `city` | `city` | `bill_city` | Always required |
| `state` | `state` | `state` | `state` | `state` | `bill_state` | Always required, 2-letter code |
| `zipCode` | `zipCode` | `zipCode` | `zipCode` | `zip` | `bill_zipcode` | Always required |
| `country` | - | - | - | - | `bill_country` | Required for SubProject |
| `organization` | - | - | - | - | `bill_organization` | Optional for SubProject |

### Payment Fields - Credit Card

| Unified Field Name | PSONLINE | MI | Radius | Sempris | SubProject | Notes |
|-------------------|----------|----|----|---------|------------|-------|
| `cardNumber` | `cardNumber` | - | `creditCardNumber` | `card_number` | `card_number` | 13-16 digits |
| `cardExpirationMonth` | `expiryMonth` | - | - | - | `card_exp_month` | 01-12 |
| `cardExpirationYear` | `expiryYear` | - | - | - | `card_exp_year` | YYYY format |
| `cardExpirationMMYY` | - | - | `creditCardExpiration` | `card_expiration` | - | MMYY format (4 digits) |
| `cardCVV` | `cvv` | - | - | `card_cvv` | `card_cvv` | 3-4 digits |
| `cardType` | - | - | - | - | `card_type_id` | 1=Mastercard, 2=Visa, 3=Discover, 4=Amex |
| `cardIssuer` | - | - | - | `issuer` | - | diners-club, discover, jcb, visa, mastercard, american-express |

### Payment Fields - Bank Account (MI Only)

| Unified Field Name | MI Field Name | Notes |
|-------------------|---------------|-------|
| `accountName` | `checkingAccountName` | Name on account |
| `bankName` | `bankName` | Bank name |
| `routingNumber` | `routingNumber` | 9 digits |
| `accountNumber` | `checkingAccountNumber` | 10-12 digits |

### Order-Specific Fields

#### PSONLINE
| Unified Field Name | PSONLINE Field Name | Notes |
|-------------------|---------------------|-------|
| `products` | `selectedProducts` | Array of product IDs |
| `amount` | `amount` | Calculated total |

#### MI
| Unified Field Name | MI Field Name | Notes |
|-------------------|---------------|-------|
| `callDate` | `callDate` | Date of call |
| `orderNumber` | `orderNumber` | Order number |
| `authorizedSigner` | `authorizedSigner` | YES/NO |
| `ageConfirmation` | `ageConfirmation` | YES |
| `consent.benefitsIdTheft` | `consent.benefitsIdTheft` | Boolean |
| `consent.myTelemedicine` | `consent.myTelemedicine` | Boolean |

#### Radius
| Unified Field Name | Radius Field Name | Notes |
|-------------------|-------------------|-------|
| `orderDate` | `orderDate` | Order date |
| `sourceCode` | `sourceCode` | Default: R4N |
| `sku` | `sku` | Default: F11 |
| `productName` | `productName` | Default: Ear Plug |
| `sessionId` | `sessionId` | Random session ID |
| `project` | `project` | Default: Radius Project |

#### Sempris
| Unified Field Name | Sempris Field Name | Notes |
|-------------------|---------------------|-------|
| `source` | `source` | Fixed: 43254 |
| `sku` | `sku` | Fixed: 103822 |
| `vendorId` | `vendor_id` | Default: STAR |
| `trackingNumber` | `tracking_number` | UUID |

#### SubProject
| Unified Field Name | SubProject Field Name | Notes |
|-------------------|----------------------|-------|
| `userId` | `user_id` | Default: 37 |
| `connectionId` | `connection_id` | Default: 1 |
| `paymentMethodId` | `payment_method_id` | Default: 1 |
| `campaignId` | `campaign_id` | Default: 1 |
| `offers` | `offers` | Array: [{offer_id, order_offer_quantity}] |
| `currencyId` | `currency_id` | Default: 1 |
| `shippingSameAsBilling` | `shipping_same` | Boolean |
| `shippingAddress` | `ship_*` fields | Complete shipping address object |
| `tracking1` | `tracking1` | Default: SA |
| `tracking2` | `tracking2` | Default: 01 |

---

## Unified Form Data Structure

```typescript
interface UnifiedFormData {
  // Order Type
  orderType: 'psonline' | 'mi' | 'radius' | 'sempris' | 'subproject';
  
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  dateOfBirth?: string; // ISO format: YYYY-MM-DD
  gender?: 'M' | 'F';
  
  // Billing Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  organization?: string;
  
  // Payment Method Selection
  paymentMethod: 'creditCard' | 'bankAccount';
  
  // Credit Card Fields
  cardNumber?: string;
  cardExpirationMonth?: string; // 01-12
  cardExpirationYear?: string; // YYYY
  cardExpirationMMYY?: string; // MMYY (4 digits)
  cardCVV?: string;
  cardType?: string; // For SubProject: '1' | '2' | '3' | '4'
  cardIssuer?: string; // For Sempris
  
  // Bank Account Fields (MI only)
  accountName?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  
  // Order-Specific Fields
  // PSONLINE
  products?: number[]; // Array of product IDs
  amount?: number;
  
  // MI
  callDate?: string;
  orderNumber?: string;
  authorizedSigner?: 'YES' | 'NO';
  ageConfirmation?: 'YES';
  consent?: {
    benefitsIdTheft?: boolean;
    myTelemedicine?: boolean;
  };
  
  // Radius
  orderDate?: string;
  sourceCode?: string;
  sku?: string;
  productName?: string;
  sessionId?: string;
  project?: string;
  
  // Sempris
  source?: string;
  vendorId?: string;
  trackingNumber?: string;
  
  // SubProject
  userId?: string;
  connectionId?: string;
  paymentMethodId?: string;
  campaignId?: string;
  offers?: Array<{
    offer_id: number;
    order_offer_quantity: number;
  }>;
  currencyId?: string;
  shippingSameAsBilling?: boolean;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    organization?: string;
    country: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  tracking1?: string;
  tracking2?: string;
}
```

---

## Field Transformation Functions

### Transform to PSONLINE Format

```javascript
function transformToPSOnline(unifiedData) {
  return {
    domain: 'fortigatex.onrender.com',
    buildorder: 1,
    capture_delay: 0,
    card_num: unifiedData.cardNumber?.replace(/\s/g, ''),
    card_expm: unifiedData.cardExpirationMonth,
    card_expy: unifiedData.cardExpirationYear,
    card_cvv: unifiedData.cardCVV,
    CustomerFirstName: unifiedData.firstName,
    CustomerLastName: unifiedData.lastName,
    BillingStreetAddress: unifiedData.addressLine1,
    BillingApt: unifiedData.addressLine2 || '',
    BillingCity: unifiedData.city,
    BillingState: unifiedData.state,
    BillingZipCode: unifiedData.zipCode,
    Email: unifiedData.email,
    BillingHomePhone: unifiedData.phone.replace(/\D/g, '').slice(0, 10),
    amount: unifiedData.amount,
    ProductCount: unifiedData.products?.length || 0,
    DOB: unifiedData.dateOfBirth ? formatDateMMDDYYYY(unifiedData.dateOfBirth) : '',
    Gender: unifiedData.gender,
    FormOfPayment: 'card',
    // Add product fields
    ...unifiedData.products?.reduce((acc, productId, index) => {
      acc[`productid_${index + 1}`] = productId;
      acc[`productqty_${index + 1}`] = 1;
      return acc;
    }, {})
  };
}
```

### Transform to MI Format

```javascript
function transformToMI(unifiedData) {
  return {
    callDate: formatDateMMDDYYYY(unifiedData.callDate),
    firstName: unifiedData.firstName,
    lastName: unifiedData.lastName,
    address1: unifiedData.addressLine1,
    address2: unifiedData.addressLine2 || '',
    city: unifiedData.city,
    state: unifiedData.state,
    zipCode: unifiedData.zipCode,
    phoneNumber: unifiedData.phone,
    checkingAccountName: unifiedData.accountName,
    bankName: unifiedData.bankName,
    routingNumber: unifiedData.routingNumber,
    checkingAccountNumber: unifiedData.accountNumber,
    authorizedSigner: unifiedData.authorizedSigner,
    ageConfirmation: unifiedData.ageConfirmation,
    email: unifiedData.email,
    dateOfBirth: formatDateMMDDYYYY(unifiedData.dateOfBirth),
    consent: unifiedData.consent || {},
    orderNumber: unifiedData.orderNumber
  };
}
```

### Transform to Radius Format

```javascript
function transformToRadius(unifiedData) {
  return {
    orderDate: formatDateMMDDYYYY(unifiedData.orderDate),
    firstName: unifiedData.firstName,
    lastName: unifiedData.lastName,
    address1: unifiedData.addressLine1,
    address2: unifiedData.addressLine2 || '',
    city: unifiedData.city,
    state: unifiedData.state,
    zipCode: unifiedData.zipCode,
    phoneNumber: unifiedData.phone,
    secondaryPhoneNumber: unifiedData.secondaryPhone || '',
    email: unifiedData.email,
    sourceCode: unifiedData.sourceCode || 'R4N',
    sku: unifiedData.sku || 'F11',
    productName: unifiedData.productName || 'Ear Plug',
    creditCardNumber: unifiedData.cardNumber,
    creditCardExpiration: unifiedData.cardExpirationMMYY,
    sessionId: unifiedData.sessionId || generateSessionId(),
    project: unifiedData.project || 'Radius Project'
  };
}
```

### Transform to Sempris Format

```javascript
function transformToSempris(unifiedData) {
  return {
    first_name: unifiedData.firstName,
    last_name: unifiedData.lastName,
    address1: unifiedData.addressLine1,
    address2: unifiedData.addressLine2 || '',
    city: unifiedData.city,
    state: unifiedData.state,
    zip: unifiedData.zipCode,
    phone: unifiedData.phone,
    secondary_phone: unifiedData.secondaryPhone || '',
    email: unifiedData.email,
    source: unifiedData.source || '43254',
    sku: unifiedData.sku || '103822',
    card_number: unifiedData.cardNumber,
    card_expiration: unifiedData.cardExpirationMMYY,
    card_cvv: unifiedData.cardCVV,
    issuer: unifiedData.cardIssuer,
    vendor_id: unifiedData.vendorId || 'STAR',
    tracking_number: unifiedData.trackingNumber || crypto.randomUUID()
  };
}
```

### Transform to SubProject Format

```javascript
function transformToSubProject(unifiedData) {
  const baseData = {
    user_id: unifiedData.userId || '37',
    connection_id: unifiedData.connectionId || '1',
    payment_method_id: unifiedData.paymentMethodId || '1',
    campaign_id: unifiedData.campaignId || '1',
    offers: unifiedData.offers || [{ offer_id: 40, order_offer_quantity: 1 }],
    currency_id: unifiedData.currencyId || '1',
    email: unifiedData.email || (unifiedData.phone ? `${unifiedData.phone}@noemail.com` : ''),
    phone: unifiedData.phone,
    bill_fname: unifiedData.firstName,
    bill_lname: unifiedData.lastName,
    bill_organization: unifiedData.organization || '',
    bill_country: unifiedData.country || '',
    bill_address1: unifiedData.addressLine1,
    bill_address2: unifiedData.addressLine2 || '',
    bill_city: unifiedData.city,
    bill_state: unifiedData.state,
    bill_zipcode: unifiedData.zipCode,
    shipping_same: unifiedData.shippingSameAsBilling !== false,
    card_type_id: unifiedData.cardType,
    card_number: unifiedData.cardNumber,
    card_cvv: unifiedData.cardCVV,
    card_exp_month: unifiedData.cardExpirationMonth,
    card_exp_year: unifiedData.cardExpirationYear,
    tracking1: unifiedData.tracking1 || 'SA',
    tracking2: unifiedData.tracking2 || '01'
  };
  
  // Add shipping address if different from billing
  if (!unifiedData.shippingSameAsBilling && unifiedData.shippingAddress) {
    baseData.ship_fname = unifiedData.shippingAddress.firstName;
    baseData.ship_lname = unifiedData.shippingAddress.lastName;
    baseData.ship_organization = unifiedData.shippingAddress.organization || '';
    baseData.ship_country = unifiedData.shippingAddress.country;
    baseData.ship_address1 = unifiedData.shippingAddress.addressLine1;
    baseData.ship_address2 = unifiedData.shippingAddress.addressLine2 || '';
    baseData.ship_city = unifiedData.shippingAddress.city;
    baseData.ship_state = unifiedData.shippingAddress.state;
    baseData.ship_zipcode = unifiedData.shippingAddress.zipCode;
  }
  
  return baseData;
}
```

---

## Validation Rules by Order Type

### Common Validations (All Forms)
- firstName: Required, 1-30 characters
- lastName: Required, 1-30 characters
- email: Valid email format (optional for SubProject)
- phone: Required, exactly 10 digits
- addressLine1: Required, 1-50 characters
- city: Required, 1-30 characters
- state: Required, 2-letter code
- zipCode: Required, 5 or 9 digits

### PSONLINE Validations
- dateOfBirth: Optional, MM/DD/YYYY format
- gender: Optional, M or F
- cardNumber: Required, 15-16 digits
- cardExpirationMonth: Required, 01-12
- cardExpirationYear: Required, 4 digits
- cardCVV: Required, 3-4 digits
- products: Required, at least one selected
- amount: Required, calculated from products
- State restrictions: ME, IA, UT, MN, VT, KS, WI, MO
- BIN reject list: Check first 6 digits of card number

### MI Validations
- dateOfBirth: Required, MM/DD/YYYY format
- callDate: Required, MM/DD/YYYY format
- accountName: Required
- bankName: Required
- routingNumber: Required, exactly 9 digits
- accountNumber: Required, 10-12 digits
- authorizedSigner: Required, must be 'YES'
- ageConfirmation: Required, must be 'YES'
- consent: Required, at least one service selected
- orderNumber: Required
- State restrictions: IA, WI, MS, MN

### Radius Validations
- orderDate: Required, MM/DD/YYYY format
- sourceCode: Required, default 'R4N'
- sku: Required, default 'F11'
- productName: Required
- cardNumber: Required, 13-16 digits
- cardExpirationMMYY: Required, MMYY format (4 digits)
- State restrictions: IA, ME, MN, UT, VT, WI
- Prepaid card BIN validation

### Sempris Validations
- source: Fixed value '43254'
- sku: Fixed value '103822'
- cardNumber: Required, 13-16 digits
- cardExpirationMMYY: Required, MMYY format (4 digits)
- cardCVV: Required, 3-4 digits
- cardIssuer: Required, must be one of valid issuers
- vendorId: Default 'STAR'
- trackingNumber: Auto-generated UUID

### SubProject Validations
- country: Required for billing address
- cardType: Required, 1-4
- cardNumber: Required, 13-16 digits
- cardExpirationMonth: Required, 01-12
- cardExpirationYear: Required, YYYY format
- cardCVV: Required, 3-4 digits
- shippingAddress: Required if shippingSameAsBilling is false
- State restrictions: IA, OH, AK, HI, ME, MN, UT, VT, WI
- Email fallback: Use phone@noemail.com if email not provided

---

## Implementation Checklist

- [ ] Create unified form component with order type selector
- [ ] Implement dynamic field rendering based on order type
- [ ] Add payment method selector (Credit Card vs Bank Account)
- [ ] Implement field name standardization
- [ ] Create transformation functions for each order type
- [ ] Implement order-type-specific validation
- [ ] Handle state restrictions per order type
- [ ] Add conditional shipping address section
- [ ] Implement date format conversion utilities
- [ ] Add card expiration format handling (separate vs MMYY)
- [ ] Implement BIN validation for PSONLINE
- [ ] Add consent/confirmation sections for MI
- [ ] Handle product selection for PSONLINE
- [ ] Implement email fallback for SubProject
- [ ] Add session ID generation for Radius
- [ ] Implement tracking number generation for Sempris







