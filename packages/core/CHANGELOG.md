# Changelog

## 0.8.3

### Patch Changes

- Updated dependencies [edf0c1c]
  - @qualweb/util@0.6.3

## 0.8.2

### Patch Changes

- 63a0b5d: Add missing @qualweb/qw-page dependency
- 40efb72: Updated repository, bugs, and homepage fields for all package.json files
- Updated dependencies [40efb72]
  - @qualweb/qw-element@0.3.2
  - @qualweb/crawler@0.4.2
  - @qualweb/qw-page@0.3.2
  - @qualweb/locale@0.2.2
  - @qualweb/util@0.6.2

## 0.8.1

### Patch Changes

- 38078bb: Clean up build scripts
- 38078bb: Update build scripts

  Removed the cleanup step of all build scripts and added a "clean" script for
  them all instead. This change means that the build scripts will no longer create
  a clean output folder. Since the output folders aren't under version control,
  this won't mess with history, and CI/CD pipelines should build from a clean
  checkout so this shouldn't cause pollution in final releases, either.

- Updated dependencies [38078bb]
  - @qualweb/qw-element@0.3.1
  - @qualweb/crawler@0.4.1
  - @qualweb/locale@0.2.1

## 0.8.0

### Minor Changes

- f7c46a2: # Major refactor and code cleanup

  This update makes significant changes to the overall structure of QualWeb's
  code and the API. Most users should be able to be able to migrate with only a
  few changes.

  There's a new convention for running evaluations. See the next section for a
  brief migration guide.

  Additionally, several packages are no longer in use. If you are using any of
  the following packages in your project, remove them when you update to the new
  version of `@qualweb/core` to avoid any issues:

  - `@qualweb/types`
  - `@qualweb/dom`
  - `@qualweb/evaluation`

  ## New convention for calling QualWeb

  Previous versions of QualWeb expects an options object containing detailed
  configurations for each supported module. While this reduced bootstrapping a bit
  (users only needed to install `@qualweb/core` to get started), it was a bit
  rigid and bothersome to maintain/extend.

  Now, individual evaluation modules must be instantiated and configured by the
  user and passed to QualWeb.

  For most users, updating your code should be quite simple. Here's an example.

  Currently, you might have an evaluation run like this:

  ```typescript
  import { Qualweb } from '@qualweb/core';

  const qw = new QualWeb();
  await qw.start();

  const result = await qw.evaluate({
    url: 'https://example.com',
    execute: {
      act: true
    },
    'act-rules': {
      levels: ['A', 'AA']
    }
  });
  ```

  To update to work with the new API, do the following:

  First, install the modules you use as additional dependencies in your project.
  For this example, adding `@qualweb/act-rules` next to `@qualweb/core` in your
  package.json file. The other modules you might be using are:

  - `@qualweb/wcag-techniques`
  - `@qualweb/counter`
  - `@qualweb/best-practices`

  Then, for each module you are using, import that package and create an instance
  of that module for use in QualWeb. Pass that instance to the evaluate function
  instead. Updated, the previous example would now look like this:

  ```typescript
  import { Qualweb } from '@qualweb/core';
  // Import the evaluation module.
  import { ACTRules } from '@qualweb/act-rules';

  const qw = new Qualweb();
  await qw.start();

  // Instantiate an evaluation module and configure it before
  // passing it to QualWeb.
  const actRulesModule = new ACTRules({
    levels: ['A']
  });

  const result = await qw.evaluate({
    url: 'https://example.com',
    // Add the module to be run here.
    modules: [actRulesModule]
  });
  ```

  The approach is similar to how middleware/plugins works in express-style
  frameworks.

  ## Removal of @qualweb/types

  The typings package `@qualweb/types` has been removed. Historically, it contained
  the TypeScript types applicable to all other packages. Now, those types are
  exported from the source packages instead. For example, where you would
  previously install both `@qualweb/core` and `@qualweb/types` to have proper
  typing for the `Qualweb` object, it is now sufficient just to install
  `@qualweb/core`.

  Make sure to remove @qualweb/types from your project if you were using it, to
  avoid any issues with conflicting types.

  ## Removal of @qualweb/evaluation and @qualweb/dom

  These packages have been rolled into either core or util. For anyone using
  QualWeb solely through the `@qualweb/core` package, this should not cause any
  issues.

  ## Anything missing?

  This is a fairly set of changes, and we may have missed something moving things
  around. While QualWeb _should_ run without any notable changes, please do add
  an issue if you have any problems.

