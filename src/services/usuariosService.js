import { supabase } from '../config/supabase';

// Obtener todos los usuarios
export const getUsuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

// Obtener usuario por cédula
export const getUsuarioByCc = async (cc) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cc', cc)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener usuario por cédula:', error);
    throw error;
  }
};

// Crear nuevo usuario
export const createUsuario = async (usuario) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Actualizar usuario
export const updateUsuario = async (id, usuario) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUsuario = async (id) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};
