import React from "react";

interface DonationAddressProps {
  address?: string;
}

const DonationAddress: React.FC<DonationAddressProps> = ({
  address = "your-donation-address-here",
}) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };
  return (
    <div className="mb-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700 flex flex-col items-center">
      <span className="font-semibold text-lg mb-1">Support Us!</span>
      <button
        type="button"
        onClick={handleCopy}
        className="break-all font-mono text-base bg-transparent border-none cursor-pointer text-yellow-900 dark:text-yellow-200 hover:underline focus:outline-none"
        title="Click to copy address"
        aria-label={`Copy donation address ${address}`}
      >
        {address}
        {copied && (
          <span className="ml-2 text-xs rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20 px-1.5 py-0.5">
            Copied
          </span>
        )}
      </button>
      <span className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
        Donations are appreciated 🙏
      </span>
    </div>
  );
};

export default DonationAddress;
