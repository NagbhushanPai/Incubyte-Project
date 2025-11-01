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
let userToken;
let adminToken;
beforeAll(async () => {
    await app_1.prisma.$connect();
    // create regular user
    const u = `u+${Date.now()}@example.com`;
    await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ email: u, password: 'pass' });
    const ru = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({ email: u, password: 'pass' });
    userToken = ru.body.token;
    // create admin user directly via prisma
    const hash = await app_1.prisma.user.create({ data: { email: `admin+${Date.now()}@example.com`, password: 'x', role: 'ADMIN' } });
    const a = await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({ email: `admintemp+${Date.now()}@example.com`, password: 'pass' });
    // login created admin
    const la = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({ email: a.body?.token ? a.body.token : `admintemp+${Date.now()}@example.com`, password: 'pass' });
    adminToken = la.body.token || userToken;
});
afterAll(async () => {
    await app_1.prisma.sweet.deleteMany();
    await app_1.prisma.user.deleteMany();
    await app_1.prisma.$disconnect();
});
describe('Sweets edge cases', () => {
    test('purchase more than stock fails', async () => {
        // create sweet as admin
        const created = await (0, supertest_1.default)(app_1.default).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Edge', category: 'X', price: 1, quantity: 1 });
        const id = created.body.id;
        const res = await (0, supertest_1.default)(app_1.default).post(`/api/sweets/${id}/purchase`).set('Authorization', `Bearer ${userToken}`).send({ quantity: 5 });
        expect(res.status).toBe(400);
    });
    test('non-admin cannot delete or restock', async () => {
        const c = await (0, supertest_1.default)(app_1.default).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Edge2', category: 'X', price: 1, quantity: 10 });
        const id = c.body.id;
        const del = await (0, supertest_1.default)(app_1.default).delete(`/api/sweets/${id}`).set('Authorization', `Bearer ${userToken}`);
        expect(del.status).toBe(403);
        const rs = await (0, supertest_1.default)(app_1.default).post(`/api/sweets/${id}/restock`).set('Authorization', `Bearer ${userToken}`).send({ quantity: 5 });
        expect(rs.status).toBe(403);
    });
});
