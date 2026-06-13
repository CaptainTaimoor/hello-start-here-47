import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      theme="dark"
      position="bottom-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast relative !rounded-2xl !border-white/10 !bg-card/60 !text-foreground !backdrop-blur-2xl !backdrop-saturate-150 !shadow-[0_1px_0_0_rgb(255_255_255/0.1)_inset,0_24px_60px_-20px_rgb(0_0_0/0.6),inset_4px_0_0_0_color-mix(in_oklab,var(--primary)_70%,transparent)] data-[type=success]:!shadow-[0_1px_0_0_rgb(255_255_255/0.1)_inset,0_24px_60px_-20px_rgb(0_0_0/0.6),inset_4px_0_0_0_oklch(0.78_0.17_205),0_0_40px_-10px_oklch(0.78_0.17_205/0.4)] data-[type=error]:!shadow-[0_1px_0_0_rgb(255_255_255/0.1)_inset,0_24px_60px_-20px_rgb(0_0_0/0.6),inset_4px_0_0_0_oklch(0.66_0.21_22),0_0_40px_-10px_oklch(0.66_0.21_22/0.4)]",
          title: "!font-medium tracking-tight",
          description: "!text-muted-foreground !text-xs",
          icon: "drop-shadow-[0_0_8px_var(--primary)]",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
