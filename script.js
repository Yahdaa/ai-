class CloudStorageApp {
    constructor() {
        this.currentSection = 'files';
        this.currentView = 'grid';
        this.files = this.loadFiles();
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
                icon: 'fas fa-file-powerpoint'
            },
            {
                id: 2,
                name: 'Documento.pdf',
                type: 'document',
                size: '1.2 MB',
                date: '2024-01-14',
                icon: 'fas fa-file-pdf'
            },
            {
                id: 3,
                name: 'Imagen.jpg',
                type: 'image',
                size: '3.8 MB',
                date: '2024-01-13',
                icon: 'fas fa-file-image'
            },
            {
                id: 4,
                name: 'Video.mp4',
                type: 'video',
                size: '15.6 MB',
                date: '2024-01-12',
                icon: 'fas fa-file-video'
            },
            {
                id: 5,
                name: 'Carpeta Proyectos',
                type: 'folder',
                size: '25 archivos',
                date: '2024-01-11',
                icon: 'fas fa-folder'
            },
            {
                id: 6,
                name: 'Código.js',
                type: 'code',
                size: '45 KB',
                date: '2024-01-10',
                icon: 'fas fa-file-code'
            }
        ];

        return JSON.parse(localStorage.getItem('cloudFiles')) || defaultFiles;
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

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CloudStorageApp();
});