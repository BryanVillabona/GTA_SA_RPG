// Se importa la clase Personaje
const Personaje = require('./Personaje');

// Subclase Médico
class Medico extends Personaje {

  // Al constructor se le pasa un parametro por defecto
  constructor(opts = {}) {

    // Se desempaqueta los atributos que Medico hereda de Personaje
    super({ ...opts, rol: 'Medico' });
  }

  // Método para usar la habilidad
  usarHabilidad(objetivo = this, notificador = null) {

    // Validación para evitar que el personaje se cure teniendo su vida al maximo
    if (objetivo.vida >= objetivo.vidaMaxima) {

      // El Notificador imprime el mensaje de la acción
      if (notificador) {
        notificador.mostrarAccion(`${objetivo.nombre} ya tiene la vida al máximo.`);
      }
      // Se devuelve un objeto con los detalles de la acción
      return { tipo: 'curar', valor: 0, objetivo: objetivo.nombre };
    }
    //Obtiene la cantidad a curar desde la configuración de la habilidad especial (this.habilidadEspecial.valor)
    // O usa un valor por defecto de 30
    const cura = (this.habilidadEspecial && this.habilidadEspecial.valor) ? this.habilidadEspecial.valor : 30;

    // Cura al objetivo asegurandose que no sobrepase la vida maxima
    objetivo.vida = Math.min(objetivo.vidaMaxima, objetivo.vida + cura);

    // El notificador muestra por consola el mensaje de lo que pasó
    if (notificador) {
      notificador.mostrarAccion(`${this.nombre} usa Curar: ${objetivo.nombre} recupera ${cura} puntos de vida.`);
    }

    // Se devuelve un objeto con los detalles de la acción
    return { tipo: 'curar', valor: cura, objetivo: objetivo.nombre };
  }
}

// Subclase Ganster 
class Ganster extends Personaje {

  // Al constructor se le pasa un parametro por defecto 
  constructor(opts = {}) {

    // Se desempaqueta los atributos que Ganster hereda de Personaje
    super({ ...opts, rol: 'Ganster' });
  }

  // Método para usar la habilidad
  usarHabilidad(objetivo, notificador = null) {

    // Validación si no se encuentra ningún objetivo
    if (!objetivo) throw new Error('Ganster.usarHabilidad: objetivo inválido.');
    
    // El notificador imprime la acción realizada
    if (notificador) {
      notificador.mostrarAccion(`${this.nombre} usa Disparo Doble contra ${objetivo.nombre}.`);
    }

    // se define el disparo uno
    const d1 = this.atacar(objetivo, notificador);
    
    // Se define el disparo dos
    let d2 = 0;
    if (objetivo.vida > 0) {
      d2 = this.atacar(objetivo, notificador);

      // Si el disparo uno derrota al enemigo no ejecuta el segundo disparo
    } else {
        if(notificador) notificador.mostrarAccion(`${objetivo.nombre} ya ha sido derrotado.`);
    }

    // Se devuelve un objeto con los detalles de la acción
    return { tipo: 'ataque_doble', total: d1 + d2, detalles: [d1, d2], objetivo: objetivo.nombre };
  }
}

// Subclase Narco
class Narco extends Personaje {

  // Al constructor se le pasa un parametro por defecto 
  constructor(opts = {}) {

    // Se desempaqueta los atributos que Ganster hereda de Personaje
    super({ ...opts, rol: 'Narco' });
  }

  // Método para usar la habilidad del personaje
  usarHabilidad(objetivo, notificador = null) {

    // Si no hay un objetivo se lanza un error 
    if (!objetivo) throw new Error('Narco.usarHabilidad: objetivo requerido.');

    // Se accede al valor de daño por turno (usando ?.) para establecer el daño por turno de la habilidad
    const dañoPorTurno = this.habilidadEspecial?.dañoPorTurno || 8;

    // Se accede al valor de duracion (usando ?.) para establecer la duración de la habilidad
    const duracion = this.habilidadEspecial?.duracion || 3;

    // Se aplica el efecto de quemadura pasando como parametros el dañoPorTurno y duracion
    objetivo.aplicarEfecto('quemadura', { dañoPorTurno, duracion });

    // El notificador imprime la acción realizada
    if (notificador) {

      // Se imprime la acción realizada
      notificador.mostrarAccion(`${this.nombre} lanza Explosivo: aplica quemadura a ${objetivo.nombre}.`);
    }

    // Se retorna el objeto
    return { tipo: 'quemadura', dañoPorTurno, duracion, objetivo: objetivo.nombre };
  }
}

// Sublcase Militar
class Militar extends Personaje {

  // Al constructor se le pasa un parametro por defecto
  constructor(opts = {}) {

    // Se desempaqueta los atributos que Ganster hereda de Personaje
    super({ ...opts, rol: 'Militar' });
  }

  // Método para usar la habilidad del personaje
  usarHabilidad(_objetivo = null, notificador = null) {

    // Se accede al valor de duracion (usando ?.) para establecer la duración de la habilidad
    const duracion = this.habilidadEspecial?.duracion || 2;

    // Se accede al valor de multiplicador (usando ?.) para establecer el multiplicador de la habilidad
    const multiplicador = this.habilidadEspecial?.multiplicador || 1.5;

    // Se aplica el efecto pasando como parametros 
    this.aplicarEfecto('defensaReforzada', { multiplicador, duracion });

    // El notificador imprime la acción realizada
    if (notificador) {

      // Se imprime la acción realizada
      notificador.mostrarAccion(`${this.nombre} activa Defensa Extra: defensa x${multiplicador} por ${duracion - 1} turno(s).`);
    }

    // Se retorna el objeto
    return { tipo: 'defensa_extra', multiplicador, duracion, objetivo: this.nombre };
  }
}

module.exports = { Medico, Ganster, Narco, Militar };