# Jamomo Plan

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Descripción

Jamomo Plan es una aplicación web diseñada para ayudar a los usuarios a seguir y guardar su progreso en un plan de sanación. La aplicación permite a los usuarios registrar sus descripciones diarias, marcar días como completados y ver su progreso general.

## Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Despliegue](#despliegue)
- [Tecnologías](#tecnologías)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Características

- Registro de descripciones diarias.
- Marcar días como completados.
- Visualización del progreso general.
- Autenticación de usuarios.
- Temporizador para el próximo día.

## Instalación

Sigue estos pasos para instalar y configurar el proyecto localmente:

1. Clona el repositorio:

    ```bash
    git clone https://github.com/tu-usuario/jamomo-plan.git
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd jamomo-plan
    ```

3. Instala las dependencias:

    ```bash
    npm install
    ```

4. Crea un archivo `.env` en la raíz del proyecto y agrega tus variables de entorno:

    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_uri
    EMAILJS_PUBLIC_KEY=your_emailjs_public_key
    ```

## Uso

Para iniciar la aplicación en modo de desarrollo, ejecuta:

```bash
npm run dev
