
import React, { useState } from 'react';
import { Settings, AIProvider } from '../types';

interface SettingsModalProps {
  currentSettings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
  const [provider, setProvider] = useState<AIProvider>(currentSettings.provider);
  const [ollamaModel, setOllamaModel] = useState(currentSettings.ollamaModel);
  const [ollamaUrl, setOllamaUrl] = useState(currentSettings.ollamaUrl);
  const [postureWeight, setPostureWeight] = useState(currentSettings.postureWeight);
  const [exposureWeight, setExposureWeight] = useState(currentSettings.exposureWeight);

  const handleSave = () => {
    onSave({ provider, ollamaModel, ollamaUrl, postureWeight, exposureWeight });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
      <div className="bg-[#161b22] border border-gray-700 rounded-lg shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-4">AI Provider</h3>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">AI Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AIProvider)}
            className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500"
          >
            <option value="gemini">Google Gemini (Live Web Search)</option>
            <option value="ollama">Local Ollama (Offline Knowledge)</option>
          </select>
        </div>

        {provider === 'ollama' && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <label htmlFor="ollama-url" className="block text-sm font-medium text-gray-400 mb-2">Ollama API URL</label>
              <input
                id="ollama-url"
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-3 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., http://localhost:11434"
              />
            </div>
            <div>
              <label htmlFor="ollama-model" className="block text-sm font-medium text-gray-400 mb-2">Ollama Model</label>
              <input
                id="ollama-model"
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-700 rounded-md px-3 py-2 text-gray-200"
                placeholder="e.g., llama3"
              />
            </div>
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-4 mt-6">Scoring Weights</h3>
        <div className="mt-4 space-y-4">
            <div>
                <label htmlFor="posture-weight" className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                    <span>Security Posture Weight</span>
                    <span className="font-bold text-cyan-400">{postureWeight}%</span>
                </label>
                <input
                    id="posture-weight"
                    type="range"
                    min="0"
                    max="100"
                    value={postureWeight}
                    onChange={(e) => setPostureWeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
                />
            </div>
            <div>
                <label htmlFor="exposure-weight" className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                    <span>Threat Exposure Weight</span>
                    <span className="font-bold text-cyan-400">{exposureWeight}%</span>
                </label>
                <input
                    id="exposure-weight"
                    type="range"
                    min="0"
                    max="100"
                    value={exposureWeight}
                    onChange={(e) => setExposureWeight(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};