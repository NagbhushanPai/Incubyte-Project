"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importStar(require("../src/app"));
let token;
beforeAll(async () => {
    await app_1.prisma.$connect();
    // create a user and login
    const email = `test+${Date.now()}@example.com`;
    await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ email, password: 'pass123' });
    const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({ email, password: 'pass123' });
    token = res.body.token;
});
afterAll(async () => {
    await app_1.prisma.sweet.deleteMany();
    await app_1.prisma.user.deleteMany();
    await app_1.prisma.$disconnect();
});
describe('Sweets', () => {
    test('create, list, purchase', async () => {
        const create = await (0, supertest_1.default)(app_1.default).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Test', category: 'Gummy', price: 1.5, quantity: 5 });
        expect(create.status).toBe(201);
        const list = await (0, supertest_1.default)(app_1.default).get('/api/sweets').set('Authorization', `Bearer ${token}`);
        expect(list.status).toBe(200);
        expect(Array.isArray(list.body)).toBe(true);
        const id = create.body.id;
        const purchase = await (0, supertest_1.default)(app_1.default).post(`/api/sweets/${id}/purchase`).set('Authorization', `Bearer ${token}`).send({ quantity: 2 });
        expect(purchase.status).toBe(200);
        expect(purchase.body.quantity).toBe(3);
    });
});
