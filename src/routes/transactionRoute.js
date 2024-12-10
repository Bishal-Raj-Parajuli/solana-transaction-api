import express from "express";
import { TransactionController } from "../controllers/transactionController.js";
import { transactionCacheMiddleware } from '../middleware/transactionCacheMiddleware.js';

const router = express.Router();
const transactionController = new TransactionController();

router.get(
  '/transaction/:ca', 
  transactionCacheMiddleware,
  transactionController.getTransactionDetail.bind(transactionController)
);

export default router;