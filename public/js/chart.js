// Troskovnik - Chart.js Pie Chart Logic (Cockpit Edition)

const ChartManager = {
    chart: null,
    // Cockpit-style colors - more muted, professional
    colors: [
        '#4a9eff', // primary blue
        '#ff4757', // red
        '#00d26a', // green
        '#ffa502', // amber
        '#7c3aed', // purple
        '#ff6b9d', // pink
        '#00d4ff', // cyan
        '#a8e063', // lime
        '#ff7f50', // coral
        '#5352ed'  // indigo
    ],

    init(canvasId, kategorije, getCategoryTotal, formatCurrency) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destroy existing chart if any
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        const data = this.prepareData(kategorije, getCategoryTotal);

        this.chart = new Chart(ctx, {
            type: 'doughnut', // Changed to doughnut for cockpit style
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%', // Doughnut hole
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 8,
                            usePointStyle: true,
                            pointStyle: 'rect',
                            font: {
                                family: "'SF Mono', 'Fira Code', Consolas, monospace",
                                size: 10
                            },
                            color: '#a0a0b0',
                            boxWidth: 8,
                            boxHeight: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1e32',
                        titleColor: '#e8e8e8',
                        bodyColor: '#a0a0b0',
                        borderColor: '#2a2a45',
                        borderWidth: 1,
                        padding: 8,
                        titleFont: {
                            family: "'SF Mono', Consolas, monospace",
                            size: 11
                        },
                        bodyFont: {
                            family: "'SF Mono', Consolas, monospace",
                            size: 10
                        },
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return ` ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 1,
                        borderColor: '#1a1a2e'
                    }
                }
            }
        });

        return this.chart;
    },

    prepareData(kategorije, getCategoryTotal) {
        const labels = [];
        const data = [];

        for (const kat of kategorije) {
            const total = getCategoryTotal(kat);
            if (total > 0) {
                labels.push(`${kat.emoji} ${kat.naziv}`);
                data.push(total);
            }
        }

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: this.colors.slice(0, data.length),
                borderWidth: 1,
                borderColor: '#1a1a2e',
                hoverOffset: 2,
                hoverBorderColor: '#4a9eff',
                hoverBorderWidth: 2
            }]
        };
    },

    update(kategorije, getCategoryTotal) {
        if (!this.chart) return;

        const data = this.prepareData(kategorije, getCategoryTotal);
        this.chart.data = data;
        this.chart.update();
    },

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
};

// Export for use in app.js
window.ChartManager = ChartManager;
