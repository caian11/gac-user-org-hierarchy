import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Nodes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('Full Flow: Users and Groups', () => {
    let userId: string;
    let groupId: string;

    it('/users (POST) - should create a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'E2E User', email: 'e2e5@example.com' })
        .expect(201);

      userId = res.body.id;
      expect(userId).toBeDefined();
    });

    it('/groups (POST) - should create a group', async () => {
      const res = await request(app.getHttpServer())
        .post('/groups')
        .send({ name: 'E2E Group' })
        .expect(201);

      groupId = res.body.id;
      expect(groupId).toBeDefined();
    });

    it('/users/:id/groups (POST) - should associate user to group', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/groups`)
        .send({ groupId })
        .expect(204);
    });

    it('/users/:id/organizations (GET) - should list the associated group', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${userId}/organizations`)
        .expect(200);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'E2E Group' }),
        ]),
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
