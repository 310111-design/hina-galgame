"use strict";

// Explicit opt-ins: keep this small configuration separate from parser/fixtures.
// Early drafts have no declared runtime count; do not apply adult length gates.
module.exports = [
  { id: "P01", dialogueOnly: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "P02", dialogueOnly: true, syncChoices: true, choiceEndMarker: "## P02-A", status: "manuscript/runtime synchronized" },
  { id: "P03", dialogueOnly: true, syncChoices: true, syncConditional: true, status: "manuscript/runtime synchronized" },
  { id: "A01", dialogueOnly: true, syncSections: true, syncChoices: true, status: "early route revisions synchronized" },
  { id: "A02", dialogueOnly: true, syncSections: true, syncChoices: true, syncConditional: true, status: "early route revisions synchronized" },
  { id: "A03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "early route revisions synchronized" },
  { id: "A04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "first-act route manuscripts synchronized" },
  { id: "A05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "first-act route manuscripts synchronized" },
  { id: "A06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "first-act route manuscripts synchronized" },
  { id: "B01", dialogueOnly: true, syncSections: true, syncChoices: true, syncConditional: true, status: "second-act route manuscripts synchronized" },
  { id: "B02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B07", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B08", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C01", dialogueOnly: true, syncSections: true, syncChoices: true, syncConditional: true, status: "third-act route manuscripts synchronized" },
  { id: "C02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "transition revisions synchronized" },
  { id: "C05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "transition revisions synchronized" },
  { id: "C06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "CAT revisions synchronized" },
  { id: "D01", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, syncConditional: true, status: "reviewed; CAT transition checked" },
  { id: "D02", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "D03", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "DOAT/DAIT revisions synchronized" },
  { id: "D04", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "DAIT revisions synchronized" },
  { id: "D05", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "D06", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "route bridge manuscript/runtime synchronized" },
  { id: "D07", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "route bridge manuscript/runtime synchronized" },
  { id: "D08F", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, syncConditional: true, status: "reviewed draft" },
  { id: "D08P", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, syncConditional: true, status: "reviewed draft" },
  { id: "D08R", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, syncConditional: true, status: "reviewed draft" }
];
