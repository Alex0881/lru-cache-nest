import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as pactum from 'pactum';
import { string } from 'pactum-matchers';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let port: string;

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
    port = configEnv.get('PORT');

    await app.listen(port);

    pactum.request.setBaseUrl(`http://127.0.0.1:${port}`);
  });

  beforeEach(async () => {
    // settings.setLogLevel('ERROR'); чтобы не выводить ничего лишнего кроме ошибок
  });

  afterAll(async () => {
    await app.close();
  });

  describe('LRU Cache V1', () => {
    const dtoWithExpiredAppToken = {
      emailAddress: 'prog-alex-81@yandex.ru',
      access_token:
        'ya29.a0Aa4xrXP3TviTgTNyBokaHYBSlcscjJkZGRV69Nzy0fejXddtFnDBrojuds_bBJhkftGQCdazFktC6LeTqlPaxWkgnZSbr5IEwEWVO6dPHoo_E7kPqVZJ3eToAUMWK3L513F7yq9P7GOQJ0Yu3DFNGEmVVHFyaCgYKATASARESFQEjDvL9h965hh5hcHQ1KJ5Vqvlf-g0163',
      letterTextHTML: '',
      letterTopic: 'Topic BODR',
      letterText: 'Text mail "BODR"',
      letterAttachments: [
        {
          filename: '1.txt',
          content_base64: 'cGluZyAxMC44LjIuMjAzIC10DQo=',
        },
        {
          filename: '2.txt',
          content_base64: '0J/RgNC40LLQtdGCLg==',
        },
      ],
    };

    it('should return 422 status if input DTO to send email has incorrect body', () => {
      return pactum
        .spec()
        .post('/v1/email/gsuite/send-email')
        .withBody({
          letterTextHTML: '',
        })
        .expectStatus(422);
    });

    it('should return 500 status if google app token to send email is expired', () => {
      return pactum
        .spec()
        .post('/v1/email/gsuite/send-email')
        .withBody(dtoWithExpiredAppToken)
        .expectStatus(500);
    });
  });

  describe('Healthcheck', () => {
    it('Healthcheck should return status 200', () => {
      return pactum
        .spec()
        .get('/')
        .expectStatus(200)
        .expectJsonMatch({ message: string() });
    });
  });
});
