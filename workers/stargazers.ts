export default {
  fetch(
    // request: Request,
    // env: { cfAccountId: string; cfApiToken: string; apiSecret: string },
  ) {
    // TODO: Add token in front (see survivejs api)
    // TODO: Get data from gh api
    // TODO: Use auth with gh api to increase api limit
    // TODO: Cache responses using kv (cache for a day)
    return new Response('stargazers');
  },
};
