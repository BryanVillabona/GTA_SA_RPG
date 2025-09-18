const inquirer = require('inquirer');
const Presentador = require('../utils/Presentador');
const Batalla = require('./Batalla');
const ConsoleNotificador = require('../utils/Notificador');

class GestorJuego {
  constructor({ gestorJugadores }) {
    this.gestorJugadores = gestorJugadores;
    this.personajeActivo = null;
  }

  async crearPersonaje() {
    const roles = await this.gestorJugadores.listarRoles();
    const choices = roles.map(r => ({
      name: `${r.rol} (HP:${r.vida} ATK:${r.ataque} DEF:${r.defensa})`,
      value: r.rol,
    }));

    const answers = await inquirer.prompt([
      {
        type: 'input', name: 'nombre', message: 'Nombre del personaje:',
        validate: value => value.trim().length > 0 ? true : 'El nombre no puede estar vacío.',
      },
      { type: 'list', name: 'rol', message: 'Selecciona un rol:', choices },
    ]);

    const nuevo = await this.gestorJugadores.crearJugador(answers);
    Presentador.mensaje(`✅ Personaje creado: ${nuevo.nombre} (${nuevo.rol})`, 'ok');
    return nuevo;
  }

  async verPersonajes() {
    const jugadores = await this.gestorJugadores.listarJugadores();
    if (jugadores.length === 0) {
      return Presentador.mensaje('⚠️ No hay personajes creados aún.', 'warn');
    }

    const { seleccionadoId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'seleccionadoId',
        message: 'Elige un personaje:',
        choices: jugadores.map(j => ({
          name: `${j.nombre} — ${j.rol} (Nivel ${j.nivel})`,
          value: j.id,
        })),
      },
    ]);

    const personaje = await this.gestorJugadores.obtenerJugadorPorId(seleccionadoId);
    Presentador.mostrarDetalles(personaje);

    const { activar } = await inquirer.prompt([
      { type: 'confirm', name: 'activar', message: `¿Activar ${personaje.nombre}?`, default: true },
    ]);

    if (activar) {
      this.personajeActivo = personaje;
      Presentador.mensaje(`✅ ${personaje.nombre} ahora es tu personaje activo.`, 'ok');
    }
  }

  async iniciarBatalla() {
    if (!this.personajeActivo) {
      Presentador.mensaje('⚠️ No tienes un personaje activo. Debes seleccionar o crear uno.', 'warn');
      return;
    }

    Presentador.mensaje(`⚔️ Preparando batalla con ${this.personajeActivo.nombre}...`, 'info');
    
    const notificador = new ConsoleNotificador();
    const batalla = new Batalla({ notificador, gestorJugadores: this.gestorJugadores });
    
    const resultado = await batalla.iniciarConJugador(this.personajeActivo);

    if (resultado === 'lose') {
      this.personajeActivo = null;
    } else {
      this.personajeActivo = await this.gestorJugadores.obtenerJugadorPorId(this.personajeActivo.id);
    }

    return resultado;
  }
}

module.exports = GestorJuego;