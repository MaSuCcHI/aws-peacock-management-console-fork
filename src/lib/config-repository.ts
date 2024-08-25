import { Repository, RepositoryProps } from './repository'

export type Environment = {
  account: string
  region?: string
}
export type Config = {
  env: Environment | Environment[]
  style: {
    navigationBackgroundColor?: string
    accountMenuButtonBackgroundColor?: string
  } 
}
export type ConfigList = Config[] 
export type ConfigMap = {
  identityCenter?: string
  configs: ConfigList,
}
export class ConfigRepository extends Repository {
  constructor(props: RepositoryProps) {
    super('config', props)
  }
}
