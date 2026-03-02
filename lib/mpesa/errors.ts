/**
 * M-Pesa ResultCodes and Human-Friendly Error Messages
 */

export interface MpesaError {
  code: number;
  logMessage: string;
  customerMessage: string;
  retryable: boolean;
  suggestedAction: string;
}

export const MPESA_ERROR_CODES: Record<number, MpesaError> = {
  0: {
    code: 0,
    logMessage: "Success",
    customerMessage: "Payment successful.",
    retryable: false,
    suggestedAction: "None"
  },
  1: {
    code: 1,
    logMessage: "Insufficient Funds",
    customerMessage: "Your M-Pesa balance is insufficient. Please top up and try again.",
    retryable: true,
    suggestedAction: "Top up M-Pesa"
  },
  1032: {
    code: 1032,
    logMessage: "Request cancelled by user",
    customerMessage: "You cancelled the payment. Please try again if this was a mistake.",
    retryable: true,
    suggestedAction: "Retry payment"
  },
  1037: {
    code: 1037,
    logMessage: "DS Timeout / User did not enter PIN",
    customerMessage: "The payment request timed out. Please keep your phone unlocked and try again.",
    retryable: true,
    suggestedAction: "Retry payment"
  },
  2001: {
    code: 2001,
    logMessage: "Invalid PIN",
    customerMessage: "You entered an incorrect M-Pesa PIN. Please try again with the correct PIN.",
    retryable: true,
    suggestedAction: "Retry with correct PIN"
  },
  1001: {
    code: 1001,
    logMessage: "Unable to lock subscriber / Another transaction in progress",
    customerMessage: "M-Pesa is currently busy processing another request on your phone. Please try again in a moment.",
    retryable: true,
    suggestedAction: "Wait and retry"
  },
  17: {
    code: 17,
    logMessage: "Rules Violation / Exceeding limits",
    customerMessage: "Transaction declined. You may have exceeded your daily M-Pesa limit or violated a Safaricom rule.",
    retryable: false,
    suggestedAction: "Contact Safaricom support"
  },
  26: {
    code: 26,
    logMessage: "Traffic blocking / System congested",
    customerMessage: "M-Pesa is currently experiencing high traffic. Please try again in a few minutes.",
    retryable: true,
    suggestedAction: "Retry later"
  },
  1019: {
    code: 1019,
    logMessage: "Transaction expired",
    customerMessage: "The payment session expired. Please try again.",
    retryable: true,
    suggestedAction: "Retry payment"
  },
  1025: {
    code: 1025,
    logMessage: "Internal Error",
    customerMessage: "M-Pesa encountered an internal error. Please try again later.",
    retryable: true,
    suggestedAction: "Retry later"
  },
  9999: {
    code: 9999,
    logMessage: "Unknown Error",
    customerMessage: "Something went wrong with the M-Pesa payment. Please try again or contact support.",
    retryable: true,
    suggestedAction: "Retry or contact support"
  }
};

/**
 * Gets a human-friendly error message for a given ResultCode
 */
export function getMpesaError(code: number | string): MpesaError {
  const numericCode = typeof code === 'string' ? parseInt(code, 10) : code;
  return MPESA_ERROR_CODES[numericCode] || MPESA_ERROR_CODES[9999];
}
