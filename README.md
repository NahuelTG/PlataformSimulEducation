# SimuTechAcademy - Plataforma de Simulación Educativa

**SimuTechAcademy** es un sistema de gestión de aprendizaje (LMS) construido con **React** y **Firebase**. La plataforma está diseñada para ofrecer a los estudiantes acceso a simulaciones interactivas, contenido educativo en línea y herramientas prácticas para aplicar conceptos teóricos en tiempo real, con un fuerte enfoque en **generadores de números aleatorios** y **pruebas estadísticas**.

---

## ✨ Características Principales

- **Autenticación y Roles de Usuario**\
  Sistema completo de registro e inicio de sesión con tres roles definidos:

  - Administrador
  - Estudiante (usuario)
  - Invitado

- **Gestión de Cursos (Admin)**\
  Los administradores pueden crear, editar, eliminar y gestionar cursos, incluyendo la subida de materiales como videos y documentos PDF.

- **Portal del Estudiante**\
  Los estudiantes pueden buscar cursos, inscribirse, ver el contenido, seguir su progreso, enviar tareas y comunicarse con otros usuarios.

- **Simuladores Estadísticos Interactivos**

  - Generadores de Números Aleatorios:
    - Congruencial Mixto
    - Congruencial Multiplicativo
    - Composición
    - Rechazo
    - Transformada Inversa
  - Pruebas Estadísticas:
    - Frecuencia
    - Promedios
    - Series
    - Poker
    - Kolmogorov-Smirnov

- **Comunicación Integrada**\
  Sistema de mensajería tipo foro entre estudiantes y administradores.

- **Videollamadas en Tiempo Real**\
  Funcionalidad de videollamada usando **PeerJS**.

---

## 🚀 Pila Tecnológica

- **Frontend**:

  - React (JSX + TSX)
  - Vite

- **Backend & Base de Datos**:

  - Firebase (Authentication, Firestore, Cloud Storage)

- **UI / Estilos**:

  - Tailwind CSS
  - Shadcn/ui
  - Material-UI (MUI)
  - CSS Modules / CSS plano

- **Enrutamiento**:

  - React Router DOM

- **Gráficos**:

  - Chart.js

---

## 🗂️ Nota sobre la Estructura

El proyecto presenta una estructura mixta con componentes y páginas en `.jsx` y `.tsx`.\
El **punto de entrada principal** es:

```
src/main.jsx
```

Esto indica que la lógica de enrutamiento y renderizado inicial se basa en la estructura `.jsx`.\
Los archivos `.tsx` y componentes de Shadcn/ui corresponden a una **migración en curso** hacia TypeScript.

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos

- Node.js `18.x` o superior
- npm o yarn

### Pasos

1. **Clonar el repositorio:**

```bash
git clone https://github.com/tu-usuario/nahueltg-plataformsimuleducation.git
cd nahueltg-plataformsimuleducation
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar Firebase:**

Edita el archivo:

```
src/connection/firebaseConfig.js
```

Reemplaza el objeto `firebaseConfig` con tus propias credenciales de Firebase.

4. **Ejecutar el servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173)

5. **Construir para producción:**

```bash
npm run build
```

Esto generará la carpeta `dist` con los archivos listos para el despliegue.

---

## 🧑‍💻 Credenciales de Prueba

Puedes registrarte como nuevo usuario o usar las siguientes credenciales de estudiante:

- **Rol**: Estudiante
- **Email**: `usuario@simutech.com`
- **Contraseña**: `usuario123`

> ⚠️ **Nota**: Para asignar el rol de Administrador, edita manualmente el campo `role` del documento del usuario correspondiente en la colección `users` de Firebase Firestore.

---

