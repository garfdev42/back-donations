import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import Stripe from 'stripe';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() request: Request) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!endpointSecret) {
      const event = request.body as any;
      if (event && event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.stripeService.markCompletedBySession(session.id);
      }
      return { received: true };
    }

    let event;
    try {
      event = this.stripeService.constructEvent(request.body as unknown as Buffer, signature, endpointSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.stripeService.markCompletedBySession(session.id);
        break;
      }
      default:
        break;
    }

    return { received: true };
  }
}
