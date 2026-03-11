import { createConfig } from "@oute/oute-ds.common.core.eslint-config";

export default createConfig({
  overrides: [
    {
      files: ["**/*.tsx", "**/*.jsx"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "react/prop-types": "off",
      },
    },
  ],
});
