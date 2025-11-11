import { supabase } from '../config/supabase';

// Obtener todos los predios con información del propietario
export const getPredios = async () => {
  try {
    // Obtener predios
    const { data: predios, error: prediosError } = await supabase
      .from('predios')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (prediosError) throw prediosError;

    // Obtener usuarios
    const { data: usuarios } = await supabase.from('usuarios').select('*');
    const usuariosMap = new Map(usuarios?.map(u => [u.cc, u]) || []);

    // Enriquecer predios con información del propietario
    const prediosEnriquecidos = predios?.map(predio => {
      const usuario = usuariosMap.get(predio.propietario_cc);
      
      return {
        ...predio,
        propietario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : '',
        propietario: usuario
      };
    }) || [];

    return prediosEnriquecidos;
  } catch (error) {
    console.error('Error al obtener predios:', error);
    throw error;
  }
};

// Obtener predio por ID
export const getPredioById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('predios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener predio:', error);
    throw error;
  }
};

// Obtener predios por propietario
export const getPrediosByPropietario = async (propietarioCc) => {
  try {
    const { data, error } = await supabase
      .from('predios')
      .select('*')
      .eq('propietario_cc', propietarioCc);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener predios por propietario:', error);
    throw error;
  }
};

