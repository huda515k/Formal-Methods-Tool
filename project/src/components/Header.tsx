import { CodeSquare } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-6 px-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <CodeSquare className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Formal Methods Verification</h1>
            <p className="text-blue-100 text-sm">Analyze program correctness and equivalence</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
             className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-600 transition-colors">
            Documentation
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;