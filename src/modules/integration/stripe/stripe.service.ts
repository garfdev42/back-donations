import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Donation } from '../../donations/entities/donations.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Donation) private readonly donationsRepo: Repository<Donation>,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
    });
  }

  async createCheckoutSession(donation: Donation): Promise<Stripe.Checkout.Session> {

    const currency = donation.currency?.toLowerCase() || this.configService.get<string>('STRIPE_CURRENCY') || 'usd';

    // moneda currency configuration
    const unitAmount = Math.round(Number(donation.amount) * 100);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Donation',
              description: donation.message || 'Donation to our cause',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}', // TODO: Replace with frontend URL
      cancel_url: 'http://localhost:3000/cancel', // TODO: Replace with frontend URL
      customer_email: donation.donor?.email,
      client_reference_id: donation.id,
      metadata: {
        donationId: donation.id,
      },
    });

    return session;
  }

  async markCompletedBySession(sessionId: string) {
    const donation = await this.donationsRepo.findOne({ where: { stripeSessionId: sessionId } });
    if (!donation) {
      return;
    }
    donation.status = 'COMPLETED' as any;
    await this.donationsRepo.save(donation);
  }

  constructEvent(payload: Buffer, signature: string, endpointSecret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  }
}
