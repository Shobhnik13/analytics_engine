import { Controller, Get, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // @Get('all')
    // async getAllAnalytics() {

    // }

    @Get('dau')
    async getDauAnalytics(@Query('days') days?: string) {
        const d = days ? parseInt(days, 10) : 30
        return this.analyticsService.dailyAciveUsers(d)
    }

    @Get('mau')
    async getMauAnalytics() { 
        return this.analyticsService.getMonthlyActiveUsesrs()
    }

    @Get('total-users')
    async getTotalUsers() {
        return this.analyticsService.getTotalUsers()
    }

    @Get('total-events')
    async getTotalEvents() {
        return this.analyticsService.getTotalEvents()
    }

    @Get('most-used-feature')
    async getMostUsedFeature() {
        return this.analyticsService.mostUsedFeatures()
    }

    @Get('conversion-funnel')
    async getConversionFunnel() {
        return this.analyticsService.getConversionFunnel()
    }

    @Get('most-active-users')
    async getMostActiveUsers() {
        return this.analyticsService.getMostActiveUsers()
    }
}