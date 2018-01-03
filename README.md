# babel-plugin-variable-path-resolver
[![Maintenance Status][status-image]][status-url] [![NPM version][npm-image]][npm-url]

A [Babel](http://babeljs.io) plugin for resolving dynamic modules based on a environment variable.

## Usage

Install the plugin

```
$ npm install --save-dev babel-plugin-variable-path-resolver
```

Specify the plugin in your `.babelrc` with the custom environment name and path replacement settings. Here's an example:

```json
// .babelrc file
{
  "plugins": [
    ["variable-path-resolver", {
      "envName": "CUSTOMENV",
      "vars": {
        "ENV1": {"Bar1": "Foo1", "Bar2": "Foo2" },
        "ENV2": {"Bar1": "Foo3", "Bar2": "Foo4"}
      }
    }]
  ]
}
```

```js
// examples:
import SomeComponent from './components/{Bar1}/SomeComponent';
// multiple replacement
import AnotherComponent from './components/{Bar1}/{Bar2}/AnotherComponent';
```
##### Run your project like this
```
CUSTOMENV=ENV1 node scripts/start.js
```
```json
// package.json
{
  "name": "example-project1",
  "scripts": {
    "example-site1": "CUSTOMENV=ENV1 node scripts/start.js",
    "example-site2": "CUSTOMENV=ENV2 node scripts/start.js",
```
```
npm run-script example-project1
```
#### Another example
```json
{
  "plugins": [
    ["variable-path-resolver", {
      "envName": "SITE",
      "vars": {
        "mobile-com": {"device": "Mobile", "site": "Com" },
        "mobile-eu": {"device": "Mobile", "site": "Eu"},
        "desktop-com": {"device": "Desktop", "site": "Com" },
        "desktop-eu": {"device": "Desktop", "site": "Eu"},
        "default": {"device": null, "site": "Com"}
      }
    }]
  ]
}
```
```json
// your package.json
{
  "name": "example-project2",
  "scripts": {
    "mobile-com": "SITE=mobile-com node scripts/start.js",
    "mobile-eu": "SITE=mobile-eu node scripts/start.js",
```
```
//example: your folder structure
.
+-- components
|   +-- Mobile
|		  +-- Com
|		  +-- Eu
|   +-- Desktop
|		  +-- Com
|		  +-- Eu
+-- App.js // An entry file
```
```
SITE=mobile-eu npm run-script example-project2
```

## Advantage of this plugin

You can create multiple sites with basic usage of inheritance. As per the above example, keeping .com site as the default and all other sites as inherited.

```
// Base component
// File name: ./components/Mobile/Com/index.js

import React, { Component } from "React";

export class ComIndex from Component {
	construtor(props) {
    	super(props);
        this.message = "Hello .com Site";
    }
    render() {
    	<div>
        	{this.message}
        </div>
    }
}

// An inherited component
import React, { Component } from "React";
import BaseComIndexComponent from "./components/Mobile/Com/"

export class EuIndex from BaseComIndexComponent { // inheriting the base component properties and methods.
	construtor(props) {
    	super(props);
        this.message = "Hello .eu Site";
    }
}

// App.js // An entry file

import React, { Component } from "React";
import SiteComponent from "./components/{Device}/{Site}/"

export class AppEntry extends Component {
	render () {
    	<SiteComponent />
    }
}
```

### Options

- `envName`: Environment variable name used to determine the current running config
- `vars`: A map of configs for each environment, where the keys will be replaced with the values on resolving the path
- `vars` - `default` is used for resolving the path if the target file not present.
- `extensions`: An array of extensions used in the resolver. Override the default extensions (`['.js', '.jsx', '.es', '.es6', '.mjs']`).
- `transformFunctions`: Array of functions and methods that will have their first argument transformed. By default those methods are: `require`, `require.resolve`, `System.import`, `jest.genMockFromModule`, `jest.mock`, `jest.unmock`, `jest.doMock`, `jest.dontMock`.


### Known issues when integrating with other babel plugins 

- `babel-plugin-module-resolver`: Module resolver will not work along with this plugin, we will be working towards to accomodate module resolver.
- `babel-loader`:  While changing from one site environment to another, you have to reset the babel-loader cache(only on development environment) from its file system using 
```
rm -rf node_modules/.cache/babel-loader
// above command is for default babel-loader config of cacheDirectory: true.
````



[status-image]: https://img.shields.io/badge/status-maintained-brightgreen.svg
[status-url]: https://github.com/shameemz/babel-plugin-variable-path-resolver

[npm-image]: https://img.shields.io/npm/v/babel-plugin-variable-path-resolver.svg
[npm-url]: https://www.npmjs.com/package/babel-plugin-variable-path-resolver