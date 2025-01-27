import { ApiFile } from '../../shared/api-file.decorator';
import { CreateTestRequestDto } from './create-test-request.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTestRequestMultipartDto extends CreateTestRequestDto {
  @ApiFile()
  image: Express.Multer.File;
}

export class CreateTestRequestMultipartBaselineBranchDto extends CreateTestRequestMultipartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baselineBranchName?: string;
}
