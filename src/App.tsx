import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SellFlowProvider } from './context/SellFlowContext';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingState } from './components/LoadingState';

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

// Root index redirect based on authentication and user role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Connecting to KabadiConnect..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (role === 'recycler') {
    return <Navigate to="/recycler-dashboard" replace />;
  }
  return <Navigate to="/home" replace />;
};

// Public login route: auto-redirects already-authenticated users to their dashboard
const PublicLoginRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F3D2E]">
        <LoadingState message="Loading KabadiConnect..." />
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'recycler') return <Navigate to="/recycler-dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  return <LoginScreen />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SellFlowProvider>
            <Router>
              <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-white">
                {/* Desktop Sidebar (hides on /login or unauthenticated) */}
                <DesktopSidebar />

                <div className="flex-1 w-full min-w-0 flex flex-col justify-between">
                  <div className="flex-1 w-full">
                    <Routes>
                      {/* Smart Root Redirect */}
                      <Route path="/" element={<RootRedirect />} />

                      {/* Public Login Route */}
                      <Route path="/login" element={<PublicLoginRoute />} />

                      {/* Collector-Focused Routes (Collector & Admin) */}
                      <Route element={<ProtectedRoute allowedRoles={['collector', 'admin']} />}>
                        <Route path="/home" element={<HomeScreen />} />
                        <Route path="/sell" element={<SellScreen />} />
                        <Route path="/detect" element={<DetectScreen />} />
                        <Route path="/weight" element={<WeightScreen />} />
                        <Route path="/price" element={<PriceScreen />} />
                        <Route path="/recyclers" element={<RecyclersScreen />} />
                        <Route path="/recycler/:id" element={<RecyclerDetailScreen />} />
                        <Route path="/handover/:id" element={<HandoverScreen />} />
                        <Route path="/success/:id" element={<SuccessScreen />} />
                        <Route path="/earnings" element={<EarningsScreen />} />
                      </Route>

                      {/* Common Authenticated Routes (Collector, Recycler, Admin) */}
                      <Route element={<ProtectedRoute allowedRoles={['collector', 'recycler', 'admin']} />}>
                        <Route path="/lot/:id" element={<LotScreen />} />
                        <Route path="/transactions" element={<TransactionsScreen />} />
                        <Route path="/safety" element={<SafetyScreen />} />
                        <Route path="/profile" element={<ProfileScreen />} />
                      </Route>

                      {/* Recycler Dashboard (Recycler & Admin only) */}
                      <Route element={<ProtectedRoute allowedRoles={['recycler', 'admin']} />}>
                        <Route path="/recycler-dashboard" element={<RecyclerDashboardScreen />} />
                      </Route>

                      {/* Admin Central Oversight (Admin only) */}
                      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin-dashboard" element={<AdminDashboardScreen />} />
                      </Route>

                      {/* Catch-all fallback */}
                      <Route path="*" element={<RootRedirect />} />
                    </Routes>
                  </div>

                  {/* Persistent Mobile-First Bottom Navigation (hides on /login or unauthenticated) */}
                  <BottomNavigation />
                </div>
              </div>
            </Router>
          </SellFlowProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

