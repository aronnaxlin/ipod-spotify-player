export enum Sounds {
  BUTTON_CLICK = 'click',
  IPOD_CLICK_WHEEL = 'wheel',
}

export const useSound = (sound: string) => {
  return {
    play: () => {
      // Logic to play sound
      // console.log(`Playing sound: ${sound}`);
    }
  };
};
