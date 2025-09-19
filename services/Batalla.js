// Importaciones necesarias
const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const Personaje = require('../models/Personaje');
const config = require('../config');
const { CLASES_ITEMS } = require('../models/Inventario');
const arte = require('../utils/arte');

// Clase principal de Batalla
class Batalla {
  constructor({ notificador, gestorJugadores }) {
    this.notificador = notificador;
    this.gestorJugadores = gestorJugadores;
    this.enemigosData = [];
    this.objetosData = [];
  }

  // Carga los datos de enemigos y objetos desde archivos JSON
  async _cargarDatos() {

    // Si no están cargados los datos, se recargan desde los archivos
    if (this.enemigosData.length === 0) {

      // Ruta del archivo JSON enemigos
      const enemigosPath = path.join(__dirname, '..', 'data', 'enemigos.json');

      // Conversión del archivo JSON a objeto
      this.enemigosData = JSON.parse(await fs.readFile(enemigosPath, 'utf8'));
    }

    // Si no están cargados los items, se recargan desde los archivos  
    if (this.objetosData.length === 0) {

      // Ruta del archivo JSON objetos
      const objetosPath = path.join(__dirname, '..', 'data', 'objetos.json');

      // Conversión del archivo JSON a objeto
      this.objetosData = JSON.parse(await fs.readFile(objetosPath, 'utf8'));
    }
  }

  // Método para seleccionar un enemigo aleatorio
  _seleccionarEnemigo(esJefe = false) {

    // Se filtran los enemigos según si es jefe o no, y se selecciona uno al azar
    const posiblesEnemigos = this.enemigosData.filter(e => (e.esJefe || false) === esJefe);

    // Selección aleatoria del enemigo 
    const enemigoSeleccionado = posiblesEnemigos[Math.floor(Math.random() * posiblesEnemigos.length)];

    // Se retorna una nueva instancia de Personaje con los datos del enemigo seleccionado
    return new Personaje(enemigoSeleccionado);
  }

  // Método principal para iniciar la batalla con el jugador
  async iniciarConJugador(jugador) {

    // Se carga toda la daata necesaria
    await this._cargarDatos();

    // Validaciones iniciales
    for (let ronda = 1; ronda <= config.JUEGO.RONDAS_POR_BATALLA; ronda++) {

      // Determina si es la ronda final
      const esRondaFinal = ronda === config.JUEGO.RONDAS_POR_BATALLA;

      // Selección del enemigo
      const enemigo = this._seleccionarEnemigo(esRondaFinal);

      // Variable para rastrear si la habilidad ya fue usada en esta ronda
      let habilidadUsadaEnRonda = false;

      // Mensaje de inicio de rondam y arte ASCIIh
      this.notificador.mensaje(`\n--- RONDA ${ronda} ---`, 'title');
      
      // Arte ASCII del jugador y enemigo
      const arteJugador = arte[jugador.rol] || arte.default;
      const arteEnemigo = arte[enemigo.nombre] || arte.default;

      // Impresión del enfrentamiento
      console.log(arteJugador);
      this.notificador.mostrarAccion(`           VS`);
      console.log(arteEnemigo);
      
      // Mensaje de inicio de la batalla
      this.notificador.mostrarAccion(`${jugador.nombre} se enfrenta a ${enemigo.nombre}!`);

      // Creación de las barras de vida
      this.notificador.crearBarras(jugador, enemigo);

      // Bucle principal de la batalla
      const resultadoRonda = await this._bucleDeBatalla(jugador, enemigo, habilidadUsadaEnRonda);
      this.notificador.detenerBarras();

      // Si la ronda termina en derrota, se elimina el jugador y se finaliza el juego
      if (resultadoRonda === 'derrota') {

        // Mensaje de derrota y eliminación del jugador
        this.notificador.mensaje(`\n☠️ ${jugador.nombre} ha sido derrotado.`, 'error');

        // Eliminación del jugador del sistema
        await this.gestorJugadores.eliminarJugadorPorId(jugador.id);

        // Notificación de muerte permanente
        this.notificador.mensaje('El personaje ha sido eliminado (muerte permanente).', 'warn');

        // Estado final de la partida
        return 'lose';
      }

      // Si la ronda termina en victoria, se procesan las recompensas
      this.notificador.mensaje(`\n🎉 Has derrotado a ${enemigo.nombre}!`, 'ok');
      await this._procesarRecompensas(jugador, enemigo);

      // Si es la ronda final y el jugador ha ganado, se felicita y se actualiza el jugador
      if (esRondaFinal) {
        this.notificador.mensaje(`\n🏆 ¡FELICIDADES! Has sobrevivido a todas las rondas.`, 'title');
        await this.gestorJugadores.actualizarJugador(jugador);
        return 'win';
      }
      
      // Mensaje de preparación para la siguiente ronda
      this.notificador.mensaje('...preparándose para la siguiente ronda...', 'info');
    }
  }

