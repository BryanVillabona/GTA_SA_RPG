const inquirer = require('inquirer');
const boxen = require('boxen');
const chalk = require('chalk');
const cfonts = require('cfonts');

const GestorJuego = require('./services/GestorJuego');
const GestorJugadores = require('./services/GestorJugadores');
const JugadorRepository = require('./services/JugadorRepository');
const Presentador = require('./utils/Presentador');

function configurarAplicacion() {
  const jugadorRepository = new JugadorRepository();
  const gestorJugadores = new GestorJugadores({ jugadorRepository });
  const gestorJuego = new GestorJuego({ gestorJugadores });
  return gestorJuego;
}

async function main() {
  const juego = configurarAplicacion();
  let salir = false;

  while (!salir) {
    cfonts.say('GTA SA|RPG', {
      font: 'block',
      align: 'center',
      colors: ['yellow', 'white'],
      background: 'transparent',
      gradient: true,
    });

    if (juego.personajeActivo) {
      Presentador.mensaje(`👤 Personaje activo: ${juego.personajeActivo.nombre} (${juego.personajeActivo.rol})`, 'info');
    } else {
      Presentador.mensaje(' Ningún personaje activo seleccionado.', 'warn');
    }

    const { accion } = await inquirer.prompt([
      {
        type: 'list',
        name: 'accion',
        message: 'Selecciona una opción:',
        choices: [
          { name: '👤 Crear personaje', value: 'crear' },
          { name: '👥 Ver y activar personajes', value: 'ver' },
          { name: '⚔️  Iniciar batalla', value: 'batalla', disabled: !juego.personajeActivo },
          { name: '🚪 Salir', value: 'salir' },
        ],
      },
    ]);

    switch (accion) {
      case 'crear':
        await juego.crearPersonaje();
        break;

      case 'ver':
        await juego.verPersonajes();
        break;

      case 'batalla':
        const resultadoBatalla = await juego.iniciarBatalla();
        if (resultadoBatalla === 'lose' || resultadoBatalla === 'win') {
          await inquirer.prompt({
            type: 'input', name: 'continuar', message: 'Presiona ENTER para volver al menú...',
          });
        }
        break;

      case 'salir':
        salir = true;
        break;
    }
  }

  Presentador.mensaje('👋 ¡Gracias por jugar!', 'ok');
}

main();