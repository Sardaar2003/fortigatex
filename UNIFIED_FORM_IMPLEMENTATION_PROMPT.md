# Unified Order Form System - Implementation Prompt

## Objective
Create a unified order form system that consolidates 5 different order forms (PSONLINE, MI, Radius, Sempris, SubProject) into a single, dynamic form component. The system should handle frontend form rendering, validation, field mapping, and backend API transformation for each order type.

---

## System Architecture Overview

### Flow
1. **User selects order type** → Determines which fields to show and validation rules
2. **Dynamic form rendering** → Shows common fields + order-type-specific fields
3. **Form validation** → Applies order-type-specific validation rules
4. **Field transformation** → Maps unified field names to API-specific formats
5. **API submission** → Sends data to appropriate backend endpoint

### Components Required
- **Frontend**: Unified form component with dynamic field rendering
- **Backend**: Route handlers that transform unified data to API-specific formats
- **Validation**: Order-type-specific validation schemas
- **Field Mapping**: Transformation functions for each order type

---

## Form Types and Their Characteristics

### 1. PSONLINE Order Form

#### Purpose
Process orders with product selection and credit card payment via PSOnline API.

#### Flow
1. User selects one or more products (multi-select)
2. Amount is automatically calculated from selected products
3. User fills personal info, address, and payment details
4. System validates BIN reject list and state restrictions
5. Submits to `/api/orders/psonline`

#### Fixed Values
- `domain`: 'fortigatex.onrender.com'
- `buildorder`: 1
- `capture_delay`: 0
- `FormOfPayment`: 'card'
- Products: 
  - ID 43: 'ID Theft' - $3.82
  - ID 46: 'Telemed' - $3.78

#### Required Fields
- `firstName` (CustomerFirstName)
- `lastName` (CustomerLastName)
- `email` (Email)
- `phone` (BillingHomePhone) - 10 digits
- `addressLine1` (BillingStreetAddress)
- `city` (BillingCity)
- `state` (BillingState)
- `zipCode` (BillingZipCode)
- `cardNumber` (card_num) - 15-16 digits
- `cardExpirationMonth` (card_expm) - 01-12
- `cardExpirationYear` (card_expy) - 4 digits
- `cardCVV` (card_cvv) - 3-4 digits
- `products` (selectedProducts) - At least one product
- `amount` - Calculated from products

#### Optional Fields
- `secondaryPhone` (secondaryPhone)
- `dateOfBirth` (DOB) - MM/DD/YYYY format
- `gender` (Gender) - 'M' or 'F'
- `addressLine2` (BillingApt)

#### Validation Rules
- **Card Number**: 15-16 digits, must not start with rejected BINs
- **CVV**: 3-4 digits
- **Phone**: Exactly 10 digits (digits only)
- **Email**: Valid email format
- **DOB**: MM/DD/YYYY format if provided
- **Gender**: 'M' or 'F' if provided
- **State Restrictions**: Cannot be ME, IA, UT, MN, VT, KS, WI, MO
- **BIN Reject List**: Check first 6 digits of card number against rejected BINs list (extensive list - see code)
- **Products**: At least one product must be selected
- **Amount**: Must match sum of selected product prices

#### Special Features
- Multi-product selection with automatic amount calculation
- BIN rejection validation (check first 6 digits)
- State restriction validation
- Product fields generated dynamically: `productid_1`, `productqty_1`, etc.

#### Backend Transformation
```javascript
{
  domain: 'fortigatex.onrender.com',
  buildorder: 1,
  capture_delay: 0,
  card_num: cardNumber.replace(/\s/g, ''),
  card_expm: expiryMonth,
  card_expy: expiryYear,
  card_cvv: cvv,
  CustomerFirstName: firstName,
  CustomerLastName: lastName,
  BillingStreetAddress: addressLine1,
  BillingApt: addressLine2 || '',
  BillingCity: city,
  BillingState: state,
  BillingZipCode: zipCode,
  Email: email,
  BillingHomePhone: phone.replace(/\D/g, '').slice(0, 10),
  amount: amount,
  ProductCount: products.length,
  DOB: dateOfBirth ? formatMMDDYYYY(dateOfBirth) : '',
  Gender: gender || '',
  FormOfPayment: 'card',
  // Dynamic product fields
  productid_1: products[0].id,
  productqty_1: 1,
  // ... for each product
}
```

#### API Endpoint
- **URL**: `/api/orders/psonline`
- **Method**: POST
- **Headers**: Authorization Bearer token, Content-Type: application/json

---

### 2. MI Order Form

#### Purpose
Process orders with bank account (ACH) payment for MI Project.

