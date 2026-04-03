import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    // 目前前端直接通过原生 WebSocket 通信，这里仅留作后续扩展（如获取系统信息）的入口
    ping: () => 'pong',
});
