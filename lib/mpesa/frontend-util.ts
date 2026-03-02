/**
 * M-Pesa Frontend Integration Utility
 * 
 * This file provides a clean pattern for initiating and polling M-Pesa payments.
 */

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  mpesaReceiptNumber?: string;
  amount?: number;
}

/**
 * Initiates an M-Pesa STK Push payment
 */
export async function initiatePayment(phone: string, orderId: string) {
  const response = await fetch('/api/mpesa/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate payment');
  }

  return await response.json(); // { success, message, checkoutRequestId }
}

/**
 * Polls the payment status until it's no longer pending or timeout reached
 * 
 * @param checkoutRequestId The ID returned from initiatePayment
 * @param interval Polling interval in ms (default 5s)
 * @param timeout Maximum polling time in ms (default 2 mins)
 */
export async function pollPaymentStatus(
  checkoutRequestId: string, 
  interval = 5000, 
  timeout = 120000
): Promise<PaymentStatus> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();

        if (data.status === 'completed' || data.status === 'failed') {
          return resolve(data);
        }

        // Check for timeout
        if (Date.now() - startTime > timeout) {
          return resolve({
            status: 'pending',
            message: 'Payment confirmation taking longer than expected. Please check your order history later.'
          });
        }

        // Continue polling
        setTimeout(poll, interval);
      } catch (error) {
        console.error('Polling error:', error);
        // On transient error, keep polling until timeout
        if (Date.now() - startTime > timeout) {
          return reject(error);
        }
        setTimeout(poll, interval);
      }
    };

    poll();
  });
}

/**
 * Vanilla JS Usage Example:
 * 
 * async function handleCheckout() {
 *   try {
 *     showSpinner();
 *     const { checkoutRequestId } = await initiatePayment('0712345678', 'order-123');
 *     showStatus("Please enter your PIN on your phone...");
 *     
 *     const result = await pollPaymentStatus(checkoutRequestId);
 *     
 *     if (result.status === 'completed') {
 *       window.location.href = '/order-confirmation?id=order-123';
 *     } else {
 *       showError(result.message);
 *     }
 *   } catch (err) {
 *     showError(err.message);
 *   } finally {
 *     hideSpinner();
 *   }
 * }
 */
