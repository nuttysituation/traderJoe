import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Investors from './pages/Investors';
import Stocks from './pages/Stocks';
import Trades from './pages/Trades';
import Analysis from './pages/Analysis';
import InvestorDetail from './pages/InvestorDetail';
import StockDetail from './pages/StockDetail';
import TestAPI from './pages/TestAPI';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/investors" element={<Investors />} />
              <Route path="/investors/:id" element={<InvestorDetail />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/stocks/:symbol" element={<StockDetail />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/test" element={<TestAPI />} />
            </Routes>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 