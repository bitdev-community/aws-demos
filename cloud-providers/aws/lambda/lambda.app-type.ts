import { ApplicationType } from '@teambit/application';
import { LambdaApp } from './lambda.application';
import { LambdaAppOptions } from './lambda.options';

export class LambdaAppType implements ApplicationType<LambdaAppOptions> {
  constructor(readonly name: string) {}

  createApp(options: LambdaAppOptions) {
    return new LambdaApp(options.name, options.entry, options.deployOptions, options.portRange || [3000, 4000]);
  }
}
