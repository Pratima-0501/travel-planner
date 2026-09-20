import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { CoordinatorAgent } from './agents/orchestratorAgent';
import { SafetyPipeline } from './security/filter';
import { SlidingWindowRateLimiter } from './security/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Allows your React frontend (on port 5173) to call this API
app.use(express.json());

const coordinator = new CoordinatorAgent();
const safety = new SafetyPipeline();
const limiter = new SlidingWindowRateLimiter(10, 60000);

app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Valid message required.' });
      return;
    }

    if (!limiter.isAllowed()) {
      res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
      return;
    }

    const safetyCheck = safety.sanitizeInput(message);
    if (!safetyCheck.safe) {
      res.status(400).json({ error: safetyCheck.reason });
      return;
    }

    // Run your agent workflow
    const agentReply = await coordinator.planCompleteTrip(message);
    const cleanOutput = safety.sanitizeOutput(agentReply);

    res.json({ reply: cleanOutput });
  } catch (err: unknown) {
    console.error('Agent error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Agent execution failed.';
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Agent API running at http://localhost:${PORT}`);
});