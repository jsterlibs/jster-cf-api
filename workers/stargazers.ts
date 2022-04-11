export default {
  fetch(
    request: Request,
    // env: { cfAccountId: string; cfApiToken: string; apiSecret: string },
  ) {
    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo')

    if (!repo) {
      return new Response(`{ "error": "Missing repository query parameter" }`, {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // TODO: Add token in front (see survivejs api)
    // TODO: Get data from gh api
    // TODO: Use auth with gh api to increase api limit
    // TODO: Cache responses using kv (cache for a day)

    // Example
    // https://api.github.com/repos/plotly/dash

    return new Response(repo);
  },
};
