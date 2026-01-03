
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources embedded directly to prevent loading errors
const resources = {
  en: {
    translation: {
      app: {
        reportProblem: "Report a Problem"
      },
      auth: {
        login: "Log In",
        signup: "Sign Up",
        email: "Email Address",
        password: "Password",
        name: "Full Name",
        errorMissingFields: "Please fill all fields",
        errorUnexpected: "An unexpected error occurred",
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: "Already have an account?",
        demoAccess: "Demo Access"
      },
      general: {
        appName: "GymPro Manager",
        save: "Save",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        loading: "Loading...",
        actions: "Actions",
        search: "Search...",
        welcome: "Welcome, {{name}}",
        noData: "No data available",
        confirmDelete: "Are you sure? This cannot be undone.",
        success: "Success",
        error: "Error",
        view: "View",
        create: "Create",
        kg: "kg",
        cm: "cm",
        messages: "Messages",
        user: "Client",
        warning: "Warning",
        unassigned: "Unassigned",
        add: "Add",
        logout: "Log Out",
        settings: "Settings",
        export: "Export CSV",
        birthDate: "Birth Date",
        emergencyContact: "Emergency Contact"
      },
      nav: {
        dashboard: "Home",
        users: "Clients",
        reports: "Reports",
        payments: "Finances",
        pos: "Point of Sale",
        tasks: "Team Tasks",
        classes: "Classes",
        announcements: "Bulletins",
        challenges: "Challenges",
        equipment: "Equipment",
        tiers: "Memberships",
        templates: "Routine Templates",
        appSettings: "App Settings",
        notifications: "Notifications",
        settings: "Settings",
        mySettings: "My Settings",
        social: "Community",
        routine: "My Routine",
        workoutLog: "Workout Log",
        nutritionLog: "AI Nutrition",
        progress: "My Progress",
        aiCoach: "AI Coach",
        profile: "Profile",
        logout: "Log Out",
        analysis: "Posture Analysis",
        aiGenerator: "AI Builder"
      },
      sidebar: {
        overview: "Overview",
        management: "Management",
        gymOperations: "Gym Operations",
        community: "Community",
        system: "System",
        home: "Home",
        training: "Training",
        account: "Account",
        users: "Users"
      },
      admin: {
        dashboard: { notifications: "Notifications", settings: "Settings", classSchedule: "Class Schedule", routineTemplates: "Routine Templates" },
        userManagement: { searchPlaceholder: "Search...", allTrainers: "All Trainers", selectPlaceholder: "Select..." },
        userEditor: {
          tabs: { personal: "Personal", membership: "System Access", fitness: "Fitness Profile", professional: "Professional Profile" },
          fields: { tier: "Membership Tier", expiration: "Expiration Date", goals: "Fitness Goals", medical: "Medical Conditions" }
        },
        reports: { title: "Reports & Analytics", trainerLoad: "Trainer Load", clients: "Clients", expirationForecast: "Expiration Forecast", expiringMemberships: "Expiring Memberships", demographicsGender: "Demographics by Gender", demographicsLevel: "Demographics by Level", notSet: "Not Set" },
        appSettings: { title: "Application Settings", notifications: "Notifications", emailTemplate: "Email Template", emailTemplateDefault: "Welcome to GymPro...", expiryReminder: "Expiry Reminder", expiryReminderDefault: "Your membership is expiring...", saveTemplates: "Save Templates", system: "System", maintenanceMode: "Maintenance Mode", maintenanceModeDesc: "Prevents non-admin users from logging in.", successMessage: "{{section}} saved successfully." },
        userDetailsModal: { keyInfo: "Key Information", status: "Status", tier: "Tier", clientLoad: "Client Load", clientsCount: "{{count}} Active Clients", memberSince: "Member Since", expiresOn: "Expires On", assignedTrainers: "Assigned Trainers", none: "None", personalInfo: "Personal Info", phone: "Phone", gender: "Gender", age: "Age", ageYears: "{{age}} years", healthFitness: "Health & Fitness", fitnessLevel: "Fitness Level", height: "Height", heightCm: "{{height}} cm", weight: "Weight", weightKg: "{{weight}} kg", fitnessGoals: "Fitness Goals", dietaryPreferences: "Dietary Preferences", medicalConditions: "Medical Conditions", professionalInfo: "Professional Info", skills: "Skills", emergencyContact: "Emergency Contact", name: "Name", close: "Close", editUser: "Edit User", notApplicable: "N/A" },
        finances: { title: "Financial Overview", tabs: { overview: "Overview", transactions: "Transactions", budgets: "Budgets", reports: "Reports" }, stats: { netProfit: "Net Profit", totalIncome: "Total Income", totalExpenses: "Total Expenses", cashFlow: "Flow" } }
      },
      roles: { 
        ADMIN: "Administrator", 
        CLIENT: "Client", 
        TRAINER: "Trainer", 
        RECEPTIONIST: "Receptionist", 
        GENERAL_MANAGER: "Manager", 
        GROUP_INSTRUCTOR: "Instructor", 
        NUTRITIONIST: "Nutritionist", 
        PHYSIOTHERAPIST: "Physio",
        SALES_AGENT: "Sales Agent",
        MAINTENANCE: "Maintenance Staff"
      },
      enums: {
        Role: { 
            ADMIN: "Administrator", 
            CLIENT: "Client", 
            TRAINER: "Trainer", 
            RECEPTIONIST: "Receptionist", 
            GENERAL_MANAGER: "Manager", 
            GROUP_INSTRUCTOR: "Instructor", 
            NUTRITIONIST: "Nutritionist", 
            PHYSIOTHERAPIST: "Physio",
            SALES_AGENT: "Sales Agent",
            MAINTENANCE: "Maintenance Staff"
        },
        MembershipStatus: { ACTIVE: "Active", EXPIRED: "Expired", PENDING: "Pending" },
        TaskStatus: { PENDING: "Pending", IN_PROGRESS: "In Progress", COMPLETED: "Completed" },
        TaskPriority: { High: "High", Medium: "Medium", Low: "Low" },
        Gender: { Mascultino: "Male", Femenino: "Female", Otro: "Other", "Prefiero no decirlo": "Prefer not to say" },
        FitnessLevel: { title: "Fitness Level", BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" }
      },
      days: { Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday", Sunday: "Sunday" },
      toast: { welcome: "Welcome back, {{name}}!", loggedOut: "Logged out successfully", passwordError: "Invalid email or password", emailExists: "Email already registered", accountCreated: "Account created!", aiCoachError: "Coach is temporarily offline", workoutLogged: "Workout logged!", challengeJoined: "You joined the challenge!", achievementUnlocked: "Achievement unlocked: {{name}}", incidentReported: "Incident reported", alreadyBooked: "You are already booked for this class", classFull: "Class is full", bookedSuccess: "Booked {{name}} successfully", statusUpdateSuccess: "Task updated!" },
      profile: { editTitle: "Edit Profile", personal: "Personal Info", fitness: "Health & Goals", career: "Professional", emergency: "Emergency", fullName: "Full Name", mobile: "Mobile", height: "Height", weight: "Weight", imc: "BMI", prs: "Personal Records", success: "Profile updated successfully", birthDate: "Birth Date", gender: "Gender", saving: "Saving..." },
      tasks: { title: "Task Management", newTask: "New Task", editTask: "Edit Task", taskName: "Task Name", description: "Description", assignTo: "Assign to", dueDate: "Due Date", priority: "Priority", status: "Status", myTasks: "My Assigned Tasks", noTasks: "No tasks assigned", noTasksDesc: "Your list is currently empty.", statusUpdateSuccess: "Task updated!", assignedBy: "Assigned by" },
      player: { previous: "Previous", finish: "Finish Routine", rest: "Rest Time", skip: "Skip", next: "Next Exercise" },
      analysis: { title: "AI Technique Analysis", upload: "Upload Exercise Photo", analyzing: "Analyzing...", feedback: "Coach Feedback" },
      splash: { tagline: "Forging your best version", loading: "Initializing system..." },
      footer: { privacy: "Privacy Policy", terms: "Terms of Use", support: "Technical Support" },
      support: { categories: { technical: "Technical Issue", billing: "Billing", equipment: "Equipment", suggestion: "Suggestion" } },
      components: {
        languageSwitcher: { language: "Language", english: "English", spanish: "Spanish" },
        settingsView: {
          title: "Settings", appearance: "Appearance", languageDesc: "Choose your preferred language.", darkMode: "Dark Mode", darkModeDesc: "Switch between light and dark themes.", theme: "Color Theme", accountSecurity: "Account Security", authErrorLogin: "You must be logged in to change your password.", passwordErrorCurrent: "Incorrect current password.", passwordErrorMatch: "New passwords do not match.", passwordErrorLength: "Password must be at least 8 characters.", passwordSuccess: "Password updated successfully.", currentPassword: "Current Password", newPassword: "New Password", confirmNewPassword: "Confirm New Password", changePassword: "Change Password",
          privacyNotifications: "Privacy & Notifications", privacySettings: "Privacy Settings", profileVisibility: "Profile Visibility", profileVisibilityDesc: "Control who can see your profile.", activityVisibility: "Activity Visibility", activityVisibilityDesc: "Control who can see your workouts.", showInSearch: "Show in Search", showInSearchDesc: "Allow others to find you by name.",
          notificationPreferences: "Notification Preferences", newMessages: "New Messages", newMessagesDesc: "Notify when you receive a message.", routineUpdates: "Routine Updates", routineUpdatesDesc: "Notify when your trainer updates your routine.",
          blockedUsers: "Blocked Users", unblock: "Unblock", noBlockedUsers: "No blocked users.", dangerZone: "Danger Zone", deactivateAccount: "Deactivate Account", deactivateAccountDesc: "Temporarily disable your account.", deactivate: "Deactivate", resetUsers: "Reset Data", resetUsersDesc: "Reset all demo data to default.", reset: "Reset", confirmDeactivation: "Are you sure you want to deactivate your account? You can reactivate it by logging in again.", confirmResetUsers: "This will reset all user data to the initial demo state. This action cannot be undone.",
          privacyOptions: { everyone: "Everyone", connections: "Connections Only", me: "Only Me" }
        },
        reportIncidentModal: { title: "Report Equipment Incident", equipment: "Equipment", selectEquipment: "Select equipment...", describeProblem: "Describe the problem", descriptionPlaceholder: "e.g., The belt is slipping...", submitReport: "Submit Report", alert: "Please fill all fields" },
        equipment: { title: "Equipment Management", newEquipment: "New Equipment", activeIncidents: "Active Incidents", unknownEquipment: "Unknown Equipment", markResolved: "Mark Resolved", headers: { name: "NAME", type: "TYPE", status: "STATUS" }, modal: { editTitle: "Edit Equipment", addTitle: "Add Equipment", name: "Name", type: "Type", typePlaceholder: "e.g. Cardio", location: "Location", locationPlaceholder: "e.g. Zone A", status: "Status", save: "Save", cancel: "Cancel" }, confirmDelete: "Are you sure you want to delete this equipment?" }
      },
      equipmentTypes: { Cardio: "Cardio", Strength: "Strength", "Free Weights": "Free Weights", Machine: "Machine" },
      classSchedule: { calendar: "Calendar", list: "List", today: "TODAY", more: "more", modal: { edit: "Edit Class", new: "New Class", desc: "Configure class details", name: "Class Name", namePlaceholder: "e.g. HIIT", description: "Description", descPlaceholder: "Class focus...", trainer: "Trainer", date: "Date", capacity: "Capacity", start: "Start Time", end: "End Time" } },
      pos: { products: "Products", currentSale: "Current Sale", searchClient: "Search Client...", emptyCart: "Cart is empty", total: "Total", checkout: "Checkout", saleSuccess: "Sale Completed!", totalCharged: "Total Charged", selectUserAlert: "Please select a user first" },
      booking: { noClasses: "No classes found for the selected filters." }
    }
  },
  es: {
    translation: {
      app: {
        reportProblem: "Reportar un Problema"
      },
      auth: {
        login: "Iniciar Sesión",
        signup: "Registrarse",
        email: "Correo Electrónico",
        password: "Contraseña",
        name: "Nombre Completo",
        errorMissingFields: "Por favor llena todos los campos",
        errorUnexpected: "Ocurrió un error inesperado",
        dontHaveAccount: "¿No tienes cuenta?",
        alreadyHaveAccount: "¿Ya tienes cuenta?",
        demoAccess: "Acceso Demo"
      },
      general: {
        appName: "GymPro Manager",
        save: "Guardar",
        saveChanges: "Guardar Cambios",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        loading: "Cargando...",
        actions: "Acciones",
        search: "Buscar...",
        welcome: "Bienvenido, {{name}}",
        noData: "Sin datos disponibles",
        confirmDelete: "¿Estás seguro? Esta acción no se puede deshacer.",
        success: "Éxito",
        error: "Error",
        view: "Ver",
        create: "Crear",
        kg: "kg",
        cm: "cm",
        messages: "Mensajes",
        user: "Cliente",
        warning: "Atención",
        unassigned: "Sin asignar",
        add: "Añadir",
        logout: "Cerrar Sesión",
        settings: "Ajustes",
        export: "Exportar CSV",
        birthDate: "Fecha de Nacimiento",
        emergencyContact: "Contacto de Emergencia"
      },
      nav: {
        dashboard: "Inicio",
        users: "Clientes",
        reports: "Reportes",
        payments: "Finanzas",
        pos: "Punto de Venta",
        tasks: "Tareas de Equipo",
        classes: "Clases",
        announcements: "Anuncios",
        challenges: "Desafíos",
        equipment: "Equipamiento",
        tiers: "Membresías",
        templates: "Plantillas",
        appSettings: "Ajustes App",
        notifications: "Notificaciones",
        settings: "Ajustes",
        mySettings: "Mis Ajustes",
        social: "Comunidad",
        routine: "Mi Rutina",
        workoutLog: "Registro de Entrenamiento",
        nutritionLog: "Nutrición IA",
        progress: "Mi Progreso",
        aiCoach: "Coach IA",
        profile: "Perfil",
        logout: "Cerrar Sesión",
        analysis: "Análisis Postura",
        aiGenerator: "Constructor IA"
      },
      sidebar: {
        overview: "Resumen",
        management: "Gestión",
        gymOperations: "Operaciones",
        community: "Comunidad",
        system: "Sistema",
        home: "Inicio",
        training: "Entrenamiento",
        account: "Cuenta",
        users: "Usuarios"
      },
      admin: {
        dashboard: { notifications: "Notificaciones", settings: "Ajustes", classSchedule: "Agenda de Clases", routineTemplates: "Plantillas de Rutina" },
        userManagement: { searchPlaceholder: "Buscar...", allTrainers: "Todos los Entrenadores", selectPlaceholder: "Seleccionar..." },
        userEditor: {
          tabs: { personal: "Personal", membership: "Acceso Sistema", fitness: "Perfil Fitness", professional: "Perfil Profesional" },
          fields: { tier: "Nivel de Membresía", expiration: "Vencimiento", goals: "Objetivos de Fitness", medical: "Condiciones Médicas" }
        },
        reports: { title: "Reportes y Analíticas", trainerLoad: "Carga de Entrenadores", clients: "Clientes", expirationForecast: "Pronóstico de Vencimientos", expiringMemberships: "Membresías por Vencer", demographicsGender: "Demografía por Género", demographicsLevel: "Demografía por Nivel", notSet: "No definido" },
        appSettings: { title: "Ajustes de la Aplicación", notifications: "Notificaciones", emailTemplate: "Plantilla de Correo", emailTemplateDefault: "Bienvenido a GymPro...", expiryReminder: "Recordatorio de Vencimiento", expiryReminderDefault: "Tu membresía está por vencer...", saveTemplates: "Guardar Plantillas", system: "Sistema", maintenanceMode: "Modo Mantenimiento", maintenanceModeDesc: "Evita que los usuarios no administradores inicien sesión.", successMessage: "{{section}} guardado con éxito." },
        userDetailsModal: { keyInfo: "Información Clave", status: "Estado", tier: "Nivel", clientLoad: "Carga de Clientes", clientsCount: "{{count}} Clientes Activos", memberSince: "Miembro Desde", expiresOn: "Vence El", assignedTrainers: "Entrenadores Asignados", none: "Ninguno", personalInfo: "Información Personal", phone: "Teléfono", gender: "Género", age: "Edad", ageYears: "{{age}} años", healthFitness: "Salud y Fitness", fitnessLevel: "Nivel de Fitness", height: "Altura", heightCm: "{{height}} cm", weight: "Peso", weightKg: "{{weight}} kg", fitnessGoals: "Objetivos", dietaryPreferences: "Preferencias Dietarias", medicalConditions: "Condiciones Médicas", professionalInfo: "Información Profesional", skills: "Habilidades", emergencyContact: "Contacto de Emergencia", name: "Nombre", close: "Cerrar", editUser: "Editar Usuario", notApplicable: "N/A" },
        finances: { title: "Resumen Financiero", tabs: { overview: "Resumen", transactions: "Transacciones", budgets: "Presupuestos", reports: "Reportes" }, stats: { netProfit: "Ganancia Neta", totalIncome: "Ingresos Totales", totalExpenses: "Gastos Totales", cashFlow: "Flujo" } }
      },
      roles: { 
        ADMIN: "Administrador", 
        CLIENT: "Cliente", 
        TRAINER: "Entrenador", 
        RECEPTIONIST: "Recepcionista", 
        GENERAL_MANAGER: "Gerente", 
        GROUP_INSTRUCTOR: "Instructor", 
        NUTRITIONIST: "Nutricionista", 
        PHYSIOTHERAPIST: "Fisio",
        SALES_AGENT: "Asesor Comercial",
        MAINTENANCE: "Técnico de Mantenimiento"
      },
      enums: {
        Role: { 
            ADMIN: "Administrador", 
            CLIENT: "Cliente", 
            TRAINER: "Entrenador", 
            RECEPTIONIST: "Recepcionista", 
            GENERAL_MANAGER: "Gerente", 
            GROUP_INSTRUCTOR: "Instructor", 
            NUTRITIONIST: "Nutricionista", 
            PHYSIOTHERAPIST: "Fisio",
            SALES_AGENT: "Asesor Comercial",
            MAINTENANCE: "Técnico de Mantenimiento"
        },
        MembershipStatus: { ACTIVE: "Activo", EXPIRED: "Vencido", PENDING: "Pendiente" },
        TaskStatus: { PENDING: "Pendiente", IN_PROGRESS: "En Progreso", COMPLETED: "Completada" },
        TaskPriority: { High: "Alta", Medium: "Media", Low: "Baja" },
        Gender: { Mascultino: "Masculino", Femenino: "Femenino", Otro: "Otro", "Prefiero no decirlo": "Prefiero no decirlo" },
        FitnessLevel: { title: "Nivel Fitness", BEGINNER: "Principiante", INTERMEDIATE: "Intermedio", ADVANCED: "Avanzado" }
      },
      days: { Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles", Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo" },
      toast: { welcome: "¡Bienvenido, {{name}}!", loggedOut: "Sesión cerrada exitosamente", passwordError: "Correo o contraseña inválidos", emailExists: "El correo ya está registrado", accountCreated: "¡Cuenta creada!", aiCoachError: "El Coach está temporalmente fuera de línea", workoutLogged: "¡Entrenamiento registrado!", challengeJoined: "¡Te uniste al desafío!", achievementUnlocked: "Logro desbloqueado: {{name}}", incidentReported: "Incidente reportado", alreadyBooked: "Ya estás inscrito en esta clase", classFull: "La clase está llena", bookedSuccess: "Reserva de {{name}} exitosa", statusUpdateSuccess: "¡Tarea actualizada!" },
      profile: { editTitle: "Editar Perfil", personal: "Info Personal", fitness: "Salud y Metas", career: "Profesional", emergency: "Emergencia", fullName: "Nombre Completo", mobile: "Móvil", height: "Altura", weight: "Peso", imc: "IMC", prs: "Récords Personales", success: "Perfil actualizado exitosamente", birthDate: "Fecha de Nacimiento", gender: "Género", saving: "Guardando..." },
      tasks: { title: "Gestión de Tareas", newTask: "Nueva Tarea", editTask: "Editar Tarea", taskName: "Nombre de Tarea", description: "Descripción", assignTo: "Asignar a", dueDate: "Fecha Límite", priority: "Prioridad", status: "Estado", myTasks: "Mis Tareas Asignadas", noTasks: "Sin tareas asignadas", noTasksDesc: "Tu lista está vacía actualmente.", statusUpdateSuccess: "¡Tarea actualizada!", assignedBy: "Asignada por" },
      player: { previous: "Anterior", finish: "Terminar Rutina", rest: "Descanso", skip: "Omitir", next: "Siguiente Ejercicio" },
      analysis: { title: "Análisis Técnico IA", upload: "Subir Foto Ejercicio", analyzing: "Analizando...", feedback: "Feedback del Coach" },
      splash: { tagline: "Forjando tu mejor versión", loading: "Inicializando sistema..." },
      footer: { privacy: "Política de Privacidad", terms: "Términos de Uso", support: "Soporte Técnico" },
      support: { categories: { technical: "Fallo Técnico", billing: "Facturación", equipment: "Equipo Dañado", suggestion: "Sugerencia" } },
      components: {
        languageSwitcher: { language: "Idioma", english: "Inglés", spanish: "Español" },
        settingsView: {
          title: "Ajustes", appearance: "Apariencia", languageDesc: "Elige tu idioma preferido.", darkMode: "Modo Oscuro", darkModeDesc: "Cambiar entre tema claro y oscuro.", theme: "Tema de Color", accountSecurity: "Seguridad de la Cuenta", authErrorLogin: "Debes iniciar sesión para cambiar tu contraseña.", passwordErrorCurrent: "Contraseña actual incorrecta.", passwordErrorMatch: "Las nuevas contraseñas no coinciden.", passwordErrorLength: "La contraseña debe tener al menos 8 caracteres.", passwordSuccess: "Contraseña actualizada exitosamente.", currentPassword: "Contraseña Actual", newPassword: "Nueva Contraseña", confirmNewPassword: "Confirmar Nueva Contraseña", changePassword: "Cambiar Contraseña",
          privacyNotifications: "Privacidad y Notificaciones", privacySettings: "Ajustes de Privacidad", profileVisibility: "Visibilidad del Perfil", profileVisibilityDesc: "Controla quién puede ver tu perfil.", activityVisibility: "Visibilidad de Actividad", activityVisibilityDesc: "Controla quién puede ver tus entrenamientos.", showInSearch: "Mostrar en Búsqueda", showInSearchDesc: "Permitir que otros te encuentren por nombre.",
          notificationPreferences: "Preferencias de Notificación", newMessages: "Nuevos Mensajes", newMessagesDesc: "Notificar cuando recibas un mensaje.", routineUpdates: "Actualizaciones de Rutina", routineUpdatesDesc: "Notificar cuando tu entrenador actualice tu rutina.",
          blockedUsers: "Usuarios Bloqueados", unblock: "Desbloquear", noBlockedUsers: "No hay usuarios hoy bloqueados.", dangerZone: "Zona de Peligro", deactivateAccount: "Desactivar Cuenta", deactivateAccountDesc: "Deshabilitar temporalmente tu cuenta.", deactivate: "Deactivate", resetUsers: "Restablecer Datos", resetUsersDesc: "Restablecer todos los datos de demostración.", reset: "Restablecer", confirmDeactivation: "¿Estás seguro de que quieres desactivar tu cuenta? Puedes reactivarla iniciando sesión nuevamente.", confirmResetUsers: "Esto restablecerá todos los datos de usuario al estado inicial de demostración. Esta acción no se puede deshacer.",
          privacyOptions: { everyone: "Todos", connections: "Solo Conexiones", me: "Solo Yo" }
        },
        reportIncidentModal: { title: "Reportar Incidente de Equipo", equipment: "Equipo", selectEquipment: "Seleccionar equipo...", describeProblem: "Describir el problema", descriptionPlaceholder: "ej., La banda se desliza...", submitReport: "Enviar Reporte", alert: "Por favor llena todos los campos" },
        equipment: { title: "Gestión de Equipamiento", newEquipment: "Nuevo Equipo", activeIncidents: "Incidentes Activos", unknownEquipment: "Equipo Desconocido", markResolved: "Marcar Resuelto", headers: { name: "NOMBRE", type: "TIPO", status: "ESTADO" }, modal: { editTitle: "Editar Equipo", addTitle: "Añadir Equipo", name: "Nombre", type: "Tipo", typePlaceholder: "ej. Cardio", location: "Ubicación", locationPlaceholder: "ej. Zona A", status: "Estado", save: "Guardar", cancel: "Cancelar" }, confirmDelete: "¿Estás seguro de que quieres eliminar este equipo?" }
      },
      equipmentTypes: { Cardio: "Cardio", Strength: "Fuerza", "Free Weights": "Peso Libre", Machine: "Máquina" },
      classSchedule: { calendar: "Calendario", list: "Lista", today: "HOY", more: "más", modal: { edit: "Editar Clase", new: "Nueva Clase", desc: "Configurar detalles de la clase", name: "Nombre de Clase", namePlaceholder: "ej. HIIT", description: "Descripción", descPlaceholder: "Enfoque de la clase...", trainer: "Entrenador", date: "Fecha", capacity: "Capacidad", start: "Hora Inicio", end: "Hora Fin" } },
      pos: { products: "Productos", currentSale: "Venta Actual", searchClient: "Buscar Cliente...", emptyCart: "Carrito vacío", total: "Total", checkout: "Cobrar", saleSuccess: "¡Venta Completada!", totalCharged: "Total Cobrado", selectUserAlert: "Por favor selecciona un usuario primero" },
      booking: { noClasses: "No se encontraron clases para los filtros seleccionados." }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 font-bold">GymPro Loading...</div>}>
    <App />
  </Suspense>
);
