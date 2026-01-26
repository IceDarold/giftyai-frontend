import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { Wishlist } from './pages/Wishlist';
import { Profile } from './pages/Profile';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Login } from './pages/Login';
import { Partners } from './pages/Partners';
import { SnowProvider } from './components/SnowSystem';
import { AuthProvider } from './components/AuthContext';
import { DevModeProvider } from './components/DevModeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Collections } from './pages/Collections';

const AppRoutes = () => {
    const location = useLocation();
    
    // Logic for hiding Navigation Bar
    const showNav = location.pathname !== '/quiz' 
                 && location.pathname !== '/login'
                 && location.pathname !== '/partners'
                 && !location.pathname.startsWith('/blog/');
    
    // Logic for hiding Footer (Explicitly exclude Quiz and Partners to control footer placement manually)
    const showFooter = !location.pathname.startsWith('/quiz') 
                    && location.pathname !== '/login'
                    && location.pathname !== '/partners';

    return (
        <Layout showNav={showNav} showFooter={showFooter}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/partners" element={<Partners />} />
                
                {/* Results are now public for a better UX */}
                <Route path="/results" element={<Results />} />
                
                {/* Protected Routes that strictly need user data */}
                <Route path="/wishlist" element={
                    <ProtectedRoute><Wishlist /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                } />
            </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <DevModeProvider>
            <SnowProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </SnowProvider>
        </DevModeProvider>
    </AuthProvider>
  );
};

export default App;