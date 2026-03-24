import * as vscode from 'vscode';
import { LanguageModule } from './types';

export class LanguageRegistry {
  constructor(private readonly modules: LanguageModule[]) {}

  public getModuleForDocument(document: vscode.TextDocument): LanguageModule | undefined {
    return this.modules.find((module) => module.canHandle(document));
  }

  public getModules(): readonly LanguageModule[] {
    return this.modules;
  }
}
