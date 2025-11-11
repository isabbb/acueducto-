import { useState, useEffect, useMemo } from 'react';
import { getUsuarios } from '../services/usuariosService';
import { getPredios } from '../services/prediosService';
import { getMatriculas } from '../services/matriculasService';
import { getFacturas } from '../services/facturasService';
import { getSolicitudes } from '../services/solicitudesService';

export default function HomePage() {
  // Estado para manejar los datos y tipo de vista
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [dataType, setDataType] = useState('facturas');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [apiError, setApiError] = useState(null);

  // Configuración de tipos de datos y sus servicios
  const dataConfig = {
    usuarios: {
      service: getUsuarios,
      title: 'Usuarios Registrados',
      icon: '👥',
      color: 'blue',
      searchPlaceholder: 'Buscar por nombre, cédula, teléfono o correo...',
      columns: [
        { key: 'cc', label: 'Cédula', sortable: true },
        { key: 'nombre_completo', label: 'Nombre Completo', type: 'computed', sortable: true },
        { key: 'telefono', label: 'Teléfono', sortable: false },
        { key: 'correo', label: 'Correo', sortable: true },
        { key: 'fecha', label: 'Fecha Registro', type: 'date', sortable: true }
      ],
      searchFields: ['nombre', 'apellido', 'cc', 'correo', 'telefono']
    },
    predios: {
      service: getPredios,
      title: 'Predios Registrados',
      icon: '🏘️',
      color: 'emerald',
      searchPlaceholder: 'Buscar por dirección, propietario o tipo...',
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'direccion', label: 'Dirección', sortable: true },
        { key: 'propietario_nombre', label: 'Propietario', sortable: true },
        { key: 'telefono', label: 'Teléfono', sortable: false },
        { key: 'tipo', label: 'Tipo', type: 'badge', sortable: true },
        { key: 'fecha_registro', label: 'Fecha Registro', type: 'date', sortable: true }
      ],
      searchFields: ['direccion', 'propietario_cc', 'propietario_nombre', 'telefono', 'correo', 'tipo']
    },
    matriculas: {
      service: getMatriculas,
      title: 'Matrículas Registradas',
      icon: '📋',
      color: 'purple',
      searchPlaceholder: 'Buscar por código, dirección o propietario...',
      columns: [
        { key: 'cod_matricula', label: 'Código', sortable: true },
        { key: 'direccion', label: 'Dirección', sortable: true },
        { key: 'propietario_nombre', label: 'Propietario', sortable: true },
        { key: 'tipo_predio', label: 'Tipo', sortable: true },
        { key: 'estado', label: 'Estado', type: 'badge', sortable: true },
        { key: 'fecha', label: 'Fecha', type: 'date', sortable: true }
      ],
      searchFields: ['cod_matricula', 'direccion', 'propietario_nombre', 'tipo_predio', 'estado']
    },
    facturas: {
      service: getFacturas,
      title: 'Facturas del Sistema',
      icon: '💰',
      color: 'green',
      searchPlaceholder: 'Buscar por cédula, propietario, dirección o código...',
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'cedula', label: 'Cédula', sortable: true },
        { key: 'propietario', label: 'Propietario', sortable: true },
        { key: 'direccion', label: 'Dirección', sortable: true },
        { key: 'cod_matricula', label: 'Matrícula', sortable: true },
        { key: 'fecha_creacion', label: 'Fecha Creación', type: 'date', sortable: true },
        { key: 'fecha_vencimiento', label: 'Vencimiento', type: 'date', sortable: true },
        { key: 'valor_mensual', label: 'Valor Mensual', type: 'currency', sortable: true },
        { key: 'meses_atrasados', label: 'Meses Atrasados', sortable: true },
        { key: 'valor_total', label: 'Total a Pagar', type: 'currency', sortable: true },
        { key: 'estado', label: 'Estado', type: 'badge', sortable: true }
      ],
      searchFields: ['cedula', 'propietario', 'direccion', 'cod_matricula', 'estado']
    },
    solicitudes: {
      service: getSolicitudes,
      title: 'Solicitudes de Mantenimiento',
      icon: '📝',
      color: 'indigo',
      searchPlaceholder: 'Buscar por código, dirección o propietario...',
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'cod_matricula', label: 'Matrícula', sortable: true },
        { key: 'direccion', label: 'Dirección', sortable: true },
        { key: 'propietario_nombre', label: 'Propietario', sortable: true },
        { key: 'estado', label: 'Estado', type: 'badge', sortable: true },
        { key: 'prioridad', label: 'Prioridad', type: 'badge', sortable: true },
        { key: 'observaciones', label: 'Observaciones', sortable: false }
      ],
      searchFields: ['id', 'cod_matricula', 'direccion', 'propietario_nombre', 'estado', 'prioridad']
    }
  };

  // Cargar datos según el tipo seleccionado
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const config = dataConfig[dataType];

        if (!config || !config.service) {
          setApiError(`Servicio no encontrado para ${dataType}`);
          setData([]);
          return;
        }

        const result = await config.service();
        const dataArray = Array.isArray(result) ? result : [];
        setData(dataArray);
        setCurrentPage(1); // Reset a la primera página al cambiar de tipo
      } catch (error) {
        console.error(`Error al cargar ${dataType}:`, error);
        setApiError(`No se pudieron cargar los ${dataType}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType]);

  // Función auxiliar para obtener valor de campo
  const getFieldValue = (item, fieldKey) => {
    let value = item[fieldKey];
    if (value !== undefined && value !== null && value !== '') return value;

    const alternativeFields = {
      'nombre_completo': () => {
        const nombre = item.nombre || '';
        const apellido = item.apellido || '';
        return `${nombre} ${apellido}`.trim();
      },
      'propietario': () => {
        if (item.propietario && typeof item.propietario === 'object') {
          return `${item.propietario.nombre || ''} ${item.propietario.apellido || ''}`.trim();
        }
        return item.propietario || item.propietario_nombre || '';
      },
      'propietario_nombre': () => {
        if (item.propietario && typeof item.propietario === 'object') {
          return `${item.propietario.nombre || ''} ${item.propietario.apellido || ''}`.trim();
        }
        return item.propietario_nombre || '';
      }
    };

    if (alternativeFields[fieldKey]) {
      return alternativeFields[fieldKey]();
    }

    return value;
  };

  // Renderizar valor de celda
  const renderCellValue = (item, column) => {
    try {
      if (!item || !column) return '-';
      let value = getFieldValue(item, column.key);

      // Caso especial para meses atrasados en facturas
      if (column.key === 'meses_atrasados' && dataType === 'facturas') {
        const meses = parseInt(value) || 0;
        if (meses === 0) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">
              ✓ Al día
            </span>
          );
        } else if (meses === 1) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
              ⚠ 1 mes
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
              🚨 {meses} meses
            </span>
          );
        }
      }

      switch (column.type) {
        case 'computed':
          return value || '-';
        case 'date':
          return value ? new Date(value).toLocaleDateString('es-ES') : '-';
        case 'currency':
          return value ? `$${parseFloat(value).toLocaleString('es-CO')}` : '$0';
        case 'badge':
          const badgeStyles = {
            'Activa': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Suspendida': 'bg-amber-100 text-amber-800 border-amber-200',
            'Cancelada': 'bg-red-100 text-red-800 border-red-200',
            'Pendiente': 'bg-orange-100 text-orange-800 border-orange-200',
            'Pagada': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Vencida': 'bg-red-100 text-red-800 border-red-200',
            'En Proceso': 'bg-blue-100 text-blue-800 border-blue-200',
            'Completado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Urgente': 'bg-red-100 text-red-800 border-red-200',
            'Alta': 'bg-orange-100 text-orange-800 border-orange-200',
            'Media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Baja': 'bg-gray-100 text-gray-800 border-gray-200',
            'Residencial': 'bg-blue-100 text-blue-800 border-blue-200',
            'Comercial': 'bg-purple-100 text-purple-800 border-purple-200',
            'Industrial': 'bg-slate-100 text-slate-800 border-slate-200'
          };
          const styleClass = badgeStyles[value] || 'bg-gray-100 text-gray-800 border-gray-200';
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass}`}>
              {value || '-'}
            </span>
          );
        default:
          return value !== null && value !== undefined ? value.toString() : '-';
      }
    } catch (error) {
      return '-';
    }
  };

  // Filtrar y ordenar datos
  const processedData = useMemo(() => {
    let filtered = [...data];
    const config = dataConfig[dataType];

    // Aplicar búsqueda
    if (searchTerm && config?.searchFields) {
      filtered = filtered.filter(item =>
        config.searchFields.some(field => {
          const value = getFieldValue(item, field);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Aplicar filtros específicos
    if (filterType !== 'todos') {
      if (dataType === 'matriculas') {
        if (filterType === 'activas') {
          filtered = filtered.filter(item => item.estado === 'Activa');
        } else if (filterType === 'suspendidas') {
          filtered = filtered.filter(item => item.estado === 'Suspendida');
        } else if (filterType === 'canceladas') {
          filtered = filtered.filter(item => item.estado === 'Cancelada');
        }
      } else if (dataType === 'facturas') {
        if (filterType === 'pendientes') {
          filtered = filtered.filter(item => item.estado === 'Pendiente');
        } else if (filterType === 'vencidas') {
          filtered = filtered.filter(item => item.estado === 'Vencida');
        }
      } else if (dataType === 'solicitudes' && filterType === 'pendientes') {
        filtered = filtered.filter(item => item.estado === 'Pendiente');
      }
    }

    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = getFieldValue(a, sortConfig.key);
        const bValue = getFieldValue(b, sortConfig.key);

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filterType, sortConfig, dataType]);

  // Paginación
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Manejar ordenamiento
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Obtener opciones de filtro
  const getFilterOptions = () => {
    const baseOptions = [{ value: 'todos', label: 'Todos' }];

    switch (dataType) {
      case 'matriculas':
        return [
          ...baseOptions,
          { value: 'activas', label: 'Activas' },
          { value: 'suspendidas', label: 'Suspendidas' },
          { value: 'canceladas', label: 'Canceladas' }
        ];
      case 'facturas':
        return [
          ...baseOptions,
          { value: 'pendientes', label: 'Pendientes' },
          { value: 'vencidas', label: 'Vencidas' }
        ];
      case 'solicitudes':
        return [...baseOptions, { value: 'pendientes', label: 'Pendientes' }];
      default:
        return baseOptions;
    }
  };

  // Estadísticas rápidas
  const stats = useMemo(() => {
    if (dataType === 'facturas') {
      const pendientes = data.filter(f => f.estado === 'Pendiente').length;
      const vencidas = data.filter(f => f.estado === 'Vencida').length;
      const totalDeuda = data
        .filter(f => f.estado !== 'Pagada')
        .reduce((sum, f) => sum + (parseFloat(f.valor_total) || 0), 0);
      return { pendientes, vencidas, totalDeuda };
    }
    return null;
  }, [data, dataType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Profesional */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Sistema de Acueducto
              </h1>
              <p className="text-blue-100 text-lg">Panel de Administración Integral</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
                <div className="text-xs opacity-80">Total Registros</div>
                <div className="text-2xl font-bold">{data.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tarjetas de Navegación Mejoradas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setDataType('usuarios')}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${dataType === 'usuarios'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
          >
            <div className="text-4xl mb-3">👥</div>
            <div className={`text-sm font-semibold ${dataType === 'usuarios' ? 'text-white' : 'text-gray-900'}`}>
              Usuarios
            </div>
            <div className={`text-2xl font-bold mt-1 ${dataType === 'usuarios' ? 'text-white' : 'text-blue-600'}`}>
              {data.length > 0 && dataType === 'usuarios' ? data.length : ''}
            </div>
          </button>

          <button
            onClick={() => setDataType('predios')}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${dataType === 'predios'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
          >
            <div className="text-4xl mb-3">🏘️</div>
            <div className={`text-sm font-semibold ${dataType === 'predios' ? 'text-white' : 'text-gray-900'}`}>
              Predios
            </div>
            <div className={`text-2xl font-bold mt-1 ${dataType === 'predios' ? 'text-white' : 'text-emerald-600'}`}>
              {data.length > 0 && dataType === 'predios' ? data.length : ''}
            </div>
          </button>

          <button
            onClick={() => setDataType('matriculas')}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${dataType === 'matriculas'
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
          >
            <div className="text-4xl mb-3">📋</div>
            <div className={`text-sm font-semibold ${dataType === 'matriculas' ? 'text-white' : 'text-gray-900'}`}>
              Matrículas
            </div>
            <div className={`text-2xl font-bold mt-1 ${dataType === 'matriculas' ? 'text-white' : 'text-purple-600'}`}>
              {data.length > 0 && dataType === 'matriculas' ? data.length : ''}
            </div>
          </button>

          <button
            onClick={() => setDataType('facturas')}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${dataType === 'facturas'
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
          >
            <div className="text-4xl mb-3">💰</div>
            <div className={`text-sm font-semibold ${dataType === 'facturas' ? 'text-white' : 'text-gray-900'}`}>
              Facturas
            </div>
            <div className={`text-2xl font-bold mt-1 ${dataType === 'facturas' ? 'text-white' : 'text-green-600'}`}>
              {data.length > 0 && dataType === 'facturas' ? data.length : ''}
            </div>
          </button>

          <button
            onClick={() => setDataType('solicitudes')}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${dataType === 'solicitudes'
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl'
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg'
              }`}
          >
            <div className="text-4xl mb-3">📝</div>
            <div className={`text-sm font-semibold ${dataType === 'solicitudes' ? 'text-white' : 'text-gray-900'}`}>
              Solicitudes
            </div>
            <div className={`text-2xl font-bold mt-1 ${dataType === 'solicitudes' ? 'text-white' : 'text-indigo-600'}`}>
              {data.length > 0 && dataType === 'solicitudes' ? data.length : ''}
            </div>
          </button>
        </div>

        {/* Estadísticas Rápidas para Facturas */}
        {dataType === 'facturas' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">Facturas Pendientes</div>
              <div className="text-3xl font-bold">{stats.pendientes}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">Facturas Vencidas</div>
              <div className="text-3xl font-bold">{stats.vencidas}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90 mb-1">Total Deuda</div>
              <div className="text-3xl font-bold">${stats.totalDeuda.toLocaleString('es-CO')}</div>
            </div>
          </div>
        )}

        {/* Panel de Tabla Profesional */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Barra de Herramientas */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${dataType === 'usuarios' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  dataType === 'predios' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    dataType === 'matriculas' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      dataType === 'facturas' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        'bg-gradient-to-br from-indigo-500 to-indigo-600'
                  }`}>
                  <span className="text-2xl">{dataConfig[dataType].icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{dataConfig[dataType].title}</h2>
                  <p className="text-sm text-gray-600">{processedData.length} registros encontrados</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Búsqueda */}
                <div className="relative flex-1 lg:w-80">
                  <input
                    type="text"
                    placeholder={dataConfig[dataType].searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Filtro */}
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  {getFilterOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                {/* Items por página */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : apiError ? (
              <div className="text-center py-20">
                <div className="text-red-500 text-lg mb-2">⚠️ Error</div>
                <p className="text-gray-600">{apiError}</p>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg">No se encontraron registros</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    {dataConfig[dataType].columns.map(column => (
                      <th
                        key={column.key}
                        onClick={() => column.sortable && handleSort(column.key)}
                        className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable && (
                            <span className="text-gray-400">
                              {sortConfig.key === column.key ? (
                                sortConfig.direction === 'asc' ? '↑' : '↓'
                              ) : '↕'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      {dataConfig[dataType].columns.map(column => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {renderCellValue(item, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {!loading && !apiError && totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> de{' '}
                  <span className="font-semibold">{processedData.length}</span> registros
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="hidden sm:flex gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
