import { ApiProperty } from '@nestjs/swagger';
import { UserPreference } from '@prisma/client';

export class UserPreferencesResponseDto {
  @ApiProperty()
  companyNews!: boolean;

  @ApiProperty()
  accountActivity!: boolean;

  @ApiProperty()
  meetupsNearYou!: boolean;

  @ApiProperty()
  newMessages!: boolean;

  @ApiProperty()
  ratingReminders!: boolean;

  @ApiProperty()
  itemUpdateNotif!: boolean;

  @ApiProperty()
  itemCommentNotif!: boolean;

  @ApiProperty()
  buyerReviewNotif!: boolean;

  static from(preference: UserPreference): UserPreferencesResponseDto {
    return {
      companyNews: preference.companyNews,
      accountActivity: preference.accountActivity,
      meetupsNearYou: preference.meetupsNearYou,
      newMessages: preference.newMessages,
      ratingReminders: preference.ratingReminders,
      itemUpdateNotif: preference.itemUpdateNotif,
      itemCommentNotif: preference.itemCommentNotif,
      buyerReviewNotif: preference.buyerReviewNotif,
    };
  }
}
