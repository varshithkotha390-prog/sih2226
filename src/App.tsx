import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SellFlowProvider } from './context/SellFlowContext';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleGuard } from './components/routing/RoleGuard';
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
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

/**
 * Root redirect component directing unauthenticated users to /login
 * and authenticated users to their corresponding role dashboard.
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'recycler') return <Navigate to="/recycler-dashboard" replace />;
  if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  return <Navigate to="/home" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SellFlowProvider>
            <Router>
              <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-white">
                {/* Clean Minimalism Desktop Sidebar */}
                <DesktopSidebar />

                <div className="flex-1 w-full min-w-0 flex flex-col justify-between">
                  <div className="flex-1 w-full">
                    <Routes>
                      {/* Default Root Redirect */}
                      <Route path="/" element={<RootRedirect />} />

                      {/* Public Authentication Routes */}
                      <Route
                        path="/login"
                        element={
                          <PublicOnlyRoute>
                            <LoginScreen />
                          </PublicOnlyRoute>
                        }
                      />
                      <Route
                        path="/signup"
                        element={
                          <PublicOnlyRoute>
                            <SignupScreen />
                          </PublicOnlyRoute>
                        }
                      />

                      {/* Protected Primary Routes */}
                      <Route
                        path="/home"
                        element={
                          <ProtectedRoute>
                            <HomeScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/sell"
                        element={
                          <ProtectedRoute>
                            <SellScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/detect"
                        element={
                          <ProtectedRoute>
                            <DetectScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/weight"
                        element={
                          <ProtectedRoute>
                            <WeightScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/price"
                        element={
                          <ProtectedRoute>
                            <PriceScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/recyclers"
                        element={
                          <ProtectedRoute>
                            <RecyclersScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/recycler/:id"
                        element={
                          <ProtectedRoute>
                            <RecyclerDetailScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/lot/:id"
                        element={
                          <ProtectedRoute>
                            <LotScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/handover/:id"
                        element={
                          <ProtectedRoute>
                            <HandoverScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/success/:id"
                        element={
                          <ProtectedRoute>
                            <SuccessScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/transactions"
                        element={
                          <ProtectedRoute>
                            <TransactionsScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/earnings"
                        element={
                          <ProtectedRoute>
                            <EarningsScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/safety"
                        element={
                          <ProtectedRoute>
                            <SafetyScreen />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfileScreen />
                          </ProtectedRoute>
                        }
                      />

                      {/* Role-Guarded Dashboards */}
                      <Route
                        path="/recycler-dashboard"
                        element={
                          <RoleGuard allowedRoles={['recycler', 'admin']}>
                            <RecyclerDashboardScreen />
                          </RoleGuard>
                        }
                      />
                      <Route
                        path="/admin-dashboard"
                        element={
                          <RoleGuard allowedRoles={['admin']}>
                            <AdminDashboardScreen />
                          </RoleGuard>
                        }
                      />

                      {/* Catch-all fallback */}
                      <Route path="*" element={<RootRedirect />} />
                    </Routes>
                  </div>

                  {/* Persistent Mobile-First Bottom Navigation */}
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
