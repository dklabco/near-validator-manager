import { Request, Response } from "restify";
import { outputView } from "./helper";
import somnus, { IRouteConfig } from "somnus";
import { join } from "path";
import { poolIdGetAccountsJsonRenderer, poolIdGetAccountsPageRenderer } from "./request-handlers/poolId-get-accounts";

async function main(): Promise<void> {

    process.chdir(__dirname);

    // somnus.server.pre(somnus.restify.pre.sanitizePath());
    somnus.server.use(somnus.restify.plugins.bodyParser());
    somnus.server.use(somnus.restify.plugins.queryParser());

    somnus.server.get('/test', (req: Request, res: Response) => res.send(200, { query: req.query.foo, what: true }));

    let routeConfig: IRouteConfig = {

        // @TODO SSR the component
        "get /": (req: Request, res: Response) => outputView(req, res, "./view-templates/index.html"),

        // @TODO support pagination
        "get /validator/:poolId/get_accounts/view": poolIdGetAccountsPageRenderer,
        "get /validator/:poolId/get_accounts": poolIdGetAccountsJsonRenderer,

        // @TODO implement this
        "put /config": (req: Request, res: Response) => res.send(200, { message: "config updated" }),

        // in real production, these should be intercepted & handled by a reverse proxy / CDN instead
        "get /js/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
        "get /css/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
        "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: "../public" })

    };

    // special config for dev
    if (process.env.NODE_ENV !== "production") {

        const initWebpackDevMiddleware = require("./webpack-dev-middleware-connector").default;
        initWebpackDevMiddleware(somnus.server);

        routeConfig = {
            ...routeConfig,

            "get /": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
            "get /js/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
            "get /*hot-update.json": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
            "get /*hot-update.js": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
            "get /css/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
            "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR })

        }

    }

    somnus.start({ routeConfig }, (addr) => {
        somnus.logger.info({ app_message: `server listening on port ${addr.port}`});

        // just so it's extra clear where to access the app
        console.log(`app ${process.env.BUILD_SIGNATURE}, server env ${process.env.NODE_ENV}, ` +
          `accessible at http://localhost:${addr.port}`);

    });

}

somnus.logger.info({ app_message: `starting up...`});
main();
