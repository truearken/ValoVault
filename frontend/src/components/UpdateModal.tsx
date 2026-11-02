"use client";

interface UpdateModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentVersion: string;
    newVersion: string;
}

export default function UpdateModal({ show, onClose, onConfirm, currentVersion, newVersion }: UpdateModalProps) {
    if (!show) {
        return null;
    }

    const changelogUrl = `https://github.com/truearken/valovault/releases/tag/v${newVersion}`;

    return (
        <div className="modal modal-accent-signal" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Update Available</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-3">
                            A new version of ValoVault is available!
                        </p>
                        <p className="mb-3" style={{ fontFamily: 'var(--font-plex-mono)', color: 'var(--ash)' }}>
                            v{currentVersion} <span style={{ color: 'var(--signal)' }}>→</span> v{newVersion}
                        </p>
                        <p className="mb-0">
                            <a href={changelogUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--signal)' }}>
                                View changelog on GitHub
                            </a>
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={onConfirm}>Update Now</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Later</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
