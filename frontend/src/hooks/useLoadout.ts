import { useState } from 'react';
import { applyLoadout } from '@/services/api';
import { LocalClientError } from '@/lib/errors';
import { LoadoutItemV1 } from '@/lib/types';

export function useLoadout() {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleApplyLoadout = async (loadout: Record<string, LoadoutItemV1>, presetName: string): Promise<boolean> => {
        try {
            await applyLoadout(loadout);
            setToastMessage(`Successfully applied ${presetName}.`);
            setShowToast(true);
            return true;
        } catch (error) {
            if (error instanceof LocalClientError) {
                setErrorMessage(error.message);
                setShowErrorModal(true);
            } else {
                console.error(error);
                setErrorMessage('An unexpected error occurred.');
                setShowErrorModal(true);
            }
            return false;
        }
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
    };

    const handleCloseToast = () => {
        setShowToast(false);
    };

    return {
        showToast,
        toastMessage,
        showErrorModal,
        errorMessage,
        handleApplyLoadout,
        handleCloseErrorModal,
        handleCloseToast,
        setShowErrorModal,
        setErrorMessage
    };
}
