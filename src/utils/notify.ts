import { toast } from 'sonner';

type ToastOpts = Parameters<typeof toast.success>[1];

const withStyle = (base?: ToastOpts, bgVar?: string, fgVar?: string): ToastOpts => ({
  ...(base || {}),
  style: {
    background: bgVar ? `var(${bgVar})` : undefined,
    color: fgVar ? `var(${fgVar})` : undefined,
    ...(base?.style || {})
  }
});

export const notify = {
  success: (message: string, opts?: ToastOpts) =>
    toast.success(message, {
      ...withStyle(opts),
      className: 'berry-toast-success'
    }),
  error: (message: string, opts?: ToastOpts) =>
    toast.error(message, {
      ...withStyle(opts),
      className: 'berry-toast-error'
    }),
  info: (message: string, opts?: ToastOpts) =>
    toast.info(message, {
      ...withStyle(opts),
      className: 'berry-toast-info'
    }),
  warning: (message: string, opts?: ToastOpts) =>
    toast.warning(message, {
      ...withStyle(opts),
      className: 'berry-toast-warning'
    }),
  dismiss: toast.dismiss
};

export default notify;
