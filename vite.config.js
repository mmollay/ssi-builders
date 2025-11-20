import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'SSIBuilders',
            formats: ['es', 'umd'],
            fileName: (format) => `ssi-builders.${format}.js`
        },
        rollupOptions: {
            output: {
                assetFileNames: 'ssi-builders.[ext]'
            }
        },
        outDir: 'dist',
        sourcemap: true
    },
    server: {
        port: 5175,
        open: '/examples/demo.html'
    }
});
