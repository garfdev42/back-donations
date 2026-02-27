import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './contacts.controller';
import { Contact } from './entities/contacts.entitie';
import { ContactsService } from './contacts.service';

@Module({
    imports: [TypeOrmModule.forFeature([Contact])],
    controllers: [ContactsController],
    providers: [ContactsService],
})
export class ContactsModule { }