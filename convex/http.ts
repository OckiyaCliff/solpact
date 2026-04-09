import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/solana-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        console.log("Received Solana webhook:", body);

        // Placeholder for webhook logic
        // e.g., if (body.type === 'transaction') { await ctx.runMutation(api.donations.recordDonation, { ... }) }

        return new Response(null, { status: 200 });
    }),
});

export default http;
