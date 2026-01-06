import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssociateGroupDto {
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}
