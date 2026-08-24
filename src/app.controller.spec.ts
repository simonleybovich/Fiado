import { AppController } from './app.controller';

describe('AppController', () => {
  it('responde ok en el health check', () => {
    const controller = new AppController();

    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