### Patch Changes

- Updated dependencies [f7c46a2]
  - @qualweb/qw-element@0.3.0
  - @qualweb/crawler@0.4.0
  - @qualweb/locale@0.2.0

## 0.7.80

### Patch Changes

- Updated dependencies [a605c89]
  - @qualweb/locale@0.1.19

## 0.7.79

### Patch Changes

- @qualweb/evaluation@0.3.61

## 0.7.78

### Patch Changes

- Updated dependencies [00bad92]
  - @qualweb/dom@0.2.11
  - @qualweb/evaluation@0.3.60

## 0.7.77

### Patch Changes

- @qualweb/evaluation@0.3.59

## 0.7.76

### Patch Changes

- @qualweb/evaluation@0.3.58

## 0.7.75

### Patch Changes

- Updated dependencies [2b34d754]
  - @qualweb/crawler@0.3.20

## 0.7.74

### Patch Changes

- Updated dependencies [b5b79f1f]
  - @qualweb/crawler@0.3.19

## 0.7.73

### Patch Changes

- @qualweb/evaluation@0.3.57

## 0.7.72

### Patch Changes

- Updated dependencies [c65210b2]
  - @qualweb/evaluation@0.3.56

## 0.7.71

### Patch Changes

- @qualweb/evaluation@0.3.55

## 0.7.70

### Patch Changes

- @qualweb/evaluation@0.3.54

## 0.7.69

### Patch Changes

- @qualweb/evaluation@0.3.53

## 0.7.68

### Patch Changes

- 375f20c3: Catch evaluation atempts on urls that do not evaluate
- 636b402e: Fix infinite loop in accessible name computation
- eb596a97: Fix reference getter when javascript is used inside href
- Updated dependencies [375f20c3]
  - @qualweb/evaluation@0.3.52

## 0.7.67

### Patch Changes

- @qualweb/evaluation@0.3.51

## 0.7.66

### Patch Changes

- @qualweb/evaluation@0.3.50

## 0.7.65

### Patch Changes

- @qualweb/evaluation@0.3.49

## 0.7.64

### Patch Changes

- 3ef622f7: # QualWeb#crawl() doesn't close browser after use

  The method launches a fresh puppeteer instance, but does not close it. This
  causes any program that uses the crawl function to hang after finishing the
  rest of its execution.

- 7801f294: Misc test stuff
  - @qualweb/evaluation@0.3.48

## 0.7.63

### Patch Changes

- @qualweb/evaluation@0.3.47

## 0.7.62

### Patch Changes

- 47d679d3: Create QW-ACT-R77
- Updated dependencies [47d679d3]
  - @qualweb/locale@0.1.18
  - @qualweb/evaluation@0.3.46

## 0.7.61

### Patch Changes

- @qualweb/evaluation@0.3.45

## 0.7.60

### Patch Changes

- Updated dependencies [960eb1e0]
  - @qualweb/dom@0.2.10
  - @qualweb/evaluation@0.3.44

## 0.7.59

### Patch Changes

- @qualweb/evaluation@0.3.43

## 0.7.58

### Patch Changes

- @qualweb/evaluation@0.3.42

## 0.7.57

### Patch Changes

- @qualweb/evaluation@0.3.41

## 0.7.56

### Patch Changes

- @qualweb/evaluation@0.3.40

## 0.7.55

### Patch Changes

- Updated dependencies [a304824]
- Updated dependencies [52360b5]
  - @qualweb/locale@0.1.17
  - @qualweb/evaluation@0.3.39

## 0.7.54

### Patch Changes

- Updated dependencies [cecc88f]
  - @qualweb/evaluation@0.3.38

## 0.7.53

### Patch Changes

- 295f35f: Updated dependencies (eslint, prettier, typedoc, mocha)
- Updated dependencies [295f35f]
  - @qualweb/earl-reporter@0.4.6
  - @qualweb/evaluation@0.3.37
  - @qualweb/crawler@0.3.18
  - @qualweb/locale@0.1.16
  - @qualweb/dom@0.2.9

## 0.7.52

### Patch Changes

- @qualweb/evaluation@0.3.36

## 0.7.51

### Patch Changes

- @qualweb/evaluation@0.3.35

## 0.7.50

### Patch Changes

- Updated dependencies [8c1d212]
  - @qualweb/locale@0.1.15
  - @qualweb/evaluation@0.3.34

## 0.7.49

### Patch Changes

- @qualweb/evaluation@0.3.33

## 0.7.48

