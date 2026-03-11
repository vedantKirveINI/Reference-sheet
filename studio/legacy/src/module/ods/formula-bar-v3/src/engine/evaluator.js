import { ASTNodeType } from './ast.js';
import { typeToString } from './types.js';

export const DebugStepStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  SKIPPED: 'skipped',
};

export const createDebugStep = (node, options = {}) => ({
  nodeId: node?.nodeId || 'unknown',
  nodeType: node?.nodeType || 'unknown',
  label: options.label || '',
  inferredType: node?.inferredType ? typeToString(node.inferredType) : 'unknown',
  nullable: node?.nullable ?? false,
  value: options.value ?? null,
  status: options.status || DebugStepStatus.SUCCESS,
  errorMessage: options.errorMessage || null,
  children: options.children || [],
  inputs: options.inputs || [],
});

export class Evaluator {
  constructor(functionRegistry = {}, variableValues = {}) {
    this.functionRegistry = functionRegistry;
    this.variableValues = variableValues;
    this.debugTrace = [];
    this.debugMode = true;
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  getDebugTrace() {
    return this.debugTrace;
  }

  clearTrace() {
    this.debugTrace = [];
  }

  evaluate(node, context = {}) {
    if (!node) {
      return { value: null, step: null };
    }

    const narrowedValues = context.narrowedValues || {};

    try {
      switch (node.nodeType) {
        case ASTNodeType.LITERAL:
          return this.evaluateLiteral(node);
        case ASTNodeType.VARIABLE:
          return this.evaluateVariable(node, narrowedValues);
        case ASTNodeType.FUNCTION_CALL:
          return this.evaluateFunctionCall(node, context);
        case ASTNodeType.BINARY_OP:
          return this.evaluateBinaryOp(node, context);
        case ASTNodeType.UNARY_OP:
          return this.evaluateUnaryOp(node, context);
        case ASTNodeType.IF_EXPRESSION:
          return this.evaluateIfExpression(node, context);
        case ASTNodeType.ARRAY:
          return this.evaluateArray(node, context);
        case ASTNodeType.PROPERTY_ACCESS:
          return this.evaluatePropertyAccess(node, context);
        case ASTNodeType.ERROR:
          return this.evaluateError(node);
        default:
          return { 
            value: null, 
            step: createDebugStep(node, { 
              label: 'Unknown node', 
              status: DebugStepStatus.ERROR,
              errorMessage: `Unknown node type: ${node.nodeType}` 
            }) 
          };
      }
    } catch (error) {
      const step = createDebugStep(node, {
        label: this.nodeToLabel(node),
        status: DebugStepStatus.ERROR,
        errorMessage: error.message,
      });
      if (this.debugMode) {
        this.debugTrace.push(step);
      }
      return { value: null, step };
    }
  }

  nodeToLabel(node) {
    if (!node) return '';
    
    switch (node.nodeType) {
      case ASTNodeType.LITERAL:
        return String(node.value);
      case ASTNodeType.VARIABLE:
        return node.name;
      case ASTNodeType.FUNCTION_CALL:
        return `${node.name}(...)`;
      case ASTNodeType.BINARY_OP:
        return `${this.nodeToLabel(node.left)} ${node.operator} ${this.nodeToLabel(node.right)}`;
      case ASTNodeType.UNARY_OP:
        return `${node.operator}${this.nodeToLabel(node.operand)}`;
      case ASTNodeType.IF_EXPRESSION:
        return 'if(...)';
      case ASTNodeType.ARRAY:
        return '[...]';
      default:
        return 'unknown';
    }
  }

  evaluateLiteral(node) {
    const step = createDebugStep(node, {
      label: String(node.value),
      value: node.value,
      status: DebugStepStatus.SUCCESS,
    });
    if (this.debugMode) {
      this.debugTrace.push(step);
    }
    return { value: node.value, step };
  }

  evaluateVariable(node, narrowedValues = {}) {
    const value = narrowedValues[node.name] ?? this.variableValues[node.name] ?? null;
    
    const step = createDebugStep(node, {
      label: node.name,
      value,
      status: value !== undefined ? DebugStepStatus.SUCCESS : DebugStepStatus.ERROR,
      errorMessage: value === undefined ? `Variable "${node.name}" is not defined` : null,
    });
    
    if (this.debugMode) {
      this.debugTrace.push(step);
    }
    
    return { value, step };
  }

  evaluateFunctionCall(node, context) {
    const funcName = node.name.toLowerCase().replace('fn', '');
    
    const argResults = node.args.map(arg => this.evaluate(arg, context));
    const argValues = argResults.map(r => r.value);
    const argSteps = argResults.map(r => r.step);

    let result;
    let errorMessage = null;

    try {
      result = this.callBuiltinFunction(funcName, argValues, node);
    } catch (error) {
      errorMessage = error.message;
      result = null;
    }

    const step = createDebugStep(node, {
      label: `${node.name}(${argValues.map(v => JSON.stringify(v)).join(', ')})`,
      value: result,
      status: errorMessage ? DebugStepStatus.ERROR : DebugStepStatus.SUCCESS,
      errorMessage,
      children: argSteps.filter(Boolean),
      inputs: argValues,
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: result, step };
  }

  callBuiltinFunction(name, args, node) {
    for (const arg of args) {
      if (arg === null || arg === undefined) {
        if (name !== 'empty' && name !== 'isblank' && name !== 'coalesce' && name !== 'if' && name !== 'iffn') {
          throw new Error(`${node.name} failed because an argument may be null. Guard it using empty() or coalesce().`);
        }
      }
    }

    switch (name) {
      case 'sum':
        return args.flat().reduce((a, b) => (a || 0) + (b || 0), 0);
      case 'average':
        const flatArgs = args.flat();
        return flatArgs.reduce((a, b) => a + b, 0) / flatArgs.length;
      case 'min':
        return Math.min(...args.flat());
      case 'max':
        return Math.max(...args.flat());
      case 'floor':
        return Math.floor(args[0]);
      case 'ceiling':
      case 'ceil':
        return Math.ceil(args[0]);
      case 'round':
        const precision = args[1] || 0;
        const factor = Math.pow(10, precision);
        return Math.round(args[0] * factor) / factor;
      case 'abs':
        return Math.abs(args[0]);
      case 'sqrt':
        return Math.sqrt(args[0]);
      case 'exp':
        return Math.exp(args[0]);
      case 'log':
        return args[1] ? Math.log(args[0]) / Math.log(args[1]) : Math.log10(args[0]);
      case 'count':
        return args.flat().filter(v => typeof v === 'number').length;
      case 'counta':
        return args.flat().filter(v => v !== null && v !== undefined && v !== '').length;

      case 'empty':
      case 'isblank':
        return args[0] === null || args[0] === undefined || args[0] === '';
      case 'iserror':
        return false;
      case 'isobject':
        return typeof args[0] === 'object' && args[0] !== null;
      case 'coalesce':
        return args.find(v => v !== null && v !== undefined) ?? null;

      case 'len':
        return String(args[0] || '').length;
      case 'lower':
        return String(args[0] || '').toLowerCase();
      case 'upper':
        return String(args[0] || '').toUpperCase();
      case 'trim':
        return String(args[0] || '').trim();
      case 'left':
        return String(args[0] || '').slice(0, args[1] || 0);
      case 'right':
        return String(args[0] || '').slice(-(args[1] || 0));
      case 'mid':
        return String(args[0] || '').slice(args[1] || 0, (args[1] || 0) + (args[2] || 0));
      case 'concatenate':
      case 'concat':
        return args.map(a => String(a || '')).join('');

      case 'now':
        return new Date();
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      case 'year':
        return args[0] instanceof Date ? args[0].getFullYear() : new Date(args[0]).getFullYear();
      case 'month':
        return args[0] instanceof Date ? args[0].getMonth() + 1 : new Date(args[0]).getMonth() + 1;
      case 'day':
        return args[0] instanceof Date ? args[0].getDate() : new Date(args[0]).getDate();
      case 'hour':
        return args[0] instanceof Date ? args[0].getHours() : new Date(args[0]).getHours();
      case 'minute':
        return args[0] instanceof Date ? args[0].getMinutes() : new Date(args[0]).getMinutes();
      case 'second':
        return args[0] instanceof Date ? args[0].getSeconds() : new Date(args[0]).getSeconds();

      case 'datebetween':
      case 'datediff':
        const date1 = args[0] instanceof Date ? args[0] : new Date(args[0]);
        const date2 = args[1] instanceof Date ? args[1] : new Date(args[1]);
        const unit = String(args[2] || 'days').toLowerCase();
        const diffMs = date2.getTime() - date1.getTime();
        switch (unit) {
          case 'years':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
          case 'months':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
          case 'weeks':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
          case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
          case 'hours':
            return Math.floor(diffMs / (1000 * 60 * 60));
          case 'minutes':
            return Math.floor(diffMs / (1000 * 60));
          case 'seconds':
            return Math.floor(diffMs / 1000);
          default:
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }

      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }

  evaluateBinaryOp(node, context) {
    const leftResult = this.evaluate(node.left, context);
    const rightResult = this.evaluate(node.right, context);
    
    const left = leftResult.value;
    const right = rightResult.value;
    const op = node.operator.toUpperCase();

    let result;
    let errorMessage = null;

    try {
      switch (op) {
        case '+':
          result = (left || 0) + (right || 0);
          break;
        case '-':
          result = (left || 0) - (right || 0);
          break;
        case '*':
          result = (left || 0) * (right || 0);
          break;
        case '/':
          if (right === 0) throw new Error('Division by zero');
          result = (left || 0) / (right || 0);
          break;
        case '^':
          result = Math.pow(left || 0, right || 0);
          break;
        case '%':
          result = (left || 0) % (right || 0);
          break;
        case '<':
          result = left < right;
          break;
        case '>':
          result = left > right;
          break;
        case '<=':
          result = left <= right;
          break;
        case '>=':
          result = left >= right;
          break;
        case '==':
          result = left === right;
          break;
        case '!=':
          result = left !== right;
          break;
        case 'AND':
          result = Boolean(left) && Boolean(right);
          break;
        case 'OR':
          result = Boolean(left) || Boolean(right);
          break;
        default:
          throw new Error(`Unknown operator: ${op}`);
      }
    } catch (error) {
      errorMessage = error.message;
      result = null;
    }

    const step = createDebugStep(node, {
      label: `${JSON.stringify(left)} ${node.operator} ${JSON.stringify(right)}`,
      value: result,
      status: errorMessage ? DebugStepStatus.ERROR : DebugStepStatus.SUCCESS,
      errorMessage,
      children: [leftResult.step, rightResult.step].filter(Boolean),
      inputs: [left, right],
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: result, step };
  }

  evaluateUnaryOp(node, context) {
    const operandResult = this.evaluate(node.operand, context);
    const operand = operandResult.value;
    let result;

    switch (node.operator) {
      case '-':
        result = -(operand || 0);
        break;
      case '+':
        result = +(operand || 0);
        break;
      case 'NOT':
        result = !operand;
        break;
      default:
        result = operand;
    }

    const step = createDebugStep(node, {
      label: `${node.operator}${JSON.stringify(operand)}`,
      value: result,
      status: DebugStepStatus.SUCCESS,
      children: [operandResult.step].filter(Boolean),
      inputs: [operand],
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: result, step };
  }

  evaluateIfExpression(node, context) {
    const conditionResult = this.evaluate(node.condition, context);
    const conditionValue = conditionResult.value;

    let result;
    let branchStep;
    let skippedStep;

    if (conditionValue) {
      const thenContext = {
        ...context,
        narrowedValues: { ...context.narrowedValues, ...this.getNarrowedValues(node, 'then') },
      };
      const thenResult = this.evaluate(node.thenBranch, thenContext);
      result = thenResult.value;
      branchStep = thenResult.step;
      
      skippedStep = createDebugStep(node.elseBranch, {
        label: this.nodeToLabel(node.elseBranch),
        status: DebugStepStatus.SKIPPED,
      });
    } else {
      skippedStep = createDebugStep(node.thenBranch, {
        label: this.nodeToLabel(node.thenBranch),
        status: DebugStepStatus.SKIPPED,
      });
      
      const elseContext = {
        ...context,
        narrowedValues: { ...context.narrowedValues, ...this.getNarrowedValues(node, 'else') },
      };
      const elseResult = this.evaluate(node.elseBranch, elseContext);
      result = elseResult.value;
      branchStep = elseResult.step;
    }

    const step = createDebugStep(node, {
      label: `if(${JSON.stringify(conditionValue)}) → ${conditionValue ? 'then' : 'else'}`,
      value: result,
      status: DebugStepStatus.SUCCESS,
      children: [conditionResult.step, branchStep, skippedStep].filter(Boolean),
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: result, step };
  }

  getNarrowedValues(ifNode, branch) {
    const narrowed = {};
    
    if (ifNode.condition?.nodeType === ASTNodeType.FUNCTION_CALL) {
      const funcName = ifNode.condition.name.toLowerCase().replace('fn', '');
      if (funcName === 'empty' || funcName === 'isblank') {
        const checkedArg = ifNode.condition.args[0];
        if (checkedArg?.nodeType === ASTNodeType.VARIABLE) {
          const varName = checkedArg.name;
          if (branch === 'then') {
            narrowed[varName] = null;
          }
        }
      }
    }
    
    return narrowed;
  }

  evaluateArray(node, context) {
    const elementResults = node.elements.map(elem => this.evaluate(elem, context));
    const values = elementResults.map(r => r.value);
    
    const step = createDebugStep(node, {
      label: `[${values.length} elements]`,
      value: values,
      status: DebugStepStatus.SUCCESS,
      children: elementResults.map(r => r.step).filter(Boolean),
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: values, step };
  }

  evaluatePropertyAccess(node, context) {
    const objectResult = this.evaluate(node.object, context);
    const obj = objectResult.value;
    
    let result = null;
    let errorMessage = null;

    if (obj === null || obj === undefined) {
      errorMessage = `Cannot access property "${node.property}" on null value`;
    } else if (typeof obj === 'object') {
      result = obj[node.property];
    } else {
      errorMessage = `Cannot access property "${node.property}" on non-object`;
    }

    const step = createDebugStep(node, {
      label: `${this.nodeToLabel(node.object)}.${node.property}`,
      value: result,
      status: errorMessage ? DebugStepStatus.ERROR : DebugStepStatus.SUCCESS,
      errorMessage,
      children: [objectResult.step].filter(Boolean),
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: result, step };
  }

  evaluateError(node) {
    const step = createDebugStep(node, {
      label: 'Error',
      status: DebugStepStatus.ERROR,
      errorMessage: node.message,
    });

    if (this.debugMode) {
      this.debugTrace.push(step);
    }

    return { value: null, step };
  }
}

export const evaluateFormula = (ast, functionRegistry = {}, variableValues = {}, debugMode = true) => {
  const evaluator = new Evaluator(functionRegistry, variableValues);
  evaluator.setDebugMode(debugMode);
  
  const result = evaluator.evaluate(ast);
  
  return {
    value: result.value,
    rootStep: result.step,
    trace: evaluator.getDebugTrace(),
  };
};
