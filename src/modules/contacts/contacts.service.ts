import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contacts.entitie';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
	constructor(
		@InjectRepository(Contact)
		private readonly contactsRepo: Repository<Contact>,
	) { }

	create(createContactDto: CreateContactDto) {
		const contact = this.contactsRepo.create(createContactDto);
		return this.contactsRepo.save(contact);
	}

	findAll() {
		return this.contactsRepo.find({
			order: { createdAt: 'DESC' },
		});
	}
}