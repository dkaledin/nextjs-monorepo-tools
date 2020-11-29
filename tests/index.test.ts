import { Configuration } from "webpack";
import { patchWebpackConfig } from "../src";

it("should return expected Webpack configureation", () => {
  const nextjsDefaultConfig = {
    resolve: {
      modules: ["node_modules"],
      alias: {
        "next/head": "next/dist/next-server/lib/head.js",
        "next/router": "next/dist/client/router.js",
        "next/config": "next/dist/next-server/lib/runtime-config.js",
      },
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|js|mjs|jsx)$/,
          include: [
            "/example-user-directory/next-project/apps/nest-app",
            /next[\\/]dist[\\/]next-server[\\/]lib/,
            /next[\\/]dist[\\/]client/,
            /next[\\/]dist[\\/]pages/,
            /[\\/](strip-ansi|ansi-regex)[\\/]/,
          ],
          exclude: [],
          use: { loader: "next-babel-loader", options: [Object] },
        },
        {
          oneOf: [[Object], [Object], [Object]],
        },
      ],
      strictExportPresence: true,
    },
  };
  const actual = patchWebpackConfig({
    commonDirs: ["libs"],
  })(nextjsDefaultConfig as Configuration);

  expect(actual).toMatchSnapshot();
});
