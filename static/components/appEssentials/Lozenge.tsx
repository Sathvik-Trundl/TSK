// components/Lozenge.tsx
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";

interface Props {
  phase: Phase;
}

const phaseToAppearance: Record<Phase, ThemeAppearance> = {
  Draft: "default",
  "Validation Pending": "inprogress",
  "Valdation Rejected": "removed",
  "Validation Approved": "success",
  Planned: "new",
  "In-Progress": "inprogress",
  "In-Discussion": "moved",
  Approved: "success",
  Rejected: "removed",
};

const PhaseLozenge: React.FC<Props> = ({ phase }) => {
  return <Lozenge appearance={phaseToAppearance[phase]} isBold>{phase}</Lozenge>;
};

export default PhaseLozenge;
