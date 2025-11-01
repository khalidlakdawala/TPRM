
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, Settings, Source, ContractAnalysisResult } from '../../types';

const POSTURE_FACTORS_LIST = "'Network Security', 'DNS Health', 'Patching Cadence', 'Endpoint Security', 'IP Reputation', 'Application Security', 'Cubit Score', 'Privacy', 'Email Security (SPF, DKIM, DMARC)', 'SSL/TLS Configuration'";
const THREAT_FACTORS_LIST = "'Hacker Chatter', 'Information Leak', 'Social Engineering', 'Known Breach'";


const generateFullScanPrompt = (vendorDomain: string): string => {
  return `
    Act as a world-class cybersecurity threat intelligence analyst. Your task is to provide a comprehensive, live threat intelligence report for the vendor with the domain: "${vendorDomain}".

    Use your web search capabilities to gather the most current information available. Based on your findings, provide a detailed analysis for each of the following risk factors. For each factor, you must provide:
    1. A numerical score from 0 to 100, where 100 is the best possible score (lowest risk) and 0 is the worst (highest risk). For the "Known Breach" factor, you must differentiate between recent (last 18 months) and historical breaches. A recent, unmitigated breach should result in a score below 20. A historical breach from 5+ years ago that has been addressed should have a much milder impact, scoring 60-80.
    2. A concise summary (1-2 sentences) explaining the reasoning behind the score, citing specific findings.
    3. A list of key findings or source descriptions (as strings) that support your analysis for that specific factor.

    The risk factors to analyze are:
    - Network Security
    - DNS Health
    - Patching Cadence
    - Endpoint Security
    - IP Reputation
    - Application Security
    - Cubit Score (Interpret this as an overall public security posture score based on available data)
    - Hacker Chatter (Mention of the vendor in dark web/hacker forums)
    - Information Leak (Past or recent data breaches or credential leaks)
    - Social Engineering (Susceptibility to phishing, public employee information)
    - Privacy (Analysis of privacy policy, data handling practices, and compliance with regulations like GDPR/CCPA)
    - Known Breach (Historical and recent data breaches or security incidents)
    - Email Security (SPF, DKIM, DMARC) (Analysis of the domain's email authentication records: SPF, DKIM, and DMARC setup and strictness)
    - SSL/TLS Configuration (Validation of the SSL certificate, including expiration, issuer, and modern security practices like TLS 1.3 support)

    Additionally, find and provide the following Compliance and Legal Information:
    - Privacy Policy URL: The direct link to their privacy policy.
    - DPA URL: The direct link to their Data Processing Agreement, if publicly available.
    - Certifications: A list of any published security or privacy certifications (e.g., "SOC 2 Type II", "ISO 27001").
    - Laws: A list of major data privacy laws the company is known to comply with (e.g., "GDPR", "CCPA").
    
    Finally, based on the entire analysis, provide a section with 'recommendations'. This should be a list of 3-5 actionable recommendations for a security team.

    After analyzing all individual factors, you must calculate and provide TWO top-level scores:
    1. 'securityPostureScore': Calculate this by taking the average of all Security Posture factors: ${POSTURE_FACTORS_LIST}.
    2. 'threatExposureScore': Calculate this by taking the average of all Threat Exposure factors: ${THREAT_FACTORS_LIST}.
    
    Provide an overall summary that discusses both the security posture and threat exposure, preparing the user for a final score that will weigh both.

    IMPORTANT: Your final output MUST be a single, valid JSON object. Do NOT include 'overallScore'. The JSON object should conform to the following structure:
    {
      "vendorName": "string",
      "securityPostureScore": "number (0-100)",
      "threatExposureScore": "number (0-100)",
      "summary": "string",
      "riskFactors": [
        {
          "name": "string (e.g., 'Network Security')",
          "score": "number (0-100)",
          "summary": "string",
          "references": [
            "string (A key finding or source description)"
          ]
        }
      ],
      "compliance": {
        "privacyPolicyUrl": "string (URL or 'Not Found')",
        "dpaUrl": "string (URL or 'Not Found')",
        "certifications": ["string"],
        "laws": ["string"]
      },
      "recommendations": [
        "string (Actionable recommendation 1)"
      ]
    }
  `;
};

const generateQuickScanPrompt = (vendorDomain: string): string => {
  return `
    Act as a cybersecurity threat intelligence analyst performing a quick, high-level assessment for the domain: "${vendorDomain}".

    Use your web search capabilities to gather current information. Based on your findings, provide a brief analysis for ONLY the following critical risk factors:
    - Known Breach (Historical and recent data breaches. Differentiate between recent breaches (last 18 months) vs old ones).
    - SSL/TLS Configuration (Certificate validity and security practices)
    - IP Reputation (Association with malicious activities)
    - Hacker Chatter (Mentions on dark web/hacker forums)
    - Information Leak (Credential leaks or sensitive data exposure)

    For each factor, provide: a numerical score from 0-100 (100=best), a 1-sentence summary, and a list of key findings (as strings).
    
    After analyzing factors, calculate and provide TWO top-level scores:
    1. 'securityPostureScore': Average of 'SSL/TLS Configuration' and 'IP Reputation'.
    2. 'threatExposureScore': Average of 'Known Breach', 'Hacker Chatter', 'Information Leak'.
    
    Provide 2-3 actionable recommendations and an overall summary.

    IMPORTANT: Your final output MUST be a single, valid JSON object. Do NOT include 'overallScore'. It must conform to this structure:
    {
      "vendorName": "string",
      "securityPostureScore": "number (0-100)",
      "threatExposureScore": "number (0-100)",
      "summary": "string",
      "riskFactors": [
        { "name": "string", "score": "number", "summary": "string", "references": ["string"] }
      ],
      "recommendations": [
        "string (Actionable recommendation)"
      ]
    }
  `;
};

