// SIM_VERSION=v1 | v2
export const VERSION = process.env.SIM_VERSION ?? 'v2';
export const M = await import(`../src/inscripcion_${VERSION}.js`);
