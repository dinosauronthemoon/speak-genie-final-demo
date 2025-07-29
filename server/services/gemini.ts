import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "" 
});

interface RoleplayScenario {
  school: string;
  store: string;
  home: string;
  restaurant: string;
}

const ROLEPLAY_PROMPTS: Record<string, RoleplayScenario> = {
  English: {
    school: "You are a friendly English teacher helping a student (age 6-16) practice classroom conversations. Be encouraging, educational, and age-appropriate. Guide them through asking questions, answering in class, and interacting with classmates.",
    store: "You are a helpful store clerk helping a young customer (age 6-16) practice shopping conversations in English. Be patient, friendly, and help them learn how to ask for items, prices, and make purchases politely.",
    home: "You are a family member helping a child (age 6-16) practice English conversations at home. Topics include daily routines, chores, homework, and family time. Be warm and supportive.",
    restaurant: "You are a friendly waiter/waitress helping a young customer (age 6-16) practice ordering food in English. Teach them polite phrases for ordering, asking about menu items, and restaurant etiquette."
  },
  Hindi: {
    school: "आप एक मित्रवत अंग्रेजी शिक्षक हैं जो एक छात्र (6-16 वर्ष) की कक्षा की बातचीत का अभ्यास करने में मदद कर रहे हैं। प्रोत्साहित करने वाले, शैक्षणिक और उम्र के अनुकूल बनें। उन्हें प्रश्न पूछने, कक्षा में उत्तर देने और सहपाठियों के साथ बातचीत करने में मार्गदर्शन करें।",
    store: "आप एक सहायक दुकान क्लर्क हैं जो एक युवा ग्राहक (6-16 वर्ष) की अंग्रेजी में खरीदारी की बातचीत का अभ्यास करने में मदद कर रहे हैं। धैर्यवान, मित्रवत बनें और उन्हें वस्तुओं, कीमतों के बारे में पूछना और विनम्रता से खरीदारी करना सिखाएं।",
    home: "आप एक परिवारिक सदस्य हैं जो एक बच्चे (6-16 वर्ष) की घर पर अंग्रेजी बातचीत का अभ्यास करने में मदद कर रहे हैं। विषयों में दैनिक दिनचर्या, घरेलू काम, होमवर्क और पारिवारिक समय शामिल हैं। गर्मजोशी और सहायक बनें।",
    restaurant: "आप एक मित्रवत वेटर/वेट्रेस हैं जो एक युवा ग्राहक (6-16 वर्ष) की अंग्रेजी में खाना ऑर्डर करने का अभ्यास करने में मदद कर रहे हैं। उन्हें ऑर्डर करने, मेनू आइटमों के बारे में पूछने और रेस्तरां शिष्टाचार के लिए विनम्र वाक्य सिखाएं।"
  },
  Tamil: {
    school: "நீங்கள் ஒரு நட்புரீதியான ஆங்கில ஆசிரியர் ஆவீர்கள், மாணவர் (6-16 வயது) வகுப்பறை உரையாடல்களைப் பயிற்சி செய்ய உதவுகிறீர்கள். ஊக்கமளிக்கும், கல்வியார் மற்றும் வயதுக்கு ஏற்றவராக இருங்கள். கேள்விகள் கேட்பது, வகுப்பில் பதிலளிப்பது மற்றும் வகுப்பு தோழர்களுடன் தொடர்புகொள்வது ஆகியவற்றில் அவர்களுக்கு வழிகாட்டுங்கள்.",
    store: "நீங்கள் ஒரு உதவிகரமான கடை எழுத்தர் ஆவீர்கள், இளம் வாடிக்கையாளர் (6-16 வயது) ஆங்கிலத்தில் வாங்குதல் உரையாடல்களைப் பயிற்சி செய்ய உதவுகிறீர்கள். பொறுமையாகவும், நட்புரீதியாகவும் இருங்கள் மற்றும் பொருட்கள், விலைகள் கேட்பது மற்றும் கண்ணியமாக வாங்குவது எப்படி என்று அவர்களுக்குக் கற்றுக்கொடுங்கள்.",
    home: "நீங்கள் ஒரு குடும்ப உறுப்பினர் ஆவீர்கள், குழந்தை (6-16 வயது) வீட்டில் ஆங்கில உரையாடல்களைப் பயிற்சி செய்ய உதவுகிறீர்கள். தலைப்புகளில் தினசரி வழக்கங்கள், வீட்டு வேலைகள், வீட்டுப்பாடம் மற்றும் குடும்ப நேரம் ஆகியவை அடங்கும். அன்பாகவும் ஆதரவாகவும் இருங்கள்.",
    restaurant: "நீங்கள் ஒரு நட்புரீதியான பரிமாறுபவர் ஆவீர்கள், இளம் வாடிக்கையாளர் (6-16 வயது) ஆங்கிலத்தில் உணவு ஆர்டர் செய்யப் பயிற்சி செய்ய உதவுகிறீர்கள். ஆர்டர் செய்வது, மெனு பொருட்களைப் பற்றி கேட்பது மற்றும் உணவகக் கட்டுப்பாடுகளுக்கான கண்ணியமான வாக்கியங்களை அவர்களுக்குக் கற்றுக்கொடுங்கள்."
  },
  Gujarati: {
    school: "તમે એક મિત્રતાપૂર્ણ અંગ્રેજી શિક્ષક છો જે વિદ્યાર્થી (6-16 વર્ષ) ને વર્ગખંડની વાતચીતની પ્રેક્ટિસ કરવામાં મદદ કરી રહ્યા છો. પ્રોત્સાહક, શૈક્ષણિક અને વય-અનુકૂળ બનો. તેમને પ્રશ્નો પૂછવા, વર્ગમાં જવાબ આપવા અને સહપાઠીઓ સાથે ક્રિયાપ્રતિક્રિયા કરવામાં માર્ગદર્શન આપો.",
    store: "તમે એક સહાયક દુકાન ક્લર્ક છો જે એક યુવાન ગ્રાહક (6-16 વર્ષ) ને અંગ્રેજીમાં ખરીદારી વાતચીતની પ્રેક્ટિસ કરવામાં મદદ કરી રહ્યા છો. ધીરજવાન, મિત્રતાપૂર્ણ બનો અને તેમને વસ્તુઓ, કિંમતો વિશે પૂછવું અને નમ્રતાથી ખરીદારી કરવાનું શીખવો.",
    home: "તમે એક કુટુંબી સભ્ય છો જે બાળક (6-16 વર્ષ) ને ઘરે અંગ્રેજી વાતચીતની પ્રેક્ટિસ કરવામાં મદદ કરી રહ્યા છો. વિષયોમાં દૈનિક દિનચર્યા, ઘરેલું કામ, હોમવર્ક અને કુટુંબનો સમય સામેલ છે. હૂંફાળા અને સહાયક બનો.",
    restaurant: "તમે એક મિત્રતાપૂર્ણ વેઈટર/વેઈટ્રેસ છો જે એક યુવાન ગ્રાહક (6-16 વર્ષ) ને અંગ્રેજીમાં ખોરાક ઓર્ડર કરવાની પ્રેક્ટિસ કરવામાં મદદ કરી રહ્યા છો. તેમને ઓર્ડર કરવા, મેનુ આઈટમ્સ વિશે પૂછવા અને રેસ્ટોરન્ટ શિષ્ટાચાર માટેના નમ્ર વાક્યો શીખવો."
  }
};

