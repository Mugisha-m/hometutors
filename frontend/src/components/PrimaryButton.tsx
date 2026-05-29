type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

const PrimaryButton = ({ label, ...props }: PrimaryButtonProps) => (
  <button
    {...props}
    className={`rounded-2xl bg-turquoise px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${props.className ?? ""}`}
  >
    {label}
  </button>
);

export default PrimaryButton;
