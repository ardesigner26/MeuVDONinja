// ===================================================================
// VDO.NINJA CONFIGURAÇÕES CUSTOMIZADAS v1.0
// Desenvolvido automaticamente via PowerShell
// Compatível com todas as versões do VDO.Ninja
// ===================================================================

(function() {
    'use strict';
    
    console.log('[CustomVDO] 🚀 Inicializando configurações customizadas...');
    
    // Configurações globais
    window.CustomVDOConfig = {
        currentResolution: '720p30',
        currentBitrate: 2500,
        currentLatency: 50,
        isConfigured: false,
        originalGetUserMedia: null
    };
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomConfig);
    } else {
        initCustomConfig();
    }
    
    function initCustomConfig() {
        console.log('[CustomVDO] 📋 Configurando interface...');
        
        // Referencias dos elementos
        const elements = {
            resolutionSelect: document.getElementById('resolution-select'),
            bitrateSlider: document.getElementById('bitrate-slider'),
            latencySlider: document.getElementById('latency-slider'),
            bitrateValue: document.getElementById('bitrate-value'),
            latencyValue: document.getElementById('latency-value'),
            applyBtn: document.getElementById('apply-config-btn'),
            toggleBtn: document.getElementById('toggle-config'),
            configPanel: document.getElementById('custom-video-config')
        };
        
        if (!elements.resolutionSelect) {
            console.error('[CustomVDO] ❌ Elementos de configuração não encontrados!');
            return;
        }
        
        // Event listeners para sliders com feedback visual
        elements.bitrateSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            elements.bitrateValue.textContent = value >= 1000 ? 
                (value / 1000).toFixed(1) + ' Mbps' : 
                value + ' kbps';
            window.CustomVDOConfig.currentBitrate = value;
        });
        
        elements.latencySlider.addEventListener('input', function() {
            elements.latencyValue.textContent = this.value + ' ms';
            window.CustomVDOConfig.currentLatency = parseInt(this.value);
        });
        
        // Toggle do painel com animação
        elements.toggleBtn.addEventListener('click', function() {
            elements.configPanel.classList.toggle('minimized');
            this.textContent = elements.configPanel.classList.contains('minimized') ? '+' : '−';
        });
        
        // Aplicar configurações
        elements.applyBtn.addEventListener('click', function() {
            applyCustomConfiguration();
        });
        
        // Salvar configurações no localStorage
        elements.resolutionSelect.addEventListener('change', saveConfig);
        elements.bitrateSlider.addEventListener('change', saveConfig);
        elements.latencySlider.addEventListener('change', saveConfig);
        
        // Carregar configurações salvas
        loadSavedConfig();
        
        console.log('[CustomVDO] ✅ Interface configurada com sucesso!');
    }
    
    function saveConfig() {
        const config = {
            resolution: document.getElementById('resolution-select').value,
            bitrate: window.CustomVDOConfig.currentBitrate,
            latency: window.CustomVDOConfig.currentLatency
        };
        localStorage.setItem('customVDOConfig', JSON.stringify(config));
    }
    
    function loadSavedConfig() {
        try {
            const saved = localStorage.getItem('customVDOConfig');
            if (saved) {
                const config = JSON.parse(saved);
                document.getElementById('resolution-select').value = config.resolution || '720p30';
                document.getElementById('bitrate-slider').value = config.bitrate || 2500;
                document.getElementById('latency-slider').value = config.latency || 50;
                
                // Trigger events para atualizar displays
                document.getElementById('bitrate-slider').dispatchEvent(new Event('input'));
                document.getElementById('latency-slider').dispatchEvent(new Event('input'));
                
                console.log('[CustomVDO] 📁 Configurações carregadas:', config);
            }
        } catch (e) {
            console.warn('[CustomVDO] ⚠️  Erro ao carregar configurações salvas:', e);
        }
    }
    
    function applyCustomConfiguration() {
        const resolution = document.getElementById('resolution-select').value;
        const bitrate = window.CustomVDOConfig.currentBitrate;
        const latency = window.CustomVDOConfig.currentLatency;
        
        console.log('[CustomVDO] 🔧 Aplicando configuração:', { resolution, bitrate, latency });
        
        // Configurar resolução e FPS
        let width, height, frameRate;
        switch(resolution) {
            case '720p30':
                width = 1280; height = 720; frameRate = 30;
                break;
            case '1080p30':
                width = 1920; height = 1080; frameRate = 30;
                break;
            case '1080p60':
                width = 1920; height = 1080; frameRate = 60;
                break;
            case '4k30':
                width = 3840; height = 2160; frameRate = 30;
                break;
            default:
                width = 1280; height = 720; frameRate = 30;
        }
        
        // Aplicar configurações globalmente
        window.CustomVDOConfig.currentResolution = resolution;
        window.CustomVDOConfig.isConfigured = true;
        
        // Salvar configurações
        saveConfig();
        
        // Feedback visual melhorado
        const btn = document.getElementById('apply-config-btn');
        const originalText = btn.textContent;
        const originalStyle = btn.style.background;
        
        btn.textContent = '✅ Configuração Aplicada!';
        btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = originalStyle;
            btn.disabled = false;
        }, 3000);
        
        // Tentar aplicar em sessões ativas
        applyToActiveSessions(width, height, frameRate, bitrate);
        
        console.log('[CustomVDO] ✅ Configuração aplicada com sucesso!');
        
        // Notificação para o usuário
        showNotification('Configuração aplicada! Será usada em novas conexões.', 'success');
    }
    
    function applyToActiveSessions(width, height, frameRate, bitrate) {
        // Tentar aplicar em sessões ativas do VDO.Ninja
        try {
            if (typeof session !== 'undefined' && session && session.pcs) {
                Object.values(session.pcs).forEach(pc => {
                    if (pc.getSenders) {
                        pc.getSenders().forEach(sender => {
                            if (sender.track && sender.track.kind === 'video') {
                                const params = sender.getParameters();
                                if (params.encodings && params.encodings.length > 0) {
                                    params.encodings[0].maxBitrate = bitrate * 1000;
                                    sender.setParameters(params).catch(console.warn);
                                }
                            }
                        });
                    }
                });
                console.log('[CustomVDO] 🔄 Configurações aplicadas em sessões ativas');
            }
        } catch (error) {
            console.warn('[CustomVDO] ⚠️  Não foi possível aplicar em sessões ativas:', error);
        }
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = 
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10000;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        ;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // Hook para aplicar configurações quando getUserMedia for chamado
    function hookGetUserMedia() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            window.CustomVDOConfig.originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            
            navigator.mediaDevices.getUserMedia = function(constraints) {
                console.log('[CustomVDO] 🎥 getUserMedia interceptado');
                
                if (window.CustomVDOConfig.isConfigured && constraints && constraints.video) {
                    const resolution = window.CustomVDOConfig.currentResolution;
                    let width, height, frameRate;
                    
                    switch(resolution) {
                        case '720p30':
                            width = 1280; height = 720; frameRate = 30;
                            break;
                        case '1080p30':
                            width = 1920; height = 1080; frameRate = 30;
                            break;
                        case '1080p60':
                            width = 1920; height = 1080; frameRate = 60;
                            break;
                        case '4k30':
                            width = 3840; height = 2160; frameRate = 30;
                            break;
                    }
                    
                    if (typeof constraints.video === 'object') {
                        constraints.video.width = { ideal: width, max: width };
                        constraints.video.height = { ideal: height, max: height };
                        constraints.video.frameRate = { ideal: frameRate, max: frameRate };
                        
                        console.log('[CustomVDO] 🎯 Constraints customizadas aplicadas:', {
                            width, height, frameRate
                        });
                    }
                }
                
                return window.CustomVDOConfig.originalGetUserMedia(constraints);
            };
        }
    }
    
    // Inicializar hook
    hookGetUserMedia();
    
    // CSS para animações
    const style = document.createElement('style');
    style.textContent = 
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    ;
    document.head.appendChild(style);
    
    console.log('[CustomVDO] 🎉 Sistema de configurações customizadas carregado!');
    
})();
