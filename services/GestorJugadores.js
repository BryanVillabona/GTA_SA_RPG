// Importaciones 
const fs = require('fs').promises;
const path = require('path');
const { Medico, Ganster, Narco, Militar } = require('../models/Roles');
const { CLASES_ITEMS } = require('../models/Inventario');

const ROLES_PATH = path.join(__dirname, '..', 'data', 'personajes.json');
const CLASES_ROLES = { Medico, Ganster, Narco, Militar };

// Clase GestorJugadores: Maneja la lógica relacionada con los personajes (jugadores).
class GestorJugadores {
  constructor({ jugadorRepository }) {
    this.repositorio = jugadorRepository;
    this.rolesData = null;
  }

  // Método privado para cargar los roles desde el archivo JSON
  async _cargarRoles() {

    // Si ya se cargaron, se retornan
    if (!this.rolesData) {
      const txt = await fs.readFile(ROLES_PATH, 'utf8');
      this.rolesData = JSON.parse(txt);
    }
    return this.rolesData;
  }

  // Método privado para hidratar un jugador desde datos planos
  _hidratar(jugadorData) {

    // Se obtiene la clase correspondiente al rol
    const ClasePersonaje = CLASES_ROLES[jugadorData.rol];

    // Si no existe la clase, se lanza un error
    if (!ClasePersonaje) throw new Error(`Clase para el rol ${jugadorData.rol} no encontrada.`);

    // Se hidrata el inventario
    const inventarioHidratado = (jugadorData.inventario || []).map(itemData => {
        const ClaseItem = CLASES_ITEMS[itemData.tipo];
        return ClaseItem ? new ClaseItem(itemData) : null;
    }).filter(Boolean);

    // Se crea y retorna la instancia del personaje
    return new ClasePersonaje({ ...jugadorData, inventario: inventarioHidratado });
  }

  // Método para listar los roles disponibles
  async listarRoles() {
    // Se cargan y retornan los roles
    return this._cargarRoles();
  }

  // Método para listar todos los jugadores
  async listarJugadores() {

    // Se obtienen los datos y se hidratan
    const jugadoresData = await this.repositorio.obtenerTodos();
    return jugadoresData.map(data => this._hidratar(data));
  }

  // Método para crear un nuevo jugador
  async crearJugador({ nombre, rol }) {

    // Validaciones básicas 
    if (!nombre || !rol) throw new Error('Nombre y rol son requeridos');
    const roles = await this.listarRoles();

    // Se busca la plantilla del rol
    const plantilla = roles.find(r => r.rol.toLowerCase() === rol.toLowerCase());
    if (!plantilla) throw new Error(`Rol "${rol}" no encontrado.`);

    // Se crea el nuevo jugador con datos iniciales
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
    
    // Se guarda el nuevo jugador
    const jugadores = await this.repositorio.obtenerTodos();
    jugadores.push(nuevoJugadorData);
    await this.repositorio.guardarTodos(jugadores);

    // Se retorna el jugador hidratado
    return this._hidratar(nuevoJugadorData);
  }

  // Método para obtener un jugador por su ID
  async obtenerJugadorPorId(id) {

    // Se obtienen los datos y se busca el jugador
    const jugadoresData = await this.repositorio.obtenerTodos();
    const jugadorData = jugadoresData.find(j => j.id === id);
    return jugadorData ? this._hidratar(jugadorData) : null;
  }

  // Método para actualizar un jugador existente
  async actualizarJugador(jugador) {

    // Se obtienen todos los jugadores y se busca el índice del jugador a actualizar
    const jugadores = await this.repositorio.obtenerTodos();
    const index = jugadores.findIndex(j => j.id === jugador.id);

    // Si no se encuentra, se lanza un error
    if (index === -1) throw new Error('Jugador no encontrado para actualizar.');
    
    // Se actualiza el jugador (asegurando que el inventario se guarde correctamente)
    const datosParaGuardar = { ...jugador, inventario: jugador.inventario.map(item => ({...item})) };
    jugadores[index] = datosParaGuardar;
    
    // Se guardan los cambios
    await this.repositorio.guardarTodos(jugadores);
  }

  // Método para eliminar un jugador por su ID
  async eliminarJugadorPorId(id) {
    let jugadores = await this.repositorio.obtenerTodos();
    jugadores = jugadores.filter(j => j.id !== id);
    await this.repositorio.guardarTodos(jugadores);
  }
}

module.exports = GestorJugadores;