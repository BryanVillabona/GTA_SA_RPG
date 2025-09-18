const Personaje = require('./Personaje');

class Medico extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Medico' });
  }

  usarHabilidad(objetivo = this, notificador = null) {
    if (objetivo.vida >= objetivo.vidaMaxima) {
      if (notificador) {
        notificador.mostrarAccion(`${objetivo.nombre} ya tiene la vida al máximo.`);
      }
      return { tipo: 'curar', valor: 0, objetivo: objetivo.nombre };
    }
    
    const cura = (this.habilidadEspecial && this.habilidadEspecial.valor) ? this.habilidadEspecial.valor : 30;
    objetivo.vida = Math.min(objetivo.vidaMaxima, objetivo.vida + cura);

    if (notificador) {
      notificador.mostrarAccion(`${this.nombre} usa Curar: ${objetivo.nombre} recupera ${cura} puntos de vida.`);
    }
    return { tipo: 'curar', valor: cura, objetivo: objetivo.nombre };
  }
}

class Ganster extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Ganster' });
  }

  usarHabilidad(objetivo, notificador = null) {
    if (!objetivo) throw new Error('Ganster.usarHabilidad: objetivo inválido.');
    
    if (notificador) {
      notificador.mostrarAccion(`${this.nombre} usa Disparo Doble contra ${objetivo.nombre}.`);
    }

    const d1 = this.atacar(objetivo, notificador);
    
    let d2 = 0;
    if (objetivo.vida > 0) {
      d2 = this.atacar(objetivo, notificador);
    } else {
        if(notificador) notificador.mostrarAccion(`${objetivo.nombre} ya ha sido derrotado.`);
    }

    return { tipo: 'ataque_doble', total: d1 + d2, detalles: [d1, d2], objetivo: objetivo.nombre };
  }
}

class Narco extends Personaje {

  constructor(opts = {}) {
    super({ ...opts, rol: 'Narco' });
  }
  usarHabilidad(objetivo, notificador = null) {
    if (!objetivo) throw new Error('Narco.usarHabilidad: objetivo requerido.');
    const dañoPorTurno = this.habilidadEspecial?.dañoPorTurno || 8;
    const duracion = this.habilidadEspecial?.duracion || 3;

    objetivo.aplicarEfecto('quemadura', { dañoPorTurno, duracion });

    if (notificador) {
      notificador.mostrarAccion(`${this.nombre} lanza Explosivo: aplica quemadura a ${objetivo.nombre}.`);
    }
    return { tipo: 'quemadura', dañoPorTurno, duracion, objetivo: objetivo.nombre };
  }
}

class Militar extends Personaje {
  constructor(opts = {}) {
    super({ ...opts, rol: 'Militar' });
  }

  usarHabilidad(_objetivo = null, notificador = null) {
    const duracion = this.habilidadEspecial?.duracion || 2;
    const multiplicador = this.habilidadEspecial?.multiplicador || 1.5;

    this.aplicarEfecto('defensaReforzada', { multiplicador, duracion });

    if (notificador) {
      notificador.mostrarAccion(`${this.nombre} activa Defensa Extra: defensa x${multiplicador} por ${duracion - 1} turno(s).`);
    }
    return { tipo: 'defensa_extra', multiplicador, duracion, objetivo: this.nombre };
  }
}

module.exports = { Medico, Ganster, Narco, Militar };