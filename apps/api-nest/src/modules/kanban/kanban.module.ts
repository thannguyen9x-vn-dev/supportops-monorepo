import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { TaskController } from './task.controller';
import { BoardService } from './board.service';
import { TaskService } from './task.service';

@Module({
  controllers: [BoardController, TaskController],
  providers: [BoardService, TaskService],
  exports: [BoardService, TaskService],
})
export class KanbanModule {}
