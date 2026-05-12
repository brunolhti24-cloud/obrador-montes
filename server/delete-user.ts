import { db } from './db.js';

async function deleteUserByEmail(email: string) {
  try {
    console.log(`Buscando usuario: ${email}...`);
    const users = await db.list('users');
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log(`❌ Error: Usuario con email "${email}" no encontrado en la base de datos.`);
      return;
    }
    
    await db.delete('users', user.id);
    console.log(`✅ Éxito: Usuario "${email}" (ID: ${user.id}) eliminado correctamente.`);
  } catch (error) {
    console.error('Ocurrió un error al intentar eliminar:', error);
  }
}

const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.log('⚠️ Por favor proporciona un correo electrónico.');
  console.log('👉 Uso correcto: npx tsx server/delete-user.ts <correo>');
  console.log('Ejemplo: npx tsx server/delete-user.ts prueba@ejemplo.com');
} else {
  deleteUserByEmail(emailToDelete);
}
