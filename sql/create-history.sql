-- Table: public.history

-- DROP TABLE public.history;

CREATE TABLE public.history
(
  id character varying(66) NOT NULL, -- Identifier
  message_id character varying(66) NOT NULL, -- Message Identifier
  time_stamp timestamp with time zone NOT NULL, -- TimeStamp
  event character varying(32) NOT NULL, -- Event type
  CONSTRAINT history_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.history
  OWNER TO root;
COMMENT ON COLUMN public.history.id IS 'Identifier';
COMMENT ON COLUMN public.history.message_id IS 'Message Identifier';
COMMENT ON COLUMN public.history.time_stamp IS 'TimeStamp';
COMMENT ON COLUMN public.history.event IS 'Event type';


-- Index: public.message_id_idx

-- DROP INDEX public.message_id_idx;

CREATE INDEX message_id_idx
  ON public.history
  USING btree
  (message_id COLLATE pg_catalog."default");
