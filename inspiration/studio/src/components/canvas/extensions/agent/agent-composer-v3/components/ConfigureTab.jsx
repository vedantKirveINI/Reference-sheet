import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Users, FileText, Pencil } from "lucide-react";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { TONE_OPTIONS, getComposerTemplateById } from "../constants";
import extensionIcons from "../../../../assets/extensions";

const FormSection = ({ title, description, required, error, children }) => (
  <div className="space-y-2">
    <div>
      <Label className="text-sm font-medium text-gray-900">
        {title}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-red-500" />
        {error}
      </p>
    )}
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
        <Icon size={18} className="text-purple-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const ToneButton = ({ option, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={cn(
      "p-3 rounded-xl border-2 transition-all text-left",
      isSelected
        ? "border-purple-500 bg-purple-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    )}
  >
    <span className="text-sm font-medium text-gray-900">{option.label}</span>
    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
  </button>
);

const ConfigureTab = ({ state, variables, onEditTemplate }) => {
  const {
    selectedTemplateId,
    isFromScratch,
    senderName,
    senderEmail,
    senderCompany,
    recipientName,
    recipientEmail,
    recipientCompany,
    messageSubject,
    messageBody,
    selectedTone,
    setSelectedTone,
    additionalContext,
    setAdditionalContext,
    validation,
    updateSenderName,
    updateSenderEmail,
    updateSenderCompany,
    updateRecipientName,
    updateRecipientEmail,
    updateRecipientCompany,
    updateMessageSubject,
    updateMessageBody,
    markFieldTouched,
  } = state;

  const template = selectedTemplateId
    ? getComposerTemplateById(selectedTemplateId)
    : null;

  return (
    <div className="space-y-5">
      {(template || isFromScratch) && (
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: template?.iconBg || "#8B5CF6" }}
            >
              <img 
                src={extensionIcons.tinyGPTWriter} 
                alt="Composer" 
                className="w-5 h-5"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {template?.label || "Custom Composer"}
              </h3>
              <p className="text-xs text-gray-500">
                {template?.description || "Configure your message parameters"}
              </p>
            </div>
          </div>
          {onEditTemplate && (
            <button
              onClick={onEditTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Pencil size={14} />
              Change
            </button>
          )}
        </div>
      )}

      <SectionCard title="Sender Details" icon={User}>
        <FormSection title="Sender Name" description="Who is sending the message">
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., John Smith"
            variables={variables}
            defaultInputContent={senderName?.blocks || []}
            onInputContentChanged={(content) => {
              updateSenderName(content);
            }}
            slotProps={{
              container: { "data-testid": "sender-name" },
            }}
          />
        </FormSection>

        <FormSection title="Sender Email" description="Email address of the sender">
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., john@company.com"
            variables={variables}
            defaultInputContent={senderEmail?.blocks || []}
            onInputContentChanged={(content) => {
              updateSenderEmail(content);
            }}
            slotProps={{
              container: { "data-testid": "sender-email" },
            }}
          />
        </FormSection>

        <FormSection 
          title="Sender Company" 
          description="Company or organization name"
          required
          error={validation.touchedErrors.senderCompany}
        >
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., Acme Inc."
            variables={variables}
            defaultInputContent={senderCompany?.blocks || []}
            onInputContentChanged={(content) => {
              updateSenderCompany(content);
              markFieldTouched("senderCompany");
            }}
            hasError={!!validation.touchedErrors.senderCompany}
            slotProps={{
              container: { "data-testid": "sender-company" },
            }}
          />
        </FormSection>
      </SectionCard>

      <SectionCard title="Recipient Details" icon={Users}>
        <FormSection title="Recipient Name" description="Who will receive the message">
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., Jane Doe"
            variables={variables}
            defaultInputContent={recipientName?.blocks || []}
            onInputContentChanged={(content) => {
              updateRecipientName(content);
            }}
            slotProps={{
              container: { "data-testid": "recipient-name" },
            }}
          />
        </FormSection>

        <FormSection 
          title="Recipient Email" 
          description="Email address of the recipient"
          required
          error={validation.touchedErrors.recipientEmail}
        >
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., jane@example.com"
            variables={variables}
            defaultInputContent={recipientEmail?.blocks || []}
            onInputContentChanged={(content) => {
              updateRecipientEmail(content);
              markFieldTouched("recipientEmail");
            }}
            hasError={!!validation.touchedErrors.recipientEmail}
            slotProps={{
              container: { "data-testid": "recipient-email" },
            }}
          />
        </FormSection>

        <FormSection title="Recipient Company" description="Recipient's company or context">
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., Target Corp"
            variables={variables}
            defaultInputContent={recipientCompany?.blocks || []}
            onInputContentChanged={(content) => {
              updateRecipientCompany(content);
            }}
            slotProps={{
              container: { "data-testid": "recipient-company" },
            }}
          />
        </FormSection>
      </SectionCard>

      <SectionCard title="Message Content" icon={FileText}>
        <FormSection 
          title="Message Subject" 
          description="Subject line for the message"
          required
          error={validation.touchedErrors.messageSubject}
        >
          <FormulaBar
            wrapContent={true}
            placeholder="e.g., Following up on our conversation"
            variables={variables}
            defaultInputContent={messageSubject?.blocks || []}
            onInputContentChanged={(content) => {
              updateMessageSubject(content);
              markFieldTouched("messageSubject");
            }}
            hasError={!!validation.touchedErrors.messageSubject}
            slotProps={{
              container: { "data-testid": "message-subject" },
            }}
          />
        </FormSection>

        <FormSection 
          title="Message Body" 
          description="Main content or prompt for the message"
          required
          error={validation.touchedErrors.messageBody}
        >
          <FormulaBar
            wrapContent={true}
            placeholder="Describe what you want the message to convey..."
            variables={variables}
            defaultInputContent={messageBody?.blocks || []}
            onInputContentChanged={(content) => {
              updateMessageBody(content);
              markFieldTouched("messageBody");
            }}
            hasError={!!validation.touchedErrors.messageBody}
            multiline
            slotProps={{
              container: { "data-testid": "message-body" },
            }}
          />
        </FormSection>
      </SectionCard>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Tone</h3>
        <p className="text-xs text-gray-500">Select the tone for your message</p>
        <div className="grid grid-cols-2 gap-3">
          {TONE_OPTIONS.map((option) => (
            <ToneButton
              key={option.id}
              option={option}
              isSelected={selectedTone === option.id}
              onSelect={setSelectedTone}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Additional Context
        </Label>
        <p className="text-xs text-gray-400">
          Any extra information to help craft the message
        </p>
        <Textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Add any additional context, instructions, or information..."
          className="min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
};

export default ConfigureTab;