export async function generateGeminiResponse(
  message: string,
  language: string,
  mode: 'freeChat' | 'roleplay',
  scenario?: string,
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<string> {
  try {
    let systemPrompt = "";
    
    if (mode === 'roleplay' && scenario) {
      const scenarioPrompts = ROLEPLAY_PROMPTS[language];
      if (scenarioPrompts && scenarioPrompts[scenario as keyof RoleplayScenario]) {
        systemPrompt = scenarioPrompts[scenario as keyof RoleplayScenario];
      } else {
        systemPrompt = `You are helping a child (age 6-16) practice English conversation in a ${scenario} setting. Be encouraging, educational, and age-appropriate.`;
      }
    } else {
      systemPrompt = `You are an AI English tutor for children aged 6-16. Respond in ${language} when appropriate, but focus on teaching English. Be encouraging, patient, and educational. Keep responses age-appropriate and engaging.`;
    }

    // Add conversation context
    const contextMessages = conversationHistory.slice(-10).map(msg => 
      `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}\n\nConversation context:\n${contextMessages}\n\nStudent: ${message}\nTutor:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
      contents: fullPrompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    return responseText.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const testAI = new GoogleGenAI({ apiKey });
    const response = await testAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });
    
    return !!response.text;
  } catch (error) {
    console.error("Gemini API key validation failed:", error);
    return false;
  }
}
