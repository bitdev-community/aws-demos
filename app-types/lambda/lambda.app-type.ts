import { ApplicationType } from '@teambit/application';
import { LambdaApp as App } from './lambda.application';
import { LambdaApp } from './lambda.options';

export class LambdaAppType implements ApplicationType<LambdaApp> {
  constructor(readonly name: string) {}

  createApp(options: LambdaApp) {
    return new App(options.name, options.entry, options.deployOptions, options.portRange || [3000, 4000]);
  }
}
