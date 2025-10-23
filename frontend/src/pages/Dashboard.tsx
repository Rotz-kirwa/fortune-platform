import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentsAPI } from '../services/api';
import { Plus, Package, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import CreateOrderModal from '../components/dashboard/CreateOrderModal';
import PaymentModal from '../components/dashboard/PaymentModal';

interface Order {
  id: number;
  customer_name: string;
  product: string;
  amount: string;
  status: string;
  created_at: string;
}

interface Payment {
  id: number;
  order_id: number;
  amount: string;
  method: string;
  status: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, paymentsRes] = await Promise.all([
        ordersAPI.getAll(),
        paymentsAPI.getAll()
      ]);
      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreated = () => {
    fetchData();
    setShowCreateOrder(false);
  };

  const handlePaymentCreated = () => {
    fetchData();
    setShowPayment(false);
    setSelectedOrder(null);
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)', paddingTop: '5rem'}}>
      <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '1rem'}}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-gray-400">Here's what's happening with your investments today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div style={{padding: '0.5rem', background: 'rgba(255, 107, 53, 0.2)', borderRadius: '0.5rem'}}>
                <Package style={{height: '1.5rem', width: '1.5rem', color: '#ff6b35'}} />
              </div>
              <div style={{marginLeft: '0.75rem'}}>
                <p style={{fontSize: '0.8rem', fontWeight: '500', color: '#cccccc'}}>Total Orders</p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff'}}>{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div style={{padding: '0.5rem', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem'}}>
                <TrendingUp style={{height: '1.5rem', width: '1.5rem', color: '#f59e0b'}} />
              </div>
              <div style={{marginLeft: '0.75rem'}}>
                <p style={{fontSize: '0.8rem', fontWeight: '500', color: '#cccccc'}}>Pending</p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff'}}>{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div style={{padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem'}}>
                <DollarSign style={{height: '1.5rem', width: '1.5rem', color: '#10b981'}} />
              </div>
              <div style={{marginLeft: '0.75rem'}}>
                <p style={{fontSize: '0.8rem', fontWeight: '500', color: '#cccccc'}}>Revenue</p>
                <p style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff'}}>KSh {totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div style={{padding: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem'}}>
                <CreditCard style={{height: '1.5rem', width: '1.5rem', color: '#3b82f6'}} />
              </div>
              <div style={{marginLeft: '0.75rem'}}>
                <p style={{fontSize: '0.8rem', fontWeight: '500', color: '#cccccc'}}>Payments</p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff'}}>{payments.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 style={{fontSize: '1.2rem', fontWeight: '600', color: '#ffffff'}}>Recent Orders</h2>
              <button
                onClick={() => setShowCreateOrder(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </button>
            </div>
            
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 107, 53, 0.1)'}}>
                  <div>
                    <p style={{fontWeight: '500', color: '#ffffff', fontSize: '0.9rem'}}>{order.customer_name}</p>
                    <p style={{fontSize: '0.8rem', color: '#cccccc'}}>{order.product}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{fontWeight: '500', color: '#ffffff', fontSize: '0.9rem'}}>KSh {order.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-success-100 text-success-800' :
                      order.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payments Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 style={{fontSize: '1.2rem', fontWeight: '600', color: '#ffffff'}}>Recent Payments</h2>
            </div>
            
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(255, 107, 53, 0.1)'}}>
                  <div>
                    <p style={{fontWeight: '500', color: '#ffffff', fontSize: '0.9rem'}}>Order #{payment.order_id}</p>
                    <p style={{fontSize: '0.8rem', color: '#cccccc'}}>{payment.method.toUpperCase()}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <p style={{fontWeight: '500', color: '#ffffff', fontSize: '0.9rem'}}>KSh {payment.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed' ? 'bg-success-100 text-success-800' :
                      payment.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateOrder && (
        <CreateOrderModal
          onClose={() => setShowCreateOrder(false)}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {showPayment && selectedOrder && (
        <PaymentModal
          order={selectedOrder}
          onClose={() => {
            setShowPayment(false);
            setSelectedOrder(null);
          }}
          onPaymentCreated={handlePaymentCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;