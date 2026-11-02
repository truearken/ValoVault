"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState, useCallback } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { check, Update } from '@tauri-apps/plugin-updater';
import Image from "next/image";
import UpdateModal from "@/components/UpdateModal";
import styles from "./TitleBar.module.css";

function MinimizeIcon() {
    return (
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="1.5" y1="5" x2="8.5" y2="5" stroke="currentColor" strokeWidth="1" />
        </svg>
    );
}

function MaximizeIcon() {
    return (
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="7" height="7" stroke="currentColor" strokeWidth="1" />
        </svg>
    );
}

function RestoreIcon() {
    return (
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <rect x="1.5" y="3" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1" />
            <path d="M3.5 3V1.5H9V7H7.5" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1" />
            <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" strokeWidth="1" />
        </svg>
    );
}

export default function TitleBar() {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const [appVersion, setAppVersion] = useState('');
    const [isOutdated, setIsOutdated] = useState(false);
    const [newVersion, setNewVersion] = useState('');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<Update | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            const currentVersion = await getVersion();
            setAppVersion(currentVersion);

            const update = await check();

            if (update) {
                setIsOutdated(true);
                setNewVersion(update.version);
                setPendingUpdate(update);
            }
        };

        checkVersion();
    }, []);

    useEffect(() => {
        const win = getCurrentWindow();
        let unlisten: (() => void) | undefined;

        win.isMaximized().then(setIsMaximized);
        win.onResized(() => {
            win.isMaximized().then(setIsMaximized);
        }).then((fn) => {
            unlisten = fn;
        });

        return () => unlisten?.();
    }, []);

    const handleUpdateClick = () => {
        setShowUpdateModal(true);
    };

    const handleUpdateConfirm = async () => {
        setShowUpdateModal(false);

        const update = pendingUpdate || await check();
        if (update) {
            console.log(
                `found update ${update.version} from ${update.date} with notes ${update.body}`
            );
            let downloaded = 0;
            let contentLength = 0;
            await update.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength!;
                        console.log(`started downloading ${event.data.contentLength} bytes`);
                        break;
                    case 'Progress':
                        downloaded += event.data.chunkLength;
                        console.log(`downloaded ${downloaded} from ${contentLength}`);
                        break;
                    case 'Finished':
                        console.log('download finished');
                        break;
                }
            });

            console.log('update installed');
        }
    };

    const handleMinimize = useCallback(() => {
        getCurrentWindow().minimize();
    }, []);

    const handleToggleMaximize = useCallback(() => {
        getCurrentWindow().toggleMaximize();
    }, []);

    const handleClose = useCallback(() => {
        getCurrentWindow().close();
    }, []);

    return (
        <>
            <div className={styles.bar} data-tauri-drag-region>
                <div className={styles.brand} data-tauri-drag-region>
                    <a href="https://valovault.app" target="_blank" rel="noopener noreferrer" className={styles.brandLink}>
                        <Image src="/icon-128.png" alt="" width={16} height={16} className={styles.mark} />
                        <span className={styles.word}>ValoVault</span>
                    </a>
                </div>

                {appVersion && (
                    <div className={styles.status} data-tauri-drag-region>
                        <span className={styles.version}>v{appVersion}</span>
                        {isOutdated && (
                            <button type="button" className={styles.updatePill} onClick={handleUpdateClick} title={`Update to v${newVersion}`}>
                                <span className={styles.dot} aria-hidden="true" />
                                Update ready
                            </button>
                        )}
                    </div>
                )}

                <div className={styles.spacer} data-tauri-drag-region />

                <div className={styles.controls}>
                    <button
                        type="button"
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label="Toggle theme">
                        {isDarkMode ? "☀︎" : "☾"}
                    </button>
                    <span className={styles.divider} aria-hidden="true" />
                    <button type="button" className={styles.winBtn} onClick={handleMinimize} aria-label="Minimize">
                        <MinimizeIcon />
                    </button>
                    <button type="button" className={styles.winBtn} onClick={handleToggleMaximize} aria-label={isMaximized ? "Restore" : "Maximize"}>
                        {isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
                    </button>
                    <button type="button" className={`${styles.winBtn} ${styles.close}`} onClick={handleClose} aria-label="Close">
                        <CloseIcon />
                    </button>
                </div>
            </div>
            <UpdateModal
                show={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onConfirm={handleUpdateConfirm}
                currentVersion={appVersion}
                newVersion={newVersion}
            />
        </>
    );
}
