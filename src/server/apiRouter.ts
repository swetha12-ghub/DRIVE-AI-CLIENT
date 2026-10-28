import type { IncomingMessage, ServerResponse } from 'http';
import { evaluateTaskDeliverables, processVoiceMeetingAssistant } from './geminiService';

export function handleApiRequests(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (!req.url?.startsWith('/api/')) {
    return next();
  }

  // Parse JSON body helper
  const readJsonBody = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });
  };

  const sendJson = (data: any, statusCode = 200) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.url === '/api/evaluate-task' && req.method === 'POST') {
    readJsonBody()
      .then(async (payload) => {
        const report = await evaluateTaskDeliverables(payload);
        sendJson(report);
      })
      .catch((err) => {
        console.error('API Error /api/evaluate-task:', err);
        sendJson({ error: err.message || 'Evaluation failed' }, 500);
      });
    return;
  }

  if (req.url === '/api/voice-review' && req.method === 'POST') {
    readJsonBody()
      .then(async (payload) => {
        const result = await processVoiceMeetingAssistant(payload);
        sendJson(result);
      })
      .catch((err) => {
        console.error('API Error /api/voice-review:', err);
        sendJson({ error: err.message || 'Voice review failed' }, 500);
      });
    return;
  }

  // Fallback for unknown /api route
  sendJson({ error: 'Endpoint not found' }, 404);
}
