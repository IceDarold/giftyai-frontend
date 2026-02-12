
import React, { useEffect } from 'react';
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
import { Investors } from './pages/Investors';
import { SnowProvider } from './components/SnowSystem';
import { AuthProvider } from './components/AuthContext';
import { DevModeProvider } from './components/DevModeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Collections } from './pages/Collections';
import { WishlistProvider } from './components/WishlistContext';
import { ExperimentalCatalog } from './pages/ExperimentalCatalog';
import { ExperimentSwipe } from './pages/ExperimentSwipe';
import { ExperimentDecision } from './pages/ExperimentDecision';
import { ExperimentQuiz } from './pages/ExperimentQuiz';
import { ExperimentDialogue } from './pages/ExperimentDialogue';
import { analytics } from './utils/analytics';

// Component to track page views
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Extract page name from path
    let pageName = 'home';
    const path = location.pathname;
    
    if (path === '/') pageName = 'home';
    else if (path.startsWith('/quiz')) pageName = 'quiz';
    else if (path.startsWith('/results')) pageName = 'results';
    else if (path.startsWith('/blog')) pageName = 'blog';
    else if (path.startsWith('/wishlist')) pageName = 'wishlist';
    else if (path.startsWith('/profile')) pageName = 'profile';
    else if (path.startsWith('/login')) pageName = 'login';
    else if (path.startsWith('/investors')) pageName = 'investors';
    else if (path.startsWith('/experiments')) pageName = 'experiments';
    else pageName = path.substring(1);

    analytics.pageView(pageName, window.location.href);
  }, [location]);

  return null;
};

const AppRoutes = () => {
    const location = useLocation();
    
    // Logic for hiding Navigation Bar
    const showNav = location.pathname !== '/quiz' 
                 && location.pathname !== '/login'
                 && location.pathname !== '/partners'
                 && location.pathname !== '/investors'
                 && !location.pathname.startsWith('/blog/')
                 && !location.pathname.startsWith('/experiments'); // Hide nav in experiments for immersion
    
    // Logic for hiding Footer (Explicitly exclude Quiz and Partners to control footer placement manually)
    const showFooter = !location.pathname.startsWith('/quiz') 
                    && location.pathname !== '/login'
                    && location.pathname !== '/partners'
                    && location.pathname !== '/investors'
                    && !location.pathname.startsWith('/experiments');

    return (
        <Layout showNav={showNav} showFooter={showFooter}>
            <PageTracker />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/investors" element={<Investors />} />
                
                {/* Results are now public for a better UX */}
                <Route path="/results" element={<Results />} />
                
                {/* Protected Routes that strictly need user data */}
                <Route path="/wishlist" element={
                    <ProtectedRoute><Wishlist /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* Experimental Routes */}
                <Route path="/experiments" element={<ExperimentalCatalog />} />
                <Route path="/experiments/swipe" element={<ExperimentSwipe />} />
                <Route path="/experiments/decision" element={<ExperimentDecision />} />
                <Route path="/experiments/new-quiz" element={<ExperimentQuiz />} />
                <Route path="/experiments/dialogue" element={<ExperimentDialogue />} />
            </Routes>
        </Layout>
    );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
        <DevModeProvider>
            <WishlistProvider>
                <SnowProvider>
                    <HashRouter>
                        <AppRoutes />
                    </HashRouter>
                </SnowProvider>
            </WishlistProvider>
        </DevModeProvider>
    </AuthProvider>
  );
};
