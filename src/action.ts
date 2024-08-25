import * as JSONC from 'jsonc-parser'
import yaml from 'js-yaml'
import {
  AccountsRepository,
} from './lib/account-name-repository'
import {
  Config,
  ConfigList,
  ConfigMap,
  ConfigRepository,
  Environment,
} from './lib/config-repository'
import { RepositoryProps } from './lib/repository'
import { selectElement } from './lib/util'
import config from '../webpack.config'

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

const loadConfig = async (): Promise<ConfigMap | null> => {
  const config = await configRepository.get()
  if (config) {
    const configList = parseConfigList(config)
    const configMap = parseConfigMap(config)
    return Array.isArray(configList) ? {configs: configList, identityCenter: ''} : configMap
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

const parseConfigMap = (configMap: string) => {
  try {
    return yaml.load(configMap) as ConfigMap
  } catch (e) {
    return JSONC.parse(configMap) as ConfigMap
  }
} 

const isEnvMatch = (env: Environment, accountId: string, region: string) =>
  String(env.account) === accountId && (env.region ? env.region === region : true)

const findConfig = (
  configMap: ConfigMap,
  accountId: string,
  region: string
): Config | undefined =>
  configMap.configs.find((config: Config) => {
    if (Array.isArray(config.env)) {
      return config.env.some((e) => isEnvMatch(e, accountId, region))
    } else {
      return isEnvMatch(config.env, accountId, region)
    }
  })

const getConfigIdentityCenterId = (
  configMap: ConfigMap
): string | undefined => {
  return configMap.identityCenter != null ? configMap.identityCenter : undefined
}

const run = async () => {
  const accountId = await getAccountId()
  const configMap = await loadConfig()
  if (configMap == null || configMap!.identityCenter == null) {return}
  const identityCenterId = getConfigIdentityCenterId(configMap!)
  if (identityCenterId == null) {return}
  const tabUrl = window.location.href
  const encodedUrl = encodeURIComponent(tabUrl)
  const shortcutLink = `https://${identityCenterId}.awsapps.com/start/#/console?account_id=${accountId}&destination=${encodedUrl}`
  navigator.clipboard.writeText(shortcutLink)
}

run()
