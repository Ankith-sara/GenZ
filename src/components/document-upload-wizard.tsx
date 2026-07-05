"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type {
  DocType,
  ManufacturerDocument,
  VerificationStatus,
} from "@/types/database";
import { STATUS_LABEL } from "@/lib/verification";
import { submitForVerification } from "@/app/dashboard/manufacturer/onboarding/actions";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";

type WizardStep = {
  docType: DocType;
  title: string;
  description: string;
  required: boolean;
};

const STEPS: WizardStep[] = [
  {
    docType: "gst_certificate",
    title: "GST Certificate",
    description:
      "Upload your GST registration certificate. This is required for verification.",
    required: true,
  },
  {
    docType: "factory_photo",
    title: "Factory Photos",
    description:
      "Add at least one photo of your factory or workshop floor — this is what builds buyer trust.",
    required: true,
  },
  {
    docType: "quality_certificate",
    title: "Quality Certificates",
    description:
      "Optional — ISI, ISO, toy safety certificates, or similar, if you have them.",
    required: false,
  },
];

function docsOfType(documents: ManufacturerDocument[], docType: DocType) {
  return documents.filter((d) => d.doc_type === docType);
}

function StepUploader({
  manufacturerId,
  docType,
  documents,
  onChange,
}: {
  manufacturerId: string;
  docType: DocType;
  documents: ManufacturerDocument[];
  onChange: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const docs = docsOfType(documents, docType);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File must be under 10MB.");
      return;
    }

    setStatus("uploading");
    setError(null);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${manufacturerId}/${docType}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("manufacturer-documents")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("manufacturer_documents")
      .insert({
        manufacturer_id: manufacturerId,
        doc_type: docType,
        file_path: path,
        file_name: file.name,
      });

    if (insertError) {
      setStatus("error");
      setError(insertError.message);
      return;
    }

    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange();
  }

  async function handleDelete(doc: ManufacturerDocument) {
    setPendingDeleteId(doc.id);
    const supabase = createClient();
    await supabase.storage.from("manufacturer-documents").remove([doc.file_path]);
    await supabase.from("manufacturer_documents").delete().eq("id", doc.id);
    setPendingDeleteId(null);
    onChange();
  }

  return (
    <div>
      {docs.length > 0 && (
        <ul className="divide-border border-border bg-card mb-4 divide-y rounded-[4px] border">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-4 p-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#2f5c3a]" aria-hidden="true" />
                <span className="truncate">{doc.file_name}</span>
              </span>
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                disabled={pendingDeleteId === doc.id}
                aria-label={`Remove ${doc.file_name}`}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="file:border-foreground text-sm file:mr-3 file:h-10 file:rounded-[4px] file:border file:bg-transparent file:px-3 file:text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={status === "uploading"}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {status === "uploading" ? "Uploading…" : "Upload"}
        </Button>
      </form>
      <p className="text-muted-foreground mt-1.5 text-xs">
        PDF, JPG, PNG, or WebP. Up to 10MB.
      </p>
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export function DocumentUploadWizard({
  manufacturerId,
  initialDocuments,
  verificationStatus,
}: {
  manufacturerId: string;
  initialDocuments: ManufacturerDocument[];
  verificationStatus: VerificationStatus;
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [stepIndex, setStepIndex] = useState(0);
  const isReviewStep = stepIndex === STEPS.length;

  function refresh() {
    router.refresh();
  }

  const gstDone = docsOfType(documents, "gst_certificate").length > 0;
  const factoryDone = docsOfType(documents, "factory_photo").length > 0;
  const canSubmit = gstDone && factoryDone;
  const alreadySubmitted =
    verificationStatus === "pending" || verificationStatus === "verified";

  return (
    <div>
      {/* Step indicator */}
      <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        {[
          ...STEPS,
          { title: "Review", docType: null, description: "", required: false },
        ].map((step, i) => (
          <li key={step.title} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                i === stepIndex
                  ? "border-foreground bg-foreground text-background"
                  : i < stepIndex
                    ? "border-[#2f5c3a] bg-[#e4efe1] text-[#2f5c3a]"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < stepIndex ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                i + 1
              )}
            </span>
            <span className={i === stepIndex ? "font-medium" : "text-muted-foreground"}>
              {step.title}
            </span>
            {i < STEPS.length && <span className="text-muted-foreground">→</span>}
          </li>
        ))}
      </ol>

      {!isReviewStep ? (
        <div className="border-border bg-card rounded-[4px] border p-6">
          <h3 className="text-lg">{STEPS[stepIndex].title}</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm">
            {STEPS[stepIndex].description}
          </p>

          <StepUploader
            manufacturerId={manufacturerId}
            docType={STEPS[stepIndex].docType}
            documents={documents}
            onChange={() => {
              refresh();
              setDocuments((prev) => [...prev]);
            }}
          />

          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                STEPS[stepIndex].required &&
                docsOfType(documents, STEPS[stepIndex].docType).length === 0
              }
              onClick={() => setStepIndex((s) => s + 1)}
            >
              {stepIndex === STEPS.length - 1 ? "Review" : "Next"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-border bg-card rounded-[4px] border p-6">
          <h3 className="text-lg">Review &amp; submit</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check
                className={`h-4 w-4 ${gstDone ? "text-[#2f5c3a]" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
              GST Certificate — {gstDone ? "uploaded" : "missing"}
            </li>
            <li className="flex items-center gap-2">
              <Check
                className={`h-4 w-4 ${factoryDone ? "text-[#2f5c3a]" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
              Factory Photos — {factoryDone ? "uploaded" : "missing"}
            </li>
            <li className="flex items-center gap-2">
              <Check
                className={`h-4 w-4 ${
                  docsOfType(documents, "quality_certificate").length > 0
                    ? "text-[#2f5c3a]"
                    : "text-muted-foreground"
                }`}
                aria-hidden="true"
              />
              Quality Certificates —{" "}
              {docsOfType(documents, "quality_certificate").length > 0
                ? "uploaded"
                : "skipped"}
            </li>
          </ul>

          {alreadySubmitted ? (
            <p className="text-muted-foreground mt-6 text-sm">
              Current status:{" "}
              <span className="font-medium">{STATUS_LABEL[verificationStatus]}</span>
            </p>
          ) : (
            <form action={submitForVerification} className="mt-6">
              <Button type="submit" disabled={!canSubmit}>
                Submit for Verification
              </Button>
              {!canSubmit && (
                <p className="text-muted-foreground mt-2 text-xs">
                  GST certificate and at least one factory photo are required first.
                </p>
              )}
            </form>
          )}

          <div className="mt-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStepIndex(STEPS.length - 1)}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
