// Importaciones
const inquirer = require('inquirer');
const Presentador = require('../utils/Presentador');
const Batalla = require('./Batalla');
const ConsoleNotificador = require('../utils/Notificador');

// Clase principal del juego
class GestorJuego {
  constructor({ gestorJugadores }) {
    this.gestorJugadores = gestorJugadores;
    this.personajeActivo = null;
  }

  // Método para crear un nuevo personaje
  async crearPersonaje() {

    // Se obtienen los roles disponibles
    const roles = await this.gestorJugadores.listarRoles();

    // Se preparan las opciones para inquirer
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

    // Se crea el nuevo personaje
    const nuevo = await this.gestorJugadores.crearJugador(answers);
    Presentador.mensaje(`✅ Personaje creado: ${nuevo.nombre} (${nuevo.rol})`, 'ok');
    return nuevo;
  }

  // Método para ver y seleccionar personajes
  async verPersonajes() {

    // Se obtienen los personajes existentes
    const jugadores = await this.gestorJugadores.listarJugadores();

    // Si no hay personajes, se notifica y se sale
    if (jugadores.length === 0) {
      return Presentador.mensaje('⚠️ No hay personajes creados aún.', 'warn');
    }

    // Se pide al usuario que seleccione un personaje
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

    // Se obtiene el personaje seleccionado y se muestra sus detalles
    const personaje = await this.gestorJugadores.obtenerJugadorPorId(seleccionadoId);
    Presentador.mostrarDetalles(personaje);

    // Se pregunta si se quiere activar este personaje
    const { activar } = await inquirer.prompt([
      { type: 'confirm', name: 'activar', message: `¿Activar ${personaje.nombre}?`, default: true },
    ]);

    // Si se activa, se asigna como personaje activo
    if (activar) {
      this.personajeActivo = personaje;
      Presentador.mensaje(`✅ ${personaje.nombre} ahora es tu personaje activo.`, 'ok');
    }
  }

  // Método para iniciar una batalla
  async iniciarBatalla() {

    // Verificación de personaje activo
    if (!this.personajeActivo) {
      Presentador.mensaje('⚠️ No tienes un personaje activo. Debes seleccionar o crear uno.', 'warn');
      return;
    }

    // Notificación de inicio de batalla
    Presentador.mensaje(`⚔️ Preparando batalla con ${this.personajeActivo.nombre}...`, 'info');
    
    // Creación del notificador y la batalla
    const notificador = new ConsoleNotificador();
    const batalla = new Batalla({ notificador, gestorJugadores: this.gestorJugadores });
    
    // Inicio de la batalla
    const resultado = await batalla.iniciarConJugador(this.personajeActivo);

    // Actualización del personaje activo según el resultado
    if (resultado === 'lose') {
      this.personajeActivo = null;
    } else {
      this.personajeActivo = await this.gestorJugadores.obtenerJugadorPorId(this.personajeActivo.id);
    }

    return resultado;
  }
}

module.exports = GestorJuego;