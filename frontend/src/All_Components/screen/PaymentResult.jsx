import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, CreditCard, Award, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from './AuthContext';

export default function PaymentResult() {
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Only get user, we'll handle refresh separately

  useEffect(() => {
const checkPaymentStatus = async (paymentId = null, currentRetryCount = 0) => {
  try {
    // Get payment ID from various sources
    let paymentIdToCheck = paymentId || 
                          searchParams.get('payment_id') || 
                          searchParams.get('payment_intent') || 
                          searchParams.get('session_id') ||
                          searchParams.get('id');
    
    // If no paymentId in URL, check localStorage for the most recent one
    if (!paymentIdToCheck) {
      paymentIdToCheck = localStorage.getItem('lastPaymentId');
    }

    console.log('PaymentResult: Checking payment status', { 
      paymentId: paymentIdToCheck,
      retryCount: currentRetryCount
    });

    if (!paymentIdToCheck) {
      throw new Error('Payment reference not found');
    }

    // Check with our backend
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/payments/status/${paymentIdToCheck}`,
      { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );

    console.log('PaymentResult: Status response', response.data);

    setPaymentData(response.data);
    
    if (response.data.status === 'paid') {
      setStatus('success');
      
      // Clear ONLY this payment from storage, not all payments
      if (localStorage.getItem('lastPaymentId') === paymentIdToCheck) {
        localStorage.removeItem('lastPaymentId');
      }
      
      // Refresh user wallet balance
      await refreshUserWallet();
      
      // Track Purchase event for TikTok Pixel
      if (window.ttq) {
        window.ttq.track('Purchase', {
          content_id: paymentIdToCheck,
          value: response.data.amount || 0.00,
          currency: 'USD',
          credits_added: response.data.credits || response.data.creditsAdded,
        });
      }
      
      // Show success toast
      toast.success('Payment successful! Credits added to your account.');
      
    } else if (response.data.status === 'pending' || response.data.status === 'processing') {
      // Retry after delay if we haven't exceeded max retries
      if (currentRetryCount < maxRetries) {
        setTimeout(() => {
          checkPaymentStatus(paymentIdToCheck, currentRetryCount + 1);
        }, 2000);
      } else {
        setStatus('pending');
        // Don't show error for pending status
        toast.info('Payment is still processing. You can check back later.');
      }
    } else {
      setStatus('failed');
      toast.error('Payment failed or was canceled');
    }
  } catch (error) {
    console.error('Payment verification failed:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (currentRetryCount < maxRetries) {
      // Retry on network errors
      setTimeout(() => {
        checkPaymentStatus(null, currentRetryCount + 1);
      }, 2000);
    } else {
      setStatus('failed');
      setPaymentData({
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               error.message || 
               'Payment verification failed'
      });
      toast.error('Payment verification failed');
    }
  }
};

    // Start checking payment status
    checkPaymentStatus(null, 0);
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Clear any timeouts if component unmounts
      const timeouts = [];
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = (...args) => {
        const timeoutId = originalSetTimeout(...args);
        timeouts.push(timeoutId);
        return timeoutId;
      };
      
      // Clear all timeouts
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      window.setTimeout = originalSetTimeout;
    };
  }, [searchParams]);

  // Function to refresh user wallet
  const refreshUserWallet = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/wallet/balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      if (response.data.credits) {
        console.log('Wallet refreshed:', response.data.credits);
        // You could emit a custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('walletUpdated', { 
          detail: { credits: response.data.credits } 
        }));
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    }
  };

  // Handle manual retry
  const handleRetry = () => {
    setStatus('loading');
    setRetryCount(0);
    setPaymentData(null);
    
    // Get payment ID again
    const paymentId = searchParams.get('payment_id') || 
                     searchParams.get('payment_intent') || 
                     searchParams.get('session_id') ||
                     searchParams.get('id') ||
                     localStorage.getItem('lastPaymentId') ||
                     localStorage.getItem('paymentId');
    
    if (paymentId) {
      checkPaymentStatus(paymentId, 0);
    } else {
      toast.error('No payment reference found');
      setStatus('failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">Processing Payment...</p>
          <p className="text-gray-500">Please wait while we confirm your payment</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-400">
              Attempt {retryCount + 1} of {maxRetries + 1}
            </p>
          )}
        </div>
        
        {/* Manual retry button */}
        {retryCount >= 3 && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Checking
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full space-y-6">
        {status === 'success' ? (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
              </div>
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto relative" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-gray-600">
                Thank you for your purchase. Credits have been added to your account.
              </p>
            </div>
            
            {paymentData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Amount Paid:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${paymentData.amount?.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Credits Added:</span>
                  <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {paymentData.credits || paymentData.creditsAdded} credits
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Payment Method:</span>
                  <span className="font-medium capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                    {paymentData.paymentMethod?.replace('_', ' ') || 'Card'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Transaction ID:</span>
                  <span className="font-mono text-xs text-gray-500 truncate max-w-[150px]">
                    {paymentData.tran_id || paymentData.stripePaymentId || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Date:</span>
                  <span className="font-medium">
                    {new Date(paymentData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-4 pt-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-md transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="w-full border border-blue-500 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-all"
              >
                Start Chatting Now
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 bg-red-100 rounded-full animate-ping opacity-20"></div>
              </div>
              <XCircle className="h-24 w-24 text-red-500 mx-auto relative" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
              <p className="text-gray-600">
                {paymentData?.error || 'Something went wrong with your payment.'}
              </p>
              <p className="text-sm text-gray-500">
                If you were charged but didn't receive credits, please contact support.
              </p>
            </div>
            
            {paymentData?.tran_id && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reference:</span>{' '}
                  <span className="font-mono text-xs">{paymentData.tran_id}</span>
                </p>
              </div>
            )}
            
            <div className="space-y-4 pt-4">
              <button
                onClick={() => navigate('/payment')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/support')}
                className="w-full border border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-medium py-3 rounded-lg transition-all"
              >
                Contact Support
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for checking payment status
async function checkPaymentStatus(paymentId) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/payments/status/${paymentId}`,
      { 
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}