CREATE TABLE public.question_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  answered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.question_logs TO service_role;

ALTER TABLE public.question_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_question_logs_created_at ON public.question_logs (created_at DESC);