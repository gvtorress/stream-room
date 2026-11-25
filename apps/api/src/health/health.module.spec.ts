import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthModule } from './health.module.js';

it('provides the health controller through HealthModule independently', async () => {
  const module = await Test.createTestingModule({
    imports: [HealthModule],
  }).compile();

  try {
    const controller = module.get(HealthController);
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  } finally {
    await module.close();
  }
});
