import { IsArray, IsInt, Min } from 'class-validator';

export class ImportConfirmDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  skipRowIndices!: number[];
}
