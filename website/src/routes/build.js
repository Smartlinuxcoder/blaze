import { writeFile, unlink, readFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { json } from '@solidjs/router';

const execAsync = promisify(exec);

export async function POST({ request }) {
    try {
        console.log("gyattermaxxer, hello!");
        const { file, content } = await request.json();

        const sanitizedBaseName = path.basename(file).split('.').slice(0, -1).join('.');
        const randomName = randomBytes(4).toString('hex');
        const filename = path.join('uploads', `${sanitizedBaseName}${randomName}.blz`);
        const binaryPath = path.join('uploads', `${sanitizedBaseName}${randomName}`);

        console.log("writing");
        await writeFile(filename, content, { signal: AbortSignal.timeout(5000) });

        console.log("building");
        await execAsync(`./blaze build ${filename}`, { timeout: 10000 });

        console.log("reading");
        const fileContent = await readFile(binaryPath);

        console.log("removing");
         await Promise.all([
            unlink(filename).catch(console.error),
            unlink(binaryPath).catch(console.error)
        ]); 

        console.log("done");
        return json({
            content: fileContent,
            type: 'application/octet-stream',
            name: path.basename(binaryPath)
        });

    } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to build or read file', { status: 500 });
    }
}