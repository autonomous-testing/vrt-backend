import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Test } from './test.entity';
import { CreateTestRequestDto } from './dto/create-test-request.dto';
import { ConfigService } from 'src/shared/config/config.service';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { PNG } from 'pngjs';
import { Op } from 'sequelize';
import Pixelmatch from 'Pixelmatch';
import { CreateTestResponseDto } from './dto/create-test-response.dto';
import { TestStatus } from './test.status';
import { TestDto } from './dto/test.dto';
import { IgnoreArea } from './ignoreArea.entity';
import { IgnoreAreaDto } from './dto/ignoreArea.dto';
import { UpdateIgnoreAreaDto } from './dto/update-ignoreArea.dto';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Test)
    private testModel: typeof Test,
    @InjectModel(IgnoreArea)
    private ignoreAreaModel: typeof IgnoreArea,
    private configService: ConfigService,
  ) {}

  async findOneById(id: string): Promise<Test> {
    return this.testModel.findOne({
      where: { id },
      include: [IgnoreArea],
    });
  }

  async findLastUpdatedTest(createTestDto: CreateTestRequestDto): Promise<Test> {
    return this.testModel.findOne({
      where: {
        name: createTestDto.name,
        os: createTestDto.os,
        browser: createTestDto.browser,
        viewport: createTestDto.viewport,
        device: createTestDto.device,
      },
      include: [IgnoreArea],
      order: [['updatedAt', 'DESC']],
    });
  }

  async findAll(buildId: string): Promise<Test[]> {
    return this.testModel.findAll({
      where: { buildId },
    });
  }

  async getDetails(testId: string): Promise<TestDto> {
    const testData = await this.findOneById(testId);
    return new TestDto(testData);
  }

  async approve(testId: string): Promise<TestDto> {
    const test = await this.findOneById(testId);
    test.baselineUrl = test.imageUrl;
    test.diffUrl = null;
    test.status = TestStatus.ok;

    const testData = await test.save();

    return new TestDto(testData);
  }

  async reject(testId: string): Promise<TestDto> {
    const test = await this.findOneById(testId);
    test.status = TestStatus.failed;

    const testData = await test.save();

    return new TestDto(testData);
  }

  async updateIgnoreAreas(updateIgnoreAreaDto: UpdateIgnoreAreaDto): Promise<TestDto> {
    // delete all ignore areas
    await this.ignoreAreaModel.destroy({
      where: { testId: updateIgnoreAreaDto.testId },
    });

    // save new ignore areas
    const ignoreAreas = updateIgnoreAreaDto.ignoreAreas.map(areaDto => {
      const ignoreArea = new IgnoreArea();
      ignoreArea.x = areaDto.x;
      ignoreArea.y = areaDto.y;
      ignoreArea.height = areaDto.height;
      ignoreArea.width = areaDto.width;
      ignoreArea.testId = updateIgnoreAreaDto.testId;
      return ignoreArea.save();
    });
    await Promise.all(ignoreAreas);

    return this.getDetails(updateIgnoreAreaDto.testId);
  }

  async create(createTestDto: CreateTestRequestDto): Promise<CreateTestResponseDto> {
    // save image
    const imageBuffer = Buffer.from(createTestDto.imageBase64, 'base64');
    const imageName = `${Date.now()}.${createTestDto.name}.screenshot.png`;
    const image = PNG.sync.read(imageBuffer);
    writeFileSync(
      resolve(this.configService.imgConfig.uploadPath, imageName),
      imageBuffer,
    );

    const test = new Test();
    test.imageUrl = imageName;
    test.name = createTestDto.name;
    test.os = createTestDto.os;
    test.browser = createTestDto.browser;
    test.viewport = createTestDto.viewport;
    test.device = createTestDto.device;
    test.buildId = createTestDto.buildId;

    const lastUpdatedTest = await this.findLastUpdatedTest(createTestDto);
    // copy baseline from last updated test
    if (lastUpdatedTest) {
      // get latest baseline
      test.baselineUrl = lastUpdatedTest.baselineUrl;
      // get latest ignore areas
      test.ignoreAreas = lastUpdatedTest.ignoreAreas

      if (test.baselineUrl) {
        const baseline = PNG.sync.read(
          readFileSync(
            resolve(this.configService.imgConfig.uploadPath, lastUpdatedTest.baselineUrl),
          ),
        );

        const diffImageKey = `${Date.now()}.${createTestDto.name}.diff.png`;
        const diff = new PNG({
          width: baseline.width,
          height: baseline.height,
        });

        // compare
        const pixelMisMatchCount = Pixelmatch(
          this.applyIgnoreAreas(baseline, lastUpdatedTest.ignoreAreas),
          this.applyIgnoreAreas(image, lastUpdatedTest.ignoreAreas),
          diff.data,
          baseline.width,
          baseline.height,
          {
            threshold: 0.1,
            includeAA: true,
          },
        );

        // save diff
        writeFileSync(
          resolve(this.configService.imgConfig.uploadPath, diffImageKey),
          PNG.sync.write(diff),
        );
        test.diffUrl = diffImageKey;
        test.pixelMisMatchCount = pixelMisMatchCount;

        if (pixelMisMatchCount > 0) {
          // if there is diff
          test.status = TestStatus.unresolved;
        } else {
          // if ther is NO diff
          test.status = TestStatus.ok;
        }
      }
    } else {
      // no baseline
      test.status = TestStatus.new;
    }
    const testData = await test.save();

    return new CreateTestResponseDto(testData);
  }

  private applyIgnoreAreas(image: PNG, ignoreAreas: IgnoreArea[]): Buffer {
    ignoreAreas.forEach(area => {
      for (let y = area.y; y < area.y + area.height; y++) {
        for (let x = area.x; x < area.x + area.width; x++) {
          const k = 4 * (image.width * y + x);
          image.data[k + 0] = 0;
          image.data[k + 1] = 0;
          image.data[k + 2] = 0;
          image.data[k + 3] = 0;
        }
      }
    });
    return image.data;
  }
}