### Patch Changes

- 550429b: Monorepo release test
- Updated dependencies [550429b]
  - @qualweb/crawler@0.3.17
  - @qualweb/dom@0.2.8
  - @qualweb/earl-reporter@0.4.5
  - @qualweb/evaluation@0.3.32
  - @qualweb/locale@0.1.14

## 0.7.47

### Patch Changes

- 315d70c: Changed prettier command argument
- Updated dependencies [315d70c]
- Updated dependencies [ada7fe4]
  - @qualweb/earl-reporter@0.4.4
  - @qualweb/evaluation@0.3.31
  - @qualweb/crawler@0.3.16
  - @qualweb/locale@0.1.13
  - @qualweb/dom@0.2.7

## [0.7.46] - 23/10/2023

### Updated

- dependencies

## [0.7.45] - 19/10/2023

### Updated

- dependencies

## [0.7.44] - 28/09/2023

### Updated

- dependencies

## [0.7.43] - 27/09/2023

### Updated

- dependencies

## [0.7.42] - 26/09/2023

### Updated

- dependencies

## [0.7.41] - 19/09/2023

### Updated

- dependencies

## [0.7.40] - 07/09/2023

### Updated

- dependencies

## [0.7.39] - 05/09/2023

### Updated

- dependencies

## [0.7.38] - 04/09/2023

### Updated

- dependencies

## [0.7.37] - 18/07/2023

### Updated

- dependencies

## [0.7.35] - 07/06/2023

### Updated

- dependencies

## [0.7.34] - 30/05/2023

### Updated

- dependencies

## [0.7.33] - 08/03/2023

### Updated

- dependencies

## [0.7.32] - 01/02/2023

### Updated

- dependencies

## [0.7.31] - 17/01/2023

### Updated

- dependencies

## [0.7.30] - 17/01/2023

### Updated

- dependencies

## [0.7.29] - 11/01/2023

### Updated

- dependencies

## [0.7.28] - 29/06/2022

### Updated

- dependencies

## [0.7.27] - 28/06/2022

### Updated

- dependencies

## [0.7.26] - 26/05/2022

### Updated

- dependencies

## [0.7.25] - 26/05/2022

### Updated

- dependencies

## [0.7.24] - 23/05/2022

### Updated

- dependencies

## [0.7.23] - 23/05/2022

### Updated

- dependencies

## [0.7.22] - 19/05/2022

### Updated

- dependencies

## [0.7.21] - 12/04/2022

### Updated

- dependencies

## [0.7.20] - 28/03/2022

### Updated

- dependencies

## [0.7.19] - 21/02/2022

### Updated

- dependencies

## [0.7.18] - 01/02/2022

### Updated

- puppeteer from 13.1.2 to 13.1.3

## [0.7.17] - 26/01/2022

### Updated

- puppeteer from 10.4.0 to 13.1.2
- @qualweb/evaluation from 0.3.10 to 0.3.11

## [0.7.16] - 06/01/2022

### Updated

- dependencies

## [0.7.15] - 06/01/2022

### Updated

- dependencies

## [0.7.14] - 24/12/2021

### Updated

- dependencies

## [0.7.13] - 10/12/2021

### Updated

- dependencies

## [0.7.12] - 06/12/2021

### Updated

- @qualweb/locale

## [0.7.11] - 03/12/2021

### Updated

- dependencies

## [0.7.10] - 15/11/2021

### Updated

- dependencies

## [0.7.9] - 28/10/2021

### Updated

- @qualweb/crawler

## [0.7.8] - 21/10/2021

### Updated

- dependencies

## [0.7.7] - 21/10/2021

### Updated

- crawler method with viewport and waitUntil options
- dependencies

## [0.7.6] - 12/10/2021

### Updated

- dependencies

## [0.7.5] - 01/10/2021

### Updated

- dependencies

## [0.7.4] - 29/09/2021

### Added

- Finnish locale to @qualweb/locale package

### Updated

- dependencies

## [0.7.3] - 09/08/2021

### Added

- logging options (log files are now not generated by default)

## [0.7.2] - 28/07/2021

## BREAKING CHANGES

- result codes from evaluation modules have changed from "RCx" to "Px" (Passed), "Wx" (Warning), "Fx" (Failed) and "Ix" (Inapplicable)

### Updated

- dependencies

## [0.7.1-alpha] - 27/07/2021

### Updated

- localization support
- dependencies

## [0.6.14] - 23/07/2021

### Updated

- dependencies
- test files

