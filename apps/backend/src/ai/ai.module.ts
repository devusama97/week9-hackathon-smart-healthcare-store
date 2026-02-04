import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [forwardRef(() => ProductsModule)],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule { }
