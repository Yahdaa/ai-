class CloudStorageApp {
    constructor() {
        this.currentSection = 'files';
        this.currentView = 'grid';
        this.files = this.loadFiles();
        this.backups = this.loadBackups();
        this.devices = this.loadDevices();
        this.apiKeys = this.loadApiKeys();
        this.securityAlerts = this.loadSecurityAlerts();
        this.selectedFiles = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderFiles();
        this.updateStorageInfo();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(item.dataset.section);
            });
        });

        // New functionality buttons
        document.getElementById('compressBtn')?.addEventListener('click', () => {
            this.openCompressionModal();
        });

        document.getElementById('encryptBtn')?.addEventListener('click', () => {
            this.openEncryptionModal();
        });

        document.getElementById('versionBtn')?.addEventListener('click', () => {
            this.openVersionsModal();
        });

        // Backup functionality
        document.getElementById('createBackupBtn')?.addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('configBackupBtn')?.addEventListener('click', () => {
            this.configureBackup();
        });

        // Sync functionality
        document.getElementById('addDeviceBtn')?.addEventListener('click', () => {
            this.addDevice();
        });

        // API functionality
        document.getElementById('generateApiKeyBtn')?.addEventListener('click', () => {
            this.generateApiKey();
        });

        // CDN functionality
        document.getElementById('enableCdnBtn')?.addEventListener('click', () => {
            this.enableCdn();
        });

        // Security functionality
        document.getElementById('securityScanBtn')?.addEventListener('click', () => {
            this.runSecurityScan();
        });

        // Settings functionality
        document.getElementById('twoFactorToggle')?.addEventListener('change', (e) => {
            this.toggleTwoFactor(e.target.checked);
        });

        document.getElementById('encryptionToggle')?.addEventListener('change', (e) => {
            this.toggleEncryption(e.target.checked);
        });

        document.getElementById('logoutAllBtn')?.addEventListener('click', () => {
            this.logoutAllSessions();
        });

        // Modal functionality
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Compression modal
        document.getElementById('startCompressionBtn')?.addEventListener('click', () => {
            this.startCompression();
        });

        // Encryption modal
        document.getElementById('startEncryptionBtn')?.addEventListener('click', () => {
            this.startEncryption();
        });

        // Password strength checker
        document.getElementById('encryptionPassword')?.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });

        // Upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.openUploadModal();
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        // New folder
        document.getElementById('newFolderBtn').addEventListener('click', () => {
            this.createNewFolder();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchFiles(e.target.value);
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.file-item')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.file-item'));
            }
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // Context menu actions
        document.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleContextAction(e.target.closest('.context-item').dataset.action);
            });
        });

        // File selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.file-item')) {
                if (e.ctrlKey || e.metaKey) {
                    this.toggleFileSelection(e.target.closest('.file-item'));
                } else {
                    this.selectFile(e.target.closest('.file-item'));
                }
            }
        });

        // File preview
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.file-item')) {
                const fileId = e.target.closest('.file-item').dataset.fileId;
                const file = this.files.find(f => f.id == fileId);
                this.previewFile(file);
            }
        });

        // Sort
        document.querySelector('.sort-select').addEventListener('change', (e) => {
            this.sortFiles(e.target.value);
        });
    }

    loadFiles() {
        const defaultFiles = [
            {
                id: 1,
                name: 'Presentación.pptx',
                type: 'presentation',
                size: '2.5 MB',
                date: '2024-01-15',
                icon: 'fas fa-file-powerpoint',
                encrypted: false,
                compressed: false,
                versions: 3
            },
            {
                id: 2,
                name: 'Documento.pdf',
                type: 'document',
                size: '1.2 MB',
                date: '2024-01-14',
                icon: 'fas fa-file-pdf',
                encrypted: true,
                compressed: false,
                versions: 1
            },
            {
                id: 3,
                name: 'Imagen.jpg',
                type: 'image',
                size: '3.8 MB',
                date: '2024-01-13',
                icon: 'fas fa-file-image',
                encrypted: false,
                compressed: true,
                versions: 2
            },
            {
                id: 4,
                name: 'Video.mp4',
                type: 'video',
                size: '15.6 MB',
                date: '2024-01-12',
                icon: 'fas fa-file-video',
                encrypted: false,
                compressed: false,
                versions: 1
            },
            {
                id: 5,
                name: 'Carpeta Proyectos',
                type: 'folder',
                size: '25 archivos',
                date: '2024-01-11',
                icon: 'fas fa-folder',
                encrypted: false,
                compressed: false,
                versions: 1
            },
            {
                id: 6,
                name: 'Código.js',
                type: 'code',
                size: '45 KB',
                date: '2024-01-10',
                icon: 'fas fa-file-code',
                encrypted: true,
                compressed: true,
                versions: 5
            }
        ];

        return JSON.parse(localStorage.getItem('cloudFiles')) || defaultFiles;
    }

    loadBackups() {
        const defaultBackups = [
            {
                id: 1,
                name: 'Backup Completo - Enero 2024',
                date: '2024-01-15 14:30',
                size: '3.2 GB',
                status: 'completed'
            },
            {
                id: 2,
                name: 'Backup Incremental - Enero 2024',
                date: '2024-01-14 06:00',
                size: '450 MB',
                status: 'completed'
            }
        ];
        return JSON.parse(localStorage.getItem('cloudBackups')) || defaultBackups;
    }

    loadDevices() {
        const defaultDevices = [
            {
                id: 1,
                name: 'MacBook Pro',
                type: 'laptop',
                status: 'online',
                lastSync: '2024-01-15 15:30',
                icon: 'fas fa-laptop'
            },
            {
                id: 2,
                name: 'iPhone 15',
                type: 'mobile',
                status: 'online',
                lastSync: '2024-01-15 15:25',
                icon: 'fas fa-mobile-alt'
            },
            {
                id: 3,
                name: 'iPad Air',
                type: 'tablet',
                status: 'offline',
                lastSync: '2024-01-14 20:15',
                icon: 'fas fa-tablet-alt'
            }
        ];
        return JSON.parse(localStorage.getItem('cloudDevices')) || defaultDevices;
    }

    loadApiKeys() {
        const defaultKeys = [
            {
                id: 1,
                name: 'Producción API',
                key: 'cs_prod_1234567890abcdef',
                created: '2024-01-10',
                lastUsed: '2024-01-15'
            },
            {
                id: 2,
                name: 'Desarrollo API',
                key: 'cs_dev_abcdef1234567890',
                created: '2024-01-05',
                lastUsed: '2024-01-14'
            }
        ];
        return JSON.parse(localStorage.getItem('cloudApiKeys')) || defaultKeys;
    }

    loadSecurityAlerts() {
        const defaultAlerts = [
            {
                id: 1,
                message: 'Nuevo inicio de sesión desde Madrid, España',
                type: 'info',
                date: '2024-01-15 14:20'
            },
            {
                id: 2,
                message: 'Intento de acceso fallido detectado',
                type: 'warning',
                date: '2024-01-14 22:15'
            }
        ];
        return JSON.parse(localStorage.getItem('cloudSecurityAlerts')) || defaultAlerts;
    }

    saveFiles() {
        localStorage.setItem('cloudFiles', JSON.stringify(this.files));
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;

        // Render content based on section
        switch(section) {
            case 'files':
                this.renderFiles();
                break;
            case 'recent':
                this.renderRecentFiles();
                break;
            case 'shared':
                this.renderSharedFiles();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'backup':
                this.renderBackups();
                break;
            case 'sync':
                this.renderSync();
                break;
            case 'api':
                this.renderApi();
                break;
            case 'cdn':
                this.renderCdn();
                break;
            case 'security':
                this.renderSecurity();
                break;
        }
    }

    switchView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        this.currentView = view;
        this.renderFiles();
    }

    renderFiles() {
        const container = document.getElementById('filesGrid');
        container.innerHTML = '';
        container.className = this.currentView === 'grid' ? 'files-grid' : 'files-list';

        this.files.forEach(file => {
            const fileElement = this.createFileElement(file);
            container.appendChild(fileElement);
        });
    }

    createFileElement(file) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.dataset.fileId = file.id;
        
        div.innerHTML = `
            <div class="file-icon">
                <i class="${file.icon}"></i>
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-info">
                <span>${file.size}</span>
                <span>${this.formatDate(file.date)}</span>
            </div>
        `;

        div.addEventListener('dblclick', () => {
            this.openFile(file);
        });

        return div;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }

    openFile(file) {
        if (file.type === 'folder') {
            this.showNotification('Abriendo carpeta: ' + file.name);
        } else {
            this.showNotification('Abriendo archivo: ' + file.name);
        }
    }

    openUploadModal() {
        document.getElementById('uploadModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('uploadModal').style.display = 'none';
        document.getElementById('uploadProgress').style.display = 'none';
        document.querySelector('.progress-fill').style.width = '0%';
    }

    handleFileUpload(files) {
        if (files.length === 0) return;

        document.getElementById('uploadProgress').style.display = 'block';
        
        Array.from(files).forEach((file, index) => {
            setTimeout(() => {
                this.uploadFile(file, index, files.length);
            }, index * 500);
        });
    }

    uploadFile(file, index, total) {
        const progress = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        // Simulate upload progress
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 30;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                
                // Add file to storage
                const newFile = {
                    id: Date.now() + index,
                    name: file.name,
                    type: this.getFileType(file.name),
                    size: this.formatFileSize(file.size),
                    date: new Date().toISOString().split('T')[0],
                    icon: this.getFileIcon(file.name)
                };
                
                this.files.unshift(newFile);
                this.saveFiles();
                
                if (index === total - 1) {
                    setTimeout(() => {
                        this.closeModal();
                        this.renderFiles();
                        this.updateStorageInfo();
                        this.showNotification(`${total} archivo(s) subido(s) exitosamente`);
                    }, 500);
                }
            }
            
            progress.style.width = currentProgress + '%';
            progressText.textContent = `Subiendo... ${Math.round(currentProgress)}%`;
        }, 100);
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const types = {
            'pdf': 'document',
            'doc': 'document',
            'docx': 'document',
            'txt': 'document',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'mp4': 'video',
            'avi': 'video',
            'mov': 'video',
            'js': 'code',
            'html': 'code',
            'css': 'code',
            'py': 'code',
            'ppt': 'presentation',
            'pptx': 'presentation'
        };
        return types[ext] || 'file';
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'fas fa-file-pdf',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'txt': 'fas fa-file-alt',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image',
            'mp4': 'fas fa-file-video',
            'avi': 'fas fa-file-video',
            'mov': 'fas fa-file-video',
            'js': 'fas fa-file-code',
            'html': 'fas fa-file-code',
            'css': 'fas fa-file-code',
            'py': 'fas fa-file-code',
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint'
        };
        return icons[ext] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    createNewFolder() {
        const name = prompt('Nombre de la nueva carpeta:');
        if (name) {
            const newFolder = {
                id: Date.now(),
                name: name,
                type: 'folder',
                size: '0 archivos',
                date: new Date().toISOString().split('T')[0],
                icon: 'fas fa-folder'
            };
            
            this.files.unshift(newFolder);
            this.saveFiles();
            this.renderFiles();
            this.showNotification('Carpeta creada: ' + name);
        }
    }

    searchFiles(query) {
        const filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const container = document.getElementById('filesGrid');
        container.innerHTML = '';
        
        filteredFiles.forEach(file => {
            const fileElement = this.createFileElement(file);
            container.appendChild(fileElement);
        });
    }

    sortFiles(criteria) {
        switch(criteria) {
            case 'name':
                this.files.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
                this.files.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'size':
                this.files.sort((a, b) => {
                    const sizeA = this.parseSizeToBytes(a.size);
                    const sizeB = this.parseSizeToBytes(b.size);
                    return sizeB - sizeA;
                });
                break;
            case 'type':
                this.files.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }
        this.renderFiles();
    }

    parseSizeToBytes(sizeStr) {
        const units = { 'KB': 1024, 'MB': 1024*1024, 'GB': 1024*1024*1024 };
        const match = sizeStr.match(/(\d+\.?\d*)\s*(\w+)/);
        if (match) {
            return parseFloat(match[1]) * (units[match[2]] || 1);
        }
        return 0;
    }

    showContextMenu(event, fileElement) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.dataset.fileId = fileElement.dataset.fileId;
    }

    hideContextMenu() {
        document.getElementById('contextMenu').style.display = 'none';
    }

    handleContextAction(action) {
        const fileId = document.getElementById('contextMenu').dataset.fileId;
        const file = this.files.find(f => f.id == fileId);
        
        switch(action) {
            case 'download':
                this.downloadFile(file);
                break;
            case 'share':
                this.shareFile(file);
                break;
            case 'rename':
                this.renameFile(file);
                break;
            case 'compress':
                this.compressFile(file);
                break;
            case 'encrypt':
                this.encryptFile(file);
                break;
            case 'versions':
                this.showFileVersions(file);
                break;
            case 'properties':
                this.showFileProperties(file);
                break;
            case 'delete':
                this.deleteFile(file);
                break;
        }
        
        this.hideContextMenu();
    }

    downloadFile(file) {
        this.showNotification('Descargando: ' + file.name);
    }

    shareFile(file) {
        const shareUrl = `https://cloudstore.com/share/${file.id}`;
        navigator.clipboard.writeText(shareUrl);
        this.showNotification('Enlace copiado al portapapeles');
    }

    renameFile(file) {
        const newName = prompt('Nuevo nombre:', file.name);
        if (newName && newName !== file.name) {
            file.name = newName;
            this.saveFiles();
            this.renderFiles();
            this.showNotification('Archivo renombrado');
        }
    }

    deleteFile(file) {
        if (confirm(`¿Eliminar ${file.name}?`)) {
            this.files = this.files.filter(f => f.id !== file.id);
            this.saveFiles();
            this.renderFiles();
            this.updateStorageInfo();
            this.showNotification('Archivo eliminado');
        }
    }

    renderRecentFiles() {
        const container = document.getElementById('recentFiles');
        const recentFiles = this.files
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        container.innerHTML = recentFiles.map(file => `
            <div class="file-item">
                <div class="file-icon">
                    <i class="${file.icon}"></i>
                </div>
                <div class="file-name">${file.name}</div>
                <div class="file-info">
                    <span>${file.size}</span>
                    <span>${this.formatDate(file.date)}</span>
                </div>
            </div>
        `).join('');
    }

    renderSharedFiles() {
        const container = document.getElementById('sharedFiles');
        const sharedFiles = this.files.filter(file => Math.random() > 0.7);
        
        container.innerHTML = sharedFiles.map(file => `
            <div class="file-item">
                <div class="file-icon">
                    <i class="${file.icon}"></i>
                </div>
                <div class="file-name">${file.name}</div>
                <div class="file-info">
                    <span>Compartido</span>
                    <span>${this.formatDate(file.date)}</span>
                </div>
            </div>
        `).join('');
    }

    renderAnalytics() {
        // This would typically render charts using a library like Chart.js
        const chartContainer = document.getElementById('storageChart');
        chartContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary);">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Gráfico de uso de almacenamiento</p>
                <p style="font-size: 12px;">3.5 GB / 10 GB utilizados</p>
            </div>
        `;
    }

    updateStorageInfo() {
        const totalSize = this.files.reduce((total, file) => {
            return total + this.parseSizeToBytes(file.size);
        }, 0);
        
        const usedGB = totalSize / (1024 * 1024 * 1024);
        const totalGB = 10;
        const percentage = (usedGB / totalGB) * 100;
        
        document.querySelector('.storage-used').style.width = percentage + '%';
        document.querySelector('.storage-text').textContent = 
            `${usedGB.toFixed(1)} GB de ${totalGB} GB usados`;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // New functionality methods
    openCompressionModal() {
        if (this.selectedFiles.size === 0) {
            this.showNotification('Selecciona archivos para comprimir', 'warning');
            return;
        }
        document.getElementById('compressionModal').style.display = 'block';
    }

    openEncryptionModal() {
        if (this.selectedFiles.size === 0) {
            this.showNotification('Selecciona archivos para cifrar', 'warning');
            return;
        }
        document.getElementById('encryptionModal').style.display = 'block';
    }

    openVersionsModal() {
        document.getElementById('versionsModal').style.display = 'block';
        this.renderVersions();
    }

    startCompression() {
        const archiveName = document.getElementById('archiveName').value || 'archivo.zip';
        const level = document.getElementById('compressionLevel').value;
        
        this.showNotification('Iniciando compresión...', 'info');
        
        // Simulate compression
        setTimeout(() => {
            const newFile = {
                id: Date.now(),
                name: archiveName,
                type: 'archive',
                size: '2.1 MB',
                date: new Date().toISOString().split('T')[0],
                icon: 'fas fa-file-archive',
                encrypted: false,
                compressed: true,
                versions: 1
            };
            
            this.files.unshift(newFile);
            this.saveFiles();
            this.renderFiles();
            this.showNotification('Archivo comprimido exitosamente', 'success');
            document.getElementById('compressionModal').style.display = 'none';
        }, 2000);
    }

    startEncryption() {
        const password = document.getElementById('encryptionPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (password !== confirm) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }
        
        this.showNotification('Cifrando archivos...', 'info');
        
        // Simulate encryption
        setTimeout(() => {
            this.selectedFiles.forEach(fileId => {
                const file = this.files.find(f => f.id == fileId);
                if (file) {
                    file.encrypted = true;
                    file.name += '.encrypted';
                }
            });
            
            this.saveFiles();
            this.renderFiles();
            this.showNotification('Archivos cifrados exitosamente', 'success');
            document.getElementById('encryptionModal').style.display = 'none';
        }, 2000);
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        let strength = 0;
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        strengthBar.style.width = strength + '%';
    }

    selectFile(fileElement) {
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });
        fileElement.classList.add('selected');
        this.selectedFiles.clear();
        this.selectedFiles.add(fileElement.dataset.fileId);
    }

    toggleFileSelection(fileElement) {
        const fileId = fileElement.dataset.fileId;
        if (this.selectedFiles.has(fileId)) {
            this.selectedFiles.delete(fileId);
            fileElement.classList.remove('selected');
        } else {
            this.selectedFiles.add(fileId);
            fileElement.classList.add('selected');
        }
    }

    previewFile(file) {
        const modal = document.getElementById('previewModal');
        const title = document.getElementById('previewTitle');
        const container = document.getElementById('previewContainer');
        
        title.textContent = file.name;
        
        if (file.type === 'image') {
            container.innerHTML = `<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=" class="preview-image" alt="Preview">`;
        } else if (file.type === 'document' || file.type === 'code') {
            container.innerHTML = `<textarea class="preview-text" readonly>Contenido del archivo: ${file.name}\n\nEste es un ejemplo de vista previa del contenido del archivo.\nEn una implementación real, aquí se mostraría el contenido real del archivo.</textarea>`;
        } else {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary);">
                    <i class="${file.icon}" style="font-size: 64px; margin-bottom: 16px;"></i>
                    <p>Vista previa no disponible para este tipo de archivo</p>
                    <p style="font-size: 12px; margin-top: 8px;">Tipo: ${file.type} | Tamaño: ${file.size}</p>
                </div>
            `;
        }
        
        modal.style.display = 'block';
    }

    renderBackups() {
        const container = document.getElementById('backupList');
        container.innerHTML = `
            <h3>Historial de Backups</h3>
            ${this.backups.map(backup => `
                <div class="backup-item" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin: 8px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; font-size: 14px;">${backup.name}</h4>
                            <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-secondary);">${backup.date} - ${backup.size}</p>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-secondary" onclick="app.restoreBackup(${backup.id})">Restaurar</button>
                            <button class="btn-danger" onclick="app.deleteBackup(${backup.id})">Eliminar</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    }

    renderSync() {
        const container = document.getElementById('syncDevices');
        container.innerHTML = this.devices.map(device => `
            <div class="device-card">
                <div class="device-icon">
                    <i class="${device.icon}"></i>
                </div>
                <div class="device-info">
                    <h4>${device.name}</h4>
                    <div class="device-status text-${device.status === 'online' ? 'success' : 'secondary'}">
                        ${device.status === 'online' ? 'En línea' : 'Desconectado'}
                    </div>
                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Última sync: ${device.lastSync}</p>
                </div>
            </div>
        `).join('');
    }

    renderApi() {
        const container = document.getElementById('apiKeys');
        container.innerHTML = this.apiKeys.map(key => `
            <div class="api-key-item">
                <div>
                    <h4 style="margin: 0; font-size: 14px;">${key.name}</h4>
                    <div class="api-key-value">${key.key}</div>
                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Creada: ${key.created} | Último uso: ${key.lastUsed}</p>
                </div>
                <button class="btn-danger" onclick="app.revokeApiKey(${key.id})">Revocar</button>
            </div>
        `).join('');
    }

    renderCdn() {
        // CDN is already rendered in HTML, just update stats
        this.showNotification('CDN renderizado correctamente', 'success');
    }

    renderSecurity() {
        const container = document.getElementById('securityAlerts');
        container.innerHTML = this.securityAlerts.map(alert => `
            <div class="alert-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${alert.message}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${alert.date}</span>
                </div>
            </div>
        `).join('');
    }

    renderVersions() {
        const container = document.getElementById('versionsList');
        const selectedFile = this.files.find(f => this.selectedFiles.has(f.id.toString()));
        
        if (!selectedFile) {
            container.innerHTML = '<p>Selecciona un archivo para ver sus versiones</p>';
            return;
        }
        
        const versions = [];
        for (let i = 1; i <= selectedFile.versions; i++) {
            versions.push({
                version: i,
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                size: selectedFile.size
            });
        }
        
        container.innerHTML = versions.map(version => `
            <div class="version-item">
                <div class="version-info">
                    <h4>Versión ${version.version}</h4>
                    <div class="version-date">${version.date} - ${version.size}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-secondary">Restaurar</button>
                    <button class="btn-secondary">Descargar</button>
                </div>
            </div>
        `).join('');
    }

    // Advanced functionality methods
    createBackup() {
        this.showNotification('Creando backup completo...', 'info');
        
        setTimeout(() => {
            const newBackup = {
                id: Date.now(),
                name: `Backup Completo - ${new Date().toLocaleDateString()}`,
                date: new Date().toLocaleString(),
                size: '3.8 GB',
                status: 'completed'
            };
            
            this.backups.unshift(newBackup);
            localStorage.setItem('cloudBackups', JSON.stringify(this.backups));
            this.renderBackups();
            this.showNotification('Backup creado exitosamente', 'success');
        }, 3000);
    }

    generateApiKey() {
        const name = prompt('Nombre para la nueva API Key:');
        if (name) {
            const newKey = {
                id: Date.now(),
                name: name,
                key: `cs_${Math.random().toString(36).substr(2, 16)}`,
                created: new Date().toISOString().split('T')[0],
                lastUsed: 'Nunca'
            };
            
            this.apiKeys.unshift(newKey);
            localStorage.setItem('cloudApiKeys', JSON.stringify(this.apiKeys));
            this.renderApi();
            this.showNotification('API Key generada exitosamente', 'success');
        }
    }

    enableCdn() {
        this.showNotification('Activando CDN global...', 'info');
        
        setTimeout(() => {
            this.showNotification('CDN activado exitosamente', 'success');
        }, 2000);
    }

    runSecurityScan() {
        this.showNotification('Ejecutando escaneo de seguridad...', 'info');
        
        setTimeout(() => {
            this.showNotification('Escaneo completado - No se encontraron amenazas', 'success');
        }, 3000);
    }

    toggleTwoFactor(enabled) {
        this.showNotification(
            enabled ? 'Autenticación de dos factores activada' : 'Autenticación de dos factores desactivada',
            'success'
        );
    }

    toggleEncryption(enabled) {
        this.showNotification(
            enabled ? 'Cifrado de archivos activado' : 'Cifrado de archivos desactivado',
            'success'
        );
    }

    logoutAllSessions() {
        if (confirm('¿Cerrar todas las sesiones activas?')) {
            this.showNotification('Todas las sesiones han sido cerradas', 'success');
        }
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CloudStorageApp();
    
    // Add selected file styling
    const style = document.createElement('style');
    style.textContent = `
        .file-item.selected {
            border-color: var(--primary) !important;
            background: rgba(255, 107, 53, 0.1) !important;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
});