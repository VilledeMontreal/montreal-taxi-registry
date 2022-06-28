-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id serial NOT NULL,
	email varchar(255) NULL,
	"password" varchar(255) NULL,
	active bool NULL,
	confirmed_at timestamp NULL,
	apikey varchar(36) NOT NULL,
	commercial_name varchar NULL,
	email_customer varchar NULL,
	email_technical varchar NULL,
	hail_endpoint_production varchar NULL,
	hail_endpoint_staging varchar NULL,
	hail_endpoint_testing varchar NULL,
	phone_number_customer varchar NULL,
	phone_number_technical varchar NULL,
	operator_api_key varchar NULL,
	operator_header_name varchar NULL,
	is_hail_enabled bool NULL,
	CONSTRAINT user_email_key UNIQUE (email),
	CONSTRAINT user_pkey PRIMARY KEY (id)
);


-- public."ADS" definition

-- Drop table

-- DROP TABLE public."ADS";

CREATE TABLE public."ADS" (
	id serial NOT NULL,
	numero varchar NOT NULL,
	doublage bool NULL,
	added_at timestamp NULL,
	added_by int4 NULL,
	added_via via NULL,
	last_update_at timestamp NULL,
	"source" varchar(255) NOT NULL,
	insee varchar NOT NULL,
	vehicle_id int4 NULL,
	category varchar NOT NULL,
	owner_name varchar NOT NULL,
	owner_type owner_type_enum NOT NULL,
	zupc_id int4 NULL,
	vdm_vignette varchar NOT NULL,
	CONSTRAINT "ADS_pkey" PRIMARY KEY (id),
	CONSTRAINT uq_ads UNIQUE (numero,added_by,insee)
);


-- public."ZUPC" definition

-- Drop table

-- DROP TABLE public."ZUPC";

CREATE TABLE public."ZUPC" (
	id int4 NOT NULL,
	departement_id int4 NULL,
	nom varchar(255) NOT NULL,
	insee varchar NULL,
	parent_id int4 NULL,
	shape geography NULL,
	active bool NOT NULL,
	max_distance int4 NULL,
	CONSTRAINT "ZUPC_pkey" PRIMARY KEY (id)
);


-- public.alembic_version definition

-- Drop table

-- DROP TABLE public.alembic_version;

CREATE TABLE public.alembic_version (
	version_num varchar(32) NOT NULL
);


-- public.anonymization definition

-- Drop table

-- DROP TABLE public.anonymization;

CREATE TABLE public.anonymization (
	last_processed_read_only_after timestamp NOT NULL
);


-- public."constructor" definition

-- Drop table

-- DROP TABLE public."constructor";

CREATE TABLE public."constructor" (
	id serial NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT constructor_name_key UNIQUE ("name"),
	CONSTRAINT constructor_pkey PRIMARY KEY (id)
);


-- public.customer definition

-- Drop table

-- DROP TABLE public.customer;

CREATE TABLE public.customer (
	id varchar NOT NULL,
	moteur_id int4 NOT NULL,
	added_at timestamp NULL,
	added_by int4 NULL,
	added_via sources NOT NULL,
	last_update_at timestamp NULL,
	"source" varchar(255) NOT NULL,
	ban_begin timestamp NULL,
	ban_end timestamp NULL,
	phone_number varchar NULL,
	reprieve_begin timestamp NULL,
	reprieve_end timestamp NULL,
	CONSTRAINT customer_pkey PRIMARY KEY (id,moteur_id)
);


-- public.departement definition

-- Drop table

-- DROP TABLE public.departement;

CREATE TABLE public.departement (
	id serial NOT NULL,
	nom varchar(255) NOT NULL,
	numero varchar NOT NULL,
	CONSTRAINT departement_pkey PRIMARY KEY (id)
);


-- public.driver definition

-- Drop table

-- DROP TABLE public.driver;

