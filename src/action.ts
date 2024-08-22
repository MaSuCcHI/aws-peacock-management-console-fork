import * as JSONC from 'jsonc-parser'
import yaml from 'js-yaml'
import {
  AccountsRepository,
} from './lib/account-name-repository'
import {
  Config,
  ConfigList,
  ConfigRepository,
  Environment,
} from './lib/config-repository'
import { RepositoryProps } from './lib/repository'
import { selectElement } from './lib/util'

const repositoryProps: RepositoryProps = {
  browser: chrome || browser,
  storageArea: 'local',
}
const configRepository = new ConfigRepository(repositoryProps)
const accountsRepository = new AccountsRepository(repositoryProps)

const waitForElement = async (selector: string, timeout: number): Promise<HTMLElement> => {
  let elapsedTime = 0;
  while (elapsedTime < timeout) {
    const element = selectElement(selector);
    if (element !== null) {
      return element;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    elapsedTime += 100;
  }
  throw new Error(`Element ${selector} not found after ${timeout}ms`);
}

const getOriginalAccountMenuButtonBackground = () => {
  return selectElement('span[data-testid="account-menu-button__background"]')
}

const getAccountIdFromDescendantByDataTestidEqualsAwscCopyAccountId = (accountDetailMenu: HTMLElement): string | null => {
  const copyAccountIdButton = accountDetailMenu.querySelector<HTMLElement>('button[data-testid="awsc-copy-accountid"]')
  return (copyAccountIdButton?.previousElementSibling as HTMLSpanElement)?.innerText?.replace(/-/g, '')
}

const getAccountIdByRegex = (accountDetailMenu: HTMLElement) => {
  let accountId = null;
  const regex = /^\d{4}-\d{4}-\d{4}$/; // Regular expression to match the pattern ****-****-****
  const spans = accountDetailMenu.querySelectorAll('span');

  spans.forEach(span => {
    const spanText = span.textContent ? span.textContent.trim() : '';
    if (regex.test(spanText)) {
      accountId = spanText.replace(/-/g, '');
    }
  });

  return accountId;
}

const getAccountId = async (): Promise<string | null | undefined> => {
  try {
    const accountDetailMenu = await waitForElement('div[data-testid="account-detail-menu"]', 10000)
    return getAccountIdFromDescendantByDataTestidEqualsAwscCopyAccountId(accountDetailMenu) || getAccountIdByRegex(accountDetailMenu);
  } catch (e) {
    console.error(e)
    return null
  }
}

const getRegion = () => {
  return document.getElementById('awsc-mezz-region')?.getAttribute('content')
}

const loadConfigList = async (): Promise<ConfigList | null> => {
  const configList = await configRepository.get()
  if (configList) {
    return parseConfigList(configList)
  } else {
    return null
  }
}

const parseConfigList = (configList: string) => {
  try {
    return yaml.load(configList) as ConfigList
  } catch (e) {
    return JSONC.parse(configList) as ConfigList
  }
}

const isEnvMatch = (env: Environment, accountId: string, region: string) =>
  String(env.account) === accountId && (env.region ? env.region === region : true)

const findConfig = (
  configList: ConfigList,
  accountId: string,
  region: string
): Config | undefined =>
  configList.find((config: Config) => {
    if (Array.isArray(config.env)) {
      return config.env.some((e) => isEnvMatch(e, accountId, region))
    } else {
      return isEnvMatch(config.env, accountId, region)
    }
  })

const run = async () => {
  const accounts = await accountsRepository.getAccounts()
  const configList = await loadConfigList()
  const accountId = await getAccountId()
  const region = getRegion()
  if (configList && accountId && region) {
    const config = findConfig(configList, accountId, region)
  }
  navigator.clipboard.writeText(accountId||'undefind')
}

run()
