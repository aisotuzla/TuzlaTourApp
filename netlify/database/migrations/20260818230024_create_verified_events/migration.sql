CREATE TABLE "verified_events" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"start_date" date NOT NULL,
	"start_time" text NOT NULL,
	"venue_name" text NOT NULL,
	"city" text DEFAULT 'Tuzla' NOT NULL,
	"price" text,
	"source_urls" text[] NOT NULL,
	"verification_sources" text[] NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
