import { defineConfig } from 'vite';
import fs from "fs-extra";
import {copySrcFile, copySrcFolder} from "./buildUtils";

function fileMarkerPlugin() {
    return {
        name: 'file-marker-plugin',

        transform(code, id) {
            const path = require('path');

            const basePath = __dirname;
            const relative = path.relative(basePath + '/src', id);

            const comment = `/*! --- ${relative} --- */\n`;
            return {
                code: comment + code,
                map: null
            };
        }
    };
}

function moduleCopyPlugin() {
    return {
        name: 'copy-files',
        apply: 'build',

        buildEnd() {
            setTimeout(() => {
                const path = require('path');

                copySrcFile('src/module.json');

                copySrcFolder('src/templates');
                copySrcFolder('src/styles');

                const modulesPath = path.join(process.env.LOCALAPPDATA, '/FoundryVTT/Data/modules/anvil-and-arcana-wfrp4');

                fs.ensureDirSync(modulesPath);

                const srcDir = path.resolve(__dirname, 'dist');

                fs.copySync(srcDir, modulesPath);
                console.log('Module files copied to:', modulesPath);
            }, 1000)
        }
    }
}

export default defineConfig({
    plugins: [
        fileMarkerPlugin(),
        moduleCopyPlugin()
    ],
    build: {
        minify: false,
        rollupOptions: {
            input: {
                common: './src/init.ts',
            },
            output: {
                entryFileNames: 'anvil-and-arcana.js'
            },
            external: [
                "plugins/foundry.js"
            ]
        },
        outDir: 'dist',
        emptyOutDir: false
    },
});
