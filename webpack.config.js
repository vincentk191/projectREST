const webpack = require('webpack');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');

const ocnfig = [
    entry: SRC_DIR + '/app/',
    output: {
        path:,
        filename:,
        publicPath: '/app/'
    },
    modules: {
        loaders: [
            {

            }
        ]
    }
]
