import { createAppAuth } from "https://cdn.skypack.dev/@octokit/auth-app@3.6.1";
import type { KVNamespace } from "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.2/common/cloudflare_workers_types.d.ts";

const ONE_DAY = 1000 * 60 * 60 * 24;
const JSON_OK = {
  status: 200,
  headers: {
    "content-type": "application/json",
  },
};

// TODO: The problem here is that GitHub can run out of quota. To solve,
// don't cache if there's no result.
//
// Also some repositories don't exist on GitHub. That case should likely
// be detected and handled as well.
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

    const organization = searchParams.get("organization");
    const repository = searchParams.get("repository");

    if (!organization) {
      return new Response(
        `{ "error": "Missing organization query parameter" }`,
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }

    if (!repository) {
      return new Response(`{ "error": "Missing repository query parameter" }`, {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const itemKey = `${organization}-${repository}`;

    // @ts-ignore The type is wrong here
    const { value, metadata } = await env.db.getWithMetadata(itemKey, {
      type: "text",
    });
    // In ms
    const currentTime = (new Date()).getTime();

    if (metadata && (metadata.timestamp > currentTime - ONE_DAY)) {
      return new Response(JSON.stringify({ stargazers: value }), JSON_OK);
    }

    const auth = createAppAuth({
      appId: 1,
      privateKey: env.privateKey,
      clientId: env.clientId,
      clientSecret: env.clientSecret,
    });

    const jwt = await auth({ type: "app" });

    const response = await fetch(
      `https://api.github.com/repos/${organization}/${repository}`,
      {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": jwt.token,
          // https://stackoverflow.com/questions/39907742/github-api-is-responding-with-a-403-when-using-requests-request-function
          "User-Agent": "request",
        },
      },
    );
    const responseJson = await response.json();
    const { stargazers_count: stargazers } = responseJson;

    await env.db.put(itemKey, stargazers, {
      metadata: {
        timestamp: currentTime,
      },
    });

    return new Response(
      JSON.stringify({ stargazers }),
      JSON_OK,
    );
  },
};
