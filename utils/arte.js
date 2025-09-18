const chalk = require('chalk');

const arte = {
  Medico: chalk.whiteBright(`
     .---.
    /     \\
   |  ${chalk.red('+')}  |
--- | '-' | ---
 |  |___|  |
 '---------'
  `),

  Ganster: chalk.yellow(`
      .--.
     /,-. \\
    // /_\\ \\
   /|  😎 |
  / |_'-'_|
 /_________\\
  `),

  Narco: chalk.redBright(`
   .-""""-.
  /        \\
 |  ${chalk.white('o')}  ${chalk.white('o')}  |
 |   /\\   |
  \\  ==  /
   '----'
  `),

  Militar: chalk.green(`
   .--""--.
  / ______ \\
 / /_\\__/_\\ \\
|  (oo)  |
|________|
   '--'
  `),

  Ryder: chalk.magentaBright(`
   .--'''--.
  /  .---.  \\
 |  (---)  |
  \\   -   /
   '.___.'
  `),
    
  'Vagos Armado': chalk.cyan(`
     .--.
    /  .. \\
   |  < >  |
--- ${chalk.yellow('xxxxxx')} ---
 |________|
  `),

  default: chalk.gray(`
   .----.
  /      \\
 |  ?  ?  |
 |   --   |
  \\ ---- /
   '----'
  `)
};

module.exports = arte;