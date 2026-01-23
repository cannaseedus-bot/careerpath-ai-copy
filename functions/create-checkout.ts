import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_IDS = {
  starter: 'price_1SscMoCgCAKoAnBZ84BM3D3d',
  professional: 'price_1SscMoCgCAKoAnBZcTt1kLHe',
  enterprise: 'price_1SscMoCgCAKoAnBZOaX47zRi'
};

Deno.serve(async (req) => {
  try {
    const { tier, success_url, cancel_url } = await req.json();

    if (!tier || !PRICE_IDS[tier]) {
      return Response.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[tier],
          quantity: 1,
        },
      ],
      success_url: success_url || `${new URL(req.url).origin}/success`,
      cancel_url: cancel_url || `${new URL(req.url).origin}/pricing`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        tier: tier
      }
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});