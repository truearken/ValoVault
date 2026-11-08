"use client";

import { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Weapon, LoadoutItemV1, Skin } from '@/lib/types';
import WeaponCard from './WeaponCard';
import SkinList from './SkinList';
import LevelAndChromaSelector from './LevelAndChromaSelector';
import GunBuddySelectionModal from './GunBuddySelectionModal';
import { groupWeapons, computeLayout } from './weaponCategories';

// Tracks the grid's own content box (not the window), so the side panels never get squeezed.
function useElementSize(el: HTMLDivElement | null) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [el]);
    return size;
}

type WeaponGridProps = {
    onSkinSelectAction: (weaponId: string, skinId: string, levelId: string, chromaId: string) => void;
    onBuddySelectAction: (weaponId: string, charmID: string, charmLevelID: string) => void;
    onSkinResetAction: (weaponId: string) => void;
    currentLoadout: Record<string, LoadoutItemV1>;
    parent: Record<string, LoadoutItemV1> | undefined;
}

export default function WeaponGrid({ onSkinSelectAction, onBuddySelectAction, onSkinResetAction, currentLoadout, parent }: WeaponGridProps) {
    const { weapons, ownedLevelIDs, ownedChromaIDs, loading } = useData();
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
    const [showSkinListModal, setShowSkinListModal] = useState(false);
    const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
    const [showLevelAndChromaModal, setShowLevelAndChromaModal] = useState(false);
    const [showBuddyModal, setShowBuddyModal] = useState(false);
    const [selectedWeaponForBuddy, setSelectedWeaponForBuddy] = useState<Weapon | null>(null);
    const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);
    const gridSize = useElementSize(gridEl);

    const handleWeaponClick = (weapon: Weapon) => {
        setSelectedWeapon(weapon);
        setShowSkinListModal(true);
    };

    const handleEditSkinClick = (weapon: Weapon) => {
        const itemToEdit = currentLoadout[weapon.uuid] || (parent ? parent[weapon.uuid] : undefined);
        if (!currentLoadout[weapon.uuid] && parent?.[weapon.uuid]) {
            const parentItem = parent[weapon.uuid];
            onSkinSelectAction(weapon.uuid, parentItem.skinId, parentItem.skinLevelId, parentItem.chromaId);
        }

        const skin = weapon.skins.find(s => s.uuid === itemToEdit.skinId);
        if (skin) {
            setSelectedWeapon(weapon);
            setSelectedSkin(skin);
            setShowLevelAndChromaModal(true);
        }
    };

    const handleBuddyEditClick = (weapon: Weapon) => {
        setSelectedWeaponForBuddy(weapon);
        setShowBuddyModal(true);
    };

    const handleResetSkinClick = (weapon: Weapon) => {
        onSkinResetAction(weapon.uuid);
    }

    const handleCloseBuddyModal = () => {
        setShowBuddyModal(false);
        setSelectedWeaponForBuddy(null);
    };

    const handleBuddySelect = (charmID: string, charmLevelID: string) => {
        if (selectedWeaponForBuddy) {
            onBuddySelectAction(selectedWeaponForBuddy.uuid, charmID, charmLevelID);
        }
        handleCloseBuddyModal();
    };

    const handleCloseSkinListModal = () => {
        setShowSkinListModal(false);
    };

    const handleSkinSelectInList = (skin: Skin) => {
        setSelectedSkin(skin);
        setShowSkinListModal(false);
        setShowLevelAndChromaModal(true);
    };

    const handleCloseLevelAndChromaModal = () => {
        setShowLevelAndChromaModal(false);
    };

    const handleLevelAndChromaSelect = (skinId: string, levelId: string, chromaId: string) => {
        onSkinSelectAction(selectedWeapon!.uuid, skinId, levelId, chromaId);
        setShowLevelAndChromaModal(false);
    };

    const groups = useMemo(() => groupWeapons(weapons), [weapons]);
    const { columns, cardHeight } = useMemo(
        () => computeLayout(groups, gridSize.width, gridSize.height),
        [groups, gridSize.width, gridSize.height],
    );

    const renderCard = (weapon: Weapon) => (
        <WeaponCard
            key={weapon.uuid}
            weapon={weapon}
            ownedLevelIDs={ownedLevelIDs}
            ownedChromaIDs={ownedChromaIDs}
            onClick={() => handleWeaponClick(weapon)}
            onEditClick={() => handleEditSkinClick(weapon)}
            onBuddyEditClick={() => handleBuddyEditClick(weapon)}
            onHandleResetSkinClick={() => handleResetSkinClick(weapon)}
            selectedItem={currentLoadout[weapon.uuid]}
            parentItem={parent ? parent[weapon.uuid] : undefined}
        />
    );

    if (loading) {
        return <div>Loading game data...</div>;
    }

    return (
        <div className="px-2 h-100" ref={setGridEl}>
            <div
                className="weapon-columns"
                style={{ '--weapon-card-h': `${cardHeight}px`, visibility: gridSize.height ? 'visible' : 'hidden' } as React.CSSProperties}>
                {columns.map((column, i) => (
                    <div key={i} className="weapon-column">
                        {column.map(group => (
                            <section key={group.key} className="weapon-category">
                                <h3 className="weapon-category-title">{group.label}</h3>
                                <div className="weapon-category-list">
                                    {group.weapons.map(renderCard)}
                                </div>
                            </section>
                        ))}
                    </div>
                ))}
            </div>

            {selectedWeapon && (
                <SkinList
                    weapon={selectedWeapon}
                    ownedLevelIDs={ownedLevelIDs}
                    ownedChromaIDs={ownedChromaIDs}
                    onSkinSelect={handleSkinSelectInList}
                    show={showSkinListModal}
                    onClose={handleCloseSkinListModal}
                />
            )}

            {selectedSkin && (
                <LevelAndChromaSelector
                    skin={selectedSkin}
                    ownedLevelIDs={ownedLevelIDs}
                    ownedChromaIDs={ownedChromaIDs}
                    onSelect={handleLevelAndChromaSelect}
                    show={showLevelAndChromaModal}
                    onClose={handleCloseLevelAndChromaModal}
                />
            )}

            {showBuddyModal && selectedWeaponForBuddy && (
                <GunBuddySelectionModal
                    onSelect={handleBuddySelect}
                    onClose={handleCloseBuddyModal}
                    weaponName={selectedWeaponForBuddy.displayName}
                    currentLoadout={currentLoadout}
                />
            )}
        </div>
    );
}
