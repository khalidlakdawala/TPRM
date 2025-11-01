
import { AnalysisResult, Settings, Source } from '../../types';

const POSTURE_FACTORS_LIST = "'Network Security', 'DNS Health', 'Patching Cadence', 'Endpoint Security', 'IP Reputation', 'Application Security', 'Cubit Score', 'Privacy', 'Email Security (SPF, DKIM, DMARC)', 'SSL/TLS Configuration'";
const THREAT_FACTORS_LIST = "'Hacker Chatter', 'Information Leak', 'Social Engineering', 'Known Breach'";

const generateFullScanPrompt = (vendorDomain: string): string => {
  return `
    Act as a cybersecurity analyst. Based on your general knowledge, provide a threat intelligence report for a company with the domain "${vendorDomain}".
    Your knowledge is based on your training data, not live web searches. Make educated assessments based on typical security postures for a company of that type.
    
    Provide a detailed analysis for each of the following risk factors. For each factor, you must provide:
    1. A numerical score from 0 to 100, where 100 is the best possible score (lowest risk) and 0 is the worst (highest risk). For the "Known Breach" factor, you must differentiate between recent (last 18 months) and historical breaches. A recent breach should result in a score below 20. A historical breach from 5+ years ago should score 60-80.
    2. A concise summary (1-2 sentences) explaining the reasoning behind the score.
    3. A list of key findings or assessments (as strings).

    The risk factors to analyze are: ${POSTURE_FACTORS_LIST}, ${THREAT_FACTORS_LIST}.

    Additionally, provide an assessment of the following Compliance and Legal Information:
    - Privacy Policy URL: A placeholder or "Not Found".
    - DPA URL: A placeholder or "Not Found".
    - Certifications: A list of likely security or privacy certifications.
    - Laws: A list of major data privacy laws the company likely complies with.

    Finally, provide a list of 3-5 actionable 'recommendations' for a security team.

    After analyzing all individual factors, you must calculate and provide TWO top-level scores:
    1. 'securityPostureScore': Calculate this by taking the average of all Security Posture factors: ${POSTURE_FACTORS_LIST}.
    2. 'threatExposureScore': Calculate this by taking the average of all Threat Exposure factors: ${THREAT_FACTORS_LIST}.
    
    Provide an overall summary that discusses both the security posture and threat exposure.

    IMPORTANT: Your response must be only a single, valid JSON object. Do not include 'overallScore'. The JSON object should conform to the following structure:
    {
      "vendorName": "string",
      "securityPostureScore": "number (0-100)",
      "threatExposureScore": "number (0-100)",
      "summary": "string",
      "riskFactors": [
        {
          "name": "string",
          "score": "number (0-100)",
          "summary": "string",
          "references": ["string"]
        }
      ],
      "compliance": {
        "privacyPolicyUrl": "string ('Not Found')",
        "dpaUrl": "string ('Not Found')",
        "certifications": ["string"],
        "laws": ["string"]
      },
      "recommendations": ["string"]
    }
  `;
};

const generateQuickScanPrompt = (vendorDomain: string): string => {
  return `
    Act as a cybersecurity analyst providing a quick, high-level assessment for "${vendorDomain}" based on your training data.
    
    Provide a brief analysis for ONLY the following critical risk factors:
    - Known Breach (Differentiate recent vs. old breaches)
    - SSL/TLS Configuration
    - IP Reputation
    - Hacker Chatter
    - Information Leak

    For each factor, provide: a score (0-100), a 1-sentence summary, and key assessments.

    After analyzing factors, calculate and provide TWO top-level scores:
    1. 'securityPostureScore': Average of 'SSL/TLS Configuration' and 'IP Reputation'.
    2. 'threatExposureScore': Average of 'Known Breach', 'Hacker Chatter', 'Information Leak'.
    
    Provide 2-3 actionable 'recommendations' and a summary.

    IMPORTANT: Your response must be only a single, valid JSON object. Do not include 'overallScore'. It must have this structure:
    {
      "vendorName": "string",
      "securityPostureScore": "number (0-100)",
      "threatExposureScore": "number (0-100)",
      "summary": "string",
      "riskFactors": [
        { "name": "string", "score": "number", "summary": "string", "references": ["string"] }
      ],
      "recommendations": ["string"]
    }
  `;
};

const calculateOverallScore = (result: Omit<AnalysisResult, 'overallScore'>, settings: Settings): number => {
    const { postureWeight, exposureWeight } = settings;
    const { securityPostureScore, threatExposureScore, riskFactors } = result;

    const totalWeight = postureWeight + exposureWeight;
    if (totalWeight === 0) return 50; // Avoid division by zero, return neutral score

    const weightedScore = 
        (securityPostureScore * (postureWeight / totalWeight)) + 
        (threatExposureScore * (exposureWeight / totalWeight));

    let finalScore = weightedScore;

    const criticalBreachFactor = riskFactors.find(f => f.name === 'Known Breach');
    const criticalLeakFactor = riskFactors.find(f => f.name === 'Information Leak');

    const hasCriticalFinding = 
        (criticalBreachFactor && criticalBreachFactor.score < 40) ||
        (criticalLeakFactor && criticalLeakFactor.score < 40);

    if (hasCriticalFinding) {
        finalScore = Math.min(weightedScore, 50);
    }

    return parseFloat(finalScore.toFixed(1));
};

export const analyze = async (
  vendorDomain: string,
  settings: Settings,
  scanType: 'quick' | 'full'
): Promise<{ result: AnalysisResult; groundingSources: Source[] }> => {
  const { ollamaModel, ollamaUrl } = settings;
  const prompt = scanType === 'quick'
    ? generateQuickScanPrompt(vendorDomain)
    : generateFullScanPrompt(vendorDomain);

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        format: 'json',
        stream: false,
      }),
    });

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    const parsedResult: Omit<AnalysisResult, 'overallScore'> = JSON.parse(responseData.response);
    
    const overallScore = calculateOverallScore(parsedResult, settings);
    const finalResult: AnalysisResult = { ...parsedResult, overallScore };

    return { result: finalResult, groundingSources: [] };

  } catch (error) {
    console.error("Error analyzing vendor with Ollama:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse Ollama's response. Check if the model can output valid JSON.");
    }
    if (error instanceof TypeError) { 
        throw new Error("Could not connect to the Ollama server. Please ensure it's running and the URL is correct in settings.");
    }
    throw new Error("An error occurred while communicating with Ollama.");
  }
};