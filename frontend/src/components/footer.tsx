import { Heart, Sun } from "lucide-react";
import { Link } from "react-router";

const links = [
  {
    title: "About",
    to: "/#about",
  },
  {
    title: "Contact",
    to: "/#contact",
  },
  {
    title: "Terms of Service",
    to: "/#terms",
  },
  {
    title: "Privacy Policy",
    to: "/#privacy",
  },
];


const Footer = () => {
  return (
    <footer className="border-t bg-background px-6 py-2">
      <div className="mx-auto w-full max-w-screen-2xl divide-y">
        <div className="flex flex-col items-center justify-between gap-4 px-2 pt-3 pb-5 sm:flex-row">
          <Link className="flex items-center gap-2" to="/">
            <Heart />
            <span className="font-medium text-xl">EchoMatch</span>
          </Link>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium text-sm">
            {links.map(({ title, to }) => (
              <li key={title}>
                <Link to={to}>{title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 pt-4 pb-2 sm:flex-row">
          <p className="font-medium text-muted-foreground text-sm">
            Copyright &copy; {new Date().getFullYear()} EchoMatch. All rights
            reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Sun className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link to="/">
              <Sun className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link to="/">
              <Sun className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;