import Stripe from 'stripe';
import prisma from './prisma';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export interface CreateSubscriptionParams {
  orgId: string;
  priceId: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
}

// Create or get Stripe customer for an organization
export async function getOrCreateStripeCustomer(orgId: string): Promise<string> {
  // Check if customer already exists
  const subscription = await prisma.subscription.findUnique({
    where: { orgId },
    select: { stripeCustomerId: true },
  });

  if (subscription?.stripeCustomerId) {
    return subscription.stripeCustomerId;
  }

  // Get organization details
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      name: true,
      subdomain: true,
      users: {
        where: { role: 'admin' },
        take: 1,
        select: { email: true },
      },
    },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: org.users[0]?.email,
    name: org.name,
    metadata: {
      orgId,
      subdomain: org.subdomain,
    },
  });

  // Store customer ID
  await prisma.subscription.upsert({
    where: { orgId },
    create: {
      orgId,
      stripeCustomerId: customer.id,
      status: 'trialing',
    },
    update: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

// Create subscription
export async function createSubscription(params: CreateSubscriptionParams) {
  const customerId = await getOrCreateStripeCustomer(params.orgId);

  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: customerId,
    items: [{ price: params.priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      orgId: params.orgId,
    },
  };

  if (params.paymentMethodId) {
    subscriptionParams.default_payment_method = params.paymentMethodId;
  }

  const subscription = await stripe.subscriptions.create(subscriptionParams);

  // Store subscription in database
  await prisma.subscription.upsert({
    where: { orgId: params.orgId },
    create: {
      orgId: params.orgId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: params.priceId,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: params.priceId,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
  });

  return subscription;
}

// Update subscription
export async function updateSubscription(params: UpdateSubscriptionParams) {
  const updateParams: Stripe.SubscriptionUpdateParams = {
    metadata: { updated_at: new Date().toISOString() },
  };

  if (params.priceId) {
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(params.subscriptionId);
    updateParams.items = [
      {
        id: subscription.items.data[0].id,
        price: params.priceId,
      },
    ];
    updateParams.proration_behavior = 'always_invoice';
  }

  if (params.cancelAtPeriodEnd !== undefined) {
    updateParams.cancel_at_period_end = params.cancelAtPeriodEnd;
  }

  const subscription = await stripe.subscriptions.update(
    params.subscriptionId,
    updateParams
  );

  // Update database
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: params.subscriptionId },
    data: {
      status: subscription.status,
      stripePriceId: params.priceId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
  });

  return subscription;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: subscription.status,
        canceledAt: new Date(),
      },
    });

    return subscription;
  } else {
    return await updateSubscription({
      subscriptionId,
      cancelAtPeriodEnd: true,
    });
  }
}

// Handle webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
        },
      });
      break;
    }

    case 'invoice.created':
    case 'invoice.updated':
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await syncInvoice(invoice);
      break;
    }

    default:
      console.log(`Unhandled Stripe webhook event: ${event.type}`);
  }
}

// Sync subscription from Stripe
async function syncSubscription(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata.orgId;

  if (!orgId) {
    console.error('No orgId in subscription metadata');
    return;
  }

  await prisma.subscription.upsert({
    where: { orgId },
    create: {
      orgId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

// Sync invoice from Stripe
async function syncInvoice(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) return;

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status || 'draft',
      hostedUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
    },
    update: {
      amountPaid: invoice.amount_paid,
      status: invoice.status || 'draft',
      hostedUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      paidAt: invoice.status_transitions.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : null,
    },
  });
}

// Get payment methods for a customer
export async function getPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });

  return paymentMethods.data;
}

// Create setup intent for adding payment method
export async function createSetupIntent(customerId: string) {
  return await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
}
