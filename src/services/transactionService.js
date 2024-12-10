import 'dotenv/config';
import { Connection, PublicKey } from "@solana/web3.js";
import {calculateDetailedSolUsage,parseTokenAmount,determineTransactionType} from '../utils/transactionUtils.js'

let RPC_URL = process.env.RPC_URL;
const txLimit = Number(process.env.TSX_LIMIT) || 10;

export class TransactionService {
    constructor(){
        this.connection = new Connection(RPC_URL)
    }

    async getTransactionHistory(ca){
        const mintPubkey = new PublicKey(ca);
        try {
            const signatures = await this.connection.getSignaturesForAddress(mintPubkey, {
                limit: txLimit
            });
    
            const transactions = await Promise.all(
                signatures.map(async (sig) => {
                    try {
                        const tx = await this.connection.getParsedTransaction(sig.signature, {
                            maxSupportedTransactionVersion: 0
                        });
    
                        if (!tx || !tx.meta) {
                            return null;
                        }
                          
                        let walletAddress = 'Unknown';
                        if (tx.transaction?.message?.accountKeys) {
                            const accounts = tx.transaction.message.accountKeys;
                            for (let account of accounts) {
                                if (account.signer && account.writable) {
                                    walletAddress = account.pubkey.toString();
                                    break;
                                }
                            }
                        }
    
                        // Get all relevant transaction data
                        const solData = calculateDetailedSolUsage(tx);
                        const tokenAmount = parseTokenAmount(tx);
                        const type = determineTransactionType(tx);
    
                        return {
                            signature: sig.signature,
                            slot: tx.slot || 0,
                            timestamp: tx.blockTime || 0,
                            wallet: walletAddress,
                            amount: tokenAmount,
                            solUsed: solData,
                            type: type
                        };
                    } catch (error) {
                        console.error(`Error processing transaction ${sig.signature}:`, error);
                        return null;
                    }
                })
            );
    
            const filteredTransaction = transactions.filter(tx => tx !== null);

            const transactionDetails = []

            if (filteredTransaction.length > 0) {
                filteredTransaction.forEach((tx, index) => {

                    transactionDetails.push({
                        signature :tx.signature,
                        block: tx.slot,
                        timestamp: tx.timestamp,
                        tsxWallet: tx.wallet,
                        tokenAmount: tx.amount,
                        solDetail: {
                            solValue: tx.solUsed.total,
                            fee: tx.solUsed.fee
                        },
                        type: tx.type

                    })
                });
              } else {
                throw new error("\nNo transaction history available");
              }
            return transactionDetails;
    
        } catch (error) {
            console.error('Error in getTransactionHistory:', error);
            return [];
        }
    }
}