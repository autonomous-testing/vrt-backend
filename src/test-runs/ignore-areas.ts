import { IgnoreAreaDto } from './dto/ignore-area.dto';

export type StoredIgnoreArea = IgnoreAreaDto & { id?: string };

/** The ignore areas a test run or variation stores as JSON; none for a missing or broken value. */
export function parseIgnoreAreas(json: string | null | undefined): StoredIgnoreArea[] {
  if (!json) return [];
  try {
    const areas = JSON.parse(json);
    return Array.isArray(areas) ? areas : [];
  } catch {
    return [];
  }
}

const geometryOf = ({ x, y, width, height }: IgnoreAreaDto) => `${x},${y},${width},${height}`;

/**
 * Every area of the given lists once, in order: an area drawn the same in two lists counts once,
 * and keeps the id it was stored with first. An area that never had an id gets a new one.
 */
export function mergeIgnoreAreas(...lists: StoredIgnoreArea[][]): Array<StoredIgnoreArea & { id: string }> {
  const byGeometry = new Map<string, StoredIgnoreArea & { id: string }>();
  let nextId = Date.now();
  for (const area of lists.flat()) {
    const key = geometryOf(area);
    if (byGeometry.has(key)) continue;
    const { x, y, width, height } = area;
    byGeometry.set(key, { x, y, width, height, id: area.id ?? String(nextId++) });
  }
  return [...byGeometry.values()];
}
