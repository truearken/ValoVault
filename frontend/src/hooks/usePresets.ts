import { useState, useEffect, useMemo } from 'react';
import { Preset, LoadoutItemV1 } from '@/lib/types';
import { getPlayerLoadout, savePresets } from '@/services/api';

const DEFAULT_PRESET_ID = 'default-preset';

export enum NamingMode {
    New,
    SaveAsNew,
    Rename,
    Variant,
    Copy
}

export const defaultPreset: Preset = {
    uuid: DEFAULT_PRESET_ID,
    name: 'Current Loadout',
    loadout: {},
    agents: [],
};

export function usePresets(initialPresets: Preset[], initialPlayerLoadout: Record<string, LoadoutItemV1>, onPresetSelectError: (error: unknown) => void) {
    const [presets, setPresets] = useState<Preset[]>(initialPresets);
    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(defaultPreset);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
    const [originalPreset, setOriginalPreset] = useState<Preset | null>(null);
    const [showPresetNameModal, setShowPresetNameModal] = useState(false);
    const [dropdownPreset, setDropdownPreset] = useState<Preset | null>(null);
    const [namingMode, setNamingMode] = useState(NamingMode.New);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [presetToDelete, setPresetToDelete] = useState<Preset | null>(null);
    const [currentLoadout, setCurrentLoadout] = useState<Record<string, LoadoutItemV1>>(initialPlayerLoadout);

    useEffect(() => {
        defaultPreset.loadout = initialPlayerLoadout;
        setCurrentLoadout(initialPlayerLoadout);
        setPresets(initialPresets);
    }, [initialPlayerLoadout, initialPresets]);


    // True when the user is in edit mode and the edited preset actually differs
    // from what it started as (reverting every change counts as clean again).
    const hasUnsavedChanges = useMemo(() => {
        if (!isEditing || !editingPreset || !originalPreset) return false;
        return JSON.stringify(editingPreset.loadout) !== JSON.stringify(originalPreset.loadout)
            || JSON.stringify([...(editingPreset.agents || [])].sort()) !== JSON.stringify([...(originalPreset.agents || [])].sort());
    }, [isEditing, editingPreset, originalPreset]);

    // Keeps the selected/edited copies of a preset in sync when it is changed
    // from elsewhere (e.g. renamed via the list while being edited).
    const patchActivePreset = (uuid: string, patch: Partial<Preset>) => {
        const apply = (p: Preset | null) => (p && p.uuid === uuid ? { ...p, ...patch } : p);
        setSelectedPreset(apply);
        setEditingPreset(apply);
        setOriginalPreset(apply);
    };

    const refreshPlayerLoadout = async (showInView: boolean) => {
        try {
            const playerLoadout = await getPlayerLoadout();
            defaultPreset.loadout = playerLoadout;
            if (showInView) {
                setCurrentLoadout(playerLoadout);
            }
        } catch (error) {
            onPresetSelectError(error);
        }
    };

    const handleSave = async () => {
        if (!editingPreset || editingPreset.uuid === DEFAULT_PRESET_ID) return;

        // Only take over loadout and agents so changes made to the preset while
        // editing (rename, enable toggle) are not overwritten by a stale copy.
        let saved: Preset = editingPreset;
        const updatedPresets = presets.map(p => {
            if (p.uuid !== editingPreset.uuid) return p;
            saved = { ...p, loadout: editingPreset.loadout, agents: editingPreset.agents };
            return saved;
        });
        setPresets(updatedPresets);
        await savePresets(updatedPresets);
        setSelectedPreset(saved);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleSavePresetName = async (name: string) => {
        if (!name) return;

        const newPreset: Preset = {
            uuid: crypto.randomUUID(),
            name,
            loadout: {},
            agents: [],
        };

        // The dropdown preset may be a stale copy if the preset was saved after the
        // dropdown action was triggered, so prefer the current version.
        const sourcePreset = dropdownPreset
            ? presets.find(p => p.uuid === dropdownPreset.uuid) ?? dropdownPreset
            : null;

        switch (namingMode) {
            case NamingMode.Rename: {
                const updatedPresets = presets.map(p =>
                    p.uuid === dropdownPreset!.uuid ? { ...p, name } : p
                );
                setPresets(updatedPresets);
                patchActivePreset(dropdownPreset!.uuid, { name });
                await savePresets(updatedPresets);
                setShowPresetNameModal(false);
                setDropdownPreset(null);
                return;
            }
            case NamingMode.New:
                newPreset.loadout = defaultPreset.loadout;
                newPreset.agents = [];
                break;
            case NamingMode.SaveAsNew:
                newPreset.loadout = currentLoadout;
                newPreset.agents = editingPreset?.agents || originalPreset?.agents || [];
                break;
            case NamingMode.Variant: {
                newPreset.parentUuid = editingPreset?.uuid || originalPreset?.uuid || sourcePreset?.uuid;
                const edited: Record<string, LoadoutItemV1> = {};
                for (const [gun, item] of Object.entries(editingPreset?.loadout || sourcePreset!.loadout)) {
                    const originalGun = originalPreset?.loadout[gun] || sourcePreset!.loadout[gun];
                    if (!originalGun) {
                        edited[gun] = item;
                        continue;
                    }
                    const wasEdited = originalGun.chromaId != item.chromaId || originalGun.skinLevelId != item.skinLevelId;
                    if (wasEdited) {
                        edited[gun] = item;
                    }
                }
                newPreset.loadout = edited;
                break;
            }
            case NamingMode.Copy: {
                newPreset.loadout = { ...sourcePreset!.loadout };
                break;
            }
        }

        const updatedPresets = [...presets.filter(p => p.uuid !== DEFAULT_PRESET_ID), newPreset];
        setPresets(updatedPresets);
        await savePresets(updatedPresets);
        setSelectedPreset(newPreset);
        setCurrentLoadout(newPreset.loadout);

        setShowPresetNameModal(false);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
        setDropdownPreset(null);
    };

    const handlePresetSelect = async (preset: Preset) => {
        if (preset.uuid === DEFAULT_PRESET_ID) {
            try {
                const playerLoadout = await getPlayerLoadout();
                defaultPreset.loadout = playerLoadout;
                setCurrentLoadout(playerLoadout);
            } catch (error) {
                onPresetSelectError(error);
            }
        } else {
            setCurrentLoadout(preset.loadout);
        }

        setSelectedPreset(preset);
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handlePresetDelete = (presetId: string) => {
        const presetToDelete = presets.find(p => p.uuid == presetId)
        setPresetToDelete(presetToDelete!);
        setShowConfirmationModal(true);
    };

    const handleConfirmDelete = async () => {
        if (presetToDelete) {
            const updatedPresets = presets.filter(
                p => p.uuid !== presetToDelete.uuid && p.parentUuid !== presetToDelete.uuid
            );

            const activePreset = editingPreset || selectedPreset;
            if (presetToDelete.uuid === activePreset?.uuid || presetToDelete.uuid === activePreset?.parentUuid) {
                // The preset being viewed/edited is gone, so leave edit mode too.
                setIsEditing(false);
                setEditingPreset(null);
                setOriginalPreset(null);
                const parent = getParent(presetToDelete)
                if (parent) {
                    setSelectedPreset(parent);
                    setCurrentLoadout(parent.loadout);
                } else {
                    setSelectedPreset(defaultPreset);
                    setCurrentLoadout(defaultPreset.loadout);
                }
            }

            setPresets(updatedPresets);
            await savePresets(updatedPresets);

            setPresetToDelete(null);
        }
        setShowConfirmationModal(false);
    };

    const handleCloseConfirmationModal = () => {
        setShowConfirmationModal(false);
        setPresetToDelete(null);
    };

    const handleCancel = () => {
        if (originalPreset) {
            setSelectedPreset(originalPreset);
            setCurrentLoadout(originalPreset.loadout);
        }
        setIsEditing(false);
        setEditingPreset(null);
        setOriginalPreset(null);
    };

    const handleOpenPresetNameModal = (mode: NamingMode) => {
        setNamingMode(mode);
        setShowPresetNameModal(true);
    };

    const handleOpenRenameModal = (preset: Preset) => {
        setNamingMode(NamingMode.Rename)
        setDropdownPreset(preset);
        setShowPresetNameModal(true);
    };

    const handleDropdownVariant = (preset: Preset) => {
        setNamingMode(NamingMode.Variant)
        setDropdownPreset(preset);
        setShowPresetNameModal(true);
    };

    const handleCopyPreset = (preset: Preset) => {
        setNamingMode(NamingMode.Copy);
        setDropdownPreset(preset);
        setShowPresetNameModal(true);
    };

    const handleVariant = () => {
        setNamingMode(NamingMode.Variant)
        setShowPresetNameModal(true);
    }

    const handleClosePresetNameModal = () => {
        setShowPresetNameModal(false);
        setDropdownPreset(null);
    };

    const handleAgentAssignment = (agentIds: string[], isAssigned: boolean) => {
        if (!isEditing) {
            setIsEditing(true);
            setOriginalPreset(selectedPreset);
            setEditingPreset(selectedPreset);
            setSelectedPreset(null);
        }

        setEditingPreset(prev => {
            if (!prev) return null;
            const updatedAgents = isAssigned
                ? [...(prev.agents || []), ...agentIds]
                : (prev.agents || []).filter(id => !agentIds.includes(id));
            return { ...prev, agents: updatedAgents };
        });
    };

    const handleItemChange = (weaponId: string, changedItem: Partial<LoadoutItemV1> | null) => {
        const preset = editingPreset || selectedPreset;
        const parentPreset = presets.find(p => p.uuid === preset?.parentUuid)
        const newLoadoutItem = { ...(editingPreset?.loadout[weaponId] || currentLoadout[weaponId]) || parentPreset?.loadout[weaponId], ...changedItem };

        if (editingPreset) {
            const newLoadout = { ...editingPreset.loadout, [weaponId]: newLoadoutItem };
            if (!changedItem) {
                delete newLoadout[weaponId];
            }
            setEditingPreset({ ...editingPreset, loadout: newLoadout });
            setCurrentLoadout(newLoadout);
        } else if (selectedPreset) {
            setIsEditing(true);
            setOriginalPreset(selectedPreset);
            const newLoadout = { ...selectedPreset.loadout, [weaponId]: newLoadoutItem };
            if (!changedItem) {
                delete newLoadout[weaponId];
            }
            setEditingPreset({ ...selectedPreset, loadout: newLoadout });
            setCurrentLoadout(newLoadout);
            setSelectedPreset(null);
        } else {
            setCurrentLoadout(prev => ({ ...prev, [weaponId]: newLoadoutItem }));
        }
    };

    const handleTogglePreset = async (preset: Preset, checked: boolean) => {
        const updatedPresets = presets.map(p =>
            p.uuid === preset!.uuid ? { ...p, disabled: !checked } : p
        );
        setPresets(updatedPresets);
        patchActivePreset(preset.uuid, { disabled: !checked });
        await savePresets(updatedPresets);
    }

    const getParent = (preset: Preset) => {
        return presets.find(p => p.uuid == preset.parentUuid)
    }

    return {
        presets,
        selectedPreset,
        isEditing,
        hasUnsavedChanges,
        presetToDelete,
        refreshPlayerLoadout,
        editingPreset,
        originalPreset,
        showPresetNameModal,
        dropdownPreset,
        namingMode,
        showConfirmationModal,
        currentLoadout,
        handleSave,
        handleSavePresetName,
        handlePresetSelect,
        handlePresetDelete,
        handleConfirmDelete,
        handleCloseConfirmationModal,
        handleCancel,
        handleOpenPresetNameModal,
        handleOpenRenameModal,
        handleDropdownVariant,
        handleCopyPreset,
        handleVariant,
        handleClosePresetNameModal,
        handleTogglePreset,
        handleAgentAssignment,
        handleItemChange,
        defaultPreset,
        NamingMode
    };
}
