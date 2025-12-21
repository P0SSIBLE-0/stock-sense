import Link from "next/link";

const FooterLink = ({ text, linkText, href }: FooterLinkProps) => {
    return (
        <div className="text-center pt-4 ">
            <p className="testsm text-gray-500">{text + " "}
                <Link className="text-gray-400 hover:text-gray-200" href={href}>{linkText}</Link>
            </p>

        </div>
    );
};
export default FooterLink;