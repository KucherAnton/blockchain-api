import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from 'src/utils/logger';

@Injectable()
export class EvmService {
	constructor(private readonly configService: ConfigService) {}

	async getBlockByNumber(height: number) {
		const NODE_URL = this.configService.get<string>('NODE_URL');

		const response = await axios.post(NODE_URL, {
			jsonrpc: '2.0',
			method: 'eth_getBlockByNumber',
			params: ['0x' + height.toString(16), true],
			id: 1,
		});

		const block = response.data.result;
		if (!block) {
			throw new BadRequestException(response.data.error.message);
		}
		logger.log(block);

		return {
			height: parseInt(block.number),
			hash: block.hash,
			parentHash: block.parentHash,
			gasLimit: block.gasLimit,
			gasUsed: block.gasUsed,
			size: block.size,
			transactionsHash: block.transactions.map((tx: any) => ({
				blockHash: tx.blockHash,
				hash: tx.hash,
			})),
		};
	}

	async getTransactionByHash(hash: string) {
		const NODE_URL = this.configService.get<string>('NODE_URL');
		const { data } = await axios.post(NODE_URL, {
			jsonrpc: '2.0',
			method: 'eth_getTransactionByHash',
			params: [hash],
			id: 1,
		});

		const tx = data.result;
		if (!tx) {
			throw new NotFoundException(`Transaction with hash ${hash} not found`);
		}

		logger.log(tx);

		return {
			hash: tx.hash,
			to: tx.to,
			from: tx.from,
			value: tx.value,
			input: tx.input,
			maxFeePerGas: tx.maxFeePerGas,
			maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
			gasPrice: tx.gasPrice,
		};
	}
}
