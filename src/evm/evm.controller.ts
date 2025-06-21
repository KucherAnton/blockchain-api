import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EvmService } from './evm.service';

@Controller('evm')
export class EvmController {
	constructor(private readonly evmService: EvmService) {}

	@Get('block/:height')
	getBlock(@Param('height', ParseIntPipe) height: number) {
		return this.evmService.getBlockByNumber(height);
	}

	@Get('transactions/:hash')
	getTransaction(@Param('hash') hash: string) {
		return this.evmService.getTransactionByHash(hash);
	}
}
