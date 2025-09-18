const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');
const Personaje = require('../models/Personaje');
const config = require('../Config');
const { CLASES_ITEMS } = require('../models/Inventario');

class Batalla {
  constructor({ notificador, gestorJugadores }) {
    this.notificador = notificador;
    this.gestorJugadores = gestorJugadores;
    this.enemigosData = [];
    this.objetosData = [];
  }

  async _cargarDatos() {
    if (this.enemigosData.length === 0) {
      const enemigosPath = path.join(__dirname, '..', 'data', 'enemigos.json');
      this.enemigosData = JSON.parse(await fs.readFile(enemigosPath, 'utf8'));
    }
    if (this.objetosData.length === 0) {
      const objetosPath = path.join(__dirname, '..', 'data', 'objetos.json');
      this.objetosData = JSON.parse(await fs.readFile(objetosPath, 'utf8'));
    }
  }

  _seleccionarEnemigo(esJefe = false) {
    const posiblesEnemigos = this.enemigosData.filter(e => (e.esJefe || false) === esJefe);
    const enemigoSeleccionado = posiblesEnemigos[Math.floor(Math.random() * posiblesEnemigos.length)];
    return new Personaje(enemigoSeleccionado);
  }

  async iniciarConJugador(jugador) {
    await this._cargarDatos();

    for (let ronda = 1; ronda <= config.JUEGO.RONDAS_POR_BATALLA; ronda++) {
      const esRondaFinal = ronda === config.JUEGO.RONDAS_POR_BATALLA;
      const enemigo = this._seleccionarEnemigo(esRondaFinal);

      this.notificador.mensaje(`\n--- RONDA ${ronda} ---`, 'title');
      this.notificador.mostrarAccion(`${jugador.nombre} se enfrenta a ${enemigo.nombre}!`);
      
      this.notificador.crearBarras(jugador, enemigo);

      const resultadoRonda = await this._bucleDeBatalla(jugador, enemigo);
      this.notificador.detenerBarras();

      if (resultadoRonda === 'derrota') {
        this.notificador.mensaje(`\n☠️ ${jugador.nombre} ha sido derrotado.`, 'error');
        await this.gestorJugadores.eliminarJugadorPorId(jugador.id);
        this.notificador.mensaje('El personaje ha sido eliminado (muerte permanente).', 'warn');
        return 'lose';
      }

      this.notificador.mensaje(`\n🎉 Has derrotado a ${enemigo.nombre}!`, 'ok');
      await this._procesarRecompensas(jugador, enemigo);

      if (esRondaFinal) {
        this.notificador.mensaje(`\n🏆 ¡FELICIDADES! Has sobrevivido a todas las rondas.`, 'title');
        await this.gestorJugadores.actualizarJugador(jugador);
        return 'win';
      }
      
      this.notificador.mensaje('...preparándose para la siguiente ronda...', 'info');
    }
  }

  async _bucleDeBatalla(jugador, enemigo) {
    while (jugador.vida > 0 && enemigo.vida > 0) {
      await this._turnoJugador(jugador, enemigo);
      this.notificador.actualizarBarras(jugador, enemigo);
      if (enemigo.vida <= 0) break;

      this._turnoEnemigo(jugador, enemigo);
      this.notificador.actualizarBarras(jugador, enemigo);
      if (jugador.vida <= 0) break;
    }
    return jugador.vida > 0 ? 'victoria' : 'derrota';
  }

  async _turnoJugador(jugador, enemigo) {
    const choices = [{ name: 'Atacar', value: 'atacar' }, { name: 'Usar Habilidad', value: 'habilidad' }];
    if (jugador.inventario && jugador.inventario.length > 0) {
      choices.push({ name: 'Usar Objeto', value: 'objeto' });
    }

    const { accion } = await inquirer.prompt({
      type: 'list', name: 'accion', message: '¿Qué harás?', choices,
    });

    if (accion === 'atacar') {
      jugador.atacar(enemigo, this.notificador);
    } else if (accion === 'habilidad') {
      jugador.usarHabilidad(enemigo, this.notificador);
    } else if (accion === 'objeto') {
      await this._manejarUsoObjeto(jugador, enemigo);
    }
  }

  async _manejarUsoObjeto(jugador, enemigo) {
    const { itemIndex } = await inquirer.prompt({
      type: 'list',
      name: 'itemIndex',
      message: 'Elige un objeto para usar:',
      choices: jugador.inventario.map((item, index) => ({
        name: `${item.nombre} (x${item.cantidad}) - ${item.descripcion}`,
        value: index,
      })),
    });

    const item = jugador.inventario[itemIndex];
    const objetivo = item.tipo === 'cura' || item.tipo === 'armadura' ? jugador : enemigo;
    
    const resultado = item.usar(objetivo);
    this.notificador.mostrarAccion(resultado.mensaje);

    if (item.cantidad <= 0) {
      jugador.inventario.splice(itemIndex, 1);
    }
  }

  _turnoEnemigo(jugador, enemigo) {
    const rand = Math.random();
    const { PROBABILIDAD_ATAQUE, PROBABILIDAD_HABILIDAD } = config.IA_ENEMIGO;

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

  async _procesarRecompensas(jugador, enemigo) {
    const xpGanada = config.NIVELES.XP_BASE_POR_VICTORIA + (enemigo.nivel || 1) * config.NIVELES.XP_MULTIPLICADOR_POR_NIVEL_ENEMIGO;
    jugador.experiencia += xpGanada;
    this.notificador.mensaje(`Ganas ${xpGanada} XP. (Total: ${jugador.experiencia})`, 'ok');

    if (jugador.experiencia >= config.NIVELES.XP_PARA_SUBIR_NIVEL) {
      jugador.subirNivel();
      jugador.experiencia -= config.NIVELES.XP_PARA_SUBIR_NIVEL;
      this.notificador.mensaje(`¡${jugador.nombre} ha subido al nivel ${jugador.nivel}!`, 'title');
    }

    const objetosAleatorios = [...this.objetosData].sort(() => 0.5 - Math.random()).slice(0, 4);
    const { objetoElegido } = await inquirer.prompt({
      type: 'list', name: 'objetoElegido', message: 'Has encontrado un objeto. Elige tu recompensa:',
      choices: objetosAleatorios.map(obj => ({ name: `${obj.nombre} - ${obj.descripcion}`, value: obj }))
    });
    
    const ClaseItem = CLASES_ITEMS[objetoElegido.tipo];
    if (ClaseItem) {
      jugador.inventario.push(new ClaseItem(objetoElegido));
      this.notificador.mensaje(`${objetoElegido.nombre} ha sido añadido a tu inventario.`, 'ok');
    }

    await this.gestorJugadores.actualizarJugador(jugador);
    this.notificador.mensaje('Progreso guardado.', 'info');
  }
}

module.exports = Batalla;