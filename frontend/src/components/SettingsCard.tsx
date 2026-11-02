"use client";

type SettingsCardProps = {
    autoSelectAgent?: boolean;
    onAutoSelectAgentChange: (value: boolean) => void;
    isLoading: boolean;
};

export default function SettingsCard({ autoSelectAgent, onAutoSelectAgentChange, isLoading }: SettingsCardProps) {
    return (
        <div className="panel mb-3">
            <div className="panel-title">
                <span>Settings</span>
            </div>
            <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" role="switch" id="autoSelectAgentSwitch" checked={autoSelectAgent || false} onChange={(e) => onAutoSelectAgentChange(e.target.checked)} disabled={isLoading} />
                <label className="form-check-label" htmlFor="autoSelectAgentSwitch">Auto-select agent-specific loadout</label>
            </div>
        </div>
    );
}
