import { getDatabase } from "../db/connection";

export interface MedicionEntity {
  id: string;
  tipo: "nivel" | "rumbo" | "altitud";
  valor: number;
  unidad: string;
  nota: string | null;
  lat: number | null;
  lng: number | null;
  medida_en: string;
  created_at: string;
  updated_at: string;
  deleted: number;
  pending: number;
}

export const MedicionRepository = {
  async insert(medicion: Omit<MedicionEntity, "created_at" | "updated_at" | "deleted" | "pending">): Promise<MedicionEntity> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const entity: MedicionEntity = {
      ...medicion,
      created_at: now,
      updated_at: now,
      deleted: 0,
      pending: 1,
    };

    await db.runAsync(
      `INSERT INTO medicion (id, tipo, valor, unidad, nota, lat, lng, medida_en, created_at, updated_at, deleted, pending)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.id,
        entity.tipo,
        entity.valor,
        entity.unidad,
        entity.nota,
        entity.lat,
        entity.lng,
        entity.medida_en,
        entity.created_at,
        entity.updated_at,
        entity.deleted,
        entity.pending,
      ]
    );

    return entity;
  },

  async getAll(tipoFilter?: string): Promise<MedicionEntity[]> {
    const db = await getDatabase();
    if (tipoFilter && tipoFilter !== "todos") {
      return await db.getAllAsync<MedicionEntity>(
        `SELECT * FROM medicion WHERE deleted = 0 AND tipo = ? ORDER BY medida_en DESC`,
        [tipoFilter]
      );
    }
    return await db.getAllAsync<MedicionEntity>(
      `SELECT * FROM medicion WHERE deleted = 0 ORDER BY medida_en DESC`
    );
  },

  async softDelete(id: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE medicion SET deleted = 1, updated_at = ?, pending = 1 WHERE id = ?`,
      [now, id]
    );
  },

  async getPending(): Promise<MedicionEntity[]> {
    const db = await getDatabase();
    return await db.getAllAsync<MedicionEntity>(
      `SELECT * FROM medicion WHERE pending = 1`
    );
  },

  async markAsSynced(id: string, serverUpdatedAt: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE medicion SET pending = 0, updated_at = ? WHERE id = ?`,
      [serverUpdatedAt, id]
    );
  },
};

export const CalibracionRepository = {
  async get(): Promise<{ offsetX: number; offsetY: number }> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ offset_x: number; offset_y: number }>(
      `SELECT offset_x, offset_y FROM calibracion WHERE id = 1`
    );
    return {
      offsetX: row?.offset_x ?? 0,
      offsetY: row?.offset_y ?? 0,
    };
  },

  async save(offsetX: number, offsetY: number): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE calibracion SET offset_x = ?, offset_y = ?, updated_at = ?, pending = 1 WHERE id = 1`,
      [offsetX, offsetY, now]
    );
  },
};
