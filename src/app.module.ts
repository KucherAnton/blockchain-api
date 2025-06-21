import { Module } from '@nestjs/common';
import { EvmModule } from './evm/evm.module';
import { CosmosModule } from './cosmos/cosmos.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		EvmModule,
		CosmosModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
