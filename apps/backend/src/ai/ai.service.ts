import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ProductsService } from '../products/products.service';
import { Product } from '../schemas/product.schema';

@Injectable()
export class AiService implements OnModuleInit {
    private openai: OpenAI;
    private model: string;

    private SYMPTOM_MAP = {
        "tired": ["Vitamin B Complex", "Iron", "Energy", "Fatigue"],
        "energy": ["Vitamin B", "CoQ10", "Iron"],
        "hair": ["Biotin", "Zinc", "Keratin", "Hair Skin Nails"],
        "skin": ["Collagen", "Vitamin E", "Biotin"],
        "bones": ["Calcium", "Vitamin D3", "Magnesium", "K2"],
        "joints": ["Glucosamine", "Chondroitin", "Omega 3", "Collagen"],
        "sleep": ["Melatonin", "Magnesium", "Valerian Root"],
        "stress": ["Ashwagandha", "Magnesium", "Stress Relief"],
        "immunity": ["Vitamin C", "Zinc", "Elderberry", "Immune"],
        "digestion": ["Probiotics", "Enzymes", "Fiber"]
    };

    constructor(
        private configService: ConfigService,
        @Inject(forwardRef(() => ProductsService))
        private productsService: ProductsService,
    ) { }

    onModuleInit() {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENROUTER_API_KEY') || '',
            baseURL: this.configService.get<string>('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Healthcare Hackathon",
            }
        });
        this.model = this.configService.get<string>('AI_MODEL') || 'x-ai/grok-4.1-fast';
    }

    async runAgentFlow(userQuery: string) {
        console.log('🔍 User Query:', userQuery);

        // Step 1: Validate and handle Greetings/Off-topic
        const classificationResponse = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{
                role: 'system',
                content: `You are a healthcare assistant classifier. Categorize the user query into:
1. MEDICAL: Health/product/symptom related questions.
2. GREETING: Simple greetings like Hi, Salam, Hello, etc.
3. INVALID: Anything else (politics, sports, general knowledge).

RESPONSE FORMAT:
If MEDICAL: Respond with ONLY "MEDICAL".
If GREETING or INVALID: Provide a response in the user's EXACT language using ROMAN script (Latin alphabet). 
- For GREETINGS: Be friendly and ask how you can help with their health.
- For INVALID: Explain that you are a medical assistant and can only help with health/products.

Examples:
- "Salam" -> "Walaikum Assalam! Main aapka healthcare assistant hoon. Aaj main aapki sehat ke baare mein kaise madad kar sakta hoon?"
- "Cricket score?" -> "Main sirf healthcare aur medical topics par baat kar sakta hoon. Meherbaani karke sehat se mutaliq sawal poochein."`
            }, {
                role: 'user',
                content: `Classify and respond: "${userQuery}"`
            }]
        });

        const aiFeedback = classificationResponse.choices[0]?.message?.content?.trim() || "INVALID";

        if (aiFeedback !== "MEDICAL") {
            return {
                response: aiFeedback,
                suggestedProducts: []
            };
        }

        console.log('✅ Query is MEDICAL, proceeding to search');

        // Step 2: Analyze symptoms and map to nutrients/categories
        const symptomAnalysisResponse = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{
                role: 'system',
                content: `You are a clinical symptom analyzer. Identify the key symptoms and the most likely nutrient deficiencies or product categories needed.
                
Available Nutrient Categories: ${Object.keys(this.SYMPTOM_MAP).join(', ')}.

Return a comma-separated list of ONLY the most relevant categories from the list above. If none apply, return the original concern keywords.`
            }, {
                role: 'user',
                content: `Analyze symptoms: "${userQuery}"`
            }]
        });

        const suggestedCategories = symptomAnalysisResponse.choices[0]?.message?.content?.split(',').map(s => s.trim().toLowerCase()) || [];
        console.log('🧬 Suggested categories:', suggestedCategories);

        // Build expanded search query based on mapping
        let expandedKeywords = [...suggestedCategories];
        suggestedCategories.forEach(cat => {
            if (this.SYMPTOM_MAP[cat]) {
                expandedKeywords = [...expandedKeywords, ...this.SYMPTOM_MAP[cat]];
            }
        });

        const finalSearchQuery = expandedKeywords.length > 0 ? expandedKeywords.join(' ') : userQuery;
        console.log('🔑 Final search query:', finalSearchQuery);

        // Step 3: Search products in database
        const searchResult = await this.productsService.findByQuery(finalSearchQuery);
        const rawProducts = searchResult.products;
        console.log('📦 Raw DB products found:', rawProducts.length);

        // Step 4: Strict AI Relevancy Filtering with Reasoning
        let relevantProducts: Product[] = [];
        if (rawProducts.length > 0) {
            const productListForFilter = rawProducts.map((p, i) => `${i}: "${p.title}" - ${p.description}`).join('\n');
            const filterResponse = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{
                    role: 'system',
                    content: `You are a strict medical product curator. Select top 3 products index that are most helpful for the user's specific symptom. 
Return ONLY a comma-separated list of indices (e.g., "0,1") or "NONE".`
                }, {
                    role: 'user',
                    content: `Concern: "${userQuery}"\n\nCandidate Products:\n${productListForFilter}`
                }]
            });

            const filterResult = filterResponse.choices[0]?.message?.content?.trim().toUpperCase() || 'NONE';
            if (filterResult !== 'NONE') {
                const indices = filterResult.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                relevantProducts = indices.map(i => rawProducts[i]).filter(p => !!p);
            }
        }

        // Step 5: Final Response with Romanized Reasoning
        const productContext = relevantProducts.map((p, index) =>
            `- ${p.title}: ${p.description}`
        ).join('\n');

        const finalResponse = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{
                role: 'system',
                content: `You are the AI assistant for a healthcare products app.
Your job is to help users find products through the search bar.

Searchbar Rules:

1. AI Intent Search (Symptom/Query Search)
   - When the user describes their symptoms or asks for suggestions in natural language, analyze their query and suggest relevant products.
   - Explain WHY each product is suggested.
   - Language: Match user's language EXACTLY.
   - Script: Use ROMAN script (Latin alphabet) for non-English queries.
   - Tone: Empathetic and professional.`
            }, {
                role: 'user',
                content: `Query: "${userQuery}"\nProducts:\n${productContext}\n\nProvide health guidance and explain the choice.`
            }]
        });

        const response = finalResponse.choices[0]?.message?.content || "I recommend consulting a professional for these symptoms.";

        return {
            response,
            suggestedProducts: relevantProducts
        };
    }

    // Maintaining old methods for compatibility
    async detectIntent(query: string) {
        return { intent: 'chat', tags: [] };
    }

    async getChatResponse(message: string, contextProducts: any[]) {
        const { response } = await this.runAgentFlow(message);
        return response;
    }
}