CREATE TABLE public.driver (
	added_at timestamp NULL,
	added_via sources_driver NOT NULL,
	"source" varchar(255) NOT NULL,
	last_update_at timestamp NULL,
	id serial NOT NULL,
	departement_id int4 NULL,
	added_by int4 NULL,
	birth_date date NULL,
	first_name varchar(255) NOT NULL,
	last_name varchar(255) NOT NULL,
	professional_licence varchar NOT NULL,
	CONSTRAINT driver_pkey PRIMARY KEY (id),
	CONSTRAINT uq_driver UNIQUE (departement_id,added_by,professional_licence)
);


-- public.essai definition

-- Drop table

-- DROP TABLE public.essai;

CREATE TABLE public.essai (
	ch1 bpchar(20) NULL
);


-- public.hail definition

-- Drop table

-- DROP TABLE public.hail;

CREATE TABLE public.hail (
	id varchar NOT NULL DEFAULT nextval('hail_id_seq'::regclass),
	creation_datetime timestamp NOT NULL,
	taxi_id varchar NOT NULL,
	status hail_status NOT NULL,
	last_status_change timestamp NULL,
	operateur_id int4 NULL,
	added_by int4 NULL,
	last_update_at timestamp NULL,
	customer_address varchar NOT NULL,
	customer_phone_number varchar NULL,
	taxi_phone_number varchar NULL,
	reporting_customer bool NULL,
	reporting_customer_reason reporting_customer_reason_enum NULL,
	incident_customer_reason incident_customer_reason_enum NULL,
	incident_taxi_reason incident_taxi_reason_enum NULL,
	rating_ride_reason rating_ride_reason_enum NULL,
	rating_ride int4 NULL,
	change_to_accepted_by_customer timestamp NULL,
	change_to_accepted_by_taxi timestamp NULL,
	change_to_declined_by_customer timestamp NULL,
	change_to_declined_by_taxi timestamp NULL,
	change_to_failure timestamp NULL,
	change_to_incident_customer timestamp NULL,
	change_to_incident_taxi timestamp NULL,
	change_to_received_by_operator timestamp NULL,
	change_to_received_by_taxi timestamp NULL,
	change_to_sent_to_operator timestamp NULL,
	change_to_customer_on_board timestamp NULL,
	change_to_finished timestamp NULL,
	customer_lat float8 NULL,
	customer_lon float8 NULL,
	read_only_after timestamp NULL,
	CONSTRAINT hail_pkey PRIMARY KEY (id)
);


-- public.ldap_role definition

-- Drop table

-- DROP TABLE public.ldap_role;

CREATE TABLE public.ldap_role (
	id serial NOT NULL,
	"name" varchar(80) NULL,
	description varchar(255) NULL,
	CONSTRAINT ldap_role_name_key UNIQUE ("name"),
	CONSTRAINT ldap_role_pkey PRIMARY KEY (id)
);


-- public.ldap_roles_ldap_users definition

-- Drop table

-- DROP TABLE public.ldap_roles_ldap_users;

CREATE TABLE public.ldap_roles_ldap_users (
	ldap_user_id int4 NULL,
	ldap_role_id int4 NULL
);


-- public.ldap_user definition

-- Drop table

-- DROP TABLE public.ldap_user;

CREATE TABLE public.ldap_user (
	id serial NOT NULL,
	uid varchar(50) NOT NULL,
	gn varchar(50) NULL,
	sn varchar(50) NULL,
	active bool NOT NULL DEFAULT true,
	CONSTRAINT ldap_user_pkey PRIMARY KEY (id),
	CONSTRAINT ldap_user_uid_key UNIQUE (uid)
);


-- public.logo definition

-- Drop table

-- DROP TABLE public.logo;

CREATE TABLE public.logo (
	id uuid NOT NULL,
	"size" varchar NULL,
	format_ varchar NULL,
	user_id int4 NULL,
	CONSTRAINT logo_pkey PRIMARY KEY (id)
);


-- public.model definition

-- Drop table

-- DROP TABLE public.model;

