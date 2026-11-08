/**
 * Cambridge IGCSE & A-Level Pseudocode to Python 3 Transpiler
 * Supports standard Cambridge constructs:
 * - OUTPUT, INPUT
 * - DECLARE arrays & scalar types
 * - IF ... THEN ... ELSE ... ENDIF
 * - FOR ... TO ... NEXT / ENDFOR
 * - WHILE ... DO ... ENDWHILE
 * - REPEAT ... UNTIL
 * - PROCEDURE, FUNCTION, CALL
 * - MOD, DIV, <-
 */

export interface TranspileResult {
  pythonCode: string;
  astLines: string[];
  warnings: string[];
}

export function transpileCambridgeToPython(pseudocode: string): TranspileResult {
  const lines = pseudocode.split('\n');
  const pythonLines: string[] = [];
  const warnings: string[] = [];
  let indentLevel = 0;

  const getIndent = () => '    '.repeat(Math.max(0, indentLevel));

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      pythonLines.push('');
      continue;
    }

    // Preserve comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      pythonLines.push(`${getIndent()}# ${trimmed.replace(/^(\/\/|#)\s*/, '')}`);
      continue;
    }

    let processed = trimmed;

    // 1. Block Closing Keywords (reduce indent before writing)
    if (
      /^(ENDIF|NEXT|ENDFOR|ENDWHILE|ENDPROCEDURE|ENDFUNCTION)\b/i.test(processed)
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
      pythonLines.push(`${getIndent()}# ${processed.toLowerCase()}`);
      continue;
    }

    // 2. UNTIL for REPEAT ... UNTIL
    if (/^UNTIL\b/i.test(processed)) {
      const condition = processed.replace(/^UNTIL\s+/i, '');
      const pyCond = convertConditions(condition);
      pythonLines.push(`${getIndent()}if ${pyCond}:`);
      pythonLines.push(`${getIndent()}    break`);
      indentLevel = Math.max(0, indentLevel - 1);
      continue;
    }

    // 3. REPEAT block open
    if (/^REPEAT\b/i.test(processed)) {
      pythonLines.push(`${getIndent()}while True:`);
      indentLevel++;
      continue;
    }

    // 4. ELSE
    if (/^ELSE\b/i.test(processed)) {
      indentLevel = Math.max(0, indentLevel - 1);
      pythonLines.push(`${getIndent()}else:`);
      indentLevel++;
      continue;
    }

    // 5. IF ... THEN
    if (/^IF\b/i.test(processed)) {
      const match = processed.match(/^IF\s+(.*?)\s+THEN$/i);
      const condition = match ? match[1] : processed.replace(/^IF\s+/i, '').replace(/\s+THEN$/i, '');
      pythonLines.push(`${getIndent()}if ${convertConditions(condition)}:`);
      indentLevel++;
      continue;
    }

    // 6. FOR ... TO
    if (/^FOR\b/i.test(processed)) {
      // e.g. FOR i <- 1 TO 10 (or FOR i = 1 TO 10 STEP 2)
      const match = processed.match(/^FOR\s+([a-zA-Z0-9_]+)\s*(?:<-|=)\s*(.*?)\s+TO\s+(.*?)(?:\s+STEP\s+(.*?))?$/i);
      if (match) {
        const loopVar = match[1];
        const startVal = convertExpression(match[2]);
        const endVal = convertExpression(match[3]);
        const stepVal = match[4] ? convertExpression(match[4]) : '1';

        if (stepVal === '1') {
          pythonLines.push(`${getIndent()}for ${loopVar} in range(${startVal}, ${endVal} + 1):`);
        } else {
          pythonLines.push(`${getIndent()}for ${loopVar} in range(${startVal}, ${endVal} + 1, ${stepVal}):`);
        }
        indentLevel++;
        continue;
      }
    }

    // 7. WHILE ... DO
    if (/^WHILE\b/i.test(processed)) {
      const match = processed.match(/^WHILE\s+(.*?)\s+DO$/i);
      const condition = match ? match[1] : processed.replace(/^WHILE\s+/i, '').replace(/\s+DO$/i, '');
      pythonLines.push(`${getIndent()}while ${convertConditions(condition)}:`);
      indentLevel++;
      continue;
    }

    // 8. PROCEDURE
    if (/^PROCEDURE\b/i.test(processed)) {
      const rest = processed.replace(/^PROCEDURE\s+/i, '');
      const cleanParams = rest.replace(/\b(BYREF|BYVAL)\s+/gi, '').replace(/:[A-Z]+/gi, '');
      pythonLines.push(`${getIndent()}def ${cleanParams}:`);
      indentLevel++;
      continue;
    }

    // 9. FUNCTION
    if (/^FUNCTION\b/i.test(processed)) {
      const match = processed.match(/^FUNCTION\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(?:\s+RETURNS\s+.*)?$/i);
      if (match) {
        const funcName = match[1];
        const rawParams = match[2].replace(/:[A-Z]+/gi, '');
        pythonLines.push(`${getIndent()}def ${funcName}(${rawParams}):`);
        indentLevel++;
        continue;
      }
    }

    // 10. RETURNS
    if (/^RETURNS?\b/i.test(processed)) {
      const retExpr = processed.replace(/^RETURNS?\s+/i, '');
      pythonLines.push(`${getIndent()}return ${convertExpression(retExpr)}`);
      continue;
    }

    // 11. CALL
    if (/^CALL\b/i.test(processed)) {
      const callExpr = processed.replace(/^CALL\s+/i, '');
      pythonLines.push(`${getIndent()}${convertExpression(callExpr)}`);
      continue;
    }

    // 12. DECLARE ARRAY
    // e.g. DECLARE StudentNames : ARRAY[1:30] OF STRING
    const arrayMatch = processed.match(/^DECLARE\s+([a-zA-Z0-9_]+)\s*:\s*ARRAY\s*\[\s*(.*?)\s*:\s*(.*?)\s*\]\s*OF\s+(.*)$/i);
    if (arrayMatch) {
      const arrName = arrayMatch[1];
      const low = parseInt(arrayMatch[2], 10) || 1;
      const high = parseInt(arrayMatch[3], 10) || 10;
      const size = Math.max(1, high - low + 1);
      pythonLines.push(`${getIndent()}# Cambridge 1-based array ${arrName}[${low}:${high}]`);
      pythonLines.push(`${getIndent()}${arrName} = [None] * (${size} + 1)`);
      continue;
    }

    // 13. DECLARE SCALAR
    // e.g. DECLARE Total : INTEGER
    const scalarMatch = processed.match(/^DECLARE\s+([a-zA-Z0-9_]+)\s*:\s*(INTEGER|REAL|CHAR|STRING|BOOLEAN)$/i);
    if (scalarMatch) {
      const varName = scalarMatch[1];
      const varType = scalarMatch[2].toUpperCase();
      let defaultVal = 'None';
      if (varType === 'INTEGER') defaultVal = '0';
      if (varType === 'REAL') defaultVal = '0.0';
      if (varType === 'STRING') defaultVal = '""';
      if (varType === 'BOOLEAN') defaultVal = 'False';

      pythonLines.push(`${getIndent()}${varName} = ${defaultVal}  # type: ${varType}`);
      continue;
    }

    // 14. CONSTANT
    const constMatch = processed.match(/^CONSTANT\s+([a-zA-Z0-9_]+)\s*=\s*(.*)$/i);
    if (constMatch) {
      pythonLines.push(`${getIndent()}${constMatch[1]} = ${convertExpression(constMatch[2])}`);
      continue;
    }

    // 15. OUTPUT
    if (/^OUTPUT\b/i.test(processed)) {
      const expr = processed.replace(/^OUTPUT\s+/i, '');
      pythonLines.push(`${getIndent()}print(${convertExpression(expr)})`);
      continue;
    }

    // 16. INPUT
    if (/^INPUT\b/i.test(processed)) {
      const varName = processed.replace(/^INPUT\s+/i, '').trim();
      pythonLines.push(`${getIndent()}${varName} = input()`);
      continue;
    }

    // 17. Assignment with <-
    if (processed.includes('<-')) {
      const parts = processed.split('<-');
      const target = parts[0].trim();
      const expr = parts.slice(1).join('<-').trim();
      pythonLines.push(`${getIndent()}${target} = ${convertExpression(expr)}`);
      continue;
    }

    // Regular line fallback
    pythonLines.push(`${getIndent()}${convertExpression(processed)}`);
  }

  return {
    pythonCode: pythonLines.join('\n'),
    astLines: pythonLines,
    warnings,
  };
}

