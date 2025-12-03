# Publishing Guide

This guide explains how to publish the `@sf-explorer/salesforce-data-models` package to npm.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **Organization Access**: You need access to the `@sf-explorer` npm organization (or change the package name)
3. **npm CLI Login**: Login to npm from your terminal:
   ```bash
   npm login
   ```

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass
- [ ] Version number is updated in `package.json`
- [ ] `CHANGELOG.md` is updated with changes
- [ ] All data files are present in the `data/` directory
- [ ] Build is successful: `npm run build`
- [ ] `README.md` is complete and accurate

## Publishing Steps

### 1. Build the Package

```bash
cd packages/salesforce-data-models
npm run build
```

This will compile TypeScript files to the `dist/` directory.

### 2. Test Locally (Optional)

You can test the package locally before publishing:

```bash
# From the package directory
npm pack

# This creates a .tgz file you can install elsewhere:
# npm install /path/to/sf-explorer-salesforce-data-models-1.0.0.tgz
```

### 3. Verify Package Contents

Check what files will be included in the published package:

```bash
npm pack --dry-run
```

Ensure it includes:
- `dist/` directory with compiled JS and TypeScript definitions
- `data/` directory with JSON files
- `README.md`
- `LICENSE`
- `package.json`

### 4. Publish to npm

For a **public** package (current configuration):

```bash
npm publish --access public
```

For a **private** package (requires paid npm account):

```bash
npm publish
```

### 5. Verify Publication

After publishing, verify the package is available:

```bash
npm view @sf-explorer/salesforce-data-models
```

Visit the npm page: https://www.npmjs.com/package/@sf-explorer/salesforce-data-models

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (1.0.0 → 2.0.0): Breaking changes
- **MINOR** version (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** version (1.0.0 → 1.0.1): Bug fixes, backward compatible

Update version with npm:

```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git tag
- Commits the change

## Unpublishing (Use with Caution)

You can unpublish within 72 hours of publishing:

```bash
# Unpublish a specific version
npm unpublish @sf-explorer/salesforce-data-models@1.0.0

# Unpublish entire package (use extreme caution)
npm unpublish @sf-explorer/salesforce-data-models --force
```

**Note**: Unpublishing is discouraged as it breaks dependents. Use deprecation instead:

```bash
npm deprecate @sf-explorer/salesforce-data-models@1.0.0 "Version 1.0.0 has a bug, please use 1.0.1"
```

## Automated Publishing with CI/CD

For automated publishing (e.g., GitHub Actions):

1. Create an npm access token:
   ```bash
   npm token create
   ```

2. Add token to CI/CD secrets as `NPM_TOKEN`

3. Example GitHub Actions workflow:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build --workspace=@sf-explorer/salesforce-data-models
      - run: npm publish --workspace=@sf-explorer/salesforce-data-models --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Troubleshooting

### Error: Package name already exists

The package name `@sf-explorer/salesforce-data-models` might be taken. Either:
1. Request access to the `@sf-explorer` organization
2. Choose a different name in `package.json`

### Error: No access to organization

You need to be added to the `@sf-explorer` npm organization. Contact the organization owner.

### Error: Files not included in package

Check your `.npmignore` file and the `files` field in `package.json`.

### Error: Build failed

Ensure all dependencies are installed and TypeScript compiles without errors:

```bash
npm install
npm run build
```

## Post-Publishing

After successful publication:

1. Update the main README with installation instructions
2. Create a GitHub release with the changelog
3. Announce the release (Twitter, blog, etc.)
4. Monitor npm downloads and issues

## Support

For questions about publishing, refer to:
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npm CLI Documentation](https://docs.npmjs.com/cli/)

