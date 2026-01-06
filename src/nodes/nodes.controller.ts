import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssociateGroupDto } from './dto/associate-group.dto';

@Controller()
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.nodesService.createUser(
      createUserDto.name,
      createUserDto.email,
    );
  }

  @Post('groups')
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.nodesService.createGroup(
      createGroupDto.name,
      createGroupDto.parentId,
    );
  }

  @Post('users/:id/groups')
  @HttpCode(204)
  async associateUserToGroup(
    @Param('id') userId: string,
    @Body() dto: AssociateGroupDto,
  ) {
    await this.nodesService.addRelation(dto.groupId, userId);
  }

  @Get('users/:id/organizations')
  async getUserOrganizations(@Param('id') userId: string) {
    return this.nodesService.getUserOrganizations(userId);
  }

  @Get('nodes/:id/ancestors')
  async getAncestors(@Param('id') nodeId: string) {
    return this.nodesService.getAncestors(nodeId);
  }

  @Get('nodes/:id/descendants')
  async getDescendants(@Param('id') nodeId: string) {
    return this.nodesService.getDescendants(nodeId);
  }
}
