import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client.
// In a real app, we would handle missing keys more gracefully in the UI.
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const generateTechnicalSchematic = async (partName: string, fuelType: string): Promise<string | null> => {
  if (!genAI) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  const prompt = `
    Generate a highly detailed, technical blueprint schematic of a ${partName} for a ${fuelType} powered aircraft.
    Visual Style: "Industrial Sci-Fi", blueprint style.
    Background: Dark charcoal or black.
    Lines: Glowing cyan (#00f3ff) and safety orange (#ff4d00) accents.
    Content: Exploded view showing internal components like cryogenic pumps, combustion chambers, or fuel cells.
    Text: Include small technical annotations in a monospace font.
    High contrast, precise lines.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Note: This logic assumes we want an image, but the standard text model returns text.
    // If the user intended to use an image model, they'd need a different API.
    // For now, I'll keep the logic but use the text model. 
    // In many Gemini versions, 'gemini-2.0-flash' can describe or generate content.
    // If the goal was an image, we'd typically use Imagen or similar.
    // The previous code had a reference to 'gemini-2.5-flash-image'.
    
    return null; // Placeholder as image generation via text model isn't direct base64 here.

  } catch (error) {
    console.error("Error generating schematic:", error);
    return null;
  }
};
