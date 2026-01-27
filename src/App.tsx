import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Settings from './pages/Settings';
import Management from './pages/Management';
import ExamEditor from './pages/ExamEditor';
import Home from './pages/Home';
import History from './pages/History';
import ExamMode from './pages/ExamMode';
import Result from './pages/Result';
import { NotificationProvider } from './context/NotificationContext';

const NotFound = () => <div className="text-2xl font-bold text-error p-20 text-center">404 - Page Not Found</div>;

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/exam/:name" element={<ExamMode />} />
            <Route path="/test/result" element={<Result />} />
            <Route path="/management" element={<Management />} />
            <Route path="/edit/:name" element={<ExamEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;
