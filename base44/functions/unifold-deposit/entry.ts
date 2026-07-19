import { createClientFromRequest } from "npm:@base44/sdk";

export default Deno.serve(async (req) => {
  try {
    // Only accept POST requests with JSON payload
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { amount, userId } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: "Amount must be positive" }, { status: 400 });
    }
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const secretKey = Deno.env.get("UNIFOLD_SECRET_KEY") || Deno.env.get("VITE_UNIFOLD_SECRET_KEY");
    
    if (!secretKey) {
      console.warn("No UNIFOLD_SECRET_KEY configured, returning mock success.");
      return Response.json({ 
        ok: true, 
        ref: `mock-unconfigured:${userId}:${amount}`, 
        mocked: true 
      });
    }

    const res = await fetch("https://api.unifold.io/v1/payment_intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        destination_amount: Math.round(amount * 1_000_000).toString(),
        destination_currency: "usdc",
        destination_network: "base",
        recipient_address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        external_user_id: userId,
        metadata: { source: "stakes-app" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`Unifold API error (${res.status}):`, body);
      return Response.json({ 
        ok: true, 
        ref: `mock-fallback:${userId}:${amount}`, 
        mocked: true,
        error: body 
      });
    }

    const data = await res.json();
    return Response.json({
      ok: true,
      ref: data.id || `unifold:${userId}`,
      mocked: false
    });

  } catch (error) {
    console.error("Error in unifold-deposit:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});
