import { Controller, Post, Body } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonorDto } from './dto/create-donor.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Donors')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new donor' })
  @ApiResponse({ status: 201, description: 'The donor has been successfully created.' })
  @ApiResponse({ status: 409, description: 'Donor with this email already exists.' })
  
  create(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.findOrCreate(createDonorDto);
  }
}
