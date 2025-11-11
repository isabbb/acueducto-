import { supabase } from '../config/supabase';

// Obtener todas las solicitudes con información relacionada
export const getSolicitudes = async () => {
  try {
    // Primero obtener todas las solicitudes
    const { data: solicitudes, error: solicitudesError } = await supabase
      .from('solicitudes')
      .select('*')
      .order('created_at', { ascending: false });

    if (solicitudesError) throw solicitudesError;

    // Obtener matrículas, predios y usuarios
    const { data: matriculas } = await supabase.from('matriculas').select('*');
    const { data: predios } = await supabase.from('predios').select('*');
    const { data: usuarios } = await supabase.from('usuarios').select('*');

    // Crear mapas para búsqueda rápida
    const matriculasMap = new Map(matriculas?.map(m => [m.cod_matricula, m]) || []);
    const prediosMap = new Map(predios?.map(p => [p.id, p]) || []);
    const usuariosMap = new Map(usuarios?.map(u => [u.cc, u]) || []);

    // Enriquecer solicitudes con datos relacionados
    const solicitudesEnriquecidas = solicitudes?.map(solicitud => {
      const matricula = matriculasMap.get(solicitud.cod_matricula);
      const predio = matricula ? prediosMap.get(matricula.id_predio) : null;
      const usuario = predio ? usuariosMap.get(predio.propietario_cc) : null;

      return {
        ...solicitud,
        direccion: predio?.direccion || '',
        propietario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : '',
        propietario_cc: predio?.propietario_cc || '',
        matricula,
        predio,
        usuario
      };
    }) || [];

    return solicitudesEnriquecidas;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
};

// Obtener solicitud por ID
export const getSolicitudById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    throw error;
  }
};

// Obtener solicitudes por matrícula
export const getSolicitudesByMatricula = async (codMatricula) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('cod_matricula', codMatricula)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener solicitudes por matrícula:', error);
    throw error;
  }
};

// Obtener solicitudes pendientes
export const getSolicitudesPendientes = async () => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('estado', 'Pendiente')
      .order('prioridad', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    throw error;
  }
};

// Obtener solicitudes por prioridad
export const getSolicitudesByPrioridad = async (prioridad) => {
  try {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('prioridad', prioridad)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener solicitudes por prioridad:', error);
    throw error;
  }


};
