import React, { useState } from 'react';
import { paymentsAPI } from '../../services/api';
import { X, Smartphone } from 'lucide-react';

interface Order {
  id: number;
  customer_name: string;
  product: string;
  amount: string;
  status: string;
}

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onPaymentCreated: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose, onPaymentCreated }) => {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      setError('Phone number is required for M-PESA payment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Initiate STK Push
      await paymentsAPI.stkPush({
        amount: parseFloat(order.amount),
        phoneNumber: phoneNumber,
        accountReference: `order-${order.id}`
      });

      // Create payment record
      await paymentsAPI.create({
        order_id: order.id,
        amount: parseFloat(order.amount),
        method: 'mpesa'
      });

      setSuccess('M-PESA payment initiated! Check your phone for the payment prompt.');
      setTimeout(() => {
        onPaymentCreated();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtherPayment = async () => {
    setLoading(true);
    setError('');

    try {
      await paymentsAPI.create({
        order_id: order.id,
        amount: parseFloat(order.amount),
        method: paymentMethod
      });

      setSuccess('Payment recorded successfully!');
      setTimeout(() => {
        onPaymentCreated();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment recording failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
          <p className="text-sm text-gray-600">Customer: {order.customer_name}</p>
          <p className="text-sm text-gray-600">Product: {order.product}</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">Amount: KSh {order.amount}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success-50 border border-success-200 text-success-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="mpesa">M-PESA</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Credit/Debit Card</option>
            </select>
          </div>

          {paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="254712345678"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter phone number in format: 254712345678
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={paymentMethod === 'mpesa' ? handleMpesaPayment : handleOtherPayment}
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 
               paymentMethod === 'mpesa' ? 'Send M-PESA Prompt' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;