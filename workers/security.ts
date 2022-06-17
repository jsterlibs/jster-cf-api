import type { KVNamespace } from "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.2/common/cloudflare_workers_types.d.ts";

const ONE_DAY = 1000 * 60 * 60 * 24;
const JSON_OK = {
  status: 200,
  headers: {
    "content-type": "application/json",
  },
};

export default {
  async fetch(
    request: Request,
    env: {
      apiSecret: CryptoKey;
      clientId: CryptoKey;
      clientSecret: CryptoKey;
      db: KVNamespace;
      privateKey: CryptoKey;
    },
  ) {
    const { protocol, searchParams } = new URL(request.url);

    // In the case of a "Basic" authentication, the exchange
    // MUST happen over an HTTPS (TLS) connection to be secure.
    if (
      "https:" !== protocol ||
      "https" !== request.headers.get("x-forwarded-proto")
    ) {
      return new Response(
        `{ "error": "Please use a HTTPS connection" }`,
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }

    // Adapted from https://developers.cloudflare.com/workers/examples/auth-with-headers
    if (request.headers.get("Authorization") !== `Bearer ${env.apiSecret}`) {
      return new Response("You need to login.", { status: 401 });
    }

    // This is the name on npm
    const name = searchParams.get("name");

    if (!name) {
      return new Response(`{ "error": "Missing name query parameter" }`, {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // In ms
    const currentTime = (new Date()).getTime();

    // @ts-ignore The type is wrong here
    const { value, metadata } = await env.db.getWithMetadata(name, {
      type: "text",
    });

    if (metadata && (metadata.timestamp > currentTime - ONE_DAY)) {
      return new Response(value, JSON_OK);
    }

    const response = await fetch(
      `https://socket.dev/api/npm/package-info/score?name=${name}&low_priority=1`,
    );

    try {
      const responseJson = await response.json();
      const { score, metrics } = responseJson;
      const data = {
        score: {
          supplyChain: score.supplyChainRisk.score,
          quality: score.quality.score,
          maintenance: score.maintenance.score,
          vulnerability: score.vulnerability.score,
          license: score.license.score,
        },
        metrics,
      };

      await env.db.put(name, JSON.stringify(data), {
        metadata: {
          timestamp: currentTime,
        },
      });

      return new Response(
        JSON.stringify(data),
        JSON_OK,
      );
    } catch (_error) {
      return new Response(`{ "error": "Internal error" }`, {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  },
};
