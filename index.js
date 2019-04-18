const inquirer = require('inquirer');
const fetch = require('node-fetch');
const chalk = require('chalk');
const xss = require('xss');

const API_URL = 'https://ls.terminal.ink';

const makeSpace = (length) => {
  let output = '';
  for (let i = 0; i < length; i++) {
    output += ' ';
  }
  return output;
}

const makeDangerous = contents => contents
  .replace('&gt;', '>')
  .replace('&lt;', '<')
  .replace('&amp;', '&')
  .replace('&quot;', '"')
  .replace('&apos;', '\'')

const mainMenu = () => {
  return inquirer
    .prompt({
      type: 'rawlist',
      name: 'type',
      message: 'Please select a type of application',
      choices: [
        {
          name: 'Bots',
          value: 'bots'
        }, {
          name: 'RPC Applications',
          value: 'rpc'
        }, {
          name: 'Exit',
          value: 'exit'
        }
      ]
    })
}

const appMenu = (type, apps) => {
  return inquirer
    .prompt({
      type: 'rawlist',
      name: 'id',
      message: 'Please select the application you wish to look at',
      choices: apps
        .filter(app => app.type === type)
        .filter(bot => bot.contents)
        .map(bot => ({
          name: bot.contents.name,
          value: bot.id
        }))
    })
}

const displayApp = (app) => {
  const contents = xss(app.contents.page, {
    whitelist: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });
  console.log(`
${chalk.black.bgCyan(`   ${makeSpace(app.contents.name.length)}   `)}
${chalk.black.bgCyan(`   ${app.contents.name}   `)}
${chalk.black.bgCyan(`   ${makeSpace(app.contents.name.length)}   `)}

${chalk.italic(app.contents.description)}

---------------------------
${makeDangerous(contents)}
  `);
}

(async () => {
  console.log('Please wait...');
  
  const fetchedApps = await fetch(`${API_URL}/api/v2/apps`)
    .then(res => res.json())

  const apps = fetchedApps.data.map((bot) => {
    bot.contents = bot.contents[0];
    return bot;
  })
  

  while(true) {
    const { type } = await mainMenu();
    if (type === 'exit') {
      console.log(`This version of Discord Apps Marketplace is ${chalk.red('SHAREWARE')}.
Software licences start at just £1.99.
Read MAILORDR.TXT or MAILORDR.RTF for instructions on how to send in a mail order.

Thanks for visiting.
${chalk.underline('Copyright Internet Terminal Solutions Corp., 1983 - 1989')}`)
      process.exit(0);
    }
    const { id } = await appMenu(type, apps);
    displayApp(apps.find(bot => bot.id === id));
  }
})();
