import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/HarRecordingPage.ts',
  output: {
    dir: 'lib',
    format: 'cjs'
  },
  plugins: [typescript()]
};