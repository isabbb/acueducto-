import { supabase } from '../config/supabase';

// Obtener todas las facturas con información relacionada
export const getFacturas = async () => {
  try {
    // Obtener facturas
    const { data: facturas, error: facturasError } = await supabase
      .from('facturas')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (facturasError) throw facturasError;

    // Obtener datos relacionados
    const { data: matriculas } = await supabase.from('matriculas').select('*');
    const { data: predios } = await supabase.from('predios').select('*');
    const { data: usuarios } = await supabase.from('usuarios').select('*');

    // Crear mapas
    const matriculasMap = new Map(matriculas?.map(m => [m.cod_matricula, m]) || []);
    const prediosMap = new Map(predios?.map(p => [p.id, p]) || []);
    const usuariosMap = new Map(usuarios?.map(u => [u.cc, u]) || []);

    // Enriquecer facturas con cálculos de mora y valores acumulados
    const facturasEnriquecidas = facturas?.map(factura => {
      const matricula = matriculasMap.get(factura.cod_matricula);
      const predio = matricula ? prediosMap.get(matricula.id_predio) : null;
      const usuario = predio ? usuariosMap.get(predio.propietario_cc) : null;

      // Calcular días vencidos y meses atrasados
      const fechaVencimiento = new Date(factura.fecha_vencimiento);
      const fechaActual = new Date();
      const diasVencido = Math.max(0, Math.floor((fechaActual - fechaVencimiento) / (1000 * 60 * 60 * 24)));
      const mesesAtrasados = Math.floor(diasVencido / 30);

      // Calcular valores
      const valorMensual = parseFloat(factura.valor) || 0;
      const valorMesesAtrasados = mesesAtrasados * valorMensual;
      const valorTotal = valorMensual + valorMesesAtrasados;

      return {
        ...factura,
        cedula: usuario?.cc || predio?.propietario_cc || '',
        propietario: usuario ? `${usuario.nombre} ${usuario.apellido}` : '',
        direccion: predio?.direccion || '',
        telefono: usuario?.telefono || '',
        correo: usuario?.correo || '',
        // Campos calculados
        dias_vencido: diasVencido,
        meses_atrasados: mesesAtrasados,
        valor_mensual: valorMensual,
        valor_meses_atrasados: valorMesesAtrasados,
        valor_total: valorTotal,
        // Objetos relacionados
        matricula,
        predio,
        usuario
      };
    }) || [];

    return facturasEnriquecidas;
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    throw error;
  }
};

// Obtener factura por ID
export const getFacturaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener factura:', error);
    throw error;
  }
};

// Obtener facturas por matrícula
export const getFacturasByMatricula = async (codMatricula) => {
  try {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('cod_matricula', codMatricula)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener facturas por matrícula:', error);
    throw error;
  }
};

// Obtener facturas vencidas
export const getFacturasVencidas = async () => {
  try {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('estado', 'Vencida')
      .order('fecha_vencimiento', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener facturas vencidas:', error);
    throw error;
  }
};

// Obtener facturas pendientes
export const getFacturasPendientes = async () => {
  try {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('estado', 'Pendiente')
      .order('fecha_vencimiento', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener facturas pendientes:', error);
    throw error;
  }
};
