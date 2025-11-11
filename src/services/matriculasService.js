import { supabase } from '../config/supabase';

// Obtener todas las matrículas con información del predio y propietario
export const getMatriculas = async () => {
  try {
    // Obtener matrículas
    const { data: matriculas, error: matriculasError } = await supabase
      .from('matriculas')
      .select('*')
      .order('fecha', { ascending: false });

    if (matriculasError) throw matriculasError;

    // Obtener datos relacionados
    const { data: predios } = await supabase.from('predios').select('*');
    const { data: usuarios } = await supabase.from('usuarios').select('*');

    // Crear mapas
    const prediosMap = new Map(predios?.map(p => [p.id, p]) || []);
    const usuariosMap = new Map(usuarios?.map(u => [u.cc, u]) || []);

    // Enriquecer matrículas
    const matriculasEnriquecidas = matriculas?.map(matricula => {
      const predio = prediosMap.get(matricula.id_predio);
      const usuario = predio ? usuariosMap.get(predio.propietario_cc) : null;

      return {
        ...matricula,
        direccion: predio?.direccion || '',
        propietario_cc: predio?.propietario_cc || '',
        propietario_nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : '',
        tipo_predio: predio?.tipo || '',
        predio,
        usuario
      };
    }) || [];

    return matriculasEnriquecidas;
  } catch (error) {
    console.error('Error al obtener matrículas:', error);
    throw error;
  }
};

// Obtener matrícula por ID
export const getMatriculaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener matrícula:', error);
    throw error;
  }
};

// Obtener matrícula por código
export const getMatriculaByCodigo = async (codMatricula) => {
  try {
    const { data, error } = await supabase
      .from('matriculas')
      .select('*')
      .eq('cod_matricula', codMatricula)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener matrícula por código:', error);
    throw error;
  }
};

// Crear nueva matrícula
export const createMatricula = async (matricula) => {
  try {
    const { data, error } = await supabase
      .from('matriculas')
      .insert([matricula])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear matrícula:', error);
    throw error;
  }
};

// Actualizar matrícula
export const updateMatricula = async (id, matricula) => {
  try {
    const { data, error } = await supabase
      .from('matriculas')
      .update(matricula)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar matrícula:', error);
    throw error;
  }
};

// Eliminar matrícula
export const deleteMatricula = async (id) => {
  try {
    const { error } = await supabase
      .from('matriculas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar matrícula:', error);
    throw error;
  }
};