#### Flow
1. User fills call date and personal information
2. User fills billing address
3. User fills bank account information (checking account)
4. User confirms authorized signer and age
5. User selects consent checkboxes (at least one required)
6. User enters order number
7. Submits to `/api/orders/mi`

#### Fixed Values
- `authorizedSigner`: Default 'YES' (must be YES)
- `ageConfirmation`: Default 'YES' (must be YES)

#### Required Fields
- `callDate` - MM/DD/YYYY format
- `firstName`
- `lastName`
- `addressLine1` (address1)
- `city`
- `state`
- `zipCode`
- `phoneNumber` - 10 digits
- `email`
- `dateOfBirth` - MM/DD/YYYY format
- `checkingAccountName` (accountName)
- `bankName`
- `routingNumber` - Exactly 9 digits
- `checkingAccountNumber` (accountNumber) - 10-12 digits
- `authorizedSigner` - Must be 'YES'
- `ageConfirmation` - Must be 'YES'
- `consent` - At least one service must be selected:
  - `benefitsIdTheft` (boolean)
  - `myTelemedicine` (boolean)
- `orderNumber`

#### Optional Fields
- `addressLine2` (address2)

#### Validation Rules
- **Call Date**: Valid date, MM/DD/YYYY format
- **Date of Birth**: Valid date, MM/DD/YYYY format
- **Phone**: Exactly 10 digits
- **Email**: Valid email format
- **Routing Number**: Exactly 9 digits
- **Account Number**: 10-12 digits
- **First Name**: Max 30 characters
- **Last Name**: Max 30 characters
- **Address1**: Max 50 characters
- **Address2**: Max 50 characters
- **City**: Max 30 characters
- **State Restrictions**: Cannot be IA, WI, MS, MN
- **Authorized Signer**: Must be exactly 'YES'
- **Age Confirmation**: Must be exactly 'YES'
- **Consent**: At least one checkbox must be checked

#### Special Features
- Bank account payment (not credit card)
- Consent checkboxes with descriptions
- Authorized signer and age confirmations (radio buttons, must be YES)
- State restriction validation
- Order number field

#### Backend Transformation
```javascript
{
  callDate: formatMMDDYYYY(callDate),
  firstName: firstName,
  lastName: lastName,
  address1: addressLine1,
  address2: addressLine2 || '',
  city: city,
  state: state,
  zipCode: zipCode,
  phoneNumber: phoneNumber,
  checkingAccountName: accountName,
  bankName: bankName,
  routingNumber: routingNumber,
  checkingAccountNumber: accountNumber,
  authorizedSigner: authorizedSigner, // Must be 'YES'
  ageConfirmation: ageConfirmation, // Must be 'YES'
  email: email,
  dateOfBirth: formatMMDDYYYY(dateOfBirth),
  consent: {
    benefitsIdTheft: consent.benefitsIdTheft || false,
    myTelemedicine: consent.myTelemedicine || false
  },
  orderNumber: orderNumber
}
```

#### API Endpoint
- **URL**: `/api/orders/mi`
- **Method**: POST
- **Headers**: Authorization Bearer token, Content-Type: application/json

---

### 3. Radius Order Form

#### Purpose
Process orders with credit card payment for Radius Project (Ear Plug product).

#### Flow
1. User selects order date
2. User fills personal information and address
3. User fills product information (mostly fixed values)
4. User fills credit card information
5. System generates session ID
6. Submits to `/api/orders/radius`

#### Fixed Values
- `sourceCode`: 'R4N' (read-only)
- `sku`: 'F11' (read-only)
- `productName`: 'Ear Plug' (editable but has default)
- `project`: 'Radius Project'
- `sessionId`: Auto-generated random string

#### Required Fields
- `orderDate` - MM/DD/YYYY format
- `firstName`
- `lastName`
- `addressLine1` (address1)
- `city`
- `state`
- `zipCode`
- `phoneNumber` - 10 digits
- `sourceCode` - Fixed 'R4N'
- `sku` - Fixed 'F11'
- `productName`
- `creditCardNumber` (cardNumber) - 13-16 digits
- `creditCardExpiration` (cardExpirationMMYY) - MMYY format (4 digits)

#### Optional Fields
- `secondaryPhoneNumber` (secondaryPhone) - 10 digits
- `email`
- `addressLine2` (address2)

