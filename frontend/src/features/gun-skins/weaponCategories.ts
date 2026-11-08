import { Weapon } from '@/lib/types';

// In-game collection order. Unknown (future) categories are appended at the end.
export const CATEGORY_ORDER = ['Sidearm', 'SMG', 'Shotgun', 'Melee', 'Rifle', 'Sniper', 'Heavy'];

export const CATEGORY_LABELS: Record<string, string> = {
    Sidearm: 'Sidearms',
    SMG: 'SMGs',
    Shotgun: 'Shotguns',
    Melee: 'Melee',
    Rifle: 'Rifles',
    Sniper: 'Sniper Rifles',
    Heavy: 'Machine Guns',
};

export type WeaponGroup = {
    key: string;
    label: string;
    weapons: Weapon[];
};

// Height of a heading relative to one weapon card, used for column balancing.
const HEADING_WEIGHT = 0.5;

export function categoryKey(category: string): string {
    return category.split('::').pop() || category;
}

export function categoryLabel(key: string): string {
    if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
    const words = key.replace(/([a-z])([A-Z])/g, '$1 $2');
    return words.endsWith('s') ? words : `${words}s`;
}

export function groupWeapons(weapons: Weapon[]): WeaponGroup[] {
    const byKey = new Map<string, Weapon[]>();
    for (const weapon of weapons) {
        const key = categoryKey(weapon.category);
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key)!.push(weapon);
    }

    const rank = (key: string) => {
        const i = CATEGORY_ORDER.indexOf(key);
        return i === -1 ? CATEGORY_ORDER.length : i;
    };

    return [...byKey.entries()]
        .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
        .map(([key, list]) => ({
            key,
            label: categoryLabel(key),
            weapons: [...list].sort((a, b) =>
                (a.shopData?.cost ?? 0) - (b.shopData?.cost ?? 0) || a.displayName.localeCompare(b.displayName)),
        }));
}

/**
 * Splits the ordered groups into at most `columnCount` contiguous columns,
 * minimising the height of the tallest column.
 */
export function packColumns(groups: WeaponGroup[], columnCount: number): WeaponGroup[][] {
    const n = groups.length;
    const k = Math.max(1, Math.min(columnCount, n));
    if (n === 0) return [];

    const heights = groups.map(g => g.weapons.length + HEADING_WEIGHT);
    const prefix = [0];
    for (const h of heights) prefix.push(prefix[prefix.length - 1] + h);
    const span = (i: number, j: number) => prefix[j] - prefix[i];

    // best[c][i]: minimal max-height packing groups[i..n) into c columns.
    const best: number[][] = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity));
    const cut: number[][] = Array.from({ length: k + 1 }, () => Array(n + 1).fill(n));
    best[0][n] = 0;
    for (let c = 1; c <= k; c++) {
        for (let i = n - 1; i >= 0; i--) {
            for (let j = i + 1; j <= n; j++) {
                const value = Math.max(span(i, j), best[c - 1][j]);
                if (value < best[c][i]) {
                    best[c][i] = value;
                    cut[c][i] = j;
                }
            }
        }
    }

    const columns: WeaponGroup[][] = [];
    let i = 0;
    for (let c = k; c >= 1 && i < n; c--) {
        const j = cut[c][i];
        columns.push(groups.slice(i, j));
        i = j;
    }
    return columns;
}

// Layout metrics in px — keep in sync with the .weapon-* rules in globals.css.
export const LAYOUT = {
    columnGap: 24,
    groupGap: 16,
    cardGap: 12,
    headingHeight: 44, // title height (36) + bottom margin (8)
    minColumnWidth: 140,
    maxColumns: 4,
    minCardHeight: 64,
    maxCardHeight: 170,
    maxCardAspect: 0.6, // card height relative to column width
};

export type WeaponLayout = {
    columns: WeaponGroup[][];
    cardHeight: number;
};

function fitCardHeight(columns: WeaponGroup[][], height: number): number {
    let fit = Infinity;
    for (const column of columns) {
        const cards = column.reduce((sum, g) => sum + g.weapons.length, 0);
        if (cards === 0) continue;
        const fixed = column.length * LAYOUT.headingHeight
            + (column.length - 1) * LAYOUT.groupGap
            + (cards - column.length) * LAYOUT.cardGap;
        fit = Math.min(fit, (height - fixed) / cards);
    }
    return fit;
}

/**
 * Picks the column count whose cards come out largest while every column fits
 * into the given box without scrolling. Falls back to minCardHeight (and the
 * container scrolls) when the box is too small.
 */
export function computeLayout(groups: WeaponGroup[], width: number, height: number): WeaponLayout {
    let best: WeaponLayout = { columns: packColumns(groups, 1), cardHeight: -Infinity };
    for (let count = 1; count <= LAYOUT.maxColumns; count++) {
        const columnWidth = (width - (count - 1) * LAYOUT.columnGap) / count;
        if (count > 1 && columnWidth < LAYOUT.minColumnWidth) break;
        const columns = packColumns(groups, count);
        const cardHeight = Math.min(
            fitCardHeight(columns, height),
            columnWidth * LAYOUT.maxCardAspect,
            LAYOUT.maxCardHeight,
        );
        if (cardHeight > best.cardHeight) best = { columns, cardHeight };
    }
    best.cardHeight = Math.max(LAYOUT.minCardHeight, Math.floor(best.cardHeight) - 1);
    return best;
}
