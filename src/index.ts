import path from "path";
import fs from "fs";
import { Configuration, Resolve } from "webpack";

export interface PatchWebpackConfigParams {
  commonDirs: string[];
}
export type TsPaths = { [key: string]: string[] };

export function patchWebpackConfig({ commonDirs }: PatchWebpackConfigParams) {
  try {
    const tsConfigPath = findFilepath("tsconfig.json");
    const tsConfigJson = fs.readFileSync(tsConfigPath, { encoding: "utf-8" });
    const tsConfig = jsonParse(tsConfigJson);
    const tsPaths = tsConfig.compilerOptions.paths;

    if (!tsPaths) {
      console.error("You should specify paths aliases in tsconfig.json");
      process.exit(1);
    }

    return (config: Configuration): Configuration => {
      const alias: Resolve["alias"] = Object.keys(tsPaths).reduce(
        (result, key) => ({
          ...result,
          [key]: tsPaths[key][0],
        }),
        {}
      );
      const patchedConfig = {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            ...alias,
          },
        },
      };

      const resolverPathsOfCommonDirectories = commonDirs.map<string>((dir) =>
        path.resolve(process.cwd(), dir)
      );

      ((patchedConfig.module?.rules[0]?.include as string[]) || []).push(
        ...resolverPathsOfCommonDirectories
      );

      return patchedConfig;
    };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

let index = 0;

function findFilepath(filename: string, currentPath: string[] = []): string {
  ++index;
  const resolvedPath = path.resolve(process.cwd(), ...currentPath, filename);

  console.log("resolvedPath", resolvedPath);

  if (index > 10) {
    return "fail_path";
  }

  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  } else {
    return findFilepath(filename, [...currentPath, "../"]);
  }
}

function jsonParse(json: string): any {
  return JSON.parse(json);
}
