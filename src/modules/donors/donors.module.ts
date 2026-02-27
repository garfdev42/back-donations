import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonorsController } from './donors.controller';
import { Donor } from './entities/donor.entitie';
import { DonorsService } from './donors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donor])],
  controllers: [DonorsController],
  providers: [DonorsService],
  exports: [TypeOrmModule, DonorsService],
})
export class DonorsModule {}