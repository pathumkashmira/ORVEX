/**
 * ORVEX Payment Provider Abstraction
 *
 * All payment credentials stay server-side. This module defines the
 * provider interface and ships stub implementations that simulate the
 * wire protocol. Swap stubs for real SDK calls in production.
 */

export type PaymentMethodType = "card" | "bank_transfer" | "crypto";
export type PaymentType = "full" | "deposit" | "quote";

export interface PaymentIntent {
  orderId: string;
  amount: number;        // USD cents
  currency: string;      // "USD"
  method: PaymentMethodType;
  paymentType: PaymentType;
  customerEmail: string;
  customerName: string;
  metadata: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: "completed" | "pending" | "requires_action" | "failed";
  providerRef: string;
  error?: string;
}

// ── Provider interface ──────────────────────────────────────────────────────

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  process(intent: PaymentIntent): Promise<PaymentResult>;
  refund?(transactionId: string, amount?: number): Promise<{ success: boolean }>;
}

// ── Stripe stub ─────────────────────────────────────────────────────────────
// In production: replace with `import Stripe from 'stripe'` on the server.
// API key lives in env, never sent to the browser.

class StripeProvider implements PaymentProvider {
  readonly id = "stripe";
  readonly name = "Stripe";

  async process(intent: PaymentIntent): Promise<PaymentResult> {
    // Stub: simulate a 900ms network round-trip
    await new Promise((r) => setTimeout(r, 900));
    const txId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      success: true,
      transactionId: txId,
      providerRef: `ch_${txId.slice(3)}`,
      status: "completed",
    };
  }

  async refund(transactionId: string) {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true };
  }
}

// ── Bank Transfer provider ─────────────────────────────────────────────────
// Creates a pending record; confirmed manually when funds clear.

class BankTransferProvider implements PaymentProvider {
  readonly id = "bank_transfer";
  readonly name = "Bank Transfer";

  async process(intent: PaymentIntent): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      transactionId: `bt_${Date.now()}`,
      providerRef: intent.orderId,
      status: "pending",
    };
  }
}

// ── Crypto provider ────────────────────────────────────────────────────────
// In production: verify on-chain via an RPC node or Alchemy/Infura webhook.

class CryptoProvider implements PaymentProvider {
  readonly id = "crypto";
  readonly name = "Crypto Wallet";

  async process(intent: PaymentIntent): Promise<PaymentResult> {
    // Stub: simulate broadcast → unconfirmed
    await new Promise((r) => setTimeout(r, 1800));
    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return {
      success: true,
      transactionId: txHash,
      providerRef: txHash,
      status: "pending", // confirmed via webhook in production
    };
  }
}

// ── Quote provider ─────────────────────────────────────────────────────────
// No payment collected — creates a quote request record only.

class QuoteProvider implements PaymentProvider {
  readonly id = "quote";
  readonly name = "Custom Quote";

  async process(_intent: PaymentIntent): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      transactionId: `qt_${Date.now()}`,
      providerRef: `QUOTE-${Date.now()}`,
      status: "pending",
    };
  }
}

// ── Registry ───────────────────────────────────────────────────────────────

const providers: Record<string, PaymentProvider> = {
  card: new StripeProvider(),
  bank_transfer: new BankTransferProvider(),
  crypto: new CryptoProvider(),
  quote: new QuoteProvider(),
};

export function getProvider(method: PaymentMethodType | "quote"): PaymentProvider {
  return providers[method] ?? providers.bank_transfer;
}

export async function processPayment(intent: PaymentIntent): Promise<PaymentResult> {
  const provider = getProvider(intent.paymentType === "quote" ? "quote" : intent.method);
  try {
    return await provider.process(intent);
  } catch (err) {
    return {
      success: false,
      transactionId: "",
      providerRef: "",
      status: "failed",
      error: err instanceof Error ? err.message : "Payment failed",
    };
  }
}

// ── Order reference ────────────────────────────────────────────────────────

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `ORVEX-ORD-${year}-${num}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `INV-${year}-${num}`;
}

export function generatePaymentRef(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `PAY-${year}-${num}`;
}
