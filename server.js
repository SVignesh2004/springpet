process.env.NODE_ENV = 'development';

const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

const port = process.env.PORT || 3000;
let compiler;

const friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASyntaxError(message) {
  return typeof message === 'string' && message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

function formatMessage(message) {
  if (typeof message !== 'string') {
    return message;
  }
  return message
    .replace('Module build failed: SyntaxError:', friendlySyntaxErrorLabel)
    .replace(/Module not found: Error: Cannot resolve 'file' or 'directory'/, 'Module not found:')
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '')
    .replace('./~/css-loader!./~/postcss-loader!', '');
}

function clearConsole() {
  process.stdout.write('\x1bc');
}

function setupCompiler(port, protocol) {
  compiler = webpack(config);

  compiler.hooks.invalid.tap('invalid', () => {
    clearConsole();
    console.log('Compiling...');
  });

  compiler.hooks.done.tap('done', (stats) => {
    clearConsole();
    const hasErrors = stats.hasErrors();
    const hasWarnings = stats.hasWarnings();
    if (!hasErrors && !hasWarnings) {
      console.log(chalk.green('Compiled successfully!'));
      console.log();
      console.log('The app is running at:');
      console.log();
      console.log('  ' + chalk.cyan(`${protocol}://localhost:${port}/`));
      console.log();
      console.log('Note that the development build is not optimized.');
      console.log(`To create a production build, use ${chalk.cyan('npm run build')}.`);
      console.log();
      return;
    }

    const json = stats.toJson({}, true);
    let formattedErrors = json.errors.map(message => `Error in ${formatMessage(message)}`);
    const formattedWarnings = json.warnings.map(message => `Warning in ${formatMessage(message)}`);
    if (hasErrors) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      if (formattedErrors.some(isLikelyASyntaxError)) {
        formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
      }
      formattedErrors.forEach(message => {
        console.log(message);
        console.log();
      });
      return;
    }
    if (hasWarnings) {
      console.log(chalk.yellow('Compiled with warnings.'));
      console.log();
      formattedWarnings.forEach(message => {
        console.log(message);
        console.log();
      });
      console.log('You may use special comments to disable some warnings.');
      console.log(`Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.`);
      console.log(`Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.`);
    }
  });
}

function runDevServer(port, protocol) {
  const devServerOptions = {
    static: {
      directory: path.join(__dirname, 'public')
    },
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      publicPath: config.output.publicPath,
    },
    client: {
      logging: 'none',
    },
    port,
    open: true,
  };

  const devServer = new WebpackDevServer(devServerOptions, compiler);

  devServer.startCallback((err) => {
    if (err) {
      return console.log(err);
    }

    console.log(chalk.cyan('Starting the development server...'));
    console.log();
  });
}

function run(port) {
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  setupCompiler(port, protocol);
  runDevServer(port, protocol);
}

run(port);