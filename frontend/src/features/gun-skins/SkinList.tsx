import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Weapon, Skin } from '@/lib/types';
import { useData } from '@/context/DataContext';


type SkinListProps = {
    weapon: Weapon;
    ownedLevelIDs: string[];
    ownedChromaIDs: string[];
    onSkinSelect: (skin: Skin) => void;
    show: boolean;
    onClose: () => void;
};

export default function SkinList({ weapon, ownedLevelIDs, ownedChromaIDs, onSkinSelect, show, onClose }: SkinListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { contentTiers } = useData();

    const tierRankMap = useMemo(() => {
        return contentTiers.reduce((acc, tier) => {
            acc[tier.uuid] = tier.rank;
            return acc;
        }, {} as Record<string, number>);
    }, [contentTiers]);

    const ownedSkins = useMemo(() => {
        const skins = weapon.skins
            .filter(skin => {
                const hasOwnedLevel = skin.levels.some(level => ownedLevelIDs.includes(level.uuid));
                const hasOwnedChroma = skin.chromas.some(chroma => ownedChromaIDs.includes(chroma.uuid));
                return (hasOwnedLevel || hasOwnedChroma);
            });

        skins.sort((a, b) => {
            const rankA = tierRankMap[a.contentTierUuid || ''] || 0;
            const rankB = tierRankMap[b.contentTierUuid || ''] || 0;
            if (rankB !== rankA) {
                return rankB - rankA;
            }
            return a.displayName.localeCompare(b.displayName);
        });

        return skins;
    }, [weapon.skins, ownedLevelIDs, ownedChromaIDs, tierRankMap]);

    const filteredSkins = useMemo(() => {
        return ownedSkins.filter(skin =>
            skin.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [ownedSkins, searchTerm]);

    if (!show) {
        return null;
    }

    const handleClose = () => {
        setSearchTerm("");
        onClose();
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }} onClick={handleBackdropClick}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Skins for {weapon.displayName}</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        {ownedSkins.length === 0 ? (
                            <p>You don&apos;t own any skins for this weapon.</p>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search skins..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
                                    {filteredSkins.length === 0 ? (
                                        <p>No skins found matching your search.</p>
                                    ) : (
                                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                                            {filteredSkins.map((skin) => (
                                                <div key={skin.uuid} className="col" onClick={() => onSkinSelect(skin)}>
                                                    <div className="card h-100 card-hover">
                                                        <Image src={skin.chromas[0].fullRender || skin.displayIcon} alt={skin.displayName} className="card-img-top" width={100} height={100} style={{ objectFit: 'contain' }} />
                                                        <div className="card-body p-2">
                                                            <p className="card-text text-center small">{skin.displayName}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
