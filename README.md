# Coste de Vida Digital

> 💰 Gestiona tus gastos digitales: suscripciones, tarjetas de crédito, servicios de software y AI.

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)

## ✨ Características

- 📊 **Vista tabular** - Interfaz tipo planilla para gestionar todos tus gastos
- ➕ **CRUD completo** - Añadir, editar y eliminar gastos fácilmente
- 🔍 **Filtros avanzados** - Ver gastos por mes, año o todos
- 📈 **Gráficos interactivos** - Visualiza tus gastos con gráficos de barras y circular
- 🌙 **Modo oscuro** - Tema claro/oscuro con un solo clic
- 💾 **Persistencia local** - Datos guardados en localStorage
- 📱 **Responsive** - Funciona en desktop, tablet y móvil

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/coste-de-vida-digital.git

# Entrar al directorio
cd coste-de-vida-digital

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📦 Tech Stack

| Tecnología | Uso |
|------------|-----|
| React 18 | Framework UI |
| Vite | Build tool |
| TailwindCSS | Estilos |
| Chart.js | Gráficos |
| localStorage | Persistencia |
| GitHub Actions | CI/CD |
| GitHub Pages | Hosting |

## 🏗️ Estructura del Proyecto

```
coste-de-vida-digital/
├── src/
│   ├── components/
│   │   ├── Layout.jsx         # Layout con header y navegación
│   │   ├── ExpenseTable.jsx   # Tabla de gastos
│   │   ├── ExpenseForm.jsx    # Formulario modal
│   │   ├── Filters.jsx        # Filtros de fecha
│   │   └── Charts.jsx         # Gráficos
│   ├── hooks/
│   │   └── useExpenses.js     # Hook para gestión de gastos
│   ├── utils/
│   │   └── storage.js         # Utilidades de localStorage
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions
├── index.html
├── vite.config.js
└── package.json
```

## 🌐 Despliegue

El proyecto incluye GitHub Actions para despliegue automático a GitHub Pages.

1. Sube el código a tu repositorio de GitHub
2. Ve a Settings → Pages → Source: GitHub Actions
3. El deploy se ejecuta automáticamente con cada push a `main`

## 📝 Uso

1. **Añadir gasto**: Click en "➕ Añadir Gasto"
2. **Editar gasto**: Click en ✏️ en la fila del gasto
3. **Eliminar gasto**: Click en 🗑️ (doble click para confirmar)
4. **Filtrar**: Usa los botones Todos/Por Año/Por Mes
5. **Ver gráficos**: Click en la pestaña "📈 Gráficos"
6. **Cambiar tema**: Click en 🌙/☀️ en la esquina superior derecha

## 🔮 Roadmap

- [ ] Exportación a PDF/Excel
- [ ] Firebase/Supabase para sincronización cloud
- [ ] PWA con soporte offline
- [ ] Multi-idioma
- [ ] Integración con APIs bancarias

## 📄 Licencia

MIT License - Libre para uso personal y comercial.
