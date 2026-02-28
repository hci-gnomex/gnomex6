# Angular 7.15 to 8.2 Upgrade Plan for GNomEx6

## Executive Summary

This document provides a comprehensive plan to upgrade GNomEx6 from Angular 7.2.15 to Angular 8.2.x. The upgrade addresses breaking changes, deprecations, and introduces performance improvements from Angular 8.

**Estimated Complexity:** Medium
**Risk Level:** Medium
**Testing Requirement:** High - Full regression testing required

---

## Table of Contents

1. [Pre-Upgrade Assessment](#pre-upgrade-assessment)
2. [Breaking Changes & Deprecations](#breaking-changes--deprecations)
3. [Upgrade Steps](#upgrade-steps)
4. [Package Updates](#package-updates)
5. [Code Modifications Required](#code-modifications-required)
6. [Build Configuration Changes](#build-configuration-changes)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)
9. [Post-Upgrade Verification](#post-upgrade-verification)

---

## Pre-Upgrade Assessment

### Current State Analysis

**Angular Version:** 7.2.15
**Angular CLI:** 7.0.5
**TypeScript:** 3.1.6
**RxJS:** 6.4.0
**Zone.js:** 0.8.26
**Build Tool:** Webpack 4.5.0 (custom configuration)

### Key Dependencies Analysis

**Angular Material:** 7.2.2 → Needs upgrade to 8.x
**Angular CDK:** 7.2.2 → Needs upgrade to 8.x
**Third-party Libraries:**
- ag-grid-angular: 19.1.2 (should remain compatible)
- angular-tree-component: 8.5.6 (verify compatibility)
- ng-dynamic-component: 4.0.0 (verify compatibility)
- @kolkov/angular-editor: 0.13.1 (verify compatibility)

### Issues Identified

1. **Deprecated @angular/http:** Currently used (12 occurrences) - must migrate to @angular/common/http
2. **ViewEncapsulation.Native:** Not found (good - already removed)
3. **Webpack Configuration:** Custom setup may need adjustments
4. **Third-party Dependencies:** Some may need version bumps

---

## Breaking Changes & Deprecations

### Critical Breaking Changes in Angular 8

1. **@angular/http Removal**
   - Status: Deprecated in v7, removed in v8
   - Current Usage: 12 instances found
   - Action: Complete migration to HttpClient from @angular/common/http

2. **ViewEncapsulation.Native Removal**
   - Status: Already removed from codebase (verified)
   - Action: No changes needed

3. **Lazy Loading Syntax**
   - Old: `loadChildren: './path/module#ModuleName'`
   - New: `loadChildren: () => import('./path/module').then(m => m.ModuleName)`
   - Action: Update all lazy-loaded routes

4. **DOCUMENT from @angular/platform-browser**
   - Deprecated: Importing DOCUMENT from @angular/platform-browser
   - New: Import from @angular/common
   - Action: Update all DOCUMENT imports

5. **Ivy Renderer (Optional)**
   - Angular 8 introduces opt-in Ivy renderer
   - Recommendation: Do NOT enable Ivy initially (stability)
   - Action: Keep View Engine, plan Ivy for Angular 9+

### Deprecations to Address

1. **core-js polyfills**
   - Current: `import "core-js/es6"` and `import "core-js/es7/reflect"`
   - Action: Update to core-js@3 and adjust imports

2. **TSLint (Looking Ahead)**
   - TSLint is deprecated in favor of ESLint
   - Action: Plan migration to ESLint in future (not urgent)

---

## Upgrade Steps

### Phase 1: Preparation (Day 1)

#### Step 1.1: Create Backup Branch
```bash
git checkout -b angular-8-upgrade
git push -u origin angular-8-upgrade
```

#### Step 1.2: Document Current State
```bash
cd gnomex_ng
npm list --depth=0 > pre-upgrade-packages.txt
npm outdated > pre-upgrade-outdated.txt
```

#### Step 1.3: Audit Current Application
- Run full test suite (if exists)
- Document all console warnings/errors
- Take screenshots of key features
- Test all major workflows

#### Step 1.4: Review Third-Party Libraries
Check compatibility of:
- ag-grid-angular (verify v19 works with Angular 8)
- angular-tree-component (verify v8 works with Angular 8)
- ng-dynamic-component (check for Angular 8 support)
- @kolkov/angular-editor (check for Angular 8 support)

### Phase 2: Update Angular CLI and Core Packages (Day 2)

#### Step 2.1: Install Angular CLI 8 Globally
```bash
npm uninstall -g @angular/cli
npm install -g @angular/cli@8.3.29
```

#### Step 2.2: Update Local Angular CLI
```bash
cd gnomex_ng
npm install @angular/cli@8.3.29 --save-dev
```

#### Step 2.3: Run Angular Update Command
```bash
ng update @angular/cli@8 @angular/core@8 --allow-dirty --force
```

**Note:** This command will:
- Update package.json dependencies
- Run automated migrations
- Update configuration files
- Report breaking changes

#### Step 2.4: Manual package.json Updates

Update the following in `gnomex_ng/package.json`:

```json
{
  "dependencies": {
    "@angular/animations": "8.2.14",
    "@angular/cdk": "8.2.3",
    "@angular/common": "8.2.14",
    "@angular/compiler": "8.2.14",
    "@angular/core": "8.2.14",
    "@angular/forms": "8.2.14",
    "@angular/http": "REMOVE - See Step 3.1",
    "@angular/material": "8.2.3",
    "@angular/material-moment-adapter": "8.2.3",
    "@angular/platform-browser": "8.2.14",
    "@angular/platform-browser-dynamic": "8.2.14",
    "@angular/platform-server": "8.2.14",
    "@angular/router": "8.2.14",
    "rxjs": "6.5.5",
    "zone.js": "0.9.1",
    "core-js": "3.6.5",
    "typescript": "3.5.3"
  },
  "devDependencies": {
    "@angular/cli": "8.3.29",
    "@angular/compiler-cli": "8.2.14",
    "@angular/language-service": "8.2.14",
    "typescript": "3.5.3"
  }
}
```

#### Step 2.5: Install Updated Packages
```bash
rm -rf node_modules package-lock.json
npm install
```

### Phase 3: Code Migrations (Days 3-4)

#### Step 3.1: Migrate from @angular/http to @angular/common/http

**Action Items:**
1. Remove `@angular/http` from package.json
2. Remove `HttpModule` imports from modules
3. Update all service imports

**Find all usages:**
```bash
grep -r "import.*from '@angular/http'" gnomex_ng/src --include="*.ts"
```

**Migration Pattern:**

**BEFORE (Angular 7):**
```typescript
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { HttpModule } from '@angular/http';

constructor(private http: Http) {}

this.http.get(url)
  .map((res: Response) => res.json())
  .subscribe(...);
```

**AFTER (Angular 8):**
```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

constructor(private http: HttpClient) {}

this.http.get<MyType>(url)
  .subscribe(...);
```

**Key Changes:**
- `Http` → `HttpClient`
- `Response` type removed (now returns typed response directly)
- No need for `.map(res => res.json())` - automatic
- `Headers` → `HttpHeaders`
- `RequestOptions` → Use object literals
- Module: `HttpModule` → `HttpClientModule`

**Files to Update:**
- `gnomex_ng/src/app/gnomex-app.module.ts` (line 7, 69) - Remove HttpModule, add HttpClientModule
- Search all service files for Http imports and update

#### Step 3.2: Update Lazy Loading Syntax

**Find all lazy routes:**
```bash
grep -r "loadChildren.*#" gnomex_ng/src --include="*.ts"
```

**Migration Pattern:**

**BEFORE:**
```typescript
{
  path: 'experiments',
  loadChildren: './experiments/experiments.module#ExperimentsModule'
}
```

**AFTER:**
```typescript
{
  path: 'experiments',
  loadChildren: () => import('./experiments/experiments.module').then(m => m.ExperimentsModule)
}
```

**Apply to all route configurations in:**
- `gnomex_ng/src/app/gnomex-app.routes.ts`
- Any child route modules with lazy loading

#### Step 3.3: Update DOCUMENT Imports

**Find all DOCUMENT imports:**
```bash
grep -r "from '@angular/platform-browser'" gnomex_ng/src --include="*.ts" | grep DOCUMENT
```

**Migration Pattern:**

**BEFORE:**
```typescript
import { DOCUMENT } from '@angular/platform-browser';
```

**AFTER:**
```typescript
import { DOCUMENT } from '@angular/common';
```

#### Step 3.4: Update Polyfills

**File:** `gnomex_ng/src/polyfills.ts`

**BEFORE:**
```typescript
import "core-js/es6";
import "core-js/es7/reflect";
import "zone.js/dist/zone";
```

**AFTER:**
```typescript
// Zone JS is required by default for Angular itself
import 'zone.js/dist/zone';  // Included with Angular CLI

// Only include polyfills needed for your target browsers
// With core-js@3, import specific features:
import 'core-js/proposals/reflect-metadata';
```

**Alternative (if targeting older browsers):**
```typescript
import 'core-js/es/reflect';
import 'core-js/es/array';
import 'zone.js/dist/zone';
```

### Phase 4: TypeScript Configuration Updates (Day 4)

#### Step 4.1: Update tsconfig.json

**File:** `gnomex_ng/tsconfig.json`

**Changes:**
```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "esnext",
    "lib": [
      "es2018",
      "dom"
    ],
    "moduleResolution": "node",
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "removeComments": false,
    "noImplicitAny": false,
    "suppressImplicitAnyIndexErrors": true,
    "strict": false,
    "typeRoots": [
      "node_modules/@types"
    ],
    "types": [
      "node",
      "jasmine"
    ]
  },
  "exclude": [
    "node_modules",
    "dist",
    ".yarn",
    "src/**/*.spec.ts",
    "src/**/*.e2e.ts"
  ]
}
```

**Key Changes:**
- `target`: "es6" → "es2015" (same thing, more explicit)
- `module`: "es6" → "esnext" (enables better tree-shaking)
- `lib`: Update to "es2018" for newer features

### Phase 5: Webpack Configuration Updates (Day 5)

#### Step 5.1: Review Webpack Loaders

Angular 8 works with Webpack 4, but some loaders may need updates:

**Check these in `gnomex_ng/package.json`:**
- `awesome-typescript-loader@5.0.0-1` → May need update or switch to `ts-loader@6.x`
- `angular2-template-loader@0.6.2` → Verify compatibility

**Recommended Loader Updates:**
```json
{
  "devDependencies": {
    "ts-loader": "^6.2.2",
    "css-loader": "^3.6.0",
    "style-loader": "^1.3.0",
    "sass-loader": "^8.0.2",
    "postcss-loader": "^3.0.0"
  }
}
```

#### Step 5.2: Update Webpack Plugins

**File:** `gnomex_ng/config/webpack.common.js`

Verify these plugins are compatible:
- `html-webpack-plugin@3.1.0` → Consider updating to `^4.5.0`
- `copy-webpack-plugin@4.5.1` → Consider updating to `^6.4.1`
- `extract-text-webpack-plugin@4.0.0-beta.0` → Deprecated, migrate to `mini-css-extract-plugin@^0.9.0`

**Migration for CSS extraction:**

**BEFORE:**
```javascript
const ExtractTextPlugin = require('extract-text-webpack-plugin');

plugins: [
  new ExtractTextPlugin('[name].css')
]
```

**AFTER:**
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

plugins: [
  new MiniCssExtractPlugin({
    filename: '[name].css'
  })
]
```

### Phase 6: Third-Party Library Updates (Day 5)

#### Step 6.1: Verify ag-grid Compatibility

ag-grid-angular v19 should work with Angular 8, but verify:
```bash
npm info ag-grid-angular@19.1.2 peerDependencies
```

If issues arise, consider updating to v21 (last version before v22 major changes):
```json
"ag-grid-angular": "^21.2.2",
"ag-grid-community": "^21.2.2"
```

#### Step 6.2: Update Angular Material

Already covered in Step 2.4, but ensure theming works:

**Check these files after update:**
- Custom theme files (if any)
- Material icon imports
- CDK overlay imports

#### Step 6.3: Verify Other Libraries

Test these after upgrade:
- `angular-tree-component@8.5.6` - Should work, but test thoroughly
- `ng-dynamic-component@4.0.0` - Verify with Angular 8
- `@kolkov/angular-editor@0.13.1` - May need update to `^1.0.0`
- `angular-split@3.0.0` - Should work fine
- `ng2-charts@1.6.0` - Consider updating to `^2.4.2`

### Phase 7: Build and Test (Days 6-7)

#### Step 7.1: Development Build Test
```bash
cd gnomex_ng
npm run build:dev:tomcat
```

**Expected Issues:**
- Compilation errors from @angular/http usages
- Lazy loading syntax errors
- TypeScript errors from type changes

**Resolution:**
- Fix each error systematically
- Document solutions for each error type
- Commit after each major fix

#### Step 7.2: Production Build Test
```bash
npm run build:prod
```

**Verify:**
- No compilation errors
- Bundle sizes are reasonable (may be smaller due to better tree-shaking)
- Source maps generate correctly

#### Step 7.3: Run Tests
```bash
npm run karma
```

**If tests fail:**
- Update test configurations
- Fix broken imports in spec files
- Update mock objects for HttpClient

### Phase 8: Runtime Testing (Days 8-10)

#### Step 8.1: Deploy to Development Environment
```bash
cd ..
./gradlew gnomexWindowsTomcat
```

#### Step 8.2: Functional Testing

**Test all major features:**
1. Authentication & Authorization
2. Experiment Management
   - Create new experiment
   - Edit existing experiment
   - Delete experiment
   - View experiment details
3. Analysis Module
   - Create analysis
   - View analysis
   - Data tracks
4. Billing Module
   - View billing accounts
   - Create billing account
   - Generate reports
5. Configuration
   - Application settings
   - User management
   - Group management
6. Reports
   - Generate reports
   - Export data
7. File Upload/Download
   - Test file operations
   - Verify data integrity

#### Step 8.3: Browser Compatibility Testing

Test on:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Edge (Chromium-based)
- Safari (if Mac users exist)

#### Step 8.4: Performance Testing

Compare against Angular 7 baseline:
- Initial load time
- Route navigation time
- Large data table rendering
- File upload performance

**Expected improvements in Angular 8:**
- Faster initial load (smaller bundles)
- Better runtime performance (improved change detection)
- Reduced memory usage

### Phase 9: Documentation and Deployment (Day 11)

#### Step 9.1: Update Documentation

**Files to update:**
- `README.md` - Update Angular version
- `CLAUDE.MD` - Update technology stack
- `gnomex_ng/README.md` - Update build instructions
- Create migration notes document

#### Step 9.2: Update CI/CD Pipeline

If using CI/CD:
- Update Node.js version (recommend Node 12 LTS)
- Update npm scripts
- Update test configurations
- Update deployment scripts

#### Step 9.3: Create Deployment Checklist

- [ ] Backup production database
- [ ] Backup current production deployment
- [ ] Deploy new build to staging
- [ ] Run smoke tests on staging
- [ ] Get user acceptance sign-off
- [ ] Schedule maintenance window
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify key features
- [ ] Notify users of completion

---

## Package Updates

### Complete package.json for Angular 8

**File:** `gnomex_ng/package.json`

```json
{
  "name": "gnomex-ng",
  "description": "The Gnomex Ng application",
  "repository": "https://github.com/hci-gnomex/gnomex.git",
  "private": true,
  "scripts": {
    "build:dev:wds": "webpack --env development --progress --profile --json > stats.json",
    "build:dev:tomcat": "webpack --env developmentTomcat --progress --profile --json > stats.json",
    "build:prod": "webpack --env productionTomcat --progress --profile --json > stats.json",
    "clean:dist": "npm run rimraf -- dist",
    "clean:install": "npm set progress=false && npm install",
    "clean": "npm cache clean && npm run rimraf -- node_modules doc coverage dist compiled dll",
    "karma": "karma",
    "rimraf": "rimraf",
    "webpack": "webpack",
    "webpack-defaults": "webpack-defaults",
    "webpack-dev-server": "webpack-dev-server --env development --inline --hot"
  },
  "dependencies": {
    "@angular/animations": "8.2.14",
    "@angular/cdk": "8.2.3",
    "@angular/common": "8.2.14",
    "@angular/compiler": "8.2.14",
    "@angular/core": "8.2.14",
    "@angular/forms": "8.2.14",
    "@angular/material": "8.2.3",
    "@angular/material-moment-adapter": "8.2.3",
    "@angular/platform-browser": "8.2.14",
    "@angular/platform-browser-dynamic": "8.2.14",
    "@angular/platform-server": "8.2.14",
    "@angular/router": "8.2.14",
    "@angularclass/conventions-loader": "^1.0.2",
    "@angularclass/hmr": "^2.1.3",
    "@angularclass/hmr-loader": "~3.0.4",
    "@auth0/angular-jwt": "2.1.x",
    "@fortawesome/fontawesome": "^1.1.8",
    "@fortawesome/fontawesome-free-brands": "5.0.x",
    "@fortawesome/fontawesome-free-regular": "5.0.x",
    "@fortawesome/fontawesome-free-solid": "5.0.x",
    "@kolkov/angular-editor": "^1.0.0",
    "@types/chart.js": "^2.7.53",
    "ag-grid-angular": "^21.2.2",
    "ag-grid-community": "^21.2.2",
    "ajv": "^6.4.0",
    "angular-2-local-storage": "^2.0.0",
    "angular-split": "^3.0.0",
    "angular-tree-component": "^8.5.6",
    "angular2-cookie": "^1.2.6",
    "angular2-cool-storage": "3.1.6",
    "awesome-typescript-loader": "^5.2.1",
    "chart.js": "^2.8.0",
    "core-js": "^3.6.5",
    "css-loader": "^3.6.0",
    "file-loader": "^2.0.0",
    "file-saver": "^2.0.0",
    "font-awesome": "^4.7.0",
    "font-loader": "^0.1.2",
    "hammerjs": "^2.0.8",
    "html-loader": "^0.5.5",
    "jquery": "^3.5.1",
    "jshint": "^2.9.5",
    "jshint-loader": "^0.8.4",
    "json-loader": "^0.5.7",
    "jspdf": ">=2.3.1",
    "less-loader": "^4.1.0",
    "mobx": "5.14.2",
    "moment": "2.24.0",
    "ng-dynamic-component": "^5.0.0",
    "ng2-charts": "^2.4.2",
    "ng2-img-max": "^2.1.15",
    "popper.js": "^1.14.5",
    "properties-reader": "^2.1.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^6.5.5",
    "style-loader": "^1.3.0",
    "svg-loader": "0.0.2",
    "transform-loader": "^0.2.4",
    "url-loader": "^1.1.2",
    "webassemblyjs": "1.7.11",
    "webpack": "^4.43.0",
    "zone.js": "0.9.1"
  },
  "devDependencies": {
    "@angular/cli": "8.3.29",
    "@angular/compiler-cli": "8.2.14",
    "@angular/language-service": "8.2.14",
    "@types/core-js": "2.5.0",
    "@types/file-saver": "^2.0.0",
    "@types/hammerjs": "^2.0.33",
    "@types/html2canvas": "0.5.32",
    "@types/jasmine": "^3.5.0",
    "@types/jquery": "^3.3.22",
    "@types/lodash": "4.14.160",
    "@types/node": "12.12.54",
    "@types/selenium-webdriver": "~3.0.13",
    "@types/source-map": "^0.5.0",
    "@types/uglify-js": "^3.0.4",
    "@types/webpack": "^4.41.0",
    "angular-router-loader": "^0.8.5",
    "angular-split": "^3.0.0",
    "angular2-template-loader": "^0.6.2",
    "autoprefixer": "^9.8.6",
    "awesome-typescript-loader": "^5.2.1",
    "copy-webpack-plugin": "^6.4.1",
    "css-loader": "^3.6.0",
    "del": "5.1.0",
    "es6-promise": "4.2.8",
    "file-loader": "^2.0.0",
    "gulp": "^4.0.2",
    "gulp-tslint": "^8.1.3",
    "html-loader": "^0.5.5",
    "html-webpack-plugin": "^4.5.0",
    "html2canvas": "1.0.0-alpha.12",
    "http-proxy-middleware": "^0.19.0",
    "http-server": "^0.12.3",
    "istanbul-instrumenter-loader": "^3.0.1",
    "jasmine-core": "^3.6.0",
    "karma": "^5.2.3",
    "karma-chrome-launcher": "^3.1.0",
    "karma-coverage": "^2.0.3",
    "karma-jasmine": "^4.0.1",
    "karma-mocha-reporter": "^2.2.5",
    "karma-phantomjs-launcher": "^1.0.4",
    "karma-remap-coverage": "^0.1.5",
    "karma-sourcemap-loader": "^0.3.8",
    "karma-spec-reporter": "0.0.32",
    "karma-webpack": "^4.0.2",
    "less": "^3.8.1",
    "less-loader": "^4.1.0",
    "mini-css-extract-plugin": "^0.9.0",
    "minimist": "^1.2.5",
    "node-sass": "^4.14.1",
    "null-loader": "^0.1.1",
    "optimize-js-plugin": "0.0.4",
    "phantomjs-prebuilt": "^2.1.7",
    "postcss-loader": "3.0.0",
    "raw-loader": "^0.5.1",
    "resolve-url-loader": "3.1.2",
    "rimraf": "^3.0.2",
    "sass-loader": "8.0.2",
    "source-map-explorer": "^2.5.2",
    "source-map-loader": "^1.1.0",
    "style-loader": "^1.3.0",
    "to-string-loader": "^1.1.6",
    "ts-loader": "^6.2.2",
    "tsconfig-lint": "^0.14.0",
    "tslint": "^5.20.1",
    "tslint-loader": "^3.5.4",
    "typedoc": "^0.17.8",
    "typescript": "3.5.3",
    "typings": "2.1.1",
    "url-loader": "^1.1.2",
    "war-webpack-plugin": "^1.0.2",
    "webassemblyjs": "1.7.11",
    "webpack": "^4.43.0",
    "webpack-bundle-analyzer": "^3.9.0",
    "webpack-cli": "^3.3.12",
    "webpack-dev-middleware": "^3.7.2",
    "webpack-dev-server": "^3.11.0",
    "webpack-merge": "^5.7.3",
    "webpack-stream": "^6.1.0"
  }
}
```

---

## Code Modifications Required

### Summary of Files Requiring Changes

#### High Priority (Breaks Build)
1. **gnomex_ng/src/app/gnomex-app.module.ts**
   - Remove `HttpModule` import
   - Add `HttpClientModule` import
   - Update import statement

2. **All Service Files Using Http**
   - Migrate from `Http` to `HttpClient`
   - Update response handling (remove `.map(res => res.json())`)
   - Update error handling

3. **Route Configuration Files**
   - Update lazy loading syntax in all routing modules
   - Primary file: `gnomex_ng/src/app/gnomex-app.routes.ts`

4. **gnomex_ng/src/polyfills.ts**
   - Update core-js imports
   - Verify zone.js import

#### Medium Priority (May Break Features)
5. **All DOCUMENT Imports**
   - Search and replace import source

6. **Test Files (*.spec.ts)**
   - Update HttpTestingController usage
   - Update mock configurations

#### Low Priority (Nice to Have)
7. **TSLint Configuration**
   - Review deprecated rules
   - Update for TypeScript 3.5

8. **Build Configuration**
   - Update Webpack plugins
   - Optimize loader configurations

---

## Build Configuration Changes

### Webpack Configuration Updates

#### File: gnomex_ng/config/webpack.common.js

**Key changes needed:**

1. **Replace ExtractTextPlugin with MiniCssExtractPlugin**
2. **Update loader configurations**
3. **Update plugin configurations**

#### File: gnomex_ng/config/webpack.prod.js

**Optimization improvements:**
```javascript
optimization: {
  minimizer: [
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: true
    }),
    new OptimizeCSSAssetsPlugin({})
  ],
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      }
    }
  }
}
```

---

## Testing Strategy

### Unit Testing
- Update all `.spec.ts` files to use HttpClientTestingModule
- Fix broken imports
- Run: `npm run karma`

### Integration Testing
- Test HTTP interceptors
- Test authentication flow
- Test error handling

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Session timeout
- [ ] Token refresh

#### Experiment Management
- [ ] List experiments
- [ ] Create new experiment
- [ ] Edit experiment
- [ ] Delete experiment
- [ ] Upload files
- [ ] Download files

#### Analysis Module
- [ ] Create analysis
- [ ] View analysis details
- [ ] Edit analysis
- [ ] Data track visualization

#### Billing
- [ ] View billing accounts
- [ ] Create billing account
- [ ] Generate invoices
- [ ] Export billing data

#### Configuration
- [ ] Manage users
- [ ] Manage groups
- [ ] Application settings
- [ ] Lab management

#### Reports
- [ ] Generate experiment reports
- [ ] Export CSV/Excel
- [ ] Print reports

### Performance Testing
- Measure page load times
- Measure route transition times
- Measure large data table rendering
- Compare against Angular 7 baseline

### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Edge (Chromium)
- [ ] Safari (if applicable)

---

## Rollback Plan

### Pre-Upgrade Backup

1. **Tag Current Version**
```bash
git tag pre-angular-8-upgrade
git push origin pre-angular-8-upgrade
```

2. **Export Current Build**
```bash
cd gnomex_ng
npm run build:prod
cd ..
tar -czf gnomex-angular7-backup.tar.gz build/libs/gnomex.war
```

3. **Database Backup**
```bash
# Backup database before deployment
```

### Rollback Procedure

If critical issues arise in production:

1. **Revert Git Branch**
```bash
git checkout pre-angular-8-upgrade
```

2. **Rebuild Angular 7 Version**
```bash
cd gnomex_ng
npm install
npm run build:prod
```

3. **Redeploy**
```bash
cd ..
./gradlew gnomexLinuxTomcat
```

4. **Verify Rollback**
- Test critical functionality
- Monitor error logs
- Notify users

---

## Post-Upgrade Verification

### Immediate Post-Deployment Checks

1. **Application Loads**
   - [ ] No console errors
   - [ ] No blank pages
   - [ ] Assets load correctly

2. **Authentication Works**
   - [ ] Can login
   - [ ] Session persists
   - [ ] Can logout

3. **Core Features Functional**
   - [ ] Can navigate between pages
   - [ ] Data loads correctly
   - [ ] Forms work properly

### 24-Hour Monitoring

1. **Error Monitoring**
   - Check server logs hourly
   - Monitor JavaScript console errors
   - Track user-reported issues

2. **Performance Monitoring**
   - Compare load times
   - Check memory usage
   - Monitor API response times

3. **User Feedback**
   - Collect user feedback
   - Address critical issues immediately
   - Document minor issues for future fixes

### 1-Week Post-Upgrade Review

1. **Stability Assessment**
   - Any crashes or errors?
   - Performance improvements realized?
   - User satisfaction level?

2. **Documentation Updates**
   - Update internal docs
   - Create knowledge base articles
   - Document any workarounds

3. **Future Planning**
   - Plan for Angular 9 upgrade
   - Identify technical debt
   - Schedule optimizations

---

## Risk Mitigation

### High-Risk Areas

1. **HTTP Migration**
   - **Risk:** Breaking API calls
   - **Mitigation:** Comprehensive testing of all endpoints
   - **Fallback:** Use HttpClient compatibility layer temporarily

2. **Lazy Loading**
   - **Risk:** Routes fail to load
   - **Mitigation:** Test all lazy-loaded modules
   - **Fallback:** Convert to eager loading temporarily

3. **Third-Party Libraries**
   - **Risk:** Incompatibility with Angular 8
   - **Mitigation:** Test thoroughly in dev environment
   - **Fallback:** Keep old versions if compatible

### Medium-Risk Areas

1. **Build Configuration**
   - **Risk:** Build failures or larger bundles
   - **Mitigation:** Incremental webpack updates
   - **Fallback:** Keep old webpack config

2. **TypeScript Strictness**
   - **Risk:** Type errors in production
   - **Mitigation:** Fix all compiler warnings
   - **Fallback:** Loosen strict settings temporarily

---

## Timeline Summary

| Phase | Days | Description |
|-------|------|-------------|
| Preparation | 1 | Backup, audit, documentation |
| Package Updates | 1 | CLI, core packages, dependencies |
| Code Migration | 2 | HTTP, routes, imports |
| Config Updates | 2 | TypeScript, Webpack, build |
| Build & Test | 2 | Development and production builds |
| Runtime Testing | 3 | Full functional testing |
| Documentation | 1 | Update docs and create deployment checklist |
| **Total** | **11-12 days** | |

---

## Resources

### Official Angular Documentation
- [Angular Update Guide](https://update.angular.io/#7.0:8.0)
- [Angular 8 Release Notes](https://github.com/angular/angular/blob/main/CHANGELOG.md#800-2019-05-28)
- [Migrating from HttpModule](https://angular.io/guide/http#migrating-from-httpmodule)

### Breaking Changes
- [@angular/http removal](https://github.com/angular/angular/issues/18906)
- [Lazy loading syntax](https://angular.io/guide/lazy-loading-ngmodules)
- [Core-js 3 migration](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

### Community Resources
- Stack Overflow `[angular] [angular-upgrade]`
- Angular Discord/Gitter communities
- Angular GitHub Issues

---

## Appendix A: Command Reference

### Common Commands During Upgrade

```bash
# Check current versions
ng version
npm list --depth=0

# Update CLI
npm install -g @angular/cli@8.3.29
npm install @angular/cli@8.3.29 --save-dev

# Run update migrations
ng update @angular/cli@8 @angular/core@8 --allow-dirty

# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build:dev:tomcat
npm run build:prod

# Search for patterns
grep -r "import.*from '@angular/http'" gnomex_ng/src --include="*.ts"
grep -r "loadChildren.*#" gnomex_ng/src --include="*.ts"

# Run tests
npm run karma

# Full Gradle build
./gradlew gnomexLinuxTomcat
```

---

## Appendix B: Common Migration Patterns

### HTTP Migration Examples

#### Simple GET Request
```typescript
// Before
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

constructor(private http: Http) {}

getData(): Observable<any> {
  return this.http.get('/api/data')
    .map(res => res.json());
}

// After
import { HttpClient } from '@angular/common/http';

constructor(private http: HttpClient) {}

getData(): Observable<DataType> {
  return this.http.get<DataType>('/api/data');
}
```

#### POST with Headers
```typescript
// Before
import { Http, Headers, RequestOptions } from '@angular/http';

postData(data: any): Observable<any> {
  let headers = new Headers({ 'Content-Type': 'application/json' });
  let options = new RequestOptions({ headers: headers });
  return this.http.post('/api/data', data, options)
    .map(res => res.json());
}

// After
import { HttpClient, HttpHeaders } from '@angular/common/http';

postData(data: any): Observable<DataType> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.post<DataType>('/api/data', data, { headers });
}
```

#### Error Handling
```typescript
// Before
import { Response } from '@angular/http';
import 'rxjs/add/operator/catch';

getData(): Observable<any> {
  return this.http.get('/api/data')
    .map(res => res.json())
    .catch((error: Response) => Observable.throw(error.json()));
}

// After
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

getData(): Observable<DataType> {
  return this.http.get<DataType>('/api/data')
    .pipe(
      catchError((error: HttpErrorResponse) => throwError(error))
    );
}
```

---

## Conclusion

This upgrade plan provides a comprehensive roadmap for migrating GNomEx6 from Angular 7.2.15 to Angular 8.2.x. The process requires careful attention to breaking changes, particularly the @angular/http migration and lazy loading syntax updates.

**Key Success Factors:**
1. Thorough testing at each phase
2. Incremental commits for easy rollback
3. Comprehensive documentation
4. User communication
5. Monitoring post-deployment

**Expected Benefits:**
- Improved performance (smaller bundles, faster runtime)
- Better developer experience
- Foundation for future Angular 9+ upgrades
- Security updates and bug fixes

**Next Steps After Completion:**
- Monitor application for 1-2 weeks
- Gather user feedback
- Plan Angular 9 upgrade (introduces Ivy by default)
- Consider ESLint migration (TSLint deprecated)

---

**Document Version:** 1.0
**Last Updated:** January 21, 2026
**Author:** Claude (AI Assistant)
**Project:** GNomEx6 Angular Upgrade
