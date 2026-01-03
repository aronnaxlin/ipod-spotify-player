export const useVibration = (duration: number, pattern?: number) => {
  return () => {
    // console.log('Vibrating', duration);
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
  };
};
