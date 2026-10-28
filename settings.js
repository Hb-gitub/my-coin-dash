// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  theme: 'dark',
  // Canvas colours per theme; style.css has the matching page colours under body.light.
  themes: {
    dark: { background: 0x101c31, grid: 0x24334b, panel: 0x0a1120, text: '#ffffff',
      player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a },
    light: { background: 0xeef3f9, grid: 0xb4c2d4, panel: 0xffffff, text: '#14213d',
      player: 0x0f9d84, coin: 0xd99a00, drone: 0xe0384f }
  }
};
