import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://optktvmklhjeaahwjgll.supabase.co",
  "sb_publishable_KlQj1Lwt8-8ct0im8dtHxA_NfR0mnd9" // ← PUBLIC KEY
);
