// Versión 1: comportamiento original (defectos H-03 y H-07)

import { CONFIG } from './config.js';

// VERSIÓN 1 — defecto real H-03
export function validarDNI(dni) {
  const valor = String(dni ?? '').trim();
  if (valor.length !== 8) return { valido: false, mensaje: 'El DNI debe tener 8 caracteres' };
  return { valido: true, valor };
}

export function registrarEstudiante(db, { nombre, correo, dni }, padron) {
  const correoNormal = String(correo ?? '').trim().toLowerCase();
  if (!padron.includes(correoNormal))
    return error('CORREO_NO_PADRON', 'El correo no figura en el padrón institucional');

  const r = validarDNI(dni);
  if (!r.valido)
    return { ...error('DNI_INVALIDO', r.mensaje), sugerencia: r.sugerencia ?? null };

  if (db.estudiantes.some((e) => e.dni === r.valor))
    return error('DNI_DUPLICADO', 'Ya existe un estudiante registrado con ese DNI');

  const estudiante = {
    id: `EST-${db.estudiantes.length + 1}`,
    nombre: String(nombre ?? '').trim(),
    correo: correoNormal,
    dni: r.valor,
    equipoId: null,
  };
  db.estudiantes.push(estudiante);
  return { ok: true, estudiante };
}

// VERSIÓN 1 — defecto real H-07: no se revisa la hora del servidor
export function inscribirEquipo(db, equipo, fechaServidor = new Date()) {
  return validarYCrearEquipo(db, equipo, fechaServidor);
}

export function generarFicha(db, equipoId) {
  const equipo = db.equipos.find((e) => e.id === equipoId);
  if (!equipo) return error('EQUIPO_NO_EXISTE', 'No existe el equipo');

  const faltantes = ['nombreProyecto', 'asesor'].filter((campo) => !String(equipo[campo] ?? '').trim());
  if (faltantes.length)
    return { ...error('CAMPOS_VACIOS', 'La ficha tiene campos obligatorios vacíos'), faltantes };

  return {
    ok: true,
    ficha: {
      nombreProyecto: equipo.nombreProyecto.trim(),
      asesor: equipo.asesor.trim(),
      integrantes: equipo.integrantes.map((id) => {
        const e = db.estudiantes.find((x) => x.id === id);
        return { nombre: e.nombre, dni: e.dni };
      }),
    },
  };
}

function validarYCrearEquipo(db, { nombreProyecto, asesor, integrantes = [] }, fechaServidor) {
  if (integrantes.length < CONFIG.MIN_INTEGRANTES)
    return error('INTEGRANTES_INSUFICIENTES',
      `El equipo debe tener al menos ${CONFIG.MIN_INTEGRANTES} integrantes`);
  if (integrantes.length > CONFIG.MAX_INTEGRANTES)
    return error('INTEGRANTES_EXCEDIDOS',
      `El equipo puede tener como máximo ${CONFIG.MAX_INTEGRANTES} integrantes`);

  for (const id of integrantes) {
    const e = db.estudiantes.find((x) => x.id === id);
    if (!e) return error('ESTUDIANTE_NO_REGISTRADO', `El estudiante ${id} no está registrado`);
    if (e.equipoId) return error('YA_EN_OTRO_EQUIPO', `${e.nombre} ya pertenece a otro equipo`);
  }

  const equipo = {
    id: `EQ-${db.equipos.length + 1}`,
    nombreProyecto, asesor, integrantes: [...integrantes],
    inscritoEn: fechaServidor,
  };
  db.equipos.push(equipo);
  integrantes.forEach((id) => { db.estudiantes.find((x) => x.id === id).equipoId = equipo.id; });
  return { ok: true, equipo };
}

function error(codigo, mensaje) {
  return { ok: false, codigo, mensaje };
}
