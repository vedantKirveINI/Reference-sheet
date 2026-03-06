import { 
  registerValidator, 
  createValidationResult, 
  required,
  NodeValidationContext,
  ValidationIssue 
} from '../validation/index';

export function validateGPTConsultant(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  
  const persona = tfData.persona || goData.persona;
  const query = tfData.query || goData.query;
  const resolveFormat = (f: any) => (Array.isArray(f) && f.length > 0 && f[0]?.key) ? f : (f?.[0]?.schema);
  const outputSchema = tfData.outputSchema || goData.outputSchema || 
    resolveFormat(tfData.format) || resolveFormat(goData.format);
  
  const hasSystemPrompt = persona?.blocks?.length > 0 && 
    persona.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  
  if (!hasSystemPrompt) {
    issues.push(required(
      'persona',
      'System Prompt',
      'Define a consulting persona or expertise area'
    ));
  }
  
  const hasQuery = query?.blocks?.length > 0 && 
    query.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  
  if (!hasQuery) {
    issues.push(required(
      'query',
      'Consultation Query',
      'Describe the situation or question for consultation'
    ));
  }
  
  const hasOutput = outputSchema?.length > 0 && outputSchema[0]?.key;
  
  if (!hasOutput) {
    issues.push(required(
      'outputSchema',
      'Output Schema',
      'Define at least one output field'
    ));
  }
  
  return createValidationResult(issues);
}

registerValidator('GPT_CONSULTANT', validateGPTConsultant);
