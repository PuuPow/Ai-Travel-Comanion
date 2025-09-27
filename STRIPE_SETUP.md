# Stripe Setup Instructions

## The "Start Premium Trial" button is not working because Stripe is not configured.

### Steps to Fix:

1. **Create a Stripe Account (Free)**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign up for a free account
   - Complete the verification process

2. **Get Your API Keys**
   - In Stripe Dashboard, go to **Developers** > **API keys**
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Update Backend Environment**
   - Open `backend/.env`
   - Replace `STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE` with your actual secret key
   - Replace `STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual publishable key

4. **Update Frontend Environment** 
   - Open `frontend/.env.local`
   - Replace `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual publishable key

5. **Restart Both Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

### Test Mode vs Live Mode

- **Test keys** (`sk_test_` and `pk_test_`) are for development - no real money is charged
- **Live keys** (`sk_live_` and `pk_live_`) are for production - real payments are processed

For development, use test keys only!

### After Setup

Once configured, the "Start Premium Trial" button will:
1. Create a Stripe checkout session
2. Redirect to Stripe's hosted payment page
3. Process test payments (use test card `4242 4242 4242 4242`)
4. Redirect back to your success page
5. Upgrade the user to premium status

### Test Cards for Development

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any postal code.