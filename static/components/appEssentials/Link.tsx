import { useNavigate } from "react-router";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const Link: React.FC<Props> = ({ href, children, className }) => {
  const navigate = useNavigate();
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
};

export default Link;
