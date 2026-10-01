// PRUEBAS UNITARIAS — función validarDNI (U-01 a U-06)
import { describe, it, expect } from 'vitest';
import { M, VERSION } from './modulo.js';

describe(`validarDNI (${VERSION})`, () => {
  it('U-01 DNI de 8 dígitos es válido', () => {
    expect(M.validarDNI('60711023')).toEqual({ valido: true, valor: '60711023' });
  });
  it('U-02 se recortan los espacios de los extremos', () => {
    expect(M.validarDNI('  60711023 ')).toMatchObject({ valido: true, valor: '60711023' });
  });
  it("U-03 caso real 6'071102 (8 caracteres con apóstrofo) no es válido", () => {
    expect(M.validarDNI("6'071102").valido).toBe(false);
  });
  it('U-04 DNI de 7 dígitos no es válido', () => {
    expect(M.validarDNI('6071102').valido).toBe(false);
  });
  it('U-05 vacío y null no son válidos', () => {
    expect(M.validarDNI('').valido).toBe(false);
    expect(M.validarDNI(null).valido).toBe(false);
  });
  it("U-06 6'0711023 no es válido y se sugiere 60711023", () => {
    expect(M.validarDNI("6'0711023")).toMatchObject({ valido: false, sugerencia: '60711023' });
  });
});