#### Validation Rules
- **Order Date**: Valid date, converted to MM/DD/YYYY format
- **Phone**: Exactly 10 digits
- **Secondary Phone**: Exactly 10 digits if provided
- **Email**: Valid email format if provided
- **Card Number**: 13-16 digits
- **Card Expiration**: MMYY format (4 digits), e.g., "1225" for December 2025
- **First Name**: Max 30 characters
- **Last Name**: Max 30 characters
- **Address1**: Max 50 characters
- **Address2**: Max 50 characters
- **City**: Max 30 characters
- **ZIP Code**: 5 or 9 digits
- **State Restrictions**: Cannot be IA, ME, MN, UT, VT, WI
- **Source Code**: Max 6 characters
- **SKU**: Max 7 characters
- **Prepaid Card BINs**: Check if card starts with prepaid BINs (optional validation)

#### Special Features
- Fixed source code and SKU (read-only fields)
- MMYY expiration format (not separate month/year)
- Session ID auto-generation
- State restriction validation
- Prepaid card BIN validation (optional)

#### Backend Transformation
```javascript
{
  orderDate: formatMMDDYYYY(orderDate), // Convert to MM/DD/YYYY
  firstName: firstName,
  lastName: lastName,
  address1: addressLine1,
  address2: addressLine2 || '',
  city: city,
  state: state,
  zipCode: zipCode,
  phoneNumber: phoneNumber,
  secondaryPhoneNumber: secondaryPhone || '',
  email: email || '',
  sourceCode: sourceCode || 'R4N',
  sku: sku || 'F11',
  productName: productName || 'Ear Plug',
  creditCardNumber: cardNumber,
  creditCardExpiration: cardExpirationMMYY, // MMYY format
  sessionId: sessionId || generateSessionId(),
  project: project || 'Radius Project'
}
```

#### API Endpoint
- **URL**: `/api/orders/radius`
- **Method**: POST
- **Headers**: Authorization Bearer token, Content-Type: application/json

---

### 4. Sempris Order Form

#### Purpose
Process orders with credit card payment via Sempris API.

#### Flow
1. User fills personal information and address
2. System auto-fills source and SKU (fixed values)
3. User fills credit card information including card issuer
4. System generates tracking number (UUID)
5. Submits to `/api/orders/sempris`

#### Fixed Values
- `source`: '43254' (read-only, fixed)
- `sku`: '103822' (read-only, fixed)
- `vendor_id`: 'STAR'
- `tracking_number`: Auto-generated UUID

#### Required Fields
- `first_name` (firstName)
- `last_name` (lastName)
- `address1` (addressLine1)
- `city`
- `state` - 2-letter code
- `zip` (zipCode) - 5 or 9 digits
- `phone` - Exactly 10 digits
- `source` - Fixed '43254'
- `sku` - Fixed '103822'
- `card_number` (cardNumber) - 13-16 digits
- `card_expiration` (cardExpirationMMYY) - MMYY format (4 digits)
- `card_cvv` (cardCVV) - 3-4 digits
- `issuer` (cardIssuer) - Must be one of: diners-club, discover, jcb, visa, mastercard, american-express

#### Optional Fields
- `address2` (addressLine2)
- `secondary_phone` (secondaryPhone) - 10 digits
- `email`

#### Validation Rules
- **First Name**: 1-30 characters
- **Last Name**: 1-30 characters
- **Address1**: 1-50 characters
- **Address2**: Max 50 characters
- **City**: 1-30 characters
- **State**: Exactly 2 characters
- **ZIP**: 5 or 9 digits
- **Phone**: Exactly 10 digits
- **Secondary Phone**: Exactly 10 digits if provided
- **Source**: 1-6 characters (fixed at '43254')
- **SKU**: 1-7 characters (fixed at '103822')
- **Card Number**: 13-16 digits
- **Card Expiration**: MMYY format (4 digits)
- **CVV**: 3-4 digits
- **Card Issuer**: Must be valid issuer from dropdown list
- **Email**: Valid email format if provided

#### Special Features
- Fixed source and SKU values (cannot be edited)
- Card issuer dropdown with specific values
- UUID tracking number generation
- Vendor ID field
- Snake_case field naming convention

#### Backend Transformation
```javascript
{
  first_name: firstName,
  last_name: lastName,
  address1: addressLine1,
  address2: addressLine2 || '',
  city: city,
  state: state,
  zip: zipCode,
  phone: phone,
  secondary_phone: secondaryPhone || '',
  email: email || '',
  source: '43254', // Fixed
  sku: '103822', // Fixed
  card_number: cardNumber,
  card_expiration: cardExpirationMMYY, // MMYY format
  card_cvv: cardCVV,
  issuer: cardIssuer, // Required dropdown selection
  vendor_id: 'STAR',
  tracking_number: trackingNumber || crypto.randomUUID()
}
```

#### API Endpoint
- **URL**: `/api/orders/sempris`
- **Method**: POST
- **Headers**: Authorization Bearer token, Content-Type: application/json

---

### 5. SubProject Order Form

