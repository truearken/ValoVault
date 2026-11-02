import Image from 'next/image';
import { useState } from 'react';
import { Agent } from '@/lib/types';

type AgentSelectionModalProps = {
    show: boolean;
    onClose: () => void;
    agents: Agent[];
    onAgentSelect: (agentIds: string[]) => void;
};

export default function AgentSelectionModal({ show, onClose, agents, onAgentSelect }: AgentSelectionModalProps) {
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

    if (!show) {
        return null;
    }

    const handleAgentClick = (agentId: string) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        );
    };

    const handleConfirm = () => {
        onAgentSelect(selectedAgents);
        handleClose();
    };

    const handleClose = () => {
        setSelectedAgents([]);
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
                        <h5 className="modal-title">Select Agent(s)</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden', padding: '1rem' }}>
                            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                                {agents.map((agent) => (
                                    <div key={agent.uuid} className="col" onClick={() => handleAgentClick(agent.uuid)}>
                                        <div className="card card-hover h-100" style={{ cursor: 'pointer', borderColor: selectedAgents.includes(agent.uuid) ? 'var(--signal)' : undefined }}>
                                            <div className="card-body d-flex flex-column justify-content-center align-items-center p-2">
                                                <Image src={agent.displayIcon} alt={agent.displayName} className="img-fluid rounded-circle" width={80} height={80} style={{ objectFit: 'cover' }} unoptimized />
                                            </div>
                                            <div className="card-footer text-center p-1">
                                                <small className="text-muted text-center mt-1">{agent.displayName}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={selectedAgents.length === 0}>
                            Add ({selectedAgents.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
