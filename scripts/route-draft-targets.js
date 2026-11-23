"use strict";

// Explicit opt-ins: keep this small configuration separate from parser/fixtures.
// Early drafts have no declared runtime count; do not apply adult length gates.
module.exports = [
  { id: "P01", dialogueOnly: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "P02", dialogueOnly: true, syncChoices: true, choiceEndMarker: "## P02-A", status: "manuscript/runtime synchronized" },
  { id: "P03", dialogueOnly: true, syncChoices: true, syncConditional: true, status: "manuscript/runtime synchronized" },
  { id: "A01", dialogueOnly: true, status: "continuity review; fixes pending" },
  { id: "A02", dialogueOnly: true, status: "continuity review; fixes pending" },
  { id: "A03", dialogueOnly: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "A04", dialogueOnly: true, syncSections: true, status: "continuity review; fixes pending" },
  { id: "A05", dialogueOnly: true, syncSections: true, status: "continuity review; fixes pending" },
  { id: "A06", dialogueOnly: true, syncSections: true, status: "continuity review; fixes pending" },
  { id: "B01", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B07", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B08", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C01", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "transition revisions synchronized" },
  { id: "C05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "transition revisions synchronized" },
  { id: "C06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "CAT revisions synchronized" },
  { id: "D01", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "reviewed; CAT transition checked" },
  { id: "D02", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "D03", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "DOAT/DAIT revisions synchronized" },
  { id: "D04", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "DAIT revisions synchronized" },
  { id: "D05", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "D06", minimum: 2500, pathMinimum: 2500, status: "route bridge draft" },
  { id: "D07", minimum: 2500, pathMinimum: 2500, status: "route bridge draft" },
  { id: "D08F", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "reviewed draft" },
  { id: "D08P", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "reviewed draft" },
  { id: "D08R", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "reviewed draft" }
];
