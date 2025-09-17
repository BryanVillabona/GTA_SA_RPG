import inquirer from 'inquirer';
import boxen from "boxen";
import chalk from "chalk";

import GestorJuego from './services/GestorJuego.js';
import Presentador from './utils/Presentador.js';

const juego = new GestorJuego();

async function mostrarMenu() {
  console.clear();
  console.log(boxen(chalk.green.bold('🔥 GTA San Andreas RPG 🔥'), { padding: 1, borderStyle: 'double' }));

  if (juego.personajeActivo) {
    Presentador.mensaje(`👤 Personaje activo: ${juego.personajeActivo.nombre} (${juego.personajeActivo.rol})`, 'info');
  }

  const { accion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'accion',
      message: 'Selecciona una opción:',
      choices: [
        { name: '-- Crear personaje', value: 'crear' },
        { name: '-- Ver personajes', value: 'ver' },
        { name: '-- Eliminar personaje', value: 'eliminar' },
        { name: '-- Iniciar batalla', value: 'batalla' },
        { name: '-- Salir', value: 'salir' },
      ],
    },
  ]);

  if (accion === 'crear') await juego.crearPersonaje();
  if (accion === 'ver') await juego.verPersonajes();
  if (accion === 'eliminar') await juego.eliminarPersonaje();
  if (accion === 'batalla') await juego.iniciarBatalla();
  if (accion === 'salir') return process.exit();

  await mostrarMenu();
}

mostrarMenu();



