import { describe, it, mock } from 'node:test';
import fs from 'fs';
import fsp from 'fs/promises';
import { FunctionDataConfigGenerator } from './function_data_config_generator.js';
import assert from 'assert';
import { pathToFileURL } from 'url';

void describe('FunctionDataConfigGenerator', () => {
  void it('generates a type definition file', () => {
    const fsOpenSyncMock = mock.method(fs, 'openSync');
    const fsWriteFileSyncMock = mock.method(fs, 'writeFileSync', () => null);
    fsOpenSyncMock.mock.mockImplementation(() => 0);
    const functionDataConfigGenerator = new FunctionDataConfigGenerator(
      'testFunction'
    );
    const configExport =
      'export const { libraryOptions, resourceConfig } = await getAmplifyClientsConfiguration(env);';

    functionDataConfigGenerator.generateDataConfigShim();

    // assert type definition file path
    assert.equal(
      fsWriteFileSyncMock.mock.calls[0].arguments[0],
      `${process.cwd()}/.amplify/generated/data-config/testFunction.ts`
    );

    // assert content
    assert.ok(
      fsWriteFileSyncMock.mock.calls[0].arguments[1]
        ?.toString()
        .includes(configExport)
    );

    mock.restoreAll();
  });

  void it('generated type definition file has valid syntax', async () => {
    const targetDirectory = await fsp.mkdtemp('func_data_config_gen_test');
    const functionDataConfigGenerator = new FunctionDataConfigGenerator(
      'testFunction'
    );
    const filePath = `${process.cwd()}/.amplify/generated/data-config/testFunction.ts`;

    functionDataConfigGenerator.generateDataConfigShim();

    // import to validate syntax of type definition file
    await import(pathToFileURL(filePath).toString());

    await fsp.rm(targetDirectory, { recursive: true, force: true });
  });
});