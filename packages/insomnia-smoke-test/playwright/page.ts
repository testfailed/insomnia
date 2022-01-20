import { PlaywrightWorkerArgs } from '@playwright/test';

import { cwd, executablePath, mainPath } from './paths';

type Playwright = PlaywrightWorkerArgs['playwright'];
interface EnvOptions { INSOMNIA_DATA_PATH: string; DESIGNER_DATA_PATH?: string }

// NOTE: the DESIGNER_DATA_PATH argument is only used for overriding paths for migration testing,
// if we remove migration from insomnia designer support this testing flow can be simplifed.
export const newPage = async ({ playwright, options }: ({ playwright: Playwright; options: EnvOptions })) => {
  // NOTE: ensure the DESIGNER_DATA_PATH is ignored from process.env
  if (!options.DESIGNER_DATA_PATH) options.DESIGNER_DATA_PATH = 'doesnt-exist';
  const electronApp = await playwright._electron.launch({
    cwd,
    executablePath,
    args: process.env.BUNDLE === 'package' ? [] : [mainPath],
    env: {
      ...process.env,
      ...options,
      PLAYWRIGHT: 'true',
    },
  });
  await electronApp.waitForEvent('window');
  const page = await electronApp.firstWindow();
  // @TODO: Investigate why the app doesn't start without a reload with playwright in windows
  if (process.platform === 'win32') await page.reload();
  return { electronApp, page };
};
