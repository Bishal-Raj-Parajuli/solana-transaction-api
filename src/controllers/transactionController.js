import { transactionCache } from '../middleware/transactionCacheMiddleware.js';
import { TransactionService } from '../services/transactionService.js';

export class TransactionController {
  constructor() {
    this.transactionService = new TransactionService();
  }

  async getTransactionDetail(req, res) {
    try {
      const ca = req.params.ca;
      if(ca){
        const transactionDetails = await this.transactionService.getTransactionHistory(ca);
        transactionCache.set("transaction-list", transactionDetails); //update cache
        return res.status(200).json(transactionDetails);
      }else{
        return res.status(400).json({ 
          message: "Please provide a valid contract address"
        });
      }
      
    } catch (error) {
      console.log(error)
      // Try to get data from cache if service fails
      const cachedData = transactionCache.get("transaction-list");
      if (cachedData) {
        // Return cached data with success status
        return res.status(200).json(cachedData);
      }
      
      // If no cache available, return error
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  }
}