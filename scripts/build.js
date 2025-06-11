const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const Dotenv = require('dotenv-webpack');

// Ensure the dist directory exists
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy static files
const staticFiles = ['manifest.json', 'assets'];
staticFiles.forEach(file => {
    const sourcePath = path.resolve(__dirname, '..', file);
    const destPath = path.resolve(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        if (fs.lstatSync(sourcePath).isDirectory()) {
            fs.cpSync(sourcePath, destPath, { recursive: true });
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    }
});

// Copy HTML and CSS files
const sourceDir = path.resolve(__dirname, '../src');
const copyFiles = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const sourcePath = path.join(dir, file);
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
            copyFiles(sourcePath);
        } else if (file.endsWith('.html') || file.endsWith('.css')) {
            const relativePath = path.relative(sourceDir, dir);
            const targetDir = path.join(distDir, 'src', relativePath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            fs.copyFileSync(sourcePath, path.join(targetDir, file));
        }
    });
};
copyFiles(sourceDir);

// Webpack configuration
const config = {
    mode: 'production',
    entry: {
        popup: './src/popup/popup.js',
        background: './src/background/background.js',
        content: './src/content/content.js'
    },
    output: {
        path: path.resolve(distDir, 'src'),
        filename: '[name]/[name].js'
    },
    resolve: {
        fallback: {
            "path": false,
            "os": false,
            "crypto": false,
            "fs": false
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(require('dotenv').config().parsed || {})
        })
    ]
};

// Run webpack
webpack(config, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.error(err || stats.toString({
            chunks: false,
            colors: true
        }));
        process.exit(1);
    }

    console.log(stats.toString({
        chunks: false,
        colors: true
    }));
}); 