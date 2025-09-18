const fs = require('fs').promises;
const path = require('path');
const { Medico, Ganster, Narco, Militar } = require('../models/Roles');
const { CLASES_ITEMS } = require('../models/Inventario');

const ROLES_PATH = path.join(__dirname, '..', 'data', 'personajes.json');
const CLASES_ROLES = { Medico, Ganster, Narco, Militar };

class GestorJugadores {
  constructor({ jugadorRepository }) {
    this.repositorio = jugadorRepository;
    this.rolesData = null;
  }

  async _cargarRoles() {
    if (!this.rolesData) {
      const txt = await fs.readFile(ROLES_PATH, 'utf8');
      this.rolesData = JSON.parse(txt);
    }
    return this.rolesData;
  }

  _hidratar(jugadorData) {
    const ClasePersonaje = CLASES_ROLES[jugadorData.rol];
    if (!ClasePersonaje) throw new Error(`Clase para el rol ${jugadorData.rol} no encontrada.`);

    const inventarioHidratado = (jugadorData.inventario || []).map(itemData => {
        const ClaseItem = CLASES_ITEMS[itemData.tipo];
        return ClaseItem ? new ClaseItem(itemData) : null;
    }).filter(Boolean);

    return new ClasePersonaje({ ...jugadorData, inventario: inventarioHidratado });
  }

  async listarRoles() {
    return this._cargarRoles();
  }

  async listarJugadores() {
    const jugadoresData = await this.repositorio.obtenerTodos();
    return jugadoresData.map(data => this._hidratar(data));
  }

  async crearJugador({ nombre, rol }) {
    if (!nombre || !rol) throw new Error('Nombre y rol son requeridos');
    const roles = await this.listarRoles();
    const plantilla = roles.find(r => r.rol.toLowerCase() === rol.toLowerCase());
    if (!plantilla) throw new Error(`Rol "${rol}" no encontrado.`);

    const nuevoJugadorData = {
      id: Date.now().toString(),
      nombre,
      rol: plantilla.rol,
      vida: plantilla.vida,
      ataque: plantilla.ataque,
      defensa: plantilla.defensa,
      nivel: 1,
      experiencia: 0,
      habilidadEspecial: plantilla.habilidadEspecial,
      inventario: plantilla.inventario || [],
    };
    
    const jugadores = await this.repositorio.obtenerTodos();
    jugadores.push(nuevoJugadorData);
    await this.repositorio.guardarTodos(jugadores);

    return this._hidratar(nuevoJugadorData);
  }

  async obtenerJugadorPorId(id) {
    const jugadoresData = await this.repositorio.obtenerTodos();
    const jugadorData = jugadoresData.find(j => j.id === id);
    return jugadorData ? this._hidratar(jugadorData) : null;
  }

  async actualizarJugador(jugador) {
    const jugadores = await this.repositorio.obtenerTodos();
    const index = jugadores.findIndex(j => j.id === jugador.id);
    if (index === -1) throw new Error('Jugador no encontrado para actualizar.');
    
    const datosParaGuardar = { ...jugador, inventario: jugador.inventario.map(item => ({...item})) };
    jugadores[index] = datosParaGuardar;
    
    await this.repositorio.guardarTodos(jugadores);
  }

  async eliminarJugadorPorId(id) {
    let jugadores = await this.repositorio.obtenerTodos();
    jugadores = jugadores.filter(j => j.id !== id);
    await this.repositorio.guardarTodos(jugadores);
  }
}

module.exports = GestorJugadores;