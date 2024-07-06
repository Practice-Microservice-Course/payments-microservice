import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_SECRET);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;
    const lineItems = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // $20.00 usd
      },
      quantity: item.quantity,
    }));
    const session = await this.stripe.checkout.sessions.create({
      // Order ID
      payment_intent_data: {
        metadata: { orderId },
      },
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.SUCCESS_URL,
      cancel_url: envs.CANCEL_URL,
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    const endpointSecret = envs.ENDPOINT_SECRET;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        console.log({ metadata: chargeSucceeded.metadata });
        break;
      default:
        console.log(`Event type: ${event.type} is not supported.`);
    }

    return res.status(200).json({ sig });
  }
}
