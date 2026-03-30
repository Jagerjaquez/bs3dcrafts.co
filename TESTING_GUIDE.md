# Testing Guide - Stripe Payment Integration

This guide provides step-by-step instructions for testing the complete payment flow locally.

## Prerequisites

Before testing, ensure you have:

1. ✅ All environment variables configured in `.env`
2. ✅ Stripe test API keys (starting with `sk_test_` and `pk_test_`)
3. ✅ Database running and migrations applied
4. ✅ Stripe CLI installed ([Installation Guide](https://stripe.com/docs/stripe-cli))
5. ✅ Development server running (`npm run dev`)

## Complete Payment Flow Test

### Step 1: Start Stripe Webhook Forwarding

Open a terminal and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This command will:
- Forward Stripe webhook events to your local server
- Display a webhook signing secret (starts with `whsec_`)
- Show real-time webhook events as they occur

**Important**: Copy the webhook signing secret and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then restart your development server to load the new secret.

### Step 2: Add Products to Cart

1. Navigate to `http://localhost:3000/products`
2. Browse available products
3. Click "Sepete Ekle" (Add to Cart) on one or more products
4. Verify cart icon shows item count
5. Click cart icon to view cart

### Step 3: Proceed to Checkout

1. In the cart, click "Ödemeye Geç" (Proceed to Checkout)
2. You should see the checkout page at `http://localhost:3000/checkout`
3. Verify the "TEST MODE" banner is displayed at the top
4. Verify the order summary shows your cart items and total

### Step 4: Fill Customer Information

Fill in the checkout form with test data:

```
Ad Soyad: Ahmet Yılmaz
E-posta: ahmet@example.com
Telefon: +905551234567
Adres: Atatürk Caddesi No:123, Kadıköy, İstanbul
```

### Step 5: Create Checkout Session

1. Click "Ödemeye Geç" (Proceed to Payment) button
2. You should be redirected to Stripe's hosted checkout page
3. Verify the page shows:
   - Your cart items with correct names and prices
   - Total amount in Turkish Lira (₺)
   - Stripe's secure payment form

### Step 6: Complete Payment with Test Card

On the Stripe checkout page, enter test card details:

**Successful Payment Test:**
```
Card Number: 4242 4242 4242 4242
Expiry Date: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Postal Code: Any value (e.g., 34000)
```

Click "Pay" to complete the payment.

**Alternative Test Scenarios:**

- **Declined Card**: Use `4000 0000 0000 0002` to test payment failure
- **3D Secure**: Use `4000 0025 0000 3155` to test authentication flow
- **Insufficient Funds**: Use `4000 0000 0000 9995` to test insufficient funds error

### Step 7: Verify Webhook Events

In the terminal running `stripe listen`, you should see:

```
→ POST /api/webhooks/stripe [200]
  evt_... checkout.session.completed
→ POST /api/webhooks/stripe [200]
  evt_... payment_intent.succeeded
```

This confirms:
- ✅ Webhook events are being received
- ✅ Webhook signature verification passed
- ✅ Events are processed successfully (200 status)

### Step 8: Verify Success Page

After payment, you should be redirected to the success page:

1. URL should be `http://localhost:3000/success?session_id=cs_test_...`
2. Verify the "TEST MODE" banner is displayed
3. Verify the success message is shown
4. Verify order details are displayed:
   - Order number (ID)
   - Customer name and email
   - Order status ("paid")
   - List of purchased items with quantities and prices
   - Total amount

### Step 9: Verify Order in Database

Check that the order was created in the database:

**Using Prisma Studio:**
```bash
npx prisma studio
```

Navigate to the `Order` table and verify:
- ✅ New order exists with correct customer information
- ✅ `status` is "paid"
- ✅ `stripePaymentId` matches the session ID from URL
- ✅ `totalAmount` matches the payment amount
- ✅ `createdAt` and `updatedAt` timestamps are set

Navigate to the `OrderItem` table and verify:
- ✅ Order items exist for the order
- ✅ Each item has correct `productId`, `quantity`, and `unitPrice`
- ✅ Number of items matches cart items

**Using SQL Query:**
```sql
-- Get the most recent order
SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 1;

-- Get order items for the order
SELECT * FROM "OrderItem" WHERE "orderId" = 'order_id_here';
```

### Step 10: Verify Cart is Cleared

1. Navigate back to the products page
2. Check the cart icon - it should show 0 items
3. Click the cart icon to verify cart is empty

## Testing Error Scenarios

### Test 1: Empty Cart Validation

1. Clear your cart (if not already empty)
2. Navigate directly to `/checkout`
3. Verify error message: "Sepetiniz boş. Lütfen ürün ekleyin."
4. Verify "Ürünlere Dön" button redirects to products page

### Test 2: Missing Customer Information

1. Add items to cart and go to checkout
2. Leave one or more form fields empty
3. Click "Ödemeye Geç"
4. Verify error message: "Lütfen tüm alanları doldurun."

### Test 3: Payment Cancellation

1. Complete steps 1-5 above
2. On the Stripe checkout page, click the back arrow or "← Return to BS3DCRAFTS"
3. Verify you're redirected back to `/checkout`
4. Verify cart items are still present (not cleared)

### Test 4: Declined Card

1. Complete steps 1-5 above
2. Use declined test card: `4000 0000 0000 0002`
3. Complete the payment form
4. Verify Stripe shows a decline error
5. Verify you can try again with a different card

### Test 5: Network Error Simulation

1. Stop the development server
2. Try to submit the checkout form
3. Verify error message: "Bağlantı hatası. Lütfen tekrar deneyin."
4. Restart server and verify you can retry

## Testing Property-Based Tests

Run all property-based tests:

```bash
npm test
```

This will run:
- 100 iterations of each property test
- All unit tests
- Integration tests

Verify all tests pass with output similar to:

```
Test Suites: X passed, X total
Tests:       X passed, X total
```

## Testing Rate Limiting

Test the rate limiter on the checkout endpoint:

```bash
# Run 15 rapid requests (limit is 10 per minute)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/checkout/session \
    -H "Content-Type: application/json" \
    -d '{"items":[],"customerInfo":{}}' &
done
```

Expected behavior:
- First 10 requests: Return 400 (validation error for empty cart)
- Requests 11-15: Return 429 (rate limit exceeded)

## Verification Checklist

After completing all tests, verify:

- [ ] Checkout session creation works
- [ ] Stripe hosted checkout page displays correctly
- [ ] Payment with test card succeeds
- [ ] Webhook events are received and processed
- [ ] Order is created in database with correct data
- [ ] Order items are created with correct data
- [ ] Success page displays order details
- [ ] Cart is cleared after successful payment
- [ ] Empty cart validation works
- [ ] Form validation works
- [ ] Payment cancellation preserves cart
- [ ] Declined card shows error
- [ ] Test mode banner displays correctly
- [ ] All property tests pass (100 iterations each)
- [ ] All unit tests pass
- [ ] Rate limiting works

## Troubleshooting

### Webhook Events Not Received

**Problem**: Stripe CLI shows events but server doesn't receive them

**Solutions**:
1. Verify webhook URL is correct: `localhost:3000/api/webhooks/stripe`
2. Check development server is running on port 3000
3. Verify `STRIPE_WEBHOOK_SECRET` in `.env` matches CLI output
4. Restart development server after updating `.env`

### Order Not Created

**Problem**: Payment succeeds but order not in database

**Solutions**:
1. Check webhook events in Stripe CLI terminal
2. Check server logs for errors
3. Verify database connection is working
4. Check `checkout.session.completed` event is being processed
5. Verify webhook signature validation passes

### Success Page Shows "Order Not Found"

**Problem**: Redirected to success page but order details don't load

**Solutions**:
1. Check browser console for API errors
2. Verify session ID is in URL: `?session_id=cs_test_...`
3. Check order exists in database with matching `stripePaymentId`
4. Verify `/api/orders/[sessionId]` endpoint is working

### Test Mode Banner Not Showing

**Problem**: Banner doesn't appear on checkout/success pages

**Solutions**:
1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_`
2. Check browser console for errors
3. Clear browser cache and reload
4. Verify component is imported and rendered

## Additional Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

## Support

If you encounter issues during testing:

1. Check application logs for errors
2. Check Stripe Dashboard > Developers > Logs for API errors
3. Review webhook event details in Stripe Dashboard
4. Consult `DEPLOYMENT.md` for configuration details
5. Contact: info@bs3dcrafts.co