## [0.6.14] - 22/07/2021

### Updated

- dependencies

## [0.6.13] - 21/07/2021

### Updated

- dependencies

## [0.6.12] - 30/06/2021

### Updated

- dependencies

## [0.6.11] - 21/06/2021

### Updated

- dependencies

## [0.6.10] - 14/06/2021

### Fixed

- error when using `html` option

### Updated

- dependencies

## [0.6.9] - 25/05/2021

### Updated

- dependencies

## [0.6.8] - 19/05/2021

### Updated

- dependencies

## [0.6.7] - 12/05/2021

### Updated

- dependencies

## [0.6.6] - 11/05/2021

### Changes

- qualweb error log file is now deleted if every evaluation succeeded

### Updated

- dependencies

## [0.6.5] - 10/05/2021

### Updated

- dependencies

## [0.7.0-alpha] - 05/05/2021

### Added

- localization support

## [0.6.4] - 03/05/2021

### Updated

- dependencies

## [0.6.3-alpha] - 27/04/2021

### Updated

- dependencies

## [0.5.7] - 27/04/2021

### Updated

- dependencies

## [0.5.6] - 23/04/2021

### Updated

- dependencies

## [0.6.2-alpha] - 26/04/2021

### Changed

- qualweb-errors.log to qualweb-errors-<timestamp>.log
  - now a new error.log file is created for every call of the evaluate() function

## [0.6.1-alpha] - 22/04/2021

### Updated

- @qualweb/types
- README.md

## [0.6.0-alpha] - 21/04/2021

### Added

- puppeteer-extra with AdBlocker and Stealth plugins (optional)
- puppeteer-cluster to enable faster evaluations of multiple webpages

### Updated

- puppeteer to version 9.0.0

## [0.5.5] - 15/04/2021

### Updated

- dependencies
- code optimizations

## [0.5.4] - 13/04/2021

### Updated

- dependencies
- documentation

## [0.5.3] - 01/04/2021

### Updated

- dependencies

## [0.5.2] - 31/03/2021

### Changes

