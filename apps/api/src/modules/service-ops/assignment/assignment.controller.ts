import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { AssignmentService } from './assignment.service';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get()
  @Permissions({ any: ['request.read.all', 'request.assign', 'request.reassign'] })
  @ApiOperation({ summary: 'List assignment history' })
  list(@CurrentTenant() tenantId: string, @Query() query: AssignmentQueryDto) {
    return this.assignmentService.list(tenantId, query);
  }
}
