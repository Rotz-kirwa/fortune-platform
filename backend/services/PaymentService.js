// services/PaymentService.js
const Payment = require('../models/Payment');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Balance = require('../models/Balance');
const AuditLog = require('../models/AuditLog');

class PaymentService {
  /**
   * Process M-PESA STK Push callback
   */
  async processCallback(callbackData) {
    try {
      console.log('Processing M-PESA callback:', JSON.stringify(callbackData, null, 2));

      // Extract callback details
      const { Body } = callbackData;
      const { stkCallback } = Body;
      
      const {
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        CallbackMetadata
      } = stkCallback;

      // Find payment by CheckoutRequestID or MerchantRequestID
      const payment = await Payment.findByMpesaTransactionId(CheckoutRequestID) || 
                      await Payment.findByMpesaTransactionId(MerchantRequestID);

      if (!payment) {
        console.error('Payment not found for callback:', CheckoutRequestID);
        // Log to audit
        await AuditLog.create({
          action: 'payment_callback_orphaned',
          entity_type: 'payment',
          new_value: { CheckoutRequestID, MerchantRequestID, ResultCode, ResultDesc }
        });
        return { status: 'error', message: 'Payment not found' };
      }

      // Check for duplicate callback
      if (payment.status === 'completed') {
        console.log('Duplicate callback detected for payment:', payment.id);
        return { status: 'duplicate', message: 'Payment already processed' };
      }

      // Log callback received
      await AuditLog.logPaymentCallback(payment.user_id, payment.id, callbackData);

      // Check if payment was successful
      if (ResultCode === 0 || ResultCode === '0') {
        // Payment successful
        return await this.handleSuccessfulPayment(payment, stkCallback);
      } else {
        // Payment failed
        return await this.handleFailedPayment(payment, ResultCode, ResultDesc);
      }
    } catch (error) {
      console.error('Error processing callback:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(payment, stkCallback) {
    try {
      const { CallbackMetadata } = stkCallback;
      const metadata = CallbackMetadata?.Item || [];

      // Extract payment details from metadata
      const amount = this.extractMetadataValue(metadata, 'Amount');
      const mpesaReceiptNumber = this.extractMetadataValue(metadata, 'MpesaReceiptNumber');
      const transactionDate = this.extractMetadataValue(metadata, 'TransactionDate');
      const phoneNumber = this.extractMetadataValue(metadata, 'PhoneNumber');

      console.log('Payment successful:', {
        payment_id: payment.id,
        amount,
        mpesaReceiptNumber,
        phoneNumber
      });

      // Verify payment amount matches
      if (amount && parseFloat(amount) !== parseFloat(payment.amount)) {
        console.error('Amount mismatch:', { expected: payment.amount, received: amount });
        await AuditLog.create({
          user_id: payment.user_id,
          action: 'payment_amount_mismatch',
          entity_type: 'payment',
          entity_id: payment.id,
          old_value: { expected_amount: payment.amount },
          new_value: { received_amount: amount, mpesaReceiptNumber }
        });
        // Still process but log the mismatch
      }

      // Update payment record
      await Payment.updateWithCallback(
        payment.id,
        stkCallback,
        mpesaReceiptNumber,
        'completed'
      );

      // Create transaction record
      await Transaction.create({
        user_id: payment.user_id,
        type: 'deposit',
        amount: payment.amount,
        reference: mpesaReceiptNumber || payment.mpesa_transaction_id,
        description: `M-PESA deposit - ${mpesaReceiptNumber}`,
        metadata: {
          payment_id: payment.id,
          investment_id: payment.investment_id,
          phone_number: phoneNumber,
          transaction_date: transactionDate
        },
        status: 'completed'
      });

      // Update user balance
      await Balance.addToTotalDeposited(payment.user_id, payment.amount);

      // Activate investment if linked
      if (payment.investment_id) {
        await this.activateInvestment(payment.investment_id, payment.user_id);
      }

      // Log success
      await AuditLog.create({
        user_id: payment.user_id,
        action: 'payment_completed',
        entity_type: 'payment',
        entity_id: payment.id,
        new_value: {
          amount: payment.amount,
          mpesa_receipt: mpesaReceiptNumber,
          investment_id: payment.investment_id
        }
      });

      console.log('Payment processed successfully:', payment.id);

      return {
        status: 'success',
        message: 'Payment processed successfully',
        payment_id: payment.id,
        mpesa_receipt: mpesaReceiptNumber
      };
    } catch (error) {
      console.error('Error handling successful payment:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(payment, resultCode, resultDesc) {
    try {
      console.log('Payment failed:', {
        payment_id: payment.id,
        result_code: resultCode,
        result_desc: resultDesc
      });

      // Update payment status
      await Payment.updateStatus(payment.id, 'failed');

      // Create failed transaction record
      await Transaction.create({
        user_id: payment.user_id,
        type: 'deposit',
        amount: payment.amount,
        reference: payment.mpesa_transaction_id,
        description: `M-PESA deposit failed - ${resultDesc}`,
        metadata: {
          payment_id: payment.id,
          investment_id: payment.investment_id,
          result_code: resultCode,
          result_desc: resultDesc
        },
        status: 'failed'
      });

      // Log failure
      await AuditLog.create({
        user_id: payment.user_id,
        action: 'payment_failed',
        entity_type: 'payment',
        entity_id: payment.id,
        new_value: {
          result_code: resultCode,
          result_desc: resultDesc,
          investment_id: payment.investment_id
        }
      });

      return {
        status: 'failed',
        message: resultDesc,
        payment_id: payment.id
      };
    } catch (error) {
      console.error('Error handling failed payment:', error);
      throw error;
    }
  }

  /**
   * Activate investment after successful payment
   */
  async activateInvestment(investment_id, user_id) {
    try {
      // Get investment details
      const investment = await Investment.findById(investment_id);
      
      if (!investment) {
        console.error('Investment not found:', investment_id);
        return;
      }

      // Investment is already active by default when created
      // But we can add additional logic here if needed
      console.log('Investment activated:', investment_id);

      // Log investment activation
      await AuditLog.create({
        user_id,
        action: 'investment_activated',
        entity_type: 'investment',
        entity_id: investment_id,
        new_value: {
          plan_name: investment.plan_name,
          amount: investment.amount,
          daily_return_rate: investment.daily_return_rate,
          duration_days: investment.duration_days
        }
      });

      return investment;
    } catch (error) {
      console.error('Error activating investment:', error);
      throw error;
    }
  }

  /**
   * Verify payment details
   */
  async verifyPayment(transactionId, expectedAmount, expectedPhone) {
    try {
      const payment = await Payment.findByMpesaTransactionId(transactionId);
      
      if (!payment) {
        return { valid: false, reason: 'Payment not found' };
      }

      if (payment.status === 'completed') {
        return { valid: false, reason: 'Payment already processed' };
      }

      if (expectedAmount && parseFloat(payment.amount) !== parseFloat(expectedAmount)) {
        return { valid: false, reason: 'Amount mismatch' };
      }

      if (expectedPhone && payment.phone_number !== expectedPhone) {
        return { valid: false, reason: 'Phone number mismatch' };
      }

      return { valid: true, payment };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { valid: false, reason: 'Verification error' };
    }
  }

  /**
   * Extract value from M-PESA callback metadata
   */
  extractMetadataValue(metadata, name) {
    const item = metadata.find(item => item.Name === name);
    return item ? item.Value : null;
  }

  /**
   * Get payment by M-PESA transaction ID
   */
  async getPaymentByMpesaId(mpesaTransactionId) {
    return await Payment.findByMpesaTransactionId(mpesaTransactionId);
  }

  /**
   * Create payment record for investment
   */
  async createPaymentForInvestment(user_id, investment_id, amount, phone_number, checkoutRequestId) {
    try {
      const payment = await Payment.create({
        user_id,
        investment_id,
        amount,
        method: 'mpesa',
        phone_number,
        mpesa_transaction_id: checkoutRequestId,
        status: 'pending'
      });

      await AuditLog.create({
        user_id,
        action: 'payment_initiated',
        entity_type: 'payment',
        entity_id: payment.id,
        new_value: {
          amount,
          investment_id,
          phone_number,
          checkout_request_id: checkoutRequestId
        }
      });

      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
}

// Helper function to find investment by ID
Investment.findById = async function(id) {
  const pool = require('../config/db');
  const result = await pool.query('SELECT * FROM investments WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = new PaymentService();
