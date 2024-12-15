import { writeFile, unlink, readFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { json } from '@solidjs/router';

const execAsync = promisify(exec);

export async function POST({ request }) {
    try {
        const { file, content } = await request.json();

        const sanitizedBaseName = path.basename(file).split('.').slice(0, -1).join('.');
        const randomName = randomBytes(4).toString('hex');
        const filename = path.join('uploads', `${sanitizedBaseName}${randomName}.blz`);
        const binaryPath = path.join('uploads', `${sanitizedBaseName}${randomName}`);

        await writeFile(filename, content, { signal: AbortSignal.timeout(5000) });

        await execAsync(`./blaze build ${filename}`, { timeout: 10000 });

        const runner = spawn(binaryPath);

        return new Response(new ReadableStream({
            start(controller) {
                runner.stdout.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });

                runner.stderr.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });

                runner.on('close', (code) => {
                    controller.close();
                    
                });

                runner.on('error', (err) => {
                    controller.error(err);
                });
            }
        }), {
            headers: { 'Content-Type': 'application/octet-stream' }
        });

    } catch (error) {
        return new Response('Failed to build or run file', { status: 500 });
    }
}