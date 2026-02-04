import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Get('search')
    async aiSearch(@Query('q') query: string) {
        return this.aiService.runAgentFlow(query);
    }

    @Post('chat')
    async chat(@Body() body: { message: string }) {
        const { response, suggestedProducts } = await this.aiService.runAgentFlow(body.message);

        return {
            response,
            suggestedProducts
        };
    }
}
