// src/models/Personaje.js
const config = require('../config');

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
    this.vidaMaxima = Number(vida);
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
    if (notificador) notificador.mostrarAccion(`${this.nombre} ataca a ${objetivo.nombre} y hace ${Math.round(danoReal)} de daño.`);
    return danoReal;
  }

  recibirDaño(dano) {
    let defensaTotal = this.defensa;
    let multiplicadorDefensa = 1;

    if (this.estado.defensaAumentada) {
      defensaTotal += this.estado.defensaAumentada.valor;
    }
    if (this.estado.defensaReforzada) {
      multiplicadorDefensa = this.estado.defensaReforzada.multiplicador;
    }

    const defensaFinal = defensaTotal * multiplicadorDefensa;
    const reduccion = 100 / (100 + defensaFinal);
    const danoReal = Math.round(Math.max(1, dano * reduccion));

    this.vida = Math.max(0, this.vida - danoReal);
    return danoReal;
  }
  
  aplicarEfecto(nombreEfecto, valor) {
    this.estado[nombreEfecto] = valor;
  }

  finalizarTurno(notificador = null) {
    for (const efecto in this.estado) {
      if (!this.estado[efecto]) continue;

      // --- CAMBIO CLAVE: Notificación de quemadura mejorada ---
      if (efecto === 'quemadura' && this.estado.quemadura.dañoPorTurno > 0) {
        const danoQuemadura = this.estado.quemadura.dañoPorTurno;
        this.vida = Math.max(0, this.vida - danoQuemadura);
        if (notificador) {
          // Mostramos los turnos restantes para mayor claridad
          const turnosRestantes = this.estado.quemadura.duracion - 1;
          notificador.mostrarAccion(`${this.nombre} sufre ${danoQuemadura} de daño por quemadura. (${turnosRestantes} turnos restantes)`);
        }
      }

      if (typeof this.estado[efecto].duracion === 'number') {
        this.estado[efecto].duracion--;
        if (this.estado[efecto].duracion <= 0) {
          if (notificador && efecto !== 'quemadura') notificador.mostrarAccion(`El efecto de ${efecto} ha terminado para ${this.nombre}.`);
          delete this.estado[efecto];
        }
      }
    }
  }

  usarHabilidad(objetivo, notificador = null) {
    if(notificador) notificador.mostrarAccion(`${this.nombre} usa ${this.habilidadEspecial.nombre || 'una habilidad'}.`);
    this.atacar(objetivo, notificador);
  }

  subirNivel() {
    this.nivel += 1;
    this.vidaMaxima += config.NIVELES.VIDA_MAX_POR_NIVEL;
    this.vida = this.vidaMaxima;
    this.ataque += config.NIVELES.ATAQUE_POR_NIVEL;
    this.defensa += config.NIVELES.DEFENSA_POR_NIVEL;
    return this.nivel;
  }
}

module.exports = Personaje;