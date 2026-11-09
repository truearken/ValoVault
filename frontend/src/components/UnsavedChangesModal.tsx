"use client";

import { useEffect } from 'react';

interface UnsavedChangesModalProps {
    show: boolean;
    presetName?: string;
    canSave: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onKeepEditing: () => void;
}

export default function UnsavedChangesModal({ show, presetName, canSave, onSave, onDiscard, onKeepEditing }: UnsavedChangesModalProps) {
    useEffect(() => {
        if (!show) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onKeepEditing();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [show, onKeepEditing]);

    if (!show) {
        return null;
    }

    return (
        <div className="modal modal-accent-pulse" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Unsaved Changes</h5>
                        <button type="button" className="btn-close" onClick={onKeepEditing}></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-0">
                            {presetName ? <>You have unsaved changes to <strong>{presetName}</strong>.</> : 'You have unsaved changes.'}
                            {' '}Do you want to discard them or keep editing?
                        </p>
                    </div>
                    <div className="modal-footer">
                        {canSave && <button type="button" className="btn btn-primary" onClick={onSave}>Save &amp; Continue</button>}
                        <button type="button" className="btn btn-danger" onClick={onDiscard}>Discard</button>
                        <button type="button" className="btn btn-secondary" onClick={onKeepEditing} autoFocus>Keep Editing</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
