import { PageMeta } from '../../../common/dto/page-meta.dto';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationListResponseDto {
  data!: NotificationResponseDto[];
  meta!: PageMeta;
}
