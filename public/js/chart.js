// Troškovnik - Chart.js Pie Chart Logic

const ChartManager = {
    chart: null,
    colors: [
        '#3b82f6', // blue
        '#ef4444', // red
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f97316', // orange
        '#6366f1'  // indigo
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
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: { size: 12 },
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
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
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    },

    update(kategorije, getCategoryTotal) {
        if (!this.chart) return;

        const data = this.prepareData(kategorije, getCategoryTotal);
        this.chart.data = data;
        this.chart.update();
    },

    updateTheme(isDark) {
        if (!this.chart) return;

        const textColor = isDark ? '#e5e7eb' : '#374151';
        this.chart.options.plugins.legend.labels.color = textColor;
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
