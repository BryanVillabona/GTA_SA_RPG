class Item {
  constructor({ nombre, tipo = 'generico', descripcion = '', valor = 0, cantidad = 1 }) {
    if (new.target === Item) throw new Error("No se puede instanciar la clase abstracta Item.");
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
  usar(objetivo) {
    throw new Error("El método usar() debe ser implementado en la subclase.");
  }
}

class Arma extends Item {
  usar(objetivo) {
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    
    const danoReal = objetivo.recibirDaño(this.valor);
    this.cantidad--;
    
    return { ok: true, mensaje: `${objetivo.nombre} recibe ${danoReal} de daño con ${this.nombre}!` };
  }
}

class Curacion extends Item {
    usar(objetivo) {
        if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
        
        // --- FIX: Comprobación para no curar si la vida está al máximo ---
        if (objetivo.vida >= objetivo.vidaMaxima) {
            return { ok: false, mensaje: `${objetivo.nombre} ya tiene la vida al máximo. El objeto no se ha consumido.` };
        }

        const vidaOriginal = objetivo.vida;
        objetivo.vida = Math.min(objetivo.vidaMaxima, objetivo.vida + this.valor);
        const vidaRecuperada = objetivo.vida - vidaOriginal;
        this.cantidad--;
    
        return { ok: true, mensaje: `${objetivo.nombre} recupera ${Math.round(vidaRecuperada)} puntos de vida con ${this.nombre}.` };
    }
}

class Armadura extends Item {
  // --- CAMBIO CLAVE: Aplica un efecto temporal en lugar de un buff permanente ---
  usar(objetivo) {
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    
    const defensaExtra = this.valor || 10;
    const duracion = 2; // Dura 2 turnos (el del enemigo y el tuyo)

    // Aplicamos el efecto al estado del personaje
    objetivo.aplicarEfecto('defensaAumentada', { valor: defensaExtra, duracion });
    this.cantidad--; 

    return { ok: true, mensaje: `${objetivo.nombre} usa ${this.nombre} y aumenta su defensa temporalmente.` };
  }
}

const CLASES_ITEMS = {
  arma: Arma,
  cura: Curacion,
  armadura: Armadura,
};

module.exports = { Item, Arma, Curacion, Armadura, CLASES_ITEMS };
