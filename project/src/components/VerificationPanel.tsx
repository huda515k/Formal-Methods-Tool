import { useState } from 'react';
import { Play } from 'lucide-react';
import { parseProgram, convertToSSA, generateCFG, optimizeSSA, generateVerificationSMT, generateEquivalenceSMT, checkVerification, checkEquivalence, formatSSA } from '../utils/verificationUtils';

interface VerificationPanelProps {
  mode: 'verification' | 'equivalence';
  setMode: (mode: 'verification' | 'equivalence') => void;
  program1: string;
  setProgram1: (program: string) => void;
  program2: string;
  setProgram2: (program: string) => void;
  unrollDepth: number;
  setUnrollDepth: (depth: number) => void;
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
  setVerificationState: (state: any) => void;
}

const VerificationPanel = ({
  mode,
  setMode,
  program1,
  setProgram1,
  program2,
  setProgram2,
  unrollDepth,
  setUnrollDepth,
  verificationState,
  setVerificationState
}: VerificationPanelProps) => {
  const analyzePrograms = async () => {
    setVerificationState({
      ...verificationState,
      loading: true
    });
    
    try {
      // Parse the programs
      const ast1 = parseProgram(program1);
      let ast2 = null;
      if (mode === 'equivalence') {
        ast2 = parseProgram(program2);
      }
      
      // Convert to SSA form
      const ssaResult1 = convertToSSA(ast1);
      const optimizedSSA1 = optimizeSSA(ssaResult1.ssa);
      
      let ssaResult2 = null;
      let optimizedSSA2 = null;
      if (ast2) {
        ssaResult2 = convertToSSA(ast2);
        optimizedSSA2 = optimizeSSA(ssaResult2.ssa);
      }
      
      // Generate control flow graph data
      const cfgData = generateCFG(ast1);
      
      // Generate SMT constraints
      const smt = mode === 'verification' 
        ? generateVerificationSMT(ssaResult1.ssa, unrollDepth)
        : generateEquivalenceSMT(ssaResult1.ssa, ssaResult2!.ssa, unrollDepth);
      
      // Run SMT solver
      let verificationResult, counterexamples, validExamples;
      
      if (mode === 'verification') {
        const result = await checkVerification(smt);
        verificationResult = result.verified;
        counterexamples = result.counterexamples || [];
        validExamples = result.validExamples || [];
      } else {
        const result = await checkEquivalence(smt);
        verificationResult = result.equivalent;
        counterexamples = result.counterexamples || [];
        validExamples = result.validExamples || [];
      }
      
      setVerificationState({
        ssaForm1: formatSSA(ssaResult1.ssa),
        ssaForm2: ssaResult2 ? formatSSA(ssaResult2.ssa) : '',
        optimizedSSA1: formatSSA(optimizedSSA1),
        optimizedSSA2: optimizedSSA2 ? formatSSA(optimizedSSA2) : '',
        smtCode: smt,
        verificationResult,
        counterexamples,
        validExamples,
        cfgData,
        loading: false
      });
    } catch (error: any) {
      setVerificationState({
        ...verificationState,
        verificationResult: false,
        counterexamples: [{ error: error.message }],
        loading: false
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Program Input</h2>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button 
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'verification' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              onClick={() => setMode('verification')}
            >
              Verification Mode
            </button>
            <button 
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'equivalence' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              onClick={() => setMode('equivalence')}
            >
              Equivalence Mode
            </button>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center space-x-2 mb-2 text-slate-700">
              <span>Loop Unrolling Depth:</span>
              <input 
                type="number" 
                value={unrollDepth} 
                onChange={(e) => setUnrollDepth(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-20 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
            <p className="text-xs text-slate-500">Higher values increase precision but may slow down verification</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Program {mode === 'equivalence' ? '1' : ''}:
            </label>
            <textarea 
              value={program1}
              onChange={(e) => setProgram1(e.target.value)}
              className="w-full h-56 p-3 font-mono text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your program here..."
              spellCheck="false"
            />
          </div>
          
          {mode === 'equivalence' && (
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Program 2:
              </label>
              <textarea 
                value={program2}
                onChange={(e) => setProgram2(e.target.value)}
                className="w-full h-56 p-3 font-mono text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your second program here..."
                spellCheck="false"
              />
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <button 
            onClick={analyzePrograms}
            disabled={verificationState.loading}
            className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {verificationState.loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Analyze Program{mode === 'equivalence' ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;