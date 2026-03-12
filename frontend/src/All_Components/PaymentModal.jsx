import { usePaymentModal } from "@/context/PaymentModalContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Check, Loader2, CreditCard, DollarSign, Award, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function PaymentModal() {
  const {
    isOpen,
    closeModal,
    selectedPlan,
    setSelectedPlan,
    amount,
    setAmount,
    customAmount,
    setCustomAmount,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    handlePayment,
    isProcessing,
    creditPlans,
    loadCreditPlans,
    calculateCustomAmount
  } = usePaymentModal();

  const [calculatedCredits, setCalculatedCredits] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Define USD credit plans (replacing EUR plans)
  const usdCreditPlans = [
    { 
      id: 'basic', 
      name: 'Starter Plan', 
      amount: 10, // $10 USD
      credits: 10,
      totalCredits: 10,
      bonusCredits: 0,
      pricePerCredit: 1.00,
      description: '10 Credits ($10) - Perfect for trying out',
      popular: false
    },
    { 
      id: 'popular', 
      name: 'Popular Plan', 
      amount: 20, // $20 USD
      credits: 20,
      totalCredits: 22, // +2 bonus
      bonusCredits: 2,
      pricePerCredit: 0.91,
      description: '20 Credits + 2 Bonus = 22 Credits ($20)',
      popular: true
    },
    { 
      id: 'standard', 
      name: 'Standard Plan', 
      amount: 50, // $50 USD
      credits: 50,
      totalCredits: 60, // +10 bonus
      bonusCredits: 10,
      pricePerCredit: 0.83,
      description: '50 Credits + 10 Bonus = 60 Credits ($50)',
      popular: false
    },
    { 
      id: 'premium', 
      name: 'Premium Plan', 
      amount: 100, // $100 USD
      credits: 100,
      totalCredits: 125, // +25 bonus
      bonusCredits: 25,
      pricePerCredit: 0.80,
      description: '100 Credits + 25 Bonus = 125 Credits ($100)',
      popular: false
    }
  ];

  // Load credit plans on modal open
  useEffect(() => {
    if (isOpen) {
      // Set default plan
      setSelectedPlan(usdCreditPlans[0]);
      setAmount(usdCreditPlans[0].amount);
      setCustomAmount('');
      setCalculatedCredits(null);
    }
  }, [isOpen]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setAmount(plan.amount);
    setCustomAmount('');
    setCalculatedCredits(null);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedPlan({ id: 'custom', name: 'Custom Amount' });
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const renderPlanBenefits = (plan) => {
    if (plan.bonusCredits > 0) {
      return (
        <div className="mt-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-yellow-500" />
          <span className="text-xs text-yellow-600 font-medium">
            +{plan.bonusCredits} bonus credits ({Math.round((plan.bonusCredits/plan.credits)*100)}% bonus)
          </span>
        </div>
      );
    }
    return null;
  };

  const calculateSavings = (plan) => {
    if (plan.bonusCredits > 0) {
      const savings = (plan.bonusCredits * plan.pricePerCredit).toFixed(2);
      return (
        <div className="mt-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-600 font-medium">
            Save ${savings} with bonus
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-[95vw] sm:max-w-[450px] max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            Buy Chat Credits
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            💰 1 credit = $1 USD • ⏱️ 1 credit = 1 minute chat
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Credit Packages Section */}
          <div className="space-y-3">
            <h3 className="text-base font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Choose a credit package
            </h3>
            <div className="grid gap-3">
              {usdCreditPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all relative ${
                    selectedPlan?.id === plan.id 
                      ? "border-blue-500 bg-gradient-to-r from-blue-50 to-white shadow-md ring-2 ring-blue-200" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        🏆 MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-base text-gray-900">{plan.name}</h4>
                        {plan.bonusCredits > 0 && (
                          <span className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-200">
                            +{plan.bonusCredits}BONUS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {plan.totalCredits} credits ({plan.totalCredits} minutes)
                      </p>
                      {renderPlanBenefits(plan)}
                      {calculateSavings(plan)}
                    </div>
                    <div className="text-right min-w-[100px]">
                      <div className="mb-1">
                        <p className="font-extrabold text-lg text-gray-900">${plan.amount}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          USD
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-1.5">
                        <p className="text-xs font-semibold text-blue-700">
                          ${plan.pricePerCredit.toFixed(2)}/credit
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedPlan?.id === plan.id && (
                    <div className="mt-3 pt-3 border-t border-blue-100">
                      <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Selected</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Custom Amount Option */}
              <motion.div
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan?.id === 'custom'
                    ? "border-green-500 bg-gradient-to-r from-green-50 to-white shadow-md ring-2 ring-green-200" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => setSelectedPlan({ id: 'custom', name: 'Custom Amount' })}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900">Custom Amount</h4>
                      <p className="text-sm text-gray-600">Choose your own amount (min $5)</p>
                    </div>
                  </div>
                  {selectedPlan?.id === 'custom' && (
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
                
                {selectedPlan?.id === 'custom' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter amount in USD (Minimum $5)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-bold">$</span>
                        </div>
                        <input
                          type="text"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="Enter amount (e.g., 15, 25, 50)"
                          className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">USD</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview for custom amount */}
                    {customAmount && parseFloat(customAmount) >= 5 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <p className="text-gray-600 font-medium">Amount:</p>
                            <p className="font-bold text-lg text-gray-900">
                              ${parseFloat(customAmount).toFixed(2)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-600 font-medium">Base Credits:</p>
                            <p className="font-bold text-lg text-gray-900">
                              {Math.floor(parseFloat(customAmount))} credits
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-600 font-medium">Bonus Credits:</p>
                            <p className="font-bold text-lg text-green-600">
                              +{calculateBonusCredits(parseFloat(customAmount))} credits
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-600 font-medium">Total Credits:</p>
                            <p className="font-bold text-lg text-blue-600">
                              {Math.floor(parseFloat(customAmount)) + calculateBonusCredits(parseFloat(customAmount))} credits
                            </p>
                          </div>
                        </div>
                        
                        {/* Bonus explanation */}
                        {calculateBonusCredits(parseFloat(customAmount)) > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Bonus earned:</span>
                              <span className="text-xs font-semibold text-green-600">
                                {Math.round((calculateBonusCredits(parseFloat(customAmount))/Math.floor(parseFloat(customAmount)))*100)}% extra credits
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              💰 More you spend, more bonus you get!
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {customAmount && parseFloat(customAmount) < 5 && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm font-medium">
                          ⚠️ Minimum amount is $5 USD
                        </p>
                      </div>
                    )}
                    
                    {!customAmount && (
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-600 text-sm">
                          💡 Example: $15 = 15 credits + 2 bonus credits
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3">
            <h3 className="text-base font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Select Payment Method
            </h3>
            <div className="space-y-2">
              <motion.button
                className={`w-full flex justify-between items-center py-3 px-4 border rounded-lg text-base transition-all ${
                  selectedPaymentMethod === "card" 
                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-white shadow-sm ring-2 ring-blue-200" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
                onClick={() => handlePaymentMethodSelect("card")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-gray-900 block">Credit/Debit Card</span>
                    <span className="text-xs text-gray-500">Pay securely with Visa, Mastercard, Amex</span>
                  </div>
                </div>
                {selectedPaymentMethod === "card" && (
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </motion.button>

              {/* Payment Icons */}
              <div className="flex items-center justify-center gap-4 pt-3 px-4">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://js.stripe.com/v3/fingerprinted/img/visa-3659c4f5c0968b2b4c5c8a0e5e8b8c7b.svg" 
                    alt="Visa" 
                    className="h-6"
                  />
                  <img 
                    src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" 
                    alt="Mastercard" 
                    className="h-6"
                  />
                  <img 
                    src="https://js.stripe.com/v3/fingerprinted/img/amex-a8a6aef5a7bd4bdc99b14fcb4f2c5d5d.svg" 
                    alt="American Express" 
                    className="h-6"
                  />
                  <img 
                    src="https://js.stripe.com/v3/fingerprinted/img/discover-7c6c8c0a5d5c6b2b4c5c8a0e5e8b8c7b.svg" 
                    alt="Discover" 
                    className="h-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary and Payment Button */}
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Selected:</span>
                <span className="font-bold text-gray-900">
                  {selectedPlan?.name || 'No plan selected'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Amount:</span>
                <span className="text-xl font-extrabold text-gray-900">
                  ${(selectedPlan?.id === 'custom' && customAmount ? parseFloat(customAmount) : amount).toFixed(2)} USD
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">You Receive:</span>
                <span className="text-xl font-extrabold text-blue-600 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {selectedPlan?.id === 'custom' && customAmount 
                    ? `${Math.floor(parseFloat(customAmount)) + calculateBonusCredits(parseFloat(customAmount))} credits`
                    : selectedPlan?.totalCredits 
                      ? `${selectedPlan.totalCredits} credits` 
                      : '0 credits'
                  }
                </span>
              </div>
              
              {selectedPlan?.bonusCredits > 0 && (
                <div className="flex justify-between items-center bg-yellow-50 rounded-lg p-2">
                  <span className="text-gray-700 font-medium">Bonus Included:</span>
                  <span className="font-bold text-yellow-600">
                    +{selectedPlan.bonusCredits} credits
                  </span>
                </div>
              )}
            </div>

            <motion.button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={
                isProcessing || 
                !selectedPlan || 
                (selectedPlan?.id === 'custom' && (!customAmount || parseFloat(customAmount) < 5))
              }
              onClick={handlePayment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {selectedPlan?.id === 'custom'
                      ? `Pay $${parseFloat(customAmount || 0).toFixed(2)} USD`
                      : `Pay $${amount.toFixed(2)} USD`
                    }
                  </span>
                </div>
              )}
            </motion.button>
            
            <div className="text-center space-y-1.5">
              <p className="text-xs text-gray-500">
                🔒 Secure payment powered by Stripe
              </p>
              <p className="text-xs text-gray-500">
                💳 Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to calculate bonus credits
function calculateBonusCredits(amount) {
  if (amount >= 100) return 25; // 25% bonus
  if (amount >= 50) return 10;  // 20% bonus
  if (amount >= 25) return 2;   // 8% bonus
  return 0;
}