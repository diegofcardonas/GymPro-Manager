
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
        user: "Client-User",
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
        users: "Client-Users",
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
        account: "Account"
      },
      admin: {
        dashboard: { notifications: "Notifications", settings: "Settings", classSchedule: "Class Schedule", routineTemplates: "Routine Templates" },
        userManagement: { searchPlaceholder: "Search users...", allTrainers: "All Trainers", selectPlaceholder: "Select..." },
        userEditor: {
          tabs: { personal: "Personal", membership: "Membership & Role", fitness: "Fitness Profile" },
          fields: { tier: "Membership Tier", expiration: "Expiration Date", goals: "Fitness Goals", medical: "Medical Conditions" }
        },
        reports: { title: "Reports & Analytics", trainerLoad: "Trainer Load", clients: "Clients", expirationForecast: "Expiration Forecast", expiringMemberships: "Expiring Memberships", demographicsGender: "Demographics by Gender", demographicsLevel: "Demographics by Level", notSet: "Not Set" },
        appSettings: { title: "Application Settings", notifications: "Notifications", emailTemplate: "Email Template", emailTemplateDefault: "Welcome to GymPro...", expiryReminder: "Expiry Reminder", expiryReminderDefault: "Your membership is expiring...", saveTemplates: "Save Templates", system: "System", maintenanceMode: "Maintenance Mode", maintenanceModeDesc: "Prevents non-admin users from logging in.", successMessage: "{{section}} saved successfully." },
        userDetailsModal: { keyInfo: "Key Information", status: "Status", tier: "Tier", clientLoad: "Client Load", clientsCount: "{{count}} Active Clients", memberSince: "Member Since", expiresOn: "Expires On", assignedTrainers: "Assigned Trainers", none: "None", personalInfo: "Personal Info", phone: "Phone", gender: "Gender", age: "Age", ageYears: "{{age}} years", healthFitness: "Health & Fitness", fitnessLevel: "Fitness Level", height: "Height", heightCm: "{{height}} cm", weight: "Weight", weightKg: "{{weight}} kg", fitnessGoals: "Fitness Goals", dietaryPreferences: "Dietary Preferences", medicalConditions: "Medical Conditions", professionalInfo: "Professional Info", skills: "Skills", emergencyContact: "Emergency Contact", name: "Name", close: "Close", editUser: "Edit User", notApplicable: "N/A" },
        finances: { title: "Financial Overview", tabs: { overview: "Overview", transactions: "Transactions", budgets: "Budgets", reports: "Reports" }, stats: { netProfit: "Net Profit", totalIncome: "Total Income", totalExpenses: "Total Expenses", cashFlow: "Cash Flow" } }
      },
      finance: {
        categories: { Rent: "Rent", Salaries: "Salaries", Utilities: "Utilities", Marketing: "Marketing", Equipment: "Equipment", Maintenance: "Maintenance", Sales: "Sales", POS_SALE: "POS Sale", Other: "Other" }
      },
      auth: { login: "Log In", signup: "Sign Up", name: "Full Name", email: "Email Address", password: "Password", forgotPassword: "Forgot password?", dontHaveAccount: "Don't have an account?", alreadyHaveAccount: "Already have an account?", demoAccess: "Demo Access", errorMissingFields: "Please fill all fields", errorUnexpected: "An unexpected error occurred" },
      client: {
        dashboard: { welcome: "Hello, {{name}}!", daysLeft: "You have {{count}} membership days left.", startTraining: "Start Training", viewClasses: "View Classes", aiQuote: "Daily AI Motivation", endDate: "Expires" },
        sidebar: { home: "Home", training: "Training", community: "Community", account: "Account", routine: "Routine", classes: "Classes", profile: "Profile", 'membership-card': "Digital Card" },
        social: { feed: "Social Feed", ranking: "Leaderboard", placeholder: "Share your progress, {{name}}...", photoVideo: "Photo/Video", post: "Post", workouts: "workouts", points: "pts", noPosts: "No posts yet. Be the first!" },
        workout: { restDay: "Rest Day!", noRoutine: "You don't have a routine for today, but you can train freestyle if you feel energetic.", freestyle: "Freestyle Training", preparePlayer: "PREPARE PLAYER ⚡", exercisesConfigured: "{{count}} EXERCISES CONFIGURED", selectExercise: "Select Exercise...", addSet: "ADD SET", saveManual: "SAVE MANUALLY 💾", goal: "Goal" },
        progress: { title: "My Evolution", subtitle: "Keep track of your physical progress", maxWeight: "Max Weight", maxVolume: "Total Volume", est1rm: "Est. 1RM", totalSessions: "Total Sessions", strengthTrend: "Strength Trend", trainingVolume: "Training Volume", monthlyConsistency: "Monthly Consistency", recentHistory: "Recent History", exercisesLogged: "exercises logged", noData: "No data yet", noDataDesc: "Start logging your workouts to see your progress charts." },
        nutrition: { title: "AI Nutrition Log", uploadDesc: "Upload meal photo", description: "Meal description", preciseDesc: "Be as precise as possible (e.g. 200g chicken, 1 cup rice...)", analyze: "Analyze with AI", protein: "Protein", carbs: "Carbohydrates", fat: "Fats", aiAnalysis: "AI Analysis", empty: "No logs yet. Upload your first meal!", photoMeal: "Meal analyzed by photo" },
        aiGenerator: { title: "Smart Workout Builder", promptPlaceholder: "E.g. I have 45 mins, dumbbells only, leg focus.", generate: "Build AI Routine", disclaimer: "AI can make mistakes. Listen to your body.", suggested: "Suggestions", loading: "Designing your perfect session...", addToLog: "Use this routine" }
      },
      trainer: {
        sidebar: { summary: "Summary", management: "Management", communication: "Communication", account: "Account", dashboard: "Dashboard", tasks: "Tasks", clients: "Clients", schedule: "Schedule", templates: "Templates", messages: "Messages", profile: "Profile", notifications: "Notifications", settings: "Settings" }
      },
      receptionist: { title: "Reception", nav: { checkIn: "Check-In", users: "Users", pos: "POS", tasks: "Tasks" }, cameraError: "Could not access camera", qrTip: "Align QR code within the frame", success: "Check-in Successful", welcome: "Welcome, {{name}}", scanQR: "Scan QR", noMembersFound: "No members found" },
      manager: { title: "General Manager", overview: "Overview", staff: "Staff", financials: "Financials", revenue: "Total Revenue", mrr: "MRR", activeMembers: "Active Members", staffCount: "Staff Count", revenueTrend: "Revenue Trend", financialsPlaceholder: "Detailed financial reports and projections." },
      instructor: { title: "Instructor", myClasses: "My Classes", attendees: "Attendees", noSignups: "No signups yet" },
      nutritionist: { title: "Nutritionist", nav: { clients: "Clients", logs: "Logs" }, clients: "Clients", goals: "Goals", dietary: "Dietary", viewLogs: "View Logs", allClients: "All Clients", nutritionLogs: "Nutrition Logs", aiAnalysis: "AI Analysis", protein: "Prot", carbs: "Carbs", fat: "Fat", noLogsYet: "No logs yet", selectClient: "Select a client to view logs" },
      physio: { title: "Physiotherapist", nav: { patients: "Patients", notes: "Notes" }, patients: "Patients", conditions: "Conditions", noneReported: "None reported", medicalInfo: "Medical Info", progressNotes: "Progress Notes", noNotesYet: "No notes yet", addNotePlaceholder: "Add a progress note...", selectPatient: "Select a patient to view details", noteAddedSuccess: "Note added successfully" },
      roles: { ADMIN: "Administrator", CLIENT: "Client", TRAINER: "Trainer", RECEPTIONIST: "Receptionist", GENERAL_MANAGER: "Manager", GROUP_INSTRUCTOR: "Instructor", NUTRITIONIST: "Nutritionist", PHYSIOTHERAPIST: "Physio" },
      statuses: { membership: { ACTIVE: "Active", EXPIRED: "Expired", PENDING: "Pending" }, equipment: { OPERATIONAL: "Operational", IN_REPAIR: "In Repair", OUT_OF_SERVICE: "Out of Service" } },
      enums: {
        Role: { ADMIN: "Administrator", CLIENT: "Client", TRAINER: "Trainer", RECEPTIONIST: "Receptionist", GENERAL_MANAGER: "Manager", GROUP_INSTRUCTOR: "Instructor", NUTRITIONIST: "Nutritionist", PHYSIOTHERAPIST: "Physio" },
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
      legal: {
        privacy: { title: "Privacy Policy", lastUpdate: "Last update: August 2024", intro: "At GymPro Manager, your health and fitness data privacy is our priority. This policy explains how we handle your information.", section1Title: "1. Data Collection", section1Content: "We collect profile information (name, age, weight, height), workout logs, meal photos for nutritional analysis, and biometric data necessary for your physical tracking.", section2Title: "2. Use of Artificial Intelligence", section2Content: "We use the Google Gemini API to process your queries to the AI Coach, analyze meal photos, and exercise technique. Your data is sent securely and is not used to train external public models without your explicit consent.", section3Title: "3. Data Security", section3Content: "We implement end-to-end encryption in your messages and secure storage in local and cloud databases with restricted access.", section4Title: "4. Your Rights", section4Content: "You have the right to access, rectify, or delete your data at any time from your account's Settings section." },
        terms: { title: "Terms of Use", lastUpdate: "Last update: August 2024", section1Title: "1. Medical Disclaimer", section1Content: "GymPro Manager provides AI-based suggestions. We are not a substitute for professional medical advice. Always consult a physician before starting any intense exercise program.", section2Title: "2. Platform Usage", section2Content: "The user is responsible for maintaining account confidentiality. Any misuse of the community or messaging system will result in immediate suspension.", section3Title: "3. Payments and Subscriptions", section3Content: "Memberships are charged according to the selected tier. Cancellations must be made at least 5 days prior to the next billing cycle.", section4Title: "4. Intellectual Property", section4Content: "All content, algorithms, and designs within GymPro Manager are company property or used under license." }
      },
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
        user: "Usuario-Cliente",
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
        users: "Usuarios-Clientes",
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
        account: "Cuenta"
      },
      admin: {
        dashboard: { notifications: "Notificaciones", settings: "Ajustes", classSchedule: "Agenda de Clases", routineTemplates: "Plantillas de Rutina" },
        userManagement: { searchPlaceholder: "Buscar usuarios...", allTrainers: "Todos los Entrenadores", selectPlaceholder: "Seleccionar..." },
        userEditor: {
          tabs: { personal: "Personal", membership: "Membresía y Rol", fitness: "Perfil Fitness" },
          fields: { tier: "Nivel de Membresía", expiration: "Vencimiento", goals: "Objetivos de Fitness", medical: "Condiciones Médicas" }
        },
        reports: { title: "Reportes y Analíticas", trainerLoad: "Carga de Entrenadores", clients: "Clientes", expirationForecast: "Pronóstico de Vencimientos", expiringMemberships: "Membresías por Vencer", demographicsGender: "Demografía por Género", demographicsLevel: "Demografía por Nivel", notSet: "No definido" },
        appSettings: { title: "Ajustes de la Aplicación", notifications: "Notificaciones", emailTemplate: "Plantilla de Correo", emailTemplateDefault: "Bienvenido a GymPro...", expiryReminder: "Recordatorio de Vencimiento", expiryReminderDefault: "Tu membresía está por vencer...", saveTemplates: "Guardar Plantillas", system: "Sistema", maintenanceMode: "Modo Mantenimiento", maintenanceModeDesc: "Evita que los usuarios no administradores inicien sesión.", successMessage: "{{section}} guardado con éxito." },
        userDetailsModal: { keyInfo: "Información Clave", status: "Estado", tier: "Nivel", clientLoad: "Carga de Clientes", clientsCount: "{{count}} Clientes Activos", memberSince: "Miembro Desde", expiresOn: "Vence El", assignedTrainers: "Entrenadores Asignados", none: "Ninguno", personalInfo: "Información Personal", phone: "Teléfono", gender: "Género", age: "Edad", ageYears: "{{age}} años", healthFitness: "Salud y Fitness", fitnessLevel: "Nivel de Fitness", height: "Altura", heightCm: "{{height}} cm", weight: "Peso", weightKg: "{{weight}} kg", fitnessGoals: "Objetivos", dietaryPreferences: "Preferencias Dietarias", medicalConditions: "Condiciones Médicas", professionalInfo: "Información Profesional", skills: "Habilidades", emergencyContact: "Contacto de Emergencia", name: "Nombre", close: "Cerrar", editUser: "Editar Usuario", notApplicable: "N/A" },
        finances: { title: "Resumen Financiero", tabs: { overview: "Resumen", transactions: "Transacciones", budgets: "Presupuestos", reports: "Reportes" }, stats: { netProfit: "Ganancia Neta", totalIncome: "Ingresos Totales", totalExpenses: "Gastos Totales", cashFlow: "Flujo de Caja" } }
      },
      finance: {
        categories: { Rent: "Arriendo", Salaries: "Nómina", Utilities: "Servicios", Marketing: "Marketing", Equipment: "Equipamiento", Maintenance: "Mantenimiento", Sales: "Ventas", POS_SALE: "Punto de Venta", Other: "Otros" }
      },
      auth: { login: "Iniciar Sesión", signup: "Registrarse", name: "Nombre Completo", email: "Correo Electrónico", password: "Contraseña", forgotPassword: "¿Olvidaste tu contraseña?", dontHaveAccount: "¿No tienes cuenta?", alreadyHaveAccount: "¿Ya tienes cuenta?", demoAccess: "Acceso Demo", errorMissingFields: "Por favor llena todos los campos", errorUnexpected: "Ocurrió un error inesperado" },
      client: {
        dashboard: { welcome: "¡Hola, {{name}}!", daysLeft: "Te quedan {{count}} días de membresía.", startTraining: "Empezar a Entrenar", viewClasses: "Ver Clases", aiQuote: "Motivación Diaria IA", endDate: "Vence" },
        sidebar: { home: "Inicio", training: "Entrenamiento", community: "Comunidad", account: "Cuenta", routine: "Rutina", classes: "Clases", profile: "Perfil", 'membership-card': "Tarjeta Digital" },
        social: { feed: "Muro Social", ranking: "Ranking del Mes", placeholder: "Comparte tu progreso, {{name}}...", photoVideo: "Foto/Video", post: "Publicar", workouts: "entrenos", points: "pts", noPosts: "Aún no hay publicaciones. ¡Sé el primero!" },
        workout: { restDay: "¡Día de Descanso!", noRoutine: "No tienes rutina para hoy, pero puedes entrenar libre si tienes energía.", freestyle: "Entrenamiento Libre", preparePlayer: "PREPARAR PLAYER ⚡", exercisesConfigured: "{{count}} EJERCICIOS CONFIGURADOS", selectExercise: "Seleccionar Ejercicio...", addSet: "AÑADIR SERIE", saveManual: "GUARDAR MANUALMENTE 💾", goal: "Meta" },
        progress: { title: "Mi Evolución", subtitle: "Lleva el control de tu progreso físico", maxWeight: "Peso Máximo", maxVolume: "Volumen Total", est1rm: "1RM Est.", totalSessions: "Sesiones Totales", strengthTrend: "Tendencia de Fuerza", trainingVolume: "Volumen de Entrenamiento", monthlyConsistency: "Consistencia Mensual", recentHistory: "Historial Reciente", exercisesLogged: "ejercicios reg.", noData: "Sin datos aún", noDataDesc: "Empieza a registrar tus entrenamientos para ver tus gráficas." },
        nutrition: { title: "Registro Nutrición IA", uploadDesc: "Subir foto de comida", description: "Descripción de la comida", preciseDesc: "Sé lo más preciso posible (ej. 200g pollo, 1 taza arroz...)", analyze: "Analizar con IA", protein: "Proteína", carbs: "Carbohidratos", fat: "Grasas", aiAnalysis: "Análisis IA", empty: "Sin registros. ¡Sube tu primera comida!", photoMeal: "Comida analizada por foto" },
        aiGenerator: { title: "Smart Workout Builder", promptPlaceholder: "Ej: Tengo 45 min, solo mancuernas, enfoque en pierna.", generate: "Construir Rutina IA", disclaimer: "La IA puede cometer errores. Escucha a tu cuerpo.", suggested: "Sugerencias", loading: "Diseñando tu sesión perfecta...", addToLog: "Usar esta rutina" }
      },
      trainer: {
        sidebar: { summary: "Resumen", management: "Gestión", communication: "Comunicación", account: "Cuenta", dashboard: "Inicio", tasks: "Tareas", clients: "Clientes", schedule: "Agenda", templates: "Plantillas", messages: "Mensajes", profile: "Perfil", notifications: "Notificaciones", settings: "Ajustes" }
      },
      receptionist: { title: "Recepción", nav: { checkIn: "Check-In", users: "Usuarios", pos: "POS", tasks: "Tareas" }, cameraError: "No se pudo acceder a la cámara", qrTip: "Alinea el código QR en el marco", success: "Ingreso Exitoso", welcome: "Bienvenido, {{name}}", scanQR: "Escanear QR", noMembersFound: "No se encontraron miembros" },
      manager: { title: "Gerencia General", overview: "Resumen", staff: "Personal", financials: "Finanzas", revenue: "Ingresos Totales", mrr: "MRR", activeMembers: "Miembros Activos", staffCount: "Personal", revenueTrend: "Tendencia de Ingresos", financialsPlaceholder: "Reportes financieros detallados y proyecciones." },
      instructor: { title: "Instructor", myClasses: "Mis Clases", attendees: "Asistentes", noSignups: "Sin inscritos aún" },
      nutritionist: { title: "Nutricionista", nav: { clients: "Clientes", logs: "Registros" }, clients: "Clientes", goals: "Objetivos", dietary: "Dieta", viewLogs: "Ver Registros", allClients: "Todos los Clientes", nutritionLogs: "Registros de Nutrición", aiAnalysis: "Análisis IA", protein: "Prot", carbs: "Carbs", fat: "Grasa", noLogsYet: "Sin registros aún", selectClient: "Selecciona un cliente para ver registros" },
      physio: { title: "Fisioterapeuta", nav: { patients: "Pacientes", notes: "Notas" }, patients: "Pacientes", conditions: "Condiciones", noneReported: "Ninguna reportada", medicalInfo: "Info Médica", progressNotes: "Notas de Progreso", noNotesYet: "Sin notas aún", addNotePlaceholder: "Añadir nota de progreso...", selectPatient: "Selecciona un paciente para ver detalles", noteAddedSuccess: "Nota añadida exitosamente" },
      roles: { ADMIN: "Administrador", CLIENT: "Cliente", TRAINER: "Entrenador", RECEPTIONIST: "Recepcionista", GENERAL_MANAGER: "Gerente", GROUP_INSTRUCTOR: "Instructor", NUTRITIONIST: "Nutricionista", PHYSIOTHERAPIST: "Fisio" },
      statuses: { membership: { ACTIVE: "Activo", EXPIRED: "Vencido", PENDING: "Pendiente" }, equipment: { OPERATIONAL: "Operativo", IN_REPAIR: "En Reparación", OUT_OF_SERVICE: "Fuera de Servicio" } },
      enums: {
        Role: { ADMIN: "Administrador", CLIENT: "Cliente", TRAINER: "Entrenador", RECEPTIONIST: "Recepcionista", GENERAL_MANAGER: "Gerente", GROUP_INSTRUCTOR: "Instructor", NUTRITIONIST: "Nutricionista", PHYSIOTHERAPIST: "Fisio" },
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
      legal: {
        privacy: { title: "Política de Privacidad", lastUpdate: "Última actualización: Agosto 2024", intro: "En GymPro Manager, la privacidad de tus datos de salud y fitness es nuestra prioridad. Esta política explica cómo manejamos tu información.", section1Title: "1. Datos que Recolectamos", section1Content: "Recolectamos información de perfil (nombre, edad, peso, altura), registros de entrenamiento, fotos de comidas para análisis nutricional y datos biométricos necesarios para tu seguimiento físico.", section2Title: "2. Uso de Inteligencia Artificial", section2Content: "Utilizamos la API de Google Gemini para procesar tus consultas al Coach IA, analizar fotos de comida y técnica de ejercicios. Tus datos se envían de forma segura y no se utilizan para entrenar modelos públicos externos sin tu consentimiento explícito.", section3Title: "3. Seguridad de los Datos", section3Content: "Implementamos cifrado de extremo a extremo en tus mensajes y almacenamiento seguro en bases de datos locales y en la nube con acceso restringido.", section4Title: "4. Tus Derechos", section4Content: "Tienes derecho a acceder, rectificar o eliminar tus datos en cualquier momento desde la sección de Ajustes de tu cuenta." },
        terms: { title: "Términos de Uso", lastUpdate: "Última actualización: Agosto 2024", section1Title: "1. Advertencia Médica", section1Content: "GymPro Manager proporciona sugerencias basadas en IA. No somos un sustituto de asesoramiento médico profesional. Siempre consulta a un médico antes de iniciar cualquier programa de ejercicio intenso.", section2Title: "2. Uso de la Plataforma", section2Content: "El usuario es responsable de mantener la confidencialidad de su cuenta. Cualquier uso indebido del sistema de comunidad o mensajes resultará en la suspensión inmediata.", section3Title: "3. Pagos y Suscripciones", section3Content: "Las membresías se cobran según el nivel seleccionado. Las cancelaciones deben realizarse con al menos 5 días de antelación al próximo ciclo de facturación.", section4Title: "4. Propiedad Intelectual", section4Content: "Todo el contenido, algoritmos y diseños dentro de GymPro Manager son propiedad de la empresa o se usan bajo licencia." }
      },
      footer: { privacy: "Política de Privacidad", terms: "Términos de Uso", support: "Soporte Técnico" },
      support: { categories: { technical: "Fallo Técnico", billing: "Facturación", equipment: "Equipo Dañado", suggestion: "Sugerencia" } },
      components: {
        languageSwitcher: { language: "Idioma", english: "Inglés", spanish: "Español" },
        settingsView: {
          title: "Ajustes", appearance: "Apariencia", languageDesc: "Elige tu idioma preferido.", darkMode: "Modo Oscuro", darkModeDesc: "Cambiar entre tema claro y oscuro.", theme: "Tema de Color", accountSecurity: "Seguridad de la Cuenta", authErrorLogin: "Debes iniciar sesión para cambiar tu contraseña.", passwordErrorCurrent: "Contraseña actual incorrecta.", passwordErrorMatch: "Las nuevas contraseñas no coinciden.", passwordErrorLength: "La contraseña debe tener al menos 8 caracteres.", passwordSuccess: "Contraseña actualizada exitosamente.", currentPassword: "Contraseña Actual", newPassword: "Nueva Contraseña", confirmNewPassword: "Confirmar Nueva Contraseña", changePassword: "Cambiar Contraseña",
          privacyNotifications: "Privacidad y Notificaciones", privacySettings: "Ajustes de Privacidad", profileVisibility: "Visibilidad del Perfil", profileVisibilityDesc: "Controla quién puede ver tu perfil.", activityVisibility: "Visibilidad de Actividad", activityVisibilityDesc: "Controla quién puede ver tus entrenamientos.", showInSearch: "Mostrar en Búsqueda", showInSearchDesc: "Permitir que otros te encuentren por nombre.",
          notificationPreferences: "Preferencias de Notificación", newMessages: "Nuevos Mensajes", newMessagesDesc: "Notificar cuando recibas un mensaje.", routineUpdates: "Actualizaciones de Rutina", routineUpdatesDesc: "Notificar cuando tu entrenador actualice tu rutina.",
          blockedUsers: "Usuarios Bloqueados", unblock: "Desbloquear", noBlockedUsers: "No hay usuarios bloqueados.", dangerZone: "Zona de Peligro", deactivateAccount: "Desactivar Cuenta", deactivateAccountDesc: "Deshabilitar temporalmente tu cuenta.", deactivate: "Desactivar", resetUsers: "Restablecer Datos", resetUsersDesc: "Restablecer todos los datos de demostración.", reset: "Restablecer", confirmDeactivation: "¿Estás seguro de que quieres desactivar tu cuenta? Puedes reactivarla iniciando sesión nuevamente.", confirmResetUsers: "Esto restablecerá todos los datos de usuario al estado inicial de demostración. Esta acción no se puede deshacer.",
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
  <React.StrictMode>
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 font-bold">GymPro Loading...</div>}>
      <App />
    </Suspense>
  </React.StrictMode>
);
