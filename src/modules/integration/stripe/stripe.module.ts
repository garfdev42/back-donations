import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from '../../donations/entities/donations.entities';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Donation])],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
