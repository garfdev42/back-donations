import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Name of the contact person',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Email address of the contact person',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Message from the contact person',
    example: 'Hello, I would like to know more about your project.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  message: string;
}
