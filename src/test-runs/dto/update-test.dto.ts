import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTestRunDto {
  @ApiProperty()
  @IsString()
  readonly comment: string;
  readonly tempIgnoreAreas?: string;
  readonly ignoreAreas?: string;
}
