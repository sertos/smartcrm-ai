# Próximos pasos para lanzar SmartCRM AI (Tu Software SaaS)

SmartCRM AI está diseñado como un SaaS multi-tenant que utiliza Firebase y Firestore Security Rules para asegurar que cada usuario solo vea sus propios "leads" (clientes potenciales).

## Base de Datos (Firebase / Firestore)

Actualmente la base de datos se guarda temporalmente en la base de datos de desarrollo del entorno AI Studio, pero este es tu software. Cada cliente tuyo o usuario final que ingrese verá sus propios datos y estarán seguros, por lo que **como creador del SaaS (tú), solo necesitas UN proyecto de Firebase** para todos tus clientes. 

El modelo SaaS estándar significa que tú hospedas la base de datos para *todos* tus usuarios (clientes de tu SaaS), y las Reglas de Seguridad (`firestore.rules`) ya implementadas garantizan la privacidad: evitan que el Cliente A pueda ver los clientes del Cliente B.

### Si quieres vender el software e instalarlo en la cuenta del cliente ("On-Premise" o "White Label"):
En caso de que no quieras alojar la base de datos y prefieras venderles el código a otros negocios individualmente, puedes instruirles a ellos cómo conectar *su propia* base de datos.
Para ello, el usuario (tu cliente) debe:
1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilitar la Autenticación (Google Login).
3. Habilitar la base de datos Firestore.
4. Reemplazar el contenido del archivo `firebase-applet-config.json` de este proyecto con sus propias credenciales de Firebase.

## Cómo ejecutar el proyecto localmente (Modo Desarrollo)

Instrucciones para cualquier desarrollador o cliente que quiera probar este código en su computadora:

1. **Requisitos Previos:**
   Asegúrate de tener instalado [Node.js](https://nodejs.org/es/).

2. **Instalar las dependencias:**
   Abre una terminal en la raíz de este proyecto y ejecuta:
   ```bash
   npm install
   ```

3. **Ejecutar en modo de desarrollo:**
   Una vez que termine de instalar, corre el servidor:
   ```bash
   npm run dev
   ```
   Esto levantará la aplicación en `http://localhost:3000` (o el puerto que se indique en la consola).

4. **Desplegar Reglas de Seguridad (Opcional si usas tu propio Firebase):**
   Si conectas tu propio proyecto de Firebase, no olvides instalar `firebase-tools` globalmente y hacer el deploy de las reglas:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

## Notas Finales
El toggle bilingüe (EN/ES) ya está globalizado con `i18next`. Los datos ficticios de demostración de los gráficos fueron removidos por peticiones del usuario, ahora muestran estados vacíos ("No data available yet" o "Sin datos disponibles") si aún no hay leads registrados.
