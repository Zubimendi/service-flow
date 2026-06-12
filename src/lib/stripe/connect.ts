import { stripe } from "./client";

export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  return stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
}

export async function createBookingCheckoutSession(params: {
  amount: number;
  connectedAccountId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_intent_data: {
      transfer_data: {
        destination: params.connectedAccountId,
      },
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Appointment Deposit",
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
}

export async function createSubscriptionCheckout(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.customerId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
}
