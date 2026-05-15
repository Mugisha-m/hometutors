type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

const PrimaryButton = ({ label, ...props }: PrimaryButtonProps) => {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-turquoise px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 ${props.className ?? ""}`}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
