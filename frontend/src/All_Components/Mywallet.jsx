import React, { useState } from 'react';
import { 
  History, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle,
  Clock,
  XCircle,
  Gift,
  RefreshCw,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navigation from './Navigator';

const MyWallet = () => {
  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
    mediumPurple: "#3D2B56",
    successGreen: "#10B981",
    warningOrange: "#F59E0B",
    errorRed: "#EF4444",
  };

  // Dummy wallet data
  const [walletData, setWalletData] = useState({
    balance: 125.75,
    credits: 342,
    lifetimeSpent: 845.50,
    totalTransactions: 47,
    currency: "USD",
    lastUpdated: "2024-01-15T10:30:00Z"
  });

  // Dummy transactions data
  const [transactions, setTransactions] = useState([
    {
      id: "txn_001",
      date: "2024-01-15",
      time: "10:30 AM",
      description: "Chat Session with KRS",
      amount: -25.50,
      credits: -25,
      type: "session",
      status: "completed",
      psychicName: "KRS",
      sessionType: "chat",
      category: "entertainment"
    },
    {
      id: "txn_002",
      date: "2024-01-15",
      time: "09:15 AM",
      description: "Credit Package Purchase",
      amount: 49.99,
      credits: 100,
      type: "purchase",
      status: "completed",
      category: "deposit"
    },
    {
      id: "txn_003",
      date: "2024-01-14",
      time: "02:45 PM",
      description: "Audio Session with Arkana",
      amount: -28.75,
      credits: -29,
      type: "session",
      status: "completed",
      psychicName: "Arkana",
      sessionType: "audio",
      category: "entertainment"
    },
    {
      id: "txn_004",
      date: "2024-01-13",
      time: "11:20 AM",
      description: "Welcome Bonus",
      amount: 10.00,
      credits: 20,
      type: "bonus",
      status: "completed",
      category: "bonus"
    },
    {
      id: "txn_005",
      date: "2024-01-12",
      time: "03:15 PM",
      description: "Video Session with Numeron",
      amount: -35.20,
      credits: -35,
      type: "session",
      status: "completed",
      psychicName: "Numeron",
      sessionType: "video",
      category: "entertainment"
    },
    {
      id: "txn_006",
      date: "2024-01-11",
      time: "10:00 AM",
      description: "Premium Package",
      amount: 99.99,
      credits: 250,
      type: "purchase",
      status: "completed",
      category: "deposit"
    },
    {
      id: "txn_007",
      date: "2024-01-10",
      time: "04:30 PM",
      description: "Session Refund - Amoura",
      amount: 28.90,
      credits: 29,
      type: "refund",
      status: "refunded",
      psychicName: "Amoura",
      category: "refund"
    },
    {
      id: "txn_008",
      date: "2024-01-09",
      time: "01:45 PM",
      description: "Withdrawal Request",
      amount: -50.00,
      credits: 0,
      type: "withdrawal",
      status: "pending",
      category: "withdrawal"
    },
    {
      id: "txn_009",
      date: "2024-01-08",
      time: "11:10 AM",
      description: "Audio Session with Serena",
      amount: -19.85,
      credits: -20,
      type: "session",
      status: "completed",
      psychicName: "Serena",
      sessionType: "audio",
      category: "entertainment"
    },
    {
      id: "txn_010",
      date: "2024-01-07",
      time: "09:30 AM",
      description: "Referral Bonus",
      amount: 15.00,
      credits: 30,
      type: "bonus",
      status: "completed",
      category: "bonus"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter transactions based on search and category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.psychicName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'deposit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'bonus':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refund':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'withdrawal':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="px-2 sm:px-4" style={{ backgroundColor: colors.softIvory }}>
      <div className="max-w-7xl mx-auto pb-10">
        <Navigation />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.deepPurple }}>
              Transaction History
            </h1>
            <p className="text-lg" style={{ color: colors.deepPurple + "CC" }}>
              View all your deposits, withdrawals, and session payments
            </p>
          </div>
          
          {/* Export Button */}
          <Button className="mt-4 md:mt-0" style={{ 
            backgroundColor: colors.antiqueGold,
            color: colors.deepPurple
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: colors.deepPurple + "CC" }}>
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    +${totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                  <ArrowDownRight className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: colors.deepPurple + "CC" }}>
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    -${totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: colors.deepPurple + "CC" }}>
                    Net Balance
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.deepPurple }}>
                    ${walletData.balance.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.lightGold }}>
                  <History className="h-6 w-6" style={{ color: colors.antiqueGold }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
       

        {/* Transactions List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle style={{ color: colors.deepPurple }}>
              Recent Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{ borderColor: colors.lightGold }}>
                  
                  {/* Transaction Info */}
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-1 ${
                        transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'bonus' ? (
                          <Gift className={`h-5 w-5 ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : transaction.amount > 0 ? (
                          <ArrowDownRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold" style={{ color: colors.deepPurple }}>
                            {transaction.description}
                          </h3>
                          <Badge className={`text-xs ${getCategoryColor(transaction.category)}`}>
                            {transaction.category}
                          </Badge>
                          {transaction.psychicName && (
                            <Badge variant="outline" className="text-xs"
                              style={{ 
                                borderColor: colors.antiqueGold,
                                color: colors.deepPurple
                              }}>
                              {transaction.psychicName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm" style={{ color: colors.deepPurple + "CC" }}>
                          <span>{transaction.date} • {transaction.time}</span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status}</span>
                          </div>
                          {transaction.sessionType && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.sessionType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>
                        {transaction.credits > 0 ? '+' : ''}{Math.abs(transaction.credits)} credits
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      style={{ color: colors.deepPurple + "80" }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: colors.lightGold }}>
                    <History className="h-8 w-8" style={{ color: colors.antiqueGold }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.deepPurple }}>
                    No Transactions Found
                  </h3>
                  <p style={{ color: colors.deepPurple + "CC" }}>
                    {searchTerm 
                      ? 'No transactions match your search.'
                      : 'No transactions in this category.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyWallet;