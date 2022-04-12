import { createAppAuth } from "https://cdn.skypack.dev/@octokit/auth-app@3.6.1";

// TODO: Cache responses using kv (cache for a day)
export default {
  async fetch(
    request: Request,
    env: {
      apiSecret: CryptoKey;
      clientId: CryptoKey;
      clientSecret: CryptoKey;
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
          "Authorization": `${jwt.token}`,
        },
      },
    );
    const responseJson = await response.json();
    const { stargazers_count: stargazers } = responseJson;

    return new Response(
      JSON.stringify({ stargazers }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  },
};
