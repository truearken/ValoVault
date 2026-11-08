export interface Agent {
    uuid: string;
    displayName: string;
    displayIcon: string;
    isBaseContent: boolean;
}

export interface Preset {
    uuid: string;
    parentUuid?: string;
    disabled?: boolean;
    name: string;
    loadout: Record<string, LoadoutItemV1>; // {[weaponId]: LoadoutItem}
    agents?: string[];
}

export function isVariant(p: Preset | undefined | null) {
    return p?.parentUuid ? true : false;
}

export interface LoadoutItemV1 {
    skinId: string;
    skinLevelId: string;
    chromaId: string;
    charmID?: string;
    charmLevelID?: string;
}

export interface Weapon {
    uuid: string;
    defaultSkinUuid: string;
    displayName: string;
    displayIcon: string;
    category: string;
    shopData?: { cost: number } | null;
    skins: Skin[];
}

export interface GunBuddy {
    uuid: string;
    displayName: string;
    amount: number;
    levels: GunBuddyLevel[];
}

export interface Skin {
    uuid: string;
    displayName: string;
    displayIcon: string;
    contentTierUuid: string;
    levels: SkinLevel[];
    chromas: Chroma[];
}

export interface SkinLevel {
    uuid: string;
    displayName: string;
    displayIcon: string;
}

export interface GunBuddyLevel {
    uuid: string;
    displayIcon: string;
}

export interface Chroma {
    uuid: string;
    displayName: string;
    displayIcon: string;
    fullRender: string;
    swatch: string;
}

export interface OwnedSkinsResponse {
    LevelIds: string[];
    ChromaIds: string[];
}

export interface OwnedBuddy {
    LevelId: string
    Amount: number
}

export interface OwnedGunBuddiesResponse {
    Buddies: OwnedBuddy[];
}

export interface OwnedAgentsResponse {
    AgentIds: string[];
}

export interface ContentTier {
    uuid: string;
    displayName: string;
    rank: number;
    displayIcon: string;
}
