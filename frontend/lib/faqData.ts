import { Language } from "./i18n";

export interface FAQItem {
  id: string;
  category: "doctors" | "patients" | "health_workers" | "ai" | "privacy" | "accessibility";
  question: Record<Language, string>;
  answer: Record<Language, string>;
  technicalNote?: Record<Language, string>;
}

export const FAQ_DATA: FAQItem[] = [
  // ----------------------------------------------------
  // CATEGORY 1: FOR DOCTORS
  // ----------------------------------------------------
  {
    id: "doc_1",
    category: "doctors",
    question: {
      en: "How does patient memory work?",
      ta: "நோயாளி நினைவகம் எவ்வாறு செயல்படுகிறது?",
      hi: "मरीज़ की मेमोरी कैसे काम करती है?",
    },
    answer: {
      en: "MediHelp builds a persistent knowledge graph in Cognee Cloud from uploaded medical PDFs. Every diagnosis, medication, lab result, and clinical note is indexed so doctors can recall patient history instantly across visits.",
      ta: "MediHelp பதிவேற்றப்பட்ட மருத்துவ PDFகளில் இருந்து Cognee Cloud இல் நிலையான அறிவு வரைபடத்தை உருவாக்குகிறது. ஒவ்வொரு நோயறிதலும், மருந்தும், ஆய்வக முடிவும் குறியிடப்படுவதால், மருத்துவர்கள் நோயாளியின் வரலாற்றை உடனடியாக நினைவுகூர முடியும்.",
      hi: "MediHelp अपलोड की गई मेडिकल PDF से Cognee Cloud में एक स्थायी नॉलेज ग्राफ बनाता है। हर निदान, दवा, लैब परिणाम और क्लिनिकल नोट को इंडेक्स किया जाता है ताकि डॉक्टर विज़िट के दौरान मरीज़ के इतिहास को तुरंत याद कर सकें।",
    },
    technicalNote: {
      en: "Technical detail: Documents are parsed into semantic chunks and stored in Cognee's graph network.",
      ta: "தொழில்நுட்ப விளக்கம்: ஆவணங்கள் சொற்பொருள் துண்டுகளாகப் பிரிக்கப்பட்டு Cognee வரைபடத்தில் சேமிக்கப்படுகின்றன.",
      hi: "तकनीकी विवरण: दस्तावेजों को अर्थपूर्ण टुकड़ों में विभाजित करके Cognee के ग्राफ नेटवर्क में सहेजा जाता है।",
    }
  },
  {
    id: "doc_2",
    category: "doctors",
    question: {
      en: "How do I add a patient?",
      ta: "புதிய நோயாளியை எவ்வாறு சேர்ப்பது?",
      hi: "नया मरीज़ कैसे जोड़ें?",
    },
    answer: {
      en: "Click 'New patient' on the Patients page or Upload page. Enter the patient's full name, age, gender, and blood group. The patient record is created immediately and Cognee Cloud memory initializes on the first PDF upload.",
      ta: "நோயாளிகள் பக்கம் அல்லது பதிவேற்றப் பக்கத்தில் 'புதிய நோயாளி' என்பதைக் கிளிக் செய்யவும். நோயாளியின் பெயர், வயது, பாலினம் மற்றும் இரத்த வகையை உள்ளிடவும்.",
      hi: "मरीज़ पेज या अपलोड पेज पर 'नया मरीज़' पर क्लिक करें। मरीज़ का नाम, आयु, लिंग और रक्त समूह दर्ज करें। पहला PDF अपलोड करने पर Cognee Cloud मेमोरी शुरू हो जाती है।",
    }
  },
  {
    id: "doc_3",
    category: "doctors",
    question: {
      en: "How do I upload a report?",
      ta: "மருத்துவ அறிக்கையை எவ்வாறு பதிவேற்றுவது?",
      hi: "रिपोर्ट कैसे अपलोड करें?",
    },
    answer: {
      en: "Go to Upload Docs, select the target patient, and drag-and-drop or browse for PDF reports (lab results, discharge summaries, prescriptions). Cognee automatically parses and indexes the document.",
      ta: "ஆவணங்களைப் பதிவேற்று பக்கத்திற்குச் சென்று, நோயாளியைத் தேர்ந்தெடுத்து, PDF அறிக்கைகளை (ஆய்வக முடிவுகள், மருந்து சீட்டுகள்) பதிவேற்றவும்.",
      hi: "दस्तावेज़ अपलोड करें पेज पर जाएं, लक्ष्य मरीज़ चुनें, और PDF रिपोर्ट (लैब परिणाम, डिस्चार्ज सारांश) अपलोड करें। Cognee स्वचालित रूप से दस्तावेज़ को इंडेक्स करता है।",
    }
  },
  {
    id: "doc_4",
    category: "doctors",
    question: {
      en: "How does AI Doctor use patient history?",
      ta: "AI மருத்துவர் நோயாளி வரலாற்றை எவ்வாறு பயன்படுத்துகிறார்?",
      hi: "AI डॉक्टर मरीज़ के इतिहास का उपयोग कैसे करता है?",
    },
    answer: {
      en: "AI Doctor queries the patient's Cognee Cloud knowledge graph to retrieve relevant clinical facts before generating answers. All responses are strictly grounded in uploaded records and include source attribution.",
      ta: "AI மருத்துவர் பதில்களை உருவாக்குவதற்கு முன் நோயாளியின் Cognee Cloud அறிவு வரைபடத்திலிருந்து தொடர்புடைய மருத்துவத் தகவல்களைப் பெறுகிறார்.",
      hi: "AI डॉक्टर उत्तर देने से पहले मरीज़ के Cognee Cloud नॉलेज ग्राफ से संबंधित नैदानिक तथ्यों को प्राप्त करता है। सभी उत्तर अपलोड किए गए रिकॉर्ड पर आधारित होते हैं।",
    }
  },
  {
    id: "doc_5",
    category: "doctors",
    question: {
      en: "How does the timeline work?",
      ta: "காலவரிசை எவ்வாறு செயல்படுகிறது?",
      hi: "समयरेखा कैसे काम करती है?",
    },
    answer: {
      en: "The Health Timeline automatically organizes extracted clinical events (diagnoses, medications, lab results, vitals, follow-ups) in chronological order from Cognee memory.",
      ta: "சுகாதார காலவரிசை Cognee நினைவகத்திலிருந்து எடுக்கப்பட்ட நிகழ்வுகளை காலவரிசைப்படி தானாகவே ஒழுங்கமைக்கிறது.",
      hi: "स्वास्थ्य समयरेखा Cognee मेमोरी से निकाले गए नैदानिक आयोजनों (निदान, दवाएं, लैब परिणाम, वाइटल्स) को स्वचालित रूप से कालानुक्रमिक क्रम में व्यवस्थित करती है।",
    }
  },
  {
    id: "doc_6",
    category: "doctors",
    question: {
      en: "What happens when I finish a consultation?",
      ta: "மருத்துவ ஆலோசனையை முடிக்கும்போது என்ன நடக்கும்?",
      hi: "परामर्श समाप्त करने पर क्या होता है?",
    },
    answer: {
      en: "Finishing a consultation saves your session. The patient's medical memory remains intact so future consultations can build upon past history. Completing a visit does NOT delete memory. Deletion is an explicit action via 'Delete Patient Memory'.",
      ta: "ஆலோசனையை முடிப்பது உங்கள் அமர்வைச் சேமிக்கிறது. நோயாளியின் மருத்துவ நினைவகம் அழியாமல் இருக்கும். சந்திப்பை முடிப்பது நினைவகத்தை நீக்காது. நீக்குவது 'நோயாளி நினைவகத்தை நீக்கு' மூலம் செய்யப்படும் தனிப்பட்ட நடவடிக்கையாகும்.",
      hi: "परामर्श समाप्त करने से आपका सत्र सहेजा जाता है। मरीज की मेडिकल मेमोरी बरकरार रहती है ताकि भविष्य के परामर्श पिछले इतिहास पर निर्मित हो सकें। परामर्श समाप्त करने से मेमोरी डिलीट नहीं होती।",
    }
  },

  // ----------------------------------------------------
  // CATEGORY 2: FOR PATIENTS
  // ----------------------------------------------------
  {
    id: "pat_1",
    category: "patients",
    question: {
      en: "Does my medical history disappear after a visit?",
      ta: "ஒரு சந்திப்பிற்குப் பிறகு எனது மருத்துவ வரலாறு அழிந்துவிடுமா?",
      hi: "क्या विज़िट के बाद मेरा चिकित्सा इतिहास गायब हो जाता है?",
    },
    answer: {
      en: "No. MediHelp preserves your medical history across visits so your doctor doesn't have to start from scratch every time. Finishing a consultation does not erase your memory graph. Deletion is only performed if intentionally requested.",
      ta: "இல்லை. MediHelp உங்கள் மருத்துவ வரலாற்றைப் பாதுகாக்கிறது, அதனால் உங்கள் மருத்துவர் ஒவ்வொரு முறையும் முதலிலிருந்து தொடங்கத் தேவையில்லை.",
      hi: "नहीं। MediHelp विज़िट के दौरान आपके चिकित्सा इतिहास को सुरक्षित रखता है ताकि आपके डॉक्टर को हर बार शून्य से शुरू न करना पड़े। परामर्श समाप्त करने से आपकी मेमोरी डिलीट नहीं होती।",
    }
  },
  {
    id: "pat_2",
    category: "patients",
    question: {
      en: "Can I access my previous information?",
      ta: "எனது முந்தைய தகவல்களை நான் அணுக முடியுமா?",
      hi: "क्या मैं अपनी पिछली जानकारी तक पहुंच सकता हूं?",
    },
    answer: {
      en: "Yes. Your authorized doctors and health workers can view your timeline, pre-visit summaries, and health connections anytime during care.",
      ta: "ஆம். உங்கள் அங்கீகரிக்கப்பட்ட மருத்துவர்கள் மற்றும் சுகாதாரப் பணியாளர்கள் உங்கள் காலவரிசை மற்றும் சுருக்கங்களை எப்போதும் பார்க்க முடியும்.",
      hi: "हां। आपके अधिकृत डॉक्टर और स्वास्थ्य कार्यकर्ता आपकी देखभाल के दौरान कभी भी आपकी समयरेखा और सारांश देख सकते हैं।",
    }
  },
  {
    id: "pat_3",
    category: "patients",
    question: {
      en: "Who can see my information?",
      ta: "எனது தகவலை யார் பார்க்க முடியும்?",
      hi: "मेरी जानकारी कौन देख सकता है?",
    },
    answer: {
      en: "Your data is stored securely in your facility's isolated Cognee Cloud workspace and is accessible only to authorized healthcare professionals assigned to your care.",
      ta: "உங்கள் தரவு பாதுகாப்பாகச் சேமிக்கப்படுகிறது மற்றும் உங்கள் பராமரிப்பிற்கு ஒதுக்கப்பட்ட அங்கீகரிக்கப்பட்ட மருத்துவ நிபுணர்களுக்கு மட்டுமே அணுக முடியும்.",
      hi: "आपका डेटा सुरक्षित रूप से सहेजा जाता है और केवल आपकी देखभाल के लिए नियुक्त अधिकृत स्वास्थ्य देखभाल पेशेवरों के लिए सुलभ है।",
    }
  },
  {
    id: "pat_4",
    category: "patients",
    question: {
      en: "How can I delete my memory?",
      ta: "எனது நினைவகத்தை எவ்வாறு நீக்குவது?",
      hi: "मैं अपनी मेमोरी कैसे हटा सकता हूं?",
    },
    answer: {
      en: "You or your doctor can select 'Delete Patient Memory' from the patient menu. This permanently removes your knowledge graph, documents, and clinical history from Cognee Cloud.",
      ta: "நீங்களோ அல்லது உங்கள் மருத்துவரோ 'நோயாளி நினைவகத்தை நீக்கு' என்பதைத் தேர்ந்தெடுக்கலாம். இது Cognee Cloud இலிருந்து அனைத்து தரவையும் நிரந்தரமாக நீக்கும்.",
      hi: "आप या आपके डॉक्टर मरीज मेनू से 'मरीज़ की मेमोरी हटाएं' चुन सकते हैं। यह Cognee Cloud से आपके नॉलेज ग्राफ और दस्तावेजों को स्थायी रूप से हटा देता है।",
    }
  },
  {
    id: "pat_5",
    category: "patients",
    question: {
      en: "Can MediHelp replace my doctor?",
      ta: "MediHelp எனது மருத்துவருக்கு மாற்றாக இருக்க முடியுமா?",
      hi: "क्या MediHelp मेरे डॉक्टर की जगह ले सकता है?",
    },
    answer: {
      en: "No. MediHelp is an AI assistant tool that helps doctors organize information faster. Qualified healthcare professionals remain responsible for all clinical decisions and diagnosis.",
      ta: "இல்லை. MediHelp என்பது மருத்துவர்களுக்கு உதவும் ஒரு AI உதவி கருவியாகும். தகுதியான மருத்துவர்களே அனைத்து மருத்துவ முடிவுகளுக்கும் பொறுப்பாவார்கள்.",
      hi: "नहीं। MediHelp एक AI सहायक उपकरण है जो डॉक्टरों को तेजी से जानकारी व्यवस्थित करने में मदद करता है। योग्य डॉक्टर ही सभी निर्णयों के लिए जिम्मेदार हैं।",
    }
  },
  {
    id: "pat_6",
    category: "patients",
    question: {
      en: "Can I use MediHelp in my language?",
      ta: "நான் MediHelp ஐ எனது மொழியில் பயன்படுத்த முடியுமா?",
      hi: "क्या मैं अपनी भाषा में MediHelp का उपयोग कर सकता हूं?",
    },
    answer: {
      en: "Yes. MediHelp supports English, Tamil (தமிழ்), and Hindi (हिन्दी). You can switch languages at any time from the top menu.",
      ta: "ஆம். MediHelp ஆங்கிலம், தமிழ் மற்றும் இந்தி மொழிகளை ஆதரிக்கிறது. மேல் மெனுவிலிருந்து எப்போது வேண்டுமானாலும் மொழியை மாற்றலாம்.",
      hi: "हां। MediHelp अंग्रेजी, तमिल और हिंदी का समर्थन करता है। आप शीर्ष मेनू से किसी भी समय भाषा बदल सकते हैं।",
    }
  },

  // ----------------------------------------------------
  // CATEGORY 3: FOR HEALTH WORKERS
  // ----------------------------------------------------
  {
    id: "wrk_1",
    category: "health_workers",
    question: {
      en: "How does Assisted Care work?",
      ta: "உதவி பராமரிப்பு எவ்வாறு செயல்படுகிறது?",
      hi: "सहायक देखभाल कैसे काम करती है?",
    },
    answer: {
      en: "Assisted Care provides a simplified, mobile-friendly interface designed for community health workers and nurses. It features large tap targets, guided actions, and voice read-aloud support.",
      ta: "உதவி பராமரிப்பு சுகாதாரப் பணியாளர்களுக்காக வடிவமைக்கப்பட்ட எளிய மொபைல் இடைமுகத்தை வழங்குகிறது. இது பெரிய பொத்தான்கள் மற்றும் குரல் வழிகாட்டலைக் கொண்டுள்ளது.",
      hi: "सहायक देखभाल स्वास्थ्य कार्यकर्ताओं और नर्सों के लिए डिज़ाइन किया गया एक सरल, मोबाइल-अनुकूल इंटरफेस प्रदान करती है। इसमें बड़े बटन और आवाज़ सहायता शामिल है।",
    }
  },
  {
    id: "wrk_2",
    category: "health_workers",
    question: {
      en: "How do I create a patient?",
      ta: "நோயாளியை எவ்வாறு உருவாக்குவது?",
      hi: "मरीज़ कैसे बनाएं?",
    },
    answer: {
      en: "Open Assisted Care or the Patients page, tap 'Manage Patients' or 'New patient', and fill in basic details (name, age, gender).",
      ta: "உதவி பராமரிப்பு அல்லது நோயாளிகள் பக்கத்தைத் திறந்து, 'புதிய நோயாளி' என்பதைத் தட்டி விவரங்களை நிரப்பவும்.",
      hi: "सहायक देखभाल या मरीज़ पेज खोलें, 'नया मरीज़' पर टैप करें और बुनियादी विवरण भरें।",
    }
  },
  {
    id: "wrk_3",
    category: "health_workers",
    question: {
      en: "How do I upload a PDF?",
      ta: "PDF ஐ எவ்வாறு பதிவேற்றுவது?",
      hi: "PDF कैसे अपलोड करें?",
    },
    answer: {
      en: "Tap '+ Upload PDF' in Assisted Care or use the Upload Docs page. Select the medical report PDF from your device storage to attach it to the patient's record.",
      ta: "உதவி பராமரிப்பில் '+ PDF பதிவேற்று' என்பதைத் தட்டவும் அல்லது பதிவேற்றப் பக்கத்தைப் பயன்படுத்தவும்.",
      hi: "सहायक देखभाल में '+ PDF अपलोड करें' पर टैप करें या अपलोड पेज का उपयोग करें। अपने डिवाइस से मेडिकल रिपोर्ट चुनें।",
    }
  },
  {
    id: "wrk_4",
    category: "health_workers",
    question: {
      en: "How do I help a patient understand their information?",
      ta: "நோயாளிகளுக்கு அவர்கள் தகவலைப் புரிந்துகொள்ள எப்படி உதவுவது?",
      hi: "मरीज़ को उसकी जानकारी समझने में मदद कैसे करें?",
    },
    answer: {
      en: "Use the 'Listen' audio button to play audio summaries in Tamil, Hindi, or English, or use the Pre-Visit Brief for simple 5-point clinical summaries.",
      ta: "தமிழ், இந்தி அல்லது ஆங்கிலத்தில் ஒலிச் சுருக்கங்களை இயக்க 'கேளுங்கள்' பொத்தானைப் பயன்படுத்தவும் அல்லது 5-புள்ளிச் சுருக்கத்தைப் பயன்படுத்தவும்.",
      hi: "तमिल, हिंदी या अंग्रेजी में ऑडियो सारांश सुनने के लिए 'सुनें' बटन का उपयोग करें, या 5-बिंदु सारांश का उपयोग करें।",
    }
  },

  // ----------------------------------------------------
  // CATEGORY 4: ABOUT AI
  // ----------------------------------------------------
  {
    id: "ai_1",
    category: "ai",
    question: {
      en: "What does MediHelp remember?",
      ta: "MediHelp என்ன நினைவில் கொள்கிறது?",
      hi: "MediHelp क्या याद रखता है?",
    },
    answer: {
      en: "MediHelp remembers medical facts extracted from uploaded PDFs, including diagnoses, prescribed drugs, allergies, vitals, lab values, and timeline events.",
      ta: "MediHelp பதிவேற்றப்பட்ட PDFகளில் இருந்து எடுக்கப்பட்ட நோயறிதல்கள், மருந்துகள், ஒவ்வாமைகள் மற்றும் ஆய்வக மதிப்புகளை நினைவில் கொள்கிறது.",
      hi: "MediHelp अपलोड की गई PDF से निकाले गए निदान, दवाओं, एलर्जी, वाइटल्स और लैब मानों सहित चिकित्सा तथ्यों को याद रखता है।",
    }
  },
  {
    id: "ai_2",
    category: "ai",
    question: {
      en: "What happens if information is missing?",
      ta: "தகவல் விடுபட்டிருந்தால் என்ன நடக்கும்?",
      hi: "यदि जानकारी गायब हो तो क्या होगा?",
    },
    answer: {
      en: "MediHelp can only recall information present in uploaded documents. If a record is missing, the AI will indicate insufficient evidence rather than guessing.",
      ta: "MediHelp பதிவேற்றப்பட்ட ஆவணங்களில் உள்ள தகவல்களை மட்டுமே நினைவுகூர முடியும். தகவல் இல்லை என்றால், அது யூகிக்காமல் போதிய ஆதாரம் இல்லை எனக் காட்டும்.",
      hi: "MediHelp केवल अपलोड किए गए दस्तावेजों में मौजूद जानकारी को याद रख सकता है। यदि रिकॉर्ड गायब है, तो AI अनुमान लगाने के बजाय अपर्याप्त साक्ष्य दिखाएगा।",
    }
  },
  {
    id: "ai_3",
    category: "ai",
    question: {
      en: "Can AI make mistakes?",
      ta: "AI தவறுகள் செய்ய முடியுமா?",
      hi: "क्या AI गलतियाँ कर सकता है?",
    },
    answer: {
      en: "Yes. AI systems can misunderstand complex phrasing or miss context. MediHelp is an assistance tool, and clinicians must verify all AI outputs against actual patient records.",
      ta: "ஆம். AI அமைப்புகள் தவறுகளைச் செய்யக்கூடும். MediHelp என்பது ஒரு உதவி கருவியாகும், மருத்துவர்கள் உண்மையான பதிவுகளுடன் சரிபார்க்க வேண்டும்.",
      hi: "हां। AI सिस्टम गलतियां कर सकते हैं। MediHelp एक सहायता उपकरण है, और चिकित्सकों को वास्तविक रिकॉर्ड के साथ सभी आउटपुट की पुष्टि करनी चाहिए।",
    }
  },
  {
    id: "ai_4",
    category: "ai",
    question: {
      en: "How does MediHelp explain its answers?",
      ta: "MediHelp அதன் பதில்களை எவ்வாறு விளக்குகிறது?",
      hi: "MediHelp अपने उत्तरों की व्याख्या कैसे करता है?",
    },
    answer: {
      en: "Every AI Doctor answer includes an Explainability Panel showing source documents, retrieved knowledge graph entities, timeline events, and confidence levels.",
      ta: "ஒவ்வொரு AI பதிலிலும் மூல ஆவணங்கள், பெறப்பட்ட வரைபட பொருள்கள் மற்றும் நிகழ்வுகளைக் காட்டும் விளக்கக் குழு உள்ளது.",
      hi: "हर AI उत्तर में एक स्पष्टीकरण पैनल शामिल होता है जो स्रोत दस्तावेज, नॉलेज ग्राफ एंटीटीज़ और समयरेखा घटनाओं को दिखाता है।",
    }
  },
  {
    id: "ai_5",
    category: "ai",
    question: {
      en: "How can I report an incorrect response?",
      ta: "தவறான பதிலை எவ்வாறு புகாரளிப்பது?",
      hi: "गलत प्रतिक्रिया की रिपोर्ट कैसे करें?",
    },
    answer: {
      en: "Click '👎 No' under any explanation or answer to trigger the issue reporting menu, where you can select 'Information seems incorrect' and submit feedback.",
      ta: "எந்தவொரு விளக்கத்தின் கீழும் '👎 இல்லை' என்பதைக் கிளிக் செய்து, கருத்துத் தெரிவிக்க 'தகவல் தவறாக உள்ளது' என்பதைத் தேர்ந்தெடுக்கவும்.",
      hi: "किसी भी उत्तर के नीचे '👎 नहीं' पर क्लिक करें, और 'जानकारी गलत लगती है' चुनकर प्रतिक्रिया सबमिट करें।",
    }
  },

  // ----------------------------------------------------
  // CATEGORY 5: PRIVACY & PATIENT MEMORY
  // ----------------------------------------------------
  {
    id: "prv_1",
    category: "privacy",
    question: {
      en: "Does MediHelp delete my information after every consultation?",
      ta: "ஒவ்வொரு ஆலோசனையையும் தொடர்ந்து MediHelp எனது தகவலை நீக்குமா?",
      hi: "क्या MediHelp हर परामर्श के बाद मेरी जानकारी हटा देता है?",
    },
    answer: {
      en: "No. Ending a consultation simply closes the active session. Patient history remains safely saved in Cognee Cloud for future clinical visits.",
      ta: "இல்லை. ஆலோசனையை முடிப்பது அமர்வை மட்டுமே மூடுகிறது. எதிர்கால மருத்துவ சந்திப்புகளுக்கு நோயாளி வரலாறு பாதுகாப்பாக சேமிக்கப்படும்.",
      hi: "नहीं। परामर्श समाप्त करने से केवल सत्र बंद होता है। भविष्य की विज़िट के लिए इतिहास Cognee Cloud में सुरक्षित रहता है।",
    }
  },
  {
    id: "prv_2",
    category: "privacy",
    question: {
      en: "What is the difference between completing a consultation and deleting patient memory?",
      ta: "ஆலோசனையை முடிப்பதற்கும் நோயாளி நினைவகத்தை நீக்குவதற்கும் உள்ள வித்தியாசம் என்ன?",
      hi: "परामर्श पूरा करने और मरीज की मेमोरी हटाने में क्या अंतर है?",
    },
    answer: {
      en: "Completing a consultation leaves patient records intact for continuous care. Deleting patient memory is a manual action that permanently wipes all graphs and documents.",
      ta: "ஆலோசனையை முடிப்பது பதிவுகளை அப்படியே வைக்கிறது. நினைவகத்தை நீக்குவது அனைத்து வரைபடங்களையும் ஆவணங்களையும் நிரந்தரமாக அழிக்கும் கையேடு நடவடிக்கையாகும்.",
      hi: "परामर्श पूरा करने से निरंतर देखभाल के लिए रिकॉर्ड बरकरार रहते हैं। मेमोरी हटाना एक मैनुअल कार्रवाई है जो सभी डेटा को स्थायी रूप से मिटा देती है।",
    }
  },
  {
    id: "prv_3",
    category: "privacy",
    question: {
      en: "What happens when patient memory is deleted?",
      ta: "நோயாளி நினைவகம் நீக்கப்படும் போது என்ன நடக்கும்?",
      hi: "मरीज की मेमोरी डिलीट होने पर क्या होता है?",
    },
    answer: {
      en: "Deletion invokes Cognee Cloud's forget() pipeline, removing all knowledge graph nodes, vector embeddings, chunks, and uploaded PDFs permanently.",
      ta: "நீக்குதல் நடவடிக்கையானது Cognee Cloud இன் forget() செயல்பாட்டைப் பயன்படுத்தி அனைத்து முனைகளையும் ஆவணங்களையும் நிரந்தரமாக அகற்றும்.",
      hi: "डिलीशन कार्रवाई Cognee Cloud के forget() ऑपरेशन का उपयोग करके सभी नोड्स और दस्तावेजों को स्थायी रूप से हटा देती है।",
    },
    technicalNote: {
      en: "Technical detail: Internally calls Cognee Cloud forget() API to remove vector embeddings and graph entities.",
      ta: "தொழில்நுட்ப விளக்கம்: வரைபட பொருள்கள் மற்றும் வெக்டார்களை அகற்ற Cognee Cloud forget() API ஐ அழைக்கிறது.",
      hi: "तकनीकी विवरण: यह ग्राफ एंटीटीज़ को हटाने के लिए Cognee Cloud forget() API को कॉल करता है।",
    }
  },
  {
    id: "prv_4",
    category: "privacy",
    question: {
      en: "Why does MediHelp keep patient history?",
      ta: "MediHelp ஏன் நோயாளி வரலாற்றை வைத்திருக்கிறது?",
      hi: "MediHelp मरीज का इतिहास क्यों रखता है?",
    },
    answer: {
      en: "Longitudinal patient memory prevents redundant tests, flags drug interactions across visits, and gives doctors instant context without re-interviewing patients.",
      ta: "நீண்டகால நினைவகம் தேவையற்ற சோதனைகளைத் தடுக்கிறது மற்றும் மருந்து முரண்பாடுகளை எச்சரிக்கிறது.",
      hi: "दीर्घकालिक मेमोरी अनावश्यक परीक्षणों को रोकती है, दवा के विरोध को फ्लैग करती है और डॉक्टरों को तुरंत संदर्भ देती है।",
    }
  },
  {
    id: "prv_5",
    category: "privacy",
    question: {
      en: "Can a patient request deletion of their information?",
      ta: "ஒரு நோயாளி தங்கள் தகவலை நீக்குமாறு கோர முடியுமா?",
      hi: "क्या मरीज अपनी जानकारी हटाने का अनुरोध कर सकता है?",
    },
    answer: {
      en: "Yes. Patients can request their doctor or administrator to delete their MediHelp memory record at any time.",
      ta: "ஆம். நோயாளிகள் தங்களின் MediHelp நினைவகப் பதிவை நீக்குமாறு எப்போது வேண்டுமானாலும் கோரலாம்.",
      hi: "हां। मरीज किसी भी समय अपने डॉक्टर से अपनी MediHelp मेमोरी हटाने का अनुरोध कर सकते हैं।",
    }
  },
  {
    id: "prv_6",
    category: "privacy",
    question: {
      en: "Is my medical information used to train the AI?",
      ta: "எனது மருத்துவத் தகவல் AI பயிற்சிக்கு பயன்படுத்தப்படுகிறதா?",
      hi: "क्या मेरी चिकित्सा जानकारी का उपयोग AI को प्रशिक्षित करने के लिए किया जाता है?",
    },
    answer: {
      en: "No. Your data remains isolated within your facility's Cognee Cloud instance and is never used to train public AI models.",
      ta: "இல்லை. உங்கள் தரவு பாதுகாப்பாக தனிமைப்படுத்தப்பட்டு வைக்கப்படுகிறது மற்றும் பொது AI மாதிரிகளுக்கு பயன்படுத்தப்படாது.",
      hi: "नहीं। आपका डेटा आपकी सुविधा के Cognee Cloud में सुरक्षित रूप से अलग रखा जाता है और इसका उपयोग सार्वजनिक AI मॉडल के प्रशिक्षण के लिए नहीं किया जाता है।",
    }
  },

  // ----------------------------------------------------
  // CATEGORY 6: ACCESSIBILITY & LANGUAGES
  // ----------------------------------------------------
  {
    id: "acc_1",
    category: "accessibility",
    question: {
      en: "Can I use MediHelp in my language?",
      ta: "நான் MediHelp ஐ எனது மொழியில் பயன்படுத்த முடியுமா?",
      hi: "क्या मैं अपनी भाषा में MediHelp का उपयोग कर सकता हूं?",
    },
    answer: {
      en: "Yes! Full translation is available in English, Tamil (தமிழ்), and Hindi (हिन्दी).",
      ta: "ஆம்! ஆங்கிலம், தமிழ் மற்றும் இந்தி மொழிகளில் முழுமையான மொழிபெயர்ப்பு உள்ளது.",
      hi: "हां! अंग्रेजी, तमिल और हिंदी में पूर्ण अनुवाद उपलब्ध है।",
    }
  },
  {
    id: "acc_2",
    category: "accessibility",
    question: {
      en: "Which languages are currently supported?",
      ta: "தற்போது எந்த மொழிகள் ஆதரிக்கப்படுகின்றன?",
      hi: "वर्तमान में कौन सी भाषाएं समर्थित हैं?",
    },
    answer: {
      en: "MediHelp supports English, தமிழ் (Tamil), and हिन्दी (Hindi).",
      ta: "MediHelp ஆங்கிலம், தமிழ் மற்றும் இந்தி மொழிகளை ஆதரிக்கிறது.",
      hi: "MediHelp अंग्रेजी, तमिल और हिंदी का समर्थन करता है।",
    }
  },
  {
    id: "acc_3",
    category: "accessibility",
    question: {
      en: "What is Assisted Care?",
      ta: "உதவி பராமரிப்பு என்றால் என்ன?",
      hi: "सहायक देखभाल क्या है?",
    },
    answer: {
      en: "Assisted Care is a high-contrast, simple mode designed for rural health workers, mobile screens, and users with lower digital literacy.",
      ta: "உதவி பராமரிப்பு என்பது கிராமப்புற சுகாதாரப் பணியாளர்கள் மற்றும் மொபைல் திரைகளுக்காக வடிவமைக்கப்பட்ட எளிமையான பயன்முறையாகும்.",
      hi: "सहायक देखभाल ग्रामीण स्वास्थ्य कार्यकर्ताओं और मोबाइल स्क्रीन के लिए डिज़ाइन किया गया एक सरल मोड है।",
    }
  },
  {
    id: "acc_4",
    category: "accessibility",
    question: {
      en: "Can someone help me use MediHelp?",
      ta: "MediHelp ஐப் பயன்படுத்த யாராவது எனக்கு உதவ முடியுமா?",
      hi: "क्या कोई मुझे MediHelp का उपयोग करने में मदद कर सकता है?",
    },
    answer: {
      en: "Yes. Tap the 'Need Help?' button at any time to open the guided product tour or contextual page explanations.",
      ta: "ஆம். வழிகாட்டப்பட்ட தயாரிப்பு உலாவலைத் திறக்க எப்போது வேண்டுமானாலும் 'உதவி தேவையா?' பொத்தானைத் தட்டவும்.",
      hi: "हां। निर्देशित उत्पाद टूर खोलने के लिए किसी भी समय 'सहायता चाहिए?' बटन पर टैप करें।",
    }
  },
  {
    id: "acc_5",
    category: "accessibility",
    question: {
      en: "Can MediHelp read information aloud?",
      ta: "MediHelp தகவல்களை உரக்கப் படிக்க முடியுமா?",
      hi: "क्या MediHelp जानकारी जोर से पढ़ सकता है?",
    },
    answer: {
      en: "Yes. Tap the 'Listen' or volume button on FAQ items, summaries, or Assisted Care tiles to hear audio playback via ElevenLabs TTS.",
      ta: "ஆம். ElevenLabs TTS மூலம் ஒலியைக் கேட்க 'கேளுங்கள்' அல்லது ஒலி பொத்தானைத் தட்டவும்.",
      hi: "हां। ElevenLabs TTS के माध्यम से ऑडियो सुनने के लिए 'सुनें' या वॉल्यूम बटन पर टैप करें।",
    }
  },
  {
    id: "acc_6",
    category: "accessibility",
    question: {
      en: "What should I do if I do not understand an explanation?",
      ta: "ஒரு விளக்கம் எனக்குப் புரியவில்லை என்றால் நான் என்ன செய்ய வேண்டும்?",
      hi: "यदि मुझे कोई स्पष्टीकरण समझ न आए तो मुझे क्या करना चाहिए?",
    },
    answer: {
      en: "Tap '👎 No' on the answer to report an unclear explanation, or click 'Need Help?' to open the product guide.",
      ta: "தெளிவற்ற விளக்கத்தைப் புகாரளிக்க '👎 இல்லை' என்பதைத் தட்டவும் அல்லது தயாரிப்பு வழிகாட்டியைத் திறக்க 'உதவி தேவையா?' என்பதைக் கிளிக் செய்யவும்.",
      hi: "अस्पष्ट स्पष्टीकरण की रिपोर्ट करने के लिए उत्तर पर '👎 नहीं' पर टैप करें, या उत्पाद गाइड खोलने के लिए 'सहायता चाहिए?' पर क्लिक करें।",
    }
  }
];
