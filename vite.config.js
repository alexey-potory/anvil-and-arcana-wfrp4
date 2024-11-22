import { defineConfig } from 'vite';
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

                copySrcFolder('src/art');
                copySrcFolder('src/templates');
                copySrcFolder('src/styles');
                copySrcFolder('src/lang');
            }, 1000)
        }
    }
}

export default defineConfig({
    plugins: [
        moduleCopyPlugin()
    ],
    build: {
        minify: true,
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
