"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BodyPartSelector, type BodyPart } from "./BodyPartSelector";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Step = "body-part" | "condition-info" | "impact" | "limitations" | "status" | "review";

interface FormData {
  bodyPart: BodyPart | null;
  conditionName: string;
  laterality: string;
  diagnosisStatus: string;
  symptoms: string;
  functionalImpactNarrative: string;
  activity: string;
  limitationDescription: string;
  thresholdValue: string;
  thresholdUnit: string;
  frequency: string;
  severity: string;
  claimStatus: string;
  examStatus: string;
  memberPrimaryTheory: string;
  memberAlternateTheory: string;
  secondaryConditionId: string;
}

const STEP_LABELS: Record<Step, string> = {
  "body-part": "1. Select Location",
  "condition-info": "2. Condition Info",
  "impact": "3. Functional Impact",
  "limitations": "4. Limitations",
  "status": "5. Claim Status",
  "review": "6. Review & Save",
};

export function VaConditionFormGuided({ conditions = [] }: { conditions?: { id: string; conditionName: string }[] }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("body-part");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    bodyPart: null,
    conditionName: "",
    laterality: "",
    diagnosisStatus: "",
    symptoms: "",
    functionalImpactNarrative: "",
    activity: "",
    limitationDescription: "",
    thresholdValue: "",
    thresholdUnit: "",
    frequency: "",
    severity: "",
    claimStatus: "",
    examStatus: "",
    memberPrimaryTheory: "",
    memberAlternateTheory: "",
    secondaryConditionId: "",
  });

  const steps: Step[] = ["body-part", "condition-info", "impact", "limitations", "status", "review"];
  const currentStepIndex = steps.indexOf(currentStep);

  const canGoNext = () => {
    switch (currentStep) {
      case "body-part":
        return !!formData.bodyPart;
      case "condition-info":
        return !!formData.conditionName;
      case "impact":
        return !!formData.functionalImpactNarrative;
      case "limitations":
        return !!formData.activity && !!formData.limitationDescription;
      case "status":
        return true; // Status is optional
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
      setError(null);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if (value) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBodyPartSelect = (part: BodyPart) => {
    setFormData((prev) => ({ ...prev, bodyPart: part }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch("/api/va-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionName: formData.conditionName,
          bodySystem: formData.bodyPart?.bodySystem,
          bodyRegion: formData.bodyPart?.region,
          laterality: formData.laterality || undefined,
          diagnosisStatus: formData.diagnosisStatus || undefined,
          symptoms: formData.symptoms || undefined,
          functionalImpactNarrative: formData.functionalImpactNarrative,
          claimStatus: formData.claimStatus || undefined,
          examStatus: formData.examStatus || undefined,
          memberPrimaryTheory: formData.memberPrimaryTheory || undefined,
          memberAlternateTheory: formData.memberAlternateTheory || undefined,
          secondaryConditionId: formData.secondaryConditionId || undefined,
          limitations:
            formData.activity && formData.limitationDescription
              ? [
                  {
                    activity: formData.activity,
                    limitationDescription: formData.limitationDescription,
                    thresholdValue: formData.thresholdValue
                      ? Number(formData.thresholdValue)
                      : undefined,
                    thresholdUnit: formData.thresholdUnit || undefined,
                    frequency: formData.frequency || undefined,
                    severity: formData.severity || undefined,
                  },
                ]
              : [],
        }),
      });

      setSaving(false);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Unable to save condition");
        return;
      }

      setSuccess("Condition saved successfully!");
      setTimeout(() => {
        router.refresh();
        // Reset form
        setFormData({
          bodyPart: null,
          conditionName: "",
          laterality: "",
          diagnosisStatus: "",
          symptoms: "",
          functionalImpactNarrative: "",
          activity: "",
          limitationDescription: "",
          thresholdValue: "",
          thresholdUnit: "",
          frequency: "",
          severity: "",
          claimStatus: "",
          examStatus: "",
          memberPrimaryTheory: "",
          memberAlternateTheory: "",
          secondaryConditionId: "",
        });
        setCurrentStep("body-part");
      }, 1500);
    } catch {
      setSaving(false);
      setError("Failed to save condition. Please try again.");
    }
  };

  return (
    <Panel title="Add condition" description="Complete the steps below to track a new condition.">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Step indicators */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              disabled={index > currentStepIndex && !canGoNext()}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all ${
                step === currentStep
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-600"
                  : index < currentStepIndex
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600 opacity-50"
              }`}
            >
              {STEP_LABELS[step]}
            </button>
          ))}
        </div>

        {/* Step: Body Part Selection */}
        {currentStep === "body-part" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-4">Where is your injury or condition?</h3>
              <BodyPartSelector
                selectedPart={formData.bodyPart}
                onSelect={handleBodyPartSelect}
              />
            </div>
          </div>
        )}

        {/* Step: Condition Info */}
        {currentStep === "condition-info" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-4">Tell us about your condition</h3>
              <div className="bg-emerald-50 p-3 rounded mb-4 border border-emerald-200">
                <p className="text-sm">
                  <strong>Location:</strong> {formData.bodyPart?.name} ({formData.bodyPart?.bodySystem})
                </p>
              </div>
            </div>

            <Field
              name="conditionName"
              label="Condition name"
              placeholder="e.g., knee arthritis, lower back pain"
              value={formData.conditionName}
              onChange={handleInputChange}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms or observations</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="What symptoms do you experience? (optional)"
                rows={3}
                value={formData.symptoms}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosisStatus">Diagnosis status</Label>
              <Select value={formData.diagnosisStatus || ""} onValueChange={(value) => handleSelectChange("diagnosisStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_diagnosed">Not diagnosed</SelectItem>
                  <SelectItem value="self_diagnosed">Self-diagnosed</SelectItem>
                  <SelectItem value="service_diagnosed">Diagnosed by military</SelectItem>
                  <SelectItem value="va_diagnosed">Diagnosed by VA</SelectItem>
                  <SelectItem value="civilian_diagnosed">Diagnosed by civilian provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="laterality">Side or laterality</Label>
              <Select value={formData.laterality || ""} onValueChange={(value) => handleSelectChange("laterality", value)}>
                <SelectTrigger id="laterality">
                  <SelectValue placeholder="Select if applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="bilateral">Both sides</SelectItem>
                  <SelectItem value="midline">Midline</SelectItem>
                  <SelectItem value="unspecified">Not specified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step: Functional Impact */}
        {currentStep === "impact" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-4">How does this affect your daily life?</h3>
              <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                <p className="text-sm">
                  <strong>Condition:</strong> {formData.conditionName}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="functionalImpactNarrative">Functional impact narrative</Label>
              <Textarea
                id="functionalImpactNarrative"
                name="functionalImpactNarrative"
                placeholder="Describe how this condition affects your work, daily activities, or quality of life. Example: &quot;Limits walking to about 0.5 miles before needing to rest.&quot;"
                rows={5}
                value={formData.functionalImpactNarrative}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific and honest about your limitations. This helps you and VA evaluators understand the impact.
              </p>
            </div>
          </div>
        )}

        {/* Step: Limitations */}
        {currentStep === "limitations" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-4">Specific limitations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a specific activity and how it&apos;s limited. You can add more later.
              </p>
            </div>

            <Field
              name="activity"
              label="Activity"
              placeholder="e.g., walking, standing, sitting, lifting"
              value={formData.activity}
              onChange={handleInputChange}
              required
            />

            <Field
              name="limitationDescription"
              label="How is it limited?"
              placeholder="e.g., can only walk short distances"
              value={formData.limitationDescription}
              onChange={handleInputChange}
              required
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                name="thresholdValue"
                label="Threshold value"
                type="number"
                step="0.1"
                placeholder="e.g., 0.5"
                value={formData.thresholdValue}
                onChange={handleInputChange}
              />

              <Field
                name="thresholdUnit"
                label="Unit"
                placeholder="e.g., miles, hours, minutes"
                value={formData.thresholdUnit}
                onChange={handleInputChange}
              />

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency || ""} onValueChange={(value) => handleSelectChange("frequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="constant">Constant</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="several_times_week">Several times per week</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity || ""} onValueChange={(value) => handleSelectChange("severity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step: Claim Status */}
        {currentStep === "status" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-4">VA claim status</h3>
              <p className="text-sm text-muted-foreground mb-4">Track your VA claim progress (optional).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claimStatus">Claim status</Label>
              <Select value={formData.claimStatus || ""} onValueChange={(value) => handleSelectChange("claimStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select claim status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_filed">Not filed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="appealed">Appealed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examStatus">Exam status</Label>
              <Select value={formData.examStatus || ""} onValueChange={(value) => handleSelectChange("examStatus", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_scheduled">Not scheduled</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="results_pending">Results pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TheoryField label="My primary relationship theory" name="memberPrimaryTheory" value={formData.memberPrimaryTheory} onChange={handleSelectChange} />
              <TheoryField label="My alternate relationship theory" name="memberAlternateTheory" value={formData.memberAlternateTheory} onChange={handleSelectChange} />
            </div>
            {formData.memberPrimaryTheory === "secondary" ? (
              <div className="space-y-2">
                <Label htmlFor="secondaryConditionId">Related VA condition</Label>
                <select id="secondaryConditionId" value={formData.secondaryConditionId} onChange={(event) => handleSelectChange("secondaryConditionId", event.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
                  <option value="">Select a tracked condition</option>
                  {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.conditionName}</option>)}
                </select>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">These are your selected theories only. They do not mean VA has determined service connection.</p>
          </div>
        )}

        {/* Step: Review */}
        {currentStep === "review" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-4">Review your condition</h3>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">LOCATION</p>
                <p className="font-medium">{formData.bodyPart?.name}</p>
                <p className="text-xs text-muted-foreground">{formData.bodyPart?.bodySystem}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">CONDITION</p>
                <p className="font-medium">{formData.conditionName}</p>
                {formData.diagnosisStatus && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {formData.diagnosisStatus}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">FUNCTIONAL IMPACT</p>
                <p className="text-sm">{formData.functionalImpactNarrative}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground">PRIMARY LIMITATION</p>
                <p className="text-sm">
                  <strong>{formData.activity}:</strong> {formData.limitationDescription}
                  {formData.thresholdValue && ` (${formData.thresholdValue} ${formData.thresholdUnit})`}
                </p>
              </div>

              {formData.claimStatus && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">CLAIM STATUS</p>
                  <Badge variant="secondary">{formData.claimStatus}</Badge>
                </div>
              )}
            </div>

            <Alert>
              <AlertDescription>
                This information helps you track your condition and prepare for VA conversations. It will be saved privately in your retirement planner.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="size-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-3">
            {currentStep === "review" ? (
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? "Saving..." : "Save condition"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                Next
                <ChevronRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Panel>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  step,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function TheoryField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void }) {
  const options = [
    ["direct_in_service", "Direct/In-service"],
    ["presumptive", "Presumptive"],
    ["secondary", "Secondary"],
    ["pre_service_aggravated", "Pre-service aggravated"],
    ["unsure_needs_review", "Unsure/Needs review"],
  ];
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} value={value} onChange={(event) => onChange(name, event.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
        <option value="">Not selected</option>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </div>
  );
}
