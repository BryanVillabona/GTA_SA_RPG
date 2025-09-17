// Roles.js
// CommonJS - subclases de Personaje
import Personaje from './Personaje.js';

/**
 * Cada subclase:
 * - llama a super({...opts, rol: 'NombreRol'})
 * - implementa usarHabilidad(objetivo, notificador)
 * - devuelve un objeto con info sobre la acción (útil para pruebas / tests)
 */

class Medico extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Medico' });
  }

  // Cura al objetivo (si no se pasa objetivo, se cura a sí mismo)
  usarHabilidad(objetivo = this, notificador = null) {
    const cura = (this.habilidadEspecial && this.habilidadEspecial.valor) ? this.habilidadEspecial.valor : 30;
    objetivo.vida = (typeof objetivo.vida === 'number') ? objetivo.vida + cura : cura;

    if (notificador && typeof notificador.mostrarAccion === 'function') {
      notificador.mostrarAccion(`${this.nombre} usa Curar: ${objetivo.nombre} recupera ${cura} puntos de vida.`);
      if (typeof notificador.mostrarVida === 'function') notificador.mostrarVida(objetivo);
    }

    return { tipo: 'curar', valor: cura, objetivo: objetivo.nombre };
  }
}

class Ganster extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Ganster' });
  }

  // Disparo doble: ataca dos veces al mismo objetivo
  usarHabilidad(objetivo, notificador = null) {
    if (!objetivo || typeof objetivo.recibirDaño !== 'function') {
      throw new Error('Ganster.usarHabilidad: objetivo inválido. Debe tener recibirDaño(dano).');
    }

    const d1 = objetivo.recibirDaño(this.ataque);
    const d2 = objetivo.recibirDaño(this.ataque);

    if (notificador && typeof notificador.mostrarAccion === 'function') {
      notificador.mostrarAccion(`${this.nombre} usa Disparo Doble contra ${objetivo.nombre}: ${d1} + ${d2} daño.`);
      if (typeof notificador.mostrarVida === 'function') notificador.mostrarVida(objetivo);
    }

    return { tipo: 'ataque_doble', total: d1 + d2, detalles: [d1, d2], objetivo: objetivo.nombre };
  }
}

class Narco extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Narco' });
  }

  // Aplica estado "quemadura" que hace daño por turno
  usarHabilidad(objetivo, notificador = null) {
    if (!objetivo) throw new Error('Narco.usarHabilidad: objetivo requerido.');
    const dañoPorTurno = (this.habilidadEspecial && this.habilidadEspecial.dañoPorTurno) ? this.habilidadEspecial.dañoPorTurno : 8;
    const duracion = (this.habilidadEspecial && this.habilidadEspecial.duracion) ? this.habilidadEspecial.duracion : 3;

    objetivo.estado = objetivo.estado || {};
    objetivo.estado.quemadura = { dañoPorTurno, duracion };

    if (notificador && typeof notificador.mostrarAccion === 'function') {
      notificador.mostrarAccion(`${this.nombre} lanza Explosivo: aplica quemadura (${dañoPorTurno} x ${duracion} turnos) a ${objetivo.nombre}.`);
      if (typeof notificador.mostrarVida === 'function') notificador.mostrarVida(objetivo);
    }

    return { tipo: 'quemadura', dañoPorTurno, duracion, objetivo: objetivo.nombre };
  }
}

class Militar extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Militar' });
  }

  // Aumenta la defensa por X turnos (usa estado.defensaMultiplicador y estado.defensaDuracion)
  usarHabilidad(_objetivo = null, notificador = null) {
    this.estado = this.estado || {};
    const duracion = (this.habilidadEspecial && this.habilidadEspecial.duracion) ? this.habilidadEspecial.duracion : 1;
    const multiplicador = (this.habilidadEspecial && this.habilidadEspecial.multiplicador) ? this.habilidadEspecial.multiplicador : 1.5;

    // Si ya tenía duración, la acumulamos (útil en pruebas); también puedes sobrescribir según reglas
    this.estado.defensaMultiplicador = multiplicador;
    this.estado.defensaDuracion = (this.estado.defensaDuracion || 0) + duracion;

    if (notificador && typeof notificador.mostrarAccion === 'function') {
      notificador.mostrarAccion(`${this.nombre} activa Defensa Extra: defensa x${multiplicador} por ${duracion} turno(s).`);
      if (typeof notificador.mostrarVida === 'function') notificador.mostrarVida(this);
    }

    return { tipo: 'defensa_extra', multiplicador, duracion, objetivo: this.nombre };
  }
}

export { Medico, Ganster, Narco, Militar };
