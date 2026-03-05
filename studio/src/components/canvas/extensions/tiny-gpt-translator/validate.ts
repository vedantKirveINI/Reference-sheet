import { 
  registerValidator, 
  createValidationResult, 
  required,
  NodeValidationContext,
  ValidationIssue 
} from '../validation/index';

export function validateGPTTranslator(context: NodeValidationContext) {
  const issues: ValidationIssue[] = [];
  const tfData = context.tfData || {};
  const goData = context.goData || {};
  
  const persona = tfData.persona || goData.persona;
  const query = tfData.query || goData.query;
  const targetLanguage = tfData.targetLanguage || goData.targetLanguage;
  const format = tfData.format || goData.format;
  
  const hasSystemPrompt = persona?.blocks?.length > 0 && 
    persona.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  
  if (!hasSystemPrompt) {
    issues.push(required(
      'persona',
      'System Prompt',
      'Define a translation persona or style'
    ));
  }
  
  const hasQuery = query?.blocks?.length > 0 && 
    query.blocks.some((b: any) => b.value && String(b.value).trim() !== '');
  
  if (!hasQuery) {
    issues.push(required(
      'query',
      'Input Text',
      'Enter the text you want to translate'
    ));
  }
  
  if (!targetLanguage || targetLanguage === '') {
    issues.push(required(
      'targetLanguage',
      'Target Language',
      'Select a target language for translation'
    ));
  }
  
  const outputSchema = (Array.isArray(format) && format.length > 0 && format[0]?.key) ? format : (format?.[0]?.schema || []);
  const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;
  
  if (!hasOutput) {
    issues.push(required(
      'format',
      'Output Schema',
      'Define at least one output field'
    ));
  }
  
  return createValidationResult(issues);
}

registerValidator('GPT_TRANSLATOR', validateGPTTranslator);
