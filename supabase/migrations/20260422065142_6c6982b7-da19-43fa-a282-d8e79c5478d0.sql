
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('text-to-morse','morse-to-text')),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own translations"
  ON public.translations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own translations"
  ON public.translations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own translations"
  ON public.translations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translations"
  ON public.translations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX translations_user_created_idx ON public.translations(user_id, created_at DESC);
