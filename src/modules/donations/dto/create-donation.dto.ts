import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDonorDto } from '../../donors/dto/create-donor.dto';
import { DonationCurrency } from '../enums/donations.enum';

export class CreateDonationDto extends CreateDonorDto {
  @ApiProperty({
    description: 'Amount of the donation',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Currency of the donation',
    enum: DonationCurrency,
    example: DonationCurrency.USD,
  })
  @IsEnum(DonationCurrency)
  @IsNotEmpty()
  currency: DonationCurrency;

  @ApiProperty({
    description: 'Message from the donor',
    example: 'Keep up the good work!',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}
