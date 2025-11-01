import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

const SETTINGS_KEY_PREFIX = 'vendorThreatAnalyzerSettings_';

const defaults: Settings = {
    provider: 'gemini',
    ollamaModel: 'llama3',
    ollamaUrl: 'http://localhost:11434',
    postureWeight: 70,
    exposureWeight: 30,
};

export const useSettings = (userId: number | null) => {
    const [settings, setSettings] = useState<Settings>(defaults);
    const SETTINGS_KEY = userId ? `${SETTINGS_KEY_PREFIX}${userId}` : null;

    useEffect(() => {
        if (!SETTINGS_KEY) return;
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                setSettings({ ...defaults, ...parsed });
            } else {
                setSettings(defaults);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
        }
    }, [SETTINGS_KEY]);

    const saveSettings = useCallback((newSettings: Settings) => {
        if (!SETTINGS_KEY) return;
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, [SETTINGS_KEY]);

    return { settings, saveSettings };
};