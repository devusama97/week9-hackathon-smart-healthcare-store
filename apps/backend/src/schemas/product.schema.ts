import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop()
    category: string;

    @Prop()
    price: number;

    @Prop()
    image: string;

    @Prop([String])
    tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
