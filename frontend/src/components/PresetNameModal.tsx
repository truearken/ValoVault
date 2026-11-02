"use client";

import { NamingMode } from '@/hooks/usePresets';
import { useState, useEffect, useRef } from 'react';

type PresetNameModalProps = {
    show: boolean;
    onCloseAction: () => void;
    onSaveAction: (name: string) => void;
    initialName?: string;
    namingMode: NamingMode;
};

export default function PresetNameModal({ show, onCloseAction, onSaveAction, initialName, namingMode }: PresetNameModalProps) {
    const [presetName, setPresetName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    let title = "";
    switch (namingMode) {
        case NamingMode.New:
            title = "Save New Preset";
            break;
        case NamingMode.SaveAsNew:
            title = "Save Preset As New";
            break;
        case NamingMode.Rename:
            title = "Rename Preset";
            break;
        case NamingMode.Variant:
            title = "Create Variant";
            break;
        case NamingMode.Copy:
            title = "Copy Preset";
            break;
    }

    useEffect(() => {
        if (show) {
            setPresetName(initialName || '');
            inputRef.current?.focus();
        }
    }, [show, initialName]);

    const handleSave = () => {
        onSaveAction(presetName);
        setPresetName('');
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onCloseAction}></button>
                    </div>
                    <div className="modal-body">
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-control"
                            placeholder="Preset Name"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
                        <button type="button" className="btn btn-secondary" onClick={onCloseAction}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