#### Purpose
Process orders with credit card payment via Sublytics API. Supports separate billing and shipping addresses.

#### Flow
1. User fills personal information
2. User fills billing address (with country and organization)
3. User toggles shipping address (same as billing or different)
4. If different, user fills shipping address
5. User fills credit card information
6. System uses fixed values for order configuration
7. Submits to `/api/orders/sublytics`

#### Fixed Values
- `user_id`: '37'
- `connection_id`: '1'
- `payment_method_id`: '1'
- `campaign_id`: '1'
- `currency_id`: '1'
- `offers`: [{ offer_id: 40, order_offer_quantity: 1 }]
- `tracking1`: 'SA'
- `tracking2`: '01'
- `shipping_same`: true (default)

#### Required Fields
- `bill_fname` (firstName)
- `bill_lname` (lastName)
- `bill_address1` (addressLine1)
- `bill_city` (city)
- `bill_state` (state)
- `bill_zipcode` (zipCode)
- `bill_country` (country)
- `phone`
- `card_type_id` (cardType) - 1=Mastercard, 2=Visa, 3=Discover, 4=Amex
- `card_number` (cardNumber) - 13-16 digits
- `card_exp_month` (cardExpirationMonth) - 01-12
- `card_exp_year` (cardExpirationYear) - YYYY format (4 digits)
- `card_cvv` (cardCVV) - 3-4 digits

#### Conditionally Required Fields
- If `shipping_same` is false, shipping address fields are required:
  - `ship_fname` (shippingAddress.firstName)
  - `ship_lname` (shippingAddress.lastName)
  - `ship_address1` (shippingAddress.addressLine1)
  - `ship_city` (shippingAddress.city)
  - `ship_state` (shippingAddress.state)
  - `ship_zipcode` (shippingAddress.zipCode)
  - `ship_country` (shippingAddress.country)

#### Optional Fields
- `email` - If not provided, falls back to `phone@noemail.com`
- `bill_address2` (addressLine2)
- `bill_organization` (organization)
- `ship_address2` (shippingAddress.addressLine2)
- `ship_organization` (shippingAddress.organization)

#### Validation Rules
- **First Name**: Max 30 characters
- **Last Name**: Max 30 characters
- **Phone**: Exactly 10 digits
- **Email**: Valid email format if provided (optional, has fallback)
- **Address1**: Max 50 characters
- **Address2**: Max 50 characters
- **City**: Max 30 characters
- **ZIP Code**: Max 10 characters
- **Country**: Max 56 characters (required for billing)
- **Organization**: Max 56 characters
- **Card Number**: 13-16 digits
- **Card Expiration Month**: 01-12
- **Card Expiration Year**: YYYY format (4 digits)
- **CVV**: 3-4 digits
- **Card Type**: Must be 1, 2, 3, or 4
- **State Restrictions**: Cannot be IA, OH, AK, HI, ME, MN, UT, VT, WI
- **Shipping Address**: All fields required if shipping_same is false

#### Special Features
- Separate billing and shipping addresses
- Toggle for "shipping same as billing"
- Country field (required for billing, required for shipping if different)
- Organization field (optional)
- Email fallback logic (phone@noemail.com if email not provided)
- Card type dropdown (1-4 mapping to card brands)
- Separate expiration month and year (YYYY format for year)
- Tracking codes (tracking1, tracking2)
- Order configuration fields (user_id, connection_id, etc.)

#### Backend Transformation
```javascript
{
  user_id: '37',
  connection_id: '1',
  payment_method_id: '1',
  campaign_id: '1',
  offers: [{ offer_id: 40, order_offer_quantity: 1 }],
  currency_id: '1',
  email: email || (phone ? `${phone}@noemail.com` : ''),
  phone: phone,
  bill_fname: firstName,
  bill_lname: lastName,
  bill_organization: organization || '',
  bill_country: country,
  bill_address1: addressLine1,
  bill_address2: addressLine2 || '',
  bill_city: city,
  bill_state: state,
  bill_zipcode: zipCode,
  shipping_same: shippingSameAsBilling !== false,
  card_type_id: cardType,
  card_number: cardNumber,
  card_cvv: cardCVV,
  card_exp_month: cardExpirationMonth,
  card_exp_year: cardExpirationYear,
  tracking1: 'SA',
  tracking2: '01',
  // Shipping address (only if shipping_same is false)
  ...(shippingSameAsBilling === false && shippingAddress ? {
    ship_fname: shippingAddress.firstName,
    ship_lname: shippingAddress.lastName,
    ship_organization: shippingAddress.organization || '',
    ship_country: shippingAddress.country,
    ship_address1: shippingAddress.addressLine1,
    ship_address2: shippingAddress.addressLine2 || '',
    ship_city: shippingAddress.city,
    ship_state: shippingAddress.state,
    ship_zipcode: shippingAddress.zipCode
  } : {})
}
```

