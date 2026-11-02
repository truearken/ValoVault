import Image from 'next/image';
import { useState } from 'react';
import { LoadoutItemV1 } from '@/lib/types';
import { useData } from '@/context/DataContext';

type GunBuddySelectionModalProps = {
    onSelect: (charmID: string, charmLevelID: string) => void;
    onClose: () => void;
    weaponName: string;
    currentLoadout: Record<string, LoadoutItemV1>;
};

export default function GunBuddySelectionModal({ onSelect, onClose, weaponName, currentLoadout }: GunBuddySelectionModalProps) {
    const { ownedBuddies } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBuddies = ownedBuddies.filter(b =>
        b.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getBuddyUsage = (loadout: Record<string, LoadoutItemV1>, buddyId: string): number => {
        return Object.values(loadout).filter(item => item.charmID === buddyId).length;
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }} onClick={handleBackdropClick}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Gun buddies for {weaponName}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {ownedBuddies.length === 0 ? (
                            <p>You don&apos;t own any gun buddies.</p>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search gun buddies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
                                    <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                                        <div className="col">
                                            <div
                                                className="card h-100 card-hover"
                                                onClick={() => onSelect('', '')}
                                                style={{ cursor: 'pointer' }}>
                                                <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                                                    <span style={{ fontSize: '3rem' }}>🚫</span>
                                                </div>
                                                <div className="card-footer p-1">
                                                    <small className="text-muted text-truncate">None</small>
                                                </div>
                                            </div>
                                        </div>
                                        {filteredBuddies.map((buddy) => {
                                            const usage = getBuddyUsage(currentLoadout, buddy.uuid);
                                            const isDisabled = usage >= buddy.amount;

                                            return (
                                                <div key={buddy.uuid} className="col" onClick={() => !isDisabled && onSelect(buddy.uuid, buddy.levels[0].uuid)}>
                                                    <div className={`card h-100 card-hover ${isDisabled ? 'disabled' : ''}`} style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                                                        <Image src={buddy.levels[0].displayIcon} alt={buddy.displayName} className="card-img-top" width={100} height={100} style={{ objectFit: 'contain' }} unoptimized />
                                                        <div className="card-body p-2">
                                                            <p className="card-text text-center small">{buddy.displayName}</p>
                                                        </div>
                                                        {isDisabled && <div className="card-footer p-1"><small className="text-danger">In use</small></div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
