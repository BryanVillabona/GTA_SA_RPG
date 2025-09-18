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

  // Método para finalizar turno
  finalizarTurno(notificador = null) {

    // Se itera sobre el valor del estado
    for (const efecto in this.estado) {

      // Si estado no exite salta la iteración
      if (!this.estado[efecto]) continue;

      // Daño por quemadura
      if (efecto === 'quemadura' && this.estado.quemadura.dañoPorTurno > 0) {

        // Se obtiene el daño por quemadura por turno
        const danoQuemadura = this.estado.quemadura.dañoPorTurno;

        // El valor minimo de vida se establece en 0
        this.vida = Math.max(0, this.vida - danoQuemadura);

        // Si notificador está presente
        if (notificador) {

          // Se actualiza por iteración el turno donde el personaje asume la quemadura
          const turnosRestantes = this.estado.quemadura.duracion - 1;

          // Notificador imprime el mensaje en cada iteración
          notificador.mostrarAccion(`${this.nombre} sufre ${danoQuemadura} de daño por quemadura. (${turnosRestantes} turnos restantes)`);
        }
      }

      // Verificación si estado es de tipo numero
      if (typeof this.estado[efecto].duracion === 'number') {

        // Se resta la duración del efecto
        this.estado[efecto].duracion--;

        // Validación para quitar el efecto del personaje afectado
        if (this.estado[efecto].duracion <= 0) {
          if (notificador && efecto !== 'quemadura') notificador.mostrarAccion(`El efecto de ${efecto} ha terminado para ${this.nombre}.`);
          delete this.estado[efecto];
        }
      }
    }
  }

  // Método para usar la habilidad
  usarHabilidad(objetivo, notificador = null) {

    // Se llama al notificador para que muestre la acción de la habilidad usada
    if(notificador) notificador.mostrarAccion(`${this.nombre} usa ${this.habilidadEspecial.nombre || 'una habilidad'}.`);

    // Se llama al método atacar
    this.atacar(objetivo, notificador);
  }

  // Método para subir de nivel
  subirNivel() {

    // El atributo nivel sube en 1
    this.nivel += 1;

    // La vida maxima aumenta según lo estipulado en el archivo config.js
    this.vidaMaxima += config.NIVELES.VIDA_MAX_POR_NIVEL;

    // Se asigna el valor de la vida maxima a la vida original
    this.vida = this.vidaMaxima;

    // Atributo de ataque sube según lo estipulado en el archivo config.js
    this.ataque += config.NIVELES.ATAQUE_POR_NIVEL;

    // Atributo de defensa sube según lo estipulado en el archivo config.js
    this.defensa += config.NIVELES.DEFENSA_POR_NIVEL;

    // Atributo nivel es reasignado
    return this.nivel;
  }
}


module.exports = Personaje;