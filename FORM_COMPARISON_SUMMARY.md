# Form Comparison Summary

## Quick Reference: Common vs Unique Fields

### ✅ COMMON FIELDS (Present in 3+ forms)

#### Personal Information
- ✅ **First Name** - All 5 forms
- ✅ **Last Name** - All 5 forms  
- ✅ **Email** - All 5 forms
- ✅ **Phone** - All 5 forms
- ⚠️ **Secondary Phone** - 3 forms (PSONLINE, Radius, Sempris)
- ⚠️ **Date of Birth** - 2 forms (PSONLINE, MI)

#### Address Information
- ✅ **Address Line 1** - All 5 forms
- ✅ **Address Line 2/Apt** - All 5 forms (optional)
- ✅ **City** - All 5 forms
- ✅ **State** - All 5 forms
- ✅ **ZIP Code** - All 5 forms

#### Payment (Credit Card)
- ⚠️ **Card Number** - 4 forms (PSONLINE, Radius, Sempris, SubProject)
- ⚠️ **Card Expiration** - 4 forms (different formats)
- ⚠️ **CVV** - 3 forms (PSONLINE, Sempris, SubProject)
- ⚠️ **Card Type/Issuer** - 2 forms (Sempris, SubProject)

---

### 🔷 UNIQUE FIELDS BY FORM

#### PSONLINEOrderForm
```
✅ Product Selection
   - selectedProducts (array)
   - amount (calculated)

✅ Personal
   - gender (M/F)

✅ Payment
   - expiryMonth (separate)
   - expiryYear (separate)

✅ Validation
   - BIN reject list
   - State restrictions: ME, IA, UT, MN, VT, KS, WI, MO
```

#### MIOrderForm
```
✅ Date
   - callDate

✅ Bank Account (Unique Payment Method)
   - checkingAccountName
   - bankName
   - routingNumber (9 digits)
   - checkingAccountNumber (10-12 digits)

✅ Consent/Confirmation
   - authorizedSigner (YES/NO)
   - ageConfirmation (YES)
   - consent.benefitsIdTheft
   - consent.myTelemedicine

✅ Order
   - orderNumber

✅ Validation
   - State restrictions: IA, WI, MS, MN
```

#### RadiusOrderForm
```
✅ Date
   - orderDate

✅ Product Info
   - sourceCode (R4N)
   - sku (F11)
   - productName (Ear Plug)

✅ Session
   - sessionId
   - project

✅ Validation
   - State restrictions: IA, ME, MN, UT, VT, WI
   - Prepaid card BIN validation
```

#### SemprisOrderForm
```
✅ Product Info
   - source (43254 - fixed)
   - sku (103822 - fixed)

✅ Payment
   - issuer (dropdown: diners-club, discover, jcb, visa, mastercard, american-express)

✅ Vendor/Tracking
   - vendor_id (STAR)
   - tracking_number (UUID)
```

#### SubProjectOrderForm
```
✅ Order Configuration
   - user_id (37)
   - connection_id (1)
   - payment_method_id (1)
   - campaign_id (1)
   - offers (array)
   - currency_id (1)

✅ Billing
   - bill_organization
   - bill_country

✅ Shipping Address (Complete separate address)
   - shipping_same (toggle)
   - ship_fname, ship_lname
   - ship_organization
   - ship_country
   - ship_address1, ship_address2
   - ship_city, ship_state, ship_zipcode

✅ Payment
   - card_exp_month (separate)
   - card_exp_year (YYYY format)

✅ Tracking
   - tracking1 (SA)
   - tracking2 (01)

✅ Validation
   - State restrictions: IA, OH, AK, HI, ME, MN, UT, VT, WI
   - Email fallback logic
```

---

## Field Name Variations

### First Name
- `firstName` (PSONLINE, MI, Radius)
- `first_name` (Sempris)
- `bill_fname` (SubProject)

### Last Name
- `lastName` (PSONLINE, MI, Radius)
- `last_name` (Sempris)
- `bill_lname` (SubProject)

### Phone
- `phone` (PSONLINE, Sempris, SubProject)
- `phoneNumber` (MI, Radius)

### Address Line 1
- `streetAddress` (PSONLINE)
- `address1` (MI, Radius, Sempris)
- `bill_address1` (SubProject)

### ZIP Code
- `zipCode` (PSONLINE, MI, Radius)
- `zip` (Sempris)
- `bill_zipcode` (SubProject)

### Card Number
- `cardNumber` (PSONLINE)
- `creditCardNumber` (Radius)
- `card_number` (Sempris, SubProject)

### Card Expiration
- `expiryMonth` + `expiryYear` (PSONLINE, SubProject)
- `creditCardExpiration` (MMYY format) (Radius)
- `card_expiration` (MMYY format) (Sempris)

---

## Payment Method Distribution

| Payment Method | Forms Using It |
|----------------|----------------|
| Credit Card | PSONLINE, Radius, Sempris, SubProject |
| Bank Account (ACH) | MI |
| Both | None (each form uses one method) |

---

## State Restrictions Summary

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

**Most Restricted States**: IA, ME, MN, UT, VT, WI appear in multiple forms

---

## Key Differences to Handle in Unified Form

1. **Payment Methods**: 
   - Credit Card (4 forms) vs Bank Account (1 form)
   - Need payment method selector

2. **Date Formats**:
   - Separate month/year vs MMYY format
   - Different date field formats

3. **Address Structure**:
   - Single address (4 forms) vs Billing+Shipping (1 form)
   - Need shipping address toggle

4. **Product Selection**:
   - Multi-select products (PSONLINE) vs Fixed products (others)
   - Source code/SKU varies

5. **Consent/Confirmation**:
   - Only MI form has consent checkboxes and confirmations

6. **Validation Rules**:
   - Different state restrictions per form
   - Different BIN/card validations
   - Different required field sets

---

## Recommendation for Unified Form

### Step 1: Order Type Selection
User selects order type first, which determines:
- Available fields
- Validation rules
- Payment methods
- State restrictions

### Step 2: Dynamic Field Rendering
Based on order type, show:
- Common fields (always)
- Type-specific fields (conditionally)
- Appropriate payment method fields

### Step 3: Field Mapping on Submit
Transform unified field names to API-specific format before submission

### Step 4: Validation
Apply order-type-specific validation rules







