import { useState } from 'react';
import { CheckCircle, XCircle, Code, GitGraph, Terminal } from 'lucide-react';
import SimpleGraph from './SimpleGraph';

interface ResultsPanelProps {
  mode: 'verification' | 'equivalence';
  verificationState: {
    ssaForm1: string;
    ssaForm2: string;
    optimizedSSA1: string;
    optimizedSSA2: string;
    smtCode: string;
    verificationResult: boolean | null;
    counterexamples: Record<string, any>[];
    validExamples: Record<string, any>[];
    cfgData: any;
    loading: boolean;
  };
}

const ResultsPanel = ({ mode, verificationState }: ResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState('ssa');
  
  const {
    ssaForm1, 
    ssaForm2, 
    optimizedSSA1, 
    optimizedSSA2,
    smtCode,
    verificationResult,
    counterexamples,
    validExamples,
    cfgData,
    loading
  } = verificationState;

  const hasResults = ssaForm1 !== '';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Analysis Results</h2>
      </div>
      
      {!hasResults && !loading && (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
          <div className="text-center">
            <Terminal className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-lg">Run the analysis to see results</p>
          </div>
        </div>
      )}
      
      {hasResults && (
        <div className="flex-1 flex flex-col">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'ssa' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('ssa')}
              >
                <Code className="w-4 h-4 mr-2" />
                SSA Form
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'optimized' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('optimized')}
              >
                <Code className="w-4 h-4 mr-2" />
                Optimized SSA
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'cfg' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('cfg')}
              >
                <GitGraph className="w-4 h-4 mr-2" />
                Control Flow
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'smt' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('smt')}
              >
                <Terminal className="w-4 h-4 mr-2" />
                SMT Code
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {activeTab === 'ssa' && (
              <div className="p-4">
                <h3 className="font-medium text-sm text-slate-500 mb-2">Program 1:</h3>
                <pre className="bg-slate-100 p-3 rounded-lg overflow-auto text-sm font-mono text-slate-700 mb-4 max-h-60">
                  {ssaForm1 || 'No SSA form generated yet.'}
                </pre>
                
                {mode === 'equivalence' && ssaForm2 && (
                  <>
                    <h3 className="font-medium text-sm text-slate-500 mb-2">Program 2:</h3>
                    <pre className="bg-slate-100 p-3 rounded-lg overflow-auto text-sm font-mono text-slate-700 max-h-60">
                      {ssaForm2}
                    </pre>
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'optimized' && (
              <div className="p-4">
                <h3 className="font-medium text-sm text-slate-500 mb-2">Program 1 (Optimized):</h3>
                <pre className="bg-slate-100 p-3 rounded-lg overflow-auto text-sm font-mono text-slate-700 mb-4 max-h-60">
                  {optimizedSSA1 || 'No optimized SSA form generated yet.'}
                </pre>
                
                {mode === 'equivalence' && optimizedSSA2 && (
                  <>
                    <h3 className="font-medium text-sm text-slate-500 mb-2">Program 2 (Optimized):</h3>
                    <pre className="bg-slate-100 p-3 rounded-lg overflow-auto text-sm font-mono text-slate-700 max-h-60">
                      {optimizedSSA2}
                    </pre>
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'cfg' && (
              <div className="p-4">
                <h3 className="font-medium text-sm text-slate-500 mb-2">Control Flow Graph:</h3>
                <div className="bg-slate-100 p-3 rounded-lg overflow-auto max-h-60">
                  {cfgData ? (
                    <SimpleGraph data={cfgData} />
                  ) : (
                    <p className="text-slate-500">No control flow graph generated yet.</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'smt' && (
              <div className="p-4">
                <h3 className="font-medium text-sm text-slate-500 mb-2">SMT Constraints:</h3>
                <pre className="bg-slate-100 p-3 rounded-lg overflow-auto text-sm font-mono text-slate-700 max-h-60">
                  {smtCode || 'No SMT code generated yet.'}
                </pre>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-200 p-4">
            <h3 className="font-medium text-slate-700 mb-3">Verification Results</h3>
            
            {verificationResult === null ? (
              <p className="text-slate-500 text-sm">No verification results yet.</p>
            ) : (
              <div className="space-y-4">
                <div className={`p-3 rounded-lg flex items-start ${
                  verificationResult 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {verificationResult ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  
                  <div>
                    <p className={`font-medium ${verificationResult ? 'text-green-800' : 'text-red-800'}`}>
                      {mode === 'verification' ? (
                        verificationResult ? 'All assertions verified ✓' : 'Verification failed ✗'
                      ) : (
                        verificationResult ? 'Programs are equivalent ✓' : 'Programs are not equivalent ✗'
                      )}
                    </p>
                    <p className="text-sm mt-1 text-slate-600">
                      {verificationResult 
                        ? 'The program meets all specified conditions.'
                        : 'The program contains conditions that may not be satisfied.'}
                    </p>
                  </div>
                </div>
                
                {validExamples.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-slate-600 mb-2">Valid Examples:</h4>
                    <div className="bg-slate-100 p-3 rounded-lg overflow-auto max-h-40 text-sm">
                      {validExamples.map((example, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          <p className="font-medium text-slate-700">Example {idx + 1}:</p>
                          <ul className="ml-4 text-slate-600">
                            {Object.entries(example).map(([key, value]) => (
                              <li key={key} className="font-mono">{key} = {value}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {counterexamples.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-slate-600 mb-2">Counterexamples:</h4>
                    <div className="bg-slate-100 p-3 rounded-lg overflow-auto max-h-40 text-sm">
                      {counterexamples.map((example, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          <p className="font-medium text-slate-700">Counterexample {idx + 1}:</p>
                          <ul className="ml-4 text-slate-600">
                            {Object.entries(example).map(([key, value]) => (
                              <li key={key} className="font-mono">{key} = {String(value)}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;