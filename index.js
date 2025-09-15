const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');

async function mostrarMenu() {
    console.clear();

    console.log(
        boxen(chalk.green.bold('🔥 GTA San Andreas RPG 🔥'), {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'yellow'
        })
    );

    const opciones = await inquirer.prompt([
        {
            type: 'list',
            name: 'accion',
            message: chalk.cyan('Selecciona una opción:'),
            choices: [
                { name: '-- Crear personaje', value: 'crear' },
                { name: '-- Ver personajes', value: 'ver' },
                { name: '-- Iniciar batalla', value: 'batalla' },
                { name: '-- Salir', value: 'salir' }
            ]
        }
    ]);

    switch (opciones.accion) {
        case 'crear':
            console.log(chalk.green(' Aquí va la lógica de crear personaje.'));
            break;
        case 'ver':
            console.log(chalk.blue(' Aquí va la lógica de ver personajes.'));
            break;
        case 'batalla':
            console.log(chalk.red(' Aquí va la lógica de iniciar batalla.'));
            break;
        case 'salir':
            console.log(chalk.yellow(' ¡Gracias por jugar GTA SA RPG!'));
            process.exit();
    }

    if (opciones.accion !== 'salir') {
        await new Promise((res) => setTimeout(res, 1500));
        await mostrarMenu();
    }
}

mostrarMenu();
