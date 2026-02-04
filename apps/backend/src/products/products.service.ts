import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    async findAll(): Promise<Product[]> {
        return this.productModel.find().exec();
    }

    async findByQuery(query: string, exactOnly: boolean = false): Promise<{ products: Product[], matchType: 'exact' | 'related' | 'none' }> {
        // List of common non-medical words to ignore in simple search
        const STOP_WORDS = new Set(['i', 'me', 'my', 'eat', 'food', 'daily', 'the', 'and', 'was', 'for', 'with', 'about', 'this', 'that']);

        const cleanQuery = query.trim();
        if (!cleanQuery) return { products: [], matchType: 'none' };

        // Layer 1: Exact Title Match (Case Insensitive)
        // Using word boundaries to be more flexible than strict start/end anchors
        const exactMatch = await this.productModel.findOne({
            title: { $regex: `\\b${cleanQuery}\\b`, $options: 'i' }
        }).exec();

        if (exactMatch) {
            return { products: [exactMatch], matchType: 'exact' };
        }

        // Return early if ONLY exact match is requested
        if (exactOnly) {
            return { products: [], matchType: 'none' };
        }

        // Layer 2: Partial Keyword Match
        // Split query, lowercase, and filter out stop words and very short words
        const keywords = cleanQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));

        if (keywords.length === 0) {
            return { products: [], matchType: 'none' };
        }

        // Create regex patterns for each keyword
        const regexPatterns = keywords.map(keyword => new RegExp(keyword, 'i'));
        const combinedRegex = keywords.join('|');

        const relatedProducts = await this.productModel.find({
            $or: [
                { title: { $regex: combinedRegex, $options: 'i' } },
                { tags: { $in: regexPatterns } },
                { category: { $regex: combinedRegex, $options: 'i' } },
                // Only match description if it's a very clear word-boundary match
                { description: { $regex: `\\b(${combinedRegex})\\b`, $options: 'i' } },
            ],
        }).exec();

        if (relatedProducts.length > 0) {
            return { products: relatedProducts, matchType: 'related' };
        }

        return { products: [], matchType: 'none' };
    }

    async findByAiIntent(tags: string[]): Promise<Product[]> {
        return this.productModel.find({
            tags: { $in: tags },
        }).exec();
    }

    async findById(id: string): Promise<Product | null> {
        return this.productModel.findById(id).exec();
    }
}
