import Router from 'koa-router';

// Api routes
import user from '../api/users/user.routes';

import logger from '../logger';
const log = logger.create('Api');

export function displayInsecureBanner(env) {
  log.warning('=========================================')
    .warning('=   RUNNING WITH API IN INSECURE MODE   =');
  if (env === 'production') {
    log.warning('No authorization is required to access api')
      .warning('This mode is only intended for development!');
  }
  log.warning('=========================================');
}

export function register(router, secureApi) {
  // Register each of the api endpoints
  const endpoints = [user];
  for (const endpoint of endpoints) {
    const { routes, urlBase } = endpoint;
    for (const x of routes) {
      const { method, route, handlers } = x;
      const lastHandler = handlers.pop();

      // Secure the api, unless flag set in user.config OR endpoint/route has disabled auth
      if (secureApi) {
        if (!endpoint.disableAuth && !x.disableAuth) {
          // TODO SWITCH OUT JWT AUTH FOR PLEX AUTHENTICATION
          log.error('Secure api not yet implemented');
        }
      }

      // Register route with koa-router
      log.debug(`Registering [${method}@/api${urlBase + route}]`);
      router[method.toLowerCase()](
        `/api${urlBase + route}`,
        ...handlers,
        async (ctx) => await lastHandler(ctx)
      );
    }
  }

  // Register the api endpoint, and the unknown api endpoint
  router.all('/api/', ctx => (ctx.body = { message: 'You\'ve reached the API' }));
  router.all('/api/*', ctx => {
    ctx.status = 404;
    ctx.body = { message: 'Invalid API Route' };
  });

  return router;
}

export default { register, displayInsecureBanner };
