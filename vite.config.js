import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // 基础配置
  root: '.',
  base: './',
  
  // 入口配置
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 资源目录
    assetsDir: 'assets',
    
    // 清空输出目录
    emptyOutDir: true,
    
    // 源码映射
    sourcemap: true,
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 代码分割配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // 入口文件
        entryFileNames: 'js/[name]-[hash].js',
        // 代码块
        chunkFileNames: 'js/[name]-[hash].js',
        // 资源文件
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(css)$/i.test(assetInfo.name)) {
            return 'css/[name]-[hash][extname]';
          }
          
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'images/[name]-[hash][extname]';
          }
          
          if (/\.(woff2?|ttf|otf|eot)$/i.test(assetInfo.name)) {
            return 'fonts/[name]-[hash][extname]';
          }
          
          return 'assets/[name]-[hash][extname]';
        },
        
        // 手动代码分割
        manualChunks: {
          // 测试模块打包在一起
          'test-modules': [
            './modules/mbti/mbti.js',
            './modules/bigfive/bigfive.js',
            './modules/holland/holland.js',
            './modules/attachment/attachment.js',
            './modules/eq/eq.js',
            './modules/values/values.js',
            './modules/stress/stress.js'
          ],
          // 报告模块打包在一起
          'report-modules': [
            './modules/mbti/report.js',
            './modules/bigfive/report.js',
            './modules/holland/report.js',
            './modules/attachment/report.js',
            './modules/eq/report.js',
            './modules/values/report.js',
            './modules/stress/report.js'
          ],
          // 功能模块
          'feature-modules': [
            './modules/diary/diary.js',
            './modules/contacts/contacts.js',
            './modules/chat/chat.js',
            './modules/comprehensive/comprehensive.js'
          ],
          // 数据卡片相关
          'datacard-modules': [
            './js/datacard.js',
            './js/datacard/canvas-renderer.js',
            './js/datacard/steganography.js'
          ]
        }
      }
    },
    
    // 报告配置
    reportCompressedSize: true,
    reportChunkSize: true
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, './js'),
      '@modules': resolve(__dirname, './modules'),
      '@css': resolve(__dirname, './css'),
      '@assets': resolve(__dirname, './assets'),
      '@utils': resolve(__dirname, './js/utils'),
      '@components': resolve(__dirname, './js/components'),
      '@app': resolve(__dirname, './js/app')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    
    // 热更新配置
    hmr: {
      overlay: true
    }
  },
  
  // 预览配置
  preview: {
    port: 4173,
    open: true
  },
  
  // CSS 配置
  css: {
    devSourcemap: true,
    
    // PostCSS 配置
    postcss: {
      plugins: []
    }
  },
  
  // 优化依赖
  optimizeDeps: {
    include: []
  },
  
  // 插件
  plugins: [],
  
  // 定义全局常量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '2.2.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  // ESBuild 配置
  esbuild: {
    // 移除 console 和 debugger
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
