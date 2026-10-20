const dashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    /**
     * Lấy các chỉ số tổng quan (Stat cards)
     */
    async getOverview(req, res) {
        const stats = await dashboardService.getOverviewStats();
        return new OK({
            message: 'Lấy chỉ số tổng quan thành công!',
            metadata: stats,
        }).send(res);
    }

    /**
     * Lấy dữ liệu các biểu đồ phân tích
     */
    async getCharts(req, res) {
        const { timeRange } = req.query;
        const charts = await dashboardService.getChartsData({ timeRange });
        return new OK({
            message: 'Lấy dữ liệu biểu đồ thành công!',
            metadata: charts,
        }).send(res);
    }

    /**
     * Lấy dữ liệu báo cáo đa Sheet để xuất Excel
     */
    async getExportData(req, res) {
        const exportData = await dashboardService.getExportData();
        return new OK({
            message: 'Lấy dữ liệu xuất báo cáo thành công!',
            metadata: exportData,
        }).send(res);
    }
}

module.exports = new DashboardController();
