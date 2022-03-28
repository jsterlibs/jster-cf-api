# jster-cf-api

This repository contains the API related to jster.net.

The code in the repository depends on [Deno](https://deno.land/) and [velociraptor](https://velociraptor.run/) so make sure you have those installed. Run `vr` to see the all available commands.

## Using workers

The repository includes the following workers:

* `ping` returns a `pong` text for testing

To get started with the workers, copy `denoflare.tpl.json` as `.denoflare` and make sure you [denoflare](https://denoflare.dev/) installed.

To run a worker locally, use `vr worker:serve-<worker name>`.

To publish, use `worker:publish-<worker name>`. For this, you have to take care to configure Cloudflare first so that workers are enabled. After initial publish, you have to enable the route through the `Triggers` tab related to the worker at Cloudflare UI.

Once it's running, you'll have something like `https://<worker name>.mynamespace.workers.dev/` available for the worker.

## Reference

* [Workers documentation](https://developers.cloudflare.com/workers/)

## TODO

* TODO

## Caveats

* TODO