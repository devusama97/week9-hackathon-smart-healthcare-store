import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ProductsService } from '../products/products.service';
import { Product } from '../schemas/product.schema';

@Injectable()
export class AiService implements OnModuleInit {
    private openai: OpenAI;
    private model: string;

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
1. MEDICAL: Health/product related questions.
2. GREETING: Simple greetings like Hi, Salam, Hello, etc.
3. INVALID: Anything else (politics, sports, general knowledge).

RESPONSE FORMAT:
If MEDICAL: Respond with ONLY "MEDICAL".
If GREETING or INVALID: Provide a response in the user's EXACT language using ROMAN script (Latin alphabet). 
- For GREETINGS: Be friendly and ask how you can help with their health.
- For INVALID: Explain that you are a medical assistant and can only help with health/products. Use the text: "I'm a healthcare assistant specialized in medical and wellness topics..." but translate it to the user's language in ROMAN script.

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

        // Step 2: Extract search keywords using AI dynamically
        const keywordResponse = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{
                role: 'system',
                content: `You are a medical data analyzer. Extract relevant health keywords from user queries to help search a product database.
                
Example:
- "I have weak bones" -> "bone calcium vitamin d"
- "I can't sleep" -> "sleep melatonin"
- "migraine issue" -> "migraine headache pain relief"

Return ONLY the space-separated keywords.`
            }, {
                role: 'user',
                content: `Extract search keywords from: "${userQuery}"`
            }]
        });

        const keywords = keywordResponse.choices[0]?.message?.content?.trim() || userQuery;
        console.log('🔑 Dynamic keywords:', keywords);

        // Step 2: Search products in database
        const searchResult = await this.productsService.findByQuery(keywords);
        const rawProducts = searchResult.products;
        console.log('📦 Raw DB products:', rawProducts.length);

        // Step 3: Strict AI Relevancy Filtering
        let relevantProducts: Product[] = [];
        if (rawProducts.length > 0) {
            const productListForFilter = rawProducts.map((p, i) => `${i}: "${p.title}" - ${p.description}`).join('\n');
            const filterResponse = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{
                    role: 'system',
                    content: `You are a strict medical product curator. Your goal is to EXCLUDE any product that is not a direct and proven fit for the user's specific health concern.

Rules for Exclusion:
- If user has a headache/migraine: EXCLUDE joint pain, bone health, or skin products.
- If user has weak bones: EXCLUDE sleep or hair products.
- If a product "helps with stress" but the user asked about "physical pain", EXCLUDE it unless it's a direct pain reliever.

Be highly critical. If a product is only 50% relevant, EXCLUDE IT.
Return ONLY a comma-separated list of indices (e.g., "0,1") or "NONE". No other text.`
                }, {
                    role: 'user',
                    content: `Concern: "${userQuery}"\n\nCandidate Products:\n${productListForFilter}`
                }]
            });

            const filterResult = filterResponse.choices[0]?.message?.content?.trim().toUpperCase() || 'NONE';
            console.log('🎯 Filter results:', filterResult);

            if (filterResult !== 'NONE') {
                const indices = filterResult.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                relevantProducts = indices.map(i => rawProducts[i]).filter(p => !!p);
            }
        }
        console.log('🚀 Filtered products:', relevantProducts.length);

        // Step 4: Generate professional guidance
        const productContext = relevantProducts.length > 0
            ? relevantProducts.map((p, index) =>
                `${index + 1}. **${p.title}** ($${p.price})
   - ${p.description}
   - Category: ${p.category}`
            ).join('\n\n')
            : "No specific products found for this exact query in our current catalog.";

        const finalResponse = await this.openai.chat.completions.create({
            model: this.model,
            messages: [{
                role: 'system',
                content: `You are a professional healthcare assistant. 

STRICT LANGUAGE RULES:
1. Detect the user's input language (e.g., Urdu, Hindi, Chinese, Spanish).
2. You MUST respond in the EXACT same language used by the user. If they speak Urdu, you reply in Urdu.
3. If the language is NOT English, you MUST use the ROMAN script (Latin alphabet) only. Never use native scripts like Arabic or Devanagari.
4. If a user says "Kaisa hai", you MUST reply "Main theek hoon" or similar in Roman Urdu. DO NOT reply in English.
5. If the query is in English, reply in English.

CORE GOALS:
- Provide empathetic healthcare guidance.
- Recommend products if provided in the context.
- Keep responses short and friendly.`
            }, {
                role: 'user',
                content: `A customer said: "${userQuery}"

Relevant products identified (if any):
${productContext}

Please provide:
1. A brief acknowledgment of their concern.
2. Professional health guidance and advice (nutrients/lifestyle).
3. Specific product recommendations from the PROVIDED list (if any). If none listed, do not suggest our other unrelated products.
4. Keep the response warm, supportive, and concise.`
            }]
        });

        const response = finalResponse.choices[0]?.message?.content ||
            "I'm here to help. Could you please describe your symptoms in more detail?";

        console.log('✅ Filtered response generated');

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
