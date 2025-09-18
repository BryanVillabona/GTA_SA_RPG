// Clase Abstracta Item
class Item {

  // Se constuyen los atributos con valores predeterminados: Establece las propiedades comunes a todos los ítems: nombre, tipo, descripcion, valor y cantidad.
  constructor({ nombre, tipo = 'generico', descripcion = '', valor = 0, cantidad = 1 }) {

    // Simulación de clase abstracta
    if (new.target === Item) throw new Error("No se puede instanciar la clase abstracta Item.");

    // Definición de atributos 
    this.nombre = nombre;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.valor = valor;
    this.cantidad = cantidad;
  }

  /**
   * @param {Personaje} objetivo El personaje que recibe el efecto del objeto.
   * @returns {{ok: boolean, mensaje: string}} Un objeto con el resultado de la acción.
   */

  // 

  // Método abstracto para ser implementado en las subclases posteriores
  usar(objetivo) {
    throw new Error("El método usar() debe ser implementado en la subclase.");
  }
}

// Subclase Arma de Item
class Arma extends Item {

  // Método para usar el item 
  usar(objetivo) {

    // Verificación para saber si hay items disponibles
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    
    // Se llama al metodo de Personaje "recibirDaño" para hallar el daño real que puede provocar el Item
    const danoReal = objetivo.recibirDaño(this.valor);

    // Se resta la cantidad de Items
    this.cantidad--;
    
    // Confitmación y mensaje de daño 
    return { ok: true, mensaje: `${objetivo.nombre} recibe ${danoReal} de daño con ${this.nombre}!` };
  }
}

// Subclase Curacion de Item
class Curacion extends Item {

    // Método para usar el item
    usar(objetivo) {
        // Verificación para saber si hay items disponibles
        if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
        
        // Para evitar el desperdicio del item se verifica si el Personaje tiene su vida al maximo
        if (objetivo.vida >= objetivo.vidaMaxima) {

            // Mensaje de confirmación
            return { ok: false, mensaje: `${objetivo.nombre} ya tiene la vida al máximo. El objeto no se ha consumido.` };
        }

        // Se captura la vida
        const vidaOriginal = objetivo.vida;

        // Se establece que la vida no pase de su vida maxima determinada y se agrega a la vida el valor del Item curativo
        objetivo.vida = Math.min(objetivo.vidaMaxima, objetivo.vida + this.valor);

        // Se calcula cuanta vida recuperó el personaje 
        const vidaRecuperada = objetivo.vida - vidaOriginal;

        // Se resta el item 
        this.cantidad--;
        
        // Mensjae de confirmación sobre la curación
        return { ok: true, mensaje: `${objetivo.nombre} recupera ${Math.round(vidaRecuperada)} puntos de vida con ${this.nombre}.` };
    }
}

// Subclase Armadura de Item
class Armadura extends Item {

  // Método para usar el Item
  usar(objetivo) {

    // Verificación para saber si hay items disponibles
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    
    // Si no esta definida la armadura el valor por defecto será 10
    const defensaExtra = this.valor || 10;

    // Item puede ser usado durante dos turnos
    const duracion = 2; 

    // Se llama el método aplicarEfecto 
    objetivo.aplicarEfecto('defensaAumentada', { valor: defensaExtra, duracion });

    // Se resta el item de su cantidad
    this.cantidad--; 

    // Mensaje de confirmación sobre la curación
    return { ok: true, mensaje: `${objetivo.nombre} usa ${this.nombre} y aumenta su defensa temporalmente.` };
  }
}

// Se crea un mapa con las subclases de Items con el proposito de facilitar la creación de los Items en los jugadores
const CLASES_ITEMS = {
  arma: Arma,
  cura: Curacion,
  armadura: Armadura,
};

// Exportación de las subclases y el mapa
module.exports = { Item, Arma, Curacion, Armadura, CLASES_ITEMS };
