import { createClient } from '@supabase/supabase-js';

// Obtener las credenciales de las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las credenciales existen
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las credenciales de Supabase en el archivo .env');
  console.error('Asegúrate de tener:');
  console.error('VITE_SUPABASE_URL=tu-url-aqui');
  console.error('VITE_SUPABASE_ANON_KEY=tu-key-aqui');
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Exportar también las credenciales por si se necesitan
export { supabaseUrl, supabaseAnonKey };
