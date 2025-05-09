# VeriTool

VeriTool is a formal methods verification tool designed to analyze program correctness and equivalence using static analysis techniques. It allows users to input their programs, which are then parsed, transformed into Static Single Assignment (SSA) form, and verified against specified assertions.

## Features

- **Program Verification:** Check the correctness of programs against specified assertions.
- **Equivalence Checking:** Compare two programs to determine if they are equivalent based on their behavior.
- **Static Single Assignment (SSA) Conversion:** Transform programs into SSA form for easier analysis.
- **Control Flow Graph Generation:** Visualize the control flow of programs.
- **SMT (Satisfiability Modulo Theories) Integration:** Utilize SMT solvers to verify assertions and find counterexamples.
- **User-Friendly Interface:** Intuitive UI for inputting programs and viewing results.

## Installation

To set up VeriTool, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/veritool.git
   cd veritool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to access the tool.

## Usage

1. **Input Programs:** Enter your program code in the provided text areas. You can input one program for verification or two programs for equivalence checking.
2. **Set Parameters:** Adjust the loop unrolling depth if necessary.
3. **Run Analysis:** Click the "Analyze" button to start the verification process.
4. **View Results:** The results panel will display the SSA forms, SMT code, verification results, and any counterexamples or valid examples.

## Language Syntax

VeriTool accepts a simplified programming language syntax that includes:
- **Variable Assignment:** `x := 5;`
- **Control Structures:** `if`, `else`, `for`, and `while` statements.
- **Assertions:** `assert(condition);` to specify postconditions.

### Postcondition Assertion Format
Assertions can be in the form of:
- Basic Conditions: `assert(condition);`
- Array Assertions: Access array elements using indices, e.g., `assert(array[i] == value);`.

## Components

- **User Interface:** Built with React, providing an interactive experience for users.
- **Parser:** Converts input programs into an Abstract Syntax Tree (AST).
- **SSA Converter:** Transforms the AST into Static Single Assignment (SSA) form.
- **CFG Generator:** Creates a control flow graph for visualizing program execution.
- **SMT Formulator:** Generates SMT constraints for verification.
- **SMT Solver Interface:** Interacts with SMT solvers to check assertions.
- **Results Processor:** Displays the results of the analysis.

## Limitations

- Currently does not support direct assertions on arrays.
- Assumes syntactically correct input and may not provide detailed error messages for incorrect syntax.
- Performance may degrade with very large programs or deep nesting of control structures.

## Future Improvements

- Enhance support for array assertions and complex data structures.
- Improve error reporting and user feedback.
- Explore additional optimization techniques for SSA to improve performance.




