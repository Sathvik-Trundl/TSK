import { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
};

const Card = ({ title, children }: CardProps) => {
  return (
    <div className="border rounded-md p-4">
      <h2 className="font-medium mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default Card;
