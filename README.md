# Proyecto_3_Diseño
1. Requisitos previos
Para ejecutar el proyecto, se recomienda contar con los siguientes programas instalados:
- Visual Studio Code.
- Node.js (versión LTS).
- Navegador web, preferiblemente Google Chrome o Microsoft Edge.
- Git (opcional, si se desea clonar el repositorio).

Node.js se puede descargar desde la página oficial: https://nodejs.org/es/download

Durante la instalación, se recomienda mantener las opciones predeterminadas, incluyendo npm y la incorporación de Node.js al PATH del sistema.

2. Descargar y abrir el proyecto
   
1. Ingresar al repositorio de GitHub del proyecto.
2. Descargar el proyecto en formato ZIP o clonar el repositorio mediante Git.
3. Descomprimir el archivo en caso de haber descargado el ZIP.
4. Abrir la carpeta principal del proyecto en Visual Studio Code.
5. Abrir una terminal desde la opción Terminal → Nueva terminal.
3. Verificar la instalación de Node.js
Ejecutar los siguientes comandos en la terminal:
node -v


npm -v


Si ambos comandos muestran sus respectivas versiones, se puede continuar con la instalación del proyecto.
Si no También es posible cambiar el tipo de terminal de Visual Studio Code a Command Prompt (CMD) y utilizar los comandos de npm normalmente.

Si todo fue bien:
4. Instalar las dependencias
Desde la terminal de Visual Studio Code, ingresar a la carpeta Backend:
cd Backend


Una vez dentro de esta carpeta, ejecutar:
npm install


Este comando instalará automáticamente las dependencias establecidas en el archivo package.json y generará la carpeta node_modules, necesaria para el funcionamiento del servidor.
5. Ejecutar el servidor
Desde la misma carpeta Backend, ejecutar:
node server.js


Una vez iniciado el servidor, abrir el navegador e ingresar a la siguiente dirección:

**http://localhost:5000**

Se mostrará la pantalla de inicio de sesión de TechStore, desde la cual se podrá registrar un usuario y acceder a las diferentes funcionalidades del sistema.

En caso de ocurrir un error en Powershell. Poner los siguientes comandos en modo cmd

npm.cmd -v


Ingresar a la carpeta Backend, si todavía no se encuentra dentro de ella:
cd Backend


Instalar las dependencias:
npm.cmd install


Iniciar el servidor:
node server.js



6.Resumen de comandos
los comandos necesarios para ejecutar el proyecto una vez tenga todo instalado son:
cd Backend
npm install
node server.js


7.En caso de presentar restricciones de PowerShell:
cd Backend
npm.cmd install
node server.js


Finalmente, acceder desde el navegador a:

**http://localhost:5000**

En caso de haber dificultades y se pone la mano en el corazón 
Contactarnos por Correo :).
