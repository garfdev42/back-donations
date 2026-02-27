import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new donation and donor (if not exists)' })
  @ApiResponse({ status: 201, description: 'The donation has been successfully created.' })
  
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all donations' })
  findAll() {
    return this.donationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a donation by id' })
  findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id);
  }
}
