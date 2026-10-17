import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
const sharedRules={name:'shared-coptah-rules',resolveId(id){if(id.startsWith('virtual:coptah/'))return '\0'+id;},load(id){
 if(!id.startsWith('\0virtual:coptah/'))return;
 const name=id.split('/').pop();
 if(!['rule_engine','h4_compass','market_cycle','market_entry','plan_monitor'].includes(name))throw new Error('Unknown shared rule');
 let code=readFileSync(new URL('../backend/'+name+'.js',import.meta.url),'utf8');
 code=code.replace(/const (\{[^;]+?\})=require\('\.\/(\w+)'\);/g,(_,names,dep)=>`import ${names} from 'virtual:coptah/${dep}';`);
 code=code.replace("return require('./market_cycle').analyzeMarketSessions(context);",'return analyzeMarketSessions(context);');
 if(name==='rule_engine')code="import {analyzeMarketSessions} from 'virtual:coptah/market_cycle';\n"+code;
 return code.replace(/module\.exports\s*=\s*\{/,'export {');
}};

export default defineConfig({
  plugins: [sharedRules, react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/ws': { target: 'ws://127.0.0.1:3001', ws: true },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
