'use client';

export const useDialog = () => {
  const confirm = async (message: string) => {
    // fallback simple confirm for small flows; components exist for richer dialogs
    return Promise.resolve(window.confirm(message));
  };

  return { confirm };
};

export default useDialog;
