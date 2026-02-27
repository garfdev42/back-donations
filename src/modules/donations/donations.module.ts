import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsController } from './donations.controller';
import { DonorsModule } from '../donors/donors.module';
import { StripeModule } from '../integration/stripe/stripe.module';
import { Donation } from './entities/donations.entities';
import { DonationsService } from './donations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation]),
    DonorsModule,
    StripeModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule { }
