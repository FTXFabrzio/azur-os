CREATE TABLE `archivos_proyectos` (
	`id` text PRIMARY KEY NOT NULL,
	`proyecto_id` text NOT NULL,
	`etiqueta` text,
	`descripcion` text,
	`drive_file_link` text NOT NULL,
	`peso_kb` integer,
	`prioridad` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `availability_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `availability_rules_user_id_day_of_week_start_time_unique` ON `availability_rules` (`user_id`,`day_of_week`,`start_time`);--> statement-breakpoint
CREATE TABLE `business_resources` (
	`lead_id` text PRIMARY KEY NOT NULL,
	`company_name` text,
	`offer_details` text,
	`cv_analysis_summary` text,
	`file_url` text,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `client_prospects` (
	`lead_id` text PRIMARY KEY NOT NULL,
	`address` text,
	`square_meters` real,
	`materials` text,
	`has_blueprints` integer DEFAULT false,
	`requirements_detail` text,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `discarded_leads_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`reason` text NOT NULL,
	`period` text NOT NULL,
	`kommo_id` text,
	`contact_name` text,
	`phone` text,
	`discarded_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `lead_discard_reasons` (
	`lead_id` text PRIMARY KEY NOT NULL,
	`reason_detail` text,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`kommo_id` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`contact_name` text NOT NULL,
	`phone` text,
	`lead_entry_date` text,
	`status` text DEFAULT 'PENDING',
	`period` text DEFAULT 'MARZO',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_kommo_id_unique` ON `leads` (`kommo_id`);--> statement-breakpoint
CREATE INDEX `idx_leads_brand` ON `leads` (`brand`);--> statement-breakpoint
CREATE INDEX `idx_leads_category` ON `leads` (`category`);--> statement-breakpoint
CREATE TABLE `meeting_participants` (
	`meeting_id` text,
	`user_id` text,
	`status` text DEFAULT 'ESPERANDO',
	`notified_at` text,
	PRIMARY KEY(`meeting_id`, `user_id`),
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`address` text NOT NULL,
	`description` text,
	`start_datetime` text NOT NULL,
	`end_datetime` text NOT NULL,
	`type` text DEFAULT 'PRESENCIAL',
	`status` text DEFAULT 'PENDIENTE',
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text,
	`user_id` text,
	`content` text NOT NULL,
	`type` text DEFAULT 'text',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `proyectos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`codigo` text NOT NULL,
	`drive_folder_link` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proyectos_codigo_unique` ON `proyectos` (`codigo`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL,
	`phone` text,
	`is_available_early` integer DEFAULT false,
	`push_subscription` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);