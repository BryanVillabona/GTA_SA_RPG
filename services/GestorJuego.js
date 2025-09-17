// services/GestorJuego.js
import inquirer from 'inquirer';
import GestorJugadores from './GestorJugadores.js';
import Presentador from '../utils/Presentador.js';

class GestorJuego {
  constructor({ gestorJugadores }) {
    this.gestorJugadores = gestorJugadores || new GestorJugadores();
    this.personajeActivo = null;
  }

  async crearPersonaje() {
    const roles = await this.gestorJugadores.listarRoles();
    const choices = roles.map(r => ({
      name: `${r.rol} (HP:${r.vida} ATK:${r.ataque} DEF:${r.defensa})`,
      value: r.rol,
    }));

    const answers = await inquirer.prompt([
      { type: 'input', name: 'nombre', message: 'Nombre del personaje:' },
      { type: 'list', name: 'rol', message: 'Selecciona un rol:', choices },
    ]);

    const nuevo = await this.gestorJugadores.crearJugador(answers);
    Presentador.mensaje(`✅ Personaje creado: ${nuevo.nombre} (${nuevo.rol})`, 'ok');
  }

  async eliminarPersonaje() {
    const jugadores = await this.gestorJugadores.listarJugadores();
    if (jugadores.length === 0) {
      return Presentador.mensaje('⚠️ No hay personajes creados aún.', 'warn');
    }
  
    const { personajeAEliminar } = await inquirer.prompt([
      {
        type: 'list',
        name: 'personajeAEliminar',
        message: 'Selecciona el personaje a eliminar:',
        choices: jugadores.map(j => ({
          name: `${j.nombre} — ${j.rol} (Nivel ${j.nivel})`,
          value: j.id,
        })),
      },
    ]);
  
    // Filtramos para eliminar
    const nuevosJugadores = jugadores.filter(j => j.id !== personajeAEliminar);
  
    // Guardamos cambios en el archivo
    await this.gestorJugadores.guardarJugadores(nuevosJugadores);
  
    // Si eliminaste al personaje activo, lo reseteamos
    if (this.personajeActivo && this.personajeActivo.id === personajeAEliminar) {
      this.personajeActivo = null;
      Presentador.mensaje('⚠️ El personaje activo fue eliminado.', 'warn');
    }
  
    Presentador.mensaje('🗑️ Personaje eliminado con éxito.', 'ok');
  }
  

  async verPersonajes() {
    const jugadores = await this.gestorJugadores.listarJugadores();
    if (jugadores.length === 0) {
      return Presentador.mensaje('⚠️ No hay personajes creados aún.', 'warn');
    }

    const { seleccionado } = await inquirer.prompt([
      {
        type: 'list',
        name: 'seleccionado',
        message: 'Elige un personaje:',
        choices: jugadores.map(j => ({
          name: `${j.nombre} — ${j.rol} (Nivel ${j.nivel})`,
          value: j.id,
        })),
      },
    ]);
    const personaje = await this.gestorJugadores.obtenerJugadorPorId(seleccionado);
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
      return Presentador.mensaje('⚠️ No has seleccionado un personaje activo.', 'warn');
    }
    Presentador.mensaje(`⚔️ Preparando batalla con ${this.personajeActivo.nombre}...`, 'info');
    // Aquí conectarás la clase Batalla más adelante
  }
}

export default GestorJuego
