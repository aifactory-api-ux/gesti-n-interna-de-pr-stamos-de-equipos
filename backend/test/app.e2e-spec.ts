import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('debe retornar status 200 y informacion del servicio', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body.service).toBe('prestamo-equipos-api');
    });
  });

  describe('/auth/azure/login (GET)', () => {
    it('debe redirigir a Azure AD', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/azure/login')
        .expect(302);

      expect(response.headers.location).toContain('login.microsoftonline.com');
    });
  });

  describe('/api/auth/azure/callback (GET)', () => {
    it('debe manejar callback de Azure AD sin auth code', async () => {
      await request(app.getHttpServer())
        .get('/auth/azure/callback')
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('debe cerrar sesion', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({})
        .expect(201);

      expect(response.body.message).toBe('Sesion cerrada exitosamente');
    });
  });

  describe('/equipment (GET)', () => {
    it('debe requerir autenticacion', async () => {
      await request(app.getHttpServer())
        .get('/equipment')
        .expect(401);
    });
  });

  describe('/loans (GET)', () => {
    it('debe requerir autenticacion', async () => {
      await request(app.getHttpServer())
        .get('/loans')
        .expect(401);
    });
  });

  describe('/collaborators/me (GET)', () => {
    it('debe requerir autenticacion', async () => {
      await request(app.getHttpServer())
        .get('/collaborators/me')
        .expect(401);
    });
  });
});
