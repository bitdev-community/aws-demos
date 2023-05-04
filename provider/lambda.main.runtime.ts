import { ApplicationAspect, ApplicationMain } from '@teambit/application';
import { WebpackMain, WebpackAspect } from '@teambit/webpack';
import { BundlerAspect, BundlerMain } from '@teambit/bundler';
import { IsolatorAspect, IsolatorMain } from '@teambit/isolator';

import { MainRuntime } from '@teambit/cli';
import { LambdaAspect } from './lambda.aspect';
import { LambdaAppType } from './lambda.app-type';

export class LambdaMain {
  static slots = [];
  static dependencies = [ApplicationAspect, WebpackAspect, BundlerAspect, IsolatorAspect];
  static runtime = MainRuntime;
  static async provider([application, webpack, bundlerMain]: [
    ApplicationMain,
    WebpackMain,
    BundlerMain,
    IsolatorMain
  ]) {
    application.registerAppType(new LambdaAppType('lambda'));
    return new LambdaMain();
  }
}

LambdaAspect.addRuntime(LambdaMain);