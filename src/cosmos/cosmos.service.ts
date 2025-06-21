import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { fromBase64 } from '@cosmjs/encoding';
import { decodeTxRaw } from '@cosmjs/proto-signing';
import * as crypto from 'crypto';
import { logger } from 'src/utils/logger';

function getTxHashFromBase64(base64: string): string {
	const txBytes = Buffer.from(base64, 'base64');
	const hash = crypto
		.createHash('sha256')
		.update(txBytes)
		.digest('hex')
		.toUpperCase();
	return hash;
}

@Injectable()
export class CosmosService {
	constructor(private readonly configService: ConfigService) {}

	async getBlockByHeight(height: number) {
		const RPC_URL = this.configService.get<string>('RPC_URL');
		const { data } = await axios.get(`${RPC_URL}/block?height=${height}`);

		const block = data.block;
		if (!block) {
			throw new BadRequestException(data);
		}
		logger.log(block);

		const txsHashesBase64 = data.block.data.txs;
		const decodedHashes = txsHashesBase64.map((tx: any) =>
			getTxHashFromBase64(tx)
		);

		return {
			height: parseInt(block.header.height),
			time: block.header.time,
			hash: data.block_id.hash,
			proposedAddress: block.header.proposer_address,
			decodedHashes,
		};
	}

	async getTransactionByHash(hash: string) {
		const RPC_URL = this.configService.get<string>('RPC_URL');
		const { data } = await axios.get(`${RPC_URL}/tx?hash=${hash}`);

		const tx = data.tx_result;
		if (!tx) {
			throw new BadRequestException(data);
		}

		const { data: block } = await axios.get(
			`${RPC_URL}/block?height=${data.height}`
		);
		if (!block) {
			throw new BadRequestException(block);
		}

		logger.log(tx);

		const parsedLog = JSON.parse(tx.log);
		const sender =
			parsedLog[0]?.events
				?.find((e: any) => e.type === 'message')
				?.attributes?.find((a: any) => a.key === 'sender')?.value || null;

		const rawTx = fromBase64(data.tx);
		const decodedTx = decodeTxRaw(rawTx);
		const fee = {
			amount: decodedTx.authInfo.fee.amount.map((coin) => ({
				denom: coin.denom,
				amount: coin.amount,
			})),
			gasLimit: decodedTx.authInfo.fee.gasLimit.toString(),
			payer: decodedTx.authInfo.fee.payer,
			granter: decodedTx.authInfo.fee.granter,
		};

		return {
			hash: data.hash,
			height: data.height,
			time: block.block.header.time,
			gasUsed: tx.gas_used || null,
			gasWanted: tx.gas_wanted || null,
			fee,
			sender,
		};
	}
}
