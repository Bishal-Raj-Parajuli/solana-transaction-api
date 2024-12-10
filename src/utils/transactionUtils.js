import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function calculateDetailedSolUsage(transaction) {
    try {
        if (!transaction.meta) {
            return { total: '0', fee: '0', changes: [] };
        }

        const fee = transaction.meta.fee || 0;
        const preBalances = transaction.meta.preBalances || [];
        const postBalances = transaction.meta.postBalances || [];
        const accountKeys = transaction.transaction.message.accountKeys || [];

        // Track changes for each account
        let changes = [];
        let totalChange = 0;

        for (let i = 0; i < preBalances.length; i++) {
            const pre = preBalances[i];
            const post = postBalances[i];
            const change = (pre - post) / LAMPORTS_PER_SOL;
            
            if (change !== 0) {
                const accountPubkey = accountKeys[i]?.pubkey?.toString() || 'unknown';
                changes.push({
                    account: accountPubkey,
                    change: change.toFixed(9)
                });
                
                // Only add to total if it's a decrease (SOL spent)
                if (change > 0) {
                    totalChange += change;
                }
            }
        }

        const feeInSol = fee / LAMPORTS_PER_SOL;

        return {
            total: totalChange.toFixed(9),
            fee: feeInSol.toFixed(9),
            changes: changes
        };

    } catch (error) {
        console.error('Error calculating detailed SOL usage:', error);
        return {
            total: '0',
            fee: '0',
            changes: []
        };
    }
}

export function parseTokenAmount(transaction) {
    try {
        const postBalances = transaction.meta.postTokenBalances || [];
        const preBalances = transaction.meta.preTokenBalances || [];

        let maxChange = 0;
        
        for (const post of postBalances) {
            const pre = preBalances.find(p => p.accountIndex === post.accountIndex);
            if (pre) {
                const change = Math.abs(
                    (post.uiTokenAmount?.uiAmount || 0) - 
                    (pre.uiTokenAmount?.uiAmount || 0)
                );
                maxChange = Math.max(maxChange, change);
            }
        }

        return maxChange;

    } catch (error) {
        console.error('Error parsing token amount:', error);
        return 0;
    }
}

export function determineTransactionType(transaction) {
    try {
        const postBalances = transaction.meta.postTokenBalances || [];
        const preBalances = transaction.meta.preTokenBalances || [];

        if (postBalances.length === 0 || preBalances.length === 0) {
            return 'Unknown';
        }

        const post = postBalances[0];
        const pre = preBalances.find(p => p.accountIndex === post.accountIndex);

        if (!pre) return 'Unknown';

        const preAmount = pre.uiTokenAmount?.uiAmount || 0;
        const postAmount = post.uiTokenAmount?.uiAmount || 0;

        if (postAmount > preAmount) {
            return 'Buy';
        } else if (preAmount > postAmount) {
            return 'Sell';
        }

        return 'Transfer';

    } catch (error) {
        console.error('Error determining transaction type:', error);
        return 'Unknown';
    }
}