const generateContractAnalysisPrompt = (contractText: string): string => {
  return `
    Act as a legal expert specializing in cybersecurity and data privacy law. You are reviewing a vendor contract or Master Service Agreement (MSA) for a customer.
    
    Your task is to analyze the following contract text and identify its strengths and weaknesses from the CUSTOMER'S perspective. Focus exclusively on clauses related to cybersecurity, data privacy, liability, and incident response.
    
    Key areas to scrutinize:
    - Data Protection & Security Obligations: Does the vendor commit to specific security standards (e.g., encryption, access controls, industry best practices)?
    - Incident Notification: What is the vendor's obligation to notify the customer of a security breach? Look for specific timelines (e.g., "within 24 hours", "without undue delay"). Vague language is a weakness.
    - Liability & Indemnification: Who is financially responsible for a breach? Are there liability caps? A low liability cap for the vendor is a major weakness for the customer.
    - Right to Audit: Does the customer have the right to audit the vendor's security practices or review third-party audit reports (like SOC 2)?
    - Data Ownership & Return/Destruction: Does the contract clearly state the customer owns their data and outlines procedures for its secure return or destruction upon contract termination?
    - Compliance with Laws: Does the vendor commit to complying with relevant data privacy laws (e.g., GDPR, CCPA)?

    Based on your analysis of the provided text, produce a JSON object with three keys: "strengths", "weaknesses", and "overallAssessment".
    - "strengths": An array of strings. Each string should describe a specific clause or commitment that is favorable to the customer.
    - "weaknesses": An array of strings. Each string should describe a missing clause, a vague statement, or a term that is unfavorable to the customer.
    - "overallAssessment": A concise, one-paragraph summary. Conclude whether the contract provides Strong, Moderate, or Weak protection for the customer regarding cybersecurity and data privacy.

    Contract Text to Analyze:
    ---
    ${contractText}
    ---

    IMPORTANT: Your final output MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown.
    Example JSON structure:
    {
      "strengths": [
        "The vendor commits to notifying us of a security incident within 48 hours of discovery, which is a clear and reasonable timeframe.",
        "The contract grants us the right to perform annual security audits, providing valuable oversight."
      ],
      "weaknesses": [
        "The contract contains a low liability cap for data breaches, limiting the vendor's financial responsibility to only the fees paid in the last 6 months.",
        "The data protection clause is vague, mentioning only 'reasonable security measures' without defining them or referencing a specific standard."
      ],
      "overallAssessment": "The contract provides Moderate protection. While it has strong incident notification and audit rights, the low liability cap for breaches presents a significant financial risk to our company. This section should be renegotiated before signing."
    }
  `;
}

const cleanJsonString = (rawText: string): string => {
  const match = rawText.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return rawText.trim();
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

export const analyze = async (vendorDomain: string, settings: Settings, scanType: 'quick' | 'full'): Promise<{ result: AnalysisResult; groundingSources: Source[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Google Gemini API Key is not configured in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = scanType === 'quick' 
    ? generateQuickScanPrompt(vendorDomain) 
    : generateFullScanPrompt(vendorDomain);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const rawText = response.text;
    const jsonString = cleanJsonString(rawText);
    const parsedResult: Omit<AnalysisResult, 'overallScore'> = JSON.parse(jsonString);

    const overallScore = calculateOverallScore(parsedResult, settings);
    const finalResult: AnalysisResult = { ...parsedResult, overallScore };

    const groundingSources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title,
      }))
      .filter((source: any): source is Source => source.uri && source.title) || [];
      
    const uniqueSources = Array.from(new Map(groundingSources.map(item => [item.uri, item])).values());

    return { result: finalResult, groundingSources: uniqueSources };
  } catch (error) {
    console.error("Error analyzing vendor with Gemini:", error);
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Gemini's response. The format was invalid. Raw response: ${error.message}`);
    }
    throw new Error("An error occurred while communicating with Gemini. Please try again.");
  }
};


export const analyzeContract = async (contractText: string): Promise<ContractAnalysisResult> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Google Gemini API Key is not configured in the environment.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = generateContractAnalysisPrompt(contractText);

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });

        const rawText = response.text;
        const jsonString = cleanJsonString(rawText);
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error analyzing contract with Gemini:", error);
        if (error instanceof SyntaxError) {
            throw new Error(`Failed to parse Gemini's contract analysis response. The format was invalid.`);
        }
        throw new Error("An error occurred while analyzing the contract with Gemini.");
    }
};
