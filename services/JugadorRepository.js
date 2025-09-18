const fs = require('fs').promises;
const path = require('path');

const JUGADORES_PATH = path.join(__dirname, '..', 'data', 'jugadores.json');

class JugadorRepository {
  async _leerArchivo() {
    try {
      const txt = await fs.readFile(JUGADORES_PATH, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async _escribirArchivo(datos) {
    const txt = JSON.stringify(datos, null, 2);
    await fs.writeFile(JUGADORES_PATH, txt, 'utf8');
  }

  async obtenerTodos() {
    return this._leerArchivo();
  }

  async guardarTodos(jugadores) {
    await this._escribirArchivo(jugadores);
    return true;
  }
}

module.exports = JugadorRepository;