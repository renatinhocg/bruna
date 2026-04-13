'use client';

import { notification } from 'antd';

export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showSuccess = (message: string, description?: string) => {
    api.success({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  const showError = (message: string, description?: string) => {
    api.error({
      message,
      description,
      placement: 'topRight',
      duration: 4,
    });
  };

  const showInfo = (message: string, description?: string) => {
    api.info({
      message,
      description,
      placement: 'topRight',
      duration: 3,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    contextHolder
  };
};
