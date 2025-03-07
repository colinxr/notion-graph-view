"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongodb_module_1 = require("./shared/infrastructure/persistence/mongodb/mongodb.module");
const redis_module_1 = require("./shared/infrastructure/caching/redis/redis.module");
const logger_service_1 = require("./shared/infrastructure/logging/logger.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongodb_module_1.MongoDBModule,
            redis_module_1.RedisModule,
        ],
        providers: [
            logger_service_1.LoggerService,
        ],
        exports: [
            logger_service_1.LoggerService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map