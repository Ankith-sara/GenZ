import { describe, it, expect } from "vitest";
import { STATUS_LABEL, DOC_TYPE_LABEL, DOC_TYPES } from "./verification";

describe("Document Verification Logic Specs", () => {
  it("maps verification status to human readable labels", () => {
    expect(STATUS_LABEL.not_submitted).toBe("Not submitted");
    expect(STATUS_LABEL.pending).toBe("Pending review");
    expect(STATUS_LABEL.verified).toBe("Verified");
    expect(STATUS_LABEL.rejected).toBe("Changes requested");
  });

  it("maps doc types to proper titles", () => {
    expect(DOC_TYPE_LABEL.gst_certificate).toBe("GST Certificate");
    expect(DOC_TYPE_LABEL.factory_photo).toBe("Factory Photo");
  });

  it("contains all required document types", () => {
    expect(DOC_TYPES).toContain("gst_certificate");
    expect(DOC_TYPES).toContain("factory_photo");
  });
});
