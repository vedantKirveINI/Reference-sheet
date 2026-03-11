import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Users, FileText } from "lucide-react";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { TONE_OPTIONS, getComposerTemplateById } from "../constants";

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
      <Icon size={18} className="text-purple-600" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const FormField = ({ label, description, required, error, children }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-900">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {description && <p className="text-xs text-gray-400">{description}</p>}
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const ToneButton = ({ option, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={cn(
      "p-3 rounded-xl border transition-all text-left",
      isSelected
        ? "border-purple-600 bg-purple-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    )}
  >
    <span className="text-sm font-medium text-gray-900">{option.label}</span>
    <p className="text-xs text-gray-500">{option.description}</p>
  </button>
);

const ConfigureTab = ({ state, variables }) => {
  const {
    selectedTemplateId,
    senderName,
    senderEmail,
    senderCompany,
    recipientName,
    recipientEmail,
    recipientCompany,
    messageSubject,
    messageBody,
    selectedTone,
    additionalContext,
    validation,
    updateSenderName,
    updateSenderEmail,
    updateSenderCompany,
    updateRecipientName,
    updateRecipientEmail,
    updateRecipientCompany,
    updateMessageSubject,
    updateMessageBody,
    setSelectedTone,
    setAdditionalContext,
  } = state;

  const template = selectedTemplateId
    ? getComposerTemplateById(selectedTemplateId)
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: template.iconBg }}
            >
              <span className="text-white text-lg">✉️</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {template.label}
              </h3>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <SectionHeader
            icon={User}
            title="Sender Details"
            description="Information about who is sending the message"
          />

          <FormField label="Sender Name">
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
          </FormField>

          <FormField label="Sender Email">
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
          </FormField>

          <FormField
            label="Sender Company"
            required
            error={validation.errors.senderCompany}
          >
            <FormulaBar
              wrapContent={true}
              placeholder="e.g., Acme Corp"
              variables={variables}
              defaultInputContent={senderCompany?.blocks || []}
              onInputContentChanged={(content) => {
                updateSenderCompany(content);
              }}
              slotProps={{
                container: { "data-testid": "sender-company" },
              }}
            />
          </FormField>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <SectionHeader
            icon={Users}
            title="Recipient Details"
            description="Information about who will receive the message"
          />

          <FormField label="Recipient Name">
            <FormulaBar
              wrapContent={true}
              placeholder="e.g., {{contact.name}} or Jane Doe"
              variables={variables}
              defaultInputContent={recipientName?.blocks || []}
              onInputContentChanged={(content) => {
                updateRecipientName(content);
              }}
              slotProps={{
                container: { "data-testid": "recipient-name" },
              }}
            />
          </FormField>

          <FormField
            label="Recipient Email"
            required
            error={validation.errors.recipientEmail}
          >
            <FormulaBar
              wrapContent={true}
              placeholder="e.g., {{contact.email}}"
              variables={variables}
              defaultInputContent={recipientEmail?.blocks || []}
              onInputContentChanged={(content) => {
                updateRecipientEmail(content);
              }}
              slotProps={{
                container: { "data-testid": "recipient-email" },
              }}
            />
          </FormField>

          <FormField label="Recipient Company">
            <FormulaBar
              wrapContent={true}
              placeholder="e.g., {{prospect.company}}"
              variables={variables}
              defaultInputContent={recipientCompany?.blocks || []}
              onInputContentChanged={(content) => {
                updateRecipientCompany(content);
              }}
              slotProps={{
                container: { "data-testid": "recipient-company" },
              }}
            />
          </FormField>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <SectionHeader
            icon={FileText}
            title="Message Content"
            description="Compose your message with dynamic variables"
          />

          <FormField
            label="Subject"
            description="The subject line of your message"
            required
            error={validation.errors.messageSubject}
          >
            <FormulaBar
              wrapContent={true}
              placeholder="e.g., Following up on our conversation, {{contact.name}}"
              variables={variables}
              defaultInputContent={messageSubject?.blocks || []}
              onInputContentChanged={(content) => {
                updateMessageSubject(content);
              }}
              slotProps={{
                container: { "data-testid": "message-subject" },
              }}
            />
          </FormField>

          <FormField
            label="Message Body"
            description="The main content of your message"
            required
            error={validation.errors.messageBody}
          >
            <FormulaBar
              wrapContent={true}
              placeholder="Write your message here. Use variables like {{contact.name}} for personalization..."
              variables={variables}
              defaultInputContent={messageBody?.blocks || []}
              onInputContentChanged={(content) => {
                updateMessageBody(content);
              }}
              slotProps={{
                container: {
                  "data-testid": "message-body",
                  style: { minHeight: "120px" },
                },
              }}
            />
          </FormField>

          <FormField
            label="Tone"
            description="Select the tone for your message"
          >
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((option) => (
                <ToneButton
                  key={option.id}
                  option={option}
                  isSelected={selectedTone === option.id}
                  onSelect={setSelectedTone}
                />
              ))}
            </div>
          </FormField>

          <FormField
            label="Additional Context"
            description="Any extra context to help personalize the message"
          >
            <Textarea
              placeholder="e.g., We recently met at a conference, the recipient showed interest in our product..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="min-h-[80px] rounded-xl border-gray-300 resize-none"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
