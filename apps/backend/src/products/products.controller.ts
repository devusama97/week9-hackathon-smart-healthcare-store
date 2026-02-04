import { Controller, Get, Query, Inject, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AiService } from '../ai/ai.service';

@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        @Inject(forwardRef(() => AiService))
        private readonly aiService: AiService,
    ) { }

    @Get()
    async getProducts(@Query('search') search?: string, @Query('aiMode') aiMode?: string) {
        console.log(`🔎 Search: "${search}" | AI Mode: ${aiMode}`);
        if (!search || search.trim() === '') {
            return {
                products: await this.productsService.findAll(),
                matchType: 'all',
                aiResponse: null
            };
        }

        // Layer 3: AI Intent / Semantic Search
        // If AI mode is ON, we go straight to AI to handle symptoms/natural language
        if (aiMode === 'true') {
            const aiResult = await this.aiService.runAgentFlow(search);

            return {
                products: aiResult.suggestedProducts,
                matchType: aiResult.suggestedProducts.length > 0 ? 'semantic' : 'none',
                aiResponse: aiResult.response
            };
        }

        // Layer 1: Simple Mode - Exact/Keyword Match only
        const searchResult = await this.productsService.findByQuery(search, true);

        return {
            ...searchResult,
            aiResponse: null
        };

        // Default: No results found in simple mode
        return {
            products: [],
            matchType: 'none',
            aiResponse: null
        };
    }
}
