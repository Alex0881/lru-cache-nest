import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';

import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { settings } from 'pactum';
import { int, string } from 'pactum-matchers';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as v8 from 'v8';

describe(`AppController (e2e)`, () => {
  let app: INestApplication;
  let port: string, redisConnection, appPrefix;

  const errorResponseObject = {
    statusCode: int(),
    errorCode: int(),
    timestamp: string(),
    path: string(),
    method: string(),
    exception: { name: string(), message: string() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
    const configEnv = app.get(ConfigService);
    //redisConnection = app.get('default_IORedisModuleConnectionToken');
    redisConnection = app.get(getRedisConnectionToken());
    port = configEnv.get('PORT');
    appPrefix = configEnv.get('APP_PREFIX');

    // удалим ключи и сортированный список от предыдущих запусков тестов
    redisConnection.del(appPrefix);
    redisConnection.del(`${appPrefix}key1`);
    redisConnection.del(`${appPrefix}key2`);
    redisConnection.del(`${appPrefix}key3`);
    redisConnection.del(`${appPrefix}key4`);

    await app.listen(port);

    pactum.request.setBaseUrl(`http://127.0.0.1:${port}`);
  });

  beforeEach(async () => {
    // settings.setLogLevel('ERROR'); // чтобы не выводить ничего лишнего кроме ошибок
  });

  afterAll(async () => {
    await redisConnection.disconnect();
    await app.close();
  });

  describe('Healthcheck LRU Cache', () => {
    it('Healthcheck should return status 200', () => {
      return pactum
        .spec()
        .get('/')
        .expectStatus(200)
        .expectJsonMatchStrict({ message: string() });
    });
  });

  describe("LRU Cache V1 - check error's statuses", () => {
    it('should return 404 status if key not found', () => {
      return pactum
        .spec()
        .get(`/v1/${randomStringGenerator()}`)
        .expectStatus(404)
        .expectJsonMatchStrict(
          v8.deserialize(v8.serialize(errorResponseObject)),
        );
    });

    it('should return 422 status if input DTO to set key has incorrect body', () => {
      return pactum
        .spec()
        .post('/v1/key1')
        .withBody({
          letterTextHTML: '',
        })
        .expectStatus(422)
        .expectJsonMatchStrict(
          v8.deserialize(v8.serialize(errorResponseObject)),
        );
    });
  });

  describe('LRU Cache V1 - check get/set key and limit cache', () => {
    it('setkey for key1 should return 200 status', () => {
      return pactum
        .spec()
        .post('/v1/key1')
        .withBody({
          value: '123456',
        })
        .expectStatus(200);
    });

    it('getkey for key1 should return 200 status', () => {
      return pactum
        .spec()
        .get(`/v1/key1`)
        .expectStatus(200)
        .expectJsonMatchStrict({ value: '123456' });
    });

    it('add key2', () => {
      return pactum
        .spec()
        .post('/v1/key2')
        .withBody({
          value: '123456',
        })
        .expectStatus(200);
    });
  });

  // теперь достигнут лимит размера кэша (2 в настройках .env.test)
  // при добавлении третьего ключа, key1 должен удалиться из кэша,
  // (т к он был добавлен раньше всех и у него минимальный вес)
  // мы не сможем получить его значение
  // в кэшэ останутся key2 и key3

  describe('LRU Cache V1 - check exceed limit cache', () => {
    it('setkey for key3 should return 200 status', () => {
      return pactum
        .spec()
        .post('/v1/key3')
        .withBody({
          value: '123456',
        })
        .expectStatus(200);
    });

    it('getkey for key1 should return 404 status', () => {
      return pactum.spec().get(`/v1/key1`).expectStatus(404);
    });

    // теперь у нас key2 имеет меньший приоритет и первый в списке
    // произведем его получение чтобы обновился его вес
    // и добавим key4, тогда удалится key3, т к его вес станет меньше всех
    // и мы не сможем его получить

    it('getkey for key2 should return 200 status', () => {
      return pactum.spec().get(`/v1/key2`).expectStatus(200);
    });

    it('setkey for key4 should return 200 status', () => {
      return pactum
        .spec()
        .post('/v1/key4')
        .withBody({
          value: '123456',
        })
        .expectStatus(200);
    });

    it('getkey for key3 should return 404 status', () => {
      return pactum.spec().get(`/v1/key3`).expectStatus(404);
    });
  });
});
