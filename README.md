# Indoor-Navigation

[![Deploy to Pages](https://github.com/danielgilbers/indoor-navigation/actions/workflows/static.yml/badge.svg)](https://github.com/danielgilbers/indoor-navigation/actions/workflows/static.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

**Demo:**

[![Demo Link](/img/demo-link.png)](https://danielgilbers.github.io/indoor-navigation/)

**Paper:**

[German version](SEuSI_Gruppe1_Fallstudie_Freier_Fröhlich_Gilbers_Lepp_WI22_public.pdf)

## Development and Security

Use Node.js 24 LTS:

```sh
npm ci --ignore-scripts
npm test -- --ci --runInBand
npm run audit
```

Dependencies are not vendored in Git. After cloning, install them with the command
above. Commit [package-lock.json](package-lock.json) alongside changes to
[package.json](package.json).

The dependency security workflow runs the tests and audits all dependencies,
including development dependencies, on pull requests, pushes to `main`, and weekly.
Installs use the lockfile and skip dependency lifecycle scripts. The workflow uses
read-only permissions and pins its actions to immutable commits.

Dependabot proposes weekly updates for npm packages and GitHub Actions. Enable
Dependabot alerts and Dependabot security updates in the GitHub repository settings
to also receive automatic fixes for newly disclosed vulnerabilities in direct and
transitive dependencies.
