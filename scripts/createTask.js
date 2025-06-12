// Cada tarea tiene un id, título y estado completado
const createTask = (title) => ({
  id: Date.now().toString(),          // id sencillo y único
  title,
  done: false,
});
