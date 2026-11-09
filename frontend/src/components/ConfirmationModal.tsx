"use client";

import { useEffect } from 'react';

interface ConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
}

export default function ConfirmationModal({ show, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: ConfirmationModalProps) {
    useEffect(() => {
        if (!show) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="modal modal-accent-pulse" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose} autoFocus>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
