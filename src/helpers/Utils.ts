export function assertEnvironment(varName: string) {
  const envVarValue = process.env[varName];
  
  if (!envVarValue) {
    throw new Error(`Environment variable ${varName} is required`);
  }
  
  return envVarValue;
};

export function getByTestId(testId: string): ChainablePromiseElement {
  return driver.isIOS ? $(`~${testId}`) : $(`android=new UiSelector().resourceId("${testId}")`);
}

export function getAllByTestId(testId: string): ChainablePromiseArray {
  return driver.isIOS ? $$(`~${testId}`) : $$(`android=new UiSelector().resourceId("${testId}")`);
}

export function getByText(text: string): ChainablePromiseElement {
  return driver.isIOS ? $(`-ios predicate string:name == "${text}"`) : $(`android=new UiSelector().text("${text}")`);
}

export function getByTextContains(text: string): ChainablePromiseElement {
  return driver.isIOS
    ? $(`-ios predicate string:name MATCHES "${text}"`)
    : $(`android=new UiSelector().textContains("${text}")`);
}

export function getByTextMatches(text: string): ChainablePromiseElement {
  return driver.isIOS
    ? $(`-ios predicate string:name MATCHES "${text}"`)
    : $(`android=new UiSelector().textMatches("${text}")`);
}

export function getByClass(className: string): ChainablePromiseElement {
  return driver.isIOS ? $(`-ios class chain:${className}`) : $(`android=new UiSelector().className("${className}")`);
}

export function getByXpath(xpath: string): ChainablePromiseElement {
  return driver.isIOS ? $(`-ios predicate string:xpath("${xpath}")`) : $(`android=new UiSelector().xpath("${xpath}")`);
}

export async function relaunchApp(identifier: string) {
  const appIdentifier = { [driver.isAndroid ? 'appId' : 'bundleId']: identifier };
  const terminateCommand = 'mobile: terminateApp';
  const launchCommand = `mobile: ${driver.isAndroid ? 'activateApp' : 'launchApp'}`;

  await driver.execute(terminateCommand, appIdentifier);
  await driver.execute(launchCommand, appIdentifier);
}

export async function executeInHomeScreenContext(action: () => Promise<void>): Promise<any> {
  if (driver.isAndroid) {
    return await action();
  }

  const activeAppInfo: any = await driver.execute('mobile: activeAppInfo');
  await driver.updateSettings({ defaultActiveApplication: 'com.apple.springboard' });
  let result: any;

  try {
    result = await action();
  } catch (e) {
    /* do nothing */
  }

  await driver.updateSettings({ defaultActiveApplication: activeAppInfo.bundleId });

  return result;
}