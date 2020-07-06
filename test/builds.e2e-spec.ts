import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { haveUserLogged, requestWithApiKey, requestWithAuth } from './preconditions';
import { BuildsService } from '../src/builds/builds.service';
import { CreateBuildDto } from '../src/builds/dto/build-create.dto';
import { UserLoginResponseDto } from '../src/users/dto/user-login-response.dto';
import { Project } from '@prisma/client';
import { ProjectsService } from '../src/projects/projects.service';

describe('Builds (e2e)', () => {
  let app: INestApplication;
  let buildsService: BuildsService;
  let projecstService: ProjectsService;
  let usersService: UsersService;
  let user: UserLoginResponseDto;
  let project: Project;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    buildsService = moduleFixture.get<BuildsService>(BuildsService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    projecstService = moduleFixture.get<ProjectsService>(ProjectsService);

    await app.init();
  });

  beforeEach(async () => {
    user = await haveUserLogged(usersService);
    project = await projecstService.create({ name: 'E2E test' });
  });

  afterEach(async () => {
    await projecstService.remove(project.id);
    await usersService.delete(user.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /', () => {
    it('201 by id', () => {
      const createBuildDto: CreateBuildDto = {
        branchName: 'branchName',
        project: project.id,
      };
      return requestWithApiKey(app, 'post', '/builds', createBuildDto, user.apiKey)
        .expect(201)
        .expect(res => {
          expect(res.body.projectId).toBe(project.id);
          expect(res.body.branchName).toBe(createBuildDto.branchName);
          expect(res.body.failedCount).toBe(0);
          expect(res.body.passedCount).toBe(0);
          expect(res.body.unresolvedCount).toBe(0);
        });
    });

    it('201 by name', () => {
      const createBuildDto: CreateBuildDto = {
        branchName: 'branchName',
        project: project.name,
      };
      return requestWithApiKey(app, 'post', '/builds', createBuildDto, user.apiKey)
        .expect(201)
        .expect(res => {
          expect(res.body.projectId).toBe(project.id);
          expect(res.body.branchName).toBe(createBuildDto.branchName);
          expect(res.body.failedCount).toBe(0);
          expect(res.body.passedCount).toBe(0);
          expect(res.body.unresolvedCount).toBe(0);
        });
    });
    
    it('404', () => {
      const createBuildDto: CreateBuildDto = {
        branchName: 'branchName',
        project: 'random',
      };
      return requestWithApiKey(app, 'post', '/builds', createBuildDto, user.apiKey).expect(404);
    });

    it('403', () => {
      const createBuildDto: CreateBuildDto = {
        branchName: 'branchName',
        project: project.id,
      };
      return requestWithApiKey(app, 'post', '/builds', createBuildDto, '').expect(403);
    });
  });

  describe('GET /', () => {
    it('200', async () => {
      const build = await buildsService.create({ project: project.id, branchName: 'develop' });

      return requestWithAuth(app, 'get', `/builds?projectId=${project.id}`, {}, user.token)
        .expect(200)
        .expect(res => {
          expect(JSON.stringify(res.body)).toEqual(JSON.stringify([build]));
        });
    });

    it('401', async () => {
      return requestWithAuth(app, 'get', `/builds?projectId=${project.id}`, {}, '').expect(401);
    });
  });

  describe('DELETE /', () => {
    it('200', async () => {
      const build = await buildsService.create({ project: project.id, branchName: 'develop' });

      return requestWithAuth(app, 'delete', `/builds/${build.id}`, {}, user.token).expect(200);
    });

    it('401', async () => {
      const build = await buildsService.create({ project: project.id, branchName: 'develop' });

      return requestWithAuth(app, 'delete', `/builds/${build.id}`, {}, '').expect(401);
    });
  });
});