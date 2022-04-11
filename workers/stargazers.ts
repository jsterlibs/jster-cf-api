export default {
  async fetch(
    request: Request,
    // env: { cfAccountId: string; cfApiToken: string; apiSecret: string },
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
    // TODO: Use auth with gh api to increase api limit
    // TODO: Cache responses using kv (cache for a day)

    // Example
    // https://api.github.com/repos/plotly/dash
    const response = await fetch(
      `https://api.github.com/repos/${organization}/${repository}`,
    );
    const { stargazers_count: stargazers } = await response.json();

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