#### API Endpoint
- **URL**: `/api/orders/sublytics`
- **Method**: POST
- **Headers**: Authorization Bearer token, Content-Type: application/json

---

## Unified Form Structure

### Form State Structure
```typescript
interface UnifiedFormData {
  // Order Type Selection
  orderType: 'psonline' | 'mi' | 'radius' | 'sempris' | 'subproject';
  
  // Personal Information (Common)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  dateOfBirth?: string; // ISO format: YYYY-MM-DD (internal), converted for API
  gender?: 'M' | 'F';
  
  // Billing Address (Common)
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string; // Required for SubProject
  organization?: string; // For SubProject
  
  // Payment Method Selection
  paymentMethod: 'creditCard' | 'bankAccount';
  
  // Credit Card Fields
  cardNumber?: string;
  cardExpirationMonth?: string; // 01-12
  cardExpirationYear?: string; // YYYY format
  cardExpirationMMYY?: string; // MMYY format (4 digits)
  cardCVV?: string;
  cardType?: string; // For SubProject: '1' | '2' | '3' | '4'
  cardIssuer?: string; // For Sempris
  
  // Bank Account Fields (MI only)
  accountName?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  
  // PSONLINE Specific
  selectedProducts?: number[]; // Array of product IDs
  amount?: number; // Calculated
  
  // MI Specific
  callDate?: string;
  orderNumber?: string;
  authorizedSigner?: 'YES' | 'NO';
  ageConfirmation?: 'YES';
  consent?: {
    benefitsIdTheft?: boolean;
    myTelemedicine?: boolean;
  };
  
  // Radius Specific
  orderDate?: string;
  sourceCode?: string;
  sku?: string;
  productName?: string;
  sessionId?: string;
  project?: string;
  
  // Sempris Specific
  source?: string;
  vendorId?: string;
  trackingNumber?: string;
  
  // SubProject Specific
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

## Common Fields Standardization

### Field Name Mapping

| Unified Name | Display Label | Validation | Required For |
|--------------|---------------|------------|--------------|
| `firstName` | First Name | 1-30 chars | All forms |
| `lastName` | Last Name | 1-30 chars | All forms |
| `email` | Email | Valid email | All except SubProject (optional) |
| `phone` | Phone Number | 10 digits | All forms |
| `secondaryPhone` | Secondary Phone | 10 digits | PSONLINE, Radius, Sempris |
| `dateOfBirth` | Date of Birth | Valid date | PSONLINE, MI |
| `gender` | Gender | M or F | PSONLINE only |
| `addressLine1` | Street Address | 1-50 chars | All forms |
| `addressLine2` | Apt/Suite | Max 50 chars | All forms (optional) |
| `city` | City | 1-30 chars | All forms |
| `state` | State | 2-letter code | All forms |
| `zipCode` | ZIP Code | 5 or 9 digits | All forms |
| `country` | Country | Max 56 chars | SubProject only |
| `organization` | Organization | Max 56 chars | SubProject only |

---

## Validation Rules Summary

### Common Validations (All Forms)
- **First Name**: Required, 1-30 characters
- **Last Name**: Required, 1-30 characters
- **Email**: Valid email format (required for all except SubProject)
- **Phone**: Required, exactly 10 digits (digits only)
- **Address Line 1**: Required, 1-50 characters
- **City**: Required, 1-30 characters
- **State**: Required, 2-letter uppercase code
- **ZIP Code**: Required, 5 or 9 digits

### Order-Type-Specific Validations

#### PSONLINE
- Products: At least one must be selected
- Amount: Must match sum of product prices
- Card Number: 15-16 digits, BIN validation
- Card Expiration: Separate month (01-12) and year (4 digits)
- CVV: 3-4 digits
- State: Cannot be ME, IA, UT, MN, VT, KS, WI, MO
- BIN Reject: First 6 digits checked against reject list

#### MI
- Call Date: Required, valid date
- Date of Birth: Required, valid date
- Routing Number: Exactly 9 digits
- Account Number: 10-12 digits
- Authorized Signer: Must be 'YES'
- Age Confirmation: Must be 'YES'
- Consent: At least one checkbox checked
- Order Number: Required
- State: Cannot be IA, WI, MS, MN

#### Radius
- Order Date: Required, valid date
- Card Number: 13-16 digits
- Card Expiration: MMYY format (4 digits)
- State: Cannot be IA, ME, MN, UT, VT, WI
- Source Code: Fixed 'R4N'
- SKU: Fixed 'F11'

#### Sempris
- Card Number: 13-16 digits
- Card Expiration: MMYY format (4 digits)
- CVV: 3-4 digits
- Card Issuer: Required, must be valid option
- Source: Fixed '43254'
- SKU: Fixed '103822'

#### SubProject
- Country: Required for billing address
- Card Number: 13-16 digits
- Card Expiration Month: 01-12
- Card Expiration Year: YYYY format (4 digits)
- CVV: 3-4 digits
- Card Type: Required, 1-4
- Shipping Address: Required if shippingSameAsBilling is false
- State: Cannot be IA, OH, AK, HI, ME, MN, UT, VT, WI

---

## State Restrictions by Form

| State | PSONLINE | MI | Radius | Sempris | SubProject |
|-------|----------|----|----|---------|------------|
| IA | ❌ | ❌ | ❌ | ✅ | ❌ |
| ME | ❌ | ✅ | ❌ | ✅ | ❌ |
| MN | ❌ | ❌ | ❌ | ✅ | ❌ |
| UT | ❌ | ✅ | ❌ | ✅ | ❌ |
| VT | ❌ | ✅ | ❌ | ✅ | ❌ |
| WI | ❌ | ❌ | ❌ | ✅ | ❌ |
| MS | ✅ | ❌ | ✅ | ✅ | ✅ |
| MO | ❌ | ✅ | ✅ | ✅ | ✅ |
| KS | ❌ | ✅ | ✅ | ✅ | ✅ |
| OH | ✅ | ✅ | ✅ | ✅ | ❌ |
| AK | ✅ | ✅ | ✅ | ✅ | ❌ |
| HI | ✅ | ✅ | ✅ | ✅ | ❌ |

**Implementation**: Create state restriction maps per order type and validate on state selection.

---

## Date Format Handling

### Internal Format
- Use ISO 8601 format (YYYY-MM-DD) for internal state
- Use JavaScript Date objects or ISO strings

### API Format Conversion
- **PSONLINE**: MM/DD/YYYY
- **MI**: MM/DD/YYYY
- **Radius**: MM/DD/YYYY
- **Sempris**: Not used
- **SubProject**: Not used

### Conversion Functions Needed
```javascript
// Convert ISO date to MM/DD/YYYY
function formatMMDDYYYY(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Convert MM/DD/YYYY to ISO
function parseMMDDYYYY(dateString) {
  const [month, day, year] = dateString.split('/');
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}
```

---

## Card Expiration Format Handling

### Format Variations
1. **Separate Month/Year** (PSONLINE, SubProject):
   - Month: 01-12
   - Year: YYYY (4 digits)

2. **MMYY Format** (Radius, Sempris):
   - Combined: MMYY (4 digits)
   - Example: "1225" for December 2025

### Conversion Functions
```javascript
// Convert separate month/year to MMYY
function toMMYY(month, year) {
  const twoDigitYear = String(year).slice(-2);
  return `${String(month).padStart(2, '0')}${twoDigitYear}`;
}

// Convert MMYY to separate month/year
function fromMMYY(mmyy) {
  return {
    month: mmyy.slice(0, 2),
    year: `20${mmyy.slice(2, 4)}`
  };
}
```

---

## Frontend Implementation Requirements

### Component Structure
1. **OrderTypeSelector**: Radio buttons or dropdown to select order type
2. **UnifiedForm**: Main form component with dynamic field rendering
3. **Field Components**: Reusable field components for common fields
4. **OrderTypeSections**: Conditional sections for order-specific fields
5. **PaymentMethodSelector**: Toggle between Credit Card and Bank Account
6. **ShippingAddressSection**: Conditional shipping address (SubProject only)

### Dynamic Field Rendering Logic
```javascript
// Pseudocode
function renderFields(orderType) {
  // Always render common fields
  renderCommonFields();
  
  // Render order-type-specific fields
  switch(orderType) {
    case 'psonline':
      renderProductSelection();
      renderGenderField();
      renderCreditCardFields();
      break;
    case 'mi':
      renderCallDate();
      renderBankAccountFields();
      renderConsentSection();
      renderOrderNumber();
      break;
    case 'radius':
      renderOrderDate();
      renderProductInfo();
      renderCreditCardFieldsMMYY();
      break;
    case 'sempris':
      renderCreditCardFieldsMMYY();
      renderCardIssuerDropdown();
      break;
    case 'subproject':
      renderCountryField();
      renderOrganizationField();
      renderShippingToggle();
      renderCreditCardFieldsSeparate();
      break;
  }
}
```

### Validation Implementation
- Use validation library (Yup, Joi, or custom)
- Create validation schema per order type
- Show field-level error messages
- Disable submit button until all validations pass
- Highlight invalid fields

### UI/UX Requirements
- Clear section headers (Personal Information, Billing Address, Payment, etc.)
- Visual separation between sections
- Required field indicators (*)
- Helpful error messages
- Loading states during submission
- Success/error notifications
- Form reset after successful submission
- Responsive design (mobile-friendly)

---

## Backend Implementation Requirements

### API Route Structure
```
/api/orders/psonline  → POST (PSOnline orders)
/api/orders/mi        → POST (MI orders)
/api/orders/radius    → POST (Radius orders)
/api/orders/sempris   → POST (Sempris orders)
/api/orders/sublytics → POST (SubProject orders)
```

### Backend Transformation Functions
Create transformation functions that:
1. Accept unified form data structure
2. Map unified field names to API-specific field names
3. Format dates according to API requirements
4. Format card expiration according to API requirements
5. Add fixed values
6. Generate auto-generated values (sessionId, trackingNumber, etc.)
7. Handle conditional fields (shipping address, etc.)
8. Return API-specific data structure

### Error Handling
- Validate incoming data structure
- Return meaningful error messages
- Handle API-specific error responses
- Log errors for debugging
- Return consistent error format

### Response Handling
- Parse API responses
- Extract success/error messages
- Handle different response formats per API
- Return unified response format to frontend

---

## Special Features Implementation

### 1. Product Selection (PSONLINE)
- Multi-select dropdown or checkboxes
- Auto-calculate total amount
- Display product names and prices
- Generate product fields dynamically for API

### 2. Bank Account Payment (MI)
- Show bank account fields instead of credit card
- Validate routing number (9 digits)
- Validate account number (10-12 digits)
- Show consent checkboxes with descriptions

### 3. Consent Section (MI)
- Checkboxes with labels and descriptions
- At least one must be checked
- Show validation error if none selected

### 4. Shipping Address Toggle (SubProject)
- Toggle switch for "Shipping same as billing"
- Show/hide shipping address fields based on toggle
- Validate shipping fields when shown
- Copy billing address to shipping when toggled on

### 5. Fixed Value Fields
- Display as read-only or disabled
- Show helper text explaining fixed value
- Pre-fill with correct values

### 6. Auto-Generated Fields
- Session ID (Radius): Random string
- Tracking Number (Sempris): UUID
- Generate on form load or submission

### 7. BIN Validation (PSONLINE)
- Check first 6 digits of card number
- Compare against reject list
- Show error if card BIN is rejected
- Extensive BIN list (see PSONLINE form code)

### 8. State Restrictions
- Disable restricted states in dropdown
- Show "(Not Available)" or "(Restricted)" label
- Validate on form submission
- Show error message with restricted states

### 9. Email Fallback (SubProject)
- If email is empty and phone is provided
- Auto-generate: `${phone}@noemail.com`
- Apply in transformation function, not in form

### 10. Date Pickers
- Use consistent date picker component
- Format dates according to API requirements
- Validate date ranges (no future dates for DOB, etc.)

---

## Testing Requirements

### Unit Tests
- Field validation rules
- Transformation functions
- Date format conversions
- Card expiration format conversions
- State restriction validation
- BIN validation

### Integration Tests
- Form submission for each order type
- API endpoint responses
- Error handling
- Success flows

### E2E Tests
- Complete form flow for each order type
- Validation error display
- Successful submission
- Form reset after submission

---

## Implementation Checklist

### Frontend
- [ ] Create order type selector component
- [ ] Create unified form component structure
- [ ] Implement common fields (personal info, address)
- [ ] Implement payment method selector
- [ ] Implement PSONLINE-specific fields
- [ ] Implement MI-specific fields
- [ ] Implement Radius-specific fields
- [ ] Implement Sempris-specific fields
- [ ] Implement SubProject-specific fields
- [ ] Implement dynamic field rendering
- [ ] Implement validation per order type
- [ ] Implement state restriction handling
- [ ] Implement BIN validation (PSONLINE)
- [ ] Implement product selection (PSONLINE)
- [ ] Implement consent section (MI)
- [ ] Implement shipping address toggle (SubProject)
- [ ] Implement date format handling
- [ ] Implement card expiration format handling
- [ ] Implement form submission
- [ ] Implement error handling
- [ ] Implement success/error notifications
- [ ] Implement form reset
- [ ] Style and responsive design

### Backend
- [ ] Create transformation function for PSONLINE
- [ ] Create transformation function for MI
- [ ] Create transformation function for Radius
- [ ] Create transformation function for Sempris
- [ ] Create transformation function for SubProject
- [ ] Update API routes to use transformation functions
- [ ] Implement error handling
- [ ] Implement response formatting
- [ ] Add logging
- [ ] Test each API endpoint

### Validation
- [ ] Create validation schema for PSONLINE
- [ ] Create validation schema for MI
- [ ] Create validation schema for Radius
- [ ] Create validation schema for Sempris
- [ ] Create validation schema for SubProject
- [ ] Implement state restriction validation
- [ ] Implement BIN validation
- [ ] Implement date validation
- [ ] Implement card expiration validation
- [ ] Implement phone validation
- [ ] Implement email validation

---

## Key Implementation Notes

1. **Field Name Standardization**: Use unified field names internally, transform to API-specific names only when submitting.

2. **Conditional Rendering**: Show/hide fields based on order type and payment method selection.

3. **Validation**: Apply validation rules based on order type. Some fields are required for some forms but optional for others.

4. **Date Formats**: Store dates in ISO format internally, convert to API-specific format only during submission.

5. **Card Expiration**: Handle two different formats (separate month/year vs MMYY). Convert as needed for each API.

6. **Fixed Values**: Pre-fill and disable fixed value fields. Show helper text explaining why they're fixed.

7. **Auto-Generated Values**: Generate session IDs, tracking numbers, etc. automatically. Don't require user input.

8. **State Restrictions**: Validate state selection based on order type. Disable restricted states in dropdown.

9. **Error Messages**: Provide clear, helpful error messages for validation failures.

10. **Success Handling**: Clear form and show success message after successful submission. Handle different success response formats per API.

---

## Example Implementation Flow

### User Journey (PSONLINE)
1. User selects "PSONLINE" order type
2. Form shows product selection (multi-select)
3. User selects products, amount auto-calculates
4. User fills personal information
5. User fills billing address
6. System validates state (not in restricted list)
7. User fills credit card information
8. System validates card BIN (not in reject list)
9. User submits form
10. Frontend validates all fields
11. Frontend transforms data to PSONLINE format
12. Frontend sends to `/api/orders/psonline`
13. Backend receives unified data
14. Backend transforms to PSONLINE API format
15. Backend calls PSONLINE API
16. Backend returns response to frontend
17. Frontend shows success/error message
18. Form resets if successful

### User Journey (MI)
1. User selects "MI" order type
2. Form shows payment method selector
3. User selects "Bank Account"
4. User fills call date
5. User fills personal information
6. User fills billing address
7. System validates state (not in restricted list)
8. User fills bank account information
9. User confirms authorized signer (must be YES)
10. User confirms age (must be YES)
11. User selects at least one consent checkbox
12. User enters order number
13. User submits form
14. Frontend validates all fields
15. Frontend transforms data to MI format
16. Frontend sends to `/api/orders/mi`
17. Backend receives unified data
18. Backend transforms to MI API format
19. Backend calls MI API
20. Backend returns response to frontend
21. Frontend shows success/error message
22. Form resets if successful

---

## Additional Considerations

### Security
- Never log sensitive data (card numbers, CVV, account numbers)
- Mask sensitive fields in UI after entry
- Use HTTPS for all API calls
- Validate and sanitize all inputs
- Implement rate limiting on API endpoints

### Performance
- Lazy load form sections
- Optimize validation checks
- Debounce validation on input
- Cache state restriction lists
- Minimize re-renders

### Accessibility
- Proper label associations
- ARIA attributes for dynamic content
- Keyboard navigation support
- Screen reader compatibility
- Error announcements

### Internationalization
- Support multiple languages (if needed)
- Format phone numbers according to locale
- Format dates according to locale
- Currency formatting (if needed)

---

## Success Criteria

The unified form system should:
1. ✅ Support all 5 order types with correct field rendering
2. ✅ Apply correct validation rules per order type
3. ✅ Transform data correctly for each API
4. ✅ Handle all edge cases and error scenarios
5. ✅ Provide clear user feedback
6. ✅ Maintain code maintainability and extensibility
7. ✅ Pass all tests
8. ✅ Meet accessibility standards
9. ✅ Be responsive and mobile-friendly
10. ✅ Handle all special features (BIN validation, state restrictions, etc.)

---

## Final Notes

This prompt provides comprehensive specifications for building a unified order form system. Follow the flow, validation rules, field requirements, and transformation logic for each order type. Pay special attention to:

- Field name mapping between unified and API-specific formats
- Date format conversions
- Card expiration format handling
- State restriction validation
- Order-type-specific features
- Error handling and user feedback

Implement the system step by step, testing each order type thoroughly before moving to the next. Ensure all edge cases are handled and all validations are working correctly.







