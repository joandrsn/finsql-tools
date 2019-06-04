export enum ModifiedConfig {
  never = 1,
  copy = 2,
  remove = 3
}

export class ModifiedConfigUtil {
  public static parse(input: string) {
    let result: ModifiedConfig;
    switch (input) {
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
}

export enum SynchronizeSchemaChanges {
  yes = 1,
  no = 2,
  force = 3
}

export class SynchronizeSchemaChangesUtil {

  public static toString(ssc: SynchronizeSchemaChanges): string {
    let result: string;
    switch (ssc) {
      case SynchronizeSchemaChanges.yes:
        result = "yes"
        break;
      case SynchronizeSchemaChanges.no:
        result = "no"
        break;
      case SynchronizeSchemaChanges.force:
        result = "force"
        break;
      default:
        result = "no"
        break;
    }
    return result;
  }

  public static parse(input: String): SynchronizeSchemaChanges {
    let result: SynchronizeSchemaChanges;
    switch (input) {
      case "yes":
        result = SynchronizeSchemaChanges.yes;
        break;
      case "no":
        result = SynchronizeSchemaChanges.no;
        break;
      case "force":
        result = SynchronizeSchemaChanges.force;
        break;
      default:
        result = SynchronizeSchemaChanges.no;
        break;
    }
    return result;
  }

}
