import { supabase } from "@/integrations/supabase/client";

// Utility to fetch a Hebrew sentence for a word using the Supabase Edge Function
export async function fetchHebrewSentence(word: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("get-sentence-gorq", {
      body: { word }
    });
    if (error) {
      console.error("Error from Supabase function:", error);
      return "";
    }
    // Supabase returns data as { sentence: string }
    return (data as any)?.sentence || "";
  } catch (err) {
    console.error("Error fetching sentence from Supabase function:", err);
    return "";
  }
}
