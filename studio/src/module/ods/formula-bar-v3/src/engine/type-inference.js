import { ASTNodeType } from './ast.js';
import {
  TypeKind,
  createType,
  parseTypeFromRegistry,
  isTypeCompatible,
  mergeTypes,
  TYPE_NUMBER,
  TYPE_STRING,
  TYPE_BOOLEAN,
  TYPE_ANY,
  TYPE_NULL,
  typeToString,
} from './types.js';

export const createDiagnostic = (nodeId, severity, message, suggestion = null) => ({
  nodeId,
  severity,
  message,
  suggestion,
});

export class TypeInference {
  constructor(functionRegistry = {}, variableRegistry = {}) {
    this.functionRegistry = functionRegistry;
    this.variableRegistry = variableRegistry;
    this.diagnostics = [];
    this.narrowedTypes = {};
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  addDiagnostic(nodeId, severity, message, suggestion = null) {
    this.diagnostics.push(createDiagnostic(nodeId, severity, message, suggestion));
  }

  infer(node, context = {}) {
    if (!node) return TYPE_ANY;

    const narrowedType = context.narrowedTypes?.[node.name];
    if (narrowedType) {
      node.inferredType = narrowedType;
      node.nullable = narrowedType.nullable;
      return narrowedType;
    }

    switch (node.nodeType) {
      case ASTNodeType.LITERAL:
        return this.inferLiteral(node);
      case ASTNodeType.VARIABLE:
        return this.inferVariable(node, context);
      case ASTNodeType.FUNCTION_CALL:
        return this.inferFunctionCall(node, context);
      case ASTNodeType.BINARY_OP:
        return this.inferBinaryOp(node, context);
      case ASTNodeType.UNARY_OP:
        return this.inferUnaryOp(node, context);
      case ASTNodeType.IF_EXPRESSION:
        return this.inferIfExpression(node, context);
      case ASTNodeType.ARRAY:
        return this.inferArray(node, context);
      case ASTNodeType.PROPERTY_ACCESS:
        return this.inferPropertyAccess(node, context);
      case ASTNodeType.ERROR:
        return TYPE_ANY;
      default:
        return TYPE_ANY;
    }
  }

  inferLiteral(node) {
    const type = createType(node.literalType, node.literalType === TypeKind.NULL);
    node.inferredType = type;
    node.nullable = type.nullable;
    return type;
  }

  inferVariable(node, context) {
    const varInfo = this.variableRegistry[node.name] || node.variableInfo;
    
    if (!varInfo) {
      this.addDiagnostic(
        node.nodeId,
        'warning',
        `Unknown variable: ${node.name}`,
        `Define "${node.name}" in your variables.`
      );
      const type = createType(TypeKind.ANY, true);
      node.inferredType = type;
      node.nullable = true;
      return type;
    }

    const type = parseTypeFromRegistry(varInfo.type || varInfo.returnType);
    type.nullable = varInfo.nullable ?? true;
    node.inferredType = type;
    node.nullable = type.nullable;
    
    return type;
  }

  inferFunctionCall(node, context) {
    const funcName = node.name.toLowerCase().replace('fn', '');
    const funcInfo = this.functionRegistry[node.name] || 
                     this.functionRegistry[funcName] ||
                     node.functionInfo;

    node.args.forEach((arg, index) => {
      const argType = this.infer(arg, context);
      
      if (funcInfo?.args?.[index]) {
        const expectedType = parseTypeFromRegistry(funcInfo.args[index].type);
        
        if (arg.nullable && !expectedType.nullable && funcInfo.args[index].required) {
          this.addDiagnostic(
            node.nodeId,
            'error',
            `${node.name} failed because argument ${index + 1} (${funcInfo.args[index].name}) may be null.`,
            `Guard it using empty() or coalesce() or use if() to handle null.`
          );
        }

        if (!isTypeCompatible(expectedType, argType)) {
          this.addDiagnostic(
            node.nodeId,
            'error',
            `Type mismatch in ${node.name}: expected ${typeToString(expectedType)} but got ${typeToString(argType)}`,
            null
          );
        }
      }
    });

    if (funcInfo?.returnType) {
      const returnType = parseTypeFromRegistry(funcInfo.returnType);
      node.inferredType = returnType;
      node.nullable = returnType.nullable;
      return returnType;
    }

    if (funcName === 'empty' || funcName === 'isblank') {
      node.inferredType = TYPE_BOOLEAN;
      node.nullable = false;
      return TYPE_BOOLEAN;
    }

    if (funcName === 'coalesce') {
      const types = node.args.map(arg => arg.inferredType);
      const nonNullType = types.find(t => t && !t.nullable) || types[0] || TYPE_ANY;
      const resultType = { ...nonNullType, nullable: false };
      node.inferredType = resultType;
      node.nullable = false;
      return resultType;
    }

    node.inferredType = TYPE_ANY;
    node.nullable = false;
    return TYPE_ANY;
  }

  inferBinaryOp(node, context) {
    const leftType = this.infer(node.left, context);
    const rightType = this.infer(node.right, context);

    const op = node.operator.toUpperCase();

    if (['+', '-', '*', '/', '^', '%'].includes(op)) {
      if (leftType.nullable) {
        this.addDiagnostic(
          node.nodeId,
          'error',
          `Arithmetic operation "${op}" may fail because left operand may be null.`,
          'Use coalesce() or if(empty(...)) to handle null values.'
        );
      }
      if (rightType.nullable) {
        this.addDiagnostic(
          node.nodeId,
          'error',
          `Arithmetic operation "${op}" may fail because right operand may be null.`,
          'Use coalesce() or if(empty(...)) to handle null values.'
        );
      }
      node.inferredType = TYPE_NUMBER;
      node.nullable = leftType.nullable || rightType.nullable;
      return TYPE_NUMBER;
    }

    if (['<', '>', '<=', '>=', '==', '!='].includes(op)) {
      node.inferredType = TYPE_BOOLEAN;
      node.nullable = false;
      return TYPE_BOOLEAN;
    }

    if (['AND', 'OR'].includes(op)) {
      if (leftType.kind !== TypeKind.BOOLEAN && leftType.kind !== TypeKind.ANY) {
        this.addDiagnostic(
          node.nodeId,
          'warning',
          `Logical "${op}" expects boolean, got ${typeToString(leftType)}`,
          null
        );
      }
      if (rightType.kind !== TypeKind.BOOLEAN && rightType.kind !== TypeKind.ANY) {
        this.addDiagnostic(
          node.nodeId,
          'warning',
          `Logical "${op}" expects boolean, got ${typeToString(rightType)}`,
          null
        );
      }
      node.inferredType = TYPE_BOOLEAN;
      node.nullable = false;
      return TYPE_BOOLEAN;
    }

    node.inferredType = TYPE_ANY;
    node.nullable = leftType.nullable || rightType.nullable;
    return TYPE_ANY;
  }

  inferUnaryOp(node, context) {
    const operandType = this.infer(node.operand, context);

    if (node.operator === '-' || node.operator === '+') {
      node.inferredType = TYPE_NUMBER;
      node.nullable = operandType.nullable;
      return TYPE_NUMBER;
    }

    if (node.operator.toUpperCase() === 'NOT') {
      node.inferredType = TYPE_BOOLEAN;
      node.nullable = false;
      return TYPE_BOOLEAN;
    }

    node.inferredType = operandType;
    node.nullable = operandType.nullable;
    return operandType;
  }

  inferIfExpression(node, context) {
    this.infer(node.condition, context);

    const narrowedTypesThen = {};
    const narrowedTypesElse = {};

    if (node.condition.nodeType === ASTNodeType.FUNCTION_CALL) {
      const funcName = node.condition.name.toLowerCase().replace('fn', '');
      if (funcName === 'empty' || funcName === 'isblank') {
        const checkedArg = node.condition.args[0];
        if (checkedArg?.nodeType === ASTNodeType.VARIABLE) {
          const varName = checkedArg.name;
          narrowedTypesElse[varName] = { ...checkedArg.inferredType, nullable: false };
          narrowedTypesThen[varName] = TYPE_NULL;
        }
      }
    }

    node.narrowedTypes = { then: narrowedTypesThen, else: narrowedTypesElse };

    const thenType = this.infer(node.thenBranch, { ...context, narrowedTypes: narrowedTypesThen });
    const elseType = this.infer(node.elseBranch, { ...context, narrowedTypes: narrowedTypesElse });

    const resultType = mergeTypes(thenType, elseType);
    node.inferredType = resultType;
    node.nullable = thenType.nullable && elseType.nullable;
    
    return resultType;
  }

  inferArray(node, context) {
    const elementTypes = node.elements.map(elem => this.infer(elem, context));
    
    let elementType = TYPE_ANY;
    if (elementTypes.length > 0) {
      elementType = elementTypes.reduce((acc, t) => mergeTypes(acc, t), elementTypes[0]);
    }

    const type = createType(TypeKind.ARRAY, false, elementType);
    node.inferredType = type;
    node.nullable = false;
    return type;
  }

  inferPropertyAccess(node, context) {
    const objectType = this.infer(node.object, context);
    
    if (objectType.nullable) {
      this.addDiagnostic(
        node.nodeId,
        'error',
        `Cannot access property "${node.property}" on potentially null value.`,
        'Guard with empty() or use optional chaining.'
      );
    }

    const type = createType(TypeKind.ANY, true);
    node.inferredType = type;
    node.nullable = true;
    return type;
  }
}

export const inferTypes = (ast, functionRegistry = {}, variableRegistry = {}) => {
  const inference = new TypeInference(functionRegistry, variableRegistry);
  inference.infer(ast);
  return {
    ast,
    diagnostics: inference.getDiagnostics(),
  };
};
