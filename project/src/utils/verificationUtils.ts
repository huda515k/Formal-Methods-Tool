// Types
export interface ProgramNode {
  type: string;
  body?: ProgramNode[];
  ifBody?: ProgramNode[];
  elseBody?: ProgramNode[];
  condition?: ExpressionNode;
  left?: string;
  right?: ExpressionNode;
  init?: ProgramNode;
  update?: ProgramNode;
}

export interface ExpressionNode {
  type: string;
  operator?: string;
  left?: ExpressionNode;
  right?: ExpressionNode;
  name?: string;
  value?: number;
  array?: string;
  index?: ExpressionNode;
  operand?: ExpressionNode;
  operands?: string[];
  result?: string;
  condition?: ExpressionNode;
  loopVar?: boolean;
}

export interface SSANode {
  type: string;
  left?: string;
  right?: ExpressionNode;
  condition?: ExpressionNode;
  result?: string;
  operands?: string[];
  loopVar?: boolean;
}

// Parser implementation
export function parseProgram(programText: string): ProgramNode {
  // This is a simplified parser for demonstration
  // In a real implementation, you would use a proper parser library
  const lines = programText.split('\n');
  const ast: ProgramNode = { type: 'Program', body: [] };
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line || line.startsWith('//')) {
      i++;
      continue;
    }
    
    // Assignment statement
    if (line.includes(':=')) {
      const [left, right] = line.split(':=');
      ast.body?.push({
        type: 'Assignment',
        left: left.trim(),
        right: parseExpression(right.replace(/;$/, '').trim())
      });
    }
    // If statement
    else if (line.startsWith('if')) {
      const condMatch = line.match(/if\s*\((.*)\)\s*\{/);
      if (!condMatch) throw new Error(`Invalid if statement: ${line}`);
      
      const condition = parseExpression(condMatch[1].trim());
      const ifBody: string[] = [];
      
      // Find the matching closing brace
      let depth = 1;
      let j = i + 1;
      
      while (j < lines.length && depth > 0) {
        const currentLine = lines[j].trim();
        
        if (currentLine.includes('{')) depth++;
        if (currentLine.includes('}')) depth--;
        
        if (depth > 0 && currentLine) {
          ifBody.push(currentLine);
        }
        
        j++;
      }
      
      // Check for else
      let elseBody: string[] = [];
      if (j < lines.length && lines[j].trim().startsWith('else')) {
        j++;  // Skip the else line
        
        // Find the matching closing brace for else
        depth = 1;
        j++;  // Move to first line inside else
        
        while (j < lines.length && depth > 0) {
          const currentLine = lines[j].trim();
          
          if (currentLine.includes('{')) depth++;
          if (currentLine.includes('}')) depth--;
          
          if (depth > 0 && currentLine) {
            elseBody.push(currentLine);
          }
          
          j++;
        }
      }
      
      ast.body?.push({
        type: 'IfStatement',
        condition,
        ifBody: parseProgram(ifBody.join('\n')).body,
        elseBody: parseProgram(elseBody.join('\n')).body
      });
      
      i = j;
      continue;
    }
    // While loop
    else if (line.startsWith('while')) {
      const condMatch = line.match(/while\s*\((.*)\)\s*\{/);
      if (!condMatch) throw new Error(`Invalid while statement: ${line}`);
      
      const condition = parseExpression(condMatch[1].trim());
      const loopBody: string[] = [];
      
      // Find the matching closing brace
      let depth = 1;
      let j = i + 1;
      
      while (j < lines.length && depth > 0) {
        const currentLine = lines[j].trim();
        
        if (currentLine.includes('{')) depth++;
        if (currentLine.includes('}')) depth--;
        
        if (depth > 0 && currentLine) {
          loopBody.push(currentLine);
        }
        
        j++;
      }
      
      ast.body?.push({
        type: 'WhileLoop',
        condition,
        body: parseProgram(loopBody.join('\n')).body
      });
      
      i = j;
      continue;
    }
    // For loop
    else if (line.startsWith('for')) {
      const forMatch = line.match(/for\s*\((.*);(.*);(.*)\)\s*\{/);
      if (!forMatch) throw new Error(`Invalid for statement: ${line}`);
      
      const initialization = forMatch[1].trim();
      const condition = parseExpression(forMatch[2].trim());
      const update = forMatch[3].trim();
      
      const loopBody: string[] = [];
      
      // Find the matching closing brace
      let depth = 1;
      let j = i + 1;
      
      while (j < lines.length && depth > 0) {
        const currentLine = lines[j].trim();
        
        if (currentLine.includes('{')) depth++;
        if (currentLine.includes('}')) depth--;
        
        if (depth > 0 && currentLine) {
          loopBody.push(currentLine);
        }
        
        j++;
      }
      
      // Parse initialization part (typically assignment)
      const initParts = initialization.split(':=');
      const initAssign: ProgramNode = {
        type: 'Assignment',
        left: initParts[0].trim(),
        right: parseExpression(initParts[1].trim())
      };
      
      // Parse update part (typically assignment)
      const updateParts = update.split(':=');
      const updateAssign: ProgramNode = {
        type: 'Assignment',
        left: updateParts[0].trim(),
        right: parseExpression(updateParts[1].trim())
      };
      
      ast.body?.push({
        type: 'ForLoop',
        init: initAssign,
        condition,
        update: updateAssign,
        body: parseProgram(loopBody.join('\n')).body
      });
      
      i = j;
      continue;
    }
    // Assert statement
    else if (line.startsWith('assert')) {
      const assertMatch = line.match(/assert\((.*)\);/);
      if (!assertMatch) throw new Error(`Invalid assert statement: ${line}`);
      
      ast.body?.push({
        type: 'Assert',
        condition: parseExpression(assertMatch[1].trim())
      });
    }
    
    i++;
  }
  
  return ast;
}

function parseExpression(expr: string): ExpressionNode {
  // This is a very simplified expression parser
  // In a real implementation, you would use a proper parser with precedence rules
  
  // Check for array access
  if (expr.includes('[') && expr.includes(']')) {
    const match = expr.match(/(.*)\[(.*)\]/);
    if (match) {
      return {
        type: 'ArrayAccess',
        array: match[1].trim(),
        index: parseExpression(match[2].trim())
      };
    }
  }
  
  // Check for binary operations
  const operators = ['==', '!=', '<=', '>=', '<', '>', '+', '-', '*', '/', '%'];
  for (const op of operators) {
    if (expr.includes(op)) {
      const [left, right] = expr.split(op);
      return {
        type: 'BinaryOperation',
        operator: op,
        left: parseExpression(left.trim()),
        right: parseExpression(right.trim())
      };
    }
  }
  
  // Check if it's a number
  if (!isNaN(Number(expr))) {
    return {
      type: 'Literal',
      value: parseInt(expr)
    };
  }
  
  // Otherwise assume it's a variable
  return {
    type: 'Variable',
    name: expr
  };
}

// SSA conversion
export function convertToSSA(ast: ProgramNode): { ssa: SSANode[], variables: Record<string, number> } {
  const ssa: SSANode[] = [];
  const variables: Record<string, number> = {};
  const phi: SSANode[] = [];
  
  // Helper to create a new version of a variable
  const createNewVersion = (varName: string): string => {
    if (variables[varName] === undefined) {
      variables[varName] = 0;
    } else {
      variables[varName]++;
    }
    return `${varName}_${variables[varName]}`;
  };
  
  // Helper to get the current version of a variable
  const getCurrentVersion = (varName: string): string => {
    if (variables[varName] === undefined) {
      // First use, initialize to 0
      variables[varName] = 0;
      return `${varName}_0`;
    }
    return `${varName}_${variables[varName]}`;
  };
  
  // Recursive function to process each node in the AST
  const processNode = (node: ProgramNode): void => {
    if (!node) return;
    
    switch (node.type) {
      case 'Program':
        node.body?.forEach(statement => {
          processNode(statement);
        });
        break;
        
      case 'Assignment': {
        const varName = node.left as string;
        const rightValue = processExpression(node.right as ExpressionNode);
        const newVar = createNewVersion(varName);
        
        ssa.push({
          type: 'Assignment',
          left: newVar,
          right: rightValue
        });
        break;
      }
        
      case 'IfStatement': {
        const condition = processExpression(node.condition as ExpressionNode);
        
        // Save the variable state before if branch
        const beforeIfState = {...variables};
        
        // Process if branch
        node.ifBody?.forEach(statement => {
          processNode(statement);
        });
        
        // Save the variable state after if branch
        const afterIfState = {...variables};
        
        // Restore the variable state before if for else branch
        Object.assign(variables, beforeIfState);
        
        // Process else branch
        node.elseBody?.forEach(statement => {
          processNode(statement);
        });
        
        // Create phi nodes for variables modified in either branch
        const modifiedVars = new Set([
          ...Object.keys(afterIfState),
          ...Object.keys(variables)
        ]);
        
        for (const varName of modifiedVars) {
          const ifVersion = afterIfState[varName] !== undefined ? 
            `${varName}_${afterIfState[varName]}` : null;
            
          const elseVersion = variables[varName] !== undefined ?
            `${varName}_${variables[varName]}` : null;
            
          if (ifVersion !== elseVersion && ifVersion && elseVersion) {
            const newVar = createNewVersion(varName);
            ssa.push({
              type: 'Phi',
              result: newVar,
              operands: [ifVersion, elseVersion],
              condition
            });
          }
        }
        break;
      }
        
      case 'WhileLoop': {
        // Process loop condition
        const condition = processExpression(node.condition as ExpressionNode);
        
        // Save variable state before loop
        const beforeLoopState = {...variables};
        
        // Create initial phi nodes for loop entry
        for (const varName of Object.keys(beforeLoopState)) {
          phi.push({
            type: 'Phi',
            result: `${varName}_loop`,
            operands: [getCurrentVersion(varName)],
            loopVar: true
          });
          
          // Update the current version to use the loop version
          variables[varName] = 'loop' as any;
        }
        
        // Process loop body
        node.body?.forEach(statement => {
          processNode(statement);
        });
        
        // Update phi nodes with the final versions from the loop body
        for (const phiNode of phi) {
          if (phiNode.loopVar) {
            const varName = phiNode.result?.split('_')[0] as string;
            const endVersion = getCurrentVersion(varName);
            if (phiNode.operands && !phiNode.operands.includes(endVersion)) {
              phiNode.operands.push(endVersion);
            }
          }
        }
        
        // Add phi nodes to the SSA
        for (const phiNode of phi) {
          if (phiNode.loopVar) {
            const { loopVar, ...newNode } = phiNode;
            ssa.push(newNode);
          }
        }
        
        // Create exit phi nodes for variables modified in the loop
        for (const varName of Object.keys(variables)) {
          if (variables[varName] !== beforeLoopState[varName]) {
            const newVar = createNewVersion(varName);
            ssa.push({
              type: 'Phi',
              result: newVar,
              operands: [
                beforeLoopState[varName] !== undefined ? `${varName}_${beforeLoopState[varName]}` : `${varName}_0`,
                getCurrentVersion(varName)
              ],
              condition: {
                type: 'UnaryOperation',
                operator: '!',
                operand: condition
              }
            });
          }
        }
        break;
      }
        
      case 'ForLoop': {
        // Process initialization
        processNode(node.init as ProgramNode);
        
        // Handle as a while loop
        const whileLoop: ProgramNode = {
          type: 'WhileLoop',
          condition: node.condition,
          body: [...(node.body || []), node.update as ProgramNode]
        };
        
        processNode(whileLoop);
        break;
      }
        
      case 'Assert': {
        const condition = processExpression(node.condition as ExpressionNode);
        ssa.push({
          type: 'Assert',
          condition
        });
        break;
      }
        
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  };
  
  const processExpression = (expr: ExpressionNode): ExpressionNode => {
    if (!expr) return { type: 'Literal', value: 0 };
    
    switch (expr.type) {
      case 'BinaryOperation':
        return {
          type: 'BinaryOperation',
          operator: expr.operator,
          left: processExpression(expr.left as ExpressionNode),
          right: processExpression(expr.right as ExpressionNode)
        };
        
      case 'UnaryOperation':
        return {
          type: 'UnaryOperation',
          operator: expr.operator,
          operand: processExpression(expr.operand as ExpressionNode)
        };
        
      case 'Variable':
        return {
          type: 'Variable',
          name: getCurrentVersion(expr.name as string)
        };
        
      case 'ArrayAccess':
        return {
          type: 'ArrayAccess',
          array: getCurrentVersion(expr.array as string),
          index: processExpression(expr.index as ExpressionNode)
        };
        
      case 'Literal':
        return expr;
        
      default:
        throw new Error(`Unknown expression type: ${expr.type}`);
    }
  };
  
  processNode(ast);
  
  return { ssa, variables };
}

// Control Flow Graph generation
export function generateCFG(ast: ProgramNode) {
  const nodes: { id: number; label: string }[] = [];
  const edges: { from: number; to: number; label?: string }[] = [];
  let nodeId = 0;

  const processNode = (node: ProgramNode, parentId: number | null = null) => {
    const currentNodeId = nodeId++;
    let label = '';
    
    switch (node.type) {
      case 'Program':
        label = 'Program Start';
        nodes.push({ id: currentNodeId, label });
        node.body?.forEach(child => processNode(child, currentNodeId));
        break;
        
      case 'Assignment':
        label = `${node.left} := ${formatExpression(node.right as ExpressionNode)}`;
        nodes.push({ id: currentNodeId, label });
        if (parentId !== null) {
          edges.push({ from: parentId, to: currentNodeId });
        }
        break;
        
      case 'IfStatement':
        label = `If (${formatExpression(node.condition as ExpressionNode)})`;
        nodes.push({ id: currentNodeId, label });
        if (parentId !== null) {
          edges.push({ from: parentId, to: currentNodeId });
        }
        
        // True branch
        const trueBranchId = nodeId++;
        nodes.push({ id: trueBranchId, label: 'Then' });
        edges.push({ from: currentNodeId, to: trueBranchId, label: 'T' });
        node.ifBody?.forEach(child => processNode(child, trueBranchId));
        
        // False branch
        const falseBranchId = nodeId++;
        nodes.push({ id: falseBranchId, label: 'Else' });
        edges.push({ from: currentNodeId, to: falseBranchId, label: 'F' });
        node.elseBody?.forEach(child => processNode(child, falseBranchId));
        break;
        
      case 'WhileLoop':
        label = `While (${formatExpression(node.condition as ExpressionNode)})`;
        nodes.push({ id: currentNodeId, label });
        if (parentId !== null) {
          edges.push({ from: parentId, to: currentNodeId });
        }
        
        // Loop body
        const loopBodyId = nodeId++;
        nodes.push({ id: loopBodyId, label: 'Loop Body' });
        edges.push({ from: currentNodeId, to: loopBodyId, label: 'T' });
        node.body?.forEach(child => processNode(child, loopBodyId));
        
        // Back edge
        edges.push({ from: loopBodyId, to: currentNodeId });
        break;
        
      case 'Assert':
        label = `Assert (${formatExpression(node.condition as ExpressionNode)})`;
        nodes.push({ id: currentNodeId, label });
        if (parentId !== null) {
          edges.push({ from: parentId, to: currentNodeId });
        }
        break;
        
      default:
        label = node.type;
        nodes.push({ id: currentNodeId, label });
        if (parentId !== null) {
          edges.push({ from: parentId, to: currentNodeId });
        }
    }
  };

  processNode(ast);
  return { nodes, edges };
}

function formatExpression(expr: ExpressionNode): string {
  if (!expr) return '';
  switch (expr.type) {
    case 'BinaryOperation':
      return `${formatExpression(expr.left as ExpressionNode)} ${expr.operator} ${formatExpression(expr.right as ExpressionNode)}`;
    case 'Variable':
      return expr.name as string;
    case 'Literal':
      return String(expr.value);
    default:
      return expr.type;
  }
}

// SMT generation
export function generateVerificationSMT(ssa: SSANode[], unrollDepth: number): string {
  let smt = '(set-logic QF_LIA)\n';
  const declarations = new Set<string>();
  const assertions: string[] = [];
  
  // Track variable types (integer by default)
  const varTypes: Record<string, string> = {};
  
  const processExpression = (expr: ExpressionNode): string => {
    if (!expr) return '0';
    
    switch (expr.type) {
      case 'BinaryOperation':
        const left = processExpression(expr.left as ExpressionNode);
        const right = processExpression(expr.right as ExpressionNode);
        return `(${expr.operator} ${left} ${right})`;
        
      case 'Variable':
        const varName = expr.name as string;
        if (!declarations.has(varName)) {
          declarations.add(varName);
          varTypes[varName] = 'Int';
        }
        return varName;
        
      case 'Literal':
        return String(expr.value);
        
      case 'Phi':
        return processExpression({ type: 'Variable', name: expr.operands?.[0] } as ExpressionNode); // Simplified
        
      default:
        return '0'; // Default value for unknown expressions
    }
  };
  
  // Process SSA nodes
  for (const node of ssa) {
    switch (node.type) {
      case 'Assignment':
        const leftVar = node.left as string;
        declarations.add(leftVar);
        varTypes[leftVar] = 'Int';
        smt += `(assert (= ${leftVar} ${processExpression(node.right as ExpressionNode)}))\n`;
        break;
        
      case 'Assert':
        assertions.push(`(assert ${processExpression(node.condition as ExpressionNode)})\n`);
        break;
        
      case 'Phi':
        // Handle phi nodes - simplified version
        if (node.condition && node.operands && node.operands.length >= 2) {
          const condition = processExpression(node.condition);
          const trueCase = node.operands[0];
          const falseCase = node.operands[1];
          declarations.add(node.result as string);
          varTypes[node.result as string] = 'Int';
          smt += `(assert (= ${node.result} (ite ${condition} ${trueCase} ${falseCase})))\n`;
        }
        break;
    }
  }
  
  // Add variable declarations
  for (const decl of declarations) {
    smt += `(declare-const ${decl} ${varTypes[decl]})\n`;
  }
  
  // Add assertions
  for (const assertion of assertions) {
    smt += assertion;
  }
  
  smt += '(check-sat)\n';
  smt += '(get-model)\n';
  
  return smt;
}

export function generateEquivalenceSMT(ssa1: SSANode[], ssa2: SSANode[], unrollDepth: number): string {
  let smt = '(set-logic QF_LIA)\n';
  const declarations = new Set<{name: string, type: string}>();
  
  // Rename variables in second program to avoid collisions
  const renamedSSA2 = renameVariables(ssa2, '_p2');
  
  // Generate SMT for first program
  const smt1 = generateVerificationSMT(ssa1, unrollDepth);
  
  // Generate SMT for second program
  const smt2 = generateVerificationSMT(renamedSSA2, unrollDepth);
  
  // Combine both programs' declarations
  const combinedDeclarations = new Set([
    ...extractDeclarations(smt1),
    ...extractDeclarations(smt2)
  ]);
  
  // Add combined declarations
  for (const decl of combinedDeclarations) {
    smt += `(declare-const ${decl.name} ${decl.type})\n`;
  }
  
  // Add assertions from both programs
  smt += extractAssertions(smt1);
  smt += extractAssertions(smt2);
  
  // Find output variables to compare
  const outputs1 = findOutputVariables(ssa1);
  const outputs2 = findOutputVariables(renamedSSA2);
  
  // Add equivalence checks
  if (outputs1.length === outputs2.length) {
    for (let i = 0; i < outputs1.length; i++) {
      smt += `(assert (= ${outputs1[i]} ${outputs2[i]}))\n`;
    }
  } else {
    smt += '(assert false) ; Output count mismatch\n';
  }
  
  smt += '(check-sat)\n';
  smt += '(get-model)\n';
  
  return smt;
}

function renameVariables(ssa: SSANode[], suffix: string): SSANode[] {
  return ssa.map(node => {
    const newNode = {...node};
    
    const renameInExpr = (expr: ExpressionNode): ExpressionNode => {
      if (!expr) return expr;
      const newExpr = {...expr} as ExpressionNode;
      if (newExpr.name) newExpr.name += suffix;
      if (newExpr.left) newExpr.left = renameInExpr(newExpr.left as ExpressionNode);
      if (newExpr.right) newExpr.right = renameInExpr(newExpr.right as ExpressionNode);
      if (newExpr.operands) newExpr.operands = newExpr.operands.map(op => op + suffix);
      return newExpr;
    };
    
    if (newNode.left) newNode.left += suffix;
    if (newNode.right) newNode.right = renameInExpr(newNode.right as ExpressionNode);
    if (newNode.condition) newNode.condition = renameInExpr(newNode.condition as ExpressionNode);
    if (newNode.operands) newNode.operands = newNode.operands.map(op => op + suffix);
    if (newNode.result) newNode.result += suffix;
    
    return newNode;
  });
}

function extractDeclarations(smt: string): {name: string, type: string}[] {
  const declarations: {name: string, type: string}[] = [];
  const lines = smt.split('\n');
  const declRegex = /\(declare-const (\w+) (\w+)\)/;
  
  for (const line of lines) {
    const match = line.match(declRegex);
    if (match) {
      declarations.push({ name: match[1], type: match[2] });
    }
  }
  
  return declarations;
}

function extractAssertions(smt: string): string {
  const lines = smt.split('\n');
  return lines.filter(line => line.startsWith('(assert') && !line.includes('check-sat')).join('\n') + '\n';
}

function findOutputVariables(ssa: SSANode[]): string[] {
  const outputs: string[] = [];
  const lastAssignments: Record<string, string> = {};
  
  // Find last assignments to each variable
  for (const node of ssa) {
    if (node.type === 'Assignment' && node.left) {
      const baseVar = node.left.split('_')[0];
      lastAssignments[baseVar] = node.left;
    }
  }
  
  return Object.values(lastAssignments);
}

// Mock implementation of SMT solver calls
export async function checkVerification(smt: string): Promise<{verified: boolean, counterexamples?: Record<string, any>[], validExamples?: Record<string, any>[]}> {
  try {
    // This is a mock implementation - in a real app, you'd call Z3 or another SMT solver
    // Randomly return verified or not for demo purposes
    const isVerified = Math.random() > 0.5;
    
    if (isVerified) {
      return {
        verified: true,
        validExamples: [
          { x_0: 3, y_1: 4 }
        ]
      };
    } else {
      return {
        verified: false,
        counterexamples: [
          { x_0: 10, y_1: 0 }
        ]
      };
    }
  } catch (error: any) {
    return {
      verified: false,
      counterexamples: [{ error: error.message }]
    };
  }
}

export async function checkEquivalence(smt: string): Promise<{equivalent: boolean, counterexamples?: Record<string, any>[], validExamples?: Record<string, any>[]}> {
  try {
    // This is a mock implementation - in a real app, you'd call Z3 or another SMT solver
    // Randomly return equivalent or not for demo purposes
    const isEquivalent = Math.random() > 0.5;
    
    if (isEquivalent) {
      return {
        equivalent: true,
        validExamples: [
          { x_0: 3, y_1: 4, x_0_p2: 3, y_1_p2: 4 }
        ]
      };
    } else {
      return {
        equivalent: false,
        counterexamples: [
          { x_0: 6, y_1: 7, x_0_p2: 6, y_1_p2: 5 }
        ]
      };
    }
  } catch (error: any) {
    return {
      equivalent: false,
      counterexamples: [{ error: error.message }]
    };
  }
}

// SSA formatting
export function formatSSA(ssa: SSANode[]): string {
  return ssa.map(node => {
    switch (node.type) {
      case 'Assignment':
        return `${node.left} = ${formatSSAExpression(node.right as ExpressionNode)}`;
      case 'Assert':
        return `assert(${formatSSAExpression(node.condition as ExpressionNode)})`;
      case 'Phi':
        return `${node.result} = φ(${(node.operands || []).join(', ')}) [${formatSSAExpression(node.condition as ExpressionNode)}]`;
      default:
        return JSON.stringify(node);
    }
  }).join('\n');
}

function formatSSAExpression(expr: ExpressionNode): string {
  if (!expr) return '';
  switch (expr.type) {
    case 'BinaryOperation':
      return `(${formatSSAExpression(expr.left as ExpressionNode)} ${expr.operator} ${formatSSAExpression(expr.right as ExpressionNode)})`;
    case 'Variable':
      return expr.name as string;
    case 'Literal':
      return String(expr.value);
    case 'Phi':
      return `φ(${(expr.operands || []).map(op => op).join(', ')})`;
    default:
      return JSON.stringify(expr);
    }
}

// SSA optimization
export function optimizeSSA(ssaNodes: SSANode[]): SSANode[] {
  const optimized = [...ssaNodes];
  const constants: Record<string, number> = {};
  const useCounts: Record<string, number> = {};
  
  // First pass: Identify constants and count uses
  for (const node of optimized) {
    if (node.type === 'Assignment' && node.right && node.right.type === 'Literal' && node.left) {
      constants[node.left] = node.right.value as number;
    }
    
    // Count variable uses
    const countUses = (expr: ExpressionNode) => {
      if (!expr) return;
      
      if (expr.type === 'Variable' && expr.name) {
        useCounts[expr.name] = (useCounts[expr.name] || 0) + 1;
      } else if (expr.type === 'BinaryOperation') {
        countUses(expr.left as ExpressionNode);
        countUses(expr.right as ExpressionNode);
      } else if (expr.type === 'ArrayAccess' && expr.array) {
        useCounts[expr.array] = (useCounts[expr.array] || 0) + 1;
        countUses(expr.index as ExpressionNode);
      }
    };
    
    if (node.type === 'Assignment' || node.type === 'Assert') {
      countUses(node.right as ExpressionNode);
    } else if (node.type === 'Phi' && node.operands) {
      for (const operand of node.operands) {
        useCounts[operand] = (useCounts[operand] || 0) + 1;
      }
    }
  }
  
  // Second pass: Constant propagation and dead code elimination
  const newOptimized: SSANode[] = [];
  
  for (const node of optimized) {
    const propagateConstants = (expr: ExpressionNode): ExpressionNode => {
      if (!expr) return { type: 'Literal', value: 0 };
      
      if (expr.type === 'Variable' && expr.name && constants[expr.name] !== undefined) {
        return {
          type: 'Literal',
          value: constants[expr.name]
        };
      } else if (expr.type === 'BinaryOperation') {
        const left = propagateConstants(expr.left as ExpressionNode);
        const right = propagateConstants(expr.right as ExpressionNode);
        
        // Evaluate constant expressions
        if (left.type === 'Literal' && right.type === 'Literal') {
          try {
            const leftVal = left.value as number;
            const rightVal = right.value as number;
            const op = expr.operator;
            
            let value: number;
            switch (op) {
              case '+': value = leftVal + rightVal; break;
              case '-': value = leftVal - rightVal; break;
              case '*': value = leftVal * rightVal; break;
              case '/': value = leftVal / rightVal; break;
              case '%': value = leftVal % rightVal; break;
              case '<': value = leftVal < rightVal ? 1 : 0; break;
              case '>': value = leftVal > rightVal ? 1 : 0; break;
              case '<=': value = leftVal <= rightVal ? 1 : 0; break;
              case '>=': value = leftVal >= rightVal ? 1 : 0; break;
              case '==': value = leftVal === rightVal ? 1 : 0; break;
              case '!=': value = leftVal !== rightVal ? 1 : 0; break;
              default: return { ...expr, left, right };
            }
            
            return { type: 'Literal', value };
          } catch {
            return { ...expr, left, right };
          }
        }
        return { ...expr, left, right };
      }
      return expr;
    };
    
    // Skip dead assignments (assigned but never used)
    if (node.type === 'Assignment' && node.left && useCounts[node.left] === 0) {
      continue;
    }
    
    const newNode = { ...node };
    
    if (newNode.right) {
      newNode.right = propagateConstants(newNode.right as ExpressionNode);
    }
    
    if (newNode.condition) {
      newNode.condition = propagateConstants(newNode.condition as ExpressionNode);
    }
    
    if (newNode.operands) {
      // Instead of modifying operands, keep the original ones for Phi nodes
      // This is a simplification for the demo
    }
    
    newOptimized.push(newNode);
  }
  
  return newOptimized;
}