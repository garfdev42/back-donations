import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from './entities/donor.entitie';

import { CreateDonorDto } from './dto/create-donor.dto';

@Injectable()
export class DonorsService {
  constructor(
    @InjectRepository(Donor)
    private readonly donorsRepo: Repository<Donor>,
  ) { }

  async findOrCreate(createDonorDto: CreateDonorDto) {
    const { email, fullName, identification } = createDonorDto;

    let donor = await this.donorsRepo.findOne({
      where: [{ identification }, { email }]
    });

    if (!donor) {
      donor = this.donorsRepo.create({
        email,
        fullName,
        identification
      });
      return await this.donorsRepo.save(donor);
    }

    if (donor.identification === identification && donor.email !== email) {
      throw new ConflictException('Para donar nuevamente con esta identificación, debe usar el mismo correo electrónico registrado. Si necesita actualizar sus datos, contacte a soporte.');
    }

    if (donor.email === email && donor.identification !== identification) {
        throw new ConflictException('Este correo electrónico ya está asociado a otra identificación.');
    }

    if (donor.fullName !== fullName) {
      donor.fullName = fullName;
      return await this.donorsRepo.save(donor);
    }

    return donor;
  }

  async findAll() {
    return this.donorsRepo.find({ relations: ['donations'] });
  }

  async findOne(id: string) {
    const donor = await this.donorsRepo.findOne({
      where: { id },
      relations: ['donations'],
    });

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    return donor;
  }

  async remove(id: string) {
    const donor = await this.findOne(id);
    return this.donorsRepo.remove(donor);
  }
}