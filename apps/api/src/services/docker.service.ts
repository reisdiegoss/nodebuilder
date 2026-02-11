import Docker from 'dockerode';
import * as tar from 'tar';
// @ts-ignore
import { Readable } from 'stream';

export class DockerService {
    private docker: Docker;
    private readonly NETWORK_NAME = 'network_public';

    constructor() {
        const isWindows = process.platform === 'win32';
        this.docker = new Docker(isWindows ? { socketPath: '//./pipe/docker_engine' } : { socketPath: '/var/run/docker.sock' });
    }

    async testConnection() {
        try {
            const info = await this.docker.info();
            const isSwarmEnabled = info.Swarm && info.Swarm.LocalNodeState === 'active';
            return { ok: true, serverVersion: info.ServerVersion, swarmActive: isSwarmEnabled };
        } catch (error) {
            return { ok: false, error: 'Could not connect to Docker Engine' };
        }
    }

    /**
     * Sincroniza arquivos com um container ativo (Hot Update)
     */
    async syncFiles(containerId: string, files: { path: string, content: string }[]) {
        try {
            const container = this.docker.getContainer(containerId);

            // Usando tar.Pack (API de baixo nível para fluxos customizados)
            const pack = new tar.Pack();

            for (const file of files) {
                const entry = new tar.ReadEntry({
                    path: file.path,
                    size: Buffer.byteLength(file.content),
                    type: 'File',
                } as any);
                pack.add(entry);
                entry.end(file.content);
            }
            pack.end();

            await container.putArchive(pack as any, { path: '/app' });
            return { ok: true };
        } catch (error) {
            console.error('Erro ao sincronizar arquivos:', error);
            return { ok: false, error };
        }
    }

    async createSwarmService(projectName: string, tenantId: string) {
        try {
            const serviceName = `nb-svc-${tenantId}-${projectName}`.toLowerCase();
            const port = await this.getNextAvailablePort();

            const service = await this.docker.createService({
                Name: serviceName,
                TaskTemplate: {
                    ContainerSpec: {
                        Image: 'node:20-alpine',
                        Command: ['sh', '-c', 'cd /app && npm install -g tsx && tsx --watch src/index.ts'],
                        Env: [`TENANT_ID=${tenantId}`, `PROJECT_NAME=${projectName}`],
                        Dir: '/app'
                    },
                    Networks: [{ Target: this.NETWORK_NAME }],
                    Resources: { Limits: { MemoryBytes: 256 * 1024 * 1024 } }
                },
                Mode: { Replicated: { Replicas: 1 } },
                EndpointSpec: {
                    Ports: [{ Protocol: 'tcp', PublishedPort: port, TargetPort: 3000 }]
                }
            });

            return { id: service.id, name: serviceName, port };
        } catch (error) {
            console.error('Erro ao criar serviço Swarm:', error);
            throw error;
        }
    }

    private async getNextAvailablePort(): Promise<number> {
        return Math.floor(Math.random() * (10001)) + 30000;
    }

    async removeSwarmService(serviceIdOrName: string) {
        try {
            await this.docker.getService(serviceIdOrName).remove();
            return { ok: true };
        } catch (error) {
            return { ok: false, error };
        }
    }

    async listSwarmServices() {
        try {
            const services = await this.docker.listServices();
            return services.filter(s => s.Spec?.Name?.startsWith('nb-svc-'));
        } catch (error) {
            return [];
        }
    }
}

export const dockerService = new DockerService();
