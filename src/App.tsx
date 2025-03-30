import logoHorizontal from './assets/logo-horizontal.png'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <img 
                src={logoHorizontal} 
                alt="eferro's picks logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <p className="text-gray-600">
                  A curated collection of talks about software development, XP, lean, agile, 
                  product management, cloud, operations, and technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
