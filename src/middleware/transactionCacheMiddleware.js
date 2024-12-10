import Cache from 'node-cache';

// Create cache with 5 minute TTL (Time To Live)
export const transactionCache = new Cache({ 
  stdTTL: 60 * 5,  // 5 minutes in seconds
  checkperiod: 60   // Check for expired keys every minute
});

export const transactionCacheMiddleware = (req, res, next) => {
  try {
    const cachedData = transactionCache.get("transaction-list");
    if (cachedData) {
      res.status(200).json(cachedData);
      const cacheAge = Date.now() - transactionCache.getTtl("transaction-list");
      if (cacheAge > (4)) { // 4 seconds Check
        refreshCache(transactionService);
      }
    } else {
      next();
    }
  } catch (err) {
    console.error('Cache middleware error:', err);
    next();
  }
};

// Function to refresh cache in background
async function refreshCache(transactionService) {
  try {
    const newData = await transactionService.getTransactionHistory();
    transactionCache.set("transaction-list", newData);
    console.log('Cache refreshed successfully');
  } catch (err) {
    console.error('Failed to refresh cache:', err);
  }
}