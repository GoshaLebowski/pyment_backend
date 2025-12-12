import { Injectable, NotFoundException } from '@nestjs/common'



import { PrismaService } from '../../infra/prisma/prisma.service';



















@Injectable()
export class PlanService {
    public constructor(private readonly prismaService: PrismaService) {}

    public async getAll() {
        return this.prismaService.plan.findMany({
            orderBy: {
                monthlyPrice: 'asc'
            },
            select: {
                id: true,
                title: true,
                description: true,
                features: true,
                monthlyPrice: true,
                yearlyPrice: true,
                isFeatured: true
            }
        })
    }

    public async getById(id: string) {
        const plan = await this.prismaService.plan.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                title: true,
                description: true,
                features: true,
                monthlyPrice: true,
                yearlyPrice: true,
                isFeatured: true,
            }
        })

        if(!plan) throw new NotFoundException('План не найден')

        return plan
    }
}
