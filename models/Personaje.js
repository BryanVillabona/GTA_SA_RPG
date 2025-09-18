// src/models/Personaje.js
const config = require('../Config');

class Personaje {
  constructor({ id = null, rol, nombre, vida = 100, ataque = 10, defensa = 5, nivel = 1, habilidadEspecial = {}, inventario = [], experiencia = 0 }) {
    if (new.target === Personaje && rol) {
      throw new Error("No se puede instanciar la clase abstracta 'Personaje' con un rol; utiliza una subclase como Medico, Ganster, etc.");
    }

    if (typeof nombre !== "string" || nombre.length === 0) throw new Error("Error en nombre");

    this.id = id ?? Date.now().toString();
    this.rol = rol;
    this.nombre = nombre;
    this.vida = Number(vida);
    this.vidaMaxima = Number(vida); // Importante para curaciones y subidas de nivel
    this.ataque = Number(ataque);
    this.defensa = Number(defensa);
    this.nivel = Number(nivel);
    this.habilidadEspecial = habilidadEspecial || {};
    this.inventario = inventario || [];
    this.estado = {};
    this.experiencia = experiencia || 0;
  }

  atacar(objetivo, notificador = null) {
    const dano = this.ataque;
    const danoReal = objetivo.recibirDaño(dano);
    if (notificador) notificador.mostrarAccion(`${this.nombre} ataca a ${objetivo.nombre} y hace ${danoReal} de daño`);
    return danoReal;
  }

  recibirDaño(dano) {
    const multiplicadorDefensa = this.estado.defensaMultiplicador ?? 1;
    const defensaActual = (this.defensa || 0) * multiplicadorDefensa;
    const danoReal = Math.max(0, dano - defensaActual);
    this.vida = Math.max(0, this.vida - danoReal);
    return danoReal;
  }

  usarHabilidad(objetivo, notificador = null) {
    // Simulación genérica para enemigos
    if(notificador) notificador.mostrarAccion(`${this.nombre} usa ${this.habilidadEspecial.nombre || 'una habilidad'}.`);
    this.atacar(objetivo, notificador);
  }

  subirNivel() {
    this.nivel += 1;
    this.vidaMaxima += config.NIVELES.VIDA_MAX_POR_NIVEL;
    this.vida = this.vidaMaxima; // Restaura la vida completamente
    this.ataque += config.NIVELES.ATAQUE_POR_NIVEL;
    this.defensa += config.NIVELES.DEFENSA_POR_NIVEL;
    return this.nivel;
  }
}

module.exports = Personaje;
