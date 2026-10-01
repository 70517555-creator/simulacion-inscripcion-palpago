// PRUEBAS FUNCIONALES — proceso de registro e inscripción de equipos (CF-01 a CF-10)
import { describe, it, expect, beforeEach } from 'vitest';
import { M } from './modulo.js';
import { PADRON, ANTES_CIERRE, DESPUES_CIERRE, dbVacia } from './fixtures.js';

let db;
const reg = (nombre, correo, dni) => M.registrarEstudiante(db, { nombre, correo, dni }, PADRON);
function tresEstudiantes() {
  return [
    reg('Ana Quispe', 'ana.quispe@aulavirtual.istpalpa.edu.pe', '70123456').estudiante.id,
    reg('Luis Huamán', 'luis.huaman@aulavirtual.istpalpa.edu.pe', '70123457').estudiante.id,
    reg('Rosa Cahua', 'rosa.cahua@aulavirtual.istpalpa.edu.pe', '70123458').estudiante.id,
  ];
}
beforeEach(() => { db = dbVacia(); });

describe('Registro de estudiante', () => {
  it('CF-01 correo del padrón (con mayúsculas y espacios) se registra', () => {
    const r = reg('Ana Quispe', '  Ana.Quispe@AULAVIRTUAL.istpalpa.edu.pe ', '70123456');
    expect(r.ok).toBe(true);
    expect(r.estudiante.correo).toBe('ana.quispe@aulavirtual.istpalpa.edu.pe');
  });
  it('CF-02 correo fuera del padrón se rechaza', () => {
    const r = reg('Intruso', 'intruso@gmail.com', '70123456');
    expect(r).toMatchObject({ ok: false, codigo: 'CORREO_NO_PADRON' });
    expect(db.estudiantes).toHaveLength(0);
  });
  it("CF-03 DNI con carácter no numérico (caso real 6'071102) se rechaza", () => {
    const r = reg('Ana Quispe', 'ana.quispe@aulavirtual.istpalpa.edu.pe', "6'071102");
    expect(r).toMatchObject({ ok: false, codigo: 'DNI_INVALIDO' });
    expect(db.estudiantes).toHaveLength(0);
  });
  it('CF-04 DNI con 7 o 9 dígitos se rechaza', () => {
    expect(reg('Ana', 'ana.quispe@aulavirtual.istpalpa.edu.pe', '7012345').codigo).toBe('DNI_INVALIDO');
    expect(reg('Ana', 'ana.quispe@aulavirtual.istpalpa.edu.pe', '701234567').codigo).toBe('DNI_INVALIDO');
  });
  it('CF-05 doble registro con el mismo DNI se bloquea', () => {
    reg('Ana Quispe', 'ana.quispe@aulavirtual.istpalpa.edu.pe', '70123456');
    const r = reg('Luis Huamán', 'luis.huaman@aulavirtual.istpalpa.edu.pe', '70123456');
    expect(r).toMatchObject({ ok: false, codigo: 'DNI_DUPLICADO' });
    expect(db.estudiantes).toHaveLength(1);
  });
});

describe('Inscripción de equipo', () => {
  it('CF-06 equipo con menos integrantes que el mínimo no se inscribe', () => {
    const ids = tresEstudiantes().slice(0, 2);
    const r = M.inscribirEquipo(db, { nombreProyecto: 'BioPalpa', asesor: 'Doc. Pérez', integrantes: ids }, ANTES_CIERRE);
    expect(r).toMatchObject({ ok: false, codigo: 'INTEGRANTES_INSUFICIENTES' });
    expect(db.equipos).toHaveLength(0);
  });
  it('CF-07 equipo completo dentro del plazo se inscribe y asigna equipo a cada integrante', () => {
    const ids = tresEstudiantes();
    const r = M.inscribirEquipo(db, { nombreProyecto: 'BioPalpa', asesor: 'Doc. Pérez', integrantes: ids }, ANTES_CIERRE);
    expect(r.ok).toBe(true);
    ids.forEach((id) => expect(db.estudiantes.find((e) => e.id === id).equipoId).toBe(r.equipo.id));
  });
  it('CF-08 inscripción después del cierre la rechaza el servidor', () => {
    const ids = tresEstudiantes();
    const r = M.inscribirEquipo(db, { nombreProyecto: 'BioPalpa', asesor: 'Doc. Pérez', integrantes: ids }, DESPUES_CIERRE);
    expect(r).toMatchObject({ ok: false, codigo: 'INSCRIPCION_CERRADA' });
    expect(db.equipos).toHaveLength(0);
  });
  it('CF-09 estudiante que ya pertenece a otro equipo no puede inscribirse de nuevo', () => {
    const ids = tresEstudiantes();
    M.inscribirEquipo(db, { nombreProyecto: 'BioPalpa', asesor: 'Doc. Pérez', integrantes: ids }, ANTES_CIERRE);
    const nuevo = reg('José Ramos', 'jose.ramos@aulavirtual.istpalpa.edu.pe', '70123459').estudiante.id;
    const r = M.inscribirEquipo(db, { nombreProyecto: 'AgroAsesor', asesor: 'Doc. Pérez', integrantes: [ids[0], ids[1], nuevo] }, ANTES_CIERRE);
    expect(r).toMatchObject({ ok: false, codigo: 'YA_EN_OTRO_EQUIPO' });
  });
  it('CF-10 la ficha usa datos reales del equipo y detecta campos vacíos', () => {
    const ids = tresEstudiantes();
    const ok = M.inscribirEquipo(db, { nombreProyecto: 'BioPalpa', asesor: 'Doc. Pérez', integrantes: ids }, ANTES_CIERRE);
    const ficha = M.generarFicha(db, ok.equipo.id);
    expect(ficha.ok).toBe(true);
    expect(ficha.ficha.integrantes.map((i) => i.dni)).toEqual(['70123456', '70123457', '70123458']);
    db.equipos[0].asesor = '   ';
    expect(M.generarFicha(db, ok.equipo.id)).toMatchObject({ ok: false, codigo: 'CAMPOS_VACIOS', faltantes: ['asesor'] });
  });
});
