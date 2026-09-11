import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { SellFlowProvider } from './context/SellFlowContext';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SellScreen } from './screens/SellScreen';
import { DetectScreen } from './screens/DetectScreen';
import { WeightScreen } from './screens/WeightScreen';
import { PriceScreen } from './screens/PriceScreen';
import { RecyclersScreen } from './screens/RecyclersScreen';
import { RecyclerDetailScreen } from './screens/RecyclerDetailScreen';
import { LotScreen } from './screens/LotScreen';
import { HandoverScreen } from './screens/HandoverScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { EarningsScreen } from './screens/EarningsScreen';
import { SafetyScreen } from './screens/SafetyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RecyclerDashboardScreen } from './screens/RecyclerDashboardScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';

export default function App() {
  return (
    <LanguageProvider>
      <SellFlowProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-white">
            {/* Clean Minimalism Desktop Sidebar */}
            <DesktopSidebar />

            <div className="flex-1 w-full min-w-0 flex flex-col justify-between">
              <div className="flex-1 w-full">
                <Routes>
                {/* Default redirect to home */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Primary Routes */}
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/sell" element={<SellScreen />} />
                <Route path="/detect" element={<DetectScreen />} />
                <Route path="/weight" element={<WeightScreen />} />
                <Route path="/price" element={<PriceScreen />} />
                <Route path="/recyclers" element={<RecyclersScreen />} />
                <Route path="/recycler/:id" element={<RecyclerDetailScreen />} />
                <Route path="/lot/:id" element={<LotScreen />} />
                <Route path="/handover/:id" element={<HandoverScreen />} />
                <Route path="/success/:id" element={<SuccessScreen />} />
                <Route path="/transactions" element={<TransactionsScreen />} />
                <Route path="/earnings" element={<EarningsScreen />} />
                <Route path="/safety" element={<SafetyScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/recycler-dashboard" element={<RecyclerDashboardScreen />} />
                <Route path="/admin-dashboard" element={<AdminDashboardScreen />} />

                {/* Catch-all fallback to home */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>

            {/* Persistent Mobile-First Bottom Navigation */}
            <BottomNavigation />
          </div>
        </div>
      </Router>
      </SellFlowProvider>
    </LanguageProvider>
  );
}
