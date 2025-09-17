// utils/Presentador.js
import chalk from "chalk";
import boxen from "boxen";

class Presentador {
  static mostrarDetalles(personaje) {
    const detalles = `
👤 Nombre: ${chalk.green(personaje.nombre)}
🧩 Rol: ${chalk.cyan(personaje.rol)}
⭐ Nivel: ${chalk.yellow(personaje.nivel)}
❤️ Vida: ${chalk.red(personaje.vida)}
⚔️ Ataque: ${chalk.magenta(personaje.ataque)}
🛡️ Defensa: ${chalk.blue(personaje.defensa)}
`;

    console.log(
      boxen(detalles, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
      })
    );
  }

  static mensaje(msg, tipo = 'info') {
    const colores = {
      info: chalk.cyan,
      ok: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
    };
    console.log(colores[tipo](msg));
  }
}

export default Presentador;