CREATE TABLE public.model (
	id serial NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT model_name_key UNIQUE ("name"),
	CONSTRAINT model_pkey PRIMARY KEY (id)
);


-- public.parametre definition

-- Drop table

-- DROP TABLE public.parametre;

CREATE TABLE public.parametre (
	id serial NOT NULL,
	"key" varchar(255) NOT NULL,
	value varchar NOT NULL,
	CONSTRAINT parametre_pkey PRIMARY KEY (id)
);


-- public."role" definition

-- Drop table

-- DROP TABLE public."role";

CREATE TABLE public."role" (
	id serial NOT NULL,
	"name" varchar(80) NULL,
	description varchar(255) NULL,
	CONSTRAINT role_name_key UNIQUE ("name"),
	CONSTRAINT role_pkey PRIMARY KEY (id)
);


-- public.roles_users definition

-- Drop table

-- DROP TABLE public.roles_users;

CREATE TABLE public.roles_users (
	user_id int4 NULL,
	role_id int4 NULL
);


-- public.spatial_ref_sys definition

-- Drop table

-- DROP TABLE public.spatial_ref_sys;

CREATE TABLE public.spatial_ref_sys (
	srid int4 NOT NULL,
	auth_name varchar(256) NULL,
	auth_srid int4 NULL,
	srtext varchar(2048) NULL,
	proj4text varchar(2048) NULL,
	CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid),
	CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999)))
);


-- public.taxi definition

-- Drop table

-- DROP TABLE public.taxi;

CREATE TABLE public.taxi (
	added_at timestamp NULL,
	added_via sources_taxi NOT NULL,
	"source" varchar(255) NOT NULL,
	last_update_at timestamp NULL,
	id varchar NOT NULL DEFAULT nextval('taxi_id_seq'::regclass),
	vehicle_id int4 NULL,
	ads_id int4 NULL,
	added_by int4 NULL,
	driver_id int4 NULL,
	rating float8 NULL,
	ban_begin timestamp NULL,
	ban_end timestamp NULL,
	private bool NULL DEFAULT false,
	CONSTRAINT taxi_pkey PRIMARY KEY (id)
);
CREATE INDEX tmp_taxi_added_by ON public.taxi (added_by);


-- public.test_table definition

-- Drop table

-- DROP TABLE public.test_table;

CREATE TABLE public.test_table (
	"name" varchar(15) NULL,
	geom geometry NULL
);


-- public.us_gaz definition

-- Drop table

-- DROP TABLE public.us_gaz;

CREATE TABLE public.us_gaz (
	id serial NOT NULL,
	seq int4 NULL,
	word text NULL,
	stdword text NULL,
	"token" int4 NULL,
	is_custom bool NOT NULL DEFAULT true,
	CONSTRAINT pk_us_gaz PRIMARY KEY (id)
);


-- public.us_lex definition

-- Drop table

-- DROP TABLE public.us_lex;

CREATE TABLE public.us_lex (
	id serial NOT NULL,
	seq int4 NULL,
	word text NULL,
	stdword text NULL,
	"token" int4 NULL,
	is_custom bool NOT NULL DEFAULT true,
	CONSTRAINT pk_us_lex PRIMARY KEY (id)
);


-- public.us_rules definition

-- Drop table

-- DROP TABLE public.us_rules;

CREATE TABLE public.us_rules (
	id serial NOT NULL,
	"rule" text NULL,
	is_custom bool NOT NULL DEFAULT true,
	CONSTRAINT pk_us_rules PRIMARY KEY (id)
);


-- public.user2 definition

-- Drop table

-- DROP TABLE public.user2;

CREATE TABLE public.user2 (
	id serial NOT NULL,
	email varchar(255) NULL,
	CONSTRAINT user_email_key2 UNIQUE (email),
	CONSTRAINT user_pkey2 PRIMARY KEY (id)
);


-- public.vehicle definition

-- Drop table

-- DROP TABLE public.vehicle;

