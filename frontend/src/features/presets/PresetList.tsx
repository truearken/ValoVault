import Image from 'next/image';
import { Preset, Agent } from '@/lib/types';
import Dropdown from 'react-bootstrap/Dropdown';
import Collapse from 'react-bootstrap/Collapse';
import React, { useState } from 'react';

type PresetListProps = {
    presets: Preset[];
    selectedPreset: Preset | null;
    onPresetSelect: (preset: Preset) => void;
    onPresetDelete: (presetId: string) => void;
    onPresetApply: (preset: Preset) => void;
    onPresetRename: (preset: Preset) => void;
    onCreateVariant: (preset: Preset) => void;
    onCopyPreset: (preset: Preset) => void;
    onTogglePreset: (preset: Preset, checked: boolean) => void;
    defaultPreset: Preset;
    agents: Agent[];
};

export default function PresetList({ presets, selectedPreset, onPresetSelect, onPresetDelete, onPresetApply, onPresetRename, onCreateVariant, onCopyPreset, onTogglePreset, defaultPreset, agents }: PresetListProps) {
    const savedPresets = Array.isArray(presets) ? presets.filter(p => p.uuid !== 'default-preset') : [];

    const getAgentIcons = (agentIds: string[] | undefined) => {
        if (!agentIds) return null;

        if (agentIds.length > 3) {
            const firstTwoAgents = agentIds.slice(0, 2);
            const icons = firstTwoAgents.map(agentId => {
                const agent = agents.find(a => a.uuid === agentId);
                return agent ? <Image key={agent.uuid} src={agent.displayIcon} alt={agent.displayName} width={22} height={22} className="me-1 rounded-circle" unoptimized /> : null;
            });
            icons.push(<span key="plus" className="me-1 rounded-circle border d-inline-flex align-items-center justify-content-center" style={{ width: 30, height: 22 }}>+{agentIds.length - 2}</span>);
            return icons;
        }

        return agentIds.map(agentId => {
            const agent = agents.find(a => a.uuid === agentId);
            return agent ? <Image key={agent.uuid} src={agent.displayIcon} alt={agent.displayName} width={22} height={22} className="me-1 rounded-circle" unoptimized /> : null;
        });
    };

    const topLevelPresets = savedPresets.filter(p => !p.parentUuid);
    const childrenByParent = savedPresets.reduce((acc, preset) => {
        if (preset.parentUuid) {
            (acc[preset.parentUuid] = acc[preset.parentUuid] || []).push(preset);
        }
        return acc;
    }, {} as Record<string, Preset[]>);

    const [expandedPresets, setExpandedPresets] = useState<Set<string>>(new Set());

    const toggleExpanded = (presetId: string) => {
        setExpandedPresets(prev => {
            const next = new Set(prev);
            if (next.has(presetId)) {
                next.delete(presetId);
            } else {
                next.add(presetId);
            }
            return next;
        });
    };

    return (
        <div>
            <div className="list-group">
                <button
                    type="button"
                    className={`list-group-item list-group-item-action ${selectedPreset?.uuid === defaultPreset.uuid ? 'active' : ''}`}
                    onClick={() => onPresetSelect(defaultPreset)}>
                    {defaultPreset.name}
                </button>
            </div>
            <p className="section-label mt-3">Saved Presets</p>
            {savedPresets.length === 0 ? (
                <p className="empty-note">No presets saved yet. Use <strong>+ New</strong> above to build one from your current loadout.</p>
            ) : (
                <div className="list-group">
                    {topLevelPresets.map((preset) => (
                        <React.Fragment key={preset.uuid}>
                            <div className={`list-group-item d-flex justify-content-between align-items-center ${selectedPreset?.uuid === preset.uuid ? 'active' : ''}`}>
                                <div className="d-flex align-items-center flex-grow-1 overflow-hidden" style={{ cursor: 'pointer' }}>
                                    {childrenByParent[preset.uuid]?.length > 0 && (
                                        <span
                                            onClick={(e) => { e.stopPropagation(); toggleExpanded(preset.uuid); }}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s ease',
                                                transform: expandedPresets.has(preset.uuid) ? 'rotate(90deg)' : 'rotate(0deg)',
                                                display: 'inline-flex',
                                                marginRight: '8px',
                                                flexShrink: 0
                                            }}
                                        >
                                            ▸
                                        </span>
                                    )}
                                    <div className="flex-grow-1 overflow-hidden" onClick={() => onPresetSelect(preset)}>
                                        <div className="text-truncate">{preset.name}</div>
                                        {getAgentIcons(preset.agents)}
                                    </div>
                                </div>
                                <div className="d-flex flex-shrink-0 gap-1">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch" checked={!preset.disabled} onChange={(e) => onTogglePreset(preset, e.target.checked)} />
                                    </div>
                                    <button className="btn btn-success btn-sm" onClick={() => onPresetApply(preset)}>Apply</button>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="outline-secondary" size="sm" aria-label="More actions" />
                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#" onClick={() => onPresetRename(preset)}>Rename</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => onCopyPreset(preset)}>Copy</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => onPresetDelete(preset.uuid)}>Delete</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => { onCreateVariant(preset); setExpandedPresets(prev => new Set(prev).add(preset.uuid)) }}>Create Variant</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <Collapse in={expandedPresets.has(preset.uuid)}>
                                <div>
                                    {childrenByParent[preset.uuid]?.map(child => (
                                        <div
                                            key={child.uuid}
                                            className={`list-group-item d-flex justify-content-between align-items-center ${selectedPreset?.uuid === child.uuid ? 'active' : ''}`}
                                            style={{ paddingLeft: '2rem', borderLeft: '2px solid var(--bs-border-color)', marginLeft: '0.5rem' }}
                                        >
                                            <div className="flex-grow-1 overflow-hidden" onClick={() => onPresetSelect(child)} style={{ cursor: 'pointer' }}>
                                                <div className="text-truncate">{child.name}</div>
                                                {getAgentIcons(child.agents)}
                                            </div>
                                            <div className="d-flex flex-shrink-0 gap-1">
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" role="switch" checked={!child.disabled} onChange={(e) => onTogglePreset(child, e.target.checked)} />
                                                </div>
                                                <button className="btn btn-success btn-sm" onClick={() => onPresetApply(child)}>Apply</button>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="outline-secondary" size="sm" aria-label="More actions" />
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="#" onClick={() => onPresetRename(child)}>Rename</Dropdown.Item>
                                                        <Dropdown.Item href="#" onClick={() => onPresetDelete(child.uuid)}>Delete</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}
