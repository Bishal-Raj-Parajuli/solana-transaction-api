import express from "express";
import { TransactionController } from "../controllers/transactionController.js";
import { transactionCacheMiddleware } from '../middleware/transactionCacheMiddleware.js';

const router = express.Router();
const transactionController = new TransactionController();

router.get(
  '/transaction/:ca', 
  transactionCacheMiddleware,
  (req, res) => transactionController.getTransactionDetail(req, res)
);

export default router;