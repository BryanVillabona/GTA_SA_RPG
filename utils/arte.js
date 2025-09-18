const chalk = require('chalk');

const arte = {
  Medico: chalk.whiteBright(`
      +---+
      | O |
   +--| H |--+
      |___|
     /   \\
    /_____\\
  `),

  Ganster: chalk.yellow(`
      .--.
     /  _ \\
    |  / \\ |
    |  |.'| |
    |  |  | |
    |  '--' |
    '------'
  `),

  Narco: chalk.red(`
    (ง'̀-'́)ง
     / \\
    | | |
    |_|_|
  `),

  Militar: chalk.green(`
     .--.
    | o o|
    |  O |
    '--O--'
     /|\\
    / | \\
  `),

  Ryder: chalk.magenta(`
     _._
    /   \\
   | (") |
    \\_-_/
    _|_|_
   / | | \\
  `),
    
  'Vagos Armado': chalk.cyan(`
   .-.
  (o.o)
   |=|
  .' '.
 // T \\
/.'Y'.\\
`),

  default: chalk.gray(`
    _._
   |? ?|
   | _ |
   '---'
  `)
};

module.exports = arte;