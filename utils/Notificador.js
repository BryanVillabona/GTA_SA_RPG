const chalk = require('chalk');
const cliProgress = require('cli-progress');

class ConsoleNotificador {
  constructor() {
    this.multibar = new cliProgress.MultiBar({
      format: '{bar} | {personaje} | {value}/{total} HP',
      clearOnComplete: false,
      hideCursor: true
    }, cliProgress.Presets.shades_grey);
    this.barras = {};
  }

  mensaje(msg, tipo = 'info') {
    const colores = {
      info: chalk.cyan,
      ok: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
      title: chalk.bold.magenta,
    };
    console.log(colores[tipo](msg));
  }

  mostrarAccion(msg) {
    console.log(chalk.gray(`➡️ ${msg}`));
  }

  crearBarras(jugador, enemigo) {
    this.barras.jugador = this.multibar.create(jugador.vida, jugador.vida, { personaje: chalk.green(jugador.nombre) });
    this.barras.enemigo = this.multibar.create(enemigo.vida, enemigo.vida, { personaje: chalk.red(enemigo.nombre) });
  }

  actualizarBarras(jugador, enemigo) {
    this.barras.jugador.update(jugador.vida);
    this.barras.enemigo.update(enemigo.vida);
  }

  detenerBarras() {
    this.multibar.stop();
  }
}

module.exports = ConsoleNotificador;