const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Credit conversion rates
const CREDIT_SYSTEM = {
  CREDIT_RATE: parseFloat(process.env.CREDIT_RATE) || 1, // 1 credit = $1
  MINIMUM_TOPUP_AMOUNT: parseFloat(process.env.MINIMUM_TOPUP_AMOUNT) || 5, // Minimum $5
  CURRENCY: process.env.STRIPE_CURRENCY || 'usd',
  
  // Convert dollars to credits
  dollarsToCredits: function(dollars) {
    return Math.floor(dollars);
  },
  
  // Convert credits to dollars
  creditsToDollars: function(credits) {
    return credits;
  },
  
  // Get credit plans
  getPlans: function() {
    return [
      { 
        id: 'starter', 
        name: 'Starter Plan', 
        amount: 10, // $10 USD
        credits: 10,
        totalCredits: 10,
        bonusCredits: 0,
        description: '10 Credits for $10',
        pricePerCredit: 1.00
      },
      { 
        id: 'popular', 
        name: 'Popular Plan', 
        amount: 20, // $20 USD
        credits: 20,
        totalCredits: 22,
        bonusCredits: 2,
        description: '20 Credits + 2 Bonus = 22 Credits for $20',
        pricePerCredit: 0.91
      },
      { 
        id: 'standard', 
        name: 'Standard Plan', 
        amount: 50, // $50 USD
        credits: 50,
        totalCredits: 60,
        bonusCredits: 10,
        description: '50 Credits + 10 Bonus = 60 Credits for $50',
        pricePerCredit: 0.83
      },
      { 
        id: 'premium', 
        name: 'Premium Plan', 
        amount: 100, // $100 USD
        credits: 100,
        totalCredits: 125,
        bonusCredits: 25,
        description: '100 Credits + 25 Bonus = 125 Credits for $100',
        pricePerCredit: 0.80
      }
    ];
  },

  // Calculate bonus credits based on amount
  calculateBonusCredits: function(amount) {
    if (amount >= 100) return 25;
    if (amount >= 50) return 10;
    if (amount >= 25) return 2;
    return 0;
  }
};

// Stripe Service Functions
const stripeService = {
  // Create Payment Intent for custom amount
  createPaymentIntent: async (amount, userId, planName = 'custom') => {
    try {
      const amountInCents = Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: CREDIT_SYSTEM.CURRENCY,
        metadata: {
          userId: userId.toString(),
          planName,
          amount: amount.toString(),
          credits: CREDIT_SYSTEM.dollarsToCredits(amount).toString(),
          totalCredits: (CREDIT_SYSTEM.dollarsToCredits(amount) + 
                        CREDIT_SYSTEM.calculateBonusCredits(amount)).toString(),
          bonusCredits: CREDIT_SYSTEM.calculateBonusCredits(amount).toString()
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: CREDIT_SYSTEM.CURRENCY
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Create Checkout Session for predefined plans
  createCheckoutSession: async (planId, userId, userEmail = null) => {
    try {
      const plans = CREDIT_SYSTEM.getPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        throw new Error('Plan not found');
      }

      const amountInCents = Math.round(plan.amount * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: CREDIT_SYSTEM.CURRENCY,
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        customer_email: userEmail,
        metadata: {
          userId: userId.toString(),
          planId: plan.id,
          planName: plan.name,
          amount: plan.amount.toString(),
          credits: plan.credits.toString(),
          totalCredits: plan.totalCredits.toString(),
          bonusCredits: plan.bonusCredits.toString()
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
        amount: plan.amount,
        planName: plan.name
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Verify webhook signature
  verifyWebhookSignature: (req, signature) => {
    try {
      return stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Invalid signature');
    }
  },

  // Get payment intent details
  getPaymentIntent: async (paymentIntentId) => {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  },

  // Get checkout session details
  getCheckoutSession: async (sessionId) => {
    try {
      return await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw error;
    }
  }
};

module.exports = {
  stripe,
  CREDIT_SYSTEM,
  stripeService
};