ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "project_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "project_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "organization_id" SET DATA TYPE text;