  // Bucle principal de la batalla
  async _bucleDeBatalla(jugador, enemigo, habilidadUsadaEnRonda) {

    // Mientras ambos personajes tengan vida, se alternan los turnos
    while (jugador.vida > 0 && enemigo.vida > 0) {

      // Turno del jugador
      const resultadoTurno = await this._turnoJugador(jugador, enemigo, habilidadUsadaEnRonda);

      // Actualización de si la habilidad fue usada en esta ronda
      habilidadUsadaEnRonda = resultadoTurno.habilidadUsada;

      // Actualización de las barras de vida
      this.notificador.actualizarBarras(jugador, enemigo);

      // Finalización de turno y verificación de vida
      jugador.finalizarTurno(this.notificador); 

      // Si el enemigo ha sido derrotado, se sale del bucle
      if (enemigo.vida <= 0) break;

      // Turno del enemigo
      this._turnoEnemigo(jugador, enemigo);

      // Actualización de las barras de vida y finalización de turno
      this.notificador.actualizarBarras(jugador, enemigo);
      enemigo.finalizarTurno(this.notificador);

      // Si el jugador ha sido derrotado, se sale del bucle
      if (jugador.vida <= 0) break;
    }

    // Se retorna el resultado de la ronda
    return jugador.vida > 0 ? 'victoria' : 'derrota';
  }

  // Método para el turno del jugador
  async _turnoJugador(jugador, enemigo, habilidadUsadaEnRonda) {

    // Opciones disponibles para el jugador
    const choices = [{ name: 'Atacar', value: 'atacar' }];

    if (!habilidadUsadaEnRonda) {
      choices.push({ name: 'Usar Habilidad', value: 'habilidad' });
    }
    if (jugador.inventario && jugador.inventario.length > 0) {
      choices.push({ name: 'Usar Objeto', value: 'objeto' });
    }

    const { accion } = await inquirer.prompt({
      type: 'list', name: 'accion', message: '¿Qué harás?', choices,
    });

    // Se maneja la acción seleccionada
    let habilidadAhoraUsada = habilidadUsadaEnRonda;
    if (accion === 'atacar') {
      jugador.atacar(enemigo, this.notificador);
    } else if (accion === 'habilidad') {
      jugador.usarHabilidad(enemigo, this.notificador);
      habilidadAhoraUsada = true;
    } else if (accion === 'objeto') {
      await this._manejarUsoObjeto(jugador, enemigo);
    }

    return { habilidadUsada: habilidadAhoraUsada };
  }

  // Método para manejar el uso de un objeto
  async _manejarUsoObjeto(jugador, enemigo) {

    // Se captura el index del objeto a usar
    const { itemIndex } = await inquirer.prompt({
      type: 'list',
      name: 'itemIndex',
      message: 'Elige un objeto para usar:',
      choices: jugador.inventario.map((item, index) => ({
        name: `${item.nombre} (x${item.cantidad}) - ${item.descripcion}`,
        value: index,
      })),
    });

    // Se escoge el item seleccionado y su objetivo
    const item = jugador.inventario[itemIndex];
    const objetivo = item.tipo === 'cura' || item.tipo === 'armadura' ? jugador : enemigo;

    // Impresión del uso del objeto
    const resultado = item.usar(objetivo);
    this.notificador.mostrarAccion(resultado.mensaje);

    // Se remueve el item del inventario(Array) si es igual a 0
    if (item.cantidad <= 0) {
      jugador.inventario.splice(itemIndex, 1);
    }
  }

