import typescript from '@rollup/plugin-typescript'
// import { main, module } from './package.json'
export default {
  "input": "./src/index.ts",
  "output": [
    {
      format: "cjs",
      file: "lib/guide-mini-vue.cjs.js"
    },
    {
      format: "es",
      file: "lib/guide-mini-vue.esm.js"
    }
  ],
  plugins: [
    typescript(),]
}