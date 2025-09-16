class Inventario {
    constructor(objetos = []) {
        if (!Array.isArray(objetos)) {
            throw new Error("El inventario debe inicializarse con un array");
        }
        this.items = objetos;
    }

    agregarItem(item) {
        this.items.push(item);
        console.log(`${item.nombre} añadido al inventario`);
    }

    verItems() {
        console.log("Inventario:");
        this.items.forEach((item, i) => {
            console.log(`${i + 1}. ${item.nombre} (${item.tipo}) - ${item.descripcion}`);
        });
    }

    usarItem(index, objetivo) {
        if (index < 0 || index >= this.items.length) {
            console.log("Índice inválido");
            return;
        }
        const item = this.items[index];
        item.usar(objetivo);
    }

    eliminarItem(index) {
        if (index < 0 || index >= this.items.length) {
            console.log("Índice inválido");
            return;
        }
        this.items = this.usuarios.filter(i => i !== index);
    }
}


class Items {
    constructor(nombre, tipo, descripcion, valor) {
        if (this.constructor === Items) {
            throw new Error("No se puede instanciar la clase abstracta 'Items'")
        }

        if (typeof nombre === "string") {
            this.nombre = nombre;
        } else {
            throw new Error ("Error en nombre")
        }

        if (typeof tipo === "string") {
            this.tipo = tipo;
        } else {
            throw new Error ("Error en efecto")
        }
        
        if (typeof descripcion === "string") {
            this.descripcion = descripcion;
        } else {
            throw new Error ("Error en descripcion")
        }

        if (typeof valor === "number" && valor >= 0 && valor <= 100) {
            this.valor = valor
        } else {
            throw new Error ("Error en valor")
        }
    }

    usar() {
        throw new Error("Método debe ser implementado en subclases posteriores");
    }
}

class Arma extends Items {
    constructor(nombre, tipo, descripcion, valor) {
        super(nombre, tipo, descripcion, valor)
    }

    usar(objetivo) {
        if (this.cantidad <= 0) {
          console.log(`No quedan más ${this.nombre}`);
          return;
        }
    
        objetivo.vida -= this.efecto.valor;
        console.log(`${objetivo.rol} recibe ${this.efecto.valor} de daño con ${this.nombre}. Vida actual: ${objetivo.vida}`);
        this.cantidad--;
    }
}

class Curacion extends Items {
    constructor(nombre, tipo, descripcion, valor) {
        super(nombre, tipo, descripcion, valor)
    }

    usar(objetivo) {
        if (this.cantidad <= 0) {
          console.log(`❌ No quedan más ${this.nombre}`);
          return;
        }
    
        objetivo.vida += this.efecto.valor;
        console.log(`💊 ${objetivo.rol} recupera ${this.efecto.valor} de vida con ${this.nombre}. Vida actual: ${objetivo.vida}`);
        this.cantidad--;
    }
}

class Armadura extends Items {
    constructor(nombre, tipo, descripcion, valor) {
        super(nombre, tipo, descripcion, valor)
    }

    usar(objetivo) {
        if (this.cantidad <= 0) {
          console.log(`No quedan más ${this.nombre}`);
          return;
        }
    
        objetivo.defensa += this.efecto.valor;
        console.log(`${objetivo.rol} aumenta su defensa en ${this.efecto.valor} con ${this.nombre}. Defensa actual: ${objetivo.defensa}`);
        this.cantidad--;
    }
}