CREATE TABLE public.vehicle (
	id serial NOT NULL,
	licence_plate varchar(80) NOT NULL,
	added_by_user int4 NULL,
	CONSTRAINT vehicle_pkey PRIMARY KEY (id)
);


-- public.vehicle_description definition

-- Drop table

-- DROP TABLE public.vehicle_description;

CREATE TABLE public.vehicle_description (
	added_at timestamp NULL,
	added_via sources NOT NULL,
	"source" varchar(255) NOT NULL,
	last_update_at timestamp NULL,
	id serial NOT NULL,
	model_id int4 NULL,
	constructor_id int4 NULL,
	model_year int4 NULL,
	engine varchar(80) NULL,
	horse_power float8 NULL,
	relais bool NULL,
	horodateur varchar(255) NULL,
	taximetre varchar(255) NULL,
	date_dernier_ct date NULL,
	date_validite_ct date NULL,
	special_need_vehicle bool NULL,
	type_ vehicle_enum NULL,
	luxury bool NULL,
	credit_card_accepted bool NULL,
	nfc_cc_accepted bool NULL,
	amex_accepted bool NULL,
	bank_check_accepted bool NULL,
	fresh_drink bool NULL,
	dvd_player bool NULL,
	tablet bool NULL,
	wifi bool NULL,
	baby_seat bool NULL,
	bike_accepted bool NULL,
	pet_accepted bool NULL,
	air_con bool NULL,
	electronic_toll bool NULL,
	gps bool NULL,
	cpam_conventionne bool NULL,
	every_destination bool NULL,
	color varchar(255) NULL,
	vehicle_id int4 NULL,
	added_by int4 NULL,
	nb_seats int4 NULL,
	"last_nonStatus_update_at" timestamp NULL,
	vehicle_identification_number varchar(255) NULL,
	CONSTRAINT uq_vehicle_description UNIQUE (vehicle_id,added_by),
	CONSTRAINT vehicle_description_pkey PRIMARY KEY (id)
);


-- public."ADS" foreign keys

-- public."ZUPC" foreign keys

-- public.alembic_version foreign keys

-- public.anonymization foreign keys

-- public."constructor" foreign keys

-- public.customer foreign keys

-- public.departement foreign keys

-- public.driver foreign keys

-- public.essai foreign keys

-- public.hail foreign keys

-- public.ldap_role foreign keys

-- public.ldap_roles_ldap_users foreign keys

-- public.ldap_user foreign keys

-- public.logo foreign keys

-- public.model foreign keys

-- public.parametre foreign keys

-- public."role" foreign keys

-- public.roles_users foreign keys

-- public.spatial_ref_sys foreign keys

-- public.taxi foreign keys

ALTER TABLE public.taxi ADD CONSTRAINT taxi_added_by_fkey FOREIGN KEY (added_by) REFERENCES public."user"(id);
ALTER TABLE public.taxi ADD CONSTRAINT taxi_ads_id_fkey FOREIGN KEY (ads_id) REFERENCES public."ADS"(id);
ALTER TABLE public.taxi ADD CONSTRAINT taxi_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.driver(id);
ALTER TABLE public.taxi ADD CONSTRAINT taxi_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicle(id);


-- public.test_table foreign keys

-- public.us_gaz foreign keys

-- public.us_lex foreign keys

-- public.us_rules foreign keys

-- public.user2 foreign keys

-- public.vehicle foreign keys

-- public.vehicle_description foreign keys

ALTER TABLE public.vehicle_description ADD CONSTRAINT vehicle_description_added_by_fkey FOREIGN KEY (added_by) REFERENCES public."user"(id);
ALTER TABLE public.vehicle_description ADD CONSTRAINT vehicle_description_constructor_id_fkey FOREIGN KEY (constructor_id) REFERENCES public."constructor"(id);
ALTER TABLE public.vehicle_description ADD CONSTRAINT vehicle_description_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.model(id);
ALTER TABLE public.vehicle_description ADD CONSTRAINT vehicle_description_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicle(id);