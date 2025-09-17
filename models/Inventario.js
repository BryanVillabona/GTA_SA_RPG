// Inventario.js
class Inventario {
  constructor(objetos = []) {
    if (!Array.isArray(objetos)) throw new Error("El inventario debe inicializarse con un array");
    this.items = objetos; // array de instancias de Item (o subclases)
  }

  agregarItem(item) {
    this.items.push(item);
    return item;
  }

  verItems() {
    return this.items.map((it, i) => ({ index: i, nombre: it.nombre, tipo: it.tipo, cantidad: it.cantidad }));
  }

  usarItem(index, objetivo, notificador = null) {
    if (index < 0 || index >= this.items.length) throw new Error("Índice inválido");
    const item = this.items[index];
    const resultado = item.usar(objetivo);
    if (item.cantidad <= 0) this.items.splice(index, 1);
    if (notificador && resultado?.mensaje) notificador.mostrarAccion(resultado.mensaje);
    return resultado;
  }

  eliminarItem(index) {
    if (index < 0 || index >= this.items.length) throw new Error("Índice inválido");
    return this.items.splice(index, 1)[0];
  }
}

class Item {
  constructor({ nombre, tipo = 'generico', descripcion = '', valor = 0, cantidad = 1, efecto = null }) {
    if (new.target === Item) throw new Error("No se puede instanciar Item directamente");
    if (!nombre) throw new Error("Item necesita nombre");
    this.nombre = nombre;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.valor = valor;
    this.cantidad = cantidad;
    this.efecto = efecto; // objeto libre para describir efectos
  }

  usar() {
    throw new Error("usar() debe implementarse en subclase");
  }
}

class Arma extends Item {
  usar(objetivo) {
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    const dano = (this.efecto?.valor) ?? this.valor;
    const danoReal = objetivo.recibirDaño(dano);
    this.cantidad--;
    return { ok: true, mensaje: `${objetivo.nombre} recibe ${danoReal} de daño con ${this.nombre}` };
  }
}

class Curacion extends Item {
  usar(objetivo) {
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    const cura = (this.efecto?.valor) ?? this.valor;
    objetivo.vida = objetivo.vida + cura;
    this.cantidad--;
    return { ok: true, mensaje: `${objetivo.nombre} recupera ${cura} con ${this.nombre}` };
  }
}

class Armadura extends Item {
  usar(objetivo) {
    if (this.cantidad <= 0) return { ok: false, mensaje: `No quedan ${this.nombre}` };
    const defensa = (this.efecto?.valor) ?? this.valor;
    objetivo.defensa += defensa;
    this.cantidad--;
    return { ok: true, mensaje: `${objetivo.nombre} aumenta defensa ${defensa} con ${this.nombre}` };
  }
}

export { Inventario, Item, Arma, Curacion, Armadura };
