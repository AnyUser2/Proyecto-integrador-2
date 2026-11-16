import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clapperboard,
  Film,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Pencil,
  Plus,
  Search,
  Send,
  Shapes,
  Trash2,
  Tv,
  X,
} from 'lucide-react';
import { deleteResource, listResource, saveResource } from './api.js';

const MODULES = {
  generos: {
    label: 'Géneros',
    singular: 'género',
    endpoint: 'generos',
    icon: Shapes,
    description: 'Organiza las producciones por categoría.',
    fields: [
      { name: 'nombre', label: 'Nombre del género', required: true },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'], defaultValue: 'Activo' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', wide: true },
    ],
    columns: [
      { label: 'Nombre', render: (row) => row.nombre },
      { label: 'Descripción', render: (row) => row.descripcion || '—' },
      { label: 'Estado', render: (row) => <Status value={row.estado} /> },
    ],
  },
  directores: {
    label: 'Directores',
    singular: 'director',
    endpoint: 'directores',
    icon: Film,
    description: 'Administra los responsables de cada producción.',
    fields: [
      { name: 'nombres', label: 'Nombre completo', required: true },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'], defaultValue: 'Activo' },
    ],
    columns: [
      { label: 'Nombre', render: (row) => row.nombres },
      { label: 'Estado', render: (row) => <Status value={row.estado} /> },
    ],
  },
  productoras: {
    label: 'Productoras',
    singular: 'productora',
    endpoint: 'productoras',
    icon: Clapperboard,
    description: 'Mantén al día las compañías de producción.',
    fields: [
      { name: 'nombre', label: 'Nombre de la productora', required: true },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'], defaultValue: 'Activo' },
      { name: 'slogan', label: 'Slogan' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', wide: true },
    ],
    columns: [
      { label: 'Productora', render: (row) => row.nombre },
      { label: 'Slogan', render: (row) => row.slogan || '—' },
      { label: 'Estado', render: (row) => <Status value={row.estado} /> },
    ],
  },
  tipos: {
    label: 'Tipos',
    singular: 'tipo',
    endpoint: 'tipos',
    icon: Tv,
    description: 'Define los formatos disponibles en el catálogo.',
    fields: [
      { name: 'nombre', label: 'Nombre del tipo', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', wide: true },
    ],
    columns: [
      { label: 'Nombre', render: (row) => row.nombre },
      { label: 'Descripción', render: (row) => row.descripcion || '—' },
    ],
  },
  media: {
    label: 'Media',
    singular: 'producción',
    endpoint: 'media',
    icon: Film,
    description: 'Consulta películas y series en un solo lugar.',
    fields: [
      { name: 'titulo', label: 'Título', required: true },
      { name: 'serial', label: 'Serial', required: true, placeholder: 'PEL-0001' },
      { name: 'anioEstreno', label: 'Año de estreno', type: 'number', required: true, min: 1888, max: new Date().getFullYear() + 5 },
      { name: 'tipo', label: 'Tipo', type: 'catalog', catalog: 'tipos', required: true },
      { name: 'genero', label: 'Género', type: 'catalog', catalog: 'generos', activeOnly: true, required: true },
      { name: 'director', label: 'Director', type: 'catalog', catalog: 'directores', activeOnly: true, required: true },
      { name: 'productora', label: 'Productora', type: 'catalog', catalog: 'productoras', activeOnly: true, required: true },
      { name: 'url', label: 'Enlace de la producción', type: 'url', required: true, wide: true, placeholder: 'https://ejemplo.com/pelicula' },
      { name: 'imagenPortada', label: 'Enlace de la portada', type: 'url', wide: true, placeholder: 'https://ejemplo.com/portada.jpg' },
      { name: 'sinopsis', label: 'Sinopsis', type: 'textarea', wide: true },
    ],
    columns: [
      { label: 'Producción', render: (row) => <MediaTitle row={row} /> },
      { label: 'Tipo', render: (row) => <span className="type-chip">{nameOf(row.tipo)}</span> },
      { label: 'Género', render: (row) => nameOf(row.genero) },
      { label: 'Director', render: (row) => nameOf(row.director) },
      { label: 'Productora', render: (row) => nameOf(row.productora) },
      { label: 'Estreno', render: (row) => row.anioEstreno || '—' },
    ],
  },
};

const MODULE_KEYS = Object.keys(MODULES);

function nameOf(reference) {
  if (!reference) return '—';
  return reference.nombre || reference.nombres || '—';
}

function Status({ value }) {
  return <span className={`status-pill ${value === 'Activo' ? 'is-active' : 'is-inactive'}`}>{value || '—'}</span>;
}

function MediaTitle({ row }) {
  return (
    <div className="media-title">
      {row.imagenPortada ? (
        <img src={row.imagenPortada} alt="" className="table-poster" loading="lazy" />
      ) : (
        <span className="table-poster poster-empty"><Film size={17} /></span>
      )}
      <span className="media-title-copy">
        <strong>{row.titulo}</strong>
        <small>{row.serial}</small>
      </span>
    </div>
  );
}

function App() {
  const [records, setRecords] = useState({});
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('Todos');
  const [notice, setNotice] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const reload = async () => {
    const results = await Promise.allSettled(MODULE_KEYS.map((key) => listResource(MODULES[key].endpoint)));
    const nextRecords = {};
    const errors = [];
    results.forEach((result, index) => {
      const key = MODULE_KEYS[index];
      if (result.status === 'fulfilled') nextRecords[key] = result.value;
      else {
        nextRecords[key] = records[key] || [];
        errors.push(`${MODULES[key].label}: ${result.reason.message}`);
      }
    });
    setRecords((previous) => ({ ...previous, ...nextRecords }));
    setApiConnected(errors.length === 0);
    return errors.length ? errors.join(' ') : null;
  };

  useEffect(() => {
    let mounted = true;
    reload().then((error) => {
      if (!mounted) return;
      if (error) setNotice({ type: 'error', text: error });
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setQuery('');
    setStatusFilter('Todos');
    setMediaTypeFilter('Todos');
  }, [activePage]);

  const currentModule = MODULES[activePage];
  const currentRecords = records[activePage] || [];
  const availableTypes = records.tipos || [];

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return currentRecords.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        Object.values(row).some((value) => {
          const text = value && typeof value === 'object' ? nameOf(value) : String(value ?? '');
          return text.toLocaleLowerCase('es').includes(normalizedQuery);
        });
      const matchesStatus = statusFilter === 'Todos' || row.estado === statusFilter;
      const matchesType = mediaTypeFilter === 'Todos' || String(row.tipo?._id || row.tipo) === mediaTypeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [currentRecords, mediaTypeFilter, query, statusFilter]);

  const goTo = (page) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  const openForm = (moduleKey, record = null) => {
    const module = MODULES[moduleKey];
    const values = Object.fromEntries(
      module.fields.map((field) => {
        const value = record?.[field.name];
        const normalized = value && typeof value === 'object' ? value._id : value;
        return [field.name, normalized ?? field.defaultValue ?? ''];
      }),
    );
    setModal({ moduleKey, record, values });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const { moduleKey, record, values } = modal;
    const module = MODULES[moduleKey];
    const payload = Object.fromEntries(
      module.fields.map((field) => [
        field.name,
        field.type === 'number' ? Number(values[field.name]) : String(values[field.name] ?? '').trim(),
      ]),
    );
    try {
      await saveResource(module.endpoint, record?._id, payload);
      setModal(null);
      const refreshError = await reload();
      setNotice({
        type: refreshError ? 'error' : 'success',
        text: refreshError ? `Cambios guardados. No se pudo actualizar el listado: ${refreshError}` : `${module.singular} ${record ? 'actualizado' : 'creado'} correctamente.`,
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  };

  const removeRecord = async (moduleKey, record) => {
    const module = MODULES[moduleKey];
    const label = moduleKey === 'directores' ? record.nombres : record.titulo || record.nombre;
    if (!window.confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteResource(module.endpoint, record._id);
      const refreshError = await reload();
      setNotice({
        type: refreshError ? 'error' : 'success',
        text: refreshError ? `Registro eliminado. No se pudo actualizar el listado: ${refreshError}` : `${module.singular} eliminado correctamente.`,
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  };

  const activeCount = (key) => (records[key] || []).filter((row) => row.estado === 'Activo').length;
  const latestMedia = (records.media || []).slice(0, 4);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Clapperboard size={22} strokeWidth={2.2} /></div>
          <div><strong>cine<span>list</span></strong><small>CATÁLOGO AUDIOVISUAL</small></div>
          <button className="icon-button mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Cerrar menú"><X size={19} /></button>
        </div>

        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav className="navigation" aria-label="Navegación principal">
          <button className={`nav-item ${activePage === 'dashboard' ? 'nav-active' : ''}`} onClick={() => goTo('dashboard')}>
            <LayoutDashboard size={18} /><span>Resumen</span>
          </button>
          <p className="nav-label nav-section-label">CATÁLOGO</p>
          {MODULE_KEYS.map((key) => {
            const module = MODULES[key];
            const Icon = module.icon;
            return (
              <button key={key} className={`nav-item ${activePage === key ? 'nav-active' : ''}`} onClick={() => goTo(key)}>
                <Icon size={18} /><span>{module.label}</span>
                <span className="nav-count">{records[key]?.length ?? '—'}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <span className={`connection-dot ${apiConnected ? '' : 'is-offline'}`} />
          <div><strong>{apiConnected ? 'API de películas' : 'API desconectada'}</strong><small>localhost:3000</small></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Cerrar menú" />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button>
            <div className="breadcrumbs"><span>Catálogo</span><span className="breadcrumb-separator">/</span><strong>{activePage === 'dashboard' ? 'Resumen' : currentModule.label}</strong></div>
          </div>
          <div className="topbar-right">
            <span className={`online-indicator ${apiConnected ? '' : 'is-offline'}`}><i /> {apiConnected ? 'Sistema conectado' : 'API desconectada'}</span>
            <div className="avatar">CL</div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className={`notice notice-${notice.type}`} role="status">
              <span>{notice.text}</span>
              <button className="notice-close" onClick={() => setNotice(null)} aria-label="Cerrar aviso"><X size={16} /></button>
            </div>
          )}

          {loading ? (
            <div className="loading-state"><LoaderCircle className="spinner" size={27} /><span>Conectando con el catálogo...</span></div>
          ) : activePage === 'dashboard' ? (
            <Dashboard
              records={records}
              activeCount={activeCount}
              latestMedia={latestMedia}
              onNavigate={goTo}
            />
          ) : (
            <section className="module-page">
              <div className="page-heading">
                <div>
                  <p className="eyebrow">GESTIÓN DEL CATÁLOGO</p>
                  <h1>{currentModule.label}</h1>
                  <p className="page-description">{currentModule.description}</p>
                </div>
                <button className="button button-primary" onClick={() => openForm(activePage)}>
                  <Plus size={17} /> Agregar {currentModule.singular}
                </button>
              </div>

              <div className="module-metrics">
                <div className="metric-card">
                  <span className="metric-icon metric-purple"><currentModule.icon size={19} /></span>
                  <span><small>Total de registros</small><strong>{currentRecords.length}</strong></span>
                </div>
                <div className="metric-card">
                  <span className="metric-icon metric-green"><ArrowUpRight size={19} /></span>
                  <span><small>Registros activos</small><strong>{currentModule.fields.some((field) => field.name === 'estado') ? activeCount(activePage) : currentRecords.length}</strong></span>
                </div>
                <div className="metric-card metric-note">
                  <span className="metric-icon metric-amber"><ArrowDownRight size={19} /></span>
                  <span><small>Estado del catálogo</small><strong className="ready-label">Actualizado</strong></span>
                </div>
              </div>

              <div className="table-card">
                <div className="table-toolbar">
                  <div><h2>Todos los registros</h2><p>{filteredRecords.length} {filteredRecords.length === 1 ? 'resultado' : 'resultados'}</p></div>
                  <div className="toolbar-controls">
                    <label className="search-field">
                      <Search size={16} />
                      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." aria-label="Buscar registros" />
                    </label>
                    {currentModule.fields.some((field) => field.name === 'estado') && (
                      <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado">
                        <option>Todos</option><option>Activo</option><option>Inactivo</option>
                      </select>
                    )}
                    {activePage === 'media' && (
                      <select className="filter-select" value={mediaTypeFilter} onChange={(event) => setMediaTypeFilter(event.target.value)} aria-label="Filtrar por tipo">
                        <option value="Todos">Todos los tipos</option>
                        {availableTypes.map((type) => <option key={type._id} value={type._id}>{type.nombre}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead><tr>{currentModule.columns.map((column) => <th key={column.label}>{column.label}</th>)}<th className="actions-heading">Acciones</th></tr></thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record._id}>
                          {currentModule.columns.map((column) => <td key={column.label}>{column.render(record)}</td>)}
                          <td>
                            <div className="row-actions">
                              {activePage === 'media' && record.url && (
                                <a className="row-action" href={record.url} target="_blank" rel="noreferrer" aria-label={`Abrir ${record.titulo}`} title="Abrir enlace"><Send size={16} /></a>
                              )}
                              <button className="row-action" onClick={() => openForm(activePage, record)} aria-label={`Editar ${record.titulo || record.nombre || record.nombres}`} title="Editar"><Pencil size={16} /></button>
                              <button className="row-action row-action-delete" onClick={() => removeRecord(activePage, record)} aria-label={`Eliminar ${record.titulo || record.nombre || record.nombres}`} title="Eliminar"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRecords.length === 0 && (
                    <div className="empty-state">
                      <span className="empty-icon"><Search size={21} /></span>
                      <strong>{currentRecords.length ? 'Sin resultados' : 'Aún no hay registros'}</strong>
                      <p>{currentRecords.length ? 'Prueba con otra búsqueda o ajusta los filtros.' : `Crea tu primer ${currentModule.singular} para empezar.`}</p>
                    </div>
                  )}
                </div>
                <div className="table-footer"><span>Mostrando {filteredRecords.length} de {currentRecords.length} registros</span><span>Sincronizado con la API <i className="footer-dot" /></span></div>
              </div>
            </section>
          )}
        </div>
      </main>

      {modal && (
        <RecordModal
          modal={modal}
          catalogs={records}
          onClose={() => setModal(null)}
          onSubmit={submitForm}
          onChange={(name, value) => setModal((previous) => ({ ...previous, values: { ...previous.values, [name]: value } }))}
        />
      )}
    </div>
  );
}

function Dashboard({ records, activeCount, latestMedia, onNavigate }) {
  const productionCount = records.media?.length || 0;
  const catalogCount = MODULE_KEYS.slice(0, 4).reduce((sum, key) => sum + (records[key]?.length || 0), 0);
  const types = records.tipos || [];

  return (
    <section className="dashboard-page">
      <div className="welcome-row">
        <div><p className="eyebrow">TU ESPACIO DE TRABAJO</p><h1>Tu catálogo, <span>en escena.</span></h1><p className="page-description">Administra tus producciones y mantén todo organizado.</p></div>
        <button className="button button-primary" onClick={() => onNavigate('media')}><Plus size={17} /> Ver producciones</button>
      </div>

      <div className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker"><span /> TU BIBLIOTECA AUDIOVISUAL</span>
          <h2>Cada historia,<br />en su lugar.</h2>
          <p>Un espacio para descubrir, organizar y gestionar todas tus películas y series.</p>
          <button className="hero-link" onClick={() => onNavigate('media')}>Explorar producciones <ArrowUpRight size={16} /></button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-disc"><Clapperboard size={55} strokeWidth={1.4} /></div>
          <span className="sparkle sparkle-one">✦</span><span className="sparkle sparkle-two">✦</span>
          <span className="hero-tag tag-one">PELÍCULAS</span><span className="hero-tag tag-two">SERIES</span>
        </div>
      </div>

      <div className="section-heading"><div><h2>Vista general</h2><p>Un vistazo a tu biblioteca</p></div></div>
      <div className="overview-grid">
        <button className="overview-card" onClick={() => onNavigate('media')}>
          <span className="overview-icon icon-orange"><Film size={20} /></span>
          <span className="overview-copy"><small>Producciones</small><strong>{productionCount}</strong><em>Películas y series</em></span>
          <ArrowUpRight className="overview-arrow" size={17} />
        </button>
        <button className="overview-card" onClick={() => onNavigate('generos')}>
          <span className="overview-icon icon-violet"><Shapes size={20} /></span>
          <span className="overview-copy"><small>Géneros</small><strong>{records.generos?.length || 0}</strong><em>{activeCount('generos')} activos</em></span>
          <ArrowUpRight className="overview-arrow" size={17} />
        </button>
        <button className="overview-card" onClick={() => onNavigate('directores')}>
          <span className="overview-icon icon-blue"><Film size={20} /></span>
          <span className="overview-copy"><small>Directores</small><strong>{records.directores?.length || 0}</strong><em>{activeCount('directores')} activos</em></span>
          <ArrowUpRight className="overview-arrow" size={17} />
        </button>
        <button className="overview-card" onClick={() => onNavigate('productoras')}>
          <span className="overview-icon icon-green"><Clapperboard size={20} /></span>
          <span className="overview-copy"><small>Catálogos</small><strong>{catalogCount}</strong><em>Géneros, directores, productoras y tipos</em></span>
          <ArrowUpRight className="overview-arrow" size={17} />
        </button>
      </div>

      <div className="dashboard-bottom">
        <section className="recent-card">
          <div className="section-card-heading"><div><h2>Agregados recientemente</h2><p>Lo último en tu biblioteca</p></div><button onClick={() => onNavigate('media')}>Ver todo <ArrowUpRight size={15} /></button></div>
          {latestMedia.length ? (
            <div className="recent-list">
              {latestMedia.map((media) => (
                <button className="recent-item" key={media._id} onClick={() => onNavigate('media')}>
                  {media.imagenPortada ? <img src={media.imagenPortada} alt="" className="recent-poster" loading="lazy" /> : <span className="recent-poster recent-poster-empty"><Film size={18} /></span>}
                  <span className="recent-copy"><strong>{media.titulo}</strong><small>{nameOf(media.tipo)} <i /> {media.anioEstreno}</small></span>
                  <ArrowUpRight size={16} className="recent-arrow" />
                </button>
              ))}
            </div>
          ) : <div className="recent-empty"><Film size={22} /><p>Tus nuevas producciones aparecerán aquí.</p></div>}
        </section>

        <section className="quick-card">
          <div><p className="eyebrow">ORGANIZA TU CONTENIDO</p><h2>Una buena historia empieza con los detalles.</h2><p>Completa tus catálogos y mantén toda la información conectada.</p></div>
          <div className="quick-stats"><span><Shapes size={16} /> {records.generos?.length || 0} géneros</span><span><Tv size={16} /> {types.length} tipos</span></div>
          <button className="quick-button" onClick={() => onNavigate('tipos')}>Administrar catálogos <ArrowUpRight size={16} /></button>
          <span className="quick-decoration" aria-hidden="true"><Clapperboard size={100} /></span>
        </section>
      </div>
    </section>
  );
}

function RecordModal({ modal, catalogs, onClose, onSubmit, onChange }) {
  const module = MODULES[modal.moduleKey];
  const editing = Boolean(modal.record);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div><p className="eyebrow">{editing ? 'ACTUALIZAR INFORMACIÓN' : 'NUEVO REGISTRO'}</p><h2 id="modal-title">{editing ? 'Editar' : 'Agregar'} {module.singular}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar formulario"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            {module.fields.map((field) => (
              <label className={`form-field ${field.wide ? 'form-field-wide' : ''}`} key={field.name}>
                <span>{field.label}{field.required && <i> *</i>}</span>
                {field.type === 'textarea' ? (
                  <textarea rows={3} value={modal.values[field.name] ?? ''} required={field.required} onChange={(event) => onChange(field.name, event.target.value)} placeholder={field.placeholder || ''} />
                ) : field.type === 'select' ? (
                  <select value={modal.values[field.name] ?? ''} required={field.required} onChange={(event) => onChange(field.name, event.target.value)}>
                    <option value="" disabled>Selecciona una opción</option>
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.type === 'catalog' ? (
                  <select value={modal.values[field.name] ?? ''} required={field.required} onChange={(event) => onChange(field.name, event.target.value)}>
                    <option value="" disabled>Selecciona {field.label.toLocaleLowerCase('es')}</option>
                    {(() => {
                      const options = catalogs[field.catalog] || [];
                      const available = options.filter((item) => !field.activeOnly || item.estado === 'Activo');
                      const currentId = modal.values[field.name];
                      const current = options.find((item) => item._id === currentId);
                      const choices = current && !available.some((item) => item._id === currentId) ? [...available, current] : available;
                      return choices.map((item) => (
                        <option key={item._id} value={item._id}>
                          {(item.nombre || item.nombres) + (item.estado === 'Inactivo' ? ' · inactivo (actual)' : '')}
                        </option>
                      ));
                    })()}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={modal.values[field.name] ?? ''}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder || ''}
                    onChange={(event) => onChange(field.name, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="modal-footer">
            <p><i>*</i> Campos obligatorios</p>
            <div><button className="button button-quiet" type="button" onClick={onClose}>Cancelar</button><button className="button button-primary" type="submit">{editing ? 'Guardar cambios' : 'Crear registro'}</button></div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;
