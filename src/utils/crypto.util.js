import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);
export function generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}
export async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }
    catch (error) {
        throw new Error(`Error hashing password: ${error instanceof Error ? error.message : error}`);
    }
}
export async function verifyPassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (error) {
        throw new Error(`Error verifying password: ${error instanceof Error ? error.message : error}`);
    }
}
//# sourceMappingURL=crypto.util.js.map