  // Método para el turno del enemigo
  _turnoEnemigo(jugador, enemigo) {

    // Lógica simple para que el enemigo decida su acción
    const rand = Math.random();

    // Se desectructura la configuración para obtener las probabilidades
    const { PROBABILIDAD_ATAQUE, PROBABILIDAD_HABILIDAD } = config.IA_ENEMIGO;

    // Decisión basada en probabilidades
    if (rand < PROBABILIDAD_ATAQUE) {
      enemigo.atacar(jugador, this.notificador);
    } else if (rand < PROBABILIDAD_ATAQUE + PROBABILIDAD_HABILIDAD) {
      enemigo.usarHabilidad(jugador, this.notificador);
    } else if (enemigo.inventario && enemigo.inventario.length > 0) {
      const itemData = enemigo.inventario[0];
      const ClaseItem = CLASES_ITEMS[itemData.tipo];
      if (ClaseItem) {
        const item = new ClaseItem(itemData);
        const resultado = item.usar(enemigo);
        this.notificador.mostrarAccion(resultado.mensaje);
        enemigo.inventario.shift();
      } else {
        enemigo.atacar(jugador, this.notificador);
      }
    } else {
      enemigo.atacar(jugador, this.notificador);
    }
  }

  // Calculo de recompensas tras la victoria
  async _procesarRecompensas(jugador, enemigo) {

    // Cálculo de experiencia ganada
    const xpGanada = config.NIVELES.XP_BASE_POR_VICTORIA + (enemigo.nivel || 1) * config.NIVELES.XP_MULTIPLICADOR_POR_NIVEL_ENEMIGO;

    // Se asigna la experiencia ganada al jugador
    jugador.experiencia += xpGanada;
    this.notificador.mensaje(`Ganas ${xpGanada} XP. (Total: ${jugador.experiencia})`, 'ok');

    // Verificación de subida de nivel
    while (jugador.experiencia >= config.NIVELES.XP_PARA_SUBIR_NIVEL) {

      // Se llama al método subirNivel del jugador
      jugador.subirNivel();

      // Se resta la experiencia necesaria para subir de nivel
      jugador.experiencia -= config.NIVELES.XP_PARA_SUBIR_NIVEL;
      this.notificador.mensaje(`¡${jugador.nombre} ha subido al nivel ${jugador.nivel}!`, 'title');
    }

    // Selección aleatoria de un item como recompensa
    const objetosAleatorios = [...this.objetosData].sort(() => 0.5 - Math.random()).slice(0, 4);

    // Se pide al jugador que elija un objeto
    const { objetoElegido } = await inquirer.prompt({
      type: 'list', name: 'objetoElegido', message: 'Has encontrado un objeto. Elige tu recompensa:',
      choices: objetosAleatorios.map(obj => ({ name: `${obj.nombre} - ${obj.descripcion}`, value: obj }))
    });

    // Se añade el objeto elegido al inventario del jugador
    const ClaseItem = CLASES_ITEMS[objetoElegido.tipo];

    // Si la clase del item existe, se añade al inventario
    if (ClaseItem) {
      jugador.inventario.push(new ClaseItem(objetoElegido));

      // Imprime mensaje de confirmación
      this.notificador.mensaje(`${objetoElegido.nombre} ha sido añadido a tu inventario.`, 'ok');
    }

    // Se actualiza el jugador en los JSON
    await this.gestorJugadores.actualizarJugador(jugador);
    this.notificador.mensaje('Progreso guardado.', 'info');
  }
}

module.exports = Batalla;