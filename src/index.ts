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

      const dirs = getDirsWithPath(patchedConfig);
      dirs.push(...resolverPathsOfCommonDirectories);

      return patchedConfig;
    };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function getDirsWithPath(config: Configuration) {
  let dirs: string[] = [];

  if (config.module) {
    for (let i = 0; i < config.module.rules?.length; i++) {
      if (dirs.length) {
        break;
      }

      const oneOfByConfig = config.module.rules[i].oneOf;

      if (config.module.rules[i].include) {
        dirs = config.module.rules[i].include as string[];
      } else if (oneOfByConfig && oneOfByConfig[0]?.include) {
        dirs = oneOfByConfig[0].include as string[];
      }
    }
  }

  return dirs;
}

let index = 0;

function findFilepath(filename: string, currentPath: string[] = []): string {
  ++index;
  const resolvedPath = path.resolve(process.cwd(), ...currentPath, filename);

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
