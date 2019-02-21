export enum ModifiedConfig {
  Never = 1,
  Copy = 2,
  Remove = 3
}

export function modifiedConfigToString(modifiedConfig: ModifiedConfig): string {
  switch (modifiedConfig) {
    case ModifiedConfig.Copy:
      return "copy";
      break;
    case ModifiedConfig.Never:
      return "never";
      break;
    case ModifiedConfig.Remove:
      return "remove";
      break;
    default:
      throw new Error('modifiedConfigToString: Unknown modifiedConfig');
      break;
  }
}

export function _modifiedConfigFromString(modifiedConfig: string | undefined): ModifiedConfig {
  switch (modifiedConfig) {
    case "copy":
      return ModifiedConfig.Copy;
      break;
    case "never":
      return ModifiedConfig.Never;
      break;
    case "remove":
      return ModifiedConfig.Remove;
      break;
    default:
      throw new Error('_modifiedConfigFromString: Unknown modifiedConfig')
      break;
  }
}