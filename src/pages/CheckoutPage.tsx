import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, CheckCircle2, Shield, Lock, Flame, ChevronDown, ChevronUp, Clock, AlertCircle } from "lucide-react";

// Config
const CONFIG = {
  API_URL: 'http://localhost:8787',
  CONTENT_URL: 'https://demo-gallery.example.test'
};

const CheckoutPage = () => {
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email') || '';
    const accessToken = params.get('access');
    const amount = params.get('amount');
    const collectionId = params.get('collectionId');
    const collectionTitle = params.get('collectionTitle');
    const itemCount = params.get('itemCount');
    
    setCustomerEmail(email);
    
    // Validate checkout data early
    if (amount && collectionId) {
      const parsedAmount = parseFloat(amount);
      const parsedItemCount = parseInt(itemCount) || 0;
      
      // Input validation
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10000) {
        setSessionExpired(true);
        setIsLoading(false);
        return;
      }
      
      if (!isValidCollectionId(collectionId)) {
        setSessionExpired(true);
        setIsLoading(false);
        return;
      }
      
      setCheckoutData({
        amount: parsedAmount,
        collectionId,
        collectionTitle: sanitizeString(collectionTitle) || 'Exclusive Collection',
        itemCount: parsedItemCount
      });
    }
    
    // Handle access token redirect (from payment callback)
    if (accessToken) {
      handleAccessTokenRedirect(accessToken, collectionId);
      return;
    }
    
    // Normal checkout flow - fetch providers
    if (amount && collectionId) {
      fetchProviders(amount);
    } else {
      // No valid checkout data
      setSessionExpired(true);
      setIsLoading(false);
    }
  }, []);

  // Fire purchase analytics event when payment succeeds
  useEffect(() => {
    if (paymentSuccess && checkoutData) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: Date.now().toString(),
          value: checkoutData.amount,
          currency: 'USD',
          items: [{
            item_id: checkoutData.collectionId,
            item_name: checkoutData.collectionTitle,
            price: checkoutData.amount,
            quantity: 1
          }]
        });
      }
    }
  }, [paymentSuccess, checkoutData]);

  // Input validation helpers
  const isValidCollectionId = (id) => {
    if (id === 'all') return true;
    const numId = parseInt(id);
    return !isNaN(numId) && numId >= 1 && numId <= 22;
  };

  const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/[<>]/g, '').substring(0, 100);
  };

  // Email validation
  const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    if (email.length > 254 || email.length < 3) return false;
    
    // Prevent consecutive dots
    if (email.includes('..')) return false;
    
    // Prevent leading/trailing dots in local part
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    
    // Email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) return false;
    
    // Prevent emails with multiple @ symbols
    if (email.split('@').length !== 2) return false;
    
    // Ensure domain has at least one dot
    if (!domain.includes('.')) return false;
    
    // Prevent domains that are too short
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length === 0)) return false;
    
    return true;
  };

  const handleAccessTokenRedirect = async (accessToken, collectionId) => {
    // Validate token format (should be 64 hex characters)
    if (!accessToken || accessToken.length !== 64 || !/^[a-f0-9]+$/.test(accessToken)) {
      setPaymentError('Invalid access token format');
      setRedirecting(false);
      return;
    }

    // Show success animation
    setPaymentSuccess(true);
    setRedirecting(true);
    
    // Get redirect URL from backend
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/api/payment/get-redirect-url?collectionId=${collectionId}&access=${accessToken}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.redirectUrl) {
        console.log('Redirecting to:', data.redirectUrl);
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 2500);
      } else {
        throw new Error(data.error || 'Failed to get redirect URL');
      }
    } catch (error) {
      console.error('Redirect error:', error);
      setPaymentError('Unable to redirect to content. Please contact support.');
      setRedirecting(false);
      
      // Show error state instead of fallback redirect
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 2000);
    }
  };

  const fetchProviders = async (amount) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/api/payment/providers?amount=${amount}&currency=USD`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableProviders(data.providers);
      } else {
        throw new Error(data.error || 'Failed to fetch available providers');
      }
    } catch (error) {
      console.error('Provider fetch error:', error);
      setPaymentError('Unable to load payment providers. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCardIcon = (cardType) => {
    const icons = {
      visa: (
        <div className="w-8 h-5 bg-[#1A1F71] rounded flex items-center justify-center">
          <span className="text-white text-[9px] font-bold tracking-wide">VISA</span>
        </div>
      ),
      mastercard: (
        <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
            <circle cx="15" cy="24" r="12" fill="#EB001B"/>
            <circle cx="33" cy="24" r="12" fill="#FF5F00"/>
            <path d="M24 13.5C21.2 16.8 19.5 20.2 19.5 24C19.5 27.8 21.2 31.2 24 34.5C26.8 31.2 28.5 27.8 28.5 24C28.5 20.2 26.8 16.8 24 13.5Z" fill="#FF5F00"/>
          </svg>
        </div>
      ),
      amex: (
        <div className="w-8 h-5 bg-[#006FCF] rounded flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">AMEX</span>
        </div>
      ),
      bank: (
        <div className="w-5 h-5 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-1.03-7-5.23-7-9V8.3l7-3.89 7 3.89V11c0 3.77-3.14 7.97-7 9z"/>
          </svg>
        </div>
      ),
      applepay: (
        <div className="w-8 h-5 bg-black rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </div>
      ),
      googlepay: (
        <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
          <span className="text-[8px] font-bold text-gray-700">GPay</span>
        </div>
      ),
      robinhood: (
        <div className="w-16 h-5 bg-[#00C805] rounded flex items-center justify-center px-2">
          <span className="text-white text-[9px] font-bold">Robinhood</span>
        </div>
      )
    };
    return icons[cardType] || null;
  };

  const handleProviderSelect = async (provider) => {
    // Email validation
    if (!customerEmail) {
      setPaymentError('Please enter your email address');
      return;
    }
    
    if (!isValidEmail(customerEmail)) {
      setPaymentError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }

    if (!checkoutData) {
      setPaymentError('Missing checkout data. Please try again.');
      return;
    }

    // Additional validation
    if (!isValidCollectionId(checkoutData.collectionId)) {
      setPaymentError('Invalid collection. Please try again.');
      return;
    }

    if (checkoutData.amount <= 0 || checkoutData.amount > 10000) {
      setPaymentError('Invalid amount. Please try again.');
      return;
    }

    setSelectedProvider(provider.id);
    setIsProcessing(true);
    setPaymentError("");

    try {
      const response = await fetch(
        `${CONFIG.API_URL}/api/payment/create-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: checkoutData.amount,
            collectionId: checkoutData.collectionId,
            currency: 'USD',
            provider: provider.id,
            email: customerEmail.toLowerCase().trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }
      
      if (data.success && data.paymentLink) {
        // Google Analytics tracking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'begin_checkout', {
            collection_id: checkoutData.collectionId,
            collection_title: checkoutData.collectionTitle,
            value: checkoutData.amount,
            currency: 'USD',
            payment_method: 'card',
            provider: provider.id
          });
        }

        // Redirect to payment page
        window.location.href = data.paymentLink;
      } else {
        throw new Error('Invalid payment session response');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Unable to process payment. Please try again.');
      setIsProcessing(false);
      setSelectedProvider(null);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Success screen (shown when redirected with access token)
  if (paymentSuccess) {
    return (
      <div className="min-h-screen feed-bg flex items-center justify-center p-4">
        <div className="p-3 max-w-xs w-full text-center">
          <style>{`
            @keyframes scale-in {
              0% { transform: scale(0); opacity: 0; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes bounce-once {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .animate-scale-in {
              animation: scale-in 0.5s ease-out;
            }
            .animate-bounce-once {
              animation: bounce-once 0.6s ease-out 0.3s;
            }
            .animate-fade-in {
              animation: fadeIn 0.5s ease-out forwards;
              opacity: 0;
            }
            @keyframes fadeIn {
              to { opacity: 1; }
            }
          `}</style>
          
          {redirecting && !paymentError ? (
            <>
              <div className="relative mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-md animate-scale-in">
                  <CheckCircle2 className="w-6 h-6 text-primary-foreground animate-bounce-once" />
                </div>
                <div className="absolute inset-0 w-10 h-10 mx-auto bg-primary/20 rounded-full animate-ping"></div>
              </div>
              
              <h2 className="text-sm font-bold text-foreground mb-1 animate-fade-in">
                Payment Successful!
              </h2>
              
              <p className="text-muted-foreground text-xs mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Your exclusive content is ready
              </p>
              
              <div className="flex flex-col gap-1 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-primary">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Payment confirmed</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground mb-1">
                  Redirect Failed
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  {paymentError || 'Unable to redirect to your content'}
                </p>
                <button
                  onClick={() => window.location.href = CONFIG.CONTENT_URL}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Session expired screen
  if (sessionExpired || (!checkoutData && !isLoading)) {
    return (
      <div className="min-h-screen feed-bg flex items-center justify-center p-4">
        <div className="post-card rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Session Expired</h2>
            <p className="text-muted-foreground text-sm">
              Your checkout session has expired. Please return to the collection and start a new purchase.
            </p>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Store</span>
            </button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Need help? Contact support at{" "}
              <a href="mailto:support@creator-premium.test" className="text-primary hover:text-primary/80 transition-colors">
                support@creator-premium.test
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while fetching checkout data
  if (isLoading && !checkoutData) {
    return (
      <div className="min-h-screen feed-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen feed-bg">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="post-card rounded-2xl shadow-lg p-6 lg:p-6">
              <div className="lg:hidden">
                <button
                  onClick={() => setShowOrderDetails(!showOrderDetails)}
                  className="w-full flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Flame className="w-5 h-5 text-primary-foreground fill-current" />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="text-base font-bold text-foreground">Order Summary</h2>
                    <p className="text-xs text-muted-foreground">Total: ${checkoutData.amount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary">
                    {showOrderDetails ? (
                      <ChevronUp className="w-4 h-4 text-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground" />
                    )}
                  </div>
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <Flame className="w-5 h-5 text-primary-foreground fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                  <p className="text-xs text-muted-foreground">Review your purchase</p>
                </div>
              </div>
              
              <div className={`space-y-4 ${showOrderDetails ? 'block mt-4' : 'hidden lg:block'}`}>
                <div className="pb-4 border-b border-border">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {checkoutData.collectionTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {checkoutData.itemCount > 0 
                      ? `${checkoutData.itemCount} premium items`
                      : 'Exclusive content'}
                  </p>
                </div>

                <div className="space-y-3 py-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${checkoutData.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Digital Delivery</span>
                    <span className="font-medium text-green-500">Free</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-foreground">$0.00</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total due today</div>
                    <div className="text-xs text-muted-foreground/70">USD</div>
                  </div>
                  <div className="text-3xl font-bold text-foreground bg-clip-text">
                    ${checkoutData.amount}
                  </div>
                </div>
              </div>

              <div className={`mt-6 pt-6 border-t border-border space-y-2 ${showOrderDetails ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>One-time purchase • No subscriptions</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Instant access after payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Lifetime ownership</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="post-card rounded-2xl p-6 shadow-lg">
              <h1 className="text-lg font-bold text-foreground mb-2">Payment Method</h1>
              <p className="text-xs text-muted-foreground mb-5">
                All transactions are secure and encrypted
              </p>

              {paymentError && (
                <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 flex-1">{paymentError}</p>
                </div>
              )}

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading payment options...</p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (paymentError && paymentError.includes('email')) {
                          setPaymentError('');
                        }
                      }}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                      maxLength={254}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send your purchase confirmation here
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {availableProviders.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderSelect(provider)}
                        disabled={isProcessing || !customerEmail}
                        className={`w-full p-3.5 rounded-xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md ${
                          selectedProvider === provider.id
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/50 bg-secondary/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-foreground mb-2 text-sm">
                              {provider.name}
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {provider.cards?.map((card) => (
                                <div key={card}>
                                  {renderCardIcon(card)}
                                </div>
                              ))}
                            </div>
                          </div>
                          {selectedProvider === provider.id && isProcessing && (
                            <Loader2 className="w-5 h-5 animate-spin text-primary ml-4 flex-shrink-0" />
                          )}
                          {selectedProvider === provider.id && !isProcessing && (
                            <CheckCircle2 className="w-5 h-5 text-primary ml-4 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-6 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-4 h-4 text-green-500" />
                      <span>SSL Encrypted</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            By completing your purchase, you authorize us to charge you according to our{" "}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;