let nodeIdCounter = 0;

export const generateNodeId = () => {
  nodeIdCounter += 1;
  return `node_${nodeIdCounter}`;
};

export const resetNodeIdCounter = () => {
  nodeIdCounter = 0;
};

export const ASTNodeType = {
  LITERAL: 'Literal',
  VARIABLE: 'Variable',
  FUNCTION_CALL: 'FunctionCall',
  BINARY_OP: 'BinaryOp',
  UNARY_OP: 'UnaryOp',
  IF_EXPRESSION: 'IfExpression',
  ARRAY: 'Array',
  PROPERTY_ACCESS: 'PropertyAccess',
  ERROR: 'Error',
};

export const createLiteralNode = (value, literalType) => ({
  nodeType: ASTNodeType.LITERAL,
  nodeId: generateNodeId(),
  value,
  literalType,
  inferredType: null,
  nullable: false,
});

export const createVariableNode = (name, variableInfo = null) => ({
  nodeType: ASTNodeType.VARIABLE,
  nodeId: generateNodeId(),
  name,
  variableInfo,
  inferredType: null,
  nullable: variableInfo?.nullable ?? true,
});

export const createFunctionCallNode = (name, args = [], functionInfo = null) => ({
  nodeType: ASTNodeType.FUNCTION_CALL,
  nodeId: generateNodeId(),
  name,
  args,
  functionInfo,
  inferredType: null,
  nullable: false,
});

export const createBinaryOpNode = (operator, left, right) => ({
  nodeType: ASTNodeType.BINARY_OP,
  nodeId: generateNodeId(),
  operator,
  left,
  right,
  inferredType: null,
  nullable: false,
});

export const createUnaryOpNode = (operator, operand) => ({
  nodeType: ASTNodeType.UNARY_OP,
  nodeId: generateNodeId(),
  operator,
  operand,
  inferredType: null,
  nullable: false,
});

export const createIfExpressionNode = (condition, thenBranch, elseBranch) => ({
  nodeType: ASTNodeType.IF_EXPRESSION,
  nodeId: generateNodeId(),
  condition,
  thenBranch,
  elseBranch,
  inferredType: null,
  nullable: false,
  narrowedTypes: {},
});

export const createArrayNode = (elements = []) => ({
  nodeType: ASTNodeType.ARRAY,
  nodeId: generateNodeId(),
  elements,
  inferredType: null,
  nullable: false,
});

export const createPropertyAccessNode = (object, property) => ({
  nodeType: ASTNodeType.PROPERTY_ACCESS,
  nodeId: generateNodeId(),
  object,
  property,
  inferredType: null,
  nullable: true,
});

export const createErrorNode = (message, tokens = []) => ({
  nodeType: ASTNodeType.ERROR,
  nodeId: generateNodeId(),
  message,
  tokens,
  inferredType: null,
  nullable: true,
});

export const walkAST = (node, visitor, context = {}) => {
  if (!node) return;
  
  const result = visitor(node, context);
  if (result === false) return;
  
  switch (node.nodeType) {
    case ASTNodeType.FUNCTION_CALL:
      node.args.forEach((arg, index) => {
        walkAST(arg, visitor, { ...context, parent: node, argIndex: index });
      });
      break;
    case ASTNodeType.BINARY_OP:
      walkAST(node.left, visitor, { ...context, parent: node, side: 'left' });
      walkAST(node.right, visitor, { ...context, parent: node, side: 'right' });
      break;
    case ASTNodeType.UNARY_OP:
      walkAST(node.operand, visitor, { ...context, parent: node });
      break;
    case ASTNodeType.IF_EXPRESSION:
      walkAST(node.condition, visitor, { ...context, parent: node, branch: 'condition' });
      walkAST(node.thenBranch, visitor, { ...context, parent: node, branch: 'then', narrowedTypes: node.narrowedTypes?.then });
      walkAST(node.elseBranch, visitor, { ...context, parent: node, branch: 'else', narrowedTypes: node.narrowedTypes?.else });
      break;
    case ASTNodeType.ARRAY:
      node.elements.forEach((elem, index) => {
        walkAST(elem, visitor, { ...context, parent: node, elemIndex: index });
      });
      break;
    case ASTNodeType.PROPERTY_ACCESS:
      walkAST(node.object, visitor, { ...context, parent: node });
      break;
    default:
      break;
  }
};
