import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import logoHorizontal from './assets/logo-horizontal.png'
import { TalksList } from './components/TalksList'
import { TalkDetail } from './components/TalkDetail'
import { Footer } from './components/Footer'

function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl 2xl:max-w-[96rem] mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <img 
            src={logoHorizontal} 
            alt="eferro's picks logo" 
            className="h-12 w-auto"
          />
        </div>
        <p className="text-center text-gray-600 mt-4">
          A curated collection of talks about software development, XP, lean, agile, 
          product management, cloud, operations, and technology.
        </p>
        <div className="mt-6 text-gray-700 text-sm max-w-3xl mx-auto space-y-2">
          <p>
            This collection reflects my experience-driven perspective on software delivery and product development. Each talk aligns with my core beliefs in Agile, XP, and Lean thinking—where quality code, tight feedback loops, and continuous learning drive sustainable speed.
          </p>
          <p className="text-center">
            📚 Learn more: <a href="https://www.eferro.net/p/my-premises-about-software-development.html" className="text-blue-600 hover:text-blue-800 hover:underline">My Software Development Premises</a> | 
            <a href="https://www.eferro.net" className="text-blue-600 hover:text-blue-800 hover:underline ml-1">Blog (eferro's random stuff)</a>
          </p>
        </div>
      </div>
    </header>
  )
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <div key={location.pathname} className="flex-1 bg-gray-100">
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <PageTransition>
          <Routes>
            <Route path="/" element={<TalksList />} />
            <Route path="/talk/:id" element={<TalkDetail />} />
          </Routes>
        </PageTransition>
        <Footer />
      </div>
    </Router>
  )
}

export default App
