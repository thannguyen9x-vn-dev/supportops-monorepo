import { ApiProperty } from '@nestjs/swagger';

export class RequestAssigneeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ nullable: true })
  roleCode!: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  static from(input: {
    id: string;
    email: string;
    fullName: string;
    roleCode: string | null;
    avatarUrl: string | null;
  }): RequestAssigneeResponseDto {
    const dto = new RequestAssigneeResponseDto();
    dto.id = input.id;
    dto.email = input.email;
    dto.fullName = input.fullName;
    dto.roleCode = input.roleCode;
    dto.avatarUrl = input.avatarUrl;
    return dto;
  }
}
