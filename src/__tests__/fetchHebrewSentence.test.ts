import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchHebrewSentence } from "@/utils/fetchHebrewSentence";
import { supabase } from "@/integrations/supabase/client";
// Mock supabase.functions.invoke
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("fetchHebrewSentence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a sentence when Supabase succeeds", async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { sentence: "זוהי דוגמה" },
      error: null,
    });

    const result = await fetchHebrewSentence("heart");
    expect(result).toBe("זוהי דוגמה");
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "get-sentence-gorq",
      { body: { word: "heart" } }
    );
  });

  it("returns empty string when Supabase returns an error", async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: "Something went wrong" },
    });

    const result = await fetchHebrewSentence("liver");
    expect(result).toBe("");
  });

  it("returns empty string when an exception is thrown", async () => {
    (supabase.functions.invoke as any).mockRejectedValue(
      new Error("Network failure")
    );

    const result = await fetchHebrewSentence("brain");
    expect(result).toBe("");
  });

  it("returns empty string when no sentence exists", async () => {
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {}, // missing `sentence`
      error: null,
    });

    const result = await fetchHebrewSentence("stomach");
    expect(result).toBe("");
  });
});