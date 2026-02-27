import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDonorDto {
  @ApiProperty({
    description: 'Email address of the donor',
    example: 'donor@example.com',
  })
  
  @IsNotEmpty()
  identification: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Full name of the donor',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;
}
