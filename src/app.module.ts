import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { DonorsModule } from './modules/donors/donors.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { DonationsModule } from './modules/donations/donations.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    DonorsModule,
    ContactsModule,
    DonationsModule,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger('Database');

  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('Postgres iniciado 🚀');
    }
  }
}
