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
  { id: "B02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "BOT revisions synchronized; semantic QA remains separate" },
  { id: "B03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "BOT revisions synchronized; semantic QA remains separate" },
  { id: "B04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "BMT revisions synchronized; semantic QA remains separate" },
  { id: "B05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "BMT revisions synchronized; semantic QA remains separate" },
  { id: "B06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "BCT revisions synchronized; semantic QA remains separate" },
  { id: "B07", dialogueOnly: true, syncSections: true, syncChoices: true, status: "BCT revisions synchronized; semantic QA remains separate" },
  { id: "B08", dialogueOnly: true, syncSections: true, syncChoices: true, status: "B08 review synchronized; full-story QA remains separate" },
  { id: "C01", dialogueOnly: true, syncSections: true, syncChoices: true, syncConditional: true, status: "third-act route manuscripts synchronized" },
  { id: "C02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "TAT revisions synchronized; semantic QA remains separate" },
  { id: "C03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "TAT revisions synchronized; semantic QA remains separate" },
  { id: "C04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "transition revisions synchronized" },
  { id: "C05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "transition revisions synchronized" },
  { id: "C06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "CAT revisions synchronized" },
  { id: "D01", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, syncConditional: true, status: "reviewed; CAT transition checked" },
  { id: "D02", minimum: 2500, pathMinimum: 2500, syncSections: true, syncChoices: true, status: "manuscript/runtime synchronized" },
  { id: "D03", minimum: 2000, pathMinimum: 1800, syncSections: true, syncChoices: true, status: "DOAT/DAIT revisions synchronized; cadence revised below initial reference" },
  { id: "D04", minimum: 2400, pathMinimum: 2200, syncSections: true, syncChoices: true, status: "DAIT and second-pass cadence revisions synchronized below initial length reference" },
  { id: "D05", minimum: 2500, pathMinimum: 2400, syncSections: true, syncChoices: true, status: "second-pass invitation/departure cadence revised below initial path reference" },
  { id: "D06", minimum: 2200, pathMinimum: 2000, syncSections: true, syncChoices: true, status: "second-pass middle cadence revision below initial reference" },
  { id: "D07", minimum: 2500, pathMinimum: 2300, syncSections: true, syncChoices: true, status: "route bridge manuscript/runtime synchronized; second-pass common recap edit" },
  { id: "D08F", minimum: 3000, pathMinimum: 2300, syncSections: true, syncChoices: true, syncConditional: true, status: "second-pass shared-section cadence revision below initial path reference" },
  { id: "D08P", minimum: 2500, pathMinimum: 2300, syncSections: true, syncChoices: true, syncConditional: true, status: "second-pass common-section cadence revision below initial path reference" },
  { id: "D08R", minimum: 2500, pathMinimum: 2300, syncSections: true, syncChoices: true, syncConditional: true, status: "second-pass common-section cadence revision below initial path reference" }
];
