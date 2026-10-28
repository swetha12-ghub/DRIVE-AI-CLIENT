import { UploadedFile } from '../types/review';

export interface SampleTaskPackage {
  id: string;
  name: string;
  folderName: string;
  category: string;
  description: string;
  files: UploadedFile[];
}

export const SAMPLE_TASKS: SampleTaskPackage[] = [
  {
    id: 'sample-fintech',
    name: 'FinTech Core Payment & Auth Engine (Sprint 14)',
    folderName: 'fintech-payment-engine-v2',
    category: 'Fintech & Security',
    description: 'Completed backend microservice with biometric auth tokens, idempotency keys, payment webhooks, and unit test suites.',
    files: [
      {
        name: 'paymentGateway.ts',
        path: 'src/services/paymentGateway.ts',
        size: 3420,
        type: 'text/typescript',
        content: `import { createHash } from 'crypto';

export interface ChargeRequest {
  idempotencyKey: string;
  amountCents: number;
  currency: 'USD' | 'EUR' | 'GBP';
  customerId: string;
  metadata?: Record<string, string>;
}

export class PaymentGatewayService {
  private processedKeys = new Set<string>();

  async processTransaction(request: ChargeRequest) {
    if (!request.idempotencyKey || request.idempotencyKey.trim().length === 0) {
      throw new Error('ValidationError: Missing mandatory idempotencyKey for transaction safety.');
    }

    if (request.amountCents <= 0) {
      throw new Error('ValidationError: amountCents must be strictly positive.');
    }

    if (this.processedKeys.has(request.idempotencyKey)) {
      return { status: 'DUPLICATE_IGNORED', message: 'Transaction already committed.' };
    }

    this.processedKeys.add(request.idempotencyKey);
    // Secure transaction processing dispatch
    const transactionId = 'tx_' + createHash('sha256').update(request.idempotencyKey + Date.now()).digest('hex').slice(0, 16);
    return {
      status: 'SUCCESS',
      transactionId,
      amount: request.amountCents / 100,
      currency: request.currency,
      timestamp: new Date().toISOString()
    };
  }
}`,
      },
      {
        name: 'tokenAuth.ts',
        path: 'src/middleware/tokenAuth.ts',
        size: 2180,
        type: 'text/typescript',
        content: `export function verifySessionToken(headerValue?: string): { userId: string; role: string } {
  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    throw new Error('AuthenticationError: Bearer authorization header required.');
  }

  const token = headerValue.slice(7);
  if (token.length < 32) {
    throw new Error('AuthenticationError: Malformed token length.');
  }

  // Simulated validated claims
  return {
    userId: 'usr_9882103',
    role: 'finance_operator'
  };
}`,
      },
      {
        name: 'payment.spec.ts',
        path: 'tests/payment.spec.ts',
        size: 1950,
        type: 'text/typescript',
        content: `import { PaymentGatewayService } from '../src/services/paymentGateway';

describe('PaymentGatewayService Unit Tests', () => {
  it('prevents double charge using idempotency key', async () => {
    const service = new PaymentGatewayService();
    const req = { idempotencyKey: 'idemp_99182', amountCents: 4500, currency: 'USD' as const, customerId: 'c_12' };
    
    const res1 = await service.processTransaction(req);
    expect(res1.status).toBe('SUCCESS');

    const res2 = await service.processTransaction(req);
    expect(res2.status).toBe('DUPLICATE_IGNORED');
  });

  it('rejects non-positive transaction amounts', async () => {
    const service = new PaymentGatewayService();
    await expect(service.processTransaction({
      idempotencyKey: 'idemp_neg',
      amountCents: -50,
      currency: 'USD',
      customerId: 'c_12'
    })).rejects.toThrow('amountCents must be strictly positive');
  });
});`,
      },
      {
        name: 'README.md',
        path: 'README.md',
        size: 1840,
        type: 'text/markdown',
        content: `# Payment Gateway Engine v2

## Deliverable Scope
- Production-ready transaction idempotency handler.
- Bearer token authentication middleware with role claims.
- Isolated test harness with zero external dependencies.

## Acceptance Criteria
- [x] All amounts handled in integer cents to prevent floating point drift.
- [x] Zero hardcoded API keys.
- [x] Automated unit test suite passing 100%.`,
      },
      {
        name: 'package.json',
        path: 'package.json',
        size: 620,
        type: 'application/json',
        content: `{
  "name": "fintech-payment-engine",
  "version": "2.4.0",
  "private": true,
  "scripts": {
    "test": "jest",
    "build": "tsc"
  },
  "dependencies": {
    "dotenv": "^16.4.5"
  }
}`,
      },
    ],
  },
  {
    id: 'sample-ai-assistant',
    name: 'Enterprise Customer Intelligence & Speech Pipeline',
    folderName: 'customer-intelligence-pipeline',
    category: 'AI & Cloud Infrastructure',
    description: 'Production AI conversational intelligence pipeline, real-time audio socket handler, and sentiment classification service.',
    files: [
      {
        name: 'sentimentEngine.ts',
        path: 'src/sentimentEngine.ts',
        size: 2890,
        type: 'text/typescript',
        content: `export interface CallSnippet {
  speaker: 'agent' | 'customer';
  transcript: string;
  latencyMs: number;
}

export function classifyCallTone(transcript: string): 'Urgent' | 'Positive' | 'Frustrated' | 'Inquiry' {
  const lower = transcript.toLowerCase();
  if (lower.includes('immediately') || lower.includes('down') || lower.includes('breach')) return 'Urgent';
  if (lower.includes('terrible') || lower.includes('cancel') || lower.includes('angry')) return 'Frustrated';
  if (lower.includes('thank') || lower.includes('great') || lower.includes('awesome')) return 'Positive';
  return 'Inquiry';
}`,
      },
      {
        name: 'audioStreamer.ts',
        path: 'src/audioStreamer.ts',
        size: 2400,
        type: 'text/typescript',
        content: `export class AudioStreamBridge {
  private bufferQueue: Uint8Array[] = [];

  enqueuePcmChunk(pcmData: Uint8Array) {
    if (pcmData.length === 0) return;
    this.bufferQueue.push(pcmData);
  }

  drainBuffer(): Uint8Array {
    const totalLen = this.bufferQueue.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of this.bufferQueue) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    this.bufferQueue = [];
    return merged;
  }
}`,
      },
      {
        name: 'README.md',
        path: 'README.md',
        size: 1450,
        type: 'text/markdown',
        content: `# Customer Intelligence Pipeline

Audio ingestion pipeline for customer support calls with sentiment analysis and adaptive response dispatch.`,
      },
    ],
  },
];