- Removed QW-ACT-R8 since it was deprecated (https://act-rules.github.io/rules/9eb3f6)
- Changed dom data structure in the final evaluation report
  - now it only shows the processed dom information, instead of both source page and processed page
- Removed a lot of third party dependencies on all modules

### Updated

- dependencies

## [0.5.1] - 23/03/2021

### Added

- code documentation

### Updated

- earl-reporter
- @qualweb/types

## [0.5.0] - 23/03/2021

### Updated

- puppeteer to version 8.0.0

## [0.4.69] - 22/03/2021

### Updated

- dependencies
- exported functions

## [0.4.68] - 22/03/2021

### Updated

- dependencies

## [0.4.67] - 22/03/2021

### Updated

- dependencies

### Changed

## [0.4.66] - 12/03/2021

### Changed

- downgraded puppeteer from version 8.0.0 to 5.5.0 due to inconsistent certificate validation

## [0.4.65] - 11/03/2021

### Updated

- dependencies
- README.md

## [0.4.64] - 11/03/2021

### Updated

- dependencies
- README.md

## [0.4.63] - 10/03/2021

### Updated

- dependencies

## [0.4.62] - 08/03/2021

### Updated

- dependencies

## [0.4.61] - 08/03/2021

### Updated

- dependencies

## [0.4.60] - 03/03/2021

### Updated

- dependencies

## [0.4.59] - 03/03/2021

### Added

- element and role counter

## [0.4.58] - 01/03/2021

### Updated

- dependencies

## [0.4.57] - 27/02/2021

### Updated

- dependencies

## [0.4.56] - 26/02/2021

### Updated

- dependencies

## [0.4.55] - 25/02/2021

### Updated

- dependencies

## [0.4.54] - 23/02/2021

### Updated

- dependencies

## [0.4.53] - 20/02/2021

### Updated

- dependencies
- README.md

## [0.4.51] - 08/02/2021

### Updated

- dependencies

## [0.4.50] - 25/01/2021

### Updated

- dependencies

## [0.4.49] - 25/01/2021

### Updated

- dependencies

## [0.4.48] - 25/01/2021

### Updated

- dependencies

## [0.4.47] - 23/01/2021

### Updated

- dependencies

## [0.4.46] - 11/01/2021

### Updated

- dependencies

## [0.4.45] - 06/01/2021

### Updated

- dependencies

## [0.4.44] - 06/01/2021

### Updated

- dependencies

## [0.4.43] - 16/12/2020

### Updated

- dependencies

## [0.4.42] - 10/12/2020

### Updated

- dependencies

## [0.4.41] - 1/12/2020

### Updated

- dependencies

## [0.4.40] - 09/12/2020

### Updated

- dependencies

## [0.4.39] - 11/11/2020

### Updated

- dependencies

## [0.4.38] - 11/11/2020

### Updated

- dependencies

## [0.4.37] - 10/11/2020

### Updated

- README.md

## [0.4.36] - 10/11/2020

### Updated

- dependencies

## [0.4.35] - 05/11/2020

### Updated

- dependencies

## [0.4.34] - 02/11/2020

### Updated

- dependencies

## [0.4.33] - 21/10/2020

### Updated

- dependencies

## [0.4.32] - 15/10/2020

### Updated

- dependencies

## [0.4.31] - 12/10/2020

### Updated

- tsconfig.json

## [0.4.30] - 12/10/2020

### Updated

- dependencies

## [0.4.29] - 08/10/2020

### Updated

- dependencies

## [0.4.28] - 08/10/2020

### Updated

- dependencies
- code refactor
- tests

## [0.4.27] - 03/10/2020

### Updated

- dependencies
- core interface

## [0.4.26] - 29/09/2020

### Updated

- dependencies

## [0.4.25] - 23/09/2020

### Updated

- deleted logs

## [0.4.24] - 23/09/2020

### Updated

- dom and evaluation dependencies

## [0.4.23] - 23/09/2020

### Updated

- dom and evaluation dependencies

## [0.4.22] - 23/09/2020

### Updated

- dom and evaluation dependencies

## [0.4.21] - 23/09/2020

### Updated

- dom and evaluation dependencies

## [0.4.20] - 18/09/2020

### Updated

- dom and evaluation dependencies

## [0.4.19] - 16/09/2020

### Updated

- dom and evaluation dependencies

## [0.4.18] - 07/09/2020

### Updated

- dependencies

## [0.4.17] - 25/08/2020

### Updated

- dependencies

## [0.4.16] - 16/08/2020

### Updated

- dependencies

## [0.4.15] - 06/08/2020

### Updated

- dependencies

## [0.4.14] - 29/07/2020

### Updated

- dependencies

## [0.4.13] - 28/07/2020

### Updated

- dependencies

## [0.4.12] - 27/07/2020

### Updated

- dependencies

## [0.4.11] - 11/07/2020

### Updated

- dependencies

## [0.4.10] - 11/07/2020

### Updated

- dependencies

## [0.4.10] - 03/07/2020

### Updated

- dependencies

## [0.4.9] - 03/07/2020

### Updated

- dependencies
- code optimization

## [0.4.8] - 25/06/2020

### Fixed

- Updated dependencies

## [0.4.7] - 25/06/2020

### Fixed

- Updated dependencies

## [0.4.6] - 23/06/2020

### Fixed

- Updated dependencies

## [0.4.5] - 21/06/2020

### Fixed

- Updated dependencies

## [0.4.4] - 18/06/2020

### Fixed

- Updated dependencies

## [0.4.3] - 08/06/2020

### Fixed

- Updated dependencies

## [0.4.2] - 08/06/2020

### Fixed

- Updated dependencies and added evaluate and dom

## [0.4.1] - 15/05/2020

### Fixed

- qwPage.js dependency path

## [0.4.0] - 15/05/2020

### Updated

- evaluation modules
- architecture

## [0.3.20] - 07/05/2020

### Downgraded

- @qualweb/crawler to version 0.1.1 before the keyboard event

## [0.3.19] - 06/05/2020

### Added

- new input method: plain html

## [0.3.18] - 06/05/2020

### Updated

- dependencies
- tests
- README.md

## [0.3.16] - 22/03/2020

### Updated

- act-rules module
- puppeteer to version 3
- the way qualweb obtains the page source html

## [0.3.16] - 19/03/2020

### Updated

- act-rules module

## [0.3.15] - 18/03/2020

### Updated

- act-rules module
- html-techniques module

## [0.3.14] - 21/02/2020

### Updated

- act-rules module

## [0.3.13] - 17/02/2020

### Updated

- act-rules module
- system and modules manager

## [0.3.12] - 22/01/2020

### Updated

- act-rules module

## [0.3.11] - 22/01/2020

### Updated

- earl-reporter module

## [0.3.10] - 21/01/2020

### Updated

- act-rules module
- earl-reporter module

## [0.3.9] - 17/01/2020

### Updated

- act-rules module
- css-techniques module
- best-practices module
- earl-reporter module

## [0.3.8] - 15/01/2020

### Updated

- act-rules module

## [0.3.7] - 14/01/2020

### Updated

- act-rules module
- README.md

## [0.3.6] - 14/01/2020

### Updated

- act-rules module
- README.md

## [0.3.5] - 13/01/2020

### Updated

- act-rules module

## [0.3.4] - 09/01/2020

### Updated

- act-rules module

## [0.3.3] - 08/01/2020

### Fixed

- some bugs

## [0.3.2] - 08/01/2020

### Updated

- act-rules module

## [0.3.1] - 08/01/2020

### Fixed

- a bug with the inpage stylesheets

## [0.3.0] - 08/01/2020

### Updated

- act-rules module
- README.md

## [0.2.17] - 07/01/2020

### Fixed

- some bugs

## [0.2.16] - 07/01/2020

### Fixed

- some bugs

## [0.2.15] - 07/01/2020

### Updated

- act-rules module
- type definitions

## [0.2.15] - 07/01/2020

### Updated

- act-rules module

### Fixed

- some bugs

## [0.2.14] - 07/01/2020

### Updated

- act-rules module

## [0.2.13] - 06/01/2020

### Updated

- act-rules module

## [0.2.12] - 18/12/2019

### Fixed

- code optimization

### Updated

- dependencies

## [0.2.11] - 18/12/2019

### Fixed

- code optimization

## [0.2.10] - 18/12/2019

### Fixed

- some core bugs
- code optimization

### Updated

- @qualweb/types module

## [0.2.9] - 16/12/2019

### Updated

- css-techniques module
- best-practices module

## [0.2.8] - 11/12/2019

### Updated

- css-techniques module
- best-practices module

## [0.2.7] - 09/12/2019

### Updated

- html-techniques module

## [0.2.6] - 05/12/2019

### Updated

- html-techniques module

## [0.2.5] - 05/12/2019

### Updated

- html-techniques module

## [0.2.4] - 04/12/2019

### Updated

- act-rules module

## [0.2.3] - 03/12/2019

### Fixed

- processed html not being added to the final report

## [0.2.2] - 03/12/2019

### Fixed

- a bug that counted and empty space ("") as an url when parsing a file with urls

## [0.2.1] - 02/12/2019

### Fixed

- maxParallelEvations parameter

## [0.2.0] - 02/12/2019

### Updated

- evaluation modules
- architecture
- types

## [0.1.10] - 20/11/2019

### Updated

- best-practices package

## [0.1.9] - 20/11/2019

### Updated

- html-techniques package

## [0.1.8] - 20/11/2019

### Updated

- best-practices package
- html-techniques package

## [0.1.7] - 19/11/2019

### Updated

- get-dom-puppeteer package

## [0.1.6] - 29/10/2019

### Updated

- act-rules module

## [0.1.5] - 29/10/2019

### Updated

- act-rules module

## [0.1.4] - 29/10/2019

### Updated

- act-rules module

## [0.1.3] - 29/10/2019

### Updated

- act-rules module with more implemented rules

## [0.1.2] - 14/10/2019

### Fixed

- dependencies bugs

## [0.1.1] - 14/10/2019

### Fixed

- a bug where two evaluations followed were giving incorrect results

## [0.1.0] - 14/10/2019

### Added

- options to run specific modules
- option to continue running evaluations even if any url fails to evaluate

## [0.0.6] - 07/10/2019

### Changed

- core architecture

### Updated

- act-rules module
- html-techniques module

## [0.0.5] - 17/09/2019

### Added

- module "html-techniques"
- module "css-techniques"
- module "best-practices"

### Updated

- package @qualweb/get-dom-puppeteer to version 0.0.4
- package @qualweb/types to version 0.0.24
- package @qualweb/earl-reporter to version 0.0.4

## [0.0.4] - 12/09/2019

### Added

- Dom interface to the evaluation report

## [0.0.3] - 12/08/2019

### Added

- "mocha" framework

### Changed

- access to dom object from the @qualweb/get-dom-puppeteer module

### Updated

- package @qualweb/types to version 0.0.32
- package @qualweb/get-dom-puppeteer to version 0.0.2
- package @qualweb/earl-reporter to version 0.0.3
- package @qualweb/act-rules to version 0.0.3
- package @qualweb/wappalyzer to version 0.0.2
- package @types/node to version 12.7.1
