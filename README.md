<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Rate Limit Implementation using [Nest](https://github.com/nestjs/nest).

## Application with implementation example:
https://github.com/richiebono/posts-api


NPM Package URL:
[NPM](https://www.npmjs.com/package/@richiebono/rate-limit-middleware)

## Installation

```bash
npm i @richiebono/rate-limit-middleware
```

Add the following parameters to your .env file:

```
RATE_LIMIT_MAX_REQUEST_BY_IP=100
RATE_LIMIT_MAX_REQUEST_BY_TOKEN=200
RATE_LIMIT_WINDOW_LOG_INTERVAL=1
RATE_LIMIT_WINDOW_SIZE=24
RATE_LIMIT_UNIT_OF_TIME="hours"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

Import the rate limit libs:

```js
import { 
  PriveteRateLimitMiddleware, 
  PublicRateLimitMiddleware, 
  RateLimitModule, 
  RateLimitService, 
  configureRateLimitCacheModule 
  } from '@richiebono/rate-limit-middleware';
```

Configugure your module:

```js
@Module({
  imports: [
    configureRateLimitCacheModule(),
  ],
  providers: [RateLimitService],
})
```

Implement your AppModule using the follows exemple for public and private routes:

```js
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    consumer
      .apply(PriveteRateLimitMiddleware)
      .exclude(
        { path: 'api', method: RequestMethod.GET },
      )
      .forRoutes(PostsController, AppController);    

    consumer
      .apply(PublicRateLimitMiddleware)
      .forRoutes(LoginController, RegisterController);  
  }
}
```

## Support

rate-limit-middleware is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers.

## Stay in touch

- Author - [Richard Bono](https://www.linkedin.com/in/richard-bono-75418818/)

## License

Nest is [MIT licensed](LICENSE).
