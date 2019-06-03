export enum ModifiedConfig {
  never = 1,
  copy = 2,
  remove = 3
}

export function convertModifiedConfigFromString(currentModifiedConfig: string): ModifiedConfig {
  let result: ModifiedConfig;
  switch (currentModifiedConfig) {
    case "never":
      result = ModifiedConfig.never
      break;
    case "copy":
      result = ModifiedConfig.copy;
      break;
    case "remove":
      result = ModifiedConfig.remove;
      break;
    default:
      result = ModifiedConfig.copy
      break;
  }
  return result;
}