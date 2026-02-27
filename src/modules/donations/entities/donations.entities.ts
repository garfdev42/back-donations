import { Donor } from 'src/modules/donors/entities/donor.entitie';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DonationStatus, DonationCurrency } from '../enums/donations.enum';

@Entity({ name: 'donations' })
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: DonationCurrency,
    default: DonationCurrency.USD,
  })
  currency: DonationCurrency;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ name: 'stripe_session_id', type: 'text', nullable: true })
  stripeSessionId?: string;

  @Column({
    type: 'enum',
    enum: DonationStatus,
    default: DonationStatus.PENDING,
  })
  status: DonationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Donor, (donor) => donor.donations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  donor: Donor;
}
