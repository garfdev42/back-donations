import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new contact message' })
  @ApiResponse({ status: 201, description: 'The contact message has been successfully created.' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact messages' })
  findAll() {
    return this.contactsService.findAll();
  }
}
