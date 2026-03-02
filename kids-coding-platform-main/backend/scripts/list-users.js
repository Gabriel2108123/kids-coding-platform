const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            displayName: true
        }
    });
    console.log('--- USER LIST ---');
    users.forEach(u => {
        console.log(`${u.role}: ${u.email || u.username} (${u.displayName}) [ID: ${u.id}]`);
    });
    console.log('--- END ---');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
