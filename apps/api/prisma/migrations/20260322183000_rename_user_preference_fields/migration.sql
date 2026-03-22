ALTER TABLE "UserPreference" RENAME COLUMN "companyNews" TO "assignmentAlerts";
ALTER TABLE "UserPreference" RENAME COLUMN "accountActivity" TO "statusUpdateAlerts";
ALTER TABLE "UserPreference" RENAME COLUMN "meetupsNearYou" TO "slaRiskAlerts";
ALTER TABLE "UserPreference" RENAME COLUMN "newMessages" TO "escalationAlerts";
ALTER TABLE "UserPreference" RENAME COLUMN "ratingReminders" TO "resolutionReminders";
ALTER TABLE "UserPreference" RENAME COLUMN "itemUpdateNotif" TO "requestUpdateDigest";
ALTER TABLE "UserPreference" RENAME COLUMN "itemCommentNotif" TO "commentNotifications";
ALTER TABLE "UserPreference" RENAME COLUMN "buyerReviewNotif" TO "mentionNotifications";
