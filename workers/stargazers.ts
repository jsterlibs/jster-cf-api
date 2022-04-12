import { createAppAuth } from "https://cdn.skypack.dev/@octokit/auth-app@3.6.1";

export default {
  async fetch(
    request: Request,
    env: { clientId: string; clientSecret: string; privateKey: CryptoKey },
  ) {
    const { searchParams } = new URL(request.url);
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

    // TODO: Add token in front (see survivejs api)
    // TODO: Cache responses using kv (cache for a day)
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
