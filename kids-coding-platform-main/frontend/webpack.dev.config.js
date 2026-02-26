// webpack.config.js - Performance optimizations for development
const path = require('path');

module.exports = {
  // Development optimizations
  mode: 'development',
  
  // Faster rebuilds
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
    buildDependencies: {
      config: [__filename]
    }
  },
  
  // Faster source maps for development
  devtool: 'eval-cheap-module-source-map',
  
  // Optimization settings
  optimization: {
    // Disable during development for faster builds
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  
  // Resolve optimizations
  resolve: {
    // Reduce resolution time
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    // Limit extension checking
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // Disable symlink resolution for performance
    symlinks: false,
    // Cache resolution
    cache: true
  },
  
  // Module processing optimizations
  module: {
    // Disable parsing for known libraries without dependencies
    noParse: /node_modules\/(lodash|moment|chart\.js)/,
    
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false
          }
        }
      }
    ]
  },
  
  // Development server optimizations
  devServer: {
    // Reduce file watching
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
        ignored: /node_modules/
      }
    },
    
    // Reduce hot reload overhead
    hot: true,
    liveReload: false,
    
    // Compression
    compress: true,
    
    // Reduce logs
    client: {
      logging: 'warn',
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  
  // Performance hints
  performance: {
    hints: false // Disable during development
  },
  
  // Stats configuration (reduce terminal output)
  stats: {
    preset: 'minimal',
    errors: true,
    warnings: false,
    modules: false,
    chunks: false,
    chunkModules: false,
    colors: true
  }
};
