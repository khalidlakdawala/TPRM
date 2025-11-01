
import { analyze as analyzeWithGemini, analyzeContract as analyzeContractWithGemini } from './providers/gemini';
import { analyze as analyzeWithOllama } from './providers/ollama';
import { Settings, AnalysisResult, Source, ContractAnalysisResult } from '../types';

export const analyzeVendor = async (
  vendorDomain: string,
  settings: Settings,
  scanType: 'quick' | 'full'
): Promise<{ result: AnalysisResult; groundingSources: Source[] }> => {
  if (settings.provider === 'ollama') {
    return analyzeWithOllama(vendorDomain, settings, scanType);
  }
  
  // Default to Gemini
  return analyzeWithGemini(vendorDomain, settings, scanType);
};

export const analyzeContract = async (
  contractText: string,
  settings: Settings
): Promise<ContractAnalysisResult> => {
  if (settings.provider === 'ollama') {
    // For simplicity, this demo will re-use the Gemini provider for contract analysis
    // as Ollama setup can be complex. In a real-world scenario, you'd implement
    // an equivalent `analyzeContractWithOllama` function.
    console.warn("Ollama provider selected, but contract analysis will use Gemini for this demo.");
  }
  
  // Default to Gemini
  return analyzeContractWithGemini(contractText);
}