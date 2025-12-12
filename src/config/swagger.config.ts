import { DocumentBuilder } from '@nestjs/swagger'
import * as process from 'node:process'

export function getSwaggerConfig() {
    return new DocumentBuilder()
        .setTitle('PAYMENT API')
        .setVersion(process.env.npm_package_version ?? '1.0.0')
        .build()
}
