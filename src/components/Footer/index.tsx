export function Footer() {
  return (
    <footer className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Edu Ferro (eferro). All rights reserved.{' '}
            <a 
              href="https://www.eferro.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Visit my website
            </a>
          </p>
          <a href="https://librecounter.org/refer/show" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://librecounter.org/counter.svg" 
              referrerPolicy="unsafe-url" 
              className="h-6 w-auto opacity-50 hover:opacity-75 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  );
} 