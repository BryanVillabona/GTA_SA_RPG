// services/GestorJugadores.js
const fs = require('fs').promises;
const path = require('path');
const { Medico, Ganster, Narco, Militar } = require('../models/Roles');

// path por defecto (puedes inyectarlo si quieres)
const DEFAULT_PATH = path.join(__dirname, '..', 'data', 'jugadores.json');
const ROLES_PATH = path.join(__dirname, '..', 'data', 'personajes.json');

class GestorJugadores {
  constructor({ jugadoresPath = DEFAULT_PATH, rolesPath = ROLES_PATH } = {}) {
    this.jugadoresPath = jugadoresPath;
    this.rolesPath = rolesPath;
    // mapping rol string -> clase
    this.clases = {
      Medico,
      Ganster,
      Narco,
      Militar
    };
  }

  async _leerArchivo(pathArchivo) {
    try {
      const txt = await fs.readFile(pathArchivo, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      // si no existe, retornamos arreglo vacío
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async _escribirArchivo(pathArchivo, datos) {
    const txt = JSON.stringify(datos, null, 2);
    await fs.writeFile(pathArchivo, txt, 'utf8');
    return true;
  }

  async listarRoles() {
    const roles = await this._leerArchivo(this.rolesPath);
    // roles es array de objetos con campo "rol" etc.
    return roles;
  }

  async listarJugadores() {
    const players = await this._leerArchivo(this.jugadoresPath);
    return players;
  }

  async guardarJugadores(jugadores) {
    await this._escribirArchivo(this.jugadoresPath, jugadores);
  }

  // crea y persiste un jugador nuevo basándose en el rol seleccionado
  async crearJugador({ nombre, rol }) {
    if (!nombre || !rol) throw new Error('nombre y rol son requeridos');

    // leer roles base
    const roles = await this.listarRoles();
    const plantilla = roles.find(r => r.rol.toLowerCase() === String(rol).toLowerCase());
    if (!plantilla) throw new Error(`Rol "${rol}" no encontrado en ${this.rolesPath}`);

    // decidir clase a instanciar
    const Clase = this.clases[plantilla.rol];
    const id = Date.now().toString();

    let instancia;
    if (Clase) {
      // pasamos los atributos base + nombre + id
      const opts = {
        id,
        rol: plantilla.rol,
        nombre,
        vida: plantilla.vida,
        ataque: plantilla.ataque,
        defensa: plantilla.defensa,
        nivel: 1,
        habilidadEspecial: plantilla.habilidadEspecial,
        inventario: plantilla.inventario || []
      };
      instancia = new Clase(opts);
    } else {
      // si no existe mapeo de clase (por ejemplo rol nuevo), guardamos como objeto sencillo
      instancia = {
        id,
        nombre,
        rol: plantilla.rol,
        vida: plantilla.vida,
        ataque: plantilla.ataque,
        defensa: plantilla.defensa,
        nivel: 1,
        habilidadEspecial: plantilla.habilidadEspecial,
        inventario: plantilla.inventario || []
      };
    }

    // persistir: leer jugadores, push y escribir
    const jugadores = await this.listarJugadores();
    jugadores.push(instancia);
    await this.guardarJugadores(jugadores);

    return instancia;
  }

  async obtenerJugadorPorId(id) {
    const jugadores = await this.listarJugadores();
    return jugadores.find(j => String(j.id) === String(id));
  }
}

module.exports = GestorJugadores;
