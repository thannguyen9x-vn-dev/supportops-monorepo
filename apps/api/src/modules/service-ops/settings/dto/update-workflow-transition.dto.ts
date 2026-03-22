import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowTransitionDto } from './create-workflow-transition.dto';

export class UpdateWorkflowTransitionDto extends PartialType(CreateWorkflowTransitionDto) {}
