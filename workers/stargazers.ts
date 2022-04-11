export default {
  async fetch(
    request: Request,
    env: { privateKey1: string; privateKey2: string; privateKey3: string },
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

    const privateKey = [env.privateKey1, env.privateKey2, env.privateKey3].join(
      "\n",
    );
    const response = await fetch(
      `https://api.github.com/repos/${organization}/${repository}`,
      {
        headers: {
          "Accept": "application/vnd.github.v3+json",

          // TODO: Get from env
          "Authorization": `Bearer ${privateKey}`,
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
