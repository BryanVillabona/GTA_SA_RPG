class Personaje {
    constructor(rol, nombre, vida, ataque, defensa, habilidadEspecial, inventario) {
        if (this.constructor === Personaje) {
            throw new Error("No se puede instanciar la clase abstracta 'Chismosa'")
        }

        if (typeof nombre === "string" && nombre.length !== 0) {
            this.nombre = nombre;
        } else {
            throw new Error ("Error en nombre")
        }

        if (typeof vida === "number" && vida >= 0) {
            this.vida = vida;
        } else {
            throw new Error ("Error en vida")
        }

        if (typeof ataque === "number" && ataque >= 0) {
            this.ataque = ataque;
        } else {
            throw new Error ("Error en ataque")
        }

        if (typeof defensa === "number" && defensa >= 0) {
            this.ataque = defensa;
        } else {
            throw new Error ("Error en defensa")
        }

        if (typeof nivel === "number" && nivel >= 1) {
            this.nivel = nivel;
        } else {
            throw new Error ("Error en nivel")
        }

        if (typeof habilidadEspecial === "object") {
            this.habilidadEspecial = habilidadEspecial;
        } else {
            throw new Error ("Error en habilidadEspecial")
        }

        if (typeof inventario === "object") {
            this.inventario = inventario;
        } else {
            throw new Error ("Error en inventario")
        }
    }

    atacar() {
        throw new Error("Método debe ser implementado en subclases posteriores");
    }

    recibirDaño(dano) {
        const danoReal = Math.max(0, dano - this.defensa);
        this.vida -= danoReal;
        console.log(`${this.nombre} recibió ${danoReal} de daño. Vida restante: ${this.vida}`);
    }

    usarHabilidad(objetivo) {
        throw new Error("Método debe ser implementado en subclases posteriores");
    }

    subirNivel() {
        this.nivel++;
        this.vida += 20;
        this.defensa += 5;
        this.ataque += 2;
        console.log(`${this.nombre} ha subido a nivel ${this.nivel}`)
    }
}