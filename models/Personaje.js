// Se importa la configuración 
const config = require('../config');

// Clase abstracta Personaje
class Personaje {

  // Se constuyen los atributos con valores predeterminados: Establece las propiedades comunes a todos los ítems: nombre, tipo, descripcion, valor y cantidad.
  constructor({ id = null, rol, nombre, vida = 100, ataque = 10, defensa = 5, nivel = 1, habilidadEspecial = {}, inventario = [], experiencia = 0 }) {
    
    // Simulación de clase abstracta
    if (new.target === Personaje && rol) {
      throw new Error("No se puede instanciar la clase abstracta 'Personaje' con un rol; utiliza una subclase como Medico, Ganster, etc.");
    }
    if (typeof nombre !== "string" || nombre.length === 0) throw new Error("Error en nombre");

    // Definición de atributos
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

  // Método para atacar por defecto
  atacar(objetivo, notificador = null) {

    // Se captura el daño
    const dano = this.ataque;

    // Se obtiene el daño real (debido a que la armadura puede reducir el daño por ataque)
    const danoReal = objetivo.recibirDaño(dano);

    // Para evitar dependencias se llama el notificador encargado de realizar las impresiones
    if (notificador) notificador.mostrarAccion(`${this.nombre} ataca a ${objetivo.nombre} y hace ${Math.round(danoReal)} de daño.`);
    return danoReal;
  }

  // Método para recibir el daño por parte del enemigo
  recibirDaño(dano) {

    // Se captura la defensa
    let defensaTotal = this.defensa;
    let multiplicadorDefensa = 1;

    // Se verifica si hay un efecto de "defensaAumentada"
    if (this.estado.defensaAumentada) {

      // Si es así, se suma el valor de defensa con la defensa adicional
      defensaTotal += this.estado.defensaAumentada.valor;
    }

    // Se verifica si hay un efecto de "defensaReforzada"
    if (this.estado.defensaReforzada) {

      // Si es así, se obtiene el valor de esa defensa reforzada
      multiplicadorDefensa = this.estado.defensaReforzada.multiplicador;
    }

    // Se calcula la defensa final del jugador
    const defensaFinal = defensaTotal * multiplicadorDefensa;

    // Se obtiene el porcentaje de reduccion de daño
    const reduccion = 100 / (100 + defensaFinal);

    // danoReal tomando en cuenta armadura
    const danoReal = Math.round(Math.max(1, dano * reduccion));

    // Se evita que la vida baje por menos de 0
    this.vida = Math.max(0, this.vida - danoReal);
    return danoReal;
  }
  
  // Método para aplicar el efecto al estado 
  aplicarEfecto(nombreEfecto, valor) {
    this.estado[nombreEfecto] = valor;
  }

  
  finalizarTurno(notificador = null) {
    for (const efecto in this.estado) {
      if (!this.estado[efecto]) continue;

      if (efecto === 'quemadura' && this.estado.quemadura.dañoPorTurno > 0) {
        const danoQuemadura = this.estado.quemadura.dañoPorTurno;
        this.vida = Math.max(0, this.vida - danoQuemadura);
        if (notificador) {
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