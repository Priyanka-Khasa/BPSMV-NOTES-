import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, message, duration = 3600 }) => {
    const id = toastIdRef.current + 1;
    toastIdRef.current = id;
    setToasts((current) => [...current, { id, type, title, message }].slice(-4));
    window.setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const confirmAction = useCallback((options) => new Promise((resolve) => {
    setConfirmState({
      title: options?.title || 'Are you sure?',
      message: options?.message || 'This action cannot be undone.',
      confirmLabel: options?.confirmLabel || 'Confirm',
      cancelLabel: options?.cancelLabel || 'Cancel',
      tone: options?.tone || 'danger',
      resolve
    });
  }), []);

  const closeConfirm = useCallback((answer) => {
    setConfirmState((current) => {
      current?.resolve(Boolean(answer));
      return null;
    });
  }, []);

  const value = useMemo(() => ({ toast, confirmAction }), [toast, confirmAction]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-3 top-20 z-[70] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-3 sm:right-5">
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const Icon = isSuccess ? CheckCircle2 : AlertCircle;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl animate-slide-down ${
                isSuccess ? 'border-brand-200 text-brand-800' : 'border-red-200 text-red-800'
              }`}
              role="status"
            >
              <Icon size={18} className={isSuccess ? 'mt-0.5 text-brand-600' : 'mt-0.5 text-red-600'} />
              <div className="min-w-0 flex-1">
                {item.title && <p className="text-sm font-semibold">{item.title}</p>}
                {item.message && <p className="text-sm leading-5 text-slate-600">{item.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss message"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-scale-in">
            <div className="flex items-start gap-3">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                confirmState.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
              }`}>
                <AlertCircle size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">{confirmState.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{confirmState.message}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => closeConfirm(false)} className="btn btn-secondary px-4 py-2 text-sm">
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`${confirmState.tone === 'danger' ? 'btn btn-danger' : 'btn btn-primary'} px-4 py-2 text-sm`}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
