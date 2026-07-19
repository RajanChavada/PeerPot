import { base44 } from "@/api/base44Client";

export interface DepositResult { ok: boolean; ref: string; mocked: boolean }

export const unifold = {
  async deposit(userId: string, amount: number): Promise<DepositResult> {
    if (amount <= 0) throw new Error("amount must be positive");
    
    try {
      const response = await base44.functions.invoke("unifold-deposit", {
        userId,
        amount
      });
      
      const data = response.data;
      if (data && data.ok) {
        return { ok: true, ref: data.ref, mocked: data.mocked };
      }
      
      throw new Error(data?.error || "Unknown error calling unifold-deposit");
    } catch (err) {
      console.warn("Unifold request failed, falling back to mock:", err);
      return { ok: true, ref: `mock-fallback:${userId}:${amount}`, mocked: true };
    }
  }
};
