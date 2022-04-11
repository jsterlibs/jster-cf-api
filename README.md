# jster-cf-api

This repository contains the API related to jster.net.

The code in the repository depends on [Deno](https://deno.land/) and [velociraptor](https://velociraptor.run/) so make sure you have those installed. Run `vr` to see the all available commands.

## Using workers

The repository includes the following workers:

* `ping` returns a `pong` text for testing
* `stargazers` returns the amount of stargazers related to a repository. This needs extra config (see below)

To get started with the workers, copy `denoflare.tpl.json` as `.denoflare` and make sure you [denoflare](https://denoflare.dev/) installed.

To run a worker locally, use `vr worker:serve-<worker name>`.

To publish, use `worker:publish-<worker name>`. For this, you have to take care to configure Cloudflare first so that workers are enabled. After initial publish, you have to enable the route through the `Triggers` tab related to the worker at Cloudflare UI.

Once it's running, you'll have something like `https://<worker name>.mynamespace.workers.dev/` available for the worker.

## Configuring stargazers

The stargazers endpoint needs a private key. Set it up like this:

1. Head to https://github.com/organizations/jsterlibs/settings/apps/jster-cloudflare-api and generate one using the `Private keys` section
2. Paste the private key somewhere
3. Split it using `split -l 10 private-key-pkcs8.pem`. This generates `xaa`, `xab`, and `xac`.
4. Set the parts to `PRIVATE_KEY_1`, `PRIVATE_KEY_2`, and `PRIVATE_KEY_3` at Denoflare env (`.denoflare`)

## Reference

* [Workers documentation](https://developers.cloudflare.com/workers/)
* [GitHub rate limits](https://docs.github.com/en/developers/apps/building-github-apps/rate-limits-for-github-apps) - it seems for apps, the limit is 5000 requests per hour meaning a caching strategy is a good thing to have
* [GitHub apps with Cloudflare workers](https://github.com/gr2m/cloudflare-worker-github-app-example)

## TODO

* TODO

## Caveats

* TODO