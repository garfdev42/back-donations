import { Donation } from 'src/modules/donations/entities/donations.entities';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'donors' })
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  identification: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @OneToMany(() => Donation, donation => donation.donor)
  donations: Donation[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
