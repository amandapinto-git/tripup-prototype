import { ForkKnife, Bed, AirplaneTilt, Ticket, Question } from '@phosphor-icons/react';

const MAP = {
  food: ForkKnife,
  stay: Bed,
  transport: AirplaneTilt,
  activities: Ticket,
};

export default function CategoryIcon({ category, size = 20, ...rest }) {
  const Icon = MAP[category] || Question;
  return <Icon size={size} {...rest} />;
}
