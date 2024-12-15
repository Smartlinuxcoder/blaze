import { writeFile, unlink, readFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { json } from '@solidjs/router';

const execAsync = promisify(exec);

export async function POST({ request }) {
    const filesToCleanup = [];
    try {
        const { file, content } = await request.json();

        const sanitizedBaseName = path.basename(file).split('.').slice(0, -1).join('.');
        const randomName = randomBytes(4).toString('hex');
        const filename = path.join('uploads', `${sanitizedBaseName}${randomName}.blz`);
        const binaryPath = path.join('uploads', `${sanitizedBaseName}${randomName}`);


        filesToCleanup.push(filename, binaryPath);

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

                runner.on('close', async (code) => {
                    controller.close();
                    // Cleanup files after the process is done
                    await Promise.all(filesToCleanup.map(async (file) => {
                        try {
                            await unlink(file);
                        } catch (err) {
                            console.error(`Failed to delete file ${file}:`, err);
                        }
                    }));
                });

                runner.on('error', (err) => {
                    controller.error(err);
                });
            },
            cancel() {
                // Cleanup on cancelled stream
                runner.kill();
                Promise.all(filesToCleanup.map(async (file) => {
                    try {
                        await unlink(file);
                    } catch (err) {
                        console.error(`Failed to delete file ${file}:`, err);
                    }
                }));
            }
        }), {
            headers: { 'Content-Type': 'application/octet-stream' }
        });

    } catch (error) {
        // Cleanup on error
        await Promise.all(filesToCleanup.map(async (file) => {
            try {
                await unlink(file);
            } catch (err) {
                console.error(`Failed to delete file ${file}:`, err);
            }
        }));
        return new Response('Failed to build or run file', { status: 500 });
    }
}