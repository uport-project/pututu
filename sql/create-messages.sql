-- Table: public.messages

-- DROP TABLE public.messages;

CREATE TABLE public.messages
(
  id character varying(66) NOT NULL, -- Identifier
  sender character varying(66) NOT NULL, -- Sender
  recipient character varying(66) NOT NULL, -- Recipient
  message text NOT NULL, -- Message
  CONSTRAINT messages_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.messages
  OWNER TO root;
COMMENT ON COLUMN public.messages.id IS 'Identifier';
COMMENT ON COLUMN public.messages.sender IS 'Sender';
COMMENT ON COLUMN public.messages.recipient IS 'Recipient';
COMMENT ON COLUMN public.messages.message IS 'Message';


-- Index: public.recipient_idx

-- DROP INDEX public.recipient_idx;

CREATE INDEX recipient_idx
  ON public.messages
  USING btree
  (recipient COLLATE pg_catalog."default");
