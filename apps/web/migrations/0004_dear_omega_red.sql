ALTER TABLE "invitations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "inviter_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "project_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "project_settings" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "active_organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "project_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "organization_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "translations" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();