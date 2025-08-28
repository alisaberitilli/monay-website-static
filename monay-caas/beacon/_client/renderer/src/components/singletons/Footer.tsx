const Footer: React.FC = () => {
  return (
    <footer className="flex w-full justify-center border-t-2 border-t-white p-2 text-center text-sm font-semibold">
      &#169; 2014 - {new Date().getUTCFullYear()} Tilli Software, All Rights
      Reserved
    </footer>
  );
};

export default Footer;
