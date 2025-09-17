// Personaje.js
class Personaje {
  constructor({ id = null, rol, nombre, vida = 100, ataque = 10, defensa = 5, nivel = 1, habilidadEspecial = {}, inventario = [] }) {
    if (new.target === Personaje) {
      throw new Error("No se puede instanciar la clase abstracta 'Personaje'");
    }

    if (typeof nombre !== "string" || nombre.length === 0) throw new Error("Error en nombre");

    this.id = id ?? Date.now().toString(); // puedes reemplazar por uuid
    this.rol = rol;
    this.nombre = nombre;
    this.vida = Number(vida);
    this.ataque = Number(ataque);
    this.defensa = Number(defensa);
    this.nivel = Number(nivel);
    this.habilidadEspecial = habilidadEspecial || {};
    this.inventario = inventario || [];
    this.estado = {}; // para efectos temporales (quemadura, buffs, etc.)
  }

  atacar(objetivo, notificador = null) {
    const dano = this.ataque;
    const danoReal = objetivo.recibirDaño(dano);
    if (notificador) notificador.mostrarAccion(`${this.nombre} ataca a ${objetivo.nombre} y hace ${danoReal} de daño`);
    return danoReal;
  }

  recibirDaño(dano) {
    // aplica defensa y buffs (si existieran)
    const multiplicadorDefensa = this.estado.defensaMultiplicador ?? 1;
    const defensaActual = (this.defensa || 0) * multiplicadorDefensa;
    const danoReal = Math.max(0, dano - defensaActual);
    this.vida = Math.max(0, this.vida - danoReal);
    return danoReal;
  }

  usarHabilidad(objetivo, notificador = null) {
    throw new Error("Método usarHabilidad debe ser implementado en la subclase");
  }

  subirNivel() {
    this.nivel += 1;
    this.vida += 20;
    this.ataque += 2;
    this.defensa += 5;
    return this.nivel;
  }
}

module.exports = Personaje;
