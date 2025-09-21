const Footer = () => {
  return (
    <footer className="bg-black text-slate-100 py-2 mt-2">
      <div className="container mx-auto flex justify-between items-center px-2">
        {/* Copyright Section */}
        <p className="text-sm">
          © {new Date().getFullYear()} DEX Hero. All rights reserved.
        </p>

        {/* Social Icons */}
        <div className="flex space-x-4">
          <a
            href="https://x.com/dexherodotfun"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.949.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.719-2.165-10.148-5.144-.423.722-.666 1.561-.666 2.457 0 1.697.865 3.197 2.181 4.075-.803-.026-1.56-.247-2.22-.616v.062c0 2.37 1.685 4.348 3.918 4.798-.41.111-.843.171-1.287.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.415-1.68 1.319-3.809 2.105-6.102 2.105-.395 0-.779-.023-1.17-.067 2.179 1.397 4.768 2.212 7.557 2.212 9.054 0 14-7.496 14-13.986 0-.21 0-.423-.015-.633.961-.695 1.8-1.562 2.46-2.549z" />
            </svg>
          </a>
          <a
            href="https://github.com/Goshen-Digital-Group/its-dex-hero"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >a
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.17c-3.338.726-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.493.997.108-.774.42-1.305.763-1.605-2.665-.3-5.467-1.333-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.123-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405c1.02.005 2.045.137 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.242 2.873.12 3.176.77.84 1.236 1.912 1.236 3.222 0 4.61-2.807 5.625-5.478 5.92.432.372.81 1.102.81 2.222v3.293c0 .32.192.694.8.577C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;