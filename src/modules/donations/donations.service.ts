import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonorsService } from '../donors/donors.service';
import { StripeService } from '../integration/stripe/stripe.service';
import { Donation } from './entities/donations.entities';
import { DonationStatus } from './enums/donations.enum';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationsRepo: Repository<Donation>,
    private readonly donorsService: DonorsService,
    private readonly stripeService: StripeService,
  ) {}

  async create(createDonationDto: CreateDonationDto) {
    const { amount, currency, message, ...donorData } = createDonationDto;

    const donor = await this.donorsService.findOrCreate(donorData);

    const donation = this.donationsRepo.create({
      amount,
      currency,
      message,
      status: DonationStatus.PENDING,
      donor,
    });

    const savedDonation = await this.donationsRepo.save(donation);

    const session = await this.stripeService.createCheckoutSession(savedDonation);

    // Update stripe id de cesion
    savedDonation.stripeSessionId = session.id;
    await this.donationsRepo.save(savedDonation);

    return {
      donation: savedDonation,
      paymentUrl: session.url,
    };
  }

  findAll() {
    return this.donationsRepo.find({ relations: ['donor'] });
  }

  async findOne(id: string) {
    const donation = await this.donationsRepo.findOne({
      where: { id },
      relations: ['donor'],
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return donation;
  }

  async markCompletedByStripeSession(sessionId: string) {
    const donation = await this.donationsRepo.findOne({ where: { stripeSessionId: sessionId } });
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    donation.status = DonationStatus.COMPLETED;
    return this.donationsRepo.save(donation);
  }
}
