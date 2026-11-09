"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import TitleBar from '@/components/TitleBar';
import WeaponGrid from '@/features/gun-skins/WeaponGrid';
import PresetList from '@/features/presets/PresetList';
import AgentAssigner from '@/features/agents/AgentAssigner';
import Footer from '@/components/Footer';
import PresetNameModal from '@/components/PresetNameModal';
import ErrorModal from '@/components/ErrorModal';
import Toast from '@/components/Toast';
import SettingsCard from '@/components/SettingsCard';
import ConfirmationModal from '@/components/ConfirmationModal';
import UnsavedChangesModal from '@/components/UnsavedChangesModal';
import { getPlayerLoadout, getPresets } from '@/services/api';
import { getSettings, saveSettings } from '@/services/settings';
import { LocalClientError } from '@/lib/errors';
import { Preset, LoadoutItemV1, isVariant } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { usePresets, NamingMode, defaultPreset } from '@/hooks/usePresets';
import { useLoadout } from '@/hooks/useLoadout';

export default function Home() {
    const { agents, loading: dataContextLoading, isClientHealthy } = useData();
    const [initialData, setInitialData] = useState<{ presets: Preset[], playerLoadout: Record<string, LoadoutItemV1> }>({ presets: [], playerLoadout: {} });
    const [autoSelectAgent, setAutoSelectAgent] = useState<boolean>();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Loading application data...');
    const [error, setError] = useState<Error | null>(null);

    // If there's an error, throw it during render to trigger ErrorBoundary
    if (error) {
        throw error;
    }

    const {
        showErrorModal,
        errorMessage,
        handleApplyLoadout,
        handleCloseErrorModal,
        showToast,
        toastMessage,
        handleCloseToast,
        setShowErrorModal,
        setErrorMessage
    } = useLoadout();

    const {
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
    } = usePresets(initialData.presets, initialData.playerLoadout, (err) => {
        if (err instanceof LocalClientError) {
            setErrorMessage(err.message);
            setShowErrorModal(true);
        } else {
            // Store error in state to trigger ErrorBoundary on next render
            setError(err instanceof Error ? err : new Error(String(err)));
        }
    });

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [playerLoadout, fetchedPresets, settings] = await Promise.all([
                getPlayerLoadout(),
                getPresets(),
                getSettings(),
            ]);
            setInitialData({ playerLoadout, presets: Array.isArray(fetchedPresets) ? fetchedPresets : [] });
            setAutoSelectAgent(settings?.autoSelectAgent);
            setIsLoading(false);
        } catch (err) {
            if (err instanceof LocalClientError) {
                setIsLoading(true);
            } else {
                // Store error in state to trigger ErrorBoundary on next render
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        }
    }, []);

    useEffect(() => {
        if (isClientHealthy) {
            setLoadingMessage('Loading application data...');
            loadInitialData();
        } else {
            setIsLoading(true);
            setLoadingMessage("Waiting for VALORANT to start...");
        }
    }, [isClientHealthy, loadInitialData]);

    useEffect(() => {
        if (autoSelectAgent !== undefined) {
            saveSettings({ autoSelectAgent: autoSelectAgent });
        }
    }, [autoSelectAgent]);

    // --- Unsaved changes guard -------------------------------------------------
    // Actions that would leave the current edit go through guardNavigation. If
    // there are unsaved changes, the action is parked until the user decides.
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
    useEffect(() => {
        hasUnsavedChangesRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    const canSaveEditing = !!editingPreset && editingPreset.uuid !== defaultPreset.uuid;

    const guardNavigation = (action: () => void) => {
        if (hasUnsavedChanges) {
            setPendingAction(() => action);
        } else {
            action();
        }
    };

    const handleUnsavedKeepEditing = useCallback(() => setPendingAction(null), []);

    const handleUnsavedDiscard = () => {
        const action = pendingAction;
        setPendingAction(null);
        handleCancel();
        action?.();
    };

    const handleUnsavedSave = async () => {
        const action = pendingAction;
        setPendingAction(null);
        await handleSave();
        action?.();
    };

    // Intercept closing the window (title bar button, Alt+F4) while there are
    // unsaved changes.
    useEffect(() => {
        const win = getCurrentWindow();
        let unlisten: (() => void) | undefined;
        let disposed = false;
        win.onCloseRequested((event) => {
            if (hasUnsavedChangesRef.current) {
                event.preventDefault();
                setPendingAction(() => () => { win.destroy(); });
            }
        }).then((fn) => {
            if (disposed) fn(); else unlisten = fn;
        });
        return () => {
            disposed = true;
            unlisten?.();
        };
    }, []);

    // Ctrl+S saves the preset being edited.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (isEditing && canSaveEditing && !showPresetNameModal && !pendingAction) {
                    handleSave();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isEditing, canSaveEditing, showPresetNameModal, pendingAction, handleSave]);

    const handleSkinSelect = (weaponId: string, skinId: string, levelId: string, chromaId: string) => {
        handleItemChange(weaponId, { skinId, skinLevelId: levelId, chromaId });
    };

    const handleBuddySelect = (weaponId: string, charmID: string, charmLevelID: string) => {
        handleItemChange(weaponId, { charmID, charmLevelID });
    };

    const handleSkinReset = (weaponId: string) => {
        handleItemChange(weaponId, null);
    };

    const handleApply = async () => {
        const presetToApply = editingPreset || selectedPreset;
        if (!presetToApply) return;

        const isEditingDefault = isEditing && presetToApply.uuid === defaultPreset.uuid;
        if (isEditing && !isEditingDefault) {
            // Saving also leaves edit mode and selects the saved preset.
            await handleSave();
        }

        const loadoutToApply = buildApplyLoadout(presetToApply)
        const applied = await handleApplyLoadout(loadoutToApply, presetToApply.name);
        if (!applied) return; // keep unsaved edits of the current loadout so the user can retry

        if (isEditingDefault) {
            handleCancel();
        }
        await refreshPlayerLoadout(isEditingDefault || selectedPreset?.uuid === defaultPreset.uuid);
    };

    const handlePresetApply = async (preset: Preset) => {
        const loadoutToApply = buildApplyLoadout(preset);
        const applied = await handleApplyLoadout(loadoutToApply, preset.name);
        if (applied) {
            // Refresh the "Current Loadout" view, unless the user is editing something.
            await refreshPlayerLoadout(!isEditing && selectedPreset?.uuid === defaultPreset.uuid);
        }
    }

    const buildApplyLoadout = (preset: Preset) => {
        const loadoutToApply = { ...preset.loadout };
        if (preset.parentUuid) {
            const parentLoadout = getParent(preset);
            for (const [gun, item] of Object.entries(parentLoadout!)) {
                if (loadoutToApply[gun]) {
                    continue
                }
                loadoutToApply[gun] = item
            }
        }
        return loadoutToApply;
    }

    const getParent = (preset: Preset) => {
        return presets.find(p => p.uuid == preset.parentUuid)?.loadout
    }

    if (isLoading || dataContextLoading) {
        return (
            <>
                <TitleBar />
                <div className="loading-screen d-flex flex-column justify-content-center align-items-center vh-100">
                    <div className="spinner-border spinner-signal" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 loading-status">{loadingMessage}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <TitleBar />
            <main className="container-fluid mt-4 pb-5 h-100">
                <div className="app-layout">
                    <div className="app-layout-main mb-3 scrollable-col">
                        {(() => {
                            const activePreset = editingPreset || selectedPreset;
                            const isDisabled = !activePreset || activePreset.uuid === defaultPreset.uuid || !!activePreset.parentUuid;
                            const parentPreset = activePreset?.parentUuid
                                ? presets.find(p => p.uuid === activePreset.parentUuid)
                                : null;
                            const displayAgents = activePreset?.parentUuid
                                ? (parentPreset?.agents || [])
                                : (activePreset?.agents || []);
                            let loadoutName = (editingPreset || selectedPreset)?.name || 'Loadout'
                            if (parentPreset) {
                                loadoutName = loadoutName + ' - ' + parentPreset.name
                            }
                            return (
                                <div className="panel h-100 d-flex flex-column">
                                    <div className="panel-title">
                                        <span><span className="dot" aria-hidden="true" />{loadoutName}</span>
                                        {hasUnsavedChanges && <small className="unsaved-indicator">Unsaved changes{canSaveEditing ? ' · Ctrl+S to save' : ''}</small>}
                                    </div>
                                    <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
                                        <AgentAssigner
                                            agents={agents}
                                            assignedAgents={displayAgents}
                                            onAssignmentChange={handleAgentAssignment}
                                            disabled={isDisabled}
                                        />
                                        <div className="flex-grow-1 py-2" style={{ overflowY: 'auto', minWidth: 0 }}>
                                            <WeaponGrid onSkinSelectAction={handleSkinSelect}
                                                onBuddySelectAction={handleBuddySelect} currentLoadout={currentLoadout}
                                                onSkinResetAction={handleSkinReset}
                                                parent={getParent(editingPreset || selectedPreset!)} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="app-layout-side scrollable-col">
                        <SettingsCard autoSelectAgent={autoSelectAgent} onAutoSelectAgentChange={setAutoSelectAgent} isLoading={isLoading} />
                        <div className="panel mt-3">
                            <div className="panel-title">
                                <span>Presets</span>
                                <button className="btn btn-primary btn-sm" onClick={() => guardNavigation(() => handleOpenPresetNameModal(NamingMode.New))}>+ New</button>
                            </div>
                            <PresetList presets={presets} onPresetSelect={(preset) => guardNavigation(() => handlePresetSelect(preset))}
                                selectedPreset={selectedPreset} defaultPreset={defaultPreset}
                                onPresetApply={handlePresetApply} onPresetDelete={handlePresetDelete}
                                onPresetRename={handleOpenRenameModal} onCreateVariant={(preset) => guardNavigation(() => handleDropdownVariant(preset))}
                                onCopyPreset={(preset) => guardNavigation(() => handleCopyPreset(preset))} onTogglePreset={handleTogglePreset} agents={agents} />
                        </div>
                    </div>
                </div>
            </main>
            {isEditing && <Footer onSaveAction={handleSave} onCancelAction={handleCancel}
                onSaveAsNewAction={() => handleOpenPresetNameModal(NamingMode.SaveAsNew)}
                onApplyAction={handleApply} onVariantAction={handleVariant}
                isVariant={isVariant(originalPreset)}
                isDefaultPreset={originalPreset?.uuid === defaultPreset.uuid} />}
            <PresetNameModal show={showPresetNameModal} onCloseAction={handleClosePresetNameModal}
                onSaveAction={handleSavePresetName} initialName={dropdownPreset?.name} namingMode={namingMode} />
            <ErrorModal show={showErrorModal} onClose={handleCloseErrorModal} message={errorMessage} />
            <Toast show={showToast} onClose={handleCloseToast} message={toastMessage} />
            <ConfirmationModal
                show={showConfirmationModal}
                onClose={handleCloseConfirmationModal}
                onConfirm={handleConfirmDelete}
                title="Delete Preset"
                message={(() => {
                    const name = presetToDelete?.name ? `"${presetToDelete.name}"` : 'this preset';
                    const variantCount = presetToDelete ? presets.filter(p => p.parentUuid === presetToDelete.uuid).length : 0;
                    const variantNote = variantCount > 0 ? ` Its ${variantCount} variant${variantCount > 1 ? 's' : ''} will be deleted as well.` : '';
                    return `Are you sure you want to delete ${name}?${variantNote}`;
                })()}
            />
            <UnsavedChangesModal
                show={!!pendingAction}
                presetName={editingPreset?.name}
                canSave={canSaveEditing}
                onSave={handleUnsavedSave}
                onDiscard={handleUnsavedDiscard}
                onKeepEditing={handleUnsavedKeepEditing}
            />
        </>
    );
}
