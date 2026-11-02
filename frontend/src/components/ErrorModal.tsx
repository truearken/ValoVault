type ErrorModalProps = {
    show: boolean;
    onClose: () => void;
    message: string;
};

export default function ErrorModal({ show, onClose, message }: ErrorModalProps) {
    if (!show) {
        return null;
    }

    return (
        <div className="modal modal-accent-pulse" style={{ display: 'block', backgroundColor: 'rgba(10,14,17,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Error</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
