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

    async ensureNetwork(name: string) {
        try {
            const nets = await this.docker.listNetworks();
            if (!nets.find(n => n.Name === name)) {
                await this.docker.createNetwork({ Name: name, Driver: 'overlay', Attachable: true });
            }
        } catch (e) { }
    }

    async ensureVolume(name: string) {
        try {
            await this.docker.createVolume({ Name: name });
        } catch (e) { }
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
    async syncFiles(volumeName: string, files: { path: string, content: string }[]) {
        try {
            // Helper Container para injetar arquivos no Volume ANTES do boot do serviço
            const helper = await this.docker.createContainer({
                Image: 'busybox',
                Cmd: ['sh', '-c', 'sleep 3600'],
                HostConfig: { Binds: [`${volumeName}:/data`] }
            });

            await helper.start();

            const pack = new tar.Pack();
            for (const file of files) {
                const entry = new (tar as any).ReadEntry({
                    path: file.path,
                    size: Buffer.byteLength(file.content),
                });
                pack.add(entry);
                entry.end(file.content);
            }
            pack.end();

            await helper.putArchive(pack as any, { path: '/data' });
            await helper.stop();
            await helper.remove();

            return { ok: true };
        } catch (error) {
            console.error('Erro ao sincronizar arquivos no volume:', error);
            return { ok: false, error };
        }
    }

    async createSwarmService(projectName: string, tenantId: string, dbType: string = 'sqlite', hostPath?: string) {
        try {
            const cleanProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const shortTenantId = tenantId.split('-')[0];
            const baseId = `nbs-${shortTenantId}-${cleanProjectName}`;

            const serviceName = baseId.substring(0, 63);
            const networkName = `net-${baseId}`.substring(0, 63);
            const port = await this.getNextAvailablePort();

            await this.ensureNetwork(networkName);

            // Provisionar Banco de Dados se necessário
            let dbUrl = '';
            if (dbType !== 'sqlite') {
                await this.provisionDatabase(dbType, baseId, networkName);
                dbUrl = dbType === 'mysql'
                    ? `mysql://root:nb-secret@db-${baseId}:3306/${cleanProjectName}`
                    : `postgresql://postgres:nb-secret@db-${baseId}:5432/${cleanProjectName}?schema=public`;
            } else {
                dbUrl = `file:./dev.db`;
            }

            const mounts: any[] = [];
            if (hostPath) {
                mounts.push({
                    Type: 'bind',
                    Source: hostPath,
                    Target: '/app',
                });
            } else {
                // Fallback para volume se não houver hostPath (não recomendado no modo industrial v2)
                const volumeName = `vol-${baseId}`.substring(0, 63);
                await this.ensureVolume(volumeName);
                mounts.push({ Type: 'volume', Source: volumeName, Target: '/app' });
            }

            const service = await this.docker.createService({
                Name: serviceName,
                TaskTemplate: {
                    ContainerSpec: {
                        Image: 'node:20-alpine',
                        Command: ['sh', '-c', 'apk add --no-cache openssl libc6-compat && cd /app && npm install && npx prisma generate && npx prisma migrate deploy && npx tsx --watch src/index.ts'],
                        Env: [
                            `TENANT_ID=${tenantId}`,
                            `PROJECT_NAME=${projectName}`,
                            `DATABASE_URL=${dbUrl}`
                        ],
                        Dir: '/app',
                        Mounts: mounts
                    },
                    Networks: [{ Target: networkName }],
                    Resources: { Limits: { MemoryBytes: 512 * 1024 * 1024 } }
                },
                Mode: { Replicated: { Replicas: 1 } },
                EndpointSpec: {
                    Ports: [{ Protocol: 'tcp', PublishedPort: port, TargetPort: 3000 }]
                }
            });

            return { id: service.id, name: serviceName, port, networkName };
        } catch (error) {
            console.error('Erro ao criar serviço Swarm:', error);
            throw error;
        }
    }

    private async provisionDatabase(type: string, baseId: string, networkName: string) {
        const dbServiceName = `db-${baseId}`.substring(0, 63);
        const image = type === 'mysql' ? 'mysql:8.0' : 'postgres:15-alpine';
        const env = type === 'mysql'
            ? ['MYSQL_ROOT_PASSWORD=nb-secret', 'MYSQL_DATABASE=' + baseId.split('-').pop()]
            : ['POSTGRES_PASSWORD=nb-secret', 'POSTGRES_DB=' + baseId.split('-').pop()];

        try {
            await this.docker.createService({
                Name: dbServiceName,
                TaskTemplate: {
                    ContainerSpec: {
                        Image: image,
                        Env: env,
                    },
                    Networks: [{ Target: networkName }]
                }
            });
        } catch (e) { }
    }

    public async getNextAvailablePort(): Promise<number> {
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
