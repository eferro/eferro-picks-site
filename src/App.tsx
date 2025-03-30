import logoHorizontal from './assets/logo-horizontal.png'
import { TalksList } from './components/TalksList'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
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
        </div>
      </header>
      <main className="flex-1">
        <TalksList />
      </main>
      <Footer />
    </div>
  )
}

export default App
