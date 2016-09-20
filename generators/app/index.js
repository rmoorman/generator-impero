'use strict'

const yeoman = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const extend = require('lodash').merge

module.exports = yeoman.Base.extend({
  prompting () {
    // Have Yeoman greet the user.
    this.log(yosay(
      `Welcome to the ${chalk.yellow('Impero')} generator!`
    ))

    const prompts = [{
      type: 'input',
      name: 'name',
      message: `Your project name (must be ${chalk.underline('unique')})?`,
      //Defaults to the project's folder name if the input is skipped
      default: this.appname
    }, {
      type: 'input',
      name: 'description',
      message: 'Your project description?',
      default: 'A new project generated by the Impero generator'
    }, {
      type: 'list',
      name: 'cssLang',
      message: 'Which CSS preprocessor?',
      // Sourdough is disabled until a Webpack-compatible loader is developed
      choices: [/*{
        name: 'Sourdough / SSS'
      }, */{
        name: 'Sass'
      }, {
        name: 'Sass (SCSS)'
      }, {
        name: 'Stylus'
      }],
      default: 0
    }, {
      type: 'list',
      name: 'jsLang',
      message: 'Which JS language/compiler? (all include ES2015 / Babel)',
      // TypeScript is disabled until the loader's compatibility with Node 6.x is fixed
      // Further development will likely be required after that point
      choices: [{
        name: 'Vanilla'
      }/*, {
        name: 'TypeScript'
      }*/],
      default: 0
    }, {
      type: 'confirm',
      name: 'copyEnv',
      message: 'Copy .env.example to .env?',
      default: true
    }, {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies?',
      default: true
    }]

    return this.prompt(prompts).then(answers => {
      // To access props later use this.props.exampleAnswer
      this.props = answers

      // Make object of CSS choice details
      this.props.cssLang = {
        name: this.props.cssLang
      }

      // Add additional details for each option
      // Better than making a load of additional files to copy instead
      switch (this.props.cssLang.name) {
        case 'Sourdough / SSS':
          this.props.cssLang.templateDir = 'sourdough'
          this.props.cssLang.loader = 'TODO'
          this.props.cssLang.fileExt = 'sss'
          break
        case 'Sass':
          this.props.cssLang.templateDir = 'sass'
          this.props.cssLang.loader = 'sass'
          this.props.cssLang.fileExt = 'sass'
          break
        case 'Sass (SCSS)':
          this.props.cssLang.templateDir = 'scss'
          this.props.cssLang.loader = 'sass'
          this.props.cssLang.fileExt = 'scss'
          break
        case 'Stylus':
          this.props.cssLang.templateDir = 'stylus'
          this.props.cssLang.loader = 'stylus'
          this.props.cssLang.fileExt = 'styl'
          break
        // This should never happen
        default:
          break
      }

      // And do the same for JS
      this.props.jsLang = {
        name: this.props.jsLang
      }

      switch (this.props.jsLang.name) {
        case 'Vanilla':
          this.props.jsLang.templateDir = 'vanilla'
          this.props.jsLang.loader = 'babel'
          this.props.jsLang.fileExt = 'js',
          this.props.jsLang.linter = 'eslint'
          break
        case 'TypeScript':
          this.props.jsLang.templateDir = 'typescript'
          this.props.jsLang.loader = 'babel!ts?sourceMap'
          this.props.jsLang.fileExt = 'ts',
          this.props.jsLang.linter = 'tslint'
          break
        // This should never happen
        default:
          break
      }
    })
  },

  writing () {
    // Copy templated files
    this.fs.copyTpl(
      this.templatePath('.editorconfig'),
      this.destinationPath('.editorconfig'), {
        cssExt: this.props.cssLang.fileExt
      }
    )
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'), {
        name: this.props.name,
        description: this.props.description,
        cssLang: this.props.cssLang.name,
        cssLoader: this.props.cssLang.loader
      }
    )
    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'), {
        name: this.props.name,
        cssName: this.props.cssLang.name
      }
    )
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'), {
        cssLang: this.props.cssLang.name,
        cssLoader: this.props.cssLang.loader,
        cssExt: this.props.cssLang.fileExt,
        jsLoader: this.props.jsLang.loader,
        jsExt: this.props.jsLang.fileExt,
        jsLinter: this.props.jsLang.linter
      }
    )
    this.fs.copyTpl(
      this.templatePath('webpack.production.config.js'),
      this.destinationPath('webpack.production.config.js'), {
        cssLang: this.props.cssLang.name,
        cssLoader: this.props.cssLang.loader,
        cssExt: this.props.cssLang.fileExt,
        jsLoader: this.props.jsLang.loader,
        jsExt: this.props.jsLang.fileExt,
        jsLinter: this.props.jsLang.linter
      }
    )
    this.fs.copyTpl(
      this.templatePath('deploy'),
      this.destinationPath('deploy'), {
        name: this.props.name
      }
    )

    // Copy untemplated files
    this.fs.copy(
      this.templatePath('.env.example'),
      this.destinationPath('.env.example')
    )
    if (this.props.copyEnv) this.fs.copy(
      this.templatePath('.env.example'),
      this.destinationPath('.env')
    )
    if (this.props.jsLang.name === 'Vanilla') this.fs.copy(
      this.templatePath('.eslintrc'),
      this.destinationPath('.eslintrc')
    )
    // Prefixed with an underscore, else npm will rename it to .npmignore
    this.fs.copy(
      this.templatePath('_.gitignore'),
      this.destinationPath('.gitignore')
    )
    this.fs.copy(
      this.templatePath('Dockerfile'),
      this.destinationPath('Dockerfile')
    )
    if (this.props.jsLang.name === 'TypeScript') this.fs.copy(
      this.templatePath('tslint.json'),
      this.destinationPath('tslint.json')
    )
    this.fs.copy(
      this.templatePath('app/assets/humans.txt'),
      this.destinationPath('app/assets/humans.txt')
    )
    this.fs.copy(
      this.templatePath('app/assets/img/.gitkeep'),
      this.destinationPath('app/assets/img/.gitkeep')
    )
    this.fs.copy(
      this.templatePath('app/views'),
      this.destinationPath('app/views')
    )
    this.fs.copy(
      this.templatePath('app/index.js'),
      this.destinationPath('app/index.js')
    )
    this.fs.copy(
      this.templatePath('app/routes.js'),
      this.destinationPath('app/routes.js')
    )

    // Copy CSS
    this.fs.copy(
      this.templatePath(`app/src/_styles/${this.props.cssLang.templateDir}`),
      this.destinationPath('app/src/styles')
    )

    // Copy JS
    this.fs.copy(
      this.templatePath(`app/src/_scripts/${this.props.jsLang.templateDir}`),
      this.destinationPath('app/src/scripts')
    )

    // Add dependencies based upon selected options
    let deps = this.fs.readJSON(this.destinationPath('package.json'), {})

    const cssOptionalDeps = {
      'Sass': {
        'node-sass': '^3.9.3',
        'sass-loader': '^4.0.2'
      },
      'Sass (SCSS)': {
        'node-sass': '^3.9.3',
        'sass-loader': '^4.0.2'
      },
      'Stylus': {
        'rupture': '^0.6.1',
        'stylus': '^0.54.5',
        'stylus-loader': '^2.3.1'
      }
    }

    const jsOptionalDeps = {
      'Vanilla': {
        'babel-eslint': '^6.1.2',
        'eslint': '^3.4.0',
        'eslint-loader': '^1.5.0'
      },
      'TypeScript': {
        'ts-loader': '^0.8.2',
        'tslint': '^3.15.1',
        'tslint-loader': '^2.1.5',
        'typescript': '^1.8.10'
      }
    }

    extend(deps, {
      devDependencies: cssOptionalDeps[this.props.cssLang.name]
    })

    extend(deps, {
      devDependencies: jsOptionalDeps[this.props.jsLang.name]
    })

    // Sort the dependencies
    // This is absolutely not needed but a nice-to-have :-)
    let sortedDeps = {}

    Object.keys(deps.devDependencies).sort().forEach(key => {
      sortedDeps[key] = deps.devDependencies[key]
    })

    deps.devDependencies = sortedDeps

    this.fs.writeJSON(this.destinationPath('package.json'), deps)
  },

  install () {
    // Install dependencies in scaffolded package.json
    if (this.props.installDeps) this.installDependencies({
      bower: false
    })

    /* TODO
    * install 'typings' globally or at least inform the user of their possible need to do so

    if (this.props.jsLang.name === 'TypeScript') {
      //
    }
    */
  }
})
