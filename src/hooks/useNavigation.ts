import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { setCurrentView, setLoading } from '../redux/states/navigation';

export const useNavigation = () => {
  const dispatch = useAppDispatch();
  const { currentView, isLoading } = useAppSelector((state) => state.navigation);

  const navigateTo = useCallback((view: string) => {
    dispatch(setLoading(true));
    // Simulate navigation delay
    setTimeout(() => {
      dispatch(setCurrentView(view));
      dispatch(setLoading(false));
    }, 300);
  }, [dispatch]);

  const setNavigationLoading = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  return {
    currentView,
    isLoading,
    navigateTo,
    setNavigationLoading,
  };
};