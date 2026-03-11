import { 
  registerValidator, 
  createValidationResult, 
  required,
  NodeValidationContext,
  ValidationIssue 
} from '../validation/index';

export function validateGPTAnalyzer(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  
  const persona = tfData.persona || goData.persona;
  const query = tfData.query || goData.query;
  const format = tfData.format || goData.format;
  
  const hasSystemPrompt = persona?.blocks?.length > 0 && 
    persona.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  
  if (!hasSystemPrompt) {
    issues.push(required(
      'persona',
      'System Prompt',
      'Define a system prompt to guide the analysis'
    ));
  }
  
  const hasQuery = query?.blocks?.length > 0 && 
    query.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  
  if (!hasQuery) {
    issues.push(required(
      'query',
      'Analysis Prompt',
      'Provide the content or task to analyze'
    ));
  }
  
  const outputSchema = (Array.isArray(format) && format.length > 0 && format[0]?.key) ? format : (format?.[0]?.schema || []);
  const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;
  
  if (!hasOutput) {
    issues.push(required(
      'format',
      'Output Schema',
      'Define at least one output field for analysis results'
    ));
  }
  
  return createValidationResult(issues);
}

registerValidator('GPT_ANALYZER', validateGPTAnalyzer);
