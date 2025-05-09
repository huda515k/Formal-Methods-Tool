import { useState } from 'react';
import './index.css';
import Header from './components/Header';
import VerificationPanel from './components/VerificationPanel';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const [mode, setMode] = useState<'verification' | 'equivalence'>('verification');
  const [unrollDepth, setUnrollDepth] = useState(3);
  const [program1, setProgram1] = useState(
`x := 3;
if (x < 5) {
  y := x + 1;
} else {
  y := x - 1;
}
assert(y > 0);`);
  const [program2, setProgram2] = useState(
`x := 3;
y := x + 1;
assert(y > 0);`);
  
  const [verificationState, setVerificationState] = useState({
    ssaForm1: '',
    ssaForm2: '',
    optimizedSSA1: '',
    optimizedSSA2: '',
    smtCode: '',
    verificationResult: null as boolean | null,
    counterexamples: [] as Record<string, any>[],
    validExamples: [] as Record<string, any>[],
    cfgData: null as any,
    loading: false
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerificationPanel 
          mode={mode}
          setMode={setMode}
          program1={program1}
          setProgram1={setProgram1}
          program2={program2}
          setProgram2={setProgram2}
          unrollDepth={unrollDepth}
          setUnrollDepth={setUnrollDepth}
          verificationState={verificationState}
          setVerificationState={setVerificationState}
        />
        
        <ResultsPanel 
          mode={mode}
          verificationState={verificationState}
        />
      </main>
      
      <footer className="bg-slate-800 text-slate-200 py-3 text-center text-sm">
        <p>Formal Methods Program Verification Tool &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;