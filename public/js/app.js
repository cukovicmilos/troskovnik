// Troškovnik - Alpine.js Application

function troskovnikApp() {
    return {
        // State
        plata: 0,
        kategorije: [],
        troskovi: {},
        istorija: [],
        tema: 'dark',

        // UI State
        showItemModal: false,
        showCategoryModal: false,
        showHistory: false,
        editingItem: null,
        selectedKategorija: null,

        // Forms
        itemForm: {
            naziv: '',
            iznos: 0,
            napomena: ''
        },
        newCategory: {
            emoji: '',
            naziv: ''
        },

        // Computed
        get ukupniRashodi() {
            let total = 0;
            for (const kat of this.kategorije) {
                total += this.getCategoryTotal(kat);
            }
            return total;
        },

        get ostajeZaZivot() {
            return this.plata - this.ukupniRashodi;
        },

        get darkMode() {
            return this.tema === 'dark';
        },

        // Methods
        async init() {
            // Load theme from localStorage
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.tema = savedTheme;
            }
            this.applyTheme();

            // Load data from server
            await this.loadData();

            // Initialize chart
            this.$nextTick(() => {
                this.initChart();
            });
        },

        toggleTheme() {
            this.tema = this.tema === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', this.tema);
            this.applyTheme();
            this.saveData();
        },

        applyTheme() {
            if (this.tema === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },

        async loadData() {
            try {
                const response = await fetch('api/data');
                if (!response.ok) throw new Error('Failed to load data');
                const mdContent = await response.text();
                this.parseMarkdown(mdContent);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        },

        async saveData() {
            try {
                const mdContent = this.toMarkdown();
                const response = await fetch('api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: mdContent
                });
                if (!response.ok) throw new Error('Failed to save data');
                this.updateChart();
            } catch (error) {
                console.error('Error saving data:', error);
            }
        },

        parseMarkdown(md) {
            const lines = md.split('\n');
            let currentSection = '';
            let currentCategory = '';

            this.kategorije = [];
            this.troskovi = {};
            this.istorija = [];

            for (const line of lines) {
                const trimmed = line.trim();

                // Section headers
                if (trimmed.startsWith('## ')) {
                    currentSection = trimmed.substring(3).trim();
                    currentCategory = '';
                    continue;
                }

                // Category headers in Troškovi
                if (trimmed.startsWith('### ') && currentSection === 'Troškovi') {
                    currentCategory = trimmed.substring(4).trim();
                    // Extract emoji and name
                    const match = currentCategory.match(/^(\S+)\s+(.+)$/);
                    if (match) {
                        const [, emoji, naziv] = match;
                        if (!this.troskovi[currentCategory]) {
                            this.troskovi[currentCategory] = [];
                        }
                    }
                    continue;
                }

                // Parse settings
                if (currentSection === 'Podešavanja' && trimmed.startsWith('- ')) {
                    const content = trimmed.substring(2);
                    if (content.startsWith('Plata:')) {
                        this.plata = parseInt(content.split(':')[1].trim()) || 0;
                    } else if (content.startsWith('Tema:')) {
                        this.tema = content.split(':')[1].trim() || 'dark';
                        this.applyTheme();
                    }
                    continue;
                }

                // Parse categories
                if (currentSection === 'Kategorije' && trimmed.startsWith('- ')) {
                    const content = trimmed.substring(2);
                    const match = content.match(/^(\S+)\s+(.+)$/);
                    if (match) {
                        const [, emoji, naziv] = match;
                        this.kategorije.push({ emoji, naziv });
                        const key = `${emoji} ${naziv}`;
                        if (!this.troskovi[key]) {
                            this.troskovi[key] = [];
                        }
                    }
                    continue;
                }

                // Parse expenses
                if (currentSection === 'Troškovi' && currentCategory && trimmed.startsWith('- ')) {
                    const content = trimmed.substring(2);
                    const parts = content.split('|').map(p => p.trim());
                    if (parts.length >= 2) {
                        const stavka = {
                            naziv: parts[0],
                            iznos: parseInt(parts[1]) || 0,
                            napomena: parts[2] || ''
                        };
                        if (!this.troskovi[currentCategory]) {
                            this.troskovi[currentCategory] = [];
                        }
                        this.troskovi[currentCategory].push(stavka);
                    }
                    continue;
                }

                // Parse history
                if (currentSection === 'Istorija' && trimmed.startsWith('- ')) {
                    this.istorija.push(trimmed.substring(2));
                    continue;
                }
            }
        },

        toMarkdown() {
            let md = '# Troškovnik\n\n';

            // Settings
            md += '## Podešavanja\n';
            md += `- Plata: ${this.plata}\n`;
            md += `- Tema: ${this.tema}\n\n`;

            // Categories
            md += '## Kategorije\n';
            for (const kat of this.kategorije) {
                md += `- ${kat.emoji} ${kat.naziv}\n`;
            }
            md += '\n';

            // Expenses
            md += '## Troškovi\n';
            for (const kat of this.kategorije) {
                const key = `${kat.emoji} ${kat.naziv}`;
                md += `### ${key}\n`;
                const stavke = this.troskovi[key] || [];
                for (const stavka of stavke) {
                    md += `- ${stavka.naziv} | ${stavka.iznos} | ${stavka.napomena || ''}\n`;
                }
                md += '\n';
            }

            // History
            md += '## Istorija\n';
            for (const log of this.istorija) {
                md += `- ${log}\n`;
            }

            return md;
        },

        // Category methods
        getStavkeZaKategoriju(kategorija) {
            const key = `${kategorija.emoji} ${kategorija.naziv}`;
            const stavke = this.troskovi[key] || [];
            return [...stavke].sort((a, b) => b.iznos - a.iznos);
        },

        getCategoryTotal(kategorija) {
            const stavke = this.getStavkeZaKategoriju(kategorija);
            return stavke.reduce((sum, s) => sum + s.iznos, 0);
        },

        // Item modal methods
        editingItemIndex: -1,

        openAddItemModal(kategorija) {
            this.selectedKategorija = kategorija;
            this.editingItem = null;
            this.editingItemIndex = -1;
            this.itemForm = { naziv: '', iznos: 0, napomena: '', kategorijaKey: '' };
            this.showItemModal = true;
        },

        openEditItemModal(kategorija, stavka) {
            this.selectedKategorija = kategorija;
            this.editingItem = stavka;
            const kategorijaKey = `${kategorija.emoji} ${kategorija.naziv}`;
            // Find the actual index in the original (unsorted) array
            const originalStavke = this.troskovi[kategorijaKey] || [];
            this.editingItemIndex = originalStavke.findIndex(s =>
                s.naziv === stavka.naziv && s.iznos === stavka.iznos && s.napomena === stavka.napomena
            );
            this.itemForm = { ...stavka, kategorijaKey };
            this.showItemModal = true;
        },

        closeItemModal() {
            this.showItemModal = false;
            this.selectedKategorija = null;
            this.editingItem = null;
        },

        saveItem() {
            const originalKey = `${this.selectedKategorija.emoji} ${this.selectedKategorija.naziv}`;
            const newKey = this.itemForm.kategorijaKey || originalKey;

            const now = new Date();
            const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');

            // Prepare item data (without kategorijaKey)
            const itemData = {
                naziv: this.itemForm.naziv,
                iznos: this.itemForm.iznos,
                napomena: this.itemForm.napomena
            };

            if (this.editingItem && this.editingItemIndex !== -1) {
                // Update existing using stored index
                const oldIznos = this.troskovi[originalKey][this.editingItemIndex].iznos;

                // Check if category changed
                if (newKey !== originalKey) {
                    // Remove from old category
                    this.troskovi[originalKey].splice(this.editingItemIndex, 1);
                    // Add to new category
                    if (!this.troskovi[newKey]) {
                        this.troskovi[newKey] = [];
                    }
                    this.troskovi[newKey].push(itemData);
                    this.addLog(`${timestamp} | Premešteno: ${itemData.naziv} iz ${originalKey} u ${newKey}`);
                } else {
                    // Same category, just update
                    this.troskovi[originalKey][this.editingItemIndex] = itemData;
                    this.addLog(`${timestamp} | Izmenjeno: ${itemData.naziv} ${oldIznos} -> ${itemData.iznos} RSD`);
                }
            } else {
                // Add new
                if (!this.troskovi[originalKey]) {
                    this.troskovi[originalKey] = [];
                }
                this.troskovi[originalKey].push(itemData);
                this.addLog(`${timestamp} | Dodato: ${itemData.naziv} ${itemData.iznos} RSD`);
            }

            this.saveData();
            this.closeItemModal();
        },

        deleteStavka(kategorija, stavka) {
            if (!confirm(`Da li ste sigurni da želite da obrišete "${stavka.naziv}"?`)) return;

            const key = `${kategorija.emoji} ${kategorija.naziv}`;
            // Find by all properties to handle duplicates
            const index = this.troskovi[key].findIndex(s =>
                s.naziv === stavka.naziv && s.iznos === stavka.iznos && s.napomena === stavka.napomena
            );
            if (index !== -1) {
                this.troskovi[key].splice(index, 1);
                const now = new Date();
                const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
                this.addLog(`${timestamp} | Obrisano: ${stavka.naziv} ${stavka.iznos} RSD`);
                this.saveData();
            }
        },

        // Category modal methods
        openCategoryModal() {
            this.showCategoryModal = true;
        },

        closeCategoryModal() {
            this.showCategoryModal = false;
            this.newCategory = { emoji: '', naziv: '' };
        },

        addCategory() {
            if (!this.newCategory.emoji || !this.newCategory.naziv) return;

            this.kategorije.push({ ...this.newCategory });
            const key = `${this.newCategory.emoji} ${this.newCategory.naziv}`;
            this.troskovi[key] = [];

            const now = new Date();
            const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
            this.addLog(`${timestamp} | Dodata kategorija: ${key}`);

            this.newCategory = { emoji: '', naziv: '' };
            this.saveData();
        },

        editCategory(kat) {
            const newEmoji = prompt('Emoji:', kat.emoji);
            const newNaziv = prompt('Naziv:', kat.naziv);

            if (newEmoji && newNaziv) {
                const oldKey = `${kat.emoji} ${kat.naziv}`;
                const newKey = `${newEmoji} ${newNaziv}`;

                // Transfer expenses
                this.troskovi[newKey] = this.troskovi[oldKey] || [];
                delete this.troskovi[oldKey];

                // Update category
                kat.emoji = newEmoji;
                kat.naziv = newNaziv;

                const now = new Date();
                const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
                this.addLog(`${timestamp} | Izmenjena kategorija: ${oldKey} -> ${newKey}`);

                this.saveData();
            }
        },

        deleteCategory(kat) {
            const key = `${kat.emoji} ${kat.naziv}`;
            const stavke = this.troskovi[key] || [];

            if (stavke.length > 0) {
                if (!confirm(`Kategorija "${key}" ima ${stavke.length} stavki. Da li ste sigurni?`)) return;
            } else {
                if (!confirm(`Da li ste sigurni da želite da obrišete kategoriju "${key}"?`)) return;
            }

            const index = this.kategorije.findIndex(k => k.emoji === kat.emoji && k.naziv === kat.naziv);
            if (index !== -1) {
                this.kategorije.splice(index, 1);
                delete this.troskovi[key];

                const now = new Date();
                const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
                this.addLog(`${timestamp} | Obrisana kategorija: ${key}`);

                this.saveData();
            }
        },

        // Utility methods
        formatCurrency(value) {
            return new Intl.NumberFormat('sr-RS').format(value) + ' RSD';
        },

        addLog(message) {
            this.istorija.push(message);
        },

        // Chart - uses ChartManager from chart.js
        initChart() {
            if (window.ChartManager) {
                ChartManager.init(
                    'expenseChart',
                    this.kategorije,
                    (kat) => this.getCategoryTotal(kat),
                    (val) => this.formatCurrency(val)
                );
            }
        },

        updateChart() {
            if (window.ChartManager) {
                ChartManager.update(
                    this.kategorije,
                    (kat) => this.getCategoryTotal(kat)
                );
            }
        }
    };
}
