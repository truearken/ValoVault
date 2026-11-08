import Image from 'next/image';
import { useData } from '@/context/DataContext';
import { LoadoutItemV1, Weapon } from '@/lib/types';


type WeaponCardProps = {
    weapon: Weapon;
    onClick: () => void;
    onEditClick: () => void;
    onBuddyEditClick: () => void;
    onHandleResetSkinClick: () => void;
    ownedLevelIDs: string[];
    ownedChromaIDs: string[];
    selectedItem: LoadoutItemV1;
    parentItem: LoadoutItemV1 | undefined;
};

export default function WeaponCard({ weapon, onClick, onEditClick, onBuddyEditClick, onHandleResetSkinClick, ownedLevelIDs, ownedChromaIDs, selectedItem, parentItem }: WeaponCardProps) {
    let item: LoadoutItemV1;
    if (selectedItem) {
        item = selectedItem;
    } else {
        item = parentItem!;
    }

    if (!item) {
        const defaultSkin = weapon.skins.find(w => w.uuid === weapon.defaultSkinUuid)!;
        item = {skinId: defaultSkin.uuid, chromaId: defaultSkin.chromas[0].uuid, skinLevelId: defaultSkin.levels[0].uuid}
    }

    const skin = weapon.skins.find(w => w.uuid === item.skinId)!;
    const isDefaultSkin = skin.uuid === weapon.defaultSkinUuid;
    const ownedLevels = skin.levels.filter(level => ownedLevelIDs.includes(level.uuid));
    const ownedChromas = skin.chromas.filter(chroma => ownedChromaIDs.includes(chroma.uuid));
    const canEdit = !isDefaultSkin && !(ownedLevels.length === 1 && ownedChromas.length === 0);

    const chroma = skin.chromas.find(c => c.uuid === item.chromaId)!;
    const level = skin.levels.find(l => l.uuid === item.skinLevelId)!;

    const displayIcon = chroma.fullRender;
    let displayName = chroma.displayName || level.displayName || skin.displayName;
    if (skin.chromas.indexOf(chroma) === 0) {
        displayName = level.displayName || skin.displayName;
    }

    const { ownedBuddies } = useData();
    const buddy = ownedBuddies.find(b => b.levels[0].uuid === item.charmLevelID);

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        onEditClick();
    };

    const handleBuddyEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onBuddyEditClick();
    };

    const handleResetSkinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onHandleResetSkinClick();
    }

    return (
        <div
            className="card weapon-card card-hover"
            onClick={onClick}
            style={{
                cursor: 'pointer',
                opacity: selectedItem ? 1 : 0.55,
                borderColor: selectedItem ? 'var(--signal)' : undefined,
            }}
            title={displayName}>
            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2 position-relative">
                {weapon.category !== 'EEquippableCategory::Melee' && (
                    <button
                        className="btn d-flex justify-content-center align-items-center"
                        style={{ position: 'absolute', bottom: '0.25rem', left: '0.25rem', zIndex: 1, width: '32px', height: '32px', border: '1px solid var(--bs-border-color)', borderRadius: '0.25rem' }}
                        onClick={handleBuddyEditClick}
                        title="Select Buddy">
                        {buddy ? (
                            <Image src={buddy.levels[0].displayIcon} alt={buddy.displayName} width={32} height={32} style={{ objectFit: 'contain' }} unoptimized />
                        ) : (
                            "🔗"
                        )}
                    </button>
                )}
                {selectedItem && parentItem && 
                    <button
                        className="btn d-flex justify-content-center align-items-center"
                        style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', zIndex: 1, width: '32px', height: '32px', border: '1px solid var(--bs-border-color)', borderRadius: '0.25rem' }}
                        onClick={handleResetSkinClick}
                        title="Reset">
                        ⟲
                    </button>
                }
                <Image src={displayIcon} alt={displayName} className="weapon-card-img" width={320} height={90} style={{ objectFit: 'contain' }} unoptimized />
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center p-1" style={{ gap: '0.5rem' }}>
                <small className="text-muted text-truncate" style={{ minWidth: 0 }}>{displayName}</small>
                {canEdit && (
                    <button className="btn btn-sm btn-secondary py-0" onClick={handleEditClick}>
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}
