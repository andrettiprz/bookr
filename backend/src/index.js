// Backend principal - Azure Functions v4
// Este archivo es el punto de entrada que registra todas las funciones

// Importar funciones de autenticación
require('./functions/auth');

// Importar funciones de reservaciones
require('./functions/reservations');

console.log('✅ Bookr API - Funciones registradas correctamente');

