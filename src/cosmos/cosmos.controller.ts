import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CosmosService } from './cosmos.service';

@Controller('cosmos')
export class CosmosController {
	constructor(private readonly cosmosService: CosmosService) {}

	@Get('block/:height')
	getBlock(@Param('height', ParseIntPipe) height: number) {
		return this.cosmosService.getBlockByHeight(height);
	}

	@Get('transactions/:hash')
	getTransaction(@Param('hash') hash: string) {
		return this.cosmosService.getTransactionByHash(hash);
	}
}
