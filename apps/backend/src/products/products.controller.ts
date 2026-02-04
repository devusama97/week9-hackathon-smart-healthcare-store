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
    async getProducts(@Query('search') search?: string) {
        if (!search || search.trim() === '') {
            return {
                products: await this.productsService.findAll(),
                matchType: 'all',
                aiResponse: null
            };
        }

        // Layer 1 & 2: Exact and Related matches
        const searchResult = await this.productsService.findByQuery(search);

        if (searchResult.matchType !== 'none') {
            return {
                ...searchResult,
                aiResponse: null
            };
        }

        // Layer 3: AI Intent / Semantic Fallback
        const aiResult = await this.aiService.runAgentFlow(search);

        return {
            products: aiResult.suggestedProducts,
            matchType: aiResult.suggestedProducts.length > 0 ? 'semantic' : 'none',
            aiResponse: aiResult.response
        };
    }
}