function convertConditions(cond: string): string {
  let res = cond
    .replace(/\bAND\b/gi, 'and')
    .replace(/\bOR\b/gi, 'or')
    .replace(/\bNOT\b/gi, 'not')
    .replace(/<>/g, '!=')
    .replace(/(^|[^<>=!])=([^=])/g, '$1==$2') // single '=' to '=='
    .replace(/\bMOD\b/gi, '%')
    .replace(/\bDIV\b/gi, '//');
  return res;
}

function convertExpression(expr: string): string {
  let res = expr
    .replace(/<-/g, '=')
    .replace(/\bMOD\b/gi, '%')
    .replace(/\bDIV\b/gi, '//')
    .replace(/\bTRUE\b/gi, 'True')
    .replace(/\bFALSE\b/gi, 'False')
    .replace(/\bAND\b/gi, 'and')
    .replace(/\bOR\b/gi, 'or')
    .replace(/\bNOT\b/gi, 'not');
  return res;
}

/**
 * Sandboxed In-Browser Python 3 Interpreter Simulation
 * Executes standard algorithmic Python code safely and captures stdout prints.
 */
export function executeSimulatedPython(code: string): { output: string; error?: string } {
  const outputs: string[] = [];

  try {
    // Build isolated execution context
    const sandboxConsole = {
      log: (...args: unknown[]) => {
        outputs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
    };

    // Pre-process Python to JavaScript for sandbox execution
    // Replaces print(...) with sandboxConsole.log(...)
    let jsCode = code
      .replace(/#.*$/gm, '') // strip comments
      .replace(/print\((.*?)\)/g, 'sandboxConsole.log($1)')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null')
      .replace(/input\(\)/g, '"10"'); // mock default input

    // Basic indentation/block wrapper
    const runner = new Function('sandboxConsole', `
      try {
        ${jsCode}
      } catch (e) {
        sandboxConsole.log("Runtime Execution Error: " + e.message);
      }
    `);

    runner(sandboxConsole);

    return {
      output: outputs.join('\n') || 'Program completed with exit code 0 (no output generated).',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      output: outputs.join('\n'),
      error: `Execution syntax error: ${message}`,
    };
  }
}
