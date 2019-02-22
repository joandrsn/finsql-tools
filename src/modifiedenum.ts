export enum ModifiedConfig {
  never = 1,
  copy = 2,
  remove = 3
}

export function convertModifiedConfigFromString(currentModifiedConfig: string) {
  if(currentModifiedConfig === "never"){
    return ModifiedConfig.never;
  } else if (currentModifiedConfig === "copy"){
    return ModifiedConfig.copy;
  } else if (currentModifiedConfig === "remove") {
    return ModifiedConfig.remove;
  } else {
    //Default case
    return ModifiedConfig.copy;
